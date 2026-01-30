/**
 * MOOSTIK Series Generator Orchestrator
 * The ultimate automation layer that generates complete animated episodes
 * from narrative data, coordinating all generation modules.
 */

import { Episode, Shot, Variation } from "@/types/episode";
import { getEpisode, getCharacter, getLocation } from "../storage";

// Video generation
import {
  getVideoManager,
  VideoManager,
  ShotVideoRequest,
  BatchVideoResult,
  AnimationType,
  CameraMotion,
} from "../video";

// Audio generation
import {
  getVoiceSynthesisManager,
  VoiceSynthesisManager,
  getMusicGenerationManager,
  MusicGenerationManager,
  getLipSyncManager,
  LipSyncManager,
  DialogueSynthesisRequest,
  DialogueSynthesisOutput,
  MusicGenerationOutput,
  MOOSTIK_MUSIC_PRESETS,
} from "../audio";

// Composition
import {
  getEpisodeAssembler,
  EpisodeAssembler,
  EpisodeAssemblyRequest,
  AssemblyShot,
  CompositionOutput,
  CompositionProgress,
  DEFAULT_COMPOSITION_SETTINGS,
} from "../composition";

import { createLogger, trackPerformance } from "../logger";
import { MoostikError } from "../errors";
import { config as appConfig } from "../config";

const logger = createLogger("SeriesGenerator");

// ============================================
// TYPES
// ============================================

export interface GenerationPipeline {
  images: boolean; // Generate reference images
  video: boolean; // Animate images to video
  dialogue: boolean; // Synthesize character voices
  music: boolean; // Generate scene music
  lipSync: boolean; // Apply lip sync to dialogue videos
  composition: boolean; // Assemble final episode
}

export interface GenerationOptions {
  pipeline: Partial<GenerationPipeline>;
  quality: "preview" | "standard" | "high" | "cinema";
  parallelization: {
    maxVideoJobs: number;
    maxAudioJobs: number;
  };
  providers?: {
    video?: string;
    voice?: string;
    music?: string;
    lipSync?: string;
  };
}

export interface GenerationProgress {
  phase: GenerationPhase;
  overallPercent: number;
  currentStep: string;
  stepsCompleted: number;
  totalSteps: number;
  details?: Record<string, unknown>;
}

export type GenerationPhase =
  | "initializing"
  | "generating_images"
  | "generating_video"
  | "generating_dialogue"
  | "generating_music"
  | "applying_lipsync"
  | "composing"
  | "finalizing"
  | "completed"
  | "failed";

export interface GenerationResult {
  episodeId: string;
  success: boolean;
  outputPath?: string;
  phases: PhaseResult[];
  totalDurationMs: number;
  stats: GenerationStats;
  errors: GenerationError[];
}

export interface PhaseResult {
  phase: GenerationPhase;
  success: boolean;
  durationMs: number;
  itemsProcessed: number;
  errors?: string[];
}

export interface GenerationStats {
  shotsProcessed: number;
  videosGenerated: number;
  dialogueLinesGenerated: number;
  totalAudioDurationMs: number;
  totalVideoDurationMs: number;
  creditsUsed: {
    video: number;
    voice: number;
    music: number;
  };
}

export interface GenerationError {
  phase: GenerationPhase;
  shotId?: string;
  message: string;
  recoverable: boolean;
}

// ============================================
// SERIES GENERATOR
// ============================================

export class SeriesGenerator {
  private videoManager: VideoManager;
  private voiceManager: VoiceSynthesisManager;
  private musicManager: MusicGenerationManager;
  private lipSyncManager: LipSyncManager;
  private episodeAssembler: EpisodeAssembler;

  constructor() {
    this.videoManager = getVideoManager();
    this.voiceManager = getVoiceSynthesisManager();
    this.musicManager = getMusicGenerationManager();
    this.lipSyncManager = getLipSyncManager();
    this.episodeAssembler = getEpisodeAssembler();
  }

  /**
   * Generate complete episode from narrative data
   */
  async generateEpisode(
    episodeId: string,
    options: GenerationOptions,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<GenerationResult> {
    const perf = trackPerformance("generateEpisode");
    const startTime = Date.now();

    const result: GenerationResult = {
      episodeId,
      success: false,
      phases: [],
      totalDurationMs: 0,
      stats: {
        shotsProcessed: 0,
        videosGenerated: 0,
        dialogueLinesGenerated: 0,
        totalAudioDurationMs: 0,
        totalVideoDurationMs: 0,
        creditsUsed: { video: 0, voice: 0, music: 0 },
      },
      errors: [],
    };

    try {
      // Load episode data
      const episode = await getEpisode(episodeId);
      if (!episode) {
        throw new SeriesGeneratorError(`Episode not found: ${episodeId}`);
      }

      const pipeline = this.resolvePipeline(options.pipeline);
      const totalPhases = Object.values(pipeline).filter(Boolean).length;
      let currentPhase = 0;

      const reportProgress = (phase: GenerationPhase, step: string, percent: number) => {
        const overallPercent = ((currentPhase + percent / 100) / totalPhases) * 100;
        onProgress?.({
          phase,
          overallPercent,
          currentStep: step,
          stepsCompleted: currentPhase,
          totalSteps: totalPhases,
        });
      };

      // Phase 1: Generate images (if not already done)
      if (pipeline.images) {
        reportProgress("generating_images", "Generating reference images...", 0);
        const phaseResult = await this.generateImages(episode, reportProgress);
        result.phases.push(phaseResult);
        currentPhase++;
      }

      // Phase 2: Generate videos from images
      let videoResults: BatchVideoResult | null = null;
      if (pipeline.video) {
        reportProgress("generating_video", "Animating shots...", 0);
        const phaseResult = await this.generateVideos(episode, options, (p) => {
          reportProgress("generating_video", `Animating shot ${p.completed}/${p.total}`, (p.completed / p.total) * 100);
        });
        videoResults = phaseResult.data;
        result.phases.push(phaseResult.phase);
        result.stats.videosGenerated = videoResults?.stats.completed || 0;
        currentPhase++;
      }

      // Phase 3: Generate dialogue audio
      let dialogueResults: Map<string, DialogueSynthesisOutput> = new Map();
      if (pipeline.dialogue) {
        reportProgress("generating_dialogue", "Synthesizing dialogue...", 0);
        const phaseResult = await this.generateDialogue(episode, (step, percent) => {
          reportProgress("generating_dialogue", step, percent);
        });
        dialogueResults = phaseResult.data;
        result.phases.push(phaseResult.phase);
        result.stats.dialogueLinesGenerated = phaseResult.data.size;
        currentPhase++;
      }

      // Phase 4: Generate music
      let musicResult: MusicGenerationOutput | null = null;
      if (pipeline.music) {
        reportProgress("generating_music", "Generating soundtrack...", 0);
        const phaseResult = await this.generateMusic(episode, (step, percent) => {
          reportProgress("generating_music", step, percent);
        });
        musicResult = phaseResult.data;
        result.phases.push(phaseResult.phase);
        currentPhase++;
      }

      // Phase 5: Apply lip sync
      if (pipeline.lipSync && pipeline.dialogue && pipeline.video) {
        reportProgress("applying_lipsync", "Applying lip sync...", 0);
        const phaseResult = await this.applyLipSync(
          episode,
          videoResults!,
          dialogueResults,
          (step, percent) => {
            reportProgress("applying_lipsync", step, percent);
          }
        );
        result.phases.push(phaseResult);
        currentPhase++;
      }

      // Phase 6: Compose final episode
      let compositionResult: CompositionOutput | null = null;
      if (pipeline.composition) {
        reportProgress("composing", "Assembling final episode...", 0);
        const phaseResult = await this.composeEpisode(
          episode,
          videoResults,
          dialogueResults,
          musicResult,
          options,
          (progress) => {
            reportProgress("composing", `Rendering... ${progress.percentComplete.toFixed(0)}%`, progress.percentComplete);
          }
        );
        compositionResult = phaseResult.data;
        result.phases.push(phaseResult.phase);
        result.outputPath = compositionResult?.outputPath;
        currentPhase++;
      }

      // Finalize
      result.success = result.errors.length === 0;
      result.totalDurationMs = Date.now() - startTime;

      perf.end();
      logger.info("Episode generation completed", {
        episodeId,
        success: result.success,
        duration: result.totalDurationMs,
      });

      onProgress?.({
        phase: "completed",
        overallPercent: 100,
        currentStep: "Episode generation complete",
        stepsCompleted: totalPhases,
        totalSteps: totalPhases,
      });

      return result;

    } catch (error) {
      perf.end();
      logger.error("Episode generation failed", error);

      result.errors.push({
        phase: "failed",
        message: error instanceof Error ? error.message : "Unknown error",
        recoverable: false,
      });

      onProgress?.({
        phase: "failed",
        overallPercent: 0,
        currentStep: "Generation failed",
        stepsCompleted: 0,
        totalSteps: 0,
      });

      return result;
    }
  }

  /**
   * Generate images for episode shots
   */
  private async generateImages(
    episode: Episode,
    onProgress: (phase: GenerationPhase, step: string, percent: number) => void
  ): Promise<PhaseResult> {
    const startTime = Date.now();
    // This would call the existing image generation system
    // For now, we assume images are already generated

    return {
      phase: "generating_images",
      success: true,
      durationMs: Date.now() - startTime,
      itemsProcessed: episode.shots.length,
    };
  }

  /**
   * Generate videos from images
   */
  private async generateVideos(
    episode: Episode,
    options: GenerationOptions,
    onProgress: (progress: { completed: number; total: number }) => void
  ): Promise<{ phase: PhaseResult; data: BatchVideoResult | null }> {
    const startTime = Date.now();

    if (!this.videoManager.isAvailable()) {
      return {
        phase: {
          phase: "generating_video",
          success: false,
          durationMs: Date.now() - startTime,
          itemsProcessed: 0,
          errors: ["No video providers available"],
        },
        data: null,
      };
    }

    // Build video requests from shots
    const videoRequests: ShotVideoRequest[] = [];

    for (const shot of episode.shots) {
      // Get the best variation (completed, highest quality)
      const variation = shot.variations?.find((v) => v.status === "completed");
      if (!variation?.localPath && !variation?.imageUrl) continue;

      const animationType = this.determineAnimationType(shot);
      const cameraMotion = this.videoManager.suggestCameraMotion(animationType);

      videoRequests.push({
        shotId: shot.id,
        variationId: variation.id,
        sourceImageUrl: variation.localPath || variation.imageUrl!,
        prompt: shot.narrativeDescription || shot.description,
        durationSeconds: shot.durationSeconds || 5,
        animationType,
        cameraMotion,
      });
    }

    const result = await this.videoManager.generateBatch({
      shots: videoRequests,
      episodeId: episode.id,
      parallelLimit: options.parallelization.maxVideoJobs,
      onProgress,
    });

    return {
      phase: {
        phase: "generating_video",
        success: result.stats.failed === 0,
        durationMs: Date.now() - startTime,
        itemsProcessed: result.stats.completed,
        errors: result.stats.failed > 0 ? [`${result.stats.failed} videos failed`] : undefined,
      },
      data: result,
    };
  }

  /**
   * Generate dialogue audio
   */
  private async generateDialogue(
    episode: Episode,
    onProgress: (step: string, percent: number) => void
  ): Promise<{ phase: PhaseResult; data: Map<string, DialogueSynthesisOutput> }> {
    const startTime = Date.now();
    const results = new Map<string, DialogueSynthesisOutput>();

    if (!this.voiceManager.isAvailable()) {
      return {
        phase: {
          phase: "generating_dialogue",
          success: false,
          durationMs: Date.now() - startTime,
          itemsProcessed: 0,
          errors: ["No voice providers available"],
        },
        data: results,
      };
    }

    const shotsWithDialogue = episode.shots.filter((s) => s.dialogue && s.dialogue.length > 0);
    let processed = 0;

    for (const shot of shotsWithDialogue) {
      onProgress(`Processing ${shot.id}`, (processed / shotsWithDialogue.length) * 100);

      const request: DialogueSynthesisRequest = {
        episodeId: episode.id,
        shotId: shot.id,
        dialogueLines: shot.dialogue!.map((line) => ({
          id: line.id,
          characterId: line.speakerId,
          text: line.text,
          textCreole: line.textCreole,
          emotion: line.emotion as any,
          intensity: 0.8,
          speakingStyle: line.type === "whisper" ? "whisper" : line.type === "scream" ? "shout" : "normal",
          pauseAfterMs: 500,
        })),
      };

      try {
        const result = await this.voiceManager.synthesizeDialogue(request);
        results.set(shot.id, result);
      } catch (error) {
        logger.error(`Failed to synthesize dialogue for shot ${shot.id}`, error);
      }

      processed++;
    }

    return {
      phase: {
        phase: "generating_dialogue",
        success: true,
        durationMs: Date.now() - startTime,
        itemsProcessed: results.size,
      },
      data: results,
    };
  }

  /**
   * Generate music for episode
   */
  private async generateMusic(
    episode: Episode,
    onProgress: (step: string, percent: number) => void
  ): Promise<{ phase: PhaseResult; data: MusicGenerationOutput | null }> {
    const startTime = Date.now();

    if (!this.musicManager.isAvailable()) {
      return {
        phase: {
          phase: "generating_music",
          success: false,
          durationMs: Date.now() - startTime,
          itemsProcessed: 0,
          errors: ["No music providers available"],
        },
        data: null,
      };
    }

    // Determine dominant scene type for music
    const sceneTypes = episode.shots.map((s) => s.sceneType);
    const dominantScene = this.getDominantSceneType(sceneTypes);

    onProgress("Generating episode soundtrack...", 0);

    // Calculate total episode duration
    const totalDuration = episode.shots.reduce(
      (sum, s) => sum + (s.durationSeconds || 5),
      0
    );

    try {
      const result = await this.musicManager.generateForScene(
        dominantScene,
        Math.min(totalDuration, 240), // Max 4 minutes
        `MOOSTIK ${episode.title} - ${dominantScene} atmosphere`
      );

      onProgress("Soundtrack generated", 100);

      return {
        phase: {
          phase: "generating_music",
          success: true,
          durationMs: Date.now() - startTime,
          itemsProcessed: 1,
        },
        data: result,
      };
    } catch (error) {
      logger.error("Failed to generate music", error);
      return {
        phase: {
          phase: "generating_music",
          success: false,
          durationMs: Date.now() - startTime,
          itemsProcessed: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        },
        data: null,
      };
    }
  }

  /**
   * Apply lip sync to dialogue videos
   */
  private async applyLipSync(
    episode: Episode,
    videoResults: BatchVideoResult,
    dialogueResults: Map<string, DialogueSynthesisOutput>,
    onProgress: (step: string, percent: number) => void
  ): Promise<PhaseResult> {
    const startTime = Date.now();

    if (!this.lipSyncManager.isAvailable()) {
      return {
        phase: "applying_lipsync",
        success: false,
        durationMs: Date.now() - startTime,
        itemsProcessed: 0,
        errors: ["No lip sync providers available"],
      };
    }

    let processed = 0;
    const shotsWithDialogue = [...dialogueResults.keys()];

    for (const shotId of shotsWithDialogue) {
      const video = videoResults.videos.find((v) => v.shotId === shotId);
      const dialogue = dialogueResults.get(shotId);

      if (!video?.output?.localPath || !dialogue?.lines?.[0]?.localPath) {
        continue;
      }

      onProgress(`Lip syncing ${shotId}`, (processed / shotsWithDialogue.length) * 100);

      try {
        await this.lipSyncManager.generate({
          sourceType: "video",
          sourceUrl: video.output.localPath,
          audioUrl: dialogue.lines[0].localPath,
          phonemes: dialogue.lines[0].phonemes,
          quality: "standard",
        });
      } catch (error) {
        logger.error(`Failed to apply lip sync to shot ${shotId}`, error);
      }

      processed++;
    }

    return {
      phase: "applying_lipsync",
      success: true,
      durationMs: Date.now() - startTime,
      itemsProcessed: processed,
    };
  }

  /**
   * Compose final episode
   */
  private async composeEpisode(
    episode: Episode,
    videoResults: BatchVideoResult | null,
    dialogueResults: Map<string, DialogueSynthesisOutput>,
    musicResult: MusicGenerationOutput | null,
    options: GenerationOptions,
    onProgress: (progress: CompositionProgress) => void
  ): Promise<{ phase: PhaseResult; data: CompositionOutput | null }> {
    const startTime = Date.now();

    // Build assembly shots
    const assemblyShots: AssemblyShot[] = [];

    for (const shot of episode.shots) {
      const video = videoResults?.videos.find((v) => v.shotId === shot.id);
      const dialogue = dialogueResults.get(shot.id);
      const variation = shot.variations?.find((v) => v.status === "completed");

      assemblyShots.push({
        shotId: shot.id,
        lipSyncVideoPath: video?.lipSyncVideoUrl,
        videoPath: video?.output?.localPath,
        imagePath: variation?.localPath,
        durationMs: (shot.durationSeconds || 5) * 1000,
        animationType: this.determineAnimationType(shot),
        dialogue,
        colorGrade: this.getColorGradeForScene(shot.sceneType),
      });
    }

    const request: EpisodeAssemblyRequest = {
      episodeId: episode.id,
      shots: assemblyShots,
      music: musicResult || undefined,
      output: DEFAULT_COMPOSITION_SETTINGS.presets[options.quality],
      onProgress,
    };

    try {
      const result = await this.episodeAssembler.assembleEpisode(request);

      return {
        phase: {
          phase: "composing",
          success: true,
          durationMs: Date.now() - startTime,
          itemsProcessed: assemblyShots.length,
        },
        data: result,
      };
    } catch (error) {
      logger.error("Failed to compose episode", error);
      return {
        phase: {
          phase: "composing",
          success: false,
          durationMs: Date.now() - startTime,
          itemsProcessed: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        },
        data: null,
      };
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private resolvePipeline(partial: Partial<GenerationPipeline>): GenerationPipeline {
    return {
      images: partial.images ?? false, // Usually already done
      video: partial.video ?? true,
      dialogue: partial.dialogue ?? true,
      music: partial.music ?? true,
      lipSync: partial.lipSync ?? true,
      composition: partial.composition ?? true,
    };
  }

  private determineAnimationType(shot: Shot): AnimationType {
    const sceneTypeMap: Record<string, AnimationType> = {
      genocide: "death",
      survival: "emotional",
      training: "action",
      bar_scene: "dialogue",
      battle: "combat",
      flashback: "flashback",
      emotional: "emotional",
      dialogue: "dialogue",
      establishing: "establishing",
    };

    return sceneTypeMap[shot.sceneType || ""] || "subtle";
  }

  private getColorGradeForScene(sceneType?: string): string | undefined {
    const gradeMap: Record<string, string> = {
      genocide: "genocide",
      bar_scene: "barScene",
      training: "training",
      flashback: "flashback",
      battle: "combat",
      combat: "combat",
      emotional: "emotional",
    };

    return sceneType ? gradeMap[sceneType] : undefined;
  }

  private getDominantSceneType(sceneTypes: (string | undefined)[]): string {
    const counts: Record<string, number> = {};
    for (const type of sceneTypes) {
      if (type) {
        counts[type] = (counts[type] || 0) + 1;
      }
    }

    let maxCount = 0;
    let dominant = "emotional";
    for (const [type, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        dominant = type;
      }
    }

    return dominant;
  }

  // ============================================
  // PUBLIC UTILITIES
  // ============================================

  /**
   * Check system readiness
   */
  async checkReadiness(): Promise<{
    ready: boolean;
    capabilities: {
      video: string[];
      voice: string[];
      music: string[];
      lipSync: string[];
      ffmpeg: boolean;
    };
  }> {
    const { checkFFmpegAvailable } = await import("../composition/ffmpeg");

    return {
      ready: this.videoManager.isAvailable() || this.voiceManager.isAvailable(),
      capabilities: {
        video: this.videoManager.getAvailableProviders(),
        voice: this.voiceManager.getAvailableProviders(),
        music: this.musicManager.getAvailableProviders(),
        lipSync: this.lipSyncManager.getAvailableProviders(),
        ffmpeg: await checkFFmpegAvailable(),
      },
    };
  }

  /**
   * Get available quality presets
   */
  getQualityPresets(): typeof DEFAULT_COMPOSITION_SETTINGS.presets {
    return DEFAULT_COMPOSITION_SETTINGS.presets;
  }
}

// ============================================
// ERROR CLASS
// ============================================

export class SeriesGeneratorError extends MoostikError {
  constructor(message: string, details?: unknown) {
    super(message, "SERIES_GENERATOR_ERROR", 500, details);
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let generatorInstance: SeriesGenerator | null = null;

export function getSeriesGenerator(): SeriesGenerator {
  if (!generatorInstance) {
    generatorInstance = new SeriesGenerator();
  }
  return generatorInstance;
}
