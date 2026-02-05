/**
 * MOOSTIK - Application Configuration
 *
 * Configuration centralisée de l'application.
 * Toutes les constantes et paramètres configurables sont définis ici.
 */

import path from "path";
import { ConfigurationError } from "./errors";

// ============================================================================
// ENVIRONMENT
// ============================================================================

/**
 * Vérifie et retourne une variable d'environnement requise
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new ConfigurationError(key);
  }
  return value;
}

/**
 * Retourne une variable d'environnement avec une valeur par défaut
 */
function getEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

// ============================================================================
// APPLICATION CONFIG
// ============================================================================

export const config = {
  // Environment
  env: {
    nodeEnv: getEnv("NODE_ENV", "development"),
    isDev: getEnv("NODE_ENV", "development") === "development",
    isProd: process.env.NODE_ENV === "production",
  },

  // Paths
  paths: {
    root: process.cwd(),
    data: path.join(process.cwd(), "data"),
    episodes: path.join(process.cwd(), "data", "episodes"),
    characters: path.join(process.cwd(), "data", "characters.json"),
    locations: path.join(process.cwd(), "data", "locations.json"),
    output: path.join(process.cwd(), "output"),
    images: path.join(process.cwd(), "output", "images"),
    references: path.join(process.cwd(), "output", "references"),
  },

  // Replicate API
  replicate: {
    /** Token d'API - requis pour la génération */
    get apiToken(): string {
      // Lazy evaluation pour éviter les erreurs au démarrage
      return requireEnv("REPLICATE_API_TOKEN");
    },
    /** Modèle principal pour la génération d'images (février 2026 SOTA) */
    model: "black-forest-labs/flux-2-pro" as const,
    /** Modèles image disponibles */
    imageModels: {
      /** FLUX 2 Pro - Haute qualité, 8 images de référence, $0.015/run */
      "flux-2-pro": "black-forest-labs/flux-2-pro",
      /** FLUX 2 Max - Fidélité maximale, $0.04/run */
      "flux-2-max": "black-forest-labs/flux-2-max",
      /** FLUX 2 Flex - 10 images de référence, max qualité editing */
      "flux-2-flex": "black-forest-labs/flux-2-flex",
      /** Google Imagen 4 - Détails fins, typographie, $0.04/image */
      "imagen-4": "google/imagen-4",
      /** Google Imagen 4 Fast - Rapide, $0.02/image */
      "imagen-4-fast": "google/imagen-4-fast",
      /** Google Imagen 4 Ultra - Qualité maximale Google */
      "imagen-4-ultra": "google/imagen-4-ultra",
      /** Seedream 4.5 - ByteDance, 4K natif, batch, $0.04/image */
      "seedream-4.5": "bytedance/seedream-4.5",
      /** Ideogram v3 Turbo - Rapide, $0.03/image, 50+ styles */
      "ideogram-v3-turbo": "ideogram-ai/ideogram-v3-turbo",
      /** Ideogram v3 Quality - Meilleure qualité Ideogram */
      "ideogram-v3-quality": "ideogram-ai/ideogram-v3-quality",
      /** Recraft v3 - Long texte, styles variés, $0.04/image */
      "recraft-v3": "recraft-ai/recraft-v3",
      /** FLUX Kontext Pro - Editing texte SOTA, 44.8M runs */
      "flux-kontext-pro": "black-forest-labs/flux-kontext-pro",
      /** FLUX Schnell - Ultra rapide pour prototypage */
      "flux-schnell": "black-forest-labs/flux-schnell",
    } as const,
    /** Nombre maximum de générations parallèles (Replicate permet 600 req/min) */
    maxParallelGenerations: 10,
    /** Délai entre les batches (ms) */
    generationDelayMs: 1000,
    /** Nombre maximum d'images de référence */
    maxReferenceImages: 14,
    /** Timeout pour une génération (ms) */
    generationTimeoutMs: 120000,
  },

  // Generation
  generation: {
    /** Nombre maximum de shots générés en parallèle */
    maxParallelShots: 5,
    /** Nombre de variations par shot (angles de caméra) */
    variationsPerShot: 5,
    /** Format de sortie par défaut */
    defaultOutputFormat: "png" as const,
    /** Ratio d'aspect par défaut */
    defaultAspectRatio: "16:9",
    /** Ratio pour les turnarounds de personnages */
    characterTurnaroundRatio: "21:9",
  },

  // Cache
  cache: {
    /** TTL pour les épisodes (ms) */
    episodesTtl: 30 * 1000, // 30 secondes
    /** TTL pour les personnages (ms) */
    charactersTtl: 2 * 60 * 1000, // 2 minutes
    /** TTL pour les lieux (ms) */
    locationsTtl: 2 * 60 * 1000, // 2 minutes
    /** TTL pour les images base64 (ms) */
    base64Ttl: 10 * 60 * 1000, // 10 minutes
    /** Taille max du cache base64 */
    base64MaxSize: 50,
  },

  // Retry
  retry: {
    /** Nombre maximum de tentatives */
    maxRetries: 3,
    /** Délai initial (ms) */
    initialDelay: 1000,
    /** Délai maximum (ms) */
    maxDelay: 30000,
    /** Multiplicateur de backoff */
    backoffMultiplier: 2,
  },

  // Validation
  validation: {
    /** Longueur max des IDs */
    maxIdLength: 100,
    /** Longueur max des titres */
    maxTitleLength: 200,
    /** Longueur max des descriptions */
    maxDescriptionLength: 5000,
    /** Nombre max de personnages par shot */
    maxCharactersPerShot: 20,
    /** Nombre max de lieux par shot */
    maxLocationsPerShot: 10,
  },

  // References
  references: {
    /** Nombre max de références par personnage */
    maxRefsPerCharacter: 2,
    /** Nombre max de références par lieu */
    maxRefsPerLocation: 3,
    /** Prioriser les références validées */
    prioritizeValidated: true,
    /** Fallback vers les non-validées */
    fallbackToUnvalidated: true,
  },

  // UI/UX
  ui: {
    /** Langue par défaut */
    defaultLanguage: "fr",
    /** Thème par défaut */
    defaultTheme: "dark",
    /** Nombre d'items par page dans les listes */
    itemsPerPage: 20,
  },
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Config = typeof config;
export type ReplicateConfig = typeof config.replicate;
export type GenerationConfig = typeof config.generation;
export type CacheConfig = typeof config.cache;
export type ValidationConfig = typeof config.validation;
export type PathsConfig = typeof config.paths;

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Vérifie que la configuration est valide au démarrage
 */
export function validateConfig(): void {
  // Vérifier les chemins critiques
  const { paths } = config;
  console.log(`[Config] Root path: ${paths.root}`);
  console.log(`[Config] Data path: ${paths.data}`);
  console.log(`[Config] Output path: ${paths.output}`);

  // Vérifier l'API token (sans l'afficher)
  try {
    const token = config.replicate.apiToken;
    console.log(`[Config] Replicate API token: ${token ? "configured" : "missing"}`);
  } catch (error) {
    console.warn("[Config] Replicate API token not configured - generation will fail");
  }
}

/**
 * Retourne une version safe de la config pour le logging
 */
export function getSafeConfig(): Record<string, unknown> {
  return {
    env: config.env,
    paths: {
      root: config.paths.root,
      data: config.paths.data,
      output: config.paths.output,
    },
    replicate: {
      model: config.replicate.model,
      maxParallelGenerations: config.replicate.maxParallelGenerations,
      maxReferenceImages: config.replicate.maxReferenceImages,
    },
    generation: config.generation,
    cache: config.cache,
    validation: config.validation,
  };
}
