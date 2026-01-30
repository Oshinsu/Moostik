/**
 * MOOSTIK Voice Synthesis API
 * Text-to-speech for character dialogue using SOTA TTS models
 */

import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import * as fs from "fs/promises";
import * as path from "path";

export const maxDuration = 120;

// Voice profiles for MOOSTIK characters
const MOOSTIK_VOICES: Record<string, VoiceProfile> = {
  moustik: {
    id: "moustik",
    name: "Moustik",
    description: "Leader charismatique, voix grave et autoritaire",
    model: "xtts-v2",
    settings: {
      pitch: -2,
      speed: 0.95,
      emotion: "confident",
    },
  },
  viktor: {
    id: "viktor",
    name: "Viktor",
    description: "Assassin froid, voix basse et menaçante",
    model: "xtts-v2",
    settings: {
      pitch: -4,
      speed: 0.85,
      emotion: "menacing",
    },
  },
  elara: {
    id: "elara",
    name: "Elara",
    description: "Guérisseuse sage, voix douce et apaisante",
    model: "xtts-v2",
    settings: {
      pitch: 2,
      speed: 0.9,
      emotion: "gentle",
    },
  },
  zara: {
    id: "zara",
    name: "Zara",
    description: "Guerrière féroce, voix forte et agressive",
    model: "xtts-v2",
    settings: {
      pitch: 1,
      speed: 1.05,
      emotion: "aggressive",
    },
  },
  narrator: {
    id: "narrator",
    name: "Narrateur",
    description: "Voix off narrative, ton épique",
    model: "xtts-v2",
    settings: {
      pitch: 0,
      speed: 0.9,
      emotion: "dramatic",
    },
  },
};

interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  model: string;
  settings: {
    pitch: number;
    speed: number;
    emotion: string;
  };
  referenceAudio?: string; // URL or path to reference voice sample
}

interface VoiceSynthesisRequest {
  text: string;
  characterId?: string;
  voiceProfile?: Partial<VoiceProfile>;
  language?: string;
  outputFormat?: "wav" | "mp3";
  episodeId?: string;
  shotId?: string;
}

interface VoiceSynthesisResult {
  audioUrl: string;
  localPath?: string;
  duration: number;
  characterId?: string;
  text: string;
}

// Replicate TTS models
const TTS_MODELS = {
  "xtts-v2": "lucataco/xtts-v2:684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e",
  "bark": "suno-ai/bark:b76242b40d67c76ab6742e987628a2a9ac019e11d56ab96c4e91ce03b79b2787",
  "tortoise": "afiaka87/tortoise-tts:e9658de4b325863c4fcdc12d94bb7c9b54cbfe351b7ca1b36860008172b91c71",
};

export async function POST(request: NextRequest) {
  try {
    const body: VoiceSynthesisRequest = await request.json();

    if (!body.text) {
      return NextResponse.json(
        { error: "Missing required field: text" },
        { status: 400 }
      );
    }

    // Get voice profile
    let voice: VoiceProfile;
    if (body.characterId && MOOSTIK_VOICES[body.characterId]) {
      voice = { ...MOOSTIK_VOICES[body.characterId], ...body.voiceProfile };
    } else if (body.voiceProfile) {
      voice = {
        id: "custom",
        name: "Custom Voice",
        description: "",
        model: "xtts-v2",
        settings: {
          pitch: 0,
          speed: 1,
          emotion: "neutral",
        },
        ...body.voiceProfile,
      };
    } else {
      voice = MOOSTIK_VOICES.narrator;
    }

    // Initialize Replicate
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Build prompt with emotion/style hints
    const styledText = buildStyledText(body.text, voice);

    // Choose model and run
    const modelId = TTS_MODELS[voice.model as keyof typeof TTS_MODELS] || TTS_MODELS["xtts-v2"];

    console.log(`[Voice] Generating speech for ${voice.name}:`, body.text.slice(0, 50) + "...");

    let audioUrl: string;

    try {
      // Try XTTS-v2 (best quality)
      const output = await replicate.run(modelId, {
        input: {
          text: styledText,
          language: body.language || "fr",
          speaker_wav: voice.referenceAudio || undefined,
          cleanup_voice: true,
        },
      });

      audioUrl = typeof output === "string" ? output : (output as { audio?: string })?.audio || "";

    } catch (replicateError) {
      console.error("[Voice] Replicate error:", replicateError);

      // Fallback: use local espeak if available (for testing)
      const fallbackPath = await generateFallbackSpeech(body.text, voice, body.episodeId);
      if (fallbackPath) {
        audioUrl = `/api/audio/file?path=${encodeURIComponent(fallbackPath)}`;
      } else {
        return NextResponse.json(
          { error: "Voice synthesis failed - API unavailable" },
          { status: 503 }
        );
      }
    }

    // Save locally if episode context provided
    let localPath: string | undefined;
    if (audioUrl && body.episodeId && body.shotId) {
      localPath = await downloadAndSave(audioUrl, body.episodeId, body.shotId);
    }

    // Estimate duration (rough: 150 words per minute for French)
    const wordCount = body.text.split(/\s+/).length;
    const duration = (wordCount / 150) * 60 * (1 / voice.settings.speed);

    const result: VoiceSynthesisResult = {
      audioUrl,
      localPath,
      duration,
      characterId: voice.id,
      text: body.text,
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error("[Voice] Synthesis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Voice synthesis failed" },
      { status: 500 }
    );
  }
}

// GET - List available voices
export async function GET() {
  return NextResponse.json({
    voices: Object.values(MOOSTIK_VOICES).map(v => ({
      id: v.id,
      name: v.name,
      description: v.description,
    })),
    models: Object.keys(TTS_MODELS),
    languages: ["fr", "en", "es", "de", "it", "pt", "ja", "ko", "zh"],
  });
}

function buildStyledText(text: string, voice: VoiceProfile): string {
  // Add SSML-like hints for emotion (model-dependent)
  const emotionPrefixes: Record<string, string> = {
    confident: "[speaking confidently] ",
    menacing: "[speaking in a low, threatening tone] ",
    gentle: "[speaking softly and gently] ",
    aggressive: "[speaking loudly and aggressively] ",
    dramatic: "[speaking in a dramatic narrative voice] ",
    neutral: "",
  };

  const prefix = emotionPrefixes[voice.settings.emotion] || "";
  return prefix + text;
}

async function generateFallbackSpeech(
  text: string,
  voice: VoiceProfile,
  episodeId?: string
): Promise<string | null> {
  // This would use local espeak or piper for testing
  // For now, return null to indicate unavailable
  return null;
}

async function downloadAndSave(
  audioUrl: string,
  episodeId: string,
  shotId: string
): Promise<string> {
  const response = await fetch(audioUrl);
  if (!response.ok) {
    throw new Error("Failed to download audio");
  }

  const buffer = await response.arrayBuffer();

  const outputDir = path.join(process.cwd(), "output", "audio", episodeId);
  await fs.mkdir(outputDir, { recursive: true });

  const localPath = path.join(outputDir, `${shotId}-dialogue.wav`);
  await fs.writeFile(localPath, Buffer.from(buffer));

  return localPath;
}
