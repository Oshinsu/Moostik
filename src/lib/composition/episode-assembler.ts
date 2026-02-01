/**
 * MOOSTIK Episode Assembler
 * High-level orchestration for assembling shots into complete episodes
 */

import {
  Timeline,
  VideoTrack,
  CompositionAudioTrack,
  VideoClip,
  AudioClip,
  CompositionRequest,
  CompositionOutput,
  CompositionProgress,
  EpisodeAssemblyRequest,
  AssemblyShot,
  OutputSettings,
  TransitionType,
  MOOSTIK_COLOR_GRADES,
  DEFAULT_COMPOSITION_SETTINGS,
} from "./types";
import {
  FFmpegCommandBuilder,
  executeFFmpeg,
  concatenateClips,
  mixAudioTracks,
  addAudioToVideo,
  applyKenBurns,
  applyColorGrade,
  checkFFmpegAvailable,
  getVideoDuration,
} from "./ffmpeg";
import { createLogger, trackPerformance } from "../logger";
import { MoostikError } from "../errors";
import { config as appConfig } from "../config";
import * as path from "path";
import * as fs from "fs/promises";

const logger = createLogger("EpisodeAssembler");

// ============================================
// EPISODE ASSEMBLER ERROR
// ============================================

export class EpisodeAssemblyError extends MoostikError {
  constructor(message: string, details?: unknown) {
    super(message, "EPISODE_ASSEMBLY_ERROR", 500, details as Record<string, unknown> | undefined);
  }
}

// ============================================
// EPISODE ASSEMBLER
// ============================================

export class EpisodeAssembler {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(appConfig.paths.output, "temp");
  }

  /**
   * Assemble complete episode from shots
   */
  async assembleEpisode(request: EpisodeAssemblyRequest): Promise<CompositionOutput> {
    const perf = trackPerformance("assembleEpisode");
    const { episodeId, shots, music, output, onProgress } = request;

    logger.info(`Starting episode assembly`, { episodeId, shotCount: shots.length });

    // Check FFmpeg availability
    if (!(await checkFFmpegAvailable())) {
      throw new EpisodeAssemblyError("FFmpeg is not available");
    }

    // Ensure temp directory exists
    await fs.mkdir(this.tempDir, { recursive: true });

    try {
      // Phase 1: Prepare video clips
      onProgress?.({
        phase: "preparing",
        currentFrame: 0,
        totalFrames: shots.length,
        percentComplete: 0,
      });

      const preparedClips = await this.prepareVideoClips(shots, episodeId, (i) => {
        onProgress?.({
          phase: "preparing",
          currentFrame: i,
          totalFrames: shots.length,
          percentComplete: (i / shots.length) * 25,
        });
      });

      // Phase 2: Concatenate video clips
      const videoPath = path.join(this.tempDir, `${episodeId}_video.mp4`);
      await this.concatenateVideoClips(preparedClips, videoPath, output, (progress) => {
        onProgress?.({
          ...progress,
          percentComplete: 25 + progress.percentComplete * 0.25,
        });
      });

      // Phase 3: Prepare and mix audio
      const audioPath = path.join(this.tempDir, `${episodeId}_audio.mp3`);
      await this.prepareAudioMix(shots, music, audioPath, (progress) => {
        onProgress?.({
          ...progress,
          phase: "encoding",
          percentComplete: 50 + progress.percentComplete * 0.25,
        });
      });

      // Phase 4: Combine video and audio
      const outputDir = path.join(appConfig.paths.output, "episodes", episodeId);
      await fs.mkdir(outputDir, { recursive: true });

      const finalPath = path.join(outputDir, `${episodeId}_final.${output.format}`);
      await addAudioToVideo(videoPath, audioPath, finalPath);

      onProgress?.({
        phase: "finalizing",
        currentFrame: shots.length,
        totalFrames: shots.length,
        percentComplete: 100,
      });

      // Get final video info
      const durationMs = await getVideoDuration(finalPath);
      const stats = await fs.stat(finalPath);

      perf.end();

      const result: CompositionOutput = {
        id: `comp-${episodeId}-${Date.now()}`,
        episodeId,
        outputPath: finalPath,
        format: output.format,
        resolution: output.resolution,
        fps: output.fps,
        durationMs,
        fileSize: stats.size,
        createdAt: new Date().toISOString(),
        renderTimeMs: 0, // TODO: Calculate from perf
      };

      logger.info(`Episode assembly completed`, {
        episodeId,
        duration: durationMs,
        fileSize: stats.size,
      });

      // Cleanup temp files
      await this.cleanupTemp(episodeId);

      return result;

    } catch (error) {
      logger.error("Episode assembly failed", error);
      await this.cleanupTemp(episodeId);
      throw error;
    }
  }

  /**
   * Prepare video clips from shots
   */
  private async prepareVideoClips(
    shots: AssemblyShot[],
    episodeId: string,
    onProgress?: (index: number) => void
  ): Promise<Array<{
    path: string;
    duration: number;
    transition?: TransitionType;
    transitionDurationMs?: number;
    colorGrade?: string;
  }>> {
    const clips: Array<{
      path: string;
      duration: number;
      transition?: TransitionType;
      transitionDurationMs?: number;
      colorGrade?: string;
    }> = [];

    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      onProgress?.(i);

      // Determine source: lip sync > video > image
      let sourcePath: string;
      let needsKenBurns = false;

      if (shot.lipSyncVideoPath) {
        sourcePath = shot.lipSyncVideoPath;
      } else if (shot.videoPath) {
        sourcePath = shot.videoPath;
      } else if (shot.imagePath) {
        sourcePath = shot.imagePath;
        needsKenBurns = true;
      } else {
        logger.warn(`Shot ${shot.shotId} has no video source, skipping`);
        continue;
      }

      // Process image with Ken Burns if needed
      if (needsKenBurns) {
        const processedPath = path.join(
          this.tempDir,
          `${episodeId}_${shot.shotId}_kb.mp4`
        );

        const kenBurns = shot.kenBurns || this.getDefaultKenBurns(shot.animationType);
        await applyKenBurns(
          sourcePath,
          processedPath,
          kenBurns,
          shot.durationMs,
          DEFAULT_COMPOSITION_SETTINGS.presets.standard
        );

        sourcePath = processedPath;
      }

      // Apply color grading if specified
      if (shot.colorGrade) {
        const gradedPath = path.join(
          this.tempDir,
          `${episodeId}_${shot.shotId}_graded.mp4`
        );

        await applyColorGrade(
          sourcePath,
          gradedPath,
          shot.colorGrade as keyof typeof MOOSTIK_COLOR_GRADES
        );

        sourcePath = gradedPath;
      }

      clips.push({
        path: sourcePath,
        duration: shot.durationMs,
        transition: shot.transitionIn || "crossfade",
        transitionDurationMs: DEFAULT_COMPOSITION_SETTINGS.defaultTransitionDurationMs,
      });
    }

    return clips;
  }

  /**
   * Concatenate video clips with transitions
   */
  private async concatenateVideoClips(
    clips: Array<{
      path: string;
      duration: number;
      transition?: TransitionType;
      transitionDurationMs?: number;
    }>,
    outputPath: string,
    settings: OutputSettings,
    onProgress?: (progress: CompositionProgress) => void
  ): Promise<void> {
    await concatenateClips(clips, outputPath, settings, onProgress);
  }

  /**
   * Prepare audio mix from dialogue, music, and SFX
   */
  private async prepareAudioMix(
    shots: AssemblyShot[],
    music: EpisodeAssemblyRequest["music"],
    outputPath: string,
    onProgress?: (progress: CompositionProgress) => void
  ): Promise<void> {
    const tracks: Array<{
      path: string;
      volume: number;
      startMs?: number;
      fadeInMs?: number;
      fadeOutMs?: number;
    }> = [];

    // Add music track
    if (music?.localPath || music?.audioUrl) {
      const musicPath = music.localPath || await this.downloadAudio(music.audioUrl!);
      tracks.push({
        path: musicPath,
        volume: 0.4, // Background level
        fadeInMs: DEFAULT_COMPOSITION_SETTINGS.musicFadeInMs,
        fadeOutMs: DEFAULT_COMPOSITION_SETTINGS.musicFadeOutMs,
      });
    }

    // Collect dialogue tracks
    let currentTimeMs = 0;
    for (const shot of shots) {
      if (shot.dialogue?.lines) {
        for (const line of shot.dialogue.lines) {
          if (line.localPath) {
            tracks.push({
              path: line.localPath,
              volume: 1.0, // Full volume for dialogue
              startMs: currentTimeMs + line.startTimeMs,
            });
          }
        }
      }

      // Add SFX
      if (shot.sfx) {
        for (const sfx of shot.sfx) {
          if (sfx.localPath) {
            tracks.push({
              path: sfx.localPath,
              volume: sfx.volume,
              startMs: currentTimeMs,
              fadeInMs: sfx.fadeInMs,
              fadeOutMs: sfx.fadeOutMs,
            });
          }
        }
      }

      currentTimeMs += shot.durationMs;
    }

    if (tracks.length === 0) {
      // Create silent audio track
      await this.createSilentAudio(outputPath, currentTimeMs);
      return;
    }

    await mixAudioTracks(tracks, outputPath, "mp3");
  }

  /**
   * Get default Ken Burns effect based on animation type
   */
  private getDefaultKenBurns(animationType: string): {
    startScale: number;
    endScale: number;
    startPosition: { x: number; y: number };
    endPosition: { x: number; y: number };
    easing: "linear" | "ease_in" | "ease_out" | "ease_in_out";
  } {
    const defaults: Record<string, ReturnType<typeof this.getDefaultKenBurns>> = {
      establishing: {
        startScale: 1.0,
        endScale: 1.1,
        startPosition: { x: 0.5, y: 0.5 },
        endPosition: { x: 0.5, y: 0.4 },
        easing: "ease_in_out",
      },
      dialogue: {
        startScale: 1.0,
        endScale: 1.02,
        startPosition: { x: 0.5, y: 0.5 },
        endPosition: { x: 0.5, y: 0.5 },
        easing: "linear",
      },
      emotional: {
        startScale: 1.0,
        endScale: 1.15,
        startPosition: { x: 0.5, y: 0.5 },
        endPosition: { x: 0.5, y: 0.45 },
        easing: "ease_in",
      },
      action: {
        startScale: 1.05,
        endScale: 1.0,
        startPosition: { x: 0.4, y: 0.5 },
        endPosition: { x: 0.6, y: 0.5 },
        easing: "ease_out",
      },
      combat: {
        startScale: 1.1,
        endScale: 1.0,
        startPosition: { x: 0.3, y: 0.5 },
        endPosition: { x: 0.7, y: 0.5 },
        easing: "ease_out",
      },
      death: {
        startScale: 1.0,
        endScale: 1.2,
        startPosition: { x: 0.5, y: 0.5 },
        endPosition: { x: 0.5, y: 0.4 },
        easing: "ease_in",
      },
      flashback: {
        startScale: 1.1,
        endScale: 1.0,
        startPosition: { x: 0.5, y: 0.5 },
        endPosition: { x: 0.5, y: 0.5 },
        easing: "ease_in_out",
      },
      subtle: {
        startScale: 1.0,
        endScale: 1.03,
        startPosition: { x: 0.5, y: 0.5 },
        endPosition: { x: 0.5, y: 0.48 },
        easing: "linear",
      },
      transition: {
        startScale: 1.0,
        endScale: 0.95,
        startPosition: { x: 0.5, y: 0.5 },
        endPosition: { x: 0.5, y: 0.5 },
        easing: "ease_in_out",
      },
    };

    return defaults[animationType] || defaults.subtle;
  }

  /**
   * Download audio from URL
   */
  private async downloadAudio(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new EpisodeAssemblyError(`Failed to download audio: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const localPath = path.join(this.tempDir, `audio_${Date.now()}.mp3`);
    await fs.writeFile(localPath, Buffer.from(buffer));
    return localPath;
  }

  /**
   * Create silent audio track
   */
  private async createSilentAudio(outputPath: string, durationMs: number): Promise<void> {
    const duration = durationMs / 1000;
    await executeFFmpeg([
      "-f", "lavfi",
      "-i", `anullsrc=r=44100:cl=stereo`,
      "-t", duration.toString(),
      "-c:a", "libmp3lame",
      "-q:a", "2",
      outputPath,
    ]);
  }

  /**
   * Cleanup temporary files
   */
  private async cleanupTemp(episodeId: string): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      for (const file of files) {
        if (file.startsWith(episodeId)) {
          await fs.unlink(path.join(this.tempDir, file));
        }
      }
    } catch (error) {
      logger.warn("Failed to cleanup temp files", { error: String(error) });
    }
  }

  /**
   * Generate preview (lower quality, faster)
   */
  async generatePreview(
    request: EpisodeAssemblyRequest
  ): Promise<CompositionOutput> {
    return this.assembleEpisode({
      ...request,
      output: DEFAULT_COMPOSITION_SETTINGS.presets.preview,
    });
  }

  /**
   * Render specific section of episode
   */
  async renderSection(
    request: EpisodeAssemblyRequest,
    startShotIndex: number,
    endShotIndex: number
  ): Promise<CompositionOutput> {
    const sectionShots = request.shots.slice(startShotIndex, endShotIndex + 1);

    return this.assembleEpisode({
      ...request,
      shots: sectionShots,
      episodeId: `${request.episodeId}_section_${startShotIndex}_${endShotIndex}`,
    });
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let assemblerInstance: EpisodeAssembler | null = null;

export function getEpisodeAssembler(): EpisodeAssembler {
  if (!assemblerInstance) {
    assemblerInstance = new EpisodeAssembler();
  }
  return assemblerInstance;
}
