/**
 * MOOSTIK FFmpeg Orchestration
 * Video composition and rendering using FFmpeg
 */

import { spawn, ChildProcess } from "child_process";
import {
  Timeline,
  VideoClip,
  AudioClip,
  Transition,
  TransitionType,
  OutputSettings,
  CompositionProgress,
  KenBurnsEffect,
  VideoEffect,
  AudioEffect,
  MOOSTIK_COLOR_GRADES,
  DEFAULT_COMPOSITION_SETTINGS,
} from "./types";
import { createLogger, trackPerformance } from "../logger";
import { MoostikError } from "../errors";
import { config as appConfig } from "../config";
import * as path from "path";
import * as fs from "fs/promises";

const logger = createLogger("FFmpeg");

// ============================================
// FFMPEG ERROR
// ============================================

export class FFmpegError extends MoostikError {
  constructor(message: string, details?: unknown) {
    super(message, "FFMPEG_ERROR", 500, details);
  }
}

// ============================================
// FFMPEG COMMAND BUILDER
// ============================================

export class FFmpegCommandBuilder {
  private inputs: string[] = [];
  private filterComplex: string[] = [];
  private outputOptions: string[] = [];
  private inputIndex = 0;
  private filterIndex = 0;

  /**
   * Add input file
   */
  addInput(filePath: string, options?: string[]): number {
    const index = this.inputIndex++;
    if (options) {
      this.inputs.push(...options);
    }
    this.inputs.push("-i", filePath);
    return index;
  }

  /**
   * Add image input with loop
   */
  addImageInput(filePath: string, durationSeconds: number): number {
    return this.addInput(filePath, [
      "-loop", "1",
      "-t", durationSeconds.toString(),
    ]);
  }

  /**
   * Add filter to filter complex
   */
  addFilter(filter: string): string {
    const label = `f${this.filterIndex++}`;
    this.filterComplex.push(filter);
    return label;
  }

  /**
   * Generate Ken Burns effect filter
   */
  kenBurnsFilter(
    inputLabel: string,
    effect: KenBurnsEffect,
    durationMs: number,
    outputLabel: string
  ): void {
    const frames = Math.floor((durationMs / 1000) * 24); // Assuming 24fps
    const { startScale, endScale, startPosition, endPosition, easing } = effect;

    // Calculate zoom and pan expressions
    const zoomExpr = `${startScale}+(${endScale - startScale})*on/${frames}`;
    const xExpr = `(iw-iw/zoom)*${startPosition.x}+(${endPosition.x - startPosition.x})*on/${frames}`;
    const yExpr = `(ih-ih/zoom)*${startPosition.y}+(${endPosition.y - startPosition.y})*on/${frames}`;

    this.filterComplex.push(
      `[${inputLabel}]zoompan=z='${zoomExpr}':x='${xExpr}':y='${yExpr}':d=${frames}:s=1920x1080:fps=24[${outputLabel}]`
    );
  }

  /**
   * Generate crossfade transition
   */
  crossfadeTransition(
    input1Label: string,
    input2Label: string,
    durationMs: number,
    outputLabel: string
  ): void {
    const duration = durationMs / 1000;
    this.filterComplex.push(
      `[${input1Label}][${input2Label}]xfade=transition=fade:duration=${duration}:offset=0[${outputLabel}]`
    );
  }

  /**
   * Generate color grading filter
   */
  colorGradeFilter(
    inputLabel: string,
    gradeName: keyof typeof MOOSTIK_COLOR_GRADES,
    outputLabel: string
  ): void {
    const grade = MOOSTIK_COLOR_GRADES[gradeName];
    if (!grade) return;

    const filters: string[] = [];

    // Saturation and contrast
    filters.push(`eq=saturation=${grade.saturation}:contrast=${grade.contrast}:brightness=${grade.brightness - 1}`);

    // Color tint using colorbalance
    if (grade.tint) {
      const rs = (grade.tint.r - 1) * 0.5;
      const gs = (grade.tint.g - 1) * 0.5;
      const bs = (grade.tint.b - 1) * 0.5;
      filters.push(`colorbalance=rs=${rs}:gs=${gs}:bs=${bs}`);
    }

    // Vignette
    if (grade.vignette) {
      filters.push(`vignette=PI/${4 / grade.vignette}`);
    }

    this.filterComplex.push(
      `[${inputLabel}]${filters.join(",")}[${outputLabel}]`
    );
  }

  /**
   * Apply video effects
   */
  videoEffectsFilter(
    inputLabel: string,
    effects: VideoEffect[],
    outputLabel: string
  ): void {
    const filters: string[] = [];

    for (const effect of effects) {
      const intensity = effect.intensity ?? 0.5;

      switch (effect.type) {
        case "blur":
          filters.push(`boxblur=${Math.round(intensity * 10)}`);
          break;
        case "sharpen":
          filters.push(`unsharp=5:5:${intensity * 2}`);
          break;
        case "film_grain":
          filters.push(`noise=alls=${Math.round(intensity * 20)}:allf=t`);
          break;
        case "vignette":
          filters.push(`vignette=PI/${4 / intensity}`);
          break;
        case "glow":
          filters.push(`gblur=sigma=${intensity * 5},blend=all_mode=screen`);
          break;
        case "sepia":
          filters.push(`colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131`);
          break;
        case "noir":
          filters.push(`hue=s=0,curves=m='0/0 0.5/0.4 1/1'`);
          break;
        case "dream":
          filters.push(`gblur=sigma=2,eq=brightness=0.06:saturation=0.8`);
          break;
      }
    }

    if (filters.length > 0) {
      this.filterComplex.push(
        `[${inputLabel}]${filters.join(",")}[${outputLabel}]`
      );
    }
  }

  /**
   * Audio mixing with ducking
   */
  audioMixFilter(
    dialogueLabel: string,
    musicLabel: string,
    duckingDb: number,
    outputLabel: string
  ): void {
    // Use sidechaincompress to duck music when dialogue plays
    this.filterComplex.push(
      `[${musicLabel}][${dialogueLabel}]sidechaincompress=threshold=0.02:ratio=4:attack=200:release=1000[ducked_music]`,
      `[ducked_music][${dialogueLabel}]amix=inputs=2:duration=longest[${outputLabel}]`
    );
  }

  /**
   * Set output options
   */
  setOutput(settings: OutputSettings): void {
    // Video codec
    switch (settings.codec) {
      case "h264":
        this.outputOptions.push("-c:v", "libx264", "-preset", "medium", "-crf", "18");
        break;
      case "h265":
        this.outputOptions.push("-c:v", "libx265", "-preset", "medium", "-crf", "20");
        break;
      case "vp9":
        this.outputOptions.push("-c:v", "libvpx-vp9", "-crf", "30", "-b:v", "0");
        break;
      case "prores":
        this.outputOptions.push("-c:v", "prores_ks", "-profile:v", "3");
        break;
    }

    // Resolution
    this.outputOptions.push("-s", `${settings.resolution.width}x${settings.resolution.height}`);

    // Frame rate
    this.outputOptions.push("-r", settings.fps.toString());

    // Bitrate
    if (settings.bitrate) {
      this.outputOptions.push("-b:v", settings.bitrate);
    }

    // Audio codec
    const audioCodec = settings.audioCodec || "aac";
    this.outputOptions.push("-c:a", audioCodec);

    if (settings.audioBitrate) {
      this.outputOptions.push("-b:a", settings.audioBitrate);
    }

    // Pixel format for compatibility
    this.outputOptions.push("-pix_fmt", "yuv420p");
  }

  /**
   * Build command array
   */
  build(outputPath: string): string[] {
    const cmd: string[] = ["-y"]; // Overwrite output

    // Add inputs
    cmd.push(...this.inputs);

    // Add filter complex if any
    if (this.filterComplex.length > 0) {
      cmd.push("-filter_complex", this.filterComplex.join(";"));
    }

    // Add output options
    cmd.push(...this.outputOptions);

    // Output file
    cmd.push(outputPath);

    return cmd;
  }

  /**
   * Build command string for debugging
   */
  toString(outputPath: string): string {
    return `ffmpeg ${this.build(outputPath).join(" ")}`;
  }
}

// ============================================
// FFMPEG EXECUTOR
// ============================================

export interface FFmpegExecutorOptions {
  onProgress?: (progress: CompositionProgress) => void;
  timeoutMs?: number;
}

export async function executeFFmpeg(
  args: string[],
  options: FFmpegExecutorOptions = {}
): Promise<void> {
  const { onProgress, timeoutMs = 3600000 } = options; // 1 hour default timeout

  return new Promise((resolve, reject) => {
    const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";
    logger.debug("Executing FFmpeg", { args: args.join(" ").slice(0, 200) });

    const process = spawn(ffmpegPath, args);
    let stderr = "";
    let duration: number | null = null;
    let currentTime = 0;

    process.stderr.on("data", (data) => {
      const output = data.toString();
      stderr += output;

      // Parse duration
      const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})/);
      if (durationMatch && !duration) {
        const [, hours, minutes, seconds] = durationMatch;
        duration = (parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)) * 1000;
      }

      // Parse progress
      const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})/);
      if (timeMatch && onProgress && duration) {
        const [, hours, minutes, seconds] = timeMatch;
        currentTime = (parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)) * 1000;

        const percentComplete = Math.min(100, (currentTime / duration) * 100);
        const fps = 24;
        const currentFrame = Math.floor((currentTime / 1000) * fps);
        const totalFrames = Math.floor((duration / 1000) * fps);

        onProgress({
          phase: "rendering",
          currentFrame,
          totalFrames,
          percentComplete,
          estimatedRemainingMs: percentComplete > 0
            ? ((100 - percentComplete) / percentComplete) * currentTime
            : undefined,
        });
      }
    });

    const timeout = setTimeout(() => {
      process.kill();
      reject(new FFmpegError("FFmpeg execution timed out"));
    }, timeoutMs);

    process.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve();
      } else {
        reject(new FFmpegError(`FFmpeg exited with code ${code}`, { stderr: stderr.slice(-1000) }));
      }
    });

    process.on("error", (error) => {
      clearTimeout(timeout);
      reject(new FFmpegError(`FFmpeg process error: ${error.message}`));
    });
  });
}

// ============================================
// HIGH-LEVEL COMPOSITION FUNCTIONS
// ============================================

/**
 * Concatenate video clips with transitions
 */
export async function concatenateClips(
  clips: Array<{
    path: string;
    duration?: number;
    transition?: TransitionType;
    transitionDurationMs?: number;
  }>,
  outputPath: string,
  settings: OutputSettings,
  onProgress?: (progress: CompositionProgress) => void
): Promise<void> {
  const builder = new FFmpegCommandBuilder();

  // Add all inputs
  const inputLabels: string[] = [];
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const isImage = clip.path.match(/\.(jpg|jpeg|png|webp)$/i);

    if (isImage && clip.duration) {
      builder.addImageInput(clip.path, clip.duration / 1000);
    } else {
      builder.addInput(clip.path);
    }
    inputLabels.push(`${i}:v`);
  }

  // Build filter graph for transitions
  if (clips.length > 1) {
    let currentLabel = inputLabels[0];

    for (let i = 1; i < clips.length; i++) {
      const clip = clips[i];
      const transitionDuration = (clip.transitionDurationMs || 500) / 1000;
      const nextLabel = i === clips.length - 1 ? "outv" : `v${i}`;

      // Apply transition
      const transition = clip.transition || "crossfade";
      const xfadeType = mapTransitionType(transition);

      builder.addFilter(
        `[${currentLabel}][${inputLabels[i]}]xfade=transition=${xfadeType}:duration=${transitionDuration}:offset=0[${nextLabel}]`
      );

      currentLabel = nextLabel;
    }
  }

  builder.setOutput(settings);

  const args = builder.build(outputPath);
  await executeFFmpeg(args, { onProgress });
}

/**
 * Mix multiple audio tracks
 */
export async function mixAudioTracks(
  tracks: Array<{
    path: string;
    volume: number;
    startMs?: number;
    fadeInMs?: number;
    fadeOutMs?: number;
  }>,
  outputPath: string,
  format: "mp3" | "wav" | "aac" = "mp3"
): Promise<void> {
  const builder = new FFmpegCommandBuilder();

  // Add inputs and build filter
  const inputLabels: string[] = [];
  const volumeFilters: string[] = [];

  for (let i = 0; i < tracks.length; i++) {
    builder.addInput(tracks[i].path);
    inputLabels.push(`${i}:a`);

    // Build volume/fade filter
    const filters: string[] = [];
    filters.push(`volume=${tracks[i].volume}`);

    if (tracks[i].fadeInMs) {
      filters.push(`afade=t=in:st=0:d=${tracks[i].fadeInMs / 1000}`);
    }

    if (tracks[i].fadeOutMs) {
      // Note: fadeout needs duration info, using adelay for start offset
      filters.push(`afade=t=out:d=${tracks[i].fadeOutMs / 1000}`);
    }

    if (tracks[i].startMs) {
      filters.unshift(`adelay=${tracks[i].startMs}|${tracks[i].startMs}`);
    }

    volumeFilters.push(`[${inputLabels[i]}]${filters.join(",")}[a${i}]`);
  }

  // Add volume filters
  for (const filter of volumeFilters) {
    builder.addFilter(filter);
  }

  // Mix all tracks
  const mixInputs = tracks.map((_, i) => `[a${i}]`).join("");
  builder.addFilter(`${mixInputs}amix=inputs=${tracks.length}:duration=longest[outa]`);

  // Output settings
  builder["outputOptions"].push("-map", "[outa]");
  if (format === "mp3") {
    builder["outputOptions"].push("-c:a", "libmp3lame", "-q:a", "2");
  } else if (format === "aac") {
    builder["outputOptions"].push("-c:a", "aac", "-b:a", "192k");
  } else {
    builder["outputOptions"].push("-c:a", "pcm_s16le");
  }

  const args = builder.build(outputPath);
  await executeFFmpeg(args);
}

/**
 * Add audio to video
 */
export async function addAudioToVideo(
  videoPath: string,
  audioPath: string,
  outputPath: string,
  options: {
    replaceAudio?: boolean;
    audioVolume?: number;
    videoVolume?: number;
  } = {}
): Promise<void> {
  const { replaceAudio = true, audioVolume = 1, videoVolume = 0.3 } = options;

  const builder = new FFmpegCommandBuilder();
  builder.addInput(videoPath);
  builder.addInput(audioPath);

  if (replaceAudio) {
    // Replace video audio with new audio
    builder["outputOptions"].push(
      "-map", "0:v",
      "-map", "1:a",
      "-c:v", "copy",
      "-c:a", "aac",
      "-shortest"
    );
  } else {
    // Mix audio tracks
    builder.addFilter(
      `[0:a]volume=${videoVolume}[va];[1:a]volume=${audioVolume}[na];[va][na]amix=inputs=2:duration=longest[outa]`
    );
    builder["outputOptions"].push(
      "-map", "0:v",
      "-map", "[outa]",
      "-c:v", "copy",
      "-c:a", "aac"
    );
  }

  const args = builder.build(outputPath);
  await executeFFmpeg(args);
}

/**
 * Apply Ken Burns effect to image
 */
export async function applyKenBurns(
  imagePath: string,
  outputPath: string,
  effect: KenBurnsEffect,
  durationMs: number,
  settings: OutputSettings
): Promise<void> {
  const builder = new FFmpegCommandBuilder();
  builder.addImageInput(imagePath, durationMs / 1000);
  builder.kenBurnsFilter("0:v", effect, durationMs, "outv");
  builder["outputOptions"].push("-map", "[outv]");
  builder.setOutput(settings);

  const args = builder.build(outputPath);
  await executeFFmpeg(args);
}

/**
 * Apply color grading to video
 */
export async function applyColorGrade(
  videoPath: string,
  outputPath: string,
  gradeName: keyof typeof MOOSTIK_COLOR_GRADES
): Promise<void> {
  const builder = new FFmpegCommandBuilder();
  builder.addInput(videoPath);
  builder.colorGradeFilter("0:v", gradeName, "outv");
  builder["outputOptions"].push(
    "-map", "[outv]",
    "-map", "0:a?",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-c:a", "copy"
  );

  const args = builder.build(outputPath);
  await executeFFmpeg(args);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function mapTransitionType(type: TransitionType): string {
  const mapping: Record<TransitionType, string> = {
    cut: "fade",
    crossfade: "fade",
    fade_black: "fadeblack",
    fade_white: "fadewhite",
    wipe_left: "wipeleft",
    wipe_right: "wiperight",
    wipe_up: "wipeup",
    wipe_down: "wipedown",
    zoom_in: "zoomin",
    zoom_out: "fadefast",
    blur: "fade",
    glitch: "pixelize",
  };
  return mapping[type] || "fade";
}

/**
 * Check if FFmpeg is available
 */
export async function checkFFmpegAvailable(): Promise<boolean> {
  try {
    await executeFFmpeg(["-version"], { timeoutMs: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get video duration in milliseconds
 */
export async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn(process.env.FFPROBE_PATH || "ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      videoPath,
    ]);

    let output = "";
    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
    });

    ffprobe.on("close", (code) => {
      if (code === 0) {
        resolve(parseFloat(output.trim()) * 1000);
      } else {
        reject(new FFmpegError("Failed to get video duration"));
      }
    });
  });
}

/**
 * Generate thumbnail from video
 */
export async function generateThumbnail(
  videoPath: string,
  outputPath: string,
  timestampMs = 0
): Promise<void> {
  const timestamp = timestampMs / 1000;
  await executeFFmpeg([
    "-ss", timestamp.toString(),
    "-i", videoPath,
    "-vframes", "1",
    "-q:v", "2",
    outputPath,
  ]);
}
