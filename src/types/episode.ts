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

/**
 * Spécification audio complète d'un shot
 */
export interface ShotAudio {
  /** Piste musicale principale */
  music?: AudioTrack;
  /** Son d'ambiance */
  ambience?: AudioTrack;
  /** Effets sonores */
  sfx?: AudioTrack[];
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
}

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
}
