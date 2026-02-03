/**
 * MOOSTIK Replicate Video Provider
 * Unified provider for all I2V models available on Replicate
 *
 * Supports: Wan 2.2/2.5/2.6, Kling 2.6, Veo 3.1, Hailuo 2.3,
 *           Luma Ray Flash 2/3, LTX-2, Sora 2, Hunyuan 1.5, PixVerse 4
 */

import Replicate from "replicate";
import {
  VideoProvider,
  VideoGenerationInput,
  VideoGenerationOutput,
  VideoStatus,
  CameraMotion,
  PROVIDER_CONFIGS,
  REPLICATE_MODELS,
} from "../types";
import { createLogger, trackPerformance } from "../../logger";
import { withRetry, RetryOptions } from "../../retry";
import { MoostikError } from "../../errors";
import { config as appConfig } from "../../config";
import * as fs from "fs/promises";
import * as path from "path";

const logger = createLogger("ReplicateVideo");

// ============================================
// REPLICATE VIDEO ERROR
// ============================================

export class ReplicateVideoError extends MoostikError {
  public readonly provider: VideoProvider;
  public readonly replicateModel: string;
  public readonly retryable: boolean;

  constructor(
    provider: VideoProvider,
    model: string,
    code: string,
    message: string,
    retryable = false,
    details?: unknown
  ) {
    super(`[${provider}] ${message}`, `REPLICATE_VIDEO_${code}`, 500, details as Record<string, unknown> | undefined);
    this.provider = provider;
    this.replicateModel = model;
    this.retryable = retryable;
  }
}

// ============================================
// REPLICATE CLIENT
// ============================================

let replicateClient: Replicate | null = null;

function getReplicateClient(): Replicate {
  if (!replicateClient) {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      throw new ReplicateVideoError(
        "wan-2.2",
        "",
        "NO_API_TOKEN",
        "REPLICATE_API_TOKEN environment variable not set"
      );
    }
    replicateClient = new Replicate({ auth: apiToken });
  }
  return replicateClient;
}

// ============================================
// INPUT BUILDERS FOR EACH PROVIDER
// ============================================

interface ReplicateInput {
  [key: string]: unknown;
}

// Type for Replicate prediction output object
interface ReplicatePredictionOutput {
  video?: string;
  video_url?: string;
  audio?: string;
  audio_url?: string;
}

// Type for Replicate prediction metrics
interface ReplicatePredictionMetrics {
  predict_time?: number;
}

// Type for Replicate webhook events
type ReplicateWebhookEvent = "start" | "output" | "logs" | "completed";

/**
 * Build input for Wan 2.x models
 */
function buildWanInput(input: VideoGenerationInput, provider: VideoProvider): ReplicateInput {
  const wanInput: ReplicateInput = {
    image: input.sourceImage,
    prompt: input.prompt,
  };

  // Duration
  if (input.durationSeconds) {
    wanInput.num_frames = Math.min(input.durationSeconds * 24, 240); // Max ~10s
  }

  // Resolution
  const resolutionMap: Record<string, string> = {
    "480p": "480p",
    "720p": "720p",
    "1080p": "1080p",
  };
  if (input.resolution) {
    wanInput.resolution = resolutionMap[input.resolution] || "720p";
  }

  // Aspect ratio
  if (input.aspectRatio) {
    wanInput.aspect_ratio = input.aspectRatio;
  }

  // Wan 2.5+ audio
  if (provider !== "wan-2.2" && input.generateAudio) {
    wanInput.enable_audio = true;
    if (input.audioPrompt) {
      wanInput.audio_prompt = input.audioPrompt;
    }
  }

  // Negative prompt
  if (input.negativePrompt) {
    wanInput.negative_prompt = input.negativePrompt;
  }

  // Seed
  if (input.seed) {
    wanInput.seed = input.seed;
  }

  return wanInput;
}

/**
 * Build input for Kling v2.1-master (kwaivgi/kling-v2.1-master)
 * Schema: prompt (required), start_image (optional), duration, aspect_ratio, negative_prompt
 */
function buildKlingInput(input: VideoGenerationInput): ReplicateInput {
  const klingInput: ReplicateInput = {
    prompt: input.prompt,
    duration: input.durationSeconds <= 5 ? 5 : 10, // Number, not string
    aspect_ratio: input.aspectRatio === "9:16" ? "9:16" : input.aspectRatio === "1:1" ? "1:1" : "16:9",
  };

  // Image source (optional for Kling - supports Text-to-Video AND Image-to-Video)
  if (input.sourceImage) {
    klingInput.start_image = input.sourceImage; // CORRIGÉ: start_image, pas image_url
  }

  // Negative prompt
  if (input.negativePrompt) {
    klingInput.negative_prompt = input.negativePrompt;
  }

  return klingInput;
}

function buildKlingCameraControl(motion: CameraMotion): Record<string, unknown> {
  const intensityMap = { subtle: 3, moderate: 6, dramatic: 10 };
  const intensity = intensityMap[motion.intensity];

  const config: Record<string, number> = {};

  switch (motion.type) {
    case "pan":
      config.horizontal = motion.direction === "left" ? -intensity : intensity;
      break;
    case "tilt":
      config.vertical = motion.direction === "down" ? -intensity : intensity;
      break;
    case "zoom":
    case "dolly":
      config.zoom = motion.direction === "out" ? -intensity : intensity;
      break;
    case "orbit":
      config.pan = motion.direction === "counterclockwise" ? -intensity : intensity;
      break;
    case "crane":
      config.vertical = motion.direction === "down" ? -intensity : intensity;
      config.tilt = motion.direction === "down" ? intensity / 2 : -intensity / 2;
      break;
  }

  return {
    type: Object.keys(config).length > 0 ? "custom" : "simple",
    config: Object.keys(config).length > 0 ? config : undefined,
  };
}

/**
 * Build input for Google Veo 3 (google/veo-3)
 * Schema: prompt (required), image (optional), duration, aspect_ratio, generate_audio, resolution, negative_prompt, seed
 */
function buildVeoInput(input: VideoGenerationInput): ReplicateInput {
  const veoInput: ReplicateInput = {
    prompt: input.prompt,
  };

  // Image source (optional - supports Text-to-Video AND Image-to-Video)
  if (input.sourceImage) {
    veoInput.image = input.sourceImage;
  }

  // Duration (Veo 3 supports various durations)
  if (input.durationSeconds) {
    veoInput.duration = input.durationSeconds;
  }

  // Aspect ratio
  if (input.aspectRatio) {
    veoInput.aspect_ratio = input.aspectRatio;
  }

  // Resolution
  if (input.resolution) {
    veoInput.resolution = input.resolution;
  }

  // Audio (Veo 3 generates audio natively)
  if (input.generateAudio !== false) {
    veoInput.generate_audio = true;
  }

  // Negative prompt
  if (input.negativePrompt) {
    veoInput.negative_prompt = input.negativePrompt;
  }

  // Seed
  if (input.seed) {
    veoInput.seed = input.seed;
  }

  return veoInput;
}

/**
 * Build input for MiniMax Video-01-Live (minimax/video-01-live)
 * Schema: prompt (REQUIRED), first_frame_image (REQUIRED), prompt_optimizer (optional)
 * IMPORTANT: Ce modèle est UNIQUEMENT Image-to-Video, l'image source est OBLIGATOIRE
 */
function buildHailuoInput(input: VideoGenerationInput): ReplicateInput {
  // VALIDATION: first_frame_image est OBLIGATOIRE pour ce modèle
  if (!input.sourceImage) {
    throw new ReplicateVideoError(
      "hailuo-2.3",
      "minimax/video-01-live",
      "MISSING_IMAGE",
      "MiniMax Video-01-Live requires a source image (first_frame_image). This model does not support text-to-video.",
      false
    );
  }

  const hailuoInput: ReplicateInput = {
    prompt: input.prompt,
    first_frame_image: input.sourceImage, // CORRIGÉ: Clé correcte selon le schéma API
    prompt_optimizer: true, // Recommandé par MiniMax
  };

  return hailuoInput;
}

/**
 * Build input for Luma Ray Flash 2/3
 */
function buildLumaInput(input: VideoGenerationInput, provider: VideoProvider): ReplicateInput {
  const lumaInput: ReplicateInput = {
    image_url: input.sourceImage,
    prompt: input.prompt,
  };

  // End image for interpolation (Ray 2/3 feature)
  if (input.endImage) {
    lumaInput.end_image_url = input.endImage;
  }

  // Duration
  lumaInput.duration = input.durationSeconds <= 5 ? 5 : 9;

  // Resolution
  const resMap: Record<string, string> = {
    "540p": "540p",
    "720p": "720p",
    "1080p": "1080p",
  };
  lumaInput.resolution = resMap[input.resolution || "720p"] || "720p";

  // Aspect ratio
  lumaInput.aspect_ratio = input.aspectRatio || "16:9";

  // Ray 3 specific: draft mode
  if (provider === "luma-ray-flash-2" && input.quality === "draft") {
    lumaInput.draft_mode = true;
  }

  // Ray 3: audio
  if (provider === "luma-ray-flash-2" && input.generateAudio) {
    lumaInput.enable_audio = true;
  }

  // Motion transfer (Ray 3)
  if (provider === "luma-ray-flash-2" && input.motionTransfer) {
    lumaInput.reference_video = input.motionTransfer.referenceVideoUrl;
  }

  return lumaInput;
}

/**
 * Build input for LTX-2
 */
function buildLtxInput(input: VideoGenerationInput): ReplicateInput {
  const ltxInput: ReplicateInput = {
    image: input.sourceImage,
    prompt: input.prompt,
  };

  // Duration (up to 20s)
  ltxInput.num_frames = Math.min(input.durationSeconds * 24, 480);

  // Resolution
  const resMap: Record<string, [number, number]> = {
    "720p": [1280, 720],
    "1080p": [1920, 1080],
    "4k": [3840, 2160],
  };
  const [width, height] = resMap[input.resolution || "1080p"] || [1920, 1080];
  ltxInput.width = width;
  ltxInput.height = height;

  // FPS
  ltxInput.fps = input.fps || 24;

  // Audio
  if (input.generateAudio) {
    ltxInput.enable_audio = true;
  }

  // Negative prompt
  if (input.negativePrompt) {
    ltxInput.negative_prompt = input.negativePrompt;
  }

  // Seed
  if (input.seed) {
    ltxInput.seed = input.seed;
  }

  return ltxInput;
}

/**
 * Build input for Sora 2
 */
function buildSoraInput(input: VideoGenerationInput): ReplicateInput {
  const soraInput: ReplicateInput = {
    image: input.sourceImage,
    prompt: input.prompt,
  };

  // Duration (4-35s)
  soraInput.duration = Math.min(Math.max(input.durationSeconds, 4), 35);

  // Resolution
  soraInput.resolution = input.resolution === "1080p" ? "1080p" : "720p";

  // Aspect ratio
  soraInput.aspect_ratio = input.aspectRatio || "16:9";

  // Audio
  if (input.generateAudio) {
    soraInput.enable_audio = true;
  }

  return soraInput;
}

/**
 * Build input for Hunyuan 1.5
 */
function buildHunyuanInput(input: VideoGenerationInput): ReplicateInput {
  const hunyuanInput: ReplicateInput = {
    image: input.sourceImage,
    prompt: input.prompt,
  };

  // Duration (up to 5s)
  hunyuanInput.num_frames = Math.min(input.durationSeconds * 24, 120);

  // Aspect ratio
  hunyuanInput.aspect_ratio = input.aspectRatio || "16:9";

  // Negative prompt
  if (input.negativePrompt) {
    hunyuanInput.negative_prompt = input.negativePrompt;
  }

  // Seed
  if (input.seed) {
    hunyuanInput.seed = input.seed;
  }

  return hunyuanInput;
}

/**
 * Build input for PixVerse v4
 */
function buildPixVerseInput(input: VideoGenerationInput): ReplicateInput {
  const pixInput: ReplicateInput = {
    image: input.sourceImage,
    prompt: input.prompt,
  };

  // Duration
  pixInput.duration = Math.min(input.durationSeconds, 8);

  // Resolution
  const resMap: Record<string, string> = {
    "540p": "540p",
    "720p": "720p",
    "1080p": "1080p",
  };
  pixInput.resolution = resMap[input.resolution || "720p"] || "720p";

  // Aspect ratio
  pixInput.aspect_ratio = input.aspectRatio || "16:9";

  // Camera motion (PixVerse has 20+ options)
  if (input.cameraMotion) {
    const cameraMap: Record<string, string> = {
      static: "static",
      pan: input.cameraMotion.direction === "left" ? "pan_left" : "pan_right",
      tilt: input.cameraMotion.direction === "up" ? "tilt_up" : "tilt_down",
      zoom: input.cameraMotion.direction === "in" ? "zoom_in" : "zoom_out",
      dolly: input.cameraMotion.direction === "in" ? "dolly_in" : "dolly_out",
      orbit: "orbit",
      crane: "crane",
    };
    pixInput.camera_motion = cameraMap[input.cameraMotion.type] || "static";
  }

  // Negative prompt
  if (input.negativePrompt) {
    pixInput.negative_prompt = input.negativePrompt;
  }

  // Seed
  if (input.seed) {
    pixInput.seed = input.seed;
  }

  return pixInput;
}

/**
 * Build input for ByteDance Seedance models
 * bytedance/seedance-1-pro-fast and bytedance/seedance-1-lite
 */
function buildSeedanceInput(input: VideoGenerationInput, provider: VideoProvider): ReplicateInput {
  const seedanceInput: ReplicateInput = {
    prompt: input.prompt,
  };

  // Image source (optional - supports T2V and I2V)
  if (input.sourceImage) {
    seedanceInput.image = input.sourceImage;
  }

  // Duration
  if (input.durationSeconds) {
    seedanceInput.duration = Math.min(input.durationSeconds, provider === "seedance-1-pro" ? 12 : 10);
  }

  // Aspect ratio
  if (input.aspectRatio) {
    seedanceInput.aspect_ratio = input.aspectRatio;
  }

  // Resolution (Pro supports 1080p, Lite supports 720p max)
  if (input.resolution) {
    const maxRes = provider === "seedance-1-pro" ? "1080p" : "720p";
    seedanceInput.resolution = input.resolution === "1080p" && provider === "seedance-1-lite" ? "720p" : input.resolution;
  }

  // Audio (Seedance 1 Pro supports native audio)
  if (provider === "seedance-1-pro" && input.generateAudio !== false) {
    seedanceInput.generate_audio = true;
  }

  // Seed
  if (input.seed) {
    seedanceInput.seed = input.seed;
  }

  return seedanceInput;
}

// ============================================
// MAIN PROVIDER FUNCTION
// ============================================

function buildReplicateInput(input: VideoGenerationInput, provider: VideoProvider): ReplicateInput {
  switch (provider) {
    // Wan models (Alibaba)
    case "wan-2.2":
    case "wan-2.2-fast":
    case "wan-2.5":
    case "wan-2.5-fast":
      return buildWanInput(input, provider);

    // Kling models (Kuaishou)
    case "kling-2.5-turbo":
    case "kling-2.6":
      return buildKlingInput(input);

    // Veo models (Google)
    case "veo-2":
    case "veo-3":
    case "veo-3-fast":
    case "veo-3.1":
    case "veo-3.1-fast":
      return buildVeoInput(input);

    // Hailuo models (MiniMax)
    case "hailuo-2.3":
    case "hailuo-2.3-fast":
      return buildHailuoInput(input);

    // Luma Ray
    case "luma-ray-flash-2":
      return buildLumaInput(input, provider);

    // Lightricks LTX
    case "ltx-2":
      return buildLtxInput(input);

    // OpenAI Sora
    case "sora-2":
    case "sora-2-pro":
      return buildSoraInput(input);

    // Tencent Hunyuan
    case "hunyuan-1.5":
      return buildHunyuanInput(input);

    // PixVerse
    case "pixverse-4":
      return buildPixVerseInput(input);

    // ByteDance Seedance
    case "seedance-1-pro":
    case "seedance-1-lite":
      return buildSeedanceInput(input, provider);

    default:
      throw new ReplicateVideoError(provider, "", "UNKNOWN_PROVIDER", `Unknown provider: ${provider}`);
  }
}

// ============================================
// GENERATION FUNCTIONS
// ============================================

/**
 * Generate video using Replicate
 */
export async function generateVideo(
  input: VideoGenerationInput,
  provider: VideoProvider,
  options: {
    webhook?: string;
    webhookEvents?: ReplicateWebhookEvent[];
  } = {}
): Promise<VideoGenerationOutput> {
  const perf = trackPerformance("generateVideo");
  const config = PROVIDER_CONFIGS[provider];
  const modelId = REPLICATE_MODELS[provider];

  if (!config) {
    throw new ReplicateVideoError(provider, "", "INVALID_PROVIDER", `Provider ${provider} not configured`);
  }

  logger.info(`Starting video generation`, {
    provider,
    model: modelId,
    duration: input.durationSeconds,
  });

  try {
    const replicate = getReplicateClient();
    const replicateInput = buildReplicateInput(input, provider);

    // Create prediction
    const prediction = await replicate.predictions.create({
      model: modelId,
      input: replicateInput,
      webhook: options.webhook,
      webhook_events_filter: options.webhookEvents,
    });

    const output: VideoGenerationOutput = {
      id: `${provider}-${prediction.id}`,
      provider,
      replicateId: prediction.id,
      status: mapReplicateStatus(prediction.status),
      createdAt: new Date().toISOString(),
    };

    logger.info(`Prediction created`, { predictionId: prediction.id, provider });
    perf.end();

    return output;

  } catch (error) {
    perf.end();
    logger.error(`Video generation failed`, error);
    throw handleReplicateError(error, provider, modelId);
  }
}

/**
 * Generate video and wait for completion
 */
export async function generateVideoAndWait(
  input: VideoGenerationInput,
  provider: VideoProvider,
  options: {
    onProgress?: (output: VideoGenerationOutput) => void;
    timeoutMs?: number;
    pollIntervalMs?: number;
  } = {}
): Promise<VideoGenerationOutput> {
  const {
    onProgress,
    timeoutMs = PROVIDER_CONFIGS[provider]?.timeoutMs || 600000,
    pollIntervalMs = 5000,
  } = options;

  // Start generation
  const initial = await generateVideo(input, provider);

  // Poll for completion
  const startTime = Date.now();
  let lastStatus = initial.status;

  while (true) {
    const status = await checkVideoStatus(initial.replicateId!, provider);

    // Report progress
    if (onProgress && status.status !== lastStatus) {
      lastStatus = status.status;
      onProgress(status);
    }

    // Check terminal states
    if (status.status === "completed") {
      logger.info(`Video generation completed`, {
        provider,
        replicateId: initial.replicateId,
        duration: Date.now() - startTime,
      });
      return status;
    }

    if (status.status === "failed") {
      throw new ReplicateVideoError(
        provider,
        REPLICATE_MODELS[provider],
        "GENERATION_FAILED",
        status.error?.message || "Video generation failed",
        status.error?.retryable ?? false,
        status.error
      );
    }

    if (status.status === "cancelled") {
      throw new ReplicateVideoError(provider, REPLICATE_MODELS[provider], "CANCELLED", "Video generation was cancelled");
    }

    // Check timeout
    if (Date.now() - startTime > timeoutMs) {
      await cancelVideo(initial.replicateId!, provider);
      throw new ReplicateVideoError(
        provider,
        REPLICATE_MODELS[provider],
        "TIMEOUT",
        `Video generation timed out after ${timeoutMs}ms`,
        true
      );
    }

    // Wait before next poll
    await sleep(pollIntervalMs);
  }
}

/**
 * Check video generation status
 */
export async function checkVideoStatus(
  replicateId: string,
  provider: VideoProvider
): Promise<VideoGenerationOutput> {
  try {
    const replicate = getReplicateClient();
    const prediction = await replicate.predictions.get(replicateId);

    const output: VideoGenerationOutput = {
      id: `${provider}-${replicateId}`,
      provider,
      replicateId,
      status: mapReplicateStatus(prediction.status),
      createdAt: prediction.created_at || new Date().toISOString(),
      startedAt: prediction.started_at || undefined,
      completedAt: prediction.completed_at || undefined,
    };

    // Extract video URL from output
    if (prediction.output) {
      if (typeof prediction.output === "string") {
        output.videoUrl = prediction.output;
      } else if (Array.isArray(prediction.output)) {
        output.videoUrl = prediction.output[0];
        if (prediction.output[1]) {
          output.audioUrl = prediction.output[1];
        }
      } else if (typeof prediction.output === "object") {
        const outputObj = prediction.output as ReplicatePredictionOutput;
        output.videoUrl = outputObj.video || outputObj.video_url;
        output.audioUrl = outputObj.audio || outputObj.audio_url;
      }
    }

    // Error handling
    if (prediction.error) {
      output.error = {
        code: "REPLICATE_ERROR",
        message: typeof prediction.error === "string" ? prediction.error : JSON.stringify(prediction.error),
        retryable: true,
      };
    }

    // Metrics
    if (prediction.metrics) {
      const metrics = prediction.metrics as ReplicatePredictionMetrics;
      output.actualProcessingMs = metrics.predict_time
        ? metrics.predict_time * 1000
        : undefined;
    }

    return output;

  } catch (error) {
    throw handleReplicateError(error, provider, REPLICATE_MODELS[provider]);
  }
}

/**
 * Cancel video generation
 */
export async function cancelVideo(replicateId: string, provider: VideoProvider): Promise<boolean> {
  try {
    const replicate = getReplicateClient();
    await replicate.predictions.cancel(replicateId);
    logger.info(`Cancelled video generation`, { replicateId, provider });
    return true;
  } catch (error) {
    logger.warn(`Failed to cancel video generation`, { replicateId, error });
    return false;
  }
}

/**
 * Download video to local storage
 */
export async function downloadVideo(
  output: VideoGenerationOutput,
  episodeId: string,
  shotId: string,
  variationId: string
): Promise<string> {
  if (!output.videoUrl) {
    throw new ReplicateVideoError(output.provider, "", "NO_VIDEO_URL", "No video URL available");
  }

  const response = await fetch(output.videoUrl);
  if (!response.ok) {
    throw new ReplicateVideoError(
      output.provider,
      "",
      "DOWNLOAD_FAILED",
      `Failed to download video: ${response.status}`
    );
  }

  const buffer = await response.arrayBuffer();

  const localPath = path.join(
    appConfig.paths.output,
    "videos",
    episodeId,
    shotId,
    `${variationId}.mp4`
  );

  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, Buffer.from(buffer));

  logger.info(`Downloaded video to ${localPath}`);
  return localPath;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function mapReplicateStatus(status: string): VideoStatus {
  switch (status) {
    case "starting":
      return "starting";
    case "processing":
      return "processing";
    case "succeeded":
      return "completed";
    case "failed":
      return "failed";
    case "canceled":
      return "cancelled";
    default:
      return "queued";
  }
}

function handleReplicateError(
  error: unknown,
  provider: VideoProvider,
  model: string
): ReplicateVideoError {
  if (error instanceof ReplicateVideoError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);

  // Check for rate limiting
  if (message.includes("rate limit") || message.includes("429")) {
    return new ReplicateVideoError(provider, model, "RATE_LIMITED", "Rate limited by Replicate", true);
  }

  // Check for model not found
  if (message.includes("not found") || message.includes("404")) {
    return new ReplicateVideoError(provider, model, "MODEL_NOT_FOUND", `Model ${model} not found`, false);
  }

  return new ReplicateVideoError(provider, model, "UNKNOWN", message, true);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// RETRY WRAPPER
// ============================================

const RETRY_OPTIONS: Partial<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 2000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

/**
 * Generate video with automatic retry
 */
export async function generateVideoWithRetry(
  input: VideoGenerationInput,
  provider: VideoProvider,
  options?: {
    onProgress?: (output: VideoGenerationOutput) => void;
    retryOptions?: Partial<RetryOptions>;
  }
): Promise<VideoGenerationOutput> {
  return withRetry(
    () => generateVideoAndWait(input, provider, { onProgress: options?.onProgress }),
    { ...RETRY_OPTIONS, ...options?.retryOptions }
  );
}
