/**
 * MOOSTIK Lip Sync Module
 * Synchronize dialogue audio with character animations
 * Supports multiple lip-sync providers and phoneme-based animation
 */

import {
  VoiceSynthesisOutput,
  PhonemeTimestamp,
  WordTimestamp,
  AudioFormat,
} from "./types";
import { createLogger, trackPerformance } from "../logger";
import { withRetry } from "../retry";
import { MoostikError } from "../errors";
import { config as appConfig } from "../config";

const logger = createLogger("LipSync");

// ============================================
// LIP SYNC TYPES
// ============================================

export type LipSyncProvider = "sadtalker" | "wav2lip" | "did" | "synclabs" | "heygen";

export interface LipSyncProviderConfig {
  provider: LipSyncProvider;
  apiKey?: string;
  baseUrl?: string;
  capabilities: LipSyncCapabilities;
}

export interface LipSyncCapabilities {
  supportsVideo: boolean;
  supportsImage: boolean;
  maxVideoDurationSeconds: number;
  outputResolutions: string[];
  processingSpeed: "realtime" | "fast" | "standard";
  qualityLevels: string[];
}

export interface LipSyncInput {
  // Source face
  sourceType: "image" | "video";
  sourceUrl: string;

  // Audio
  audioUrl: string;
  audioDurationMs?: number;

  // Timing data (optional, for precise sync)
  phonemes?: PhonemeTimestamp[];
  wordTimestamps?: WordTimestamp[];

  // Output settings
  outputFormat?: "mp4" | "webm";
  resolution?: string;
  quality?: "draft" | "standard" | "high";
  fps?: number;

  // Advanced
  enhanceFace?: boolean;
  smoothing?: number; // 0-1
  expressiveness?: number; // 0-1
}

export interface LipSyncOutput {
  id: string;
  provider: LipSyncProvider;
  status: "queued" | "processing" | "completed" | "failed";

  // Result
  videoUrl?: string;
  localPath?: string;
  durationMs?: number;

  // Metadata
  createdAt: string;
  completedAt?: string;
  processingTimeMs?: number;

  // Error
  error?: LipSyncError;
}

export interface LipSyncError {
  code: string;
  message: string;
  retryable: boolean;
}

// ============================================
// LIP SYNC ERROR
// ============================================

export class LipSyncGenerationError extends MoostikError {
  public readonly provider: LipSyncProvider;
  public readonly retryable: boolean;

  constructor(provider: LipSyncProvider, code: string, message: string, retryable = false) {
    super(`[${provider}] ${message}`, `LIPSYNC_${code}`, 500);
    this.provider = provider;
    this.retryable = retryable;
  }
}

// ============================================
// SADTALKER PROVIDER
// ============================================

interface SadTalkerRequest {
  source_image?: string;
  source_video?: string;
  driven_audio: string;
  preprocess?: "crop" | "resize" | "full";
  still?: boolean;
  enhancer?: "gfpgan" | "RestoreFormer";
  batch_size?: number;
  pose_style?: number;
  expression_scale?: number;
}

interface SadTalkerResponse {
  task_id: string;
  status: "pending" | "processing" | "success" | "failed";
  output_url?: string;
  error?: string;
}

async function generateSadTalker(
  input: LipSyncInput,
  config: LipSyncProviderConfig
): Promise<LipSyncOutput> {
  const baseUrl = config.baseUrl || "https://api.sadtalker.ai/v1";

  const request: SadTalkerRequest = {
    driven_audio: input.audioUrl,
    preprocess: "crop",
    still: false,
    enhancer: input.enhanceFace ? "gfpgan" : undefined,
    expression_scale: input.expressiveness ?? 1.0,
  };

  if (input.sourceType === "image") {
    request.source_image = input.sourceUrl;
  } else {
    request.source_video = input.sourceUrl;
  }

  logger.info("Starting SadTalker lip sync");

  const response = await fetch(`${baseUrl}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: config.apiKey ? `Bearer ${config.apiKey}` : "",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new LipSyncGenerationError(
      "sadtalker",
      `HTTP_${response.status}`,
      error.message || `HTTP error ${response.status}`,
      response.status === 429 || response.status >= 500
    );
  }

  const data: SadTalkerResponse = await response.json();

  return {
    id: data.task_id,
    provider: "sadtalker",
    status: data.status === "success" ? "completed" : "processing",
    videoUrl: data.output_url,
    createdAt: new Date().toISOString(),
    completedAt: data.status === "success" ? new Date().toISOString() : undefined,
  };
}

// ============================================
// WAV2LIP PROVIDER
// ============================================

interface Wav2LipRequest {
  face: string; // Image or video URL
  audio: string;
  pads?: [number, number, number, number];
  smooth?: boolean;
  fps?: number;
}

interface Wav2LipResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  video_url?: string;
  error?: string;
}

async function generateWav2Lip(
  input: LipSyncInput,
  config: LipSyncProviderConfig
): Promise<LipSyncOutput> {
  const baseUrl = config.baseUrl || "https://api.wav2lip.ai/v1";

  const request: Wav2LipRequest = {
    face: input.sourceUrl,
    audio: input.audioUrl,
    smooth: (input.smoothing ?? 0.5) > 0.3,
    fps: input.fps ?? 25,
  };

  logger.info("Starting Wav2Lip lip sync");

  const response = await fetch(`${baseUrl}/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: config.apiKey ? `Bearer ${config.apiKey}` : "",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new LipSyncGenerationError(
      "wav2lip",
      `HTTP_${response.status}`,
      error.message || `HTTP error ${response.status}`,
      response.status === 429 || response.status >= 500
    );
  }

  const data: Wav2LipResponse = await response.json();

  return {
    id: data.id,
    provider: "wav2lip",
    status: data.status === "completed" ? "completed" : "processing",
    videoUrl: data.video_url,
    createdAt: new Date().toISOString(),
    completedAt: data.status === "completed" ? new Date().toISOString() : undefined,
  };
}

// ============================================
// D-ID PROVIDER
// ============================================

interface DIDRequest {
  source_url: string;
  script: {
    type: "audio";
    audio_url: string;
  };
  config?: {
    fluent?: boolean;
    stitch?: boolean;
  };
}

interface DIDResponse {
  id: string;
  status: "created" | "started" | "done" | "error";
  result_url?: string;
  error?: {
    kind: string;
    description: string;
  };
}

async function generateDID(
  input: LipSyncInput,
  config: LipSyncProviderConfig
): Promise<LipSyncOutput> {
  const baseUrl = config.baseUrl || "https://api.d-id.com";

  const request: DIDRequest = {
    source_url: input.sourceUrl,
    script: {
      type: "audio",
      audio_url: input.audioUrl,
    },
    config: {
      fluent: true,
      stitch: true,
    },
  };

  logger.info("Starting D-ID lip sync");

  const response = await fetch(`${baseUrl}/talks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${config.apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new LipSyncGenerationError(
      "did",
      `HTTP_${response.status}`,
      error.description || `HTTP error ${response.status}`,
      response.status === 429 || response.status >= 500
    );
  }

  const data: DIDResponse = await response.json();

  return {
    id: data.id,
    provider: "did",
    status: data.status === "done" ? "completed" : "processing",
    videoUrl: data.result_url,
    createdAt: new Date().toISOString(),
    completedAt: data.status === "done" ? new Date().toISOString() : undefined,
  };
}

// ============================================
// PHONEME TO VISEME MAPPING
// ============================================

/**
 * Maps phonemes to visemes (mouth shapes) for animation
 */
export const PHONEME_TO_VISEME: Record<string, string> = {
  // Bilabial (lips together)
  "p": "mbp", "b": "mbp", "m": "mbp",

  // Labiodental (teeth on lip)
  "f": "fv", "v": "fv",

  // Dental/Alveolar
  "th": "th", "dh": "th",
  "t": "td", "d": "td", "n": "td", "l": "td",
  "s": "sz", "z": "sz",

  // Postalveolar
  "sh": "sh", "zh": "sh", "ch": "sh", "jh": "sh",

  // Velar
  "k": "kg", "g": "kg", "ng": "kg",

  // Glottal
  "h": "h",

  // Approximants
  "r": "r", "w": "w", "y": "y",

  // Vowels
  "aa": "aa", "ae": "ae", "ah": "ah", "ao": "ao", "aw": "aw",
  "ay": "ay", "eh": "eh", "er": "er", "ey": "ey",
  "ih": "ih", "iy": "iy",
  "ow": "ow", "oy": "oy",
  "uh": "uh", "uw": "uw",

  // Silence
  "sil": "rest", "sp": "rest",
};

/**
 * Generate viseme timeline from phonemes
 */
export function phonemesToVisemes(
  phonemes: PhonemeTimestamp[]
): Array<{ viseme: string; startMs: number; endMs: number }> {
  return phonemes.map((p) => ({
    viseme: PHONEME_TO_VISEME[p.phoneme.toLowerCase()] || "rest",
    startMs: p.startMs,
    endMs: p.endMs,
  }));
}

// ============================================
// LIP SYNC MANAGER
// ============================================

export class LipSyncManager {
  private providers: Map<LipSyncProvider, LipSyncProviderConfig> = new Map();
  private defaultProvider: LipSyncProvider = "sadtalker";

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // SadTalker (can work locally or via API)
    this.providers.set("sadtalker", {
      provider: "sadtalker",
      apiKey: process.env.SADTALKER_API_KEY,
      baseUrl: process.env.SADTALKER_API_URL,
      capabilities: {
        supportsVideo: true,
        supportsImage: true,
        maxVideoDurationSeconds: 120,
        outputResolutions: ["512x512", "1024x1024"],
        processingSpeed: "standard",
        qualityLevels: ["standard", "high"],
      },
    });

    // Wav2Lip
    if (process.env.WAV2LIP_API_KEY || process.env.WAV2LIP_API_URL) {
      this.providers.set("wav2lip", {
        provider: "wav2lip",
        apiKey: process.env.WAV2LIP_API_KEY,
        baseUrl: process.env.WAV2LIP_API_URL,
        capabilities: {
          supportsVideo: true,
          supportsImage: true,
          maxVideoDurationSeconds: 60,
          outputResolutions: ["256x256", "512x512"],
          processingSpeed: "fast",
          qualityLevels: ["draft", "standard"],
        },
      });
    }

    // D-ID
    if (process.env.DID_API_KEY) {
      this.providers.set("did", {
        provider: "did",
        apiKey: process.env.DID_API_KEY,
        capabilities: {
          supportsVideo: false,
          supportsImage: true,
          maxVideoDurationSeconds: 300,
          outputResolutions: ["512x512", "1024x1024"],
          processingSpeed: "standard",
          qualityLevels: ["standard", "high"],
        },
      });
      logger.info("Initialized D-ID lip sync provider");
    }

    logger.info(`Initialized ${this.providers.size} lip sync providers`);
  }

  /**
   * Generate lip-synced video
   */
  async generate(
    input: LipSyncInput,
    provider?: LipSyncProvider
  ): Promise<LipSyncOutput> {
    const selectedProvider = provider || this.defaultProvider;
    const config = this.providers.get(selectedProvider);

    if (!config) {
      throw new LipSyncGenerationError(
        selectedProvider,
        "NOT_CONFIGURED",
        `Lip sync provider ${selectedProvider} not configured`
      );
    }

    const perf = trackPerformance("lipSyncGeneration");

    try {
      let result: LipSyncOutput;

      switch (selectedProvider) {
        case "sadtalker":
          result = await withRetry(
            () => generateSadTalker(input, config),
            { maxRetries: 3, initialDelay: 2000 }
          );
          break;

        case "wav2lip":
          result = await withRetry(
            () => generateWav2Lip(input, config),
            { maxRetries: 3, initialDelay: 1000 }
          );
          break;

        case "did":
          result = await withRetry(
            () => generateDID(input, config),
            { maxRetries: 3, initialDelay: 2000 }
          );
          break;

        default:
          throw new LipSyncGenerationError(
            selectedProvider,
            "UNSUPPORTED",
            `Provider ${selectedProvider} not implemented`
          );
      }

      // Poll for completion if needed
      if (result.status !== "completed") {
        result = await this.pollForCompletion(result.id, selectedProvider, config);
      }

      // Download to local storage
      if (result.videoUrl) {
        result.localPath = await this.downloadToLocal(result, input);
      }

      perf.end();
      logger.info("Lip sync generation completed", {
        provider: selectedProvider,
        duration: result.durationMs,
      });

      return result;

    } catch (error) {
      perf.end();
      logger.error("Lip sync generation failed", error);
      throw error;
    }
  }

  /**
   * Poll for task completion
   */
  private async pollForCompletion(
    taskId: string,
    provider: LipSyncProvider,
    config: LipSyncProviderConfig,
    timeoutMs = 300000
  ): Promise<LipSyncOutput> {
    const startTime = Date.now();
    const pollInterval = 5000;

    while (Date.now() - startTime < timeoutMs) {
      const status = await this.checkStatus(taskId, provider, config);

      if (status.status === "completed") {
        return status;
      }

      if (status.status === "failed") {
        throw new LipSyncGenerationError(
          provider,
          "GENERATION_FAILED",
          status.error?.message || "Lip sync generation failed"
        );
      }

      await sleep(pollInterval);
    }

    throw new LipSyncGenerationError(provider, "TIMEOUT", "Lip sync generation timed out", true);
  }

  /**
   * Check task status
   */
  private async checkStatus(
    taskId: string,
    provider: LipSyncProvider,
    config: LipSyncProviderConfig
  ): Promise<LipSyncOutput> {
    const baseUrl = config.baseUrl || this.getDefaultBaseUrl(provider);

    const endpoints: Record<LipSyncProvider, string> = {
      sadtalker: `${baseUrl}/status/${taskId}`,
      wav2lip: `${baseUrl}/status/${taskId}`,
      did: `https://api.d-id.com/talks/${taskId}`,
      synclabs: `${baseUrl}/status/${taskId}`,
      heygen: `${baseUrl}/status/${taskId}`,
    };

    const response = await fetch(endpoints[provider], {
      headers: {
        Authorization: config.apiKey
          ? provider === "did"
            ? `Basic ${config.apiKey}`
            : `Bearer ${config.apiKey}`
          : "",
      },
    });

    if (!response.ok) {
      throw new LipSyncGenerationError(
        provider,
        "STATUS_CHECK_FAILED",
        `Failed to check status: ${response.status}`
      );
    }

    const data = await response.json();

    // Normalize response across providers
    return {
      id: taskId,
      provider,
      status: this.normalizeStatus(data.status, provider),
      videoUrl: data.output_url || data.result_url || data.video_url,
      createdAt: new Date().toISOString(),
      completedAt: data.status === "done" || data.status === "completed" || data.status === "success"
        ? new Date().toISOString()
        : undefined,
    };
  }

  private getDefaultBaseUrl(provider: LipSyncProvider): string {
    const defaults: Record<LipSyncProvider, string> = {
      sadtalker: "https://api.sadtalker.ai/v1",
      wav2lip: "https://api.wav2lip.ai/v1",
      did: "https://api.d-id.com",
      synclabs: "https://api.synclabs.so/v1",
      heygen: "https://api.heygen.com/v1",
    };
    return defaults[provider];
  }

  private normalizeStatus(
    status: string,
    provider: LipSyncProvider
  ): LipSyncOutput["status"] {
    const statusMaps: Record<LipSyncProvider, Record<string, LipSyncOutput["status"]>> = {
      sadtalker: { pending: "queued", processing: "processing", success: "completed", failed: "failed" },
      wav2lip: { pending: "queued", processing: "processing", completed: "completed", failed: "failed" },
      did: { created: "queued", started: "processing", done: "completed", error: "failed" },
      synclabs: { queued: "queued", processing: "processing", completed: "completed", failed: "failed" },
      heygen: { pending: "queued", processing: "processing", completed: "completed", failed: "failed" },
    };

    return statusMaps[provider][status] || "processing";
  }

  /**
   * Download video to local storage
   */
  private async downloadToLocal(
    output: LipSyncOutput,
    input: LipSyncInput
  ): Promise<string> {
    if (!output.videoUrl) {
      throw new Error("No video URL to download");
    }

    const response = await fetch(output.videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();

    const path = await import("path");
    const fs = await import("fs/promises");

    const localPath = path.join(
      appConfig.paths.output,
      "videos",
      "lipsync",
      `${output.id}.${input.outputFormat || "mp4"}`
    );

    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, Buffer.from(buffer));

    logger.info(`Downloaded lip sync video to ${localPath}`);
    return localPath;
  }

  /**
   * Generate viseme animation data from phonemes
   */
  generateVisemeData(phonemes: PhonemeTimestamp[]): Array<{
    viseme: string;
    startMs: number;
    endMs: number;
    intensity: number;
  }> {
    const visemes = phonemesToVisemes(phonemes);

    return visemes.map((v, i, arr) => {
      // Calculate intensity based on duration and position
      const duration = v.endMs - v.startMs;
      const baseIntensity = Math.min(1, duration / 100); // Longer = more intense

      // Vowels are more intense (mouth more open)
      const isVowel = ["aa", "ae", "ah", "ao", "aw", "ay", "eh", "er", "ey", "ih", "iy", "ow", "oy", "uh", "uw"]
        .includes(v.viseme);

      return {
        ...v,
        intensity: isVowel ? Math.min(1, baseIntensity * 1.3) : baseIntensity,
      };
    });
  }

  /**
   * Check if provider is available
   */
  isAvailable(): boolean {
    return this.providers.size > 0;
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): LipSyncProvider[] {
    return Array.from(this.providers.keys());
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let lipSyncManagerInstance: LipSyncManager | null = null;

export function getLipSyncManager(): LipSyncManager {
  if (!lipSyncManagerInstance) {
    lipSyncManagerInstance = new LipSyncManager();
  }
  return lipSyncManagerInstance;
}

// Utility
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
