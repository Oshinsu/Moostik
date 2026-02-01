/**
 * GENERATION ORCHESTRATOR - Agent IA Decisionnaire
 * ===========================================================================
 * Orchestre la generation complete d'un episode:
 * - Analyse le scenario
 * - Planifie l'ordre de generation
 * - Determine les references
 * - Decide les strategies video
 * - Execute la generation
 * SOTA Janvier 2026
 * ===========================================================================
 */

import type { Episode, Shot } from "@/types/episode";
import { analyzeShot, analyzeEpisode, buildEpisodeContext, recommendProvider } from "@/lib/video/shot-analyzer";
import type { ShotAnalysis, FrameStrategy } from "@/lib/video/shot-analyzer";
import { buildReferenceChains, getGenerationConfig, getParallelBatch } from "@/lib/video/reference-chain";
import type { ReferenceChain, ChainBuildResult } from "@/lib/video/reference-chain";
import { extractLastFrame, storeGeneratedFrames } from "@/lib/video/frame-extractor";
import { createJsonKling, getCameraPresetForScene, getMotionIntensityForScene } from "@/lib/json-kling-standard";
import type { JsonKling } from "@/lib/json-kling-standard";
import { createJsonVeo, getPhysicsPresetForScene, getAudioPresetForScene, getOptimalDuration } from "@/lib/json-veo-standard";
import type { JsonVeo } from "@/lib/json-veo-standard";

// ============================================================================
// TYPES
// ============================================================================

export interface EpisodeAnalysis {
  episodeId: string;
  totalShots: number;
  shotAnalyses: Map<string, ShotAnalysis>;
  chainResult: ChainBuildResult;
  statistics: {
    singleFrameCount: number;
    firstLastFrameCount: number;
    chainingRequired: number;
    estimatedDuration: number;
    estimatedCost: {
      kling: number;
      veo: number;
    };
  };
  recommendations: {
    preferredProvider: "kling" | "veo" | "mixed";
    parallelBatches: string[][];
    warnings: string[];
  };
}

export interface GenerationPlan {
  episodeId: string;
  phases: GenerationPhase[];
  totalShots: number;
  estimatedTime: number;
  dependencies: Map<string, string[]>;
}

export interface GenerationPhase {
  phaseNumber: number;
  type: "image" | "video" | "audio";
  shots: PlannedShot[];
  canParallelize: boolean;
  estimatedDuration: number;
}

export interface PlannedShot {
  shotId: string;
  analysis: ShotAnalysis;
  chain: ReferenceChain;
  videoConfig: {
    provider: "kling" | "veo";
    jsonConfig: JsonKling | JsonVeo;
  };
  order: number;
  dependencies: string[];
}

export interface VideoStrategy {
  provider: "kling" | "veo" | "luma";
  frameStrategy: FrameStrategy;
  duration: number;
  chaining: {
    enabled: boolean;
    sourceShot?: string;
    sourceFrame?: string;
  };
  reasoning: string;
}

export interface GenerationProgress {
  phase: number;
  totalPhases: number;
  currentShot: string;
  completed: string[];
  failed: string[];
  inProgress: string[];
  percentage: number;
}

export interface GenerationResult {
  success: boolean;
  episodeId: string;
  generatedShots: number;
  failedShots: number;
  results: Map<string, {
    success: boolean;
    videoUrl?: string;
    firstFrame?: string;
    lastFrame?: string;
    error?: string;
  }>;
  duration: number;
  cost: number;
}

// ============================================================================
// ORCHESTRATOR CLASS
// ============================================================================

export class GenerationOrchestrator {
  private episode: Episode;
  private analysis: EpisodeAnalysis | null = null;
  private plan: GenerationPlan | null = null;
  private progress: GenerationProgress | null = null;
  
  // Callbacks
  private onProgress?: (progress: GenerationProgress) => void;
  private onShotComplete?: (shotId: string, result: any) => void;
  private onError?: (shotId: string, error: Error) => void;
  
  // External dependencies (injected)
  private resolveCharacterRefs?: (ids: string[]) => Promise<string[]>;
  private resolveLocationRefs?: (ids: string[]) => Promise<string[]>;
  private generateVideo?: (config: JsonKling | JsonVeo) => Promise<{ url: string; duration: number }>;
  
  constructor(episode: Episode) {
    this.episode = episode;
  }
  
  // ========================================================================
  // CONFIGURATION
  // ========================================================================
  
  /**
   * Set callbacks for progress tracking
   */
  setCallbacks(callbacks: {
    onProgress?: (progress: GenerationProgress) => void;
    onShotComplete?: (shotId: string, result: any) => void;
    onError?: (shotId: string, error: Error) => void;
  }): this {
    this.onProgress = callbacks.onProgress;
    this.onShotComplete = callbacks.onShotComplete;
    this.onError = callbacks.onError;
    return this;
  }
  
  /**
   * Inject external dependencies
   */
  setDependencies(deps: {
    resolveCharacterRefs?: (ids: string[]) => Promise<string[]>;
    resolveLocationRefs?: (ids: string[]) => Promise<string[]>;
    generateVideo?: (config: JsonKling | JsonVeo) => Promise<{ url: string; duration: number }>;
  }): this {
    this.resolveCharacterRefs = deps.resolveCharacterRefs;
    this.resolveLocationRefs = deps.resolveLocationRefs;
    this.generateVideo = deps.generateVideo;
    return this;
  }
  
  // ========================================================================
  // ANALYSIS
  // ========================================================================
  
  /**
   * Analyze the entire episode
   */
  async analyzeEpisode(): Promise<EpisodeAnalysis> {
    console.log(`[Orchestrator] Analyzing episode ${this.episode.id}...`);
    
    // Get shot analyses
    const shotAnalyses = analyzeEpisode(this.episode);
    
    // Build reference chains
    const chainResult = await buildReferenceChains(
      this.episode,
      shotAnalyses,
      {
        resolveCharacterRefs: this.resolveCharacterRefs,
        resolveLocationRefs: this.resolveLocationRefs,
        extractLastFrame,
      }
    );
    
    // Calculate statistics
    let singleFrameCount = 0;
    let firstLastFrameCount = 0;
    let chainingRequired = 0;
    
    for (const analysis of shotAnalyses.values()) {
      if (analysis.frameStrategy === "single") singleFrameCount++;
      if (analysis.frameStrategy === "first_last") firstLastFrameCount++;
      if (analysis.requiresChaining) chainingRequired++;
    }
    
    // Estimate costs (rough estimates)
    const klingCostPerSecond = 0.05;
    const veoCostPerSecond = 0.08;
    let klingTotalSeconds = 0;
    let veoTotalSeconds = 0;
    
    for (const analysis of shotAnalyses.values()) {
      const provider = recommendProvider(analysis);
      if (provider === "kling") {
        klingTotalSeconds += analysis.recommendedDuration.kling;
      } else {
        veoTotalSeconds += analysis.recommendedDuration.veo;
      }
    }
    
    // Determine preferred provider
    let preferredProvider: "kling" | "veo" | "mixed" = "mixed";
    const klingRatio = Array.from(shotAnalyses.values())
      .filter(a => recommendProvider(a) === "kling").length / shotAnalyses.size;
    
    if (klingRatio > 0.7) preferredProvider = "kling";
    else if (klingRatio < 0.3) preferredProvider = "veo";
    
    // Calculate parallel batches
    const parallelBatches = this.calculateParallelBatches(chainResult);
    
    this.analysis = {
      episodeId: this.episode.id,
      totalShots: shotAnalyses.size,
      shotAnalyses,
      chainResult,
      statistics: {
        singleFrameCount,
        firstLastFrameCount,
        chainingRequired,
        estimatedDuration: klingTotalSeconds + veoTotalSeconds,
        estimatedCost: {
          kling: klingTotalSeconds * klingCostPerSecond,
          veo: veoTotalSeconds * veoCostPerSecond,
        },
      },
      recommendations: {
        preferredProvider,
        parallelBatches,
        warnings: chainResult.warnings,
      },
    };
    
    console.log(`[Orchestrator] Analysis complete: ${shotAnalyses.size} shots, ${chainingRequired} with chaining`);
    
    return this.analysis;
  }
  
  /**
   * Calculate parallel batches respecting dependencies
   */
  private calculateParallelBatches(chainResult: ChainBuildResult): string[][] {
    const batches: string[][] = [];
    const completed = new Set<string>();
    
    while (completed.size < chainResult.chains.size) {
      const batch = getParallelBatch(chainResult.chains, completed);
      if (batch.length === 0) break;
      
      batches.push(batch);
      batch.forEach(id => completed.add(id));
    }
    
    return batches;
  }
  
  // ========================================================================
  // PLANNING
  // ========================================================================
  
  /**
   * Create generation plan from analysis
   */
  planGeneration(): GenerationPlan {
    if (!this.analysis) {
      throw new Error("Must analyze episode before planning");
    }
    
    console.log(`[Orchestrator] Creating generation plan...`);
    
    const phases: GenerationPhase[] = [];
    const parallelBatches = this.analysis.recommendations.parallelBatches;
    
    for (let i = 0; i < parallelBatches.length; i++) {
      const batchShotIds = parallelBatches[i];
      const shots: PlannedShot[] = [];
      
      for (const shotId of batchShotIds) {
        const analysis = this.analysis.shotAnalyses.get(shotId);
        const chain = this.analysis.chainResult.chains.get(shotId);
        
        if (!analysis || !chain) continue;
        
        const provider = recommendProvider(analysis);
        const videoConfig = this.createVideoConfig(shotId, analysis, chain, provider);
        
        shots.push({
          shotId,
          analysis,
          chain,
          videoConfig: {
            provider,
            jsonConfig: videoConfig,
          },
          order: i,
          dependencies: this.analysis.chainResult.dependencies.get(shotId) || [],
        });
      }
      
      phases.push({
        phaseNumber: i + 1,
        type: "video",
        shots,
        canParallelize: true,
        estimatedDuration: shots.reduce(
          (sum, s) => sum + (s.videoConfig.provider === "kling" 
            ? s.analysis.recommendedDuration.kling 
            : s.analysis.recommendedDuration.veo),
          0
        ),
      });
    }
    
    this.plan = {
      episodeId: this.episode.id,
      phases,
      totalShots: this.analysis.totalShots,
      estimatedTime: phases.reduce((sum, p) => sum + p.estimatedDuration, 0),
      dependencies: this.analysis.chainResult.dependencies,
    };
    
    console.log(`[Orchestrator] Plan created: ${phases.length} phases`);
    
    return this.plan;
  }
  
  /**
   * Create video configuration for a shot
   */
  private createVideoConfig(
    shotId: string,
    analysis: ShotAnalysis,
    chain: ReferenceChain,
    provider: "kling" | "veo"
  ): JsonKling | JsonVeo {
    const shot = this.episode.shots.find(s => s.id === shotId);
    const genConfig = getGenerationConfig(chain);
    
    if (provider === "kling") {
      return createJsonKling({
        shotId,
        project: `MOOSTIK_${this.episode.id.toUpperCase()}`,
        sceneIntent: shot?.description || "",
        sourceType: genConfig.useFirstLastFrame ? "first_last_frame" : "single_frame",
        firstFrame: genConfig.firstFrame,
        lastFrame: genConfig.lastFrame,
        referenceShots: genConfig.referenceImages,
        cameraPreset: getCameraPresetForScene(shot?.sceneType || "default"),
        motionIntensity: getMotionIntensityForScene(
          shot?.sceneType || "default",
          analysis.sceneCharacteristics.hasCharacterMovement
        ),
        duration: analysis.recommendedDuration.kling,
        prompt: this.buildVideoPrompt(shot, analysis),
        mustInclude: [],
        continuityWith: genConfig.continuityWith,
      });
    } else {
      return createJsonVeo({
        shotId,
        project: `MOOSTIK_${this.episode.id.toUpperCase()}`,
        sceneIntent: shot?.description,
        sourceType: genConfig.useFirstLastFrame ? "first_last_frame" : "single_frame",
        firstFrame: genConfig.firstFrame,
        lastFrame: genConfig.lastFrame,
        referenceImages: genConfig.referenceImages,
        physicsPreset: getPhysicsPresetForScene(shot?.sceneType || "default"),
        audioPreset: getAudioPresetForScene(
          shot?.sceneType || "default",
          analysis.sceneCharacteristics.hasDialogue
        ),
        duration: analysis.recommendedDuration.veo,
        prompt: this.buildVideoPrompt(shot, analysis),
        contextualReasoning: this.buildContextualReasoning(shot, analysis),
        continuityWith: genConfig.continuityWith,
      });
    }
  }
  
  /**
   * Build video prompt from shot data
   */
  private buildVideoPrompt(shot: Shot | undefined, analysis: ShotAnalysis): string {
    if (!shot) return "";
    
    const parts: string[] = [];
    
    // Add scene intent
    const prompt = shot.prompt as any;
    if (prompt?.meta?.scene_intent) {
      parts.push(prompt.meta.scene_intent);
    } else if (shot.description) {
      parts.push(shot.description);
    }
    
    // Add motion hints based on analysis
    if (analysis.sceneCharacteristics.hasCharacterMovement) {
      parts.push("Smooth character movement");
    }
    if (analysis.sceneCharacteristics.hasTransformation) {
      parts.push("Gradual transformation");
    }
    if (analysis.sceneCharacteristics.isEstablishing) {
      parts.push("Cinematic establishing shot");
    }
    
    return parts.join(". ") + ".";
  }
  
  /**
   * Build contextual reasoning for Veo 3.1
   */
  private buildContextualReasoning(shot: Shot | undefined, analysis: ShotAnalysis): string {
    if (!shot) return "";
    
    const parts: string[] = [];
    
    parts.push(`Scene type: ${shot.sceneType || "general"}`);
    parts.push(`Motion complexity: ${analysis.motionComplexity}`);
    parts.push(`Frame strategy: ${analysis.frameStrategy}`);
    
    if (analysis.requiresChaining) {
      parts.push(`Continuity required with previous shot`);
    }
    
    return parts.join(". ") + ".";
  }
  
  // ========================================================================
  // EXECUTION
  // ========================================================================
  
  /**
   * Execute the generation plan
   */
  async executeGeneration(): Promise<GenerationResult> {
    if (!this.plan) {
      throw new Error("Must plan generation before executing");
    }
    
    if (!this.generateVideo) {
      throw new Error("generateVideo dependency not provided");
    }
    
    console.log(`[Orchestrator] Starting generation for ${this.plan.totalShots} shots...`);
    
    const startTime = Date.now();
    const results = new Map<string, {
      success: boolean;
      videoUrl?: string;
      firstFrame?: string;
      lastFrame?: string;
      error?: string;
    }>();
    
    let generatedCount = 0;
    let failedCount = 0;
    
    this.progress = {
      phase: 0,
      totalPhases: this.plan.phases.length,
      currentShot: "",
      completed: [],
      failed: [],
      inProgress: [],
      percentage: 0,
    };
    
    // Execute each phase
    for (const phase of this.plan.phases) {
      this.progress.phase = phase.phaseNumber;
      this.updateProgress();
      
      if (phase.canParallelize) {
        // Run shots in parallel
        const phaseResults = await Promise.all(
          phase.shots.map(shot => this.generateShot(shot))
        );
        
        for (const result of phaseResults) {
          results.set(result.shotId, result);
          if (result.success) {
            generatedCount++;
            this.progress.completed.push(result.shotId);
          } else {
            failedCount++;
            this.progress.failed.push(result.shotId);
          }
          this.updateProgress();
        }
      } else {
        // Run shots sequentially
        for (const shot of phase.shots) {
          const result = await this.generateShot(shot);
          results.set(result.shotId, result);
          
          if (result.success) {
            generatedCount++;
            this.progress.completed.push(result.shotId);
          } else {
            failedCount++;
            this.progress.failed.push(result.shotId);
          }
          this.updateProgress();
        }
      }
    }
    
    const duration = (Date.now() - startTime) / 1000;
    
    console.log(`[Orchestrator] Generation complete: ${generatedCount}/${this.plan.totalShots} in ${duration.toFixed(1)}s`);
    
    return {
      success: failedCount === 0,
      episodeId: this.episode.id,
      generatedShots: generatedCount,
      failedShots: failedCount,
      results,
      duration,
      cost: this.analysis?.statistics.estimatedCost.kling || 0 + 
            (this.analysis?.statistics.estimatedCost.veo || 0),
    };
  }
  
  /**
   * Generate a single shot
   */
  private async generateShot(planned: PlannedShot): Promise<{
    shotId: string;
    success: boolean;
    videoUrl?: string;
    firstFrame?: string;
    lastFrame?: string;
    error?: string;
  }> {
    const { shotId, videoConfig } = planned;
    
    this.progress!.currentShot = shotId;
    this.progress!.inProgress.push(shotId);
    this.updateProgress();
    
    try {
      console.log(`[Orchestrator] Generating shot ${shotId} with ${videoConfig.provider}...`);
      
      // Generate video
      const result = await this.generateVideo!(videoConfig.jsonConfig);
      
      // Extract and store frames for chaining
      const frames = await storeGeneratedFrames(
        result.url,
        result.duration,
        this.episode.id,
        shotId
      );
      
      this.progress!.inProgress = this.progress!.inProgress.filter(id => id !== shotId);
      this.onShotComplete?.(shotId, { success: true, ...result, ...frames });
      
      return {
        shotId,
        success: true,
        videoUrl: result.url,
        firstFrame: frames.firstFrameUrl,
        lastFrame: frames.lastFrameUrl,
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      this.progress!.inProgress = this.progress!.inProgress.filter(id => id !== shotId);
      this.onError?.(shotId, error instanceof Error ? error : new Error(errorMessage));
      
      return {
        shotId,
        success: false,
        error: errorMessage,
      };
    }
  }
  
  /**
   * Update progress and notify callback
   */
  private updateProgress(): void {
    if (!this.progress || !this.plan) return;
    
    this.progress.percentage = Math.round(
      ((this.progress.completed.length + this.progress.failed.length) / this.plan.totalShots) * 100
    );
    
    this.onProgress?.(this.progress);
  }
  
  // ========================================================================
  // STRATEGY HELPERS
  // ========================================================================
  
  /**
   * Get video strategy for a single shot
   */
  decideVideoStrategy(shot: Shot): VideoStrategy {
    const context = buildEpisodeContext(this.episode, 
      this.episode.shots.findIndex(s => s.id === shot.id)
    );
    const analysis = analyzeShot(shot, context);
    const provider = recommendProvider(analysis);
    
    return {
      provider,
      frameStrategy: analysis.frameStrategy,
      duration: provider === "kling" 
        ? analysis.recommendedDuration.kling 
        : analysis.recommendedDuration.veo,
      chaining: {
        enabled: analysis.requiresChaining,
        sourceShot: analysis.chainSource,
      },
      reasoning: analysis.reasoning,
    };
  }
  
  /**
   * Get analysis summary
   */
  getAnalysisSummary(): {
    totalShots: number;
    singleFrame: number;
    firstLastFrame: number;
    withChaining: number;
    preferredProvider: string;
    estimatedCost: number;
    warnings: string[];
  } | null {
    if (!this.analysis) return null;
    
    return {
      totalShots: this.analysis.totalShots,
      singleFrame: this.analysis.statistics.singleFrameCount,
      firstLastFrame: this.analysis.statistics.firstLastFrameCount,
      withChaining: this.analysis.statistics.chainingRequired,
      preferredProvider: this.analysis.recommendations.preferredProvider,
      estimatedCost: this.analysis.statistics.estimatedCost.kling + 
                     this.analysis.statistics.estimatedCost.veo,
      warnings: this.analysis.recommendations.warnings,
    };
  }
}

// ============================================================================
// FACTORY
// ============================================================================

/**
 * Create a configured orchestrator for an episode
 */
export function createOrchestrator(
  episode: Episode,
  options: {
    resolveCharacterRefs?: (ids: string[]) => Promise<string[]>;
    resolveLocationRefs?: (ids: string[]) => Promise<string[]>;
    generateVideo?: (config: JsonKling | JsonVeo) => Promise<{ url: string; duration: number }>;
    onProgress?: (progress: GenerationProgress) => void;
    onShotComplete?: (shotId: string, result: any) => void;
    onError?: (shotId: string, error: Error) => void;
  } = {}
): GenerationOrchestrator {
  const orchestrator = new GenerationOrchestrator(episode);
  
  orchestrator.setDependencies({
    resolveCharacterRefs: options.resolveCharacterRefs,
    resolveLocationRefs: options.resolveLocationRefs,
    generateVideo: options.generateVideo,
  });
  
  orchestrator.setCallbacks({
    onProgress: options.onProgress,
    onShotComplete: options.onShotComplete,
    onError: options.onError,
  });
  
  return orchestrator;
}
