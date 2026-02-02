/**
 * MOOSTIK Video Generation Types
 * SOTA I2V Models on Replicate - January 2026
 *
 * Based on comprehensive analysis of available providers:
 * - Wan 2.2/2.5/2.6 (Alibaba) - Best value, open source
 * - Kling 2.6 Pro (Kuaishou) - Motion control, native audio
 * - Veo 3.1 (Google) - Best quality, physics
 * - Hailuo 2.3 (MiniMax) - Dance, expressions
 * - Luma Ray 2/3 - Natural physics, interpolation
 * - LTX-2 (Lightricks) - Open source 4K
 * - Sora 2 (OpenAI) - Long duration
 * - Hunyuan 1.5 (Tencent) - Open source, 13B params
 */

// ============================================
// VIDEO PROVIDER CONFIGURATION
// ============================================

export type VideoProvider =
  | "wan-2.2"
  | "wan-2.5"
  | "wan-2.6"
  | "kling-2.6"
  | "veo-3.1"
  | "veo-3.1-fast"      // SOTA Janvier 2026 - $0.15/s
  | "hailuo-2.3"
  | "hailuo-2.3-fast"   // SOTA Janvier 2026 - 50% moins cher
  | "luma-ray-2"
  | "luma-ray-3"
  | "ltx-2"
  | "sora-2"
  | "hunyuan-1.5"
  | "pixverse-4"
  | "seedance-1.5-pro"  // SOTA Janvier 2026 - Lip-sync multilingual
  | "seedance-1-lite";  // Budget SOTA

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
  endImage?: string; // For interpolation (Luma Ray 2)

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
// SOTA PROVIDER CONFIGURATIONS - JANUARY 2026
// ============================================

export const REPLICATE_MODELS: Record<VideoProvider, string> = {
  // Budget tier - Wan video (fast & cheap)
  "wan-2.2": "wan-video/wan-2.2-i2v-fast",
  "wan-2.5": "wavespeedai/wan-2.1-i2v-720p",      // CORRIGÉ: Wan 2.1 720p accéléré
  "wan-2.6": "wan-video/wan-2.2-i2v-a14b",        // CORRIGÉ: Wan 2.2 A14B I2V
  
  // Premium tier - Kling (cinematic motion)
  "kling-2.6": "kwaivgi/kling-v2.6",              // CORRIGÉ Fév 2026: Kling v2.6 Pro
  
  // Google Veo (best quality)
  "veo-3.1": "google/veo-3.1",                    // CORRIGÉ Fév 2026: Veo 3.1 (latest)
  "veo-3.1-fast": "google/veo-3.1-fast",          // CORRIGÉ Fév 2026: Veo 3.1 Fast
  
  // MiniMax Hailuo (expressions, dance)
  "hailuo-2.3": "minimax/hailuo-2.3",             // CORRIGÉ Fév 2026: Hailuo 2.3 (T2V + I2V)
  "hailuo-2.3-fast": "minimax/hailuo-2.3",        // CORRIGÉ Fév 2026: Same model (fast = I2V only)
  
  // Luma Ray (physics, interpolation)
  "luma-ray-2": "luma/ray-flash-2-720p",          // CORRIGÉ: Ray Flash 2 720p
  "luma-ray-3": "luma/ray-flash-2-540p",          // CORRIGÉ: Ray Flash 2 540p (faster)
  
  // Lightricks LTX
  "ltx-2": "lightricks/audio-to-video",           // CORRIGÉ: Audio to video
  
  // OpenAI Sora (N/A on Replicate - fallback)
  "sora-2": "google/veo-3",                       // FALLBACK: Veo 3 (Sora N/A)
  
  // Tencent Hunyuan
  "hunyuan-1.5": "wavespeedai/hunyuan-video-fast", // CORRIGÉ: Hunyuan Video Fast
  
  // PixVerse
  "pixverse-4": "pixverse/pixverse-v4.5",         // CORRIGÉ: PixVerse v4.5 (latest)
  
  // ByteDance Seedance
  "seedance-1.5-pro": "bytedance/seedance-1.5-pro", // CORRIGÉ Fév 2026: Seedance 1.5 Pro (264K runs)
  "seedance-1-lite": "bytedance/seedance-1-lite",
};

export const PROVIDER_CONFIGS: Record<VideoProvider, VideoProviderConfig> = {
  // ============================================
  // BUDGET TIER - Fast & Cheap
  // ============================================
  "wan-2.2": {
    provider: "wan-2.2",
    tier: "budget",
    replicateModel: "wan-video/wan-2.2-i2v-fast",
    maxConcurrent: 5,
    timeoutMs: 180000, // 3 min
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
      strengths: ["Very fast (39s for 5s@480p)", "Cheapest option", "Good for prototyping"],
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

  // ============================================
  // STANDARD TIER - Balanced
  // ============================================
  "wan-2.5": {
    provider: "wan-2.5",
    tier: "standard",
    replicateModel: "wan-video/wan-2.5-i2v",
    maxConcurrent: 3,
    timeoutMs: 300000, // 5 min
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
      strengths: ["One-pass A/V sync", "Lip-sync native", "6 aspect ratios", "Multilingual prompts", "Best value"],
      weaknesses: ["Slower than 2.2", "Open source limitations"],
    },
    pricing: {
      costPerSecond: 0.042,
      costPer5sVideo: 0.21,
      minimumCost: 0.21,
      currency: "USD",
    },
  },

  "wan-2.6": {
    provider: "wan-2.6",
    tier: "standard",
    replicateModel: "wan-video/wan-2.6-i2v",
    maxConcurrent: 3,
    timeoutMs: 400000,
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
      strengths: ["Sharper details vs 2.5", "Less flicker", "Better text rendering", "Improved temporal consistency"],
      weaknesses: ["Slower than 2.5", "Newer model"],
    },
    pricing: {
      costPerSecond: 0.05,
      costPer5sVideo: 0.25,
      minimumCost: 0.25,
      currency: "USD",
    },
  },

  "luma-ray-2": {
    provider: "luma-ray-2",
    tier: "standard",
    replicateModel: "luma/ray-2",
    maxConcurrent: 3,
    timeoutMs: 300000,
    capabilities: {
      maxDurationSeconds: 10,
      minDurationSeconds: 5,
      supportedResolutions: ["540p", "720p", "1080p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: false,
      supportsInterpolation: true, // Start + end frame!
      supportsAudio: false,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["Start+end frame interpolation", "Natural physics", "10x compute vs Ray 1", "Coherent motion"],
      weaknesses: ["No audio", "Higher latency"],
    },
    pricing: {
      costPerSecond: 0.10,
      costPer5sVideo: 0.50,
      minimumCost: 0.50,
      currency: "USD",
    },
  },

  "hunyuan-1.5": {
    provider: "hunyuan-1.5",
    tier: "standard",
    replicateModel: "tencent/hunyuan-video",
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
      weaknesses: ["Requires 60-80GB VRAM", "Slower"],
    },
    pricing: {
      costPerSecond: 0.06,
      costPer5sVideo: 0.30,
      minimumCost: 0.30,
      currency: "USD",
    },
  },

  // ============================================
  // PREMIUM TIER - High Quality
  // ============================================
  "kling-2.6": {
    provider: "kling-2.6",
    tier: "premium",
    replicateModel: "kwaivgi/kling-v2.6",
    maxConcurrent: 3,
    timeoutMs: 600000, // 10 min
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
        "Motion brush (6 regions)",
        "Motion transfer from video",
        "Native audio generation",
        "Advanced physics engine",
        "4K native",
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

  "luma-ray-3": {
    provider: "luma-ray-3",
    tier: "premium",
    replicateModel: "luma/ray-3",
    maxConcurrent: 2,
    timeoutMs: 600000,
    capabilities: {
      maxDurationSeconds: 10,
      minDurationSeconds: 5,
      supportedResolutions: ["720p", "1080p"],
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsVideoToVideo: true,
      supportsInterpolation: true,
      supportsAudio: true,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: true,
      fps: [24],
      strengths: [
        "Reasoning-driven generation",
        "Character reference preservation",
        "Draft mode (20x faster)",
        "HDR pipeline (first on market)",
        "Video-to-video with keyframes",
      ],
      weaknesses: ["Newer, less documentation"],
    },
    pricing: {
      costPerSecond: 0.12,
      costPer5sVideo: 0.60,
      minimumCost: 0.60,
      currency: "USD",
    },
  },

  "veo-3.1": {
    provider: "veo-3.1",
    tier: "premium",
    replicateModel: "google/veo-3-1",
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
        "Best physics simulation",
        "Contextual audio generation",
        "Last frame support for chaining",
        "Highest fidelity",
        "SynthID watermark",
      ],
      weaknesses: ["Expensive", "Preview limitations", "Videos stored 2 days only"],
    },
    pricing: {
      costPerSecond: 0.35,
      costPer5sVideo: 1.75,
      minimumCost: 1.75,
      currency: "USD",
    },
  },

  "sora-2": {
    provider: "sora-2",
    tier: "premium",
    replicateModel: "openai/sora-2",
    maxConcurrent: 1,
    timeoutMs: 900000, // 15 min
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
      strengths: ["Longest duration (35s)", "Good realism", "Audio support"],
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

  // ============================================
  // SOTA JANVIER 2026 - NEW PROVIDERS
  // ============================================
  
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
      supportsInterpolation: true, // First/Last frame support
      supportsAudio: true,
      supportsLipSync: false,
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["Best physics", "Context-aware audio", "First/Last frame", "56% cheaper than Veo 3.1"],
      weaknesses: ["720p for fast tier", "Shorter than full Veo"],
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
    replicateModel: "minimax/hailuo-2.3",
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
      strengths: ["50% cheaper than standard", "Same motion quality", "Fast iteration"],
      weaknesses: ["No audio", "25fps only"],
    },
    pricing: {
      costPerSecond: 0.05,
      costPer5sVideo: 0.25,
      minimumCost: 0.25,
      currency: "USD",
    },
  },

  "seedance-1.5-pro": {
    provider: "seedance-1.5-pro",
    tier: "premium",
    replicateModel: "bytedance/seedance-1.5-pro",
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
      supportsLipSync: true, // Multilingual lip-sync!
      supportsCameraControl: true,
      supportsMotionBrush: false,
      supportsMotionTransfer: false,
      fps: [24],
      strengths: ["Lip-sync 8 languages", "Film-grade cinematography", "Native audio-visual"],
      weaknesses: ["No negative prompts", "Higher cost"],
    },
    pricing: {
      costPerSecond: 0.10,
      costPer5sVideo: 0.50,
      minimumCost: 0.50,
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
};

// ============================================
// MOOSTIK-SPECIFIC CONFIGURATIONS
// ============================================

/**
 * Recommended providers by animation type for MOOSTIK
 */
export const MOOSTIK_ANIMATION_PROVIDERS: Record<AnimationType, VideoProvider[]> = {
  // SOTA Janvier 2026 - Updated recommendations
  subtle: ["wan-2.6", "hailuo-2.3-fast", "ltx-2", "hunyuan-1.5"],
  dialogue: ["seedance-1.5-pro", "kling-2.6"], // Seedance = BEST lip-sync multilingue
  action: ["hailuo-2.3", "kling-2.6", "veo-3.1-fast"],
  transition: ["luma-ray-2", "wan-2.6", "veo-3.1-fast"],
  establishing: ["veo-3.1-fast", "veo-3.1", "luma-ray-2", "luma-ray-3"],
  emotional: ["kling-2.6", "seedance-1.5-pro", "hailuo-2.3", "veo-3.1-fast"],
  combat: ["hailuo-2.3", "kling-2.6", "veo-3.1-fast"],
  death: ["veo-3.1-fast", "kling-2.6", "hailuo-2.3"],
  flashback: ["luma-ray-2", "wan-2.6", "veo-3.1-fast"], // First/Last frame
  dance: ["hailuo-2.3", "kling-2.6", "seedance-1.5-pro"],
  walking: ["wan-2.5", "ltx-2"],
  flying: ["veo-3.1", "kling-2.6"],
};

/**
 * Provider selection by budget tier
 */
export const MOOSTIK_BUDGET_TIERS = {
  /** ~$2.50/episode - Prototyping */
  prototype: {
    provider: "wan-2.2" as VideoProvider,
    resolution: "480p" as VideoResolution,
    estimatedCostPerEpisode: 2.50, // 27 shots × $0.086
  },
  /** ~$6/episode - Draft review */
  draft: {
    provider: "wan-2.5" as VideoProvider,
    resolution: "720p" as VideoResolution,
    estimatedCostPerEpisode: 5.67, // 27 shots × $0.21
  },
  /** ~$13/episode - Standard production */
  standard: {
    provider: "kling-2.6" as VideoProvider,
    resolution: "1080p" as VideoResolution,
    estimatedCostPerEpisode: 12.83, // 27 shots × $0.475
  },
  /** ~$47/episode - High quality */
  high: {
    provider: "veo-3.1" as VideoProvider,
    resolution: "4k" as VideoResolution,
    estimatedCostPerEpisode: 47.25, // 27 shots × $1.75
  },
};

/**
 * Scene type to provider mapping for optimal quality
 */
export const MOOSTIK_SCENE_PROVIDERS: Record<string, VideoProvider> = {
  genocide: "veo-3.1", // Need best physics for death scenes
  survival: "kling-2.6", // Motion control for intense scenes
  training: "hailuo-2.3", // Complex body movements
  bar_scene: "wan-2.5", // Dialogue with lip-sync
  battle: "kling-2.6", // Motion brush for multi-character
  emotional: "veo-3.1", // Subtle expressions
  establishing: "luma-ray-2", // Natural camera physics
  flashback: "luma-ray-2", // Interpolation for dreamy effect
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
