/**
 * MOOSTIK - Library Index
 *
 * Point d'entrée centralisé pour tous les modules de la bibliothèque.
 * Facilite les imports et assure une API cohérente.
 */

// ============================================================================
// CORE SERVICES
// ============================================================================

export * from "./storage";
export * from "./replicate";
export * from "./reference-resolver";
// scene-cluster-manager: Export specific functions to avoid conflict with video/analyzeEpisode
export { 
  resolveClusterReferences, 
  prepareClusterReferenceMap, 
  prepareShotsForClusterGeneration,
  getOptimalGenerationOrder,
  findBestClusterForShot,
  getClusterStats,
  mergeClusters,
  // Note: analyzeEpisode is not exported here to avoid conflict with video module
} from "./scene-cluster-manager";
export * from "./ep0-generator";

// ============================================================================
// UTILITIES
// ============================================================================

export * from "./errors";
export * from "./cache";
export * from "./validation";
export * from "./retry";
export * from "./url-utils";
export * from "./logger";
export * from "./config";

// ============================================================================
// STANDARDS & HELPERS
// ============================================================================

export * from "./json-moostik-standard";

// JSON Standards for Video Providers - SOTA Janvier 2026
export * from "./json-kling-standard";
export * from "./json-veo-standard";

// Note: moostik-bible contient les règles narratives et stylistiques de l'univers MOOSTIK.
// Non utilisé directement mais exporté pour référence future.
export * from "./moostik-bible";

// MOOSTIK Context System - Global context injected before each generation
// SOTA Janvier 2026 - Standard BLOODWINGS
export * from "./moostik-context";

export { cn } from "./utils";

// ============================================================================
// VIDEO GENERATION (Kling, Runway, Luma)
// ============================================================================

export * from "./video";

// ============================================================================
// AUDIO GENERATION (Voice, Music, Lip Sync)
// ============================================================================

export * from "./audio";

// ============================================================================
// COMPOSITION (FFmpeg, Timeline, Episode Assembly)
// ============================================================================

export * from "./composition";

// ============================================================================
// ORCHESTRATION (Automated Series Generation)
// ============================================================================

// Note: orchestrator contient la logique de génération automatisée d'épisodes complets.
// Non utilisé directement dans l'UI mais disponible pour les scripts de génération en masse.
export * from "./orchestrator";

// Note: lib/api/ contient des helpers API client-side pour les composants frontend.
// Ces helpers peuvent être importés directement depuis "@/lib/api" si nécessaire.
// Actuellement non utilisés - les composants font des fetch() directs.
