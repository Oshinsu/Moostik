/**
 * MOOSTIK Composition Types
 * Timeline, video editing, and episode assembly
 */

import { ShotVideo, AnimationType, CameraMotion } from "../video/types";
import { DialogueSynthesisOutput, MusicGenerationOutput, SoundEffect } from "../audio/types";

// ============================================
// TIMELINE TYPES
// ============================================

export interface Timeline {
  id: string;
  episodeId: string;
  name: string;

  // Duration
  totalDurationMs: number;
  fps: number;

  // Tracks
  videoTrack: VideoTrack;
  dialogueTrack: AudioTrack;
  musicTrack: AudioTrack;
  sfxTrack: AudioTrack;
  ambienceTrack: AudioTrack;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface VideoTrack {
  id: string;
  type: "video";
  clips: VideoClip[];
  transitions: Transition[];
}

export interface AudioTrack {
  id: string;
  type: "dialogue" | "music" | "sfx" | "ambience";
  clips: AudioClip[];
  masterVolume: number; // 0-1
  pan: number; // -1 (left) to 1 (right)
}

// ============================================
// CLIP TYPES
// ============================================

export interface VideoClip {
  id: string;
  shotId: string;
  variationId?: string;

  // Source
  sourceType: "image" | "video" | "lipsync";
  sourcePath: string;

  // Timing
  startMs: number;
  endMs: number;
  trimStartMs?: number; // Trim from source start
  trimEndMs?: number; // Trim from source end

  // Transform
  scale?: number;
  position?: { x: number; y: number };
  rotation?: number;
  opacity?: number;

  // Effects
  effects?: VideoEffect[];

  // Animation (for images)
  kenBurns?: KenBurnsEffect;
}

export interface AudioClip {
  id: string;
  name: string;

  // Source
  sourcePath: string;

  // Timing
  startMs: number;
  endMs: number;
  trimStartMs?: number;
  trimEndMs?: number;

  // Volume
  volume: number; // 0-1
  fadeInMs?: number;
  fadeOutMs?: number;

  // Effects
  effects?: AudioEffect[];

  // Loop
  loop?: boolean;
  loopCount?: number;
}

// ============================================
// EFFECTS & TRANSITIONS
// ============================================

export interface Transition {
  id: string;
  type: TransitionType;
  fromClipId: string;
  toClipId: string;
  durationMs: number;
  easing?: EasingType;
}

export type TransitionType =
  | "cut" // Hard cut
  | "crossfade" // Dissolve
  | "fade_black" // Fade to black
  | "fade_white" // Fade to white
  | "wipe_left" // Wipe left
  | "wipe_right" // Wipe right
  | "wipe_up" // Wipe up
  | "wipe_down" // Wipe down
  | "zoom_in" // Zoom into next
  | "zoom_out" // Zoom out to next
  | "blur" // Blur transition
  | "glitch"; // Glitch effect

export type EasingType =
  | "linear"
  | "ease_in"
  | "ease_out"
  | "ease_in_out"
  | "bounce"
  | "elastic";

export interface VideoEffect {
  type: VideoEffectType;
  intensity?: number; // 0-1
  parameters?: Record<string, unknown>;
}

export type VideoEffectType =
  | "blur"
  | "sharpen"
  | "vignette"
  | "color_grade"
  | "film_grain"
  | "chromatic_aberration"
  | "glow"
  | "contrast"
  | "saturation"
  | "brightness"
  | "sepia"
  | "noir"
  | "dream"; // Soft focus + glow

export interface AudioEffect {
  type: AudioEffectType;
  intensity?: number;
  parameters?: Record<string, unknown>;
}

export type AudioEffectType =
  | "reverb"
  | "echo"
  | "lowpass"
  | "highpass"
  | "compress"
  | "normalize"
  | "eq"
  | "distortion"
  | "chorus";

export interface KenBurnsEffect {
  startScale: number;
  endScale: number;
  startPosition: { x: number; y: number }; // 0-1 normalized
  endPosition: { x: number; y: number };
  easing: EasingType;
}

// ============================================
// COMPOSITION REQUEST/OUTPUT
// ============================================

export interface CompositionRequest {
  episodeId: string;
  timeline: Timeline;

  // Output settings
  output: OutputSettings;

  // Processing
  preview?: boolean; // Lower quality for preview
  sections?: { startMs: number; endMs: number }[]; // Render only specific sections

  // Callbacks
  onProgress?: (progress: CompositionProgress) => void;
}

export interface OutputSettings {
  format: "mp4" | "webm" | "mov";
  codec: "h264" | "h265" | "vp9" | "prores";
  resolution: { width: number; height: number };
  fps: number;
  bitrate?: string; // e.g., "10M"
  audioCodec?: "aac" | "mp3" | "opus";
  audioBitrate?: string; // e.g., "192k"
}

export interface CompositionProgress {
  phase: "preparing" | "rendering" | "encoding" | "finalizing";
  currentFrame: number;
  totalFrames: number;
  percentComplete: number;
  estimatedRemainingMs?: number;
  currentClip?: string;
}

export interface CompositionOutput {
  id: string;
  episodeId: string;

  // Output file
  outputPath: string;
  format: string;
  resolution: { width: number; height: number };
  fps: number;
  durationMs: number;
  fileSize: number;

  // Metadata
  createdAt: string;
  renderTimeMs: number;
}

// ============================================
// EPISODE ASSEMBLY
// ============================================

export interface EpisodeAssemblyRequest {
  episodeId: string;

  // Assets
  shots: AssemblyShot[];
  music?: MusicGenerationOutput;
  ambiencePreset?: string;

  // Settings
  defaultTransition?: TransitionType;
  transitionDurationMs?: number;

  // Output
  output: OutputSettings;
  onProgress?: (progress: CompositionProgress) => void;
}

export interface AssemblyShot {
  shotId: string;

  // Video source (priority: lipsync > video > image)
  lipSyncVideoPath?: string;
  videoPath?: string;
  imagePath?: string;

  // Timing
  durationMs: number;
  transitionIn?: TransitionType;
  transitionOut?: TransitionType;

  // Audio
  dialogue?: DialogueSynthesisOutput;
  sfx?: SoundEffect[];

  // Animation
  animationType: AnimationType;
  cameraMotion?: CameraMotion;
  kenBurns?: KenBurnsEffect;

  // Effects
  colorGrade?: string; // Preset name
  effects?: VideoEffect[];
}

// ============================================
// MOOSTIK COLOR GRADES
// ============================================

export const MOOSTIK_COLOR_GRADES = {
  genocide: {
    saturation: 0.7,
    contrast: 1.2,
    brightness: 0.85,
    tint: { r: 1.1, g: 0.9, b: 0.9 }, // Slightly red
    vignette: 0.4,
  },
  barScene: {
    saturation: 0.85,
    contrast: 1.1,
    brightness: 0.7,
    tint: { r: 1.0, g: 0.95, b: 0.85 }, // Warm amber
    vignette: 0.5,
  },
  training: {
    saturation: 0.9,
    contrast: 1.3,
    brightness: 1.0,
    tint: { r: 0.95, g: 1.0, b: 1.1 }, // Slightly blue
    vignette: 0.2,
  },
  flashback: {
    saturation: 0.5,
    contrast: 0.9,
    brightness: 1.1,
    tint: { r: 1.0, g: 1.0, b: 0.9 }, // Warm sepia
    vignette: 0.6,
    effects: ["film_grain", "dream"],
  },
  combat: {
    saturation: 1.1,
    contrast: 1.4,
    brightness: 0.95,
    tint: { r: 1.0, g: 0.95, b: 0.95 },
    vignette: 0.3,
  },
  emotional: {
    saturation: 0.8,
    contrast: 1.0,
    brightness: 0.9,
    tint: { r: 0.95, g: 0.95, b: 1.0 }, // Cool
    vignette: 0.4,
  },
};

// ============================================
// DEFAULT TIMINGS
// ============================================

export const DEFAULT_COMPOSITION_SETTINGS = {
  // Transitions
  defaultTransitionDurationMs: 500,
  sceneTransitionDurationMs: 1000,

  // Ken Burns for still images
  defaultKenBurnsScale: { start: 1.0, end: 1.05 },
  defaultKenBurnsDurationMs: 5000,

  // Audio
  dialogueDuckingDb: -6, // Duck music when dialogue plays
  musicFadeInMs: 2000,
  musicFadeOutMs: 3000,
  ambienceFadeMs: 1000,

  // Output presets
  presets: {
    preview: {
      resolution: { width: 1280, height: 720 },
      fps: 24,
      bitrate: "2M",
      codec: "h264" as const,
    },
    standard: {
      resolution: { width: 1920, height: 1080 },
      fps: 24,
      bitrate: "8M",
      codec: "h264" as const,
    },
    high: {
      resolution: { width: 2560, height: 1440 },
      fps: 24,
      bitrate: "15M",
      codec: "h265" as const,
    },
    cinema: {
      resolution: { width: 3840, height: 2160 },
      fps: 24,
      bitrate: "30M",
      codec: "h265" as const,
    },
  },
};
