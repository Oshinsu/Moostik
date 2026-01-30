/**
 * MOOSTIK - Types pour le Clustering de Scènes
 * 
 * Ces types permettent de regrouper les shots en clusters cohérents
 * pour une génération d'images plus cohérente visuellement.
 */

import type { Shot, SceneType, Act } from "./episode";

// Re-export Act for convenience
export type { Act } from "./episode";

// ============================================================================
// TYPES DE CLUSTER
// ============================================================================

export type ClusterType = "location" | "characters" | "act" | "sequence";

/**
 * Représente un cluster de scènes qui partagent des caractéristiques communes
 * (même lieu, mêmes personnages, même acte)
 */
export interface SceneCluster {
  id: string;
  name: string;
  type: ClusterType;
  shotIds: string[];
  sharedCharacterIds: string[];
  sharedLocationIds: string[];
  referenceImages: ClusterReferenceMap;
  coherenceRules: CoherenceRules;
  // Métadonnées additionnelles
  sceneTypes?: SceneType[];
  actId?: string;
  priority?: number;
}

/**
 * Map des références pour un cluster
 */
export interface ClusterReferenceMap {
  characters: Record<string, string[]>; // characterId -> referenceImageUrls
  locations: Record<string, string[]>;  // locationId -> referenceImageUrls
}

/**
 * Règles de cohérence pour un cluster
 */
export interface CoherenceRules {
  mustShareLighting: boolean;
  mustShareAtmosphere: boolean;
  sequentialGeneration: boolean;
}

// ============================================================================
// RÉFÉRENCES RÉSOLUES
// ============================================================================

/**
 * Référence d'un personnage avec ses images
 */
export interface CharacterReference {
  characterId: string;
  characterName: string;
  referenceImages: string[];
  validated: boolean;
  primaryImage?: string; // Image principale à utiliser
}

/**
 * Référence d'un lieu avec ses images
 */
export interface LocationReference {
  locationId: string;
  locationName: string;
  referenceImages: string[];
  validated: boolean;
  primaryImage?: string;
}

/**
 * Toutes les références résolues pour un shot ou un cluster
 */
export interface ClusterReferences {
  characters: CharacterReference[];
  locations: LocationReference[];
  allImageUrls: string[]; // Toutes les URLs combinées (max 14 pour Nano Banana Pro)
  totalCount: number;
  validatedCount: number;
  warnings: string[];
}

// ============================================================================
// VALIDATION PRÉ-GÉNÉRATION
// ============================================================================

/**
 * Référence manquante ou non validée
 */
export interface MissingReference {
  id: string;
  name: string;
  type: "character" | "location";
  reason: "missing" | "not_validated" | "no_images";
}

/**
 * Résultat de la vérification de readiness pour la génération
 */
export interface GenerationReadinessCheck {
  ready: boolean;
  canProceedWithWarnings: boolean;
  warnings: string[];
  errors: string[];
  missingCharacterRefs: MissingReference[];
  missingLocationRefs: MissingReference[];
  unvalidatedRefs: MissingReference[];
  // Statistiques
  stats: {
    totalShots: number;
    totalCharacters: number;
    totalLocations: number;
    charactersWithRefs: number;
    locationsWithRefs: number;
    validatedCharacters: number;
    validatedLocations: number;
  };
}

// ============================================================================
// RÉSULTAT D'ANALYSE
// ============================================================================

/**
 * Résultat de l'analyse d'un épisode en clusters
 */
export interface ClusterAnalysisResult {
  episodeId: string;
  clusters: SceneCluster[];
  actClusters: SceneCluster[];
  locationClusters: SceneCluster[];
  characterClusters: SceneCluster[];
  unclustered: string[]; // shotIds qui n'appartiennent à aucun cluster
  totalShots: number;
  totalClusters: number;
}

// ============================================================================
// OPTIONS DE GÉNÉRATION
// ============================================================================

/**
 * Options pour la génération par cluster
 */
export interface ClusterGenerationOptions {
  maxParallelShots: number;
  maxParallelVariations: number;
  respectClusterOrder: boolean; // Générer les shots d'un cluster en séquence
  skipUnvalidatedRefs: boolean; // Ne pas générer si refs non validées
  fallbackToAnyRef: boolean; // Utiliser n'importe quelle ref si validée absente
}

/**
 * Configuration par défaut pour la génération
 */
export const DEFAULT_CLUSTER_GENERATION_OPTIONS: ClusterGenerationOptions = {
  maxParallelShots: 3,
  maxParallelVariations: 5,
  respectClusterOrder: true,
  skipUnvalidatedRefs: false,
  fallbackToAnyRef: true,
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Crée un cluster vide avec les valeurs par défaut
 */
export function createEmptyCluster(
  id: string,
  name: string,
  type: ClusterType
): SceneCluster {
  return {
    id,
    name,
    type,
    shotIds: [],
    sharedCharacterIds: [],
    sharedLocationIds: [],
    referenceImages: {
      characters: {},
      locations: {},
    },
    coherenceRules: {
      mustShareLighting: type === "location" || type === "sequence",
      mustShareAtmosphere: type === "location",
      sequentialGeneration: type === "sequence",
    },
  };
}

/**
 * Crée un résultat de readiness check vide
 */
export function createEmptyReadinessCheck(): GenerationReadinessCheck {
  return {
    ready: false,
    canProceedWithWarnings: false,
    warnings: [],
    errors: [],
    missingCharacterRefs: [],
    missingLocationRefs: [],
    unvalidatedRefs: [],
    stats: {
      totalShots: 0,
      totalCharacters: 0,
      totalLocations: 0,
      charactersWithRefs: 0,
      locationsWithRefs: 0,
      validatedCharacters: 0,
      validatedLocations: 0,
    },
  };
}

/**
 * Crée des références de cluster vides
 */
export function createEmptyClusterReferences(): ClusterReferences {
  return {
    characters: [],
    locations: [],
    allImageUrls: [],
    totalCount: 0,
    validatedCount: 0,
    warnings: [],
  };
}

/**
 * Obtient le label d'un type de cluster
 */
export function getClusterTypeLabel(type: ClusterType): string {
  const labels: Record<ClusterType, string> = {
    location: "Par lieu",
    characters: "Par personnages",
    act: "Par acte",
    sequence: "Séquence",
  };
  return labels[type];
}
