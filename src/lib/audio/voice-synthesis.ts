/**
 * MOOSTIK Voice Synthesis Module
 * Multi-provider voice generation with character voice management
 */

import {
  VoiceProvider,
  VoiceProviderConfig,
  VoiceSynthesisInput,
  VoiceSynthesisOutput,
  VoiceConfig,
  VoiceEmotion,
  CharacterVoice,
  DialogueSynthesisRequest,
  DialogueSynthesisOutput,
  SynthesizedLine,
  MOOSTIK_CHARACTER_VOICES,
  AudioError,
} from "./types";
import { createLogger, trackPerformance } from "../logger";
import { withRetry, RetryOptions } from "../retry";
import { MoostikError } from "../errors";
import { config as appConfig } from "../config";

const logger = createLogger("VoiceSynthesis");

// ============================================
// VOICE SYNTHESIS ERROR
// ============================================

export class VoiceSynthesisError extends MoostikError {
  public readonly provider: VoiceProvider;
  public readonly retryable: boolean;

  constructor(provider: VoiceProvider, code: string, message: string, retryable = false) {
    super(`[${provider}] ${message}`, `VOICE_${code}`, 500);
    this.provider = provider;
    this.retryable = retryable;
  }
}

// ============================================
// ELEVENLABS PROVIDER
// ============================================

interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

interface ElevenLabsRequest {
  text: string;
  model_id: string;
  voice_settings: ElevenLabsVoiceSettings;
  output_format?: string;
}

interface ElevenLabsTimestampResponse {
  audio_base64: string;
  alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  };
}

async function synthesizeElevenLabs(
  input: VoiceSynthesisInput,
  config: VoiceProviderConfig
): Promise<VoiceSynthesisOutput> {
  const voiceId = input.voiceConfig.providerVoiceId || input.voiceConfig.voiceId;
  const baseUrl = config.baseUrl || "https://api.elevenlabs.io/v1";

  // Map emotion to style
  const styleMap: Record<VoiceEmotion, number> = {
    neutral: 0,
    happy: 0.3,
    sad: 0.2,
    angry: 0.5,
    fearful: 0.4,
    surprised: 0.3,
    disgusted: 0.4,
    whispering: 0.1,
    shouting: 0.6,
    crying: 0.3,
  };

  const request: ElevenLabsRequest = {
    text: input.text,
    model_id: "eleven_multilingual_v2", // Best for non-English
    voice_settings: {
      stability: input.voiceConfig.stability ?? 0.5,
      similarity_boost: input.voiceConfig.clarity ?? 0.75,
      style: styleMap[input.emotion || "neutral"],
      use_speaker_boost: true,
    },
    output_format: input.format === "wav" ? "pcm_44100" : "mp3_44100_128",
  };

  // Choose endpoint based on timestamp requirement
  const endpoint = input.generateTimestamps
    ? `${baseUrl}/text-to-speech/${voiceId}/with-timestamps`
    : `${baseUrl}/text-to-speech/${voiceId}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": config.apiKey,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new VoiceSynthesisError(
      "elevenlabs",
      `HTTP_${response.status}`,
      error.detail?.message || `HTTP error ${response.status}`,
      response.status === 429 || response.status >= 500
    );
  }

  const output: VoiceSynthesisOutput = {
    id: `el-${Date.now()}`,
    provider: "elevenlabs",
    status: "completed",
    format: input.format || "mp3",
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  if (input.generateTimestamps) {
    const data: ElevenLabsTimestampResponse = await response.json();

    // Save audio from base64
    const audioBuffer = Buffer.from(data.audio_base64, "base64");
    output.audioUrl = `data:audio/mp3;base64,${data.audio_base64}`;

    // Extract word timestamps
    output.timestamps = extractWordTimestamps(data.alignment);
  } else {
    // Direct audio response
    const audioBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString("base64");
    output.audioUrl = `data:audio/mp3;base64,${base64}`;
  }

  return output;
}

function extractWordTimestamps(
  alignment: ElevenLabsTimestampResponse["alignment"]
): VoiceSynthesisOutput["timestamps"] {
  const words: VoiceSynthesisOutput["timestamps"] = [];
  let currentWord = "";
  let wordStart = 0;

  for (let i = 0; i < alignment.characters.length; i++) {
    const char = alignment.characters[i];
    const startTime = alignment.character_start_times_seconds[i] * 1000;
    const endTime = alignment.character_end_times_seconds[i] * 1000;

    if (char === " " || i === alignment.characters.length - 1) {
      if (char !== " ") currentWord += char;

      if (currentWord.trim()) {
        words.push({
          word: currentWord.trim(),
          startMs: wordStart,
          endMs: endTime,
        });
      }

      currentWord = "";
      wordStart = endTime;
    } else {
      if (!currentWord) wordStart = startTime;
      currentWord += char;
    }
  }

  return words;
}

// ============================================
// FISH AUDIO PROVIDER
// ============================================

interface FishAudioRequest {
  text: string;
  reference_id?: string;
  format?: string;
  latency?: "normal" | "balanced";
  streaming?: boolean;
}

async function synthesizeFishAudio(
  input: VoiceSynthesisInput,
  config: VoiceProviderConfig
): Promise<VoiceSynthesisOutput> {
  const voiceId = input.voiceConfig.providerVoiceId || input.voiceConfig.voiceId;
  const baseUrl = config.baseUrl || "https://api.fish.audio/v1";

  const request: FishAudioRequest = {
    text: input.text,
    reference_id: voiceId,
    format: input.format || "mp3",
    latency: "balanced",
    streaming: false,
  };

  const response = await fetch(`${baseUrl}/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new VoiceSynthesisError(
      "fish",
      `HTTP_${response.status}`,
      error.message || `HTTP error ${response.status}`,
      response.status === 429 || response.status >= 500
    );
  }

  const audioBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(audioBuffer).toString("base64");

  return {
    id: `fish-${Date.now()}`,
    provider: "fish",
    status: "completed",
    audioUrl: `data:audio/${input.format || "mp3"};base64,${base64}`,
    format: input.format || "mp3",
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}

// ============================================
// VOICE SYNTHESIS MANAGER
// ============================================

export class VoiceSynthesisManager {
  private providers: Map<VoiceProvider, VoiceProviderConfig> = new Map();
  private characterVoices: Map<string, CharacterVoice> = new Map();
  private defaultProvider: VoiceProvider = "elevenlabs";

  constructor() {
    this.initializeProviders();
    this.initializeCharacterVoices();
  }

  private initializeProviders(): void {
    // ElevenLabs
    if (process.env.ELEVENLABS_API_KEY) {
      this.providers.set("elevenlabs", {
        provider: "elevenlabs",
        apiKey: process.env.ELEVENLABS_API_KEY,
        maxConcurrent: 5,
        capabilities: {
          supportsCloning: true,
          supportsEmotions: true,
          supportsSSML: false,
          supportedLanguages: ["en", "fr", "es", "de", "it", "pt", "pl", "hi", "ar", "zh", "ja", "ko"],
          maxTextLength: 5000,
          outputFormats: ["mp3", "wav", "ogg"],
          latencyMs: "fast",
        },
      });
      logger.info("Initialized ElevenLabs voice provider");
    }

    // Fish Audio
    if (process.env.FISH_AUDIO_API_KEY) {
      this.providers.set("fish", {
        provider: "fish",
        apiKey: process.env.FISH_AUDIO_API_KEY,
        maxConcurrent: 3,
        capabilities: {
          supportsCloning: true,
          supportsEmotions: false,
          supportsSSML: false,
          supportedLanguages: ["en", "zh", "ja", "fr", "es", "de"],
          maxTextLength: 10000,
          outputFormats: ["mp3", "wav"],
          latencyMs: "standard",
        },
      });
      logger.info("Initialized Fish Audio voice provider");
    }

    if (this.providers.size === 0) {
      logger.warn("No voice providers configured. Set API keys in environment.");
    }
  }

  private initializeCharacterVoices(): void {
    // Load MOOSTIK character voices
    for (const [characterId, voiceData] of Object.entries(MOOSTIK_CHARACTER_VOICES)) {
      if (voiceData.voiceConfig) {
        this.characterVoices.set(characterId, {
          characterId,
          characterName: voiceData.voiceConfig.name || characterId,
          voiceConfig: voiceData.voiceConfig as VoiceConfig,
          notes: voiceData.notes,
        });
      }
    }
    logger.info(`Loaded ${this.characterVoices.size} character voices`);
  }

  /**
   * Synthesize single voice line
   */
  async synthesize(
    input: VoiceSynthesisInput,
    provider?: VoiceProvider
  ): Promise<VoiceSynthesisOutput> {
    const selectedProvider = provider || this.defaultProvider;
    const config = this.providers.get(selectedProvider);

    if (!config) {
      throw new VoiceSynthesisError(
        selectedProvider,
        "NOT_CONFIGURED",
        `Voice provider ${selectedProvider} not configured`
      );
    }

    const perf = trackPerformance("voiceSynthesis");

    try {
      let result: VoiceSynthesisOutput;

      switch (selectedProvider) {
        case "elevenlabs":
          result = await withRetry(
            () => synthesizeElevenLabs(input, config),
            { maxRetries: 3, initialDelay: 1000 }
          );
          break;

        case "fish":
          result = await withRetry(
            () => synthesizeFishAudio(input, config),
            { maxRetries: 3, initialDelay: 1000 }
          );
          break;

        default:
          throw new VoiceSynthesisError(
            selectedProvider,
            "UNSUPPORTED",
            `Provider ${selectedProvider} not implemented`
          );
      }

      perf.end();
      logger.info(`Voice synthesis completed`, {
        provider: selectedProvider,
        textLength: input.text.length,
      });

      return result;

    } catch (error) {
      perf.end();
      logger.error("Voice synthesis failed", error);
      throw error;
    }
  }

  /**
   * Synthesize dialogue for a shot
   */
  async synthesizeDialogue(
    request: DialogueSynthesisRequest
  ): Promise<DialogueSynthesisOutput> {
    const { shotId, dialogueLines } = request;
    const perf = trackPerformance("dialogueSynthesis");

    const synthesizedLines: SynthesizedLine[] = [];
    let currentTimeMs = 0;

    for (const line of dialogueLines) {
      // Get character voice
      const characterVoice = this.characterVoices.get(line.characterId);
      if (!characterVoice) {
        logger.warn(`No voice configured for character: ${line.characterId}`);
        continue;
      }

      // Add pause before
      if (line.pauseBeforeMs) {
        currentTimeMs += line.pauseBeforeMs;
      }

      // Synthesize line
      const input: VoiceSynthesisInput = {
        text: line.textCreole || line.text, // Prefer Creole if available
        voiceConfig: characterVoice.voiceConfig,
        emotion: line.emotion as VoiceEmotion,
        intensity: line.intensity,
        generateTimestamps: true, // For lip sync
        generatePhonemes: true,
      };

      try {
        const result = await this.synthesize(input);

        // Save locally
        const localPath = await this.saveAudioLocally(
          result,
          request.episodeId,
          shotId,
          line.id
        );

        // Estimate duration from audio (or use result if available)
        const durationMs = result.durationMs || this.estimateDuration(line.text);

        synthesizedLines.push({
          lineId: line.id,
          characterId: line.characterId,
          audioUrl: result.audioUrl!,
          localPath,
          durationMs,
          startTimeMs: line.startTimeMs ?? currentTimeMs,
          endTimeMs: (line.startTimeMs ?? currentTimeMs) + durationMs,
          timestamps: result.timestamps,
          phonemes: result.phonemes,
        });

        currentTimeMs = (line.startTimeMs ?? currentTimeMs) + durationMs;

        // Add pause after
        if (line.pauseAfterMs) {
          currentTimeMs += line.pauseAfterMs;
        }

      } catch (error) {
        logger.error(`Failed to synthesize line ${line.id}`, error);
      }
    }

    perf.end();

    // Build timeline
    const timeline = this.buildTimeline(synthesizedLines);

    return {
      shotId,
      lines: synthesizedLines,
      totalDurationMs: currentTimeMs,
      timeline,
    };
  }

  /**
   * Save audio to local storage
   */
  private async saveAudioLocally(
    output: VoiceSynthesisOutput,
    episodeId: string,
    shotId: string,
    lineId: string
  ): Promise<string> {
    if (!output.audioUrl?.startsWith("data:")) {
      // Download from URL
      const response = await fetch(output.audioUrl!);
      const buffer = await response.arrayBuffer();
      output.audioUrl = `data:audio/${output.format};base64,${Buffer.from(buffer).toString("base64")}`;
    }

    const base64Data = output.audioUrl.split(",")[1];
    const audioBuffer = Buffer.from(base64Data, "base64");

    const path = await import("path");
    const fs = await import("fs/promises");

    const localPath = path.join(
      appConfig.paths.output,
      "audio",
      "dialogue",
      episodeId,
      shotId,
      `${lineId}.${output.format || "mp3"}`
    );

    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, audioBuffer);

    return localPath;
  }

  /**
   * Estimate speech duration from text
   */
  private estimateDuration(text: string): number {
    // Average speaking rate: ~150 words per minute
    const words = text.split(/\s+/).length;
    return (words / 150) * 60 * 1000; // ms
  }

  /**
   * Build dialogue timeline
   */
  private buildTimeline(lines: SynthesizedLine[]): DialogueSynthesisOutput["timeline"] {
    const segments: DialogueSynthesisOutput["timeline"]["segments"] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Add dialogue segment
      segments.push({
        type: "dialogue",
        startMs: line.startTimeMs,
        endMs: line.endTimeMs,
        content: line.lineId,
      });

      // Add pause segment if gap before next line
      if (i < lines.length - 1) {
        const nextLine = lines[i + 1];
        if (nextLine.startTimeMs > line.endTimeMs) {
          segments.push({
            type: "pause",
            startMs: line.endTimeMs,
            endMs: nextLine.startTimeMs,
          });
        }
      }
    }

    const totalDurationMs = lines.length > 0
      ? lines[lines.length - 1].endTimeMs
      : 0;

    return { segments, totalDurationMs };
  }

  // ============================================
  // CHARACTER VOICE MANAGEMENT
  // ============================================

  /**
   * Get character voice configuration
   */
  getCharacterVoice(characterId: string): CharacterVoice | undefined {
    return this.characterVoices.get(characterId);
  }

  /**
   * Set character voice configuration
   */
  setCharacterVoice(voice: CharacterVoice): void {
    this.characterVoices.set(voice.characterId, voice);
  }

  /**
   * Get all character voices
   */
  getAllCharacterVoices(): CharacterVoice[] {
    return Array.from(this.characterVoices.values());
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
  getAvailableProviders(): VoiceProvider[] {
    return Array.from(this.providers.keys());
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let voiceManagerInstance: VoiceSynthesisManager | null = null;

export function getVoiceSynthesisManager(): VoiceSynthesisManager {
  if (!voiceManagerInstance) {
    voiceManagerInstance = new VoiceSynthesisManager();
  }
  return voiceManagerInstance;
}
