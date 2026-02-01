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
export * from "./scene-cluster-manager";
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

// Note: moostik-bible contient les règles narratives et stylistiques de l'univers MOOSTIK.
// Non utilisé directement mais exporté pour référence future.
export * from "./moostik-bible";

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
