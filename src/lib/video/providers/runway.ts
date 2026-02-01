/**
 * MOOSTIK Runway Gen-4 Video Provider
 * Integration with Runway ML video generation API
 *
 * Runway excels at cinematic quality and longer generations
 * Best for: Establishing shots, dramatic sequences, high-quality output
 */

import {
  VideoProvider,
  VideoProviderConfig,
  VideoGenerationInput,
  VideoGenerationOutput,
  VideoStatus,
  CameraMotion,
  PROVIDER_CONFIGS,
} from "../types";
import { VideoProviderBase, VideoProviderError, registerProviderFactory } from "../provider-base";
import { createLogger } from "../../logger";

const logger = createLogger("Runway");

// ============================================
// RUNWAY API TYPES
// ============================================

interface RunwayCreateRequest {
  promptImage?: string;
  promptText: string;
  model: string;
  width?: number;
  height?: number;
  duration?: number;
  seed?: number;
  watermark?: boolean;
  motion?: RunwayMotionConfig;
}

interface RunwayMotionConfig {
  motionVector?: {
    x: number;
    y: number;
  };
  cameraMotion?: {
    horizontal?: number;
    vertical?: number;
    zoom?: number;
    rotation?: number;
  };
}

interface RunwayTaskResponse {
  id: string;
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  progress?: number;
  failure?: string;
  failureCode?: string;
  createdAt: string;
  output?: string[];
}

// ============================================
// RUNWAY PROVIDER IMPLEMENTATION
// ============================================

export class RunwayProvider extends VideoProviderBase {
  private baseUrl: string;

  constructor(config: VideoProviderConfig) {
    super(config);
    this.baseUrl = config.baseUrl || "https://api.runwayml.com/v1";
  }

  get name(): VideoProvider {
    return "luma-ray-2"; // Runway deprecated, using Luma Ray 2 as fallback
  }

  async generate(input: VideoGenerationInput): Promise<VideoGenerationOutput> {
    this.validateInput(input);

    const request = this.buildRequest(input);
    logger.info(`Starting Runway generation`, { prompt: input.prompt.slice(0, 100) });

    try {
      const response = await this.createTask(request);

      const output: VideoGenerationOutput = {
        id: response.id,
        provider: "luma-ray-2",
        status: this.mapStatus(response.status),
        progress: response.progress || 0,
        createdAt: response.createdAt,
      };

      this.activeJobs.set(response.id, output);
      return output;

    } catch (error) {
      logger.error("Runway generation failed", error);
      throw this.handleError(error);
    }
  }

  async checkStatus(jobId: string): Promise<VideoGenerationOutput> {
    try {
      const response = await this.queryTask(jobId);

      const output: VideoGenerationOutput = {
        id: jobId,
        provider: "luma-ray-2",
        status: this.mapStatus(response.status),
        progress: response.progress || 0,
        createdAt: response.createdAt,
      };

      if (response.status === "SUCCEEDED" && response.output?.[0]) {
        output.videoUrl = response.output[0];
        output.completedAt = new Date().toISOString();
      }

      if (response.status === "FAILED") {
        output.error = {
          code: response.failureCode || "GENERATION_FAILED",
          message: response.failure || "Unknown error",
          retryable: !response.failureCode?.includes("CONTENT_POLICY"),
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
    try {
      const response = await fetch(`${this.baseUrl}/tasks/${jobId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });

      if (response.ok) {
        this.activeJobs.delete(jobId);
        logger.info(`Cancelled Runway task: ${jobId}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error(`Failed to cancel Runway task: ${jobId}`, error);
      return false;
    }
  }

  async download(jobId: string, localPath: string): Promise<string> {
    const status = await this.checkStatus(jobId);

    if (!status.videoUrl) {
      throw new VideoProviderError("luma-ray-2", "NO_VIDEO", "Video URL not available");
    }

    const response = await fetch(status.videoUrl);
    if (!response.ok) {
      throw new VideoProviderError(
        "luma-ray-2",
        "DOWNLOAD_FAILED",
        `Failed to download video: ${response.status}`
      );
    }

    const buffer = await response.arrayBuffer();
    const fs = await import("fs/promises");
    const path = await import("path");

    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, Buffer.from(buffer));

    logger.info(`Downloaded Runway video to ${localPath}`);
    return localPath;
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private buildRequest(input: VideoGenerationInput): RunwayCreateRequest {
    const { width, height } = this.getResolutionDimensions(input);

    const request: RunwayCreateRequest = {
      model: this.config.replicateModel || "luma/ray-2",
      promptText: this.preparePrompt(input),
      width,
      height,
      duration: Math.min(input.durationSeconds, 16),
      watermark: false,
    };

    // Source image
    if (input.sourceType === "image" && input.sourceImage) {
      request.promptImage = input.sourceImage;
    }

    // Seed for reproducibility
    if (input.seed) {
      request.seed = input.seed;
    }

    // Motion control
    if (input.cameraMotion || input.motionIntensity) {
      request.motion = this.buildMotionConfig(input);
    }

    return request;
  }

  private getResolutionDimensions(input: VideoGenerationInput): { width: number; height: number } {
    const resolutionMap: Record<string, { width: number; height: number }> = {
      "720p": { width: 1280, height: 720 },
      "1080p": { width: 1920, height: 1080 },
      "2k": { width: 2560, height: 1440 },
      "4k": { width: 3840, height: 2160 },
    };

    const base = resolutionMap[input.resolution || "1080p"];

    // Adjust for aspect ratio
    switch (input.aspectRatio) {
      case "9:16":
        return { width: base.height, height: base.width };
      case "1:1":
        return { width: base.height, height: base.height };
      case "4:3":
        return { width: Math.round(base.height * 4 / 3), height: base.height };
      case "21:9":
        return { width: Math.round(base.height * 21 / 9), height: base.height };
      case "16:9":
      default:
        return base;
    }
  }

  private buildMotionConfig(input: VideoGenerationInput): RunwayMotionConfig {
    const config: RunwayMotionConfig = {};

    if (input.cameraMotion) {
      const intensity = {
        subtle: 0.3,
        moderate: 0.6,
        dramatic: 1.0,
      }[input.cameraMotion.intensity];

      const camera: RunwayMotionConfig["cameraMotion"] = {};

      switch (input.cameraMotion.type) {
        case "pan":
          camera.horizontal = input.cameraMotion.direction === "left" ? -intensity : intensity;
          break;
        case "tilt":
          camera.vertical = input.cameraMotion.direction === "down" ? -intensity : intensity;
          break;
        case "zoom":
          camera.zoom = input.cameraMotion.direction === "out" ? -intensity : intensity;
          break;
        case "orbit":
          camera.rotation = input.cameraMotion.direction === "counterclockwise" ? -intensity : intensity;
          break;
        case "crane":
          camera.vertical = input.cameraMotion.direction === "down" ? -intensity : intensity;
          break;
        case "dolly":
          camera.zoom = input.cameraMotion.direction === "out" ? -intensity : intensity;
          break;
      }

      if (Object.keys(camera).length > 0) {
        config.cameraMotion = camera;
      }
    }

    // Motion intensity for general movement
    if (input.motionIntensity) {
      config.motionVector = {
        x: 0,
        y: input.motionIntensity * 0.5, // Subtle vertical movement
      };
    }

    return config;
  }

  private async createTask(request: RunwayCreateRequest): Promise<RunwayTaskResponse> {
    const response = await fetch(`${this.baseUrl}/image-to-video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
        "X-Runway-Version": "2024-11-06", // API version
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new VideoProviderError(
        "luma-ray-2",
        `HTTP_${response.status}`,
        error.message || error.error || `HTTP error ${response.status}`,
        response.status === 429 || response.status >= 500
      );
    }

    return response.json();
  }

  private async queryTask(taskId: string): Promise<RunwayTaskResponse> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "X-Runway-Version": "2024-11-06",
      },
    });

    if (!response.ok) {
      throw new VideoProviderError(
        "luma-ray-2",
        `HTTP_${response.status}`,
        `Failed to query task: ${response.status}`,
        response.status >= 500
      );
    }

    return response.json();
  }

  private mapStatus(runwayStatus: string): VideoStatus {
    switch (runwayStatus) {
      case "PENDING":
        return "queued";
      case "RUNNING":
        return "processing";
      case "SUCCEEDED":
        return "completed";
      case "FAILED":
        return "failed";
      case "CANCELLED":
        return "cancelled";
      default:
        return "processing";
    }
  }

  private handleError(error: unknown): VideoProviderError {
    if (error instanceof VideoProviderError) {
      return error;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return new VideoProviderError("luma-ray-2", "UNKNOWN", message, true);
  }
}

// ============================================
// FACTORY REGISTRATION
// ============================================

export function createRunwayProvider(apiKey?: string): RunwayProvider {
  // Use luma-ray-2 as fallback since Runway is now deprecated in favor of Luma
  const defaultConfig = PROVIDER_CONFIGS["luma-ray-2"];

  const config: VideoProviderConfig = {
    ...defaultConfig,
    apiKey: apiKey || process.env.RUNWAY_API_KEY || "",
  };

  return new RunwayProvider(config);
}

// Register with factory
registerProviderFactory("luma-ray-2", (config) => new RunwayProvider(config));
