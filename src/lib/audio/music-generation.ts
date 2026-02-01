/**
 * MOOSTIK Music Generation Module
 * AI-powered soundtrack generation using Suno, Udio, and other providers
 */

import {
  MusicProvider,
  MusicProviderConfig,
  MusicGenerationInput,
  MusicGenerationOutput,
  MusicStyle,
  MusicMood,
  MOOSTIK_MUSIC_PRESETS,
  AudioFormat,
} from "./types";
import { createLogger, trackPerformance } from "../logger";
import { withRetry } from "../retry";
import { MoostikError } from "../errors";
import { config as appConfig } from "../config";

const logger = createLogger("MusicGeneration");

// ============================================
// MUSIC GENERATION ERROR
// ============================================

export class MusicGenerationError extends MoostikError {
  public readonly provider: MusicProvider;
  public readonly retryable: boolean;

  constructor(provider: MusicProvider, code: string, message: string, retryable = false) {
    super(`[${provider}] ${message}`, `MUSIC_${code}`, 500);
    this.provider = provider;
    this.retryable = retryable;
  }
}

// ============================================
// SUNO PROVIDER
// ============================================

interface SunoGenerateRequest {
  prompt: string;
  make_instrumental?: boolean;
  wait_audio?: boolean;
  model?: string;
}

interface SunoGenerateResponse {
  id: string;
  status: "pending" | "processing" | "complete" | "error";
  audio_url?: string;
  video_url?: string;
  metadata?: {
    duration?: number;
    tags?: string[];
  };
  error_message?: string;
}

async function generateSuno(
  input: MusicGenerationInput,
  config: MusicProviderConfig
): Promise<MusicGenerationOutput> {
  const baseUrl = config.baseUrl || "https://api.suno.ai/v1";

  // Build prompt with style and mood
  const prompt = buildMusicPrompt(input);

  const request: SunoGenerateRequest = {
    prompt,
    make_instrumental: input.instrumental ?? true,
    wait_audio: true, // Wait for completion
    model: "v4", // Latest model
  };

  logger.info("Starting Suno music generation", { prompt: prompt.slice(0, 100) });

  const response = await fetch(`${baseUrl}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new MusicGenerationError(
      "suno",
      `HTTP_${response.status}`,
      error.detail || error.message || `HTTP error ${response.status}`,
      response.status === 429 || response.status >= 500
    );
  }

  const data: SunoGenerateResponse = await response.json();

  if (data.status === "error") {
    throw new MusicGenerationError(
      "suno",
      "GENERATION_FAILED",
      data.error_message || "Music generation failed"
    );
  }

  return {
    id: data.id,
    provider: "suno",
    status: data.status === "complete" ? "completed" : "processing",
    audioUrl: data.audio_url,
    durationSeconds: data.metadata?.duration,
    format: "mp3",
    createdAt: new Date().toISOString(),
    completedAt: data.status === "complete" ? new Date().toISOString() : undefined,
  };
}

async function pollSunoStatus(
  taskId: string,
  config: MusicProviderConfig,
  timeoutMs = 300000
): Promise<MusicGenerationOutput> {
  const baseUrl = config.baseUrl || "https://api.suno.ai/v1";
  const startTime = Date.now();
  const pollInterval = 5000;

  while (Date.now() - startTime < timeoutMs) {
    const response = await fetch(`${baseUrl}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });

    if (!response.ok) {
      throw new MusicGenerationError(
        "suno",
        "POLL_FAILED",
        `Failed to poll status: ${response.status}`
      );
    }

    const data: SunoGenerateResponse = await response.json();

    if (data.status === "complete") {
      return {
        id: data.id,
        provider: "suno",
        status: "completed",
        audioUrl: data.audio_url,
        durationSeconds: data.metadata?.duration,
        format: "mp3",
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
    }

    if (data.status === "error") {
      throw new MusicGenerationError(
        "suno",
        "GENERATION_FAILED",
        data.error_message || "Music generation failed"
      );
    }

    await sleep(pollInterval);
  }

  throw new MusicGenerationError("suno", "TIMEOUT", "Music generation timed out", true);
}

// ============================================
// UDIO PROVIDER
// ============================================

interface UdioGenerateRequest {
  prompt: string;
  seed?: number;
  duration?: number;
  instrumental?: boolean;
  lyrics?: string;
}

interface UdioGenerateResponse {
  id: string;
  status: "queued" | "generating" | "succeeded" | "failed";
  output_url?: string;
  duration?: number;
  error?: string;
}

async function generateUdio(
  input: MusicGenerationInput,
  config: MusicProviderConfig
): Promise<MusicGenerationOutput> {
  const baseUrl = config.baseUrl || "https://api.udio.com/v1";

  const prompt = buildMusicPrompt(input);

  const request: UdioGenerateRequest = {
    prompt,
    duration: input.durationSeconds,
    instrumental: input.instrumental ?? true,
    lyrics: input.lyrics,
  };

  logger.info("Starting Udio music generation", { prompt: prompt.slice(0, 100) });

  const response = await fetch(`${baseUrl}/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new MusicGenerationError(
      "udio",
      `HTTP_${response.status}`,
      error.message || `HTTP error ${response.status}`,
      response.status === 429 || response.status >= 500
    );
  }

  const data: UdioGenerateResponse = await response.json();

  return {
    id: data.id,
    provider: "udio",
    status: data.status === "succeeded" ? "completed" : "processing",
    audioUrl: data.output_url,
    durationSeconds: data.duration,
    format: "mp3",
    createdAt: new Date().toISOString(),
    completedAt: data.status === "succeeded" ? new Date().toISOString() : undefined,
  };
}

async function pollUdioStatus(
  taskId: string,
  config: MusicProviderConfig,
  timeoutMs = 300000
): Promise<MusicGenerationOutput> {
  const baseUrl = config.baseUrl || "https://api.udio.com/v1";
  const startTime = Date.now();
  const pollInterval = 5000;

  while (Date.now() - startTime < timeoutMs) {
    const response = await fetch(`${baseUrl}/generations/${taskId}`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });

    if (!response.ok) {
      throw new MusicGenerationError(
        "udio",
        "POLL_FAILED",
        `Failed to poll status: ${response.status}`
      );
    }

    const data: UdioGenerateResponse = await response.json();

    if (data.status === "succeeded") {
      return {
        id: data.id,
        provider: "udio",
        status: "completed",
        audioUrl: data.output_url,
        durationSeconds: data.duration,
        format: "mp3",
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
    }

    if (data.status === "failed") {
      throw new MusicGenerationError(
        "udio",
        "GENERATION_FAILED",
        data.error || "Music generation failed"
      );
    }

    await sleep(pollInterval);
  }

  throw new MusicGenerationError("udio", "TIMEOUT", "Music generation timed out", true);
}

// ============================================
// PROMPT BUILDING
// ============================================

function buildMusicPrompt(input: MusicGenerationInput): string {
  const parts: string[] = [];

  // Base prompt
  parts.push(input.prompt);

  // Style
  if (input.style) {
    const styleParts: string[] = [];
    if (input.style.genre) styleParts.push(input.style.genre);
    if (input.style.subgenre) styleParts.push(input.style.subgenre);
    if (input.style.era) styleParts.push(`${input.style.era} era`);
    if (input.style.instruments?.length) {
      styleParts.push(`featuring ${input.style.instruments.join(", ")}`);
    }
    if (input.style.reference) styleParts.push(input.style.reference);
    if (styleParts.length > 0) {
      parts.push(`Style: ${styleParts.join(", ")}`);
    }
  }

  // Mood
  if (input.mood) {
    const moodParts: string[] = [];
    moodParts.push(input.mood.primary);
    if (input.mood.secondary) moodParts.push(input.mood.secondary);
    moodParts.push(`${input.mood.energy} energy`);
    if (input.mood.darkness > 0.7) moodParts.push("dark");
    else if (input.mood.darkness < 0.3) moodParts.push("bright");
    parts.push(`Mood: ${moodParts.join(", ")}`);
  }

  // Tempo
  if (input.tempo) {
    const bpmMap = { slow: "60-80 BPM", moderate: "90-120 BPM", fast: "130-160 BPM" };
    parts.push(`Tempo: ${input.tempo} (${bpmMap[input.tempo]})`);
  }

  // Duration hint
  parts.push(`Duration: approximately ${input.durationSeconds} seconds`);

  return parts.join(". ");
}

// ============================================
// MUSIC GENERATION MANAGER
// ============================================

export class MusicGenerationManager {
  private providers: Map<MusicProvider, MusicProviderConfig> = new Map();
  private defaultProvider: MusicProvider = "suno";

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Suno
    if (process.env.SUNO_API_KEY) {
      this.providers.set("suno", {
        provider: "suno",
        apiKey: process.env.SUNO_API_KEY,
        capabilities: {
          maxDurationSeconds: 240, // 4 minutes
          supportsLyrics: true,
          supportsInstrumentalOnly: true,
          supportsContinuation: true,
          supportsStyleTransfer: false,
          genres: ["pop", "rock", "electronic", "orchestral", "jazz", "hip-hop", "ambient", "cinematic"],
        },
      });
      logger.info("Initialized Suno music provider");
    }

    // Udio
    if (process.env.UDIO_API_KEY) {
      this.providers.set("udio", {
        provider: "udio",
        apiKey: process.env.UDIO_API_KEY,
        capabilities: {
          maxDurationSeconds: 300, // 5 minutes
          supportsLyrics: true,
          supportsInstrumentalOnly: true,
          supportsContinuation: true,
          supportsStyleTransfer: true,
          genres: ["pop", "rock", "electronic", "orchestral", "jazz", "hip-hop", "ambient", "metal", "classical"],
        },
      });
      logger.info("Initialized Udio music provider");
    }

    if (this.providers.size === 0) {
      logger.warn("No music providers configured. Set SUNO_API_KEY or UDIO_API_KEY.");
    }
  }

  /**
   * Generate music
   */
  async generate(
    input: MusicGenerationInput,
    provider?: MusicProvider
  ): Promise<MusicGenerationOutput> {
    const selectedProvider = provider || this.defaultProvider;
    const config = this.providers.get(selectedProvider);

    if (!config) {
      throw new MusicGenerationError(
        selectedProvider,
        "NOT_CONFIGURED",
        `Music provider ${selectedProvider} not configured`
      );
    }

    const perf = trackPerformance("musicGeneration");

    try {
      let result: MusicGenerationOutput;

      switch (selectedProvider) {
        case "suno":
          result = await withRetry(
            () => generateSuno(input, config),
            { maxRetries: 3, initialDelay: 2000 }
          );

          // Poll if not complete
          if (result.status !== "completed") {
            result = await pollSunoStatus(result.id, config);
          }
          break;

        case "udio":
          result = await withRetry(
            () => generateUdio(input, config),
            { maxRetries: 3, initialDelay: 2000 }
          );

          // Poll if not complete
          if (result.status !== "completed") {
            result = await pollUdioStatus(result.id, config);
          }
          break;

        default:
          throw new MusicGenerationError(
            selectedProvider,
            "UNSUPPORTED",
            `Provider ${selectedProvider} not implemented`
          );
      }

      // Download to local storage
      if (result.audioUrl) {
        result.localPath = await this.downloadToLocal(result, input);
      }

      perf.end();
      logger.info("Music generation completed", {
        provider: selectedProvider,
        duration: result.durationSeconds,
      });

      return result;

    } catch (error) {
      perf.end();
      logger.error("Music generation failed", error);
      throw error;
    }
  }

  /**
   * Generate music from MOOSTIK preset
   */
  async generateFromPreset(
    presetName: keyof typeof MOOSTIK_MUSIC_PRESETS,
    durationSeconds: number,
    customPrompt?: string
  ): Promise<MusicGenerationOutput> {
    const preset = MOOSTIK_MUSIC_PRESETS[presetName];
    if (!preset) {
      throw new MusicGenerationError(
        this.defaultProvider,
        "INVALID_PRESET",
        `Preset ${presetName} not found`
      );
    }

    const input: MusicGenerationInput = {
      prompt: customPrompt || `${presetName} scene music for MOOSTIK animated series`,
      style: preset.style as MusicStyle,
      mood: preset.mood as MusicMood,
      durationSeconds,
      instrumental: true,
    };

    return this.generate(input);
  }

  /**
   * Generate scene-appropriate music
   */
  async generateForScene(
    sceneType: string,
    durationSeconds: number,
    additionalContext?: string
  ): Promise<MusicGenerationOutput> {
    // Map scene type to preset
    const presetMap: Record<string, keyof typeof MOOSTIK_MUSIC_PRESETS> = {
      genocide: "genocide",
      death: "genocide",
      bar_scene: "barScene",
      training: "training",
      emotional: "emotional",
      flashback: "emotional",
      combat: "combat",
      battle: "combat",
    };

    const presetName = presetMap[sceneType] || "emotional";

    return this.generateFromPreset(
      presetName,
      durationSeconds,
      additionalContext
    );
  }

  /**
   * Download music to local storage
   */
  private async downloadToLocal(
    output: MusicGenerationOutput,
    input: MusicGenerationInput
  ): Promise<string> {
    if (!output.audioUrl) {
      throw new Error("No audio URL to download");
    }

    const response = await fetch(output.audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();

    const path = await import("path");
    const fs = await import("fs/promises");

    // Generate filename from prompt
    const safePrompt = input.prompt
      .slice(0, 30)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

    const localPath = path.join(
      appConfig.paths.output,
      "audio",
      "music",
      `${safePrompt}-${output.id}.${output.format || "mp3"}`
    );

    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, Buffer.from(buffer));

    logger.info(`Downloaded music to ${localPath}`);
    return localPath;
  }

  /**
   * Check if any provider is available
   */
  isAvailable(): boolean {
    return this.providers.size > 0;
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): MusicProvider[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get available presets
   */
  getAvailablePresets(): string[] {
    return Object.keys(MOOSTIK_MUSIC_PRESETS);
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let musicManagerInstance: MusicGenerationManager | null = null;

export function getMusicGenerationManager(): MusicGenerationManager {
  if (!musicManagerInstance) {
    musicManagerInstance = new MusicGenerationManager();
  }
  return musicManagerInstance;
}

// Utility
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
