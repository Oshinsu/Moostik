/**
 * MOOSTIK Video Generation Manager
 * Orchestrates video generation across multiple Replicate I2V models
 * Updated for SOTA providers - January 2026
 */

import {
  VideoProvider,
  VideoGenerationInput,
  VideoGenerationOutput,
  BatchVideoRequest,
  BatchVideoResult,
  BatchVideoProgress,
  ShotVideo,
  ShotVideoRequest,
  AnimationType,
  CameraMotion,
  VideoResolution,
  PROVIDER_CONFIGS,
  REPLICATE_MODELS,
  MOOSTIK_ANIMATION_PROVIDERS,
  MOOSTIK_BUDGET_TIERS,
  MOOSTIK_SCENE_PROVIDERS,
  getOptimalProvider,
  calculateEpisodeCost,
  getProviderFallbackChain,
} from "./types";
import {
  generateVideo,
  generateVideoAndWait,
  generateVideoWithRetry,
  checkVideoStatus,
  cancelVideo,
  downloadVideo,
  ReplicateVideoError,
} from "./providers/replicate";
import { createLogger, trackPerformance } from "../logger";
import { config as appConfig } from "../config";

const logger = createLogger("VideoManager");

// ============================================
// VIDEO MANAGER
// ============================================

export class VideoManager {
  private defaultProvider: VideoProvider = "wan-2.5";
  private budgetTier: keyof typeof MOOSTIK_BUDGET_TIERS = "draft";

  constructor(options?: { defaultProvider?: VideoProvider; budgetTier?: keyof typeof MOOSTIK_BUDGET_TIERS }) {
    if (options?.defaultProvider) {
      this.defaultProvider = options.defaultProvider;
    }
    if (options?.budgetTier) {
      this.budgetTier = options.budgetTier;
    }
  }

  /**
   * Generate single video with automatic provider selection
   */
  async generateVideo(
    input: VideoGenerationInput,
    options: {
      preferredProvider?: VideoProvider;
      fallbackProviders?: VideoProvider[];
      animationType?: AnimationType;
      sceneType?: string;
      onProgress?: (output: VideoGenerationOutput) => void;
    } = {}
  ): Promise<VideoGenerationOutput> {
    const perf = trackPerformance("generateVideo");

    // Select provider
    const provider = this.selectProvider(input, options);

    logger.info(`Starting video generation`, {
      provider,
      model: REPLICATE_MODELS[provider],
      duration: input.durationSeconds,
      resolution: input.resolution,
    });

    try {
      const result = await generateVideoWithRetry(input, provider, {
        onProgress: options.onProgress,
      });

      // Calculate cost
      const config = PROVIDER_CONFIGS[provider];
      result.costUsd = config.pricing.costPerSecond * (result.durationSeconds || input.durationSeconds);

      perf.end();
      logger.info(`Video generation completed`, {
        provider,
        cost: result.costUsd,
        processingMs: result.actualProcessingMs,
      });

      return result;

    } catch (error) {
      perf.end();

      // Try fallback providers
      const fallbacks = options.fallbackProviders || this.getFallbackChain(provider, input);
      for (const fallbackProvider of fallbacks) {
        if (fallbackProvider === provider) continue;

        logger.warn(`Provider ${provider} failed, trying fallback: ${fallbackProvider}`);
        try {
          const result = await generateVideoWithRetry(input, fallbackProvider, {
            onProgress: options.onProgress,
          });
          return result;
        } catch (fallbackError) {
          logger.warn(`Fallback provider ${fallbackProvider} also failed`);
        }
      }

      throw error;
    }
  }

  /**
   * Generate videos for multiple shots in batch
   */
  async generateBatch(request: BatchVideoRequest): Promise<BatchVideoResult> {
    const {
      shots,
      episodeId,
      parallelLimit = 2,
      preferredProvider,
      fallbackProviders,
      budgetMaxUsd,
      onProgress,
    } = request;

    const perf = trackPerformance("generateBatch");
    logger.info(`Starting batch video generation`, {
      episodeId,
      shotCount: shots.length,
      parallelLimit,
    });

    const results: ShotVideo[] = [];
    const queue = [...shots];
    let completed = 0;
    let failed = 0;
    let totalCost = 0;
    const providersUsed = new Set<VideoProvider>();
    const inProgressJobs: Map<string, Promise<ShotVideo | null>> = new Map();

    const reportProgress = () => {
      if (onProgress) {
        onProgress({
          total: shots.length,
          completed,
          failed,
          inProgress: inProgressJobs.size,
          currentShot: queue[0]?.shotId,
          totalCostUsd: totalCost,
        });
      }
    };

    // Check budget
    const estimateBatchCost = () => {
      const provider = preferredProvider || this.defaultProvider;
      const config = PROVIDER_CONFIGS[provider];
      return shots.reduce((sum, s) => sum + config.pricing.costPerSecond * s.durationSeconds, 0);
    };

    if (budgetMaxUsd) {
      const estimatedCost = estimateBatchCost();
      if (estimatedCost > budgetMaxUsd) {
        logger.warn(`Estimated cost $${estimatedCost.toFixed(2)} exceeds budget $${budgetMaxUsd}`);
      }
    }

    // Process queue with parallelism
    while (queue.length > 0 || inProgressJobs.size > 0) {
      // Start new jobs up to parallel limit
      while (queue.length > 0 && inProgressJobs.size < parallelLimit) {
        // Check budget
        if (budgetMaxUsd && totalCost >= budgetMaxUsd) {
          logger.warn(`Budget exhausted, stopping batch generation`);
          queue.length = 0;
          break;
        }

        const shot = queue.shift()!;
        const jobPromise = this.processShotVideo(
          shot,
          episodeId,
          preferredProvider,
          fallbackProviders
        );

        inProgressJobs.set(shot.shotId, jobPromise);

        jobPromise.then((result) => {
          inProgressJobs.delete(shot.shotId);
          if (result) {
            results.push(result);
            completed++;
            totalCost += result.output?.costUsd || 0;
            if (result.provider) providersUsed.add(result.provider);
          } else {
            failed++;
          }
          reportProgress();
        });
      }

      reportProgress();

      // Wait for at least one job to complete
      if (inProgressJobs.size > 0) {
        await Promise.race(inProgressJobs.values());
      }

      // Small delay to prevent tight loop
      await sleep(100);
    }

    perf.end();

    const totalDuration = results.reduce(
      (sum, v) => sum + (v.output?.durationSeconds || 0),
      0
    );

    return {
      episodeId,
      videos: results,
      stats: {
        total: shots.length,
        completed,
        failed,
        totalDurationSeconds: totalDuration,
        totalCostUsd: totalCost,
        processingTimeMs: 0,
        providersUsed: Array.from(providersUsed),
      },
    };
  }

  /**
   * Process single shot video generation
   */
  private async processShotVideo(
    request: ShotVideoRequest,
    episodeId: string,
    preferredProvider?: VideoProvider,
    fallbackProviders?: VideoProvider[]
  ): Promise<ShotVideo | null> {
    try {
      const input = this.buildVideoInput(request);

      const output = await this.generateVideo(input, {
        preferredProvider: request.preferredProvider || preferredProvider,
        fallbackProviders,
        animationType: request.animationType,
      });

      // Download video locally
      const localPath = await downloadVideo(
        output,
        episodeId,
        request.shotId,
        request.variationId
      );

      const shotVideo: ShotVideo = {
        id: `${request.shotId}-${request.variationId}-video`,
        shotId: request.shotId,
        variationId: request.variationId,
        provider: output.provider,
        input,
        output: {
          ...output,
          localPath,
        },
        animationType: request.animationType,
        cameraWork: request.cameraMotion || { type: "static", intensity: "subtle" },
        lipSyncRequired: request.requiresLipSync || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return shotVideo;

    } catch (error) {
      logger.error(`Failed to generate video for shot ${request.shotId}`, error);
      return null;
    }
  }

  /**
   * Build VideoGenerationInput from ShotVideoRequest
   */
  private buildVideoInput(request: ShotVideoRequest): VideoGenerationInput {
    return {
      sourceType: "image",
      sourceImage: request.sourceImageUrl,
      prompt: this.enhancePromptForVideo(request.prompt, request.animationType),
      durationSeconds: request.durationSeconds,
      aspectRatio: "16:9",
      resolution: this.getResolutionForBudget(),
      quality: this.budgetTier === "high" ? "cinematic" : this.budgetTier === "standard" ? "high" : "standard",
      cameraMotion: request.cameraMotion,
      motionIntensity: this.getMotionIntensity(request.animationType),
      generateAudio: this.budgetTier !== "prototype",
    };
  }

  /**
   * Enhance prompt for video generation based on animation type
   */
  private enhancePromptForVideo(prompt: string, animationType: AnimationType): string {
    const enhancements: Record<AnimationType, string> = {
      subtle: "Subtle atmospheric movement, gentle breathing, slight environmental motion",
      dialogue: "Character speaking with natural lip movements and facial expressions",
      action: "Dynamic movement, energetic motion, fluid action",
      transition: "Smooth transition, gradual change, cinematic flow",
      establishing: "Slow reveal, atmospheric establishing shot, gentle camera movement",
      emotional: "Expressive facial animation, emotional depth, subtle gestures",
      combat: "Fast-paced combat, dynamic fighting movements, impactful strikes",
      death: "Dramatic death scene, final moments, emotional impact",
      flashback: "Dreamy flashback effect, memory sequence, soft edges",
      dance: "Fluid dance movements, rhythmic motion, expressive body language",
      walking: "Natural walking motion, realistic gait, environmental interaction",
      flying: "Graceful flight, wing movement, aerial dynamics",
    };

    return `${prompt}. ${enhancements[animationType]}`;
  }

  /**
   * Get motion intensity based on animation type
   */
  private getMotionIntensity(animationType: AnimationType): number {
    const intensityMap: Record<AnimationType, number> = {
      subtle: 0.2,
      dialogue: 0.3,
      action: 0.8,
      transition: 0.4,
      establishing: 0.3,
      emotional: 0.4,
      combat: 0.9,
      death: 0.5,
      flashback: 0.3,
      dance: 0.8,
      walking: 0.5,
      flying: 0.6,
    };
    return intensityMap[animationType];
  }

  /**
   * Get resolution for current budget tier
   */
  private getResolutionForBudget(): VideoResolution {
    return MOOSTIK_BUDGET_TIERS[this.budgetTier].resolution;
  }

  /**
   * Select optimal provider based on input and options
   */
  private selectProvider(
    input: VideoGenerationInput,
    options: {
      preferredProvider?: VideoProvider;
      animationType?: AnimationType;
      sceneType?: string;
    }
  ): VideoProvider {
    if (options.preferredProvider) {
      return options.preferredProvider;
    }

    if (options.sceneType && MOOSTIK_SCENE_PROVIDERS[options.sceneType]) {
      return MOOSTIK_SCENE_PROVIDERS[options.sceneType];
    }

    if (options.animationType) {
      return getOptimalProvider(options.animationType, this.budgetTier);
    }

    return MOOSTIK_BUDGET_TIERS[this.budgetTier].provider;
  }

  /**
   * Get fallback provider chain
   */
  private getFallbackChain(
    primary: VideoProvider,
    input: VideoGenerationInput
  ): VideoProvider[] {
    const requirements = {
      supportsAudio: input.generateAudio,
      supportsInterpolation: !!input.endImage,
      supportsMotionBrush: !!input.motionBrush,
      supportsMotionTransfer: !!input.motionTransfer,
    };

    const chain = getProviderFallbackChain(requirements);
    return chain.filter((p) => p !== primary);
  }

  // ============================================
  // PUBLIC UTILITIES
  // ============================================

  /**
   * Set budget tier
   */
  setBudgetTier(tier: keyof typeof MOOSTIK_BUDGET_TIERS): void {
    this.budgetTier = tier;
    this.defaultProvider = MOOSTIK_BUDGET_TIERS[tier].provider;
    logger.info(`Budget tier set to ${tier}`, {
      provider: this.defaultProvider,
      estimatedCostPerEpisode: MOOSTIK_BUDGET_TIERS[tier].estimatedCostPerEpisode,
    });
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): VideoProvider[] {
    return Object.keys(PROVIDER_CONFIGS) as VideoProvider[];
  }

  /**
   * Check if Replicate API is configured
   */
  isAvailable(): boolean {
    return !!process.env.REPLICATE_API_TOKEN;
  }

  /**
   * Get provider capabilities
   */
  getProviderCapabilities(provider: VideoProvider) {
    return PROVIDER_CONFIGS[provider]?.capabilities;
  }

  /**
   * Get provider pricing
   */
  getProviderPricing(provider: VideoProvider) {
    return PROVIDER_CONFIGS[provider]?.pricing;
  }

  /**
   * Estimate batch cost
   */
  estimateBatchCost(
    shots: Array<{ durationSeconds: number }>,
    provider?: VideoProvider
  ): number {
    const p = provider || this.defaultProvider;
    return calculateEpisodeCost(shots.length, 5, p);
  }

  /**
   * Suggest optimal camera motion for animation type
   */
  suggestCameraMotion(animationType: AnimationType): CameraMotion {
    const suggestions: Record<AnimationType, CameraMotion> = {
      subtle: { type: "static", intensity: "subtle" },
      dialogue: { type: "static", intensity: "subtle" },
      action: { type: "handheld", intensity: "moderate" },
      transition: { type: "dolly", direction: "in", intensity: "moderate" },
      establishing: { type: "pan", direction: "right", intensity: "subtle" },
      emotional: { type: "zoom", direction: "in", intensity: "subtle" },
      combat: { type: "handheld", intensity: "dramatic" },
      death: { type: "zoom", direction: "in", intensity: "moderate" },
      flashback: { type: "zoom", direction: "out", intensity: "subtle" },
      dance: { type: "tracking", intensity: "moderate" },
      walking: { type: "tracking", intensity: "subtle" },
      flying: { type: "tracking", intensity: "moderate" },
    };
    return suggestions[animationType];
  }

  /**
   * Get budget tier info
   */
  getBudgetTiers() {
    return MOOSTIK_BUDGET_TIERS;
  }

  /**
   * Get current budget tier
   */
  getCurrentBudgetTier() {
    return {
      tier: this.budgetTier,
      ...MOOSTIK_BUDGET_TIERS[this.budgetTier],
    };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let videoManagerInstance: VideoManager | null = null;

export function getVideoManager(): VideoManager {
  if (!videoManagerInstance) {
    videoManagerInstance = new VideoManager();
  }
  return videoManagerInstance;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// RE-EXPORTS
// ============================================

export { ReplicateVideoError } from "./providers/replicate";
export * from "./types";
