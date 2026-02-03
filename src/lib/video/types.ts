/**
 * MOOSTIK Video Generation Types
 * SOTA I2V Models on Replicate - February 2026
 *
 * Based on comprehensive benchmarks (Artificial Analysis Video Arena):
 * - Kling 2.5 Turbo Pro (Kuaishou) - 1.7M runs, #1 most used
 * - Kling 2.6 Pro (Kuaishou) - Motion control, native audio
 * - Veo 3.1/3 (Google) - Best physics, context-aware audio
 * - Wan 2.2/2.5 (Alibaba) - Best value, 6.8M runs on I2V
 * - Hailuo 2.3 (MiniMax) - Dance, expressions, NCR architecture
 * - Luma Ray Flash 2 - Natural physics, interpolation
 * - Sora 2/2 Pro (OpenAI) - Long duration
 * - Seedance 1 Pro (ByteDance) - 614K runs, lip-sync
 * - PixVerse v4 - Camera control, stylized content
 *
 * Note: Kling O1 and Runway Gen-4.5 are NOT on Replicate
 * (available only via their native APIs)
 */

// ============================================
// VIDEO PROVIDER CONFIGURATION
// ============================================

export type VideoProvider =
  // Wan (Alibaba) - Budget & Standard
  | "wan-2.2"           // 6.8M runs - Most popular I2V on Replicate
  | "wan-2.2-fast"      // wan-video/wan-2.2-i2v-fast
  | "wan-2.5"           // wan-video/wan-2.5-i2v
  | "wan-2.5-fast"      // wan-video/wan-2.5-i2v-fast
  // Kling (Kuaishou) - Premium
  | "kling-2.5-turbo"   // 1.7M runs - kwaivgi/kling-v2.5-turbo-pro
  | "kling-2.6"         // kwaivgi/kling-v2.6 - Native audio
  // Google Veo - Premium
  | "veo-3"             // google/veo-3 - Full quality
  | "veo-3-fast"        // google/veo-3-fast - Faster, cheaper
  | "veo-3.1"           // google/veo-3.1 - Latest with last frame
  | "veo-3.1-fast"      // google/veo-3.1-fast - Best physics + speed
  | "veo-2"             // google/veo-2 - Previous gen
  // MiniMax Hailuo - Premium
  | "hailuo-2.3"        // minimax/hailuo-2.3 - NCR architecture
  | "hailuo-2.3-fast"   // minimax/hailuo-2.3-fast - I2V optimized
  // Luma Ray - Standard
  | "luma-ray-flash-2"  // luma/ray-flash-2-720p - Interpolation
  // Lightricks - Budget
  | "ltx-2"             // lightricks/ltx-video-2 - Open source 4K
  // OpenAI Sora - Premium
  | "sora-2"            // openai/sora-2 - Long duration
  | "sora-2-pro"        // openai/sora-2-pro - Premium quality
  // Tencent Hunyuan - Standard
  | "hunyuan-1.5"       // wavespeedai/hunyuan-video-fast
  // PixVerse - Budget
  | "pixverse-4"        // pixverse/pixverse-v4 - Camera control
  // ByteDance Seedance - Premium
  | "seedance-1-pro"    // bytedance/seedance-1-pro-fast - 614K runs
  | "seedance-1-lite";  // Budget option

export type ProviderTier = "budget" | "standard" | "premium" | "local";

export interface VideoProviderConfig {
  provider: VideoProvider;
  tier: ProviderTier;
  replicateModel: string; // Replicate model identifier
  apiKey?: string; // For non-Replicate providers
  baseUrl?: string;
  maxConcurrent: number;
  timeoutMs: number;
  capabilities: VideoCapabilities;
  pricing: VideoPricing;
}

export interface VideoCapabilities {
  maxDurationSeconds: number;
  minDurationSeconds: number;
  supportedResolutions: VideoResolution[];
  supportedAspectRatios: AspectRatio[];
  supportsImageToVideo: boolean;
  supportsTextToVideo: boolean;
  supportsVideoToVideo: boolean;
  supportsInterpolation: boolean; // Start + end frame
  supportsAudio: boolean;
  supportsLipSync: boolean;
  supportsCameraControl: boolean;
  supportsMotionBrush: boolean;
  supportsMotionTransfer: boolean;
  fps: number[];
  strengths: string[];
  weaknesses: string[];
}

export interface VideoPricing {
  costPerSecond: number; // USD
  costPer5sVideo: number;
  minimumCost: number;
  currency: "USD";
}

// ============================================
// VIDEO GENERATION PARAMETERS
// ============================================

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "21:9" | "3:4";
export type VideoResolution = "480p" | "540p" | "720p" | "768p" | "1080p" | "2k" | "4k";
export type VideoQuality = "draft" | "standard" | "high" | "cinematic";

export interface CameraMotion {
  type: "static" | "pan" | "tilt" | "zoom" | "dolly" | "orbit" | "crane" | "handheld" | "tracking";
  direction?: "left" | "right" | "up" | "down" | "in" | "out" | "clockwise" | "counterclockwise";
  intensity: "subtle" | "moderate" | "dramatic";
  // Kling 2.6 specific: -10 to 10 for each axis
  klingConfig?: {
    horizontal?: number;
    vertical?: number;
    zoom?: number;
    tilt?: number;
    pan?: number;
    roll?: number;
  };
}

export interface MotionBrush {
  regions: MotionRegion[];
  maxRegions: number; // Kling supports up to 6
}

export interface MotionRegion {
  id: string;
  type: "animate" | "static" | "remove";
  mask: string; // Base64 mask or URL
  motionPath?: { x: number; y: number }[]; // Path points
  motionVector?: { x: number; y: number };
  intensity?: number; // 0-1
}

export interface MotionTransfer {
  referenceVideoUrl: string;
  preserveAppearance: boolean;
  transferFace: boolean;
  transferBody: boolean;
  transferHands: boolean;
}

export interface VideoGenerationInput {
  // Source
  sourceType: "text" | "image" | "video";
  prompt: string;
  negativePrompt?: string;

  // Image source (for img2vid)
  sourceImage?: string; // URL or base64
  endImage?: string; // For interpolation (Luma Ray Flash 2)

  // Video source (for vid2vid / motion transfer)
  sourceVideo?: string;
  motionTransfer?: MotionTransfer;

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

  // Audio (Wan 2.5+, Kling 2.6, Veo 3.1)
  generateAudio?: boolean;
  audioPrompt?: string;

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
  | "starting"
  | "processing"
  | "rendering"
  | "completed"
  | "failed"
  | "cancelled";

export interface VideoGenerationOutput {
  id: string;
  provider: VideoProvider;
  replicateId?: string; // Replicate prediction ID
  status: VideoStatus;
  progress?: number; // 0-100

  // Result
  videoUrl?: string;
  audioUrl?: string; // If separate audio track
  thumbnailUrl?: string;
  localPath?: string;

  // Metadata
  durationSeconds?: number;
  resolution?: VideoResolution;
  fps?: number;
  fileSize?: number;
  hasAudio?: boolean;

  // Timing
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedTimeMs?: number;
  actualProcessingMs?: number;

  // Error
  error?: VideoError;

  // Cost tracking
  costUsd?: number;
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
  variationId: string;

  // Generation
  provider: VideoProvider;
  input: VideoGenerationInput;
  output?: VideoGenerationOutput;

  // Animation specifics
  animationType: AnimationType;
  cameraWork: CameraMotion;

  // Character animation
  characterAnimations?: CharacterAnimation[];

  // Lip sync
  lipSyncRequired: boolean;
  lipSyncStatus?: "pending" | "processing" | "completed" | "failed";
  lipSyncVideoUrl?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export type AnimationType =
  | "subtle"
  | "dialogue"
  | "action"
  | "transition"
  | "establishing"
  | "emotional"
  | "combat"
  | "death"
  | "flashback"
  | "dance"
  | "walking"
  | "flying";

export interface CharacterAnimation {
  characterId: string;
  animationType: "idle" | "talking" | "walking" | "running" | "fighting" | "dying" | "emotional" | "dancing" | "flying";
  emotion?: string;
  intensity: number;
  keyframes?: AnimationKeyframe[];
}

export interface AnimationKeyframe {
  timestamp: number;
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
  preferredProvider?: VideoProvider;
  fallbackProviders?: VideoProvider[];
  budgetMaxUsd?: number;
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
  requiresLipSync?: boolean;
  preferredProvider?: VideoProvider;
}

export interface BatchVideoProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  currentShot?: string;
  estimatedRemainingMs?: number;
  totalCostUsd: number;
}

export interface BatchVideoResult {
  episodeId: string;
  videos: ShotVideo[];
  stats: {
    total: number;
    completed: number;
    failed: number;
    totalDurationSeconds: number;
    totalCostUsd: number;
    processingTimeMs: number;
    providersUsed: VideoProvider[];
  };
}

// ============================================
// SOTA PROVIDER CONFIGURATIONS - FEBRUARY 2026
// ============================================

export const REPLICATE_MODELS: Record<VideoProvider, string> = {
  // ============================================
  // WAN (Alibaba) - Best Value, Open Source
  // ============================================
  "wan-2.2": "wan-video/wan-2.2-i2v",             // Standard I2V
  "wan-2.2-fast": "wan-video/wan-2.2-i2v-fast",   // 6.8M runs - MOST POPULAR I2V
  "wan-2.5": "wan-video/wan-2.5-i2v",             // 181.6K runs - Audio support
  "wan-2.5-fast": "wan-video/wan-2.5-i2v-fast",   // 49.2K runs - Speed optimized

  // ============================================
  // KLING (Kuaishou) - Premium Cinematic
  // ============================================
  "kling-2.5-turbo": "kwaivgi/kling-v2.5-turbo-pro", // 1.7M runs - #1 MOST USED
  "kling-2.6": "kwaivgi/kling-v2.6",              // 92.4K runs - Native audio

  // ============================================
  // GOOGLE VEO - Best Physics & Quality
  // ============================================
  "veo-3": "google/veo-3",                        // 216.2K runs - Full quality
  "veo-3-fast": "google/veo-3-fast",              // 161.4K runs - Faster variant
  "veo-3.1": "google/veo-3.1",                    // 323.8K runs - Last frame support
  "veo-3.1-fast": "google/veo-3.1-fast",          // 354.3K runs - BEST PHYSICS + SPEED
  "veo-2": "google/veo-2",                        // 105.5K runs - Previous gen

  // ============================================
  // MINIMAX HAILUO - Dance & Expressions
  // ============================================
  "hailuo-2.3": "minimax/hailuo-2.3",             // T2V + I2V, NCR architecture
  "hailuo-2.3-fast": "minimax/hailuo-2.3-fast",   // I2V optimized, lower latency

  // ============================================
  // LUMA RAY - Physics & Interpolation
  // ============================================
  "luma-ray-flash-2": "luma/ray-flash-2-720p",    // Start+end frame interpolation

  // ============================================
  // LIGHTRICKS LTX - Open Source 4K
  // ============================================
  "ltx-2": "lightricks/ltx-video-2",              // Open source, can run locally

  // ============================================
  // OPENAI SORA - Long Duration
  // ============================================
  "sora-2": "openai/sora-2",                      // 198.7K runs - Up to 35s
  "sora-2-pro": "openai/sora-2-pro",              // 78.6K runs - Premium quality

  // ============================================
  // TENCENT HUNYUAN - Open Source 13B
  // ============================================
  "hunyuan-1.5": "wavespeedai/hunyuan-video-fast", // 13B params, fast variant

  // ============================================
  // PIXVERSE - Camera Control
  // ============================================
  "pixverse-4": "pixverse/pixverse-v4",           // 20+ camera presets

  // ============================================
  // BYTEDANCE SEEDANCE - Lip-Sync
  // ============================================
  "seedance-1-pro": "bytedance/seedance-1-pro-fast", // 613.9K runs - Multilingual lip-sync
  "seedance-1-lite": "bytedance/seedance-1-lite", // Budget variant
};

export const PROVIDER_CONFIGS: Record<VideoProvider, VideoProviderConfig> = {
  // ============================================
  // BUDGET TIER - Fast & Cheap ($0.02-0.09/5s)
  // ============================================

  "wan-2.2": {
    provider: "wan-2.2",
    tier: "budget",
    replicateModel: "wan-video/wan-2.2-i2v",
    maxConcurrent: 5,
    timeoutMs: 180000,
    capabilities: {
      maxDurationSeconds: 5,
      minDurationSeconds: 2,
      supportedResolutions: ["480p", "720p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: false,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["Standard I2V", "Good for prototyping"],
      weaknesses: ["Lower resolution", "No audio"],
    },
    pricing: {
      costPerSecond: 0.020,
      costPer5sVideo: 0.10,
      minimumCost: 0.10,
      currency: "USD",
    },
  },

  "wan-2.2-fast": {
    provider: "wan-2.2-fast",
    tier: "budget",
    replicateModel: "wan-video/wan-2.2-i2v-fast",
    maxConcurrent: 8,
    timeoutMs: 120000,
    capabilities: {
      maxDurationSeconds: 5,
      minDurationSeconds: 2,
      supportedResolutions: ["480p", "720p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: false,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["6.8M runs - MOST POPULAR", "Very fast (39s for 5s)", "Cheapest option"],
      weaknesses: ["Lower resolution", "No audio", "Limited motion control"],
    },
    pricing: {
      costPerSecond: 0.017,
      costPer5sVideo: 0.086,
      minimumCost: 0.086,
      currency: "USD",
    },
  },

  "ltx-2": {
    provider: "ltx-2",
    tier: "budget",
    replicateModel: "lightricks/ltx-video-2",
    maxConcurrent: 3,
    timeoutMs: 300000,
    capabilities: {
      maxDurationSeconds: 20,
      minDurationSeconds: 2,
      supportedResolutions: ["720p", "1080p", "4k"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: true,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24, 30, 50],
      strengths: ["Open source", "4K native", "Audio sync", "Can run locally on RTX 4090"],
      weaknesses: ["Newer, less tested", "Requires powerful GPU for local"],
    },
    pricing: {
      costPerSecond: 0.017,
      costPer5sVideo: 0.086,
      minimumCost: 0.086,
      currency: "USD",
    },
  },

  "pixverse-4": {
    provider: "pixverse-4",
    tier: "budget",
    replicateModel: "pixverse/pixverse-v4",
    maxConcurrent: 5,
    timeoutMs: 180000,
    capabilities: {
      maxDurationSeconds: 8,
      minDurationSeconds: 3,
      supportedResolutions: ["540p", "720p", "1080p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1", "4:3"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: false,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["20+ camera controls", "Fast", "Good for stylized content"],
      weaknesses: ["Limited duration", "No audio"],
    },
    pricing: {
      costPerSecond: 0.06,
      costPer5sVideo: 0.30,
      minimumCost: 0.30,
      currency: "USD",
    },
  },

  "seedance-1-lite": {
    provider: "seedance-1-lite",
    tier: "budget",
    replicateModel: "bytedance/seedance-1-lite",
    maxConcurrent: 5,
    timeoutMs: 180000,
    capabilities: {
      maxDurationSeconds: 10,
      minDurationSeconds: 5,
      supportedResolutions: ["480p", "720p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: false,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["Very cheap", "Fast", "Good quality/price ratio"],
      weaknesses: ["No audio", "Lower resolution"],
    },
    pricing: {
      costPerSecond: 0.03,
      costPer5sVideo: 0.15,
      minimumCost: 0.15,
      currency: "USD",
    },
  },

  // ============================================
  // STANDARD TIER - Balanced ($0.15-0.50/5s)
  // ============================================

  "wan-2.5": {
    provider: "wan-2.5",
    tier: "standard",
    replicateModel: "wan-video/wan-2.5-i2v",
    maxConcurrent: 3,
    timeoutMs: 300000,
    capabilities: {
      maxDurationSeconds: 10,
      minDurationSeconds: 3,
      supportedResolutions: ["480p", "720p", "1080p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: true,
      supportsLipSync: true,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["181.6K runs", "One-pass A/V sync", "Lip-sync native", "6 aspect ratios", "Best value"],
      weaknesses: ["Slower than 2.2", "Open source limitations"],
    },
    pricing: {
      costPerSecond: 0.042,
      costPer5sVideo: 0.21,
      minimumCost: 0.21,
      currency: "USD",
    },
  },

  "wan-2.5-fast": {
    provider: "wan-2.5-fast",
    tier: "standard",
    replicateModel: "wan-video/wan-2.5-i2v-fast",
    maxConcurrent: 5,
    timeoutMs: 180000,
    capabilities: {
      maxDurationSeconds: 10,
      minDurationSeconds: 3,
      supportedResolutions: ["480p", "720p", "1080p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: true,
      supportsLipSync: true,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["49.2K runs", "Speed-optimized", "Same features as 2.5"],
      weaknesses: ["Slightly lower quality than standard"],
    },
    pricing: {
      costPerSecond: 0.035,
      costPer5sVideo: 0.175,
      minimumCost: 0.175,
      currency: "USD",
    },
  },

  "luma-ray-flash-2": {
    provider: "luma-ray-flash-2",
    tier: "standard",
    replicateModel: "luma/ray-flash-2-720p",
    maxConcurrent: 3,
    timeoutMs: 300000,
    capabilities: {
      maxDurationSeconds: 9,
      minDurationSeconds: 5,
      supportedResolutions: ["540p", "720p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: true,
      supportsAudio: false,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["Start+end frame interpolation", "Natural physics", "Fast (40s for 5s)", "Coherent motion"],
      weaknesses: ["No audio", "Limited resolution"],
    },
    pricing: {
      costPerSecond: 0.08,
      costPer5sVideo: 0.40,
      minimumCost: 0.40,
      currency: "USD",
    },
  },

  "hunyuan-1.5": {
    provider: "hunyuan-1.5",
    tier: "standard",
    replicateModel: "wavespeedai/hunyuan-video-fast",
    maxConcurrent: 2,
    timeoutMs: 600000,
    capabilities: {
      maxDurationSeconds: 5,
      minDurationSeconds: 2,
      supportedResolutions: ["720p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: false,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["13B parameters", "Open source", "Good motion quality", "Text alignment"],
      weaknesses: ["Requires 60-80GB VRAM for local", "Slower"],
    },
    pricing: {
      costPerSecond: 0.06,
      costPer5sVideo: 0.30,
      minimumCost: 0.30,
      currency: "USD",
    },
  },

  "veo-2": {
    provider: "veo-2",
    tier: "standard",
    replicateModel: "google/veo-2",
    maxConcurrent: 3,
    timeoutMs: 400000,
    capabilities: {
      maxDurationSeconds: 8,
      minDurationSeconds: 4,
      supportedResolutions: ["720p", "1080p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: true,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["105.5K runs", "Good physics", "Reliable", "Previous gen Veo"],
      weaknesses: ["Superseded by Veo 3/3.1", "Less features"],
    },
    pricing: {
      costPerSecond: 0.10,
      costPer5sVideo: 0.50,
      minimumCost: 0.50,
      currency: "USD",
    },
  },

  "veo-3-fast": {
    provider: "veo-3-fast",
    tier: "standard",
    replicateModel: "google/veo-3-fast",
    maxConcurrent: 3,
    timeoutMs: 300000,
    capabilities: {
      maxDurationSeconds: 8,
      minDurationSeconds: 4,
      supportedResolutions: ["720p", "1080p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: true,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["161.4K runs", "Good balance speed/quality", "Context-aware audio"],
      weaknesses: ["Less features than 3.1"],
    },
    pricing: {
      costPerSecond: 0.12,
      costPer5sVideo: 0.60,
      minimumCost: 0.60,
      currency: "USD",
    },
  },

  "veo-3.1-fast": {
    provider: "veo-3.1-fast",
    tier: "standard",
    replicateModel: "google/veo-3.1-fast",
    maxConcurrent: 3,
    timeoutMs: 300000,
    capabilities: {
      maxDurationSeconds: 8,
      minDurationSeconds: 4,
      supportedResolutions: ["720p", "1080p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: true,
      supportsAudio: true,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["354.3K runs - MOST POPULAR VEO", "Best physics", "Context-aware audio", "First/Last frame support"],
      weaknesses: ["Limited to 720p-1080p"],
    },
    pricing: {
      costPerSecond: 0.15,
      costPer5sVideo: 0.75,
      minimumCost: 0.75,
      currency: "USD",
    },
  },

  "hailuo-2.3-fast": {
    provider: "hailuo-2.3-fast",
    tier: "standard",
    replicateModel: "minimax/hailuo-2.3-fast",
    maxConcurrent: 3,
    timeoutMs: 240000,
    capabilities: {
      maxDurationSeconds: 10,
      minDurationSeconds: 6,
      supportedResolutions: ["768p", "1080p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: false,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [25],
      strengths: ["Lower latency I2V", "Same motion quality as standard", "Fast iteration"],
      weaknesses: ["No audio", "25fps only"],
    },
    pricing: {
      costPerSecond: 0.05,
      costPer5sVideo: 0.25,
      minimumCost: 0.25,
      currency: "USD",
    },
  },

  // ============================================
  // PREMIUM TIER - High Quality ($0.40-1.75/5s)
  // ============================================

  "kling-2.5-turbo": {
    provider: "kling-2.5-turbo",
    tier: "premium",
    replicateModel: "kwaivgi/kling-v2.5-turbo-pro",
    maxConcurrent: 3,
    timeoutMs: 500000,
    capabilities: {
      maxDurationSeconds: 10,
      minDurationSeconds: 5,
      supportedResolutions: ["1080p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: true,
      supportsInterpolation: false,
      supportsAudio: false,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: true,
      supportsMotionTransfer: true,
      fps: [24, 30],
      strengths: [
        "1.7M runs - #1 MOST USED",
        "Smooth motion, cinematic depth",
        "Remarkable prompt adherence",
        "Motion brush (6 regions)",
      ],
      weaknesses: ["No native audio (use 2.6 for audio)"],
    },
    pricing: {
      costPerSecond: 0.08,
      costPer5sVideo: 0.40,
      minimumCost: 0.40,
      currency: "USD",
    },
  },

  "kling-2.6": {
    provider: "kling-2.6",
    tier: "premium",
    replicateModel: "kwaivgi/kling-v2.6",
    maxConcurrent: 3,
    timeoutMs: 600000,
    capabilities: {
      maxDurationSeconds: 10,
      minDurationSeconds: 5,
      supportedResolutions: ["1080p", "4k"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: true,
      supportsInterpolation: false,
      supportsAudio: true,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: true,
      supportsMotionTransfer: true,
      fps: [24, 30],
      strengths: [
        "92.4K runs",
        "Native audio generation",
        "Motion brush (6 regions)",
        "Motion transfer from video",
        "4K native",
        "Advanced physics engine",
      ],
      weaknesses: ["Higher cost", "Longer processing"],
    },
    pricing: {
      costPerSecond: 0.095,
      costPer5sVideo: 0.475,
      minimumCost: 0.475,
      currency: "USD",
    },
  },

  "veo-3": {
    provider: "veo-3",
    tier: "premium",
    replicateModel: "google/veo-3",
    maxConcurrent: 2,
    timeoutMs: 600000,
    capabilities: {
      maxDurationSeconds: 8,
      minDurationSeconds: 4,
      supportedResolutions: ["1080p", "4k"],
      supportedAspectRatios: ["16:9", "9:16", "1:1", "4:3", "21:9"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: true,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: [
        "216.2K runs",
        "Excellent physics simulation",
        "Contextual audio generation",
        "High fidelity",
        "SynthID watermark",
      ],
      weaknesses: ["Premium pricing", "Videos stored 2 days only"],
    },
    pricing: {
      costPerSecond: 0.25,
      costPer5sVideo: 1.25,
      minimumCost: 1.25,
      currency: "USD",
    },
  },

  "veo-3.1": {
    provider: "veo-3.1",
    tier: "premium",
    replicateModel: "google/veo-3.1",
    maxConcurrent: 2,
    timeoutMs: 600000,
    capabilities: {
      maxDurationSeconds: 8,
      minDurationSeconds: 4,
      supportedResolutions: ["1080p", "4k"],
      supportedAspectRatios: ["16:9", "9:16", "1:1", "4:3", "21:9"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: true,
      supportsAudio: true,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: [
        "323.8K runs",
        "BEST physics simulation",
        "Last frame support for chaining",
        "Reference image support",
        "Contextual audio generation",
        "Highest fidelity",
      ],
      weaknesses: ["Expensive", "Videos stored 2 days only"],
    },
    pricing: {
      costPerSecond: 0.35,
      costPer5sVideo: 1.75,
      minimumCost: 1.75,
      currency: "USD",
    },
  },

  "hailuo-2.3": {
    provider: "hailuo-2.3",
    tier: "premium",
    replicateModel: "minimax/hailuo-2.3",
    maxConcurrent: 2,
    timeoutMs: 600000,
    capabilities: {
      maxDurationSeconds: 10,
      minDurationSeconds: 6,
      supportedResolutions: ["768p", "1080p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: false,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [25],
      strengths: [
        "Excellent for dance/complex motion",
        "Micro-expressions",
        "Good anime style",
        "NCR architecture (2.5x efficient)",
        "Real world physics",
      ],
      weaknesses: ["No audio", "25fps only"],
    },
    pricing: {
      costPerSecond: 0.08,
      costPer5sVideo: 0.40,
      minimumCost: 0.40,
      currency: "USD",
    },
  },

  "sora-2": {
    provider: "sora-2",
    tier: "premium",
    replicateModel: "openai/sora-2",
    maxConcurrent: 1,
    timeoutMs: 900000,
    capabilities: {
      maxDurationSeconds: 35,
      minDurationSeconds: 4,
      supportedResolutions: ["720p", "1080p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: true,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["198.7K runs", "LONGEST duration (35s)", "Good realism", "Audio support"],
      weaknesses: [
        "No copyrighted characters",
        "No real human faces",
        "No celebrities",
        "Not available EU/UK/Switzerland",
        "Slower",
      ],
    },
    pricing: {
      costPerSecond: 0.10,
      costPer5sVideo: 0.50,
      minimumCost: 0.50,
      currency: "USD",
    },
  },

  "sora-2-pro": {
    provider: "sora-2-pro",
    tier: "premium",
    replicateModel: "openai/sora-2-pro",
    maxConcurrent: 1,
    timeoutMs: 1200000,
    capabilities: {
      maxDurationSeconds: 35,
      minDurationSeconds: 4,
      supportedResolutions: ["720p", "1080p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: true,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["78.6K runs", "Premium quality", "35s max duration", "Best realism"],
      weaknesses: [
        "Same content restrictions as Sora 2",
        "Higher cost",
        "Very slow",
      ],
    },
    pricing: {
      costPerSecond: 0.15,
      costPer5sVideo: 0.75,
      minimumCost: 0.75,
      currency: "USD",
    },
  },

  "seedance-1-pro": {
    provider: "seedance-1-pro",
    tier: "premium",
    replicateModel: "bytedance/seedance-1-pro-fast",
    maxConcurrent: 2,
    timeoutMs: 600000,
    capabilities: {
      maxDurationSeconds: 12,
      minDurationSeconds: 4,
      supportedResolutions: ["720p", "1080p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: false,
      supportsAudio: true,
      supportsLipSync: true,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["613.9K runs", "Lip-sync 8 languages", "Film-grade cinematography", "Native audio-visual"],
      weaknesses: ["No negative prompts", "Higher cost"],
    },
    pricing: {
      costPerSecond: 0.10,
      costPer5sVideo: 0.50,
      minimumCost: 0.50,
      currency: "USD",
    },
  },
};

// ============================================
// MOOSTIK-SPECIFIC CONFIGURATIONS
// ============================================

/**
 * Recommended providers by animation type for MOOSTIK
 * SOTA February 2026 - Updated with benchmarks
 */
export const MOOSTIK_ANIMATION_PROVIDERS: Record<AnimationType, VideoProvider[]> = {
  // Budget → Standard → Premium recommendations
  subtle: ["wan-2.5", "hailuo-2.3-fast", "ltx-2", "hunyuan-1.5"],
  dialogue: ["seedance-1-pro", "kling-2.6", "wan-2.5"], // Seedance = BEST lip-sync
  action: ["hailuo-2.3", "kling-2.5-turbo", "veo-3.1-fast"],
  transition: ["luma-ray-flash-2", "wan-2.5", "veo-3.1-fast"],
  establishing: ["veo-3.1-fast", "veo-3.1", "luma-ray-flash-2"],
  emotional: ["kling-2.6", "seedance-1-pro", "hailuo-2.3", "veo-3.1-fast"],
  combat: ["hailuo-2.3", "kling-2.5-turbo", "veo-3.1-fast"],
  death: ["veo-3.1-fast", "kling-2.6", "hailuo-2.3"],
  flashback: ["luma-ray-flash-2", "wan-2.5", "veo-3.1-fast"], // First/Last frame
  dance: ["hailuo-2.3", "kling-2.5-turbo", "seedance-1-pro"],
  walking: ["wan-2.5", "wan-2.2-fast", "ltx-2"],
  flying: ["veo-3.1", "veo-3", "kling-2.6"],
};

/**
 * Provider selection by budget tier
 * February 2026 pricing
 */
export const MOOSTIK_BUDGET_TIERS = {
  /** ~$2.32/episode - Prototyping (wan-2.2-fast is MOST POPULAR) */
  prototype: {
    provider: "wan-2.2-fast" as VideoProvider,
    resolution: "480p" as VideoResolution,
    estimatedCostPerEpisode: 2.32, // 27 shots × $0.086
  },
  /** ~$5.67/episode - Draft review */
  draft: {
    provider: "wan-2.5" as VideoProvider,
    resolution: "720p" as VideoResolution,
    estimatedCostPerEpisode: 5.67, // 27 shots × $0.21
  },
  /** ~$10.80/episode - Standard production (kling-2.5-turbo = #1 MOST USED) */
  standard: {
    provider: "kling-2.5-turbo" as VideoProvider,
    resolution: "1080p" as VideoResolution,
    estimatedCostPerEpisode: 10.80, // 27 shots × $0.40
  },
  /** ~$47.25/episode - High quality (veo-3.1 = BEST physics) */
  high: {
    provider: "veo-3.1" as VideoProvider,
    resolution: "4k" as VideoResolution,
    estimatedCostPerEpisode: 47.25, // 27 shots × $1.75
  },
};

/**
 * Scene type to provider mapping for optimal quality
 * February 2026 recommendations based on benchmarks
 */
export const MOOSTIK_SCENE_PROVIDERS: Record<string, VideoProvider> = {
  genocide: "veo-3.1",          // Best physics for death scenes
  survival: "kling-2.5-turbo",  // Motion control for intense scenes
  training: "hailuo-2.3",       // Complex body movements
  bar_scene: "seedance-1-pro",  // Dialogue with lip-sync (8 languages)
  battle: "kling-2.6",          // Motion brush for multi-character
  emotional: "veo-3.1",         // Subtle expressions + audio
  establishing: "luma-ray-flash-2", // Natural camera physics + interpolation
  flashback: "luma-ray-flash-2",// Interpolation for dreamy effect
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get optimal provider for animation type and budget
 */
export function getOptimalProvider(
  animationType: AnimationType,
  budget: keyof typeof MOOSTIK_BUDGET_TIERS
): VideoProvider {
  const budgetConfig = MOOSTIK_BUDGET_TIERS[budget];
  const preferredProviders = MOOSTIK_ANIMATION_PROVIDERS[animationType];

  // If budget provider supports this animation type, use it
  if (preferredProviders.includes(budgetConfig.provider)) {
    return budgetConfig.provider;
  }

  // Otherwise, find cheapest provider that supports this animation
  const configs = preferredProviders.map((p) => PROVIDER_CONFIGS[p]);
  configs.sort((a, b) => a.pricing.costPer5sVideo - b.pricing.costPer5sVideo);

  return configs[0]?.provider || budgetConfig.provider;
}

/**
 * Calculate episode generation cost
 */
export function calculateEpisodeCost(
  shotCount: number,
  durationPerShot: number,
  provider: VideoProvider
): number {
  const config = PROVIDER_CONFIGS[provider];
  return shotCount * config.pricing.costPerSecond * durationPerShot;
}

/**
 * Get provider fallback chain based on capabilities needed
 */
export function getProviderFallbackChain(
  requirements: Partial<VideoCapabilities>
): VideoProvider[] {
  const providers = Object.entries(PROVIDER_CONFIGS)
    .filter(([, config]) => {
      const caps = config.capabilities;
      if (requirements.supportsAudio && !caps.supportsAudio) return false;
      if (requirements.supportsLipSync && !caps.supportsLipSync) return false;
      if (requirements.supportsMotionBrush && !caps.supportsMotionBrush) return false;
      if (requirements.supportsMotionTransfer && !caps.supportsMotionTransfer) return false;
      if (requirements.supportsInterpolation && !caps.supportsInterpolation) return false;
      return true;
    })
    .sort((a, b) => a[1].pricing.costPer5sVideo - b[1].pricing.costPer5sVideo);

  return providers.map(([provider]) => provider as VideoProvider);
}
