/**
 * ══════════════════════════════════════════════════════════════════════════════
 * WHITE LABEL - TYPES GÉNÉRIQUES
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Types réutilisables pour n'importe quel univers de série animée.
 * Basé sur les types Moostik mais généralisés.
 *
 * Sources:
 * - /home/user/Moostik/src/types/character.ts
 * - /home/user/Moostik/src/types/episode.ts
 * - /home/user/Moostik/src/types/location.ts
 * ══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: RELATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type RelationshipType =
  | "family_parent"
  | "family_child"
  | "family_sibling"
  | "romantic"
  | "best_friend"
  | "ally"
  | "rival"
  | "enemy"
  | "mentor"
  | "student"
  | "colleague"
  | "sidekick";

export interface Relationship {
  targetId: string;
  type: RelationshipType;
  description?: string;
  intensity?: number; // 1-10
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: CHARACTER (Générique)
// ═══════════════════════════════════════════════════════════════════════════════

export interface Character<TSpeciesType extends string = string> {
  id: string;
  name: string;

  // Classification
  speciesType: TSpeciesType;              // Ex: "moostik" | "human" | "dragon"
  role: "protagonist" | "antagonist" | "supporting" | "background";
  tier?: "T1" | "T2" | "T3";              // Importance narrative
  title?: string;                          // Ex: "Elder Commander"

  // Description
  description: string;
  backstory: string;
  age?: string;

  // Visuel
  visualTraits: string[];
  visualSignature?: {
    silhouette?: string;
    face?: string;
    distinctiveFeature?: string;          // La feature unique qui identifie ce perso
    [key: string]: string | undefined;
  };

  // Personnalité
  personality: string[];
  strengths?: string[];
  weaknesses?: string[];
  quirks?: string[];                       // Traits originaux/intéressants
  quotes?: string[];                       // Citations du personnage

  // Relations
  relationships?: Relationship[];
  favoriteLocations?: string[];            // IDs des lieux

  // Génération
  referencePrompt: string;
  referenceImages: string[];
  validated?: boolean;

  // Equipment (optionnel selon l'univers)
  equipment?: {
    [itemType: string]: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: LOCATION (Générique)
// ═══════════════════════════════════════════════════════════════════════════════

export type LocationScale = "microscopic" | "tiny" | "small" | "normal" | "large" | "colossal";

export interface Location {
  id: string;
  name: string;

  // Classification
  type: string;                            // Ex: "city", "fortress", "bar", "memorial"
  scale?: LocationScale;
  region?: string;                         // Région/zone dans l'univers

  // Description
  description: string;
  shortDescription?: string;

  // Architecture
  architecture: string[];                  // Éléments architecturaux
  atmosphere: string[];                    // Ambiance
  materials?: string[];                    // Matériaux utilisés

  // Règles
  forbidden?: string[];                    // Ce qui ne doit PAS apparaître ici
  required?: string[];                     // Ce qui DOIT apparaître

  // Génération
  referencePrompt: string;
  referenceImages: string[];
  validated?: boolean;

  // Métadonnées narratives
  significance?: string;                   // Importance narrative
  associatedCharacters?: string[];         // IDs des persos liés
  events?: string[];                       // Événements qui s'y sont passés
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: EPISODE STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════════

export type SceneType =
  | "establishing"      // Introduction d'un lieu
  | "dialogue"          // Conversation
  | "action"            // Action/combat
  | "emotional"         // Moment émotionnel
  | "flashback"         // Retour dans le passé
  | "montage"           // Séquence montage
  | "revelation"        // Révélation importante
  | "transition"        // Transition entre scènes
  | string;             // Types custom

export type VariationStatus = "pending" | "generating" | "completed" | "failed";
export type ShotStatus = "pending" | "in_progress" | "completed";

export interface CameraAngle {
  id: string;
  name: string;
  promptModifier: string;                  // Texte ajouté au prompt
}

export interface Variation {
  id: string;
  cameraAngle: string;                     // ID de l'angle
  status: VariationStatus;
  imageUrl?: string;
  videoUrl?: string;
  seed?: number;
  generatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface DialogueLine {
  id: string;
  speakerId: string;                       // ID du personnage
  text: string;
  type: "spoken" | "thought" | "narration" | "whisper" | "shout";
  emotion?: string;
  startTime?: number;                      // En secondes
  duration?: number;
}

export interface ShotAudio {
  music?: string;                          // Description/ID musique
  ambience?: string;                       // Ambiance sonore
  sfx?: string[];                          // Effets sonores
  emotionalTone?: string;
}

export interface VideoStrategy {
  frameType: "single" | "first_last" | "text_only";
  duration: 4 | 5 | 6 | 8 | 10;
  provider?: string;                       // Ex: "kling", "veo", "luma"
  chainFromShot?: string;                  // ID du shot précédent pour continuité
}

export interface Shot {
  id: string;
  number: number;
  name: string;
  description: string;

  // Classification
  sceneType: SceneType;
  status: ShotStatus;

  // Contenu
  prompt: StructuredPrompt;
  characterIds: string[];
  locationIds: string[];

  // Variations générées
  variations: Variation[];
  selectedVariationId?: string;

  // Audio & Dialogue
  dialogue?: DialogueLine[];
  audio?: ShotAudio;

  // Vidéo
  videoStrategy?: VideoStrategy;

  // Métadonnées
  notes?: string;
  tags?: string[];
}

export interface Act {
  id: string;
  number: number;
  title: string;
  description?: string;
  shotIds: string[];

  // Contexte de l'acte
  characterIds?: string[];
  locationIds?: string[];
  emotionalArc?: string;
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;

  // Structure
  acts: Act[];
  shots: Shot[];

  // Métadonnées
  duration?: number;                       // Durée estimée en secondes
  status: "draft" | "in_progress" | "completed" | "published";
  createdAt: string;
  updatedAt: string;

  // Contexte narratif
  timelinePosition?: string;               // Position dans la timeline
  previousEpisodeId?: string;
  nextEpisodeId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: STRUCTURED PROMPT (Pour la génération)
// ═══════════════════════════════════════════════════════════════════════════════

export interface StructuredPrompt {
  // But de l'image
  goal: string;

  // Sujets (personnages/objets)
  subjects: {
    id: string;
    priority: number;                      // 1 = plus important
    description: string;
    referenceImageUrl?: string;
    pose?: string;
    expression?: string;
  }[];

  // Scène
  scene: {
    locationId?: string;
    description: string;
    timeOfDay?: string;
    weather?: string;
    mood?: string;
  };

  // Composition
  composition: {
    framing: "extreme_close" | "close" | "medium" | "wide" | "extreme_wide";
    focusPoint?: string;
    depthOfField?: "shallow" | "medium" | "deep";
  };

  // Caméra
  camera: {
    angle?: string;                        // Ex: "low angle", "bird's eye"
    movement?: string;                     // Pour vidéo
    lens?: string;                         // Ex: "50mm", "wide angle"
  };

  // Éclairage
  lighting: {
    type: string;                          // Ex: "dramatic", "soft", "harsh"
    keyLight?: string;
    fillLight?: string;
    rimLight?: string;
  };

  // Texte à afficher (si applicable)
  text?: {
    content: string;
    style: string;
    position: string;
  };

  // Éléments custom
  custom?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: TIMELINE / LORE
// ═══════════════════════════════════════════════════════════════════════════════

export interface TimelineEvent {
  id: string;
  name: string;
  description: string;
  date?: string;                           // Date dans l'univers
  phase: string;                           // Ex: "before_event", "during_event", "after_event"
  significance: "minor" | "major" | "critical";
  involvedCharacters?: string[];
  involvedLocations?: string[];
}

export interface Timeline {
  events: TimelineEvent[];
  phases: {
    id: string;
    name: string;
    description: string;
    startEvent?: string;
    endEvent?: string;
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export function createEmptyCharacter<T extends string>(
  id: string,
  name: string,
  speciesType: T
): Character<T> {
  return {
    id,
    name,
    speciesType,
    role: "supporting",
    description: "",
    backstory: "",
    visualTraits: [],
    personality: [],
    referencePrompt: "",
    referenceImages: [],
    validated: false,
  };
}

export function createEmptyLocation(id: string, name: string): Location {
  return {
    id,
    name,
    type: "",
    description: "",
    architecture: [],
    atmosphere: [],
    referencePrompt: "",
    referenceImages: [],
    validated: false,
  };
}

export function createEmptyShot(number: number): Shot {
  return {
    id: `shot-${number}`,
    number,
    name: `Shot ${number}`,
    description: "",
    sceneType: "establishing",
    status: "pending",
    prompt: createEmptyPrompt(),
    characterIds: [],
    locationIds: [],
    variations: [],
  };
}

export function createEmptyPrompt(): StructuredPrompt {
  return {
    goal: "",
    subjects: [],
    scene: { description: "" },
    composition: { framing: "medium" },
    camera: {},
    lighting: { type: "natural" },
  };
}

export function createVariation(cameraAngleId: string): Variation {
  return {
    id: `var-${cameraAngleId}-${Date.now()}`,
    cameraAngle: cameraAngleId,
    status: "pending",
  };
}
