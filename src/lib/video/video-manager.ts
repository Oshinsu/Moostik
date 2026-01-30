/**
 * MOOSTIK Video Generation Manager
 * Orchestrates video generation across multiple providers
 * Handles batch processing, fallbacks, and progress tracking
 */

import {
  VideoProvider,
  VideoProviderConfig,
  VideoGenerationInput,
  VideoGenerationOutput,
  BatchVideoRequest,
  BatchVideoResult,
  BatchVideoProgress,
  ShotVideo,
  ShotVideoRequest,
  AnimationType,
  CameraMotion,
  DEFAULT_PROVIDER_CONFIGS,
} from "./types";
import { VideoProviderBase, createProvider, VideoProviderError } from "./provider-base";
import { createLogger, trackPerformance } from "../logger";
import { config as appConfig } from "../config";

// Import providers to register them
import "./providers/kling";
import "./providers/runway";

const logger = createLogger("VideoManager");

// ============================================
// VIDEO MANAGER
// ============================================

export class VideoManager {
  private providers: Map<VideoProvider, VideoProviderBase> = new Map();
  private defaultProvider: VideoProvider = "kling";
  private fallbackChain: VideoProvider[] = ["kling", "runway", "luma"];

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize available providers based on API keys
   */
  private initializeProviders(): void {
    const providerKeys: Record<VideoProvider, string | undefined> = {
      kling: process.env.KLING_API_KEY,
      runway: process.env.RUNWAY_API_KEY,
      luma: process.env.LUMA_API_KEY,
      pika: process.env.PIKA_API_KEY,
      minimax: process.env.MINIMAX_API_KEY,
      sora: process.env.SORA_API_KEY,
    };

    for (const [provider, apiKey] of Object.entries(providerKeys)) {
      if (apiKey) {
        try {
          const config: VideoProviderConfig = {
            provider: provider as VideoProvider,
            apiKey,
            ...DEFAULT_PROVIDER_CONFIGS[provider as VideoProvider],
          } as VideoProviderConfig;

          this.providers.set(provider as VideoProvider, createProvider(config));
          logger.info(`Initialized video provider: ${provider}`);
        } catch (error) {
          logger.warn(`Failed to initialize provider ${provider}:`, error);
        }
      }
    }

    if (this.providers.size === 0) {
      logger.warn("No video providers configured. Set API keys in environment.");
    }

    // Set default provider to first available
    for (const provider of this.fallbackChain) {
      if (this.providers.has(provider)) {
        this.defaultProvider = provider;
        break;
      }
    }
  }

  /**
   * Generate single video with automatic provider selection
   */
  async generateVideo(
    input: VideoGenerationInput,
    options: {
      preferredProvider?: VideoProvider;
      enableFallback?: boolean;
      onProgress?: (output: VideoGenerationOutput) => void;
    } = {}
  ): Promise<VideoGenerationOutput> {
    const {
      preferredProvider,
      enableFallback = true,
      onProgress,
    } = options;

    const perf = trackPerformance("generateVideo");

    // Select provider
    const providersToTry = this.selectProviders(input, preferredProvider, enableFallback);

    if (providersToTry.length === 0) {
      throw new VideoProviderError(
        "kling",
        "NO_PROVIDER",
        "No video providers available or configured"
      );
    }

    let lastError: VideoProviderError | null = null;

    for (const providerName of providersToTry) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      try {
        logger.info(`Attempting video generation with ${providerName}`);

        // Start generation
        const job = await provider.generateWithRetry(input);

        // Wait for completion
        const result = await provider.waitForCompletion(job.id, {
          onProgress,
          timeoutMs: provider["config"].timeoutMs,
        });

        perf.end();
        logger.info(`Video generation completed with ${providerName}`, {
          jobId: job.id,
          duration: perf,
        });

        return result;

      } catch (error) {
        lastError = error instanceof VideoProviderError
          ? error
          : new VideoProviderError(providerName, "UNKNOWN", String(error));

        logger.warn(`Provider ${providerName} failed, trying next...`, {
          error: lastError.message,
        });

        if (!enableFallback) break;
      }
    }

    perf.end();
    throw lastError || new VideoProviderError(
      this.defaultProvider,
      "ALL_PROVIDERS_FAILED",
      "All video providers failed"
    );
  }

  /**
   * Generate videos for multiple shots in batch
   */
  async generateBatch(request: BatchVideoRequest): Promise<BatchVideoResult> {
    const {
      shots,
      episodeId,
      parallelLimit = 2,
      onProgress,
    } = request;

    const perf = trackPerformance("generateBatch");
    logger.info(`Starting batch video generation`, {
      episodeId,
      shotCount: shots.length,
    });

    const results: ShotVideo[] = [];
    const queue = [...shots];
    let completed = 0;
    let failed = 0;
    const inProgressJobs: Map<string, Promise<ShotVideo | null>> = new Map();

    const reportProgress = () => {
      if (onProgress) {
        onProgress({
          total: shots.length,
          completed,
          failed,
          inProgress: inProgressJobs.size,
          currentShot: queue[0]?.shotId,
        });
      }
    };

    // Process queue with parallelism
    while (queue.length > 0 || inProgressJobs.size > 0) {
      // Start new jobs up to parallel limit
      while (queue.length > 0 && inProgressJobs.size < parallelLimit) {
        const shot = queue.shift()!;
        const jobPromise = this.processShotVideo(shot, episodeId);

        inProgressJobs.set(shot.shotId, jobPromise);

        jobPromise.then((result) => {
          inProgressJobs.delete(shot.shotId);
          if (result) {
            results.push(result);
            completed++;
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
        totalCreditsUsed: 0, // TODO: Track credits
        processingTimeMs: 0, // TODO: Calculate from perf
      },
    };
  }

  /**
   * Process single shot video generation
   */
  private async processShotVideo(
    request: ShotVideoRequest,
    episodeId: string
  ): Promise<ShotVideo | null> {
    try {
      const input = this.buildVideoInput(request);

      const output = await this.generateVideo(input, {
        enableFallback: true,
      });

      // Download video locally
      const localPath = await this.downloadToLocal(
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
        lipSyncRequired: false, // Set externally if dialogue present
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
      resolution: "1080p",
      quality: "high",
      cameraMotion: request.cameraMotion,
      motionIntensity: this.getMotionIntensity(request.animationType),
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
    };
    return intensityMap[animationType];
  }

  /**
   * Select providers based on input requirements and availability
   */
  private selectProviders(
    input: VideoGenerationInput,
    preferred?: VideoProvider,
    enableFallback = true
  ): VideoProvider[] {
    const candidates: VideoProvider[] = [];

    // Add preferred if specified and available
    if (preferred && this.providers.has(preferred)) {
      const provider = this.providers.get(preferred)!;
      if (this.canProviderHandle(provider, input)) {
        candidates.push(preferred);
      }
    }

    // Add fallback chain
    if (enableFallback) {
      for (const providerName of this.fallbackChain) {
        if (candidates.includes(providerName)) continue;
        if (!this.providers.has(providerName)) continue;

        const provider = this.providers.get(providerName)!;
        if (this.canProviderHandle(provider, input)) {
          candidates.push(providerName);
        }
      }
    }

    return candidates;
  }

  /**
   * Check if provider can handle the input
   */
  private canProviderHandle(provider: VideoProviderBase, input: VideoGenerationInput): boolean {
    const config = provider["config"] as VideoProviderConfig;
    const caps = config.capabilities;

    // Check duration
    if (input.durationSeconds > caps.maxDurationSeconds) {
      return false;
    }

    // Check aspect ratio
    if (!caps.supportedAspectRatios.includes(input.aspectRatio)) {
      return false;
    }

    // Check source type
    if (input.sourceType === "image" && !caps.supportsImageToVideo) {
      return false;
    }
    if (input.sourceType === "video" && !caps.supportsVideoToVideo) {
      return false;
    }

    // Check motion brush
    if (input.motionBrush && !caps.supportsMotionBrush) {
      return false;
    }

    return true;
  }

  /**
   * Download video to local storage
   */
  private async downloadToLocal(
    output: VideoGenerationOutput,
    episodeId: string,
    shotId: string,
    variationId: string
  ): Promise<string> {
    if (!output.videoUrl) {
      throw new Error("No video URL to download");
    }

    const path = await import("path");
    const localPath = path.join(
      appConfig.paths.output,
      "videos",
      episodeId,
      shotId,
      `${variationId}.mp4`
    );

    const provider = this.providers.get(output.provider);
    if (provider) {
      return provider.download(output.id, localPath);
    }

    // Fallback: direct download
    const response = await fetch(output.videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`);
    }

    const fs = await import("fs/promises");
    const buffer = await response.arrayBuffer();
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, Buffer.from(buffer));

    return localPath;
  }

  // ============================================
  // PUBLIC UTILITIES
  // ============================================

  /**
   * Get available providers
   */
  getAvailableProviders(): VideoProvider[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if any provider is available
   */
  isAvailable(): boolean {
    return this.providers.size > 0;
  }

  /**
   * Get provider capabilities
   */
  getProviderCapabilities(provider: VideoProvider) {
    const p = this.providers.get(provider);
    if (!p) return null;
    return (p as unknown as { config: VideoProviderConfig }).config.capabilities;
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
    };
    return suggestions[animationType];
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

// Utility
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// EXPORTS
// ============================================

export { VideoProviderBase, VideoProviderError } from "./provider-base";
export * from "./types";
