/**
 * MOOSTIK Video Provider Base Class
 * Abstract interface for video generation providers
 */

import {
  VideoProvider,
  VideoProviderConfig,
  VideoGenerationInput,
  VideoGenerationOutput,
  VideoStatus,
  VideoError,
} from "./types";
import { createLogger } from "../logger";
import { withRetry, RetryOptions } from "../retry";
import { MoostikError } from "../errors";

const logger = createLogger("VideoProvider");

// ============================================
// ABSTRACT PROVIDER BASE
// ============================================

export abstract class VideoProviderBase {
  protected config: VideoProviderConfig;
  protected activeJobs: Map<string, VideoGenerationOutput> = new Map();

  constructor(config: VideoProviderConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * Provider name for logging
   */
  abstract get name(): VideoProvider;

  /**
   * Validate provider configuration
   */
  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new VideoProviderError(
        this.name,
        "API_KEY_MISSING",
        `API key not configured for ${this.name}`
      );
    }
  }

  /**
   * Generate video from input
   */
  abstract generate(input: VideoGenerationInput): Promise<VideoGenerationOutput>;

  /**
   * Check status of a video generation job
   */
  abstract checkStatus(jobId: string): Promise<VideoGenerationOutput>;

  /**
   * Cancel a video generation job
   */
  abstract cancel(jobId: string): Promise<boolean>;

  /**
   * Download video to local path
   */
  abstract download(jobId: string, localPath: string): Promise<string>;

  /**
   * Generate with retry logic
   */
  async generateWithRetry(
    input: VideoGenerationInput,
    options?: Partial<RetryOptions>
  ): Promise<VideoGenerationOutput> {
    const retryOptions: Partial<RetryOptions> = {
      maxRetries: 3,
      initialDelay: 5000,
      maxDelay: 60000,
      backoffMultiplier: 2,
      ...options,
    };

    return withRetry(async () => {
      const result = await this.generate(input);
      if (result.status === "failed" && result.error?.retryable) {
        throw new VideoProviderError(
          this.name,
          result.error.code,
          result.error.message,
          true
        );
      }
      return result;
    }, retryOptions);
  }

  /**
   * Poll for completion with timeout
   */
  async waitForCompletion(
    jobId: string,
    options: {
      pollIntervalMs?: number;
      timeoutMs?: number;
      onProgress?: (output: VideoGenerationOutput) => void;
    } = {}
  ): Promise<VideoGenerationOutput> {
    const {
      pollIntervalMs = 5000,
      timeoutMs = this.config.timeoutMs,
      onProgress,
    } = options;

    const startTime = Date.now();
    let lastProgress = -1;

    while (true) {
      const status = await this.checkStatus(jobId);

      // Report progress
      if (onProgress && status.progress !== lastProgress) {
        lastProgress = status.progress ?? 0;
        onProgress(status);
      }

      // Check terminal states
      if (status.status === "completed") {
        logger.info(`Video generation completed: ${jobId}`);
        return status;
      }

      if (status.status === "failed") {
        logger.error(`Video generation failed: ${jobId}`, status.error);
        throw new VideoProviderError(
          this.name,
          status.error?.code ?? "UNKNOWN",
          status.error?.message ?? "Video generation failed",
          status.error?.retryable ?? false
        );
      }

      if (status.status === "cancelled") {
        throw new VideoProviderError(this.name, "CANCELLED", "Video generation was cancelled");
      }

      // Check timeout
      if (Date.now() - startTime > timeoutMs) {
        await this.cancel(jobId).catch(() => {});
        throw new VideoProviderError(
          this.name,
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
   * Validate input against provider capabilities
   */
  protected validateInput(input: VideoGenerationInput): void {
    const caps = this.config.capabilities;

    // Duration
    if (input.durationSeconds > caps.maxDurationSeconds) {
      throw new VideoProviderError(
        this.name,
        "INVALID_DURATION",
        `Duration ${input.durationSeconds}s exceeds max ${caps.maxDurationSeconds}s for ${this.name}`
      );
    }

    // Aspect ratio
    if (!caps.supportedAspectRatios.includes(input.aspectRatio)) {
      throw new VideoProviderError(
        this.name,
        "INVALID_ASPECT_RATIO",
        `Aspect ratio ${input.aspectRatio} not supported by ${this.name}`
      );
    }

    // Image to video
    if (input.sourceType === "image" && !caps.supportsImageToVideo) {
      throw new VideoProviderError(
        this.name,
        "UNSUPPORTED_FEATURE",
        `Image-to-video not supported by ${this.name}`
      );
    }

    // Video to video
    if (input.sourceType === "video" && !caps.supportsVideoToVideo) {
      throw new VideoProviderError(
        this.name,
        "UNSUPPORTED_FEATURE",
        `Video-to-video not supported by ${this.name}`
      );
    }

    // Camera control
    if (input.cameraMotion && !caps.supportsCameraControl) {
      logger.warn(`Camera control not fully supported by ${this.name}, will use best effort`);
    }

    // Motion brush
    if (input.motionBrush && !caps.supportsMotionBrush) {
      throw new VideoProviderError(
        this.name,
        "UNSUPPORTED_FEATURE",
        `Motion brush not supported by ${this.name}`
      );
    }
  }

  /**
   * Prepare prompt for specific provider
   */
  protected preparePrompt(input: VideoGenerationInput): string {
    let prompt = input.prompt;

    // Add camera motion to prompt if provider doesn't have native support
    if (input.cameraMotion && !this.config.capabilities.supportsCameraControl) {
      const cameraDesc = describeCameraMotion(input.cameraMotion);
      prompt = `${prompt}. Camera: ${cameraDesc}`;
    }

    return prompt;
  }

  /**
   * Get active job count
   */
  get activeJobCount(): number {
    return this.activeJobs.size;
  }

  /**
   * Check if can accept new job
   */
  canAcceptJob(): boolean {
    return this.activeJobs.size < this.config.maxConcurrent;
  }
}

// ============================================
// ERRORS
// ============================================

export class VideoProviderError extends MoostikError {
  public readonly provider: VideoProvider;
  public readonly retryable: boolean;

  constructor(
    provider: VideoProvider,
    code: string,
    message: string,
    retryable = false,
    details?: unknown
  ) {
    super(`[${provider}] ${message}`, `VIDEO_${code}`, 500, details as Record<string, unknown> | undefined);
    this.provider = provider;
    this.retryable = retryable;
  }
}

// ============================================
// UTILITIES
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function describeCameraMotion(motion: VideoGenerationInput["cameraMotion"]): string {
  if (!motion) return "";

  const parts: string[] = [];

  switch (motion.type) {
    case "pan":
      parts.push(`slow pan ${motion.direction || "right"}`);
      break;
    case "tilt":
      parts.push(`tilt ${motion.direction || "up"}`);
      break;
    case "zoom":
      parts.push(`${motion.intensity} zoom ${motion.direction || "in"}`);
      break;
    case "dolly":
      parts.push(`dolly ${motion.direction || "in"}`);
      break;
    case "orbit":
      parts.push(`orbit ${motion.direction || "clockwise"}`);
      break;
    case "crane":
      parts.push(`crane shot ${motion.direction || "up"}`);
      break;
    case "handheld":
      parts.push(`handheld camera movement`);
      break;
    default:
      parts.push("static camera");
  }

  return parts.join(", ");
}

// ============================================
// PROVIDER FACTORY
// ============================================

export type ProviderFactory = (config: VideoProviderConfig) => VideoProviderBase;

const providerFactories: Map<VideoProvider, ProviderFactory> = new Map();

export function registerProviderFactory(provider: VideoProvider, factory: ProviderFactory): void {
  providerFactories.set(provider, factory);
}

export function createProvider(config: VideoProviderConfig): VideoProviderBase {
  const factory = providerFactories.get(config.provider);
  if (!factory) {
    throw new Error(`No factory registered for provider: ${config.provider}`);
  }
  return factory(config);
}

export function getRegisteredProviders(): VideoProvider[] {
  return Array.from(providerFactories.keys());
}
