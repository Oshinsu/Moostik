/**
 * MOOSTIK Unified Types
 * Resolves conflicts between auth.ts and bloodwings.ts
 *
 * This file provides a single source of truth for shared types.
 */

// ============================================================================
// UNIFIED PLAN TYPES
// ============================================================================

/**
 * Unified plan tier that encompasses all plan levels across the system.
 * Maps both auth.ts UserPlan and bloodwings.ts PlanTier to a single type.
 */
export type UnifiedPlanTier =
  | "free"
  | "starter"    // From auth.ts
  | "creator"    // From bloodwings.ts (maps to starter)
  | "pro"        // From auth.ts
  | "studio"     // Both
  | "production" // From bloodwings.ts (maps to pro)
  | "enterprise"; // Both

/**
 * Canonical plan tiers used in the database
 */
export type CanonicalPlanTier = "free" | "starter" | "pro" | "studio" | "enterprise";

/**
 * Map legacy plan names to canonical names
 */
export const PLAN_TIER_MAP: Record<UnifiedPlanTier, CanonicalPlanTier> = {
  free: "free",
  starter: "starter",
  creator: "starter",  // creator maps to starter
  pro: "pro",
  production: "pro",   // production maps to pro
  studio: "studio",
  enterprise: "enterprise",
};

/**
 * Get the canonical plan tier from any plan name
 */
export function getCanonicalPlanTier(tier: UnifiedPlanTier | string): CanonicalPlanTier {
  const mapped = PLAN_TIER_MAP[tier as UnifiedPlanTier];
  return mapped || "free";
}

// ============================================================================
// UNIFIED CREDIT TYPES
// ============================================================================

/**
 * Credit operation types
 */
export type CreditOperationType =
  | "image_standard"
  | "image_hd"
  | "video_runway_turbo"
  | "video_runway_alpha"
  | "video_kling"
  | "video_kling_audio"
  | "export_1080p"
  | "export_4k";

/**
 * Unified credit cost definition
 */
export interface UnifiedCreditCost {
  id: string;
  name: string;
  description: string;
  creditsCost: number;
  operationType: CreditOperationType;
  modelName?: string;
  isActive: boolean;
}

/**
 * Credit costs for all operations
 */
export const CREDIT_COSTS: Record<CreditOperationType, UnifiedCreditCost> = {
  image_standard: {
    id: "image_standard",
    name: "Standard Image",
    description: "Image standard (Flux Schnell)",
    creditsCost: 1,
    operationType: "image_standard",
    modelName: "flux-schnell",
    isActive: true,
  },
  image_hd: {
    id: "image_hd",
    name: "HD Image",
    description: "Image HD (Flux Pro)",
    creditsCost: 2,
    operationType: "image_hd",
    modelName: "flux-pro",
    isActive: true,
  },
  video_runway_turbo: {
    id: "video_runway_turbo",
    name: "Video Runway Turbo",
    description: "Vidéo Runway Turbo/s",
    creditsCost: 2,
    operationType: "video_runway_turbo",
    modelName: "runway-turbo",
    isActive: true,
  },
  video_runway_alpha: {
    id: "video_runway_alpha",
    name: "Video Runway Alpha",
    description: "Vidéo Runway Alpha/s",
    creditsCost: 4,
    operationType: "video_runway_alpha",
    modelName: "runway-alpha",
    isActive: true,
  },
  video_kling: {
    id: "video_kling",
    name: "Video Kling",
    description: "Vidéo Kling/s",
    creditsCost: 3,
    operationType: "video_kling",
    modelName: "kling",
    isActive: true,
  },
  video_kling_audio: {
    id: "video_kling_audio",
    name: "Video Kling + Audio",
    description: "Vidéo Kling + Audio/s",
    creditsCost: 6,
    operationType: "video_kling_audio",
    modelName: "kling-audio",
    isActive: true,
  },
  export_1080p: {
    id: "export_1080p",
    name: "Export 1080p",
    description: "Export 1080p",
    creditsCost: 5,
    operationType: "export_1080p",
    isActive: true,
  },
  export_4k: {
    id: "export_4k",
    name: "Export 4K",
    description: "Export 4K",
    creditsCost: 15,
    operationType: "export_4k",
    isActive: true,
  },
};

// ============================================================================
// PLAN FEATURES
// ============================================================================

export interface PlanFeatures {
  imagesPerMonth: number;
  videosPerMonth: number;
  videoSeconds: number;
  maxEpisodes: number | null;  // null = unlimited
  maxShotsPerEpisode: number | null;
  maxParallelGenerations: number;
  hasVideoGeneration: boolean;
  hasBloodDirector: boolean;
  hasHdExport: boolean;
  has4kExport: boolean;
  hasApiAccess: boolean;
  hasPriorityQueue: boolean;
  hasCustomModels: boolean;
  hasWhiteLabel: boolean;
}

export interface PlanDefinition {
  tier: CanonicalPlanTier;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  creditsMonthly: number;
  features: PlanFeatures;
  isPopular: boolean;
  displayOrder: number;
}

export const PLAN_DEFINITIONS: Record<CanonicalPlanTier, PlanDefinition> = {
  free: {
    tier: "free",
    name: "Free",
    description: "Perfect for trying out MOOSTIK",
    priceMonthly: 0,
    priceYearly: 0,
    creditsMonthly: 50,
    features: {
      imagesPerMonth: 20,
      videosPerMonth: 5,
      videoSeconds: 5,
      maxEpisodes: 1,
      maxShotsPerEpisode: 10,
      maxParallelGenerations: 1,
      hasVideoGeneration: false,
      hasBloodDirector: false,
      hasHdExport: false,
      has4kExport: false,
      hasApiAccess: false,
      hasPriorityQueue: false,
      hasCustomModels: false,
      hasWhiteLabel: false,
    },
    isPopular: false,
    displayOrder: 0,
  },
  starter: {
    tier: "starter",
    name: "Starter",
    description: "For individual creators",
    priceMonthly: 129,
    priceYearly: 1290,
    creditsMonthly: 500,
    features: {
      imagesPerMonth: 100,
      videosPerMonth: 30,
      videoSeconds: 5,
      maxEpisodes: 5,
      maxShotsPerEpisode: 25,
      maxParallelGenerations: 2,
      hasVideoGeneration: true,
      hasBloodDirector: false,
      hasHdExport: true,
      has4kExport: false,
      hasApiAccess: false,
      hasPriorityQueue: true,
      hasCustomModels: false,
      hasWhiteLabel: false,
    },
    isPopular: false,
    displayOrder: 1,
  },
  pro: {
    tier: "pro",
    name: "Pro",
    description: "For professional creators",
    priceMonthly: 349,
    priceYearly: 3490,
    creditsMonthly: 2000,
    features: {
      imagesPerMonth: 500,
      videosPerMonth: 150,
      videoSeconds: 10,
      maxEpisodes: 20,
      maxShotsPerEpisode: 50,
      maxParallelGenerations: 3,
      hasVideoGeneration: true,
      hasBloodDirector: true,
      hasHdExport: true,
      has4kExport: true,
      hasApiAccess: false,
      hasPriorityQueue: true,
      hasCustomModels: false,
      hasWhiteLabel: false,
    },
    isPopular: true,
    displayOrder: 2,
  },
  studio: {
    tier: "studio",
    name: "Studio",
    description: "For teams and studios",
    priceMonthly: 799,
    priceYearly: 7990,
    creditsMonthly: 10000,
    features: {
      imagesPerMonth: 1500,
      videosPerMonth: 500,
      videoSeconds: 10,
      maxEpisodes: null,
      maxShotsPerEpisode: null,
      maxParallelGenerations: 5,
      hasVideoGeneration: true,
      hasBloodDirector: true,
      hasHdExport: true,
      has4kExport: true,
      hasApiAccess: true,
      hasPriorityQueue: true,
      hasCustomModels: true,
      hasWhiteLabel: false,
    },
    isPopular: false,
    displayOrder: 3,
  },
  enterprise: {
    tier: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for large organizations",
    priceMonthly: 1499,
    priceYearly: 14990,
    creditsMonthly: -1, // Unlimited
    features: {
      imagesPerMonth: -1, // Unlimited
      videosPerMonth: -1, // Unlimited
      videoSeconds: 10,
      maxEpisodes: null,
      maxShotsPerEpisode: null,
      maxParallelGenerations: 10,
      hasVideoGeneration: true,
      hasBloodDirector: true,
      hasHdExport: true,
      has4kExport: true,
      hasApiAccess: true,
      hasPriorityQueue: true,
      hasCustomModels: true,
      hasWhiteLabel: true,
    },
    isPopular: false,
    displayOrder: 4,
  },
};

// ============================================================================
// TYPE RE-EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================================================

// These aliases allow existing code to keep working
export type UserPlan = CanonicalPlanTier;
export type PlanTier = CanonicalPlanTier;
