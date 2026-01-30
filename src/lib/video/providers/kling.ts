/**
 * MOOSTIK Kling 2.6 Video Provider
 * Integration with Kling AI video generation API
 *
 * Kling is excellent for image-to-video with consistent character appearance
 * Best for: Character animation, dialogue scenes, subtle movements
 */

import {
  VideoProvider,
  VideoProviderConfig,
  VideoGenerationInput,
  VideoGenerationOutput,
  VideoStatus,
  CameraMotion,
  DEFAULT_PROVIDER_CONFIGS,
} from "../types";
import { VideoProviderBase, VideoProviderError, registerProviderFactory } from "../provider-base";
import { createLogger } from "../../logger";
import { config as appConfig } from "../../config";

const logger = createLogger("Kling");

// ============================================
// KLING API TYPES
// ============================================

interface KlingCreateRequest {
  model: string;
  prompt: string;
  negative_prompt?: string;
  image_url?: string;
  end_image_url?: string;
  duration: "5" | "10";
  aspect_ratio: "16:9" | "9:16" | "1:1";
  mode: "std" | "pro";
  camera_control?: KlingCameraControl;
  cfg_scale?: number;
}

interface KlingCameraControl {
  type: "simple" | "custom";
  config?: {
    horizontal?: number; // -10 to 10
    vertical?: number; // -10 to 10
    zoom?: number; // -10 to 10
    tilt?: number; // -10 to 10
    pan?: number; // -10 to 10
    roll?: number; // -10 to 10
  };
}

interface KlingTaskResponse {
  task_id: string;
  task_status: "submitted" | "processing" | "succeed" | "failed";
  task_status_msg?: string;
  created_at: number;
  updated_at: number;
}

interface KlingQueryResponse extends KlingTaskResponse {
  task_result?: {
    videos: Array<{
      id: string;
      url: string;
      duration: number;
    }>;
  };
}

// ============================================
// KLING PROVIDER IMPLEMENTATION
// ============================================

export class KlingProvider extends VideoProviderBase {
  private baseUrl: string;

  constructor(config: VideoProviderConfig) {
    super(config);
    this.baseUrl = config.baseUrl || "https://api.klingai.com/v1";
  }

  get name(): VideoProvider {
    return "kling";
  }

  async generate(input: VideoGenerationInput): Promise<VideoGenerationOutput> {
    this.validateInput(input);

    const request = this.buildRequest(input);
    logger.info(`Starting Kling generation`, { prompt: input.prompt.slice(0, 100) });

    try {
      const response = await this.createTask(request);

      const output: VideoGenerationOutput = {
        id: response.task_id,
        provider: "kling",
        status: this.mapStatus(response.task_status),
        createdAt: new Date(response.created_at * 1000).toISOString(),
      };

      this.activeJobs.set(response.task_id, output);
      return output;

    } catch (error) {
      logger.error("Kling generation failed", error);
      throw this.handleError(error);
    }
  }

  async checkStatus(jobId: string): Promise<VideoGenerationOutput> {
    try {
      const response = await this.queryTask(jobId);

      const output: VideoGenerationOutput = {
        id: jobId,
        provider: "kling",
        status: this.mapStatus(response.task_status),
        createdAt: new Date(response.created_at * 1000).toISOString(),
      };

      if (response.task_status === "succeed" && response.task_result?.videos?.[0]) {
        const video = response.task_result.videos[0];
        output.videoUrl = video.url;
        output.durationSeconds = video.duration;
        output.completedAt = new Date(response.updated_at * 1000).toISOString();
      }

      if (response.task_status === "failed") {
        output.error = {
          code: "GENERATION_FAILED",
          message: response.task_status_msg || "Unknown error",
          retryable: true,
        };
      }

      // Update active jobs
      if (output.status === "completed" || output.status === "failed") {
        this.activeJobs.delete(jobId);
      } else {
        this.activeJobs.set(jobId, output);
      }

      return output;

    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancel(jobId: string): Promise<boolean> {
    // Kling doesn't support cancellation, but we track locally
    this.activeJobs.delete(jobId);
    logger.warn(`Kling doesn't support task cancellation, removing from tracking: ${jobId}`);
    return true;
  }

  async download(jobId: string, localPath: string): Promise<string> {
    const status = await this.checkStatus(jobId);

    if (!status.videoUrl) {
      throw new VideoProviderError("kling", "NO_VIDEO", "Video URL not available");
    }

    // Download video file
    const response = await fetch(status.videoUrl);
    if (!response.ok) {
      throw new VideoProviderError("kling", "DOWNLOAD_FAILED", `Failed to download video: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const fs = await import("fs/promises");
    const path = await import("path");

    // Ensure directory exists
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, Buffer.from(buffer));

    logger.info(`Downloaded video to ${localPath}`);
    return localPath;
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private buildRequest(input: VideoGenerationInput): KlingCreateRequest {
    const request: KlingCreateRequest = {
      model: this.config.model,
      prompt: this.preparePrompt(input),
      duration: input.durationSeconds <= 5 ? "5" : "10",
      aspect_ratio: input.aspectRatio as "16:9" | "9:16" | "1:1",
      mode: input.quality === "cinematic" || input.quality === "high" ? "pro" : "std",
    };

    // Negative prompt
    if (input.negativePrompt) {
      request.negative_prompt = input.negativePrompt;
    }

    // Source image (img2vid)
    if (input.sourceType === "image" && input.sourceImage) {
      request.image_url = input.sourceImage;
    }

    // End image (interpolation)
    if (input.endImage) {
      request.end_image_url = input.endImage;
    }

    // Camera control
    if (input.cameraMotion) {
      request.camera_control = this.buildCameraControl(input.cameraMotion);
    }

    // CFG scale
    if (input.cfgScale) {
      request.cfg_scale = input.cfgScale;
    }

    return request;
  }

  private buildCameraControl(motion: CameraMotion): KlingCameraControl {
    const intensityMap = {
      subtle: 3,
      moderate: 6,
      dramatic: 10,
    };
    const intensity = intensityMap[motion.intensity];

    const config: KlingCameraControl["config"] = {};

    switch (motion.type) {
      case "pan":
        config.horizontal = motion.direction === "left" ? -intensity : intensity;
        break;
      case "tilt":
        config.vertical = motion.direction === "down" ? -intensity : intensity;
        break;
      case "zoom":
        config.zoom = motion.direction === "out" ? -intensity : intensity;
        break;
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
      case "handheld":
        // Simulate handheld with subtle movements
        config.horizontal = Math.random() * 2 - 1;
        config.vertical = Math.random() * 2 - 1;
        break;
      case "static":
      default:
        // No camera movement
        break;
    }

    return {
      type: Object.keys(config).length > 0 ? "custom" : "simple",
      config: Object.keys(config).length > 0 ? config : undefined,
    };
  }

  private async createTask(request: KlingCreateRequest): Promise<KlingTaskResponse> {
    const response = await fetch(`${this.baseUrl}/videos/image2video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new VideoProviderError(
        "kling",
        `HTTP_${response.status}`,
        error.message || `HTTP error ${response.status}`,
        response.status === 429 || response.status >= 500
      );
    }

    const data = await response.json();
    return data.data as KlingTaskResponse;
  }

  private async queryTask(taskId: string): Promise<KlingQueryResponse> {
    const response = await fetch(`${this.baseUrl}/videos/image2video/${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new VideoProviderError(
        "kling",
        `HTTP_${response.status}`,
        `Failed to query task: ${response.status}`,
        response.status >= 500
      );
    }

    const data = await response.json();
    return data.data as KlingQueryResponse;
  }

  private mapStatus(klingStatus: string): VideoStatus {
    switch (klingStatus) {
      case "submitted":
        return "queued";
      case "processing":
        return "processing";
      case "succeed":
        return "completed";
      case "failed":
        return "failed";
      default:
        return "processing";
    }
  }

  private handleError(error: unknown): VideoProviderError {
    if (error instanceof VideoProviderError) {
      return error;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return new VideoProviderError("kling", "UNKNOWN", message, true);
  }
}

// ============================================
// FACTORY REGISTRATION
// ============================================

export function createKlingProvider(apiKey?: string): KlingProvider {
  const defaultConfig = DEFAULT_PROVIDER_CONFIGS.kling;

  const config: VideoProviderConfig = {
    provider: "kling",
    apiKey: apiKey || process.env.KLING_API_KEY || "",
    model: defaultConfig.model!,
    maxConcurrent: defaultConfig.maxConcurrent!,
    timeoutMs: defaultConfig.timeoutMs!,
    capabilities: defaultConfig.capabilities!,
  };

  return new KlingProvider(config);
}

// Register with factory
registerProviderFactory("kling", (config) => new KlingProvider(config));
