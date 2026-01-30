/**
 * MOOSTIK Video Generation Types
 * Supports multiple SOTA video generation providers (January 2026)
 */

// ============================================
// VIDEO PROVIDER CONFIGURATION
// ============================================

export type VideoProvider = "kling" | "runway" | "luma" | "pika" | "minimax" | "sora";

export interface VideoProviderConfig {
  provider: VideoProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
  maxConcurrent: number;
  timeoutMs: number;
  capabilities: VideoCapabilities;
}

export interface VideoCapabilities {
  maxDurationSeconds: number;
  supportedAspectRatios: AspectRatio[];
  supportsImageToVideo: boolean;
  supportsVideoToVideo: boolean;
  supportsAudio: boolean;
  supportsCameraControl: boolean;
  supportsMotionBrush: boolean;
  maxResolution: VideoResolution;
  fps: number[];
}

// ============================================
// VIDEO GENERATION PARAMETERS
// ============================================

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "21:9";
export type VideoResolution = "720p" | "1080p" | "2k" | "4k";
export type VideoQuality = "draft" | "standard" | "high" | "cinematic";

export interface CameraMotion {
  type: "static" | "pan" | "tilt" | "zoom" | "dolly" | "orbit" | "crane" | "handheld";
  direction?: "left" | "right" | "up" | "down" | "in" | "out" | "clockwise" | "counterclockwise";
  intensity: "subtle" | "moderate" | "dramatic";
  startPosition?: { x: number; y: number; z: number };
  endPosition?: { x: number; y: number; z: number };
}

export interface MotionBrush {
  regions: MotionRegion[];
}

export interface MotionRegion {
  type: "animate" | "static" | "remove";
  mask: string; // Base64 mask or path
  motionVector?: { x: number; y: number };
  intensity?: number;
}

export interface VideoGenerationInput {
  // Source
  sourceType: "text" | "image" | "video";
  prompt: string;
  negativePrompt?: string;

  // Image source (for img2vid)
  sourceImage?: string; // URL or base64
  endImage?: string; // For interpolation

  // Video source (for vid2vid)
  sourceVideo?: string;

  // Parameters
  durationSeconds: number;
  aspectRatio: AspectRatio;
  resolution?: VideoResolution;
  quality?: VideoQuality;
  fps?: number;
  seed?: number;

  // Motion control
  cameraMotion?: CameraMotion;
  motionBrush?: MotionBrush;
  motionIntensity?: number; // 0-1

  // Style
  stylePreset?: string;
  cfgScale?: number;

  // Character consistency
  referenceImages?: string[];
  characterLock?: boolean;

  // Provider-specific
  providerOptions?: Record<string, unknown>;
}

// ============================================
// VIDEO GENERATION OUTPUT
// ============================================

export type VideoStatus =
  | "queued"
  | "processing"
  | "rendering"
  | "completed"
  | "failed"
  | "cancelled";

export interface VideoGenerationOutput {
  id: string;
  provider: VideoProvider;
  status: VideoStatus;
  progress?: number; // 0-100

  // Result
  videoUrl?: string;
  thumbnailUrl?: string;
  localPath?: string;

  // Metadata
  durationSeconds?: number;
  resolution?: VideoResolution;
  fps?: number;
  fileSize?: number;

  // Timing
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedTimeMs?: number;

  // Error
  error?: VideoError;

  // Cost tracking
  creditsUsed?: number;
}

export interface VideoError {
  code: string;
  message: string;
  retryable: boolean;
  details?: unknown;
}

// ============================================
// SHOT VIDEO EXTENSION
// ============================================

export interface ShotVideo {
  id: string;
  shotId: string;
  variationId: string; // Links to image variation used as source

  // Generation
  provider: VideoProvider;
  input: VideoGenerationInput;
  output?: VideoGenerationOutput;

  // Animation specifics
  animationType: AnimationType;
  cameraWork: CameraMotion;

  // Character animation
  characterAnimations?: CharacterAnimation[];

  // Lip sync (if dialogue)
  lipSyncRequired: boolean;
  lipSyncStatus?: "pending" | "processing" | "completed" | "failed";
  lipSyncVideoUrl?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export type AnimationType =
  | "subtle" // Minimal movement, atmospheric
  | "dialogue" // Character speaking
  | "action" // Dynamic movement
  | "transition" // Scene transition
  | "establishing" // Slow camera move
  | "emotional" // Facial expressions focus
  | "combat" // Fast-paced action
  | "death" // Dramatic death scene
  | "flashback"; // Memory/flashback effect

export interface CharacterAnimation {
  characterId: string;
  animationType: "idle" | "talking" | "walking" | "running" | "fighting" | "dying" | "emotional";
  emotion?: string;
  intensity: number; // 0-1
  keyframes?: AnimationKeyframe[];
}

export interface AnimationKeyframe {
  timestamp: number; // seconds
  action: string;
  position?: { x: number; y: number };
}

// ============================================
// BATCH VIDEO GENERATION
// ============================================

export interface BatchVideoRequest {
  shots: ShotVideoRequest[];
  episodeId: string;
  priority?: "low" | "normal" | "high";
  parallelLimit?: number;
  onProgress?: (progress: BatchVideoProgress) => void;
}

export interface ShotVideoRequest {
  shotId: string;
  variationId: string;
  sourceImageUrl: string;
  prompt: string;
  durationSeconds: number;
  cameraMotion?: CameraMotion;
  animationType: AnimationType;
}

export interface BatchVideoProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  currentShot?: string;
  estimatedRemainingMs?: number;
}

export interface BatchVideoResult {
  episodeId: string;
  videos: ShotVideo[];
  stats: {
    total: number;
    completed: number;
    failed: number;
    totalDurationSeconds: number;
    totalCreditsUsed: number;
    processingTimeMs: number;
  };
}

// ============================================
// PROVIDER REGISTRY
// ============================================

export interface VideoProviderRegistry {
  providers: Map<VideoProvider, VideoProviderConfig>;
  defaultProvider: VideoProvider;
  fallbackChain: VideoProvider[];
}

// Default provider configurations (January 2026 SOTA)
export const DEFAULT_PROVIDER_CONFIGS: Record<VideoProvider, Partial<VideoProviderConfig>> = {
  kling: {
    model: "kling-2.6-pro", // Latest as of Jan 2026
    maxConcurrent: 3,
    timeoutMs: 600000, // 10 minutes
    capabilities: {
      maxDurationSeconds: 10,
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsVideoToVideo: true,
      supportsAudio: false,
      supportsCameraControl: true,
      supportsMotionBrush: true,
      maxResolution: "1080p",
      fps: [24, 30],
    },
  },
  runway: {
    model: "gen-4-turbo", // Hypothetical Gen-4
    maxConcurrent: 2,
    timeoutMs: 600000,
    capabilities: {
      maxDurationSeconds: 16,
      supportedAspectRatios: ["16:9", "9:16", "1:1", "4:3", "21:9"],
      supportsImageToVideo: true,
      supportsVideoToVideo: true,
      supportsAudio: true,
      supportsCameraControl: true,
      supportsMotionBrush: true,
      maxResolution: "4k",
      fps: [24, 30, 60],
    },
  },
  luma: {
    model: "dream-machine-2.0",
    maxConcurrent: 3,
    timeoutMs: 300000,
    capabilities: {
      maxDurationSeconds: 5,
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsVideoToVideo: false,
      supportsAudio: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      maxResolution: "1080p",
      fps: [24],
    },
  },
  pika: {
    model: "pika-2.0",
    maxConcurrent: 5,
    timeoutMs: 300000,
    capabilities: {
      maxDurationSeconds: 4,
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsVideoToVideo: true,
      supportsAudio: false,
      supportsCameraControl: true,
      supportsMotionBrush: true,
      maxResolution: "1080p",
      fps: [24],
    },
  },
  minimax: {
    model: "video-01-hd",
    maxConcurrent: 2,
    timeoutMs: 600000,
    capabilities: {
      maxDurationSeconds: 6,
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsVideoToVideo: false,
      supportsAudio: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      maxResolution: "1080p",
      fps: [24, 30],
    },
  },
  sora: {
    model: "sora-1.0", // If available
    maxConcurrent: 1,
    timeoutMs: 900000, // 15 minutes
    capabilities: {
      maxDurationSeconds: 60,
      supportedAspectRatios: ["16:9", "9:16", "1:1", "4:3", "21:9"],
      supportsImageToVideo: true,
      supportsVideoToVideo: true,
      supportsAudio: true,
      supportsCameraControl: true,
      supportsMotionBrush: true,
      maxResolution: "4k",
      fps: [24, 30, 60],
    },
  },
};
