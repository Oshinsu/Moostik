/**
 * MOOSTIK Audio Generation Types
 * Voice synthesis, music generation, and audio processing
 */

// ============================================
// VOICE SYNTHESIS TYPES
// ============================================

export type VoiceProvider = "elevenlabs" | "fish" | "bark" | "xtts" | "azure" | "google";

export interface VoiceProviderConfig {
  provider: VoiceProvider;
  apiKey: string;
  baseUrl?: string;
  maxConcurrent: number;
  capabilities: VoiceCapabilities;
}

export interface VoiceCapabilities {
  supportsCloning: boolean;
  supportsEmotions: boolean;
  supportsSSML: boolean;
  supportedLanguages: string[];
  maxTextLength: number;
  outputFormats: AudioFormat[];
  latencyMs: "realtime" | "fast" | "standard";
}

// Voice configuration
export interface VoiceConfig {
  voiceId: string;
  name: string;
  language: string;
  gender?: "male" | "female" | "neutral";
  age?: "child" | "young" | "adult" | "elderly";

  // Voice characteristics
  pitch?: number; // -1 to 1
  speed?: number; // 0.5 to 2.0
  stability?: number; // 0 to 1
  clarity?: number; // 0 to 1

  // Emotion settings (if supported)
  defaultEmotion?: VoiceEmotion;

  // Provider-specific
  providerVoiceId?: string;
  providerOptions?: Record<string, unknown>;
}

export type VoiceEmotion =
  | "neutral"
  | "happy"
  | "sad"
  | "angry"
  | "fearful"
  | "surprised"
  | "disgusted"
  | "whispering"
  | "shouting"
  | "crying";

// Character voice mapping
export interface CharacterVoice {
  characterId: string;
  characterName: string;
  voiceConfig: VoiceConfig;
  alternateVoices?: VoiceConfig[]; // For different ages, emotions
  sampleAudioUrl?: string;
  notes?: string;
}

// ============================================
// VOICE SYNTHESIS INPUT/OUTPUT
// ============================================

export interface VoiceSynthesisInput {
  text: string;
  voiceConfig: VoiceConfig;

  // Delivery
  emotion?: VoiceEmotion;
  intensity?: number; // 0-1

  // Pronunciation
  ssml?: string; // Optional SSML markup
  phonemes?: PhonemeOverride[];

  // Output
  format?: AudioFormat;
  sampleRate?: number;

  // Timing (for lip sync)
  generateTimestamps?: boolean;
  generatePhonemes?: boolean;

  // Provider options
  providerOptions?: Record<string, unknown>;
}

export interface PhonemeOverride {
  word: string;
  phoneme: string;
}

export type AudioFormat = "mp3" | "wav" | "ogg" | "flac" | "pcm";

export interface VoiceSynthesisOutput {
  id: string;
  provider: VoiceProvider;
  status: "queued" | "processing" | "completed" | "failed";

  // Audio
  audioUrl?: string;
  localPath?: string;
  format?: AudioFormat;
  durationMs?: number;
  sampleRate?: number;

  // Timestamps (for lip sync)
  timestamps?: WordTimestamp[];
  phonemes?: PhonemeTimestamp[];

  // Metadata
  createdAt: string;
  completedAt?: string;

  // Error
  error?: AudioError;

  // Usage
  charactersUsed?: number;
}

export interface WordTimestamp {
  word: string;
  startMs: number;
  endMs: number;
}

export interface PhonemeTimestamp {
  phoneme: string;
  startMs: number;
  endMs: number;
}

export interface AudioError {
  code: string;
  message: string;
  retryable: boolean;
}

// ============================================
// DIALOGUE SYNTHESIS
// ============================================

export interface DialogueSynthesisRequest {
  episodeId: string;
  shotId: string;
  dialogueLines: DialogueLineInput[];
  outputFormat?: AudioFormat;
  mixWithAmbience?: boolean;
  ambienceTrack?: string;
}

export interface DialogueLineInput {
  id: string;
  characterId: string;
  text: string;
  textCreole?: string; // For Martinique Creole
  emotion: VoiceEmotion;
  intensity?: number;
  speakingStyle?: "normal" | "whisper" | "shout" | "sing";

  // Timing
  startTimeMs?: number; // If pre-defined
  pauseBeforeMs?: number;
  pauseAfterMs?: number;
}

export interface DialogueSynthesisOutput {
  shotId: string;
  lines: SynthesizedLine[];
  mixedAudioUrl?: string;
  mixedAudioPath?: string;
  totalDurationMs: number;
  timeline: DialogueTimeline;
}

export interface SynthesizedLine {
  lineId: string;
  characterId: string;
  audioUrl: string;
  localPath?: string;
  durationMs: number;
  startTimeMs: number;
  endTimeMs: number;
  timestamps?: WordTimestamp[];
  phonemes?: PhonemeTimestamp[];
}

export interface DialogueTimeline {
  segments: TimelineSegment[];
  totalDurationMs: number;
}

export interface TimelineSegment {
  type: "dialogue" | "pause" | "sfx" | "music";
  startMs: number;
  endMs: number;
  content?: string; // Line ID or SFX name
}

// ============================================
// MUSIC GENERATION TYPES
// ============================================

export type MusicProvider = "suno" | "udio" | "musiclm" | "stable-audio";

export interface MusicProviderConfig {
  provider: MusicProvider;
  apiKey: string;
  baseUrl?: string;
  capabilities: MusicCapabilities;
}

export interface MusicCapabilities {
  maxDurationSeconds: number;
  supportsLyrics: boolean;
  supportsInstrumentalOnly: boolean;
  supportsContinuation: boolean;
  supportsStyleTransfer: boolean;
  genres: string[];
}

export interface MusicGenerationInput {
  prompt: string;
  style?: MusicStyle;
  mood?: MusicMood;
  tempo?: "slow" | "moderate" | "fast";
  durationSeconds: number;

  // Content
  instrumental?: boolean;
  lyrics?: string;

  // Reference
  referenceAudioUrl?: string;
  styleReference?: string;

  // Technical
  format?: AudioFormat;
  sampleRate?: number;

  // Provider options
  providerOptions?: Record<string, unknown>;
}

export interface MusicStyle {
  genre: string;
  subgenre?: string;
  era?: string;
  instruments?: string[];
  reference?: string; // "like Hans Zimmer"
}

export interface MusicMood {
  primary: string; // "epic", "melancholic", "tense"
  secondary?: string;
  energy: "low" | "medium" | "high" | "building" | "climax";
  darkness: number; // 0 (bright) to 1 (dark)
}

export interface MusicGenerationOutput {
  id: string;
  provider: MusicProvider;
  status: "queued" | "processing" | "completed" | "failed";

  // Audio
  audioUrl?: string;
  localPath?: string;
  format?: AudioFormat;
  durationSeconds?: number;

  // Variations
  variations?: MusicVariation[];

  // Metadata
  createdAt: string;
  completedAt?: string;

  // Error
  error?: AudioError;
}

export interface MusicVariation {
  id: string;
  audioUrl: string;
  localPath?: string;
  style?: string;
}

// ============================================
// SOUND EFFECTS TYPES
// ============================================

export interface SoundEffect {
  id: string;
  name: string;
  category: SFXCategory;
  description: string;

  // Source
  audioUrl?: string;
  localPath?: string;
  durationMs: number;

  // Properties
  loopable: boolean;
  volume: number; // 0-1 default
  fadeInMs?: number;
  fadeOutMs?: number;

  // Tags for search
  tags: string[];
}

export type SFXCategory =
  | "ambient" // Background atmosphere
  | "foley" // Character movements
  | "impact" // Hits, explosions
  | "creature" // Animal/creature sounds
  | "nature" // Wind, rain, etc.
  | "urban" // City sounds
  | "horror" // Scary sounds
  | "sci-fi" // Futuristic sounds
  | "ui"; // Interface sounds

// ============================================
// AUDIO MIXING TYPES
// ============================================

export interface AudioMixInput {
  tracks: AudioTrackInput[];
  outputFormat: AudioFormat;
  outputSampleRate?: number;
  masterVolume?: number;
  normalization?: boolean;
}

export interface AudioTrackInput {
  id: string;
  type: "dialogue" | "music" | "sfx" | "ambience";
  audioPath: string;

  // Timing
  startMs: number;
  endMs?: number; // If trimming

  // Volume
  volume: number; // 0-1
  fadeInMs?: number;
  fadeOutMs?: number;

  // Effects
  pan?: number; // -1 (left) to 1 (right)
  reverb?: number; // 0-1
  compression?: boolean;

  // Looping
  loop?: boolean;
  loopCount?: number;
}

export interface AudioMixOutput {
  outputPath: string;
  format: AudioFormat;
  durationMs: number;
  peakLevel: number;
  rmsLevel: number;
}

// ============================================
// MOOSTIK-SPECIFIC AUDIO PRESETS
// ============================================

export const MOOSTIK_MUSIC_PRESETS = {
  genocide: {
    style: {
      genre: "orchestral",
      subgenre: "dark cinematic",
      reference: "like Requiem for a Dream meets Attack on Titan",
    },
    mood: {
      primary: "tragic",
      secondary: "horrific",
      energy: "climax" as const,
      darkness: 0.95,
    },
  },
  barScene: {
    style: {
      genre: "jazz",
      subgenre: "dark cabaret",
      instruments: ["piano", "double bass", "brushed drums", "muted trumpet"],
    },
    mood: {
      primary: "melancholic",
      secondary: "intimate",
      energy: "low" as const,
      darkness: 0.6,
    },
  },
  training: {
    style: {
      genre: "electronic",
      subgenre: "industrial",
      reference: "like Blade Runner 2049 action sequences",
    },
    mood: {
      primary: "intense",
      secondary: "determined",
      energy: "building" as const,
      darkness: 0.7,
    },
  },
  emotional: {
    style: {
      genre: "orchestral",
      subgenre: "minimalist",
      instruments: ["piano", "strings", "subtle choir"],
    },
    mood: {
      primary: "sorrowful",
      secondary: "hopeful",
      energy: "low" as const,
      darkness: 0.5,
    },
  },
  combat: {
    style: {
      genre: "hybrid orchestral",
      subgenre: "action trailer",
      reference: "like Two Steps From Hell",
    },
    mood: {
      primary: "aggressive",
      secondary: "heroic",
      energy: "high" as const,
      darkness: 0.75,
    },
  },
};

export const MOOSTIK_AMBIENCE_PRESETS = {
  tireCity: {
    description: "Abandoned tire dumps, wind through rubber, distant echoes",
    layers: ["wind_hollow", "rubber_creaking", "distant_drops", "insect_buzz"],
    volume: 0.3,
  },
  barTiSang: {
    description: "Dim bar ambience, quiet conversations, glasses clinking",
    layers: ["bar_murmur", "glass_clink", "jazz_distant", "ceiling_fan"],
    volume: 0.4,
  },
  fortSangNoir: {
    description: "Military fortress, echoing halls, distant training",
    layers: ["stone_echo", "distant_combat", "wind_fortress", "torch_crackle"],
    volume: 0.35,
  },
  genocideMemorial: {
    description: "Solemn silence, wind, distant mourning",
    layers: ["wind_sad", "silence_heavy", "distant_crying", "wind_chimes"],
    volume: 0.25,
  },
};

// ============================================
// CHARACTER VOICE PRESETS
// ============================================

export const MOOSTIK_CHARACTER_VOICES: Record<string, Partial<CharacterVoice>> = {
  "papy-tik": {
    voiceConfig: {
      voiceId: "papy-tik-elder",
      name: "Papy Tik (Elder)",
      language: "fr-FR",
      gender: "male",
      age: "elderly",
      pitch: -0.2,
      speed: 0.9,
      stability: 0.8,
      defaultEmotion: "neutral",
    },
    notes: "Wise, weathered voice. Mix of French and Creole. Carries weight of trauma.",
  },
  "young-dorval": {
    voiceConfig: {
      voiceId: "young-dorval",
      name: "Young Dorval",
      language: "fr-FR",
      gender: "male",
      age: "young",
      pitch: 0.1,
      speed: 1.0,
      stability: 0.6,
      defaultEmotion: "neutral",
    },
    notes: "Young, determined voice. Transforms through training arc.",
  },
  "baby-dorval": {
    voiceConfig: {
      voiceId: "baby-dorval",
      name: "Baby Dorval",
      language: "fr-FR",
      gender: "male",
      age: "child",
      pitch: 0.4,
      speed: 1.1,
      stability: 0.5,
      defaultEmotion: "neutral",
    },
    notes: "Innocent child voice. Mostly crying/cooing in genocide scenes.",
  },
  "mama-dorval": {
    voiceConfig: {
      voiceId: "mama-dorval",
      name: "Mama Dorval",
      language: "fr-FR",
      gender: "female",
      age: "adult",
      pitch: 0.1,
      speed: 1.0,
      stability: 0.7,
      defaultEmotion: "neutral",
    },
    notes: "Warm, protective voice. Creole lullabies. Dies in genocide.",
  },
  "general-aedes": {
    voiceConfig: {
      voiceId: "general-aedes",
      name: "General Aedes",
      language: "fr-FR",
      gender: "male",
      age: "adult",
      pitch: -0.3,
      speed: 0.95,
      stability: 0.9,
      defaultEmotion: "neutral",
    },
    notes: "Commanding military voice. Authoritative. Drill sergeant energy.",
  },
  "evil-pik": {
    voiceConfig: {
      voiceId: "evil-pik",
      name: "Evil Pik",
      language: "fr-FR",
      gender: "male",
      age: "adult",
      pitch: -0.1,
      speed: 1.05,
      stability: 0.5,
      defaultEmotion: "angry",
    },
    notes: "Menacing, unpredictable. Sadistic undertones.",
  },
  "narrator": {
    voiceConfig: {
      voiceId: "narrator-moostik",
      name: "Narrator",
      language: "fr-FR",
      gender: "male",
      age: "adult",
      pitch: 0,
      speed: 0.95,
      stability: 0.95,
      defaultEmotion: "neutral",
    },
    notes: "Documentary-style narrator. Grave, respectful tone for dark subjects.",
  },
};
