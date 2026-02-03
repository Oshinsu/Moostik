/**
 * ══════════════════════════════════════════════════════════════════════════════
 * WHITE LABEL - INDEX
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Point d'entrée pour le système white label de création de séries animées.
 * Permet de créer n'importe quel univers avec la même architecture que Moostik.
 *
 * USAGE:
 * ```typescript
 * import {
 *   UniverseConfig,
 *   createEmptyUniverseConfig,
 *   JsonStandardBuilder,
 *   Character,
 *   Location,
 * } from '@/lib/white-label';
 * ```
 *
 * SOURCES (Architecture basée sur):
 * - /home/user/Moostik/src/lib/moostik-bible.ts (Bible d'univers)
 * - /home/user/Moostik/src/lib/moostik-context.ts (Contexte de génération)
 * - /home/user/Moostik/src/lib/json-moostik-standard.ts (JSON Standard images)
 * - /home/user/Moostik/src/lib/json-kling-standard.ts (JSON Standard vidéo Kling)
 * - /home/user/Moostik/src/lib/json-veo-standard.ts (JSON Standard vidéo Veo)
 * - /home/user/Moostik/src/types/character.ts (Types personnages)
 * - /home/user/Moostik/src/types/episode.ts (Types épisodes)
 * - /home/user/Moostik/src/types/location.ts (Types lieux)
 * - /home/user/Moostik/src/data/invariants.ts (Invariants)
 * - /home/user/Moostik/src/data/characters.data.ts (Données personnages)
 * - /home/user/Moostik/src/data/locations.data.ts (Données lieux)
 * ══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION D'UNIVERS
// ═══════════════════════════════════════════════════════════════════════════════

export type {
  UniverseConfig,
  ColorPalette,
  Symbol,
  Materials,
  AnatomyFeature,
  AgeCharacteristics,
  ArchitectureStyle,
  ArchitectureElements,
  TechnologyRules,
  LoreEvent,
} from "./universe-config";

export {
  createEmptyUniverseConfig,
  validateUniverseConfig,
  generateSystemPrompt,
  getInvariantsArray,
  getNegativePromptString,
} from "./universe-config";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES GÉNÉRIQUES
// ═══════════════════════════════════════════════════════════════════════════════

export type {
  // Relations
  RelationshipType,
  Relationship,

  // Personnages
  Character,

  // Lieux
  LocationScale,
  Location,

  // Structure épisodes
  SceneType,
  VariationStatus,
  ShotStatus,
  CameraAngle,
  Variation,
  DialogueLine,
  ShotAudio,
  VideoStrategy,
  Shot,
  Act,
  Episode,

  // Prompts
  StructuredPrompt,

  // Timeline
  TimelineEvent,
  Timeline,
} from "./types";

export {
  createEmptyCharacter,
  createEmptyLocation,
  createEmptyShot,
  createEmptyPrompt,
  createVariation,
} from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// JSON STANDARD (Génération d'images)
// ═══════════════════════════════════════════════════════════════════════════════

export type {
  JsonStandard,
  JsonStandardMeta,
  JsonStandardReferences,
  JsonStandardSubject,
  JsonStandardScene,
  JsonStandardComposition,
  JsonStandardCamera,
  JsonStandardLighting,
  JsonStandardConstraints,
  JsonStandardParameters,
} from "./json-standard";

export {
  JsonStandardBuilder,
  structuredPromptToJsonStandard,
  CAMERA_ANGLE_PRESETS,
  LIGHTING_PRESETS,
} from "./json-standard";

// ═══════════════════════════════════════════════════════════════════════════════
// EXEMPLES
// ═══════════════════════════════════════════════════════════════════════════════

// Dragons Realm - Exemple complet d'univers alternatif
export { default as DragonsRealmExample } from "./examples/dragons-realm";
export {
  DRAGONS_REALM_CONFIG,
  DRAGONS_REALM_CHARACTERS,
  DRAGONS_REALM_LOCATIONS,
} from "./examples/dragons-realm";
