/**
 * MOOSTIK - Types Episode, Shot, Variation
 *
 * Ce module définit les types pour la structure narrative:
 * - Episodes: conteneur principal
 * - Acts: actes narratifs
 * - Shots: plans individuels avec prompts
 * - Variations: angles de caméra par shot
 * - Dialogue: système de dialogues/voix off
 * - Audio: spécifications sonores
 */

import type { MoostikPrompt } from "./prompt";

// ============================================================================
// TYPES DE BASE
// ============================================================================

export type SceneType =
  | "genocide"
  | "survival"
  | "training"
  | "planning"
  | "bar_scene"
  | "battle"
  | "emotional"
  | "establishing"
  | "flashback"
  | "montage"
  | "revelation";

export type VariationStatus = "pending" | "generating" | "completed" | "failed";
export type ShotStatus = "pending" | "in_progress" | "completed";

// ============================================================================
// VIDEO PROMPT DATA - SOTA Janvier 2026
// ============================================================================

/** Data for SOTA video generation prompt */
export interface VideoPromptData {
  /** Optimized video prompt for the specific model */
  prompt: string;
  /** Negative prompt (not supported by all models) */
  negativePrompt?: string;
  /** Duration in seconds */
  duration: number;
  /** Frames per second */
  fps: number;
  /** Aspect ratio (e.g., "21:9") */
  aspectRatio: string;
  /** Camera motion description */
  cameraMotion?: string;
  /** Audio prompt for models with native audio */
  audioPrompt?: string;
  /** First frame image URL */
  firstFrame?: string;
  /** Last frame image URL (for interpolation) */
  lastFrame?: string;
  /** Video provider to use */
  provider: string;
  /** Estimated cost in USD */
  estimatedCost: number;
  /** Model-specific configuration */
  modelConfig: Record<string, unknown>;
}

// ============================================================================
// SYSTÈME DE DIALOGUE
// ============================================================================

/** Type de ligne de dialogue */
export type DialogueType =
  | "spoken"      // Dialogue parlé par un personnage
  | "voiceover"   // Narration en voix off
  | "internal"    // Pensées internes d'un personnage
  | "whisper"     // Murmure/chuchotement
  | "scream"      // Cri
  | "song";       // Chanson (pour Stegomyia)

/** Émotion principale du dialogue */
export type DialogueEmotion =
  | "neutral"
  | "angry"
  | "sad"
  | "terrified"
  | "determined"
  | "loving"
  | "mocking"
  | "desperate"
  | "triumphant"
  | "melancholic";

/**
 * Représente une ligne de dialogue
 */
export interface DialogueLine {
  /** ID unique de la ligne */
  id: string;
  /** ID du personnage qui parle (ou "narrator" pour voix off) */
  speakerId: string;
  /** Nom du personnage (pour affichage) */
  speakerName: string;
  /** Texte du dialogue en français */
  text: string;
  /** Texte en créole martiniquais (optionnel) */
  textCreole?: string;
  /** Type de dialogue */
  type: DialogueType;
  /** Émotion principale */
  emotion: DialogueEmotion;
  /** Timing de début dans le shot (en secondes, 0 = début) */
  startTime?: number;
  /** Durée estimée (en secondes) */
  duration?: number;
  /** Notes de direction pour le doubleur */
  directionNotes?: string;
}

// ============================================================================
// SYSTÈME AUDIO
// ============================================================================

/** Type de piste audio */
export type AudioTrackType =
  | "music"       // Musique de fond
  | "ambience"    // Son d'ambiance
  | "sfx"         // Effet sonore ponctuel
  | "foley";      // Bruitage

/** Intensité audio */
export type AudioIntensity = "low" | "medium" | "high" | "building" | "climax";

/**
 * Spécification d'une piste audio
 */
export interface AudioTrack {
  /** Type de piste */
  type: AudioTrackType;
  /** Description de l'audio */
  description: string;
  /** Intensité */
  intensity: AudioIntensity;
  /** Référence à un morceau existant (ex: "Requiem for Attack on Titan") */
  reference?: string;
  /** Notes de mixage */
  mixNotes?: string;
}

/** Piste audio simplifiée pour un shot */
export interface ShotAudioTrack {
  /** Type de piste */
  type: AudioTrackType;
  /** Description de l'audio */
  description: string;
  /** Intensité */
  intensity: AudioIntensity;
  /** Référence à un morceau existant */
  reference?: string;
  /** Volume (0-1) */
  volume?: number;
}

/**
 * Spécification audio complète d'un shot
 */
export interface ShotAudio {
  /** Piste musicale principale */
  music?: ShotAudioTrack;
  /** Son d'ambiance */
  ambience?: ShotAudioTrack;
  /** Effets sonores */
  sfx?: ShotAudioTrack[];
  /** Ton émotionnel global */
  emotionalTone: string;
  /** Notes générales pour le sound designer */
  notes?: string;
}

// ============================================================================
// ACTES NARRATIFS
// ============================================================================

/**
 * Représente un acte narratif dans un épisode
 * Les actes permettent de regrouper les shots par section narrative
 */
export interface Act {
  id: string;
  number: number;
  title: string;
  description: string;
  shotIds: string[];
  /** IDs des personnages présents dans cet acte */
  characters?: string[];
  /** IDs des lieux utilisés dans cet acte */
  locations?: string[];
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface Variation {
  id: string;
  cameraAngle: import("./prompt").CameraAngle;
  status: VariationStatus;
  imageUrl?: string;
  localPath?: string;
  generatedAt?: string;
  seed?: number;
  
  // SOTA BLOODWINGS - Custom prompt per variation
  /** Custom prompt override for this specific variation */
  customPrompt?: import("@/lib/json-moostik-standard").JsonMoostik;
  /** SOTA version used for generation */
  sotaVersion?: string;
  /** Strategy used for this variation (chaos-wide, victim-pov, etc.) */
  strategy?: string;
  /** Human-readable description of this variation */
  description?: string;
  /** Prompt modifiers applied to this variation */
  promptOverrides?: {
    composition?: { framing: string; layout: string; depth: string };
    camera?: { angle: string; lens_mm?: number };
    focusShift?: string;
    momentShift?: string;
  };
  /** Is this a legacy pre-SOTA variation */
  isLegacy?: boolean;
  /** Original ID before legacy conversion */
  legacyId?: string;
  /** Reason for legacy status */
  legacyReason?: string;
  /** Any error during generation */
  error?: string;
  /** Creation timestamp */
  createdAt?: string;

  // Video generation - SOTA Janvier 2026
  /** Video generation status */
  videoStatus?: "pending" | "generating" | "completed" | "failed";
  /** Generated video URL (from provider CDN or Supabase) */
  videoUrl?: string;
  /** Local path to downloaded video */
  videoLocalPath?: string;
  /** Video provider used (kling-2.6, veo-3.1-fast, etc.) */
  videoProvider?: string;
  /** Video generation timestamp */
  videoGeneratedAt?: string;
  /** SOTA Video prompt data */
  videoPrompt?: VideoPromptData;
  /** Video duration in seconds */
  videoDuration?: number;
  /** Camera motion type */
  videoCameraMotion?: string;
  /** Video generation error */
  videoError?: string;

  // Lip sync
  /** Lip sync status */
  lipSyncStatus?: "pending" | "processing" | "completed" | "failed";
  /** Lip-synced video path */
  lipSyncVideoPath?: string;

  // Image Grading - SOTA Février 2026
  /** Overall quality score (0-100) */
  qualityScore?: number;
  /** Character fidelity score (0-100) */
  characterFidelityScore?: number;
  /** Environment fidelity score (0-100) */
  environmentFidelityScore?: number;
  /** DA compliance score (0-100) */
  daComplianceScore?: number;
  /** Narrative coherence score (0-100) */
  narrativeCoherenceScore?: number;
  /** Detailed grading feedback */
  gradingFeedback?: string;
  /** When the variation was graded */
  gradedAt?: string;
}

export interface Shot {
  id: string;
  number: number;
  name: string;
  description: string;
  /** Description narrative étendue (3-5 phrases) */
  narrativeDescription?: string;
  sceneType: SceneType;
  prompt: MoostikPrompt;
  variations: Variation[];
  status: ShotStatus;
  createdAt: string;
  updatedAt: string;
  characterIds: string[];
  locationIds: string[];
  /** Lignes de dialogue pour ce shot */
  dialogue?: DialogueLine[];
  /** Spécifications audio */
  audio?: ShotAudio;
  /** Durée estimée du shot en secondes */
  durationSeconds?: number;
  /** Notes de réalisation */
  directorNotes?: string;

  // Generated audio paths
  /** Path to synthesized dialogue audio file */
  dialogueAudioPath?: string;
  /** Path to mixed audio (dialogue + sfx + ambience) */
  mixedAudioPath?: string;
  /** Total dialogue duration in milliseconds */
  dialogueDurationMs?: number;

  // ============================================================================
  // VIDEO GENERATION STRATEGY (SOTA Janvier 2026)
  // ============================================================================
  
  /** Video generation strategy for this shot */
  videoStrategy?: VideoStrategy;
  
  /** Generated frames for chaining */
  generatedFrames?: GeneratedFrames;
}

// ============================================================================
// VIDEO STRATEGY TYPES
// ============================================================================

/** Frame strategy for video generation */
export type FrameStrategyType = "single" | "first_last" | "text_only";

/** Video provider type */
export type VideoProviderType = "kling" | "veo" | "luma" | "replicate";

/**
 * Video generation strategy for a shot
 * Determines how the video should be generated
 */
export interface VideoStrategy {
  /** Frame input strategy */
  frameType: FrameStrategyType;
  /** Recommended duration in seconds */
  duration: 4 | 5 | 6 | 8 | 10;
  /** Preferred video provider */
  provider: VideoProviderType;
  /** Shot to chain from (for continuity) */
  chainFromShot?: string;
  /** Motion complexity level */
  motionComplexity?: "static" | "subtle" | "dynamic" | "complex";
  /** Whether this shot requires chaining with previous */
  requiresChaining?: boolean;
  /** AI reasoning for this strategy */
  reasoning?: string;
}

/**
 * Generated frames extracted from video
 * Used for multi-shot chaining
 */
export interface GeneratedFrames {
  /** URL of first frame (for reference) */
  first?: string;
  /** URL of last frame (for chaining to next shot) */
  last?: string;
  /** Keyframes for storyboard preview */
  keyframes?: string[];
  /** Thumbnail URL */
  thumbnail?: string;
  /** When frames were extracted */
  extractedAt?: string;
}

/** Episode generation status */
export type EpisodeGenerationStatus =
  | "draft"           // Initial state, narrative defined
  | "images_pending"  // Waiting for image generation
  | "images_done"     // All images generated
  | "video_pending"   // Waiting for video generation
  | "video_done"      // All videos generated
  | "audio_pending"   // Waiting for audio (dialogue, music)
  | "audio_done"      // All audio generated
  | "composing"       // Final composition in progress
  | "completed"       // Final episode rendered
  | "failed";         // Generation failed

export interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  shots: Shot[];
  acts?: Act[]; // Actes narratifs optionnels pour organiser les shots
  characters?: string[]; // IDs des personnages de l'épisode
  locations?: string[]; // IDs des lieux de l'épisode
  createdAt: string;
  updatedAt: string;

  // Generation pipeline status
  /** Current generation status */
  generationStatus?: EpisodeGenerationStatus;
  /** Path to generated music track */
  musicPath?: string;
  /** Path to final composed video */
  finalVideoPath?: string;
  /** Total episode duration in milliseconds */
  totalDurationMs?: number;
  /** Last generation error (if failed) */
  generationError?: string;
  /** Generation completion timestamp */
  generationCompletedAt?: string;
}
