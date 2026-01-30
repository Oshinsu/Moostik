/**
 * MOOSTIK AI Video Editor Types
 * SOTA Video Editing Pipeline - January 2026
 *
 * CapCut-inspired but enhanced with AI capabilities:
 * - Multi-track timeline (video, audio, effects)
 * - AI-assisted editing
 * - Beat/bass synchronization
 * - Smart scene division
 * - SOTA export formats
 */

// ============================================
// PROJECT & TIMELINE
// ============================================

export interface EditorProject {
  id: string;
  name: string;
  description?: string;

  /** Timeline configuration */
  timeline: Timeline;

  /** Project settings */
  settings: ProjectSettings;

  /** AI analysis results */
  aiAnalysis?: ProjectAnalysis;

  /** Assets library */
  assets: AssetLibrary;

  /** Edit history for undo/redo */
  history: EditHistory;

  /** Collaboration */
  collaboration?: CollaborationInfo;

  /** Metadata */
  createdAt: string;
  updatedAt: string;
  duration: number; // Total duration in seconds
}

export interface Timeline {
  /** Unique ID */
  id: string;

  /** All tracks in the timeline */
  tracks: Track[];

  /** Playhead position in seconds */
  playhead: number;

  /** Zoom level (1 = 100%) */
  zoom: number;

  /** Scroll position */
  scrollX: number;

  /** Markers/chapters */
  markers: TimelineMarker[];

  /** Sections/parts (AI-detected or manual) */
  sections: TimelineSection[];

  /** Frame rate */
  fps: number;

  /** Total duration in seconds */
  duration: number;
}

export interface ProjectSettings {
  /** Output resolution */
  resolution: Resolution;

  /** Frame rate */
  fps: 24 | 25 | 30 | 50 | 60 | 120;

  /** Aspect ratio preset */
  aspectRatio: AspectRatioPreset;

  /** Audio settings */
  audio: {
    sampleRate: 44100 | 48000 | 96000;
    bitDepth: 16 | 24 | 32;
    channels: "mono" | "stereo" | "5.1" | "7.1";
  };

  /** Color space */
  colorSpace: "sRGB" | "Rec709" | "Rec2020" | "DCI-P3" | "ACEScg";

  /** HDR mode */
  hdr: boolean;
  hdrFormat?: "HDR10" | "HDR10+" | "Dolby Vision" | "HLG";
}

export type Resolution =
  | "720p"      // 1280x720
  | "1080p"     // 1920x1080
  | "2k"        // 2048x1080
  | "1440p"     // 2560x1440
  | "4k"        // 3840x2160
  | "4k_dci"    // 4096x2160
  | "8k";       // 7680x4320

export type AspectRatioPreset =
  | "16:9"      // HD/YouTube
  | "9:16"      // Vertical/TikTok/Reels
  | "1:1"       // Square/Instagram
  | "4:3"       // Classic
  | "21:9"      // Ultrawide
  | "2.35:1"    // Cinemascope
  | "2.76:1"    // Ultra Panavision
  | "4:5";      // Instagram Portrait

// ============================================
// TRACKS
// ============================================

export type TrackType = "video" | "audio" | "subtitle" | "effect" | "ai_layer";

export interface Track {
  id: string;
  name: string;
  type: TrackType;

  /** Track items/clips */
  items: TrackItem[];

  /** Is track locked */
  locked: boolean;

  /** Is track visible/audible */
  enabled: boolean;

  /** Is track muted (audio only) */
  muted?: boolean;

  /** Is track solo (audio only) */
  solo?: boolean;

  /** Track volume (audio only, 0-2) */
  volume?: number;

  /** Track opacity (video only, 0-1) */
  opacity?: number;

  /** Blend mode (video only) */
  blendMode?: BlendMode;

  /** Track color for UI */
  color: string;

  /** Track height in UI */
  height: number;

  /** Z-index for stacking */
  zIndex: number;
}

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color_dodge"
  | "color_burn"
  | "hard_light"
  | "soft_light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity";

// ============================================
// TRACK ITEMS (CLIPS)
// ============================================

export interface TrackItem {
  id: string;
  trackId: string;
  type: TrackType;

  /** Position on timeline in seconds */
  startTime: number;

  /** Duration in seconds */
  duration: number;

  /** Source asset ID */
  assetId: string;

  /** Trim in/out points from source (seconds) */
  trimIn: number;
  trimOut: number;

  /** Speed factor (1 = normal, 2 = 2x fast, 0.5 = slow-mo) */
  speed: number;

  /** Is reversed */
  reversed: boolean;

  /** Applied effects */
  effects: Effect[];

  /** Transitions */
  transitionIn?: Transition;
  transitionOut?: Transition;

  /** Keyframes for animation */
  keyframes: Keyframe[];

  /** AI-generated metadata */
  aiMetadata?: ClipAIMetadata;

  /** Locked from editing */
  locked: boolean;

  /** Custom label */
  label?: string;

  /** Color for UI */
  color?: string;
}

export interface VideoTrackItem extends TrackItem {
  type: "video";

  /** Position and scale */
  transform: Transform;

  /** Crop settings */
  crop?: CropSettings;

  /** Color correction */
  colorCorrection?: ColorCorrection;

  /** Mask */
  mask?: MaskSettings;
}

export interface AudioTrackItem extends TrackItem {
  type: "audio";

  /** Volume envelope */
  volumeEnvelope: VolumeKeyframe[];

  /** Pan (-1 = left, 0 = center, 1 = right) */
  pan: number;

  /** Audio effects */
  audioEffects: AudioEffect[];

  /** Beat markers (AI-detected) */
  beatMarkers?: BeatMarker[];

  /** Waveform data for visualization */
  waveform?: number[];
}

export interface SubtitleTrackItem extends TrackItem {
  type: "subtitle";

  /** Subtitle text */
  text: string;

  /** Text styling */
  style: SubtitleStyle;

  /** Position */
  position: { x: number; y: number };

  /** Animation */
  animation?: SubtitleAnimation;
}

// ============================================
// TRANSFORMS & EFFECTS
// ============================================

export interface Transform {
  /** Position (normalized 0-1 where 0.5 is center) */
  x: number;
  y: number;

  /** Scale (1 = 100%) */
  scaleX: number;
  scaleY: number;

  /** Rotation in degrees */
  rotation: number;

  /** Anchor point (normalized 0-1) */
  anchorX: number;
  anchorY: number;

  /** Opacity (0-1) */
  opacity: number;
}

export interface CropSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
  feather: number;
}

export interface ColorCorrection {
  /** Basic adjustments */
  exposure: number;       // -2 to 2
  contrast: number;       // -1 to 1
  saturation: number;     // 0 to 2
  vibrance: number;       // -1 to 1
  temperature: number;    // -100 to 100
  tint: number;           // -100 to 100

  /** Tone curve */
  curves?: {
    rgb?: number[][];
    red?: number[][];
    green?: number[][];
    blue?: number[][];
  };

  /** Color wheels */
  shadows?: { r: number; g: number; b: number };
  midtones?: { r: number; g: number; b: number };
  highlights?: { r: number; g: number; b: number };

  /** LUT */
  lut?: string;

  /** Vignette */
  vignette?: {
    amount: number;
    feather: number;
    roundness: number;
  };
}

export interface MaskSettings {
  type: "rectangle" | "ellipse" | "polygon" | "bezier" | "ai_subject" | "ai_background";
  points?: { x: number; y: number }[];
  feather: number;
  invert: boolean;

  /** For AI masks */
  aiPrompt?: string;
}

// ============================================
// EFFECTS
// ============================================

export interface Effect {
  id: string;
  type: EffectType;
  name: string;
  enabled: boolean;
  parameters: Record<string, number | string | boolean>;
  keyframes?: Keyframe[];
}

export type EffectType =
  // Visual
  | "blur"
  | "sharpen"
  | "noise"
  | "grain"
  | "glow"
  | "vignette"
  | "chromatic_aberration"
  | "lens_distortion"
  | "motion_blur"

  // Color
  | "color_grade"
  | "lut"
  | "black_white"
  | "sepia"
  | "invert"

  // Stylize
  | "posterize"
  | "pixelate"
  | "glitch"
  | "vhs"
  | "film_grain"
  | "halftone"
  | "comic"
  | "oil_painting"

  // Generate
  | "particles"
  | "light_rays"
  | "lens_flare"
  | "bokeh"
  | "fog"
  | "rain"
  | "snow"
  | "fire"

  // AI
  | "ai_background_remove"
  | "ai_style_transfer"
  | "ai_face_enhance"
  | "ai_super_resolution"
  | "ai_object_remove"
  | "ai_sky_replace"
  | "ai_color_match"
  | "ai_motion_interpolation"
  | "ai_stabilization";

// ============================================
// TRANSITIONS
// ============================================

export interface Transition {
  id: string;
  type: TransitionType;
  duration: number; // seconds
  easing: EasingType;
  parameters?: Record<string, number | string>;
}

export type TransitionType =
  | "cut"
  | "fade"
  | "cross_dissolve"
  | "wipe_left"
  | "wipe_right"
  | "wipe_up"
  | "wipe_down"
  | "iris_open"
  | "iris_close"
  | "slide_left"
  | "slide_right"
  | "slide_up"
  | "slide_down"
  | "zoom_in"
  | "zoom_out"
  | "spin"
  | "flip_horizontal"
  | "flip_vertical"
  | "cube"
  | "page_curl"
  | "ripple"
  | "morph"
  | "glitch_transition"
  | "light_leak"
  | "film_burn";

export type EasingType =
  | "linear"
  | "ease_in"
  | "ease_out"
  | "ease_in_out"
  | "ease_in_quad"
  | "ease_out_quad"
  | "ease_in_cubic"
  | "ease_out_cubic"
  | "ease_in_expo"
  | "ease_out_expo"
  | "bounce"
  | "elastic"
  | "back";

// ============================================
// KEYFRAMES & ANIMATION
// ============================================

export interface Keyframe {
  id: string;
  time: number; // seconds from item start
  property: string;
  value: number | string | boolean | Transform;
  easing: EasingType;
}

export interface VolumeKeyframe {
  time: number;
  volume: number; // 0-2
  easing: EasingType;
}

// ============================================
// AUDIO
// ============================================

export interface AudioEffect {
  id: string;
  type: AudioEffectType;
  enabled: boolean;
  parameters: Record<string, number | string | boolean>;
}

export type AudioEffectType =
  | "eq"
  | "compressor"
  | "limiter"
  | "gate"
  | "reverb"
  | "delay"
  | "chorus"
  | "flanger"
  | "phaser"
  | "distortion"
  | "pitch_shift"
  | "noise_reduction"
  | "de_esser"
  | "ducking"
  | "ai_voice_enhance"
  | "ai_noise_remove"
  | "ai_music_separate";

export interface BeatMarker {
  time: number;
  type: "beat" | "downbeat" | "bass" | "drop" | "vocals" | "break";
  intensity: number; // 0-1
}

// ============================================
// SUBTITLES
// ============================================

export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: { x: number; y: number };
  textAlign: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
}

export type SubtitleAnimation =
  | "none"
  | "fade"
  | "typewriter"
  | "word_by_word"
  | "bounce"
  | "slide_up"
  | "karaoke";

// ============================================
// AI FEATURES
// ============================================

export interface ClipAIMetadata {
  /** Detected scene type */
  sceneType?: string;

  /** Detected emotions */
  emotions?: { emotion: string; confidence: number }[];

  /** Detected faces */
  faces?: {
    id: string;
    boundingBox: { x: number; y: number; width: number; height: number };
    characterId?: string;
  }[];

  /** Detected objects */
  objects?: {
    label: string;
    confidence: number;
    boundingBox: { x: number; y: number; width: number; height: number };
  }[];

  /** Speech transcription */
  transcription?: {
    text: string;
    words: { word: string; start: number; end: number; confidence: number }[];
    language: string;
  };

  /** Quality assessment */
  quality?: {
    sharpness: number;
    exposure: number;
    noise: number;
    overallScore: number;
  };

  /** Motion analysis */
  motion?: {
    averageMotion: number;
    cameraMovement: string;
    sceneChanges: number[];
  };
}

export interface ProjectAnalysis {
  /** Scene breakdown */
  scenes: SceneAnalysis[];

  /** Story structure */
  storyStructure?: {
    intro: { start: number; end: number };
    rising: { start: number; end: number };
    climax: { start: number; end: number };
    falling: { start: number; end: number };
    resolution: { start: number; end: number };
  };

  /** Pacing analysis */
  pacing: {
    averageShotLength: number;
    fastestSection: { start: number; end: number; avgLength: number };
    slowestSection: { start: number; end: number; avgLength: number };
    suggestedCuts: number[];
  };

  /** Audio sync analysis */
  audioSync?: {
    beats: BeatMarker[];
    suggestedCuts: { time: number; reason: string }[];
    energyCurve: number[];
  };
}

export interface SceneAnalysis {
  id: string;
  start: number;
  end: number;
  type: string;
  mood: string;
  dominantColors: string[];
  keyCharacters: string[];
  summary?: string;
}

// ============================================
// TIMELINE MARKERS & SECTIONS
// ============================================

export interface TimelineMarker {
  id: string;
  time: number;
  label: string;
  color: string;
  type: "chapter" | "note" | "todo" | "sync_point" | "beat";
}

export interface TimelineSection {
  id: string;
  name: string;
  start: number;
  end: number;
  color: string;
  type: "intro" | "verse" | "chorus" | "bridge" | "outro" | "scene" | "act" | "custom";
  aiGenerated: boolean;
}

// ============================================
// ASSETS
// ============================================

export interface AssetLibrary {
  videos: VideoAsset[];
  images: ImageAsset[];
  audio: AudioAsset[];
  fonts: FontAsset[];
  luts: LUTAsset[];
  presets: PresetAsset[];
}

export interface BaseAsset {
  id: string;
  name: string;
  path: string;
  size: number; // bytes
  createdAt: string;
  tags?: string[];
  favorite?: boolean;
}

export interface VideoAsset extends BaseAsset {
  type: "video";
  duration: number;
  resolution: { width: number; height: number };
  fps: number;
  codec: string;
  hasAudio: boolean;
  thumbnail?: string;
  aiMetadata?: ClipAIMetadata;
}

export interface ImageAsset extends BaseAsset {
  type: "image";
  resolution: { width: number; height: number };
  format: "jpg" | "png" | "webp" | "tiff" | "raw";
  thumbnail?: string;
}

export interface AudioAsset extends BaseAsset {
  type: "audio";
  duration: number;
  sampleRate: number;
  channels: number;
  codec: string;
  waveform?: number[];
  beatMarkers?: BeatMarker[];
}

export interface FontAsset extends BaseAsset {
  type: "font";
  family: string;
  weight: number[];
  style: ("normal" | "italic")[];
}

export interface LUTAsset extends BaseAsset {
  type: "lut";
  format: "cube" | "3dl" | "csp";
  size: number; // LUT resolution (e.g., 33 for 33x33x33)
  preview?: string;
}

export interface PresetAsset extends BaseAsset {
  type: "preset";
  category: "color" | "effect" | "transition" | "audio" | "text";
  data: Record<string, unknown>;
  preview?: string;
}

// ============================================
// EDIT HISTORY
// ============================================

export interface EditHistory {
  undoStack: EditAction[];
  redoStack: EditAction[];
  maxHistory: number;
}

export interface EditAction {
  id: string;
  type: EditActionType;
  timestamp: string;
  data: {
    before: unknown;
    after: unknown;
  };
  description: string;
}

export type EditActionType =
  | "add_item"
  | "remove_item"
  | "move_item"
  | "trim_item"
  | "split_item"
  | "merge_items"
  | "add_effect"
  | "remove_effect"
  | "modify_effect"
  | "add_keyframe"
  | "remove_keyframe"
  | "modify_keyframe"
  | "add_track"
  | "remove_track"
  | "modify_track"
  | "add_transition"
  | "remove_transition"
  | "modify_settings"
  | "batch_edit";

// ============================================
// COLLABORATION
// ============================================

export interface CollaborationInfo {
  ownerId: string;
  collaborators: Collaborator[];
  shareLink?: string;
  lastSync: string;
  version: number;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
  lastActive: string;
  color: string; // For cursor/selection color
}
