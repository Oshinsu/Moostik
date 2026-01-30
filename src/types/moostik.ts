/**
 * MOOSTIK - FICHIER DE COMPATIBILITÉ
 * 
 * Ce fichier re-exporte tous les types et données depuis les modules séparés
 * pour maintenir la compatibilité avec le code existant.
 * 
 * NOUVELLE ARCHITECTURE:
 * - Types: src/types/{episode,character,location,prompt}.ts
 * - Données: src/data/{characters,locations,invariants,camera-angles}.data.ts
 * - Helpers: src/data/prompt-helpers.ts
 */

// ============================================================================
// RE-EXPORT DES TYPES
// ============================================================================

// Episode types
export type {
  SceneType,
  VariationStatus,
  ShotStatus,
  Variation,
  Shot,
  Episode
} from "./episode";

// Character types
export type {
  RelationshipType,
  CharacterRelationship,
  Character
} from "./character";

// Location types
export type { Location } from "./location";

// Prompt types
export type {
  CameraAngle,
  MoostikPrompt
} from "./prompt";

// ============================================================================
// RE-EXPORT DES DONNÉES
// ============================================================================

export {
  MOOSTIK_CHARACTERS,
  HUMAN_CHARACTERS,
  getAllCharacters,
  getCharacterById,
  getMoostikCharacters,
  getHumanCharacters,
  getCharactersByRole
} from "@/data/characters.data";

export {
  MOOSTIK_LOCATIONS,
  getLocationById
} from "@/data/locations.data";

export {
  MOOSTIK_INVARIANTS,
  MOOSTIK_NEGATIVE_PROMPT
} from "@/data/invariants";

export {
  CAMERA_ANGLE_PROMPTS,
  CAMERA_ANGLES
} from "@/data/camera-angles";

// ============================================================================
// RE-EXPORT DES HELPERS
// ============================================================================

export {
  promptToText,
  createEmptyPrompt,
  createShot,
  createVariation,
  createShotVariations
} from "@/data/prompt-helpers";
