/**
 * MOOSTIK - Types Episode, Shot, Variation
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
  | "flashback";

export type VariationStatus = "pending" | "generating" | "completed" | "failed";
export type ShotStatus = "pending" | "in_progress" | "completed";

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
  sceneType: SceneType;
  prompt: MoostikPrompt;
  variations: Variation[];
  status: ShotStatus;
  createdAt: string;
  updatedAt: string;
  characterIds: string[];
  locationIds: string[];
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
