/**
 * MOOSTIK Provider Prompt Configurations
 * SOTA configurations per video generation model - January 2026
 *
 * Based on comprehensive testing and provider documentation
 */

import { VideoProvider } from "./types";

// ============================================
// TYPES
// ============================================

export type PromptStyle = "concise" | "descriptive" | "cinematic";

export interface ProviderPromptConfig {
  maxLength: number;
  preferredStyle: PromptStyle;
  keywordWeights: Record<string, number>;
  negativePromptLibrary: string[];
  supportsNegativePrompt: boolean;
  supportsWeightSyntax: boolean; // (keyword:1.5) syntax
  promptPrefix?: string; // Auto-prepend
  promptSuffix?: string; // Auto-append
  avoidTerms: string[]; // Terms that hurt quality
  boostTerms: string[]; // Terms that improve quality
  notes: string[];
}

// ============================================
// PROVIDER CONFIGURATIONS
// ============================================

export const PROVIDER_PROMPT_CONFIGS: Record<VideoProvider, ProviderPromptConfig> = {
  // ============================================
  // BUDGET TIER
  // ============================================
  "wan-2.2": {
    maxLength: 400,
    preferredStyle: "concise",
    keywordWeights: {
      motion: 1.5,
      camera: 1.3,
      movement: 1.2,
    },
    negativePromptLibrary: [
      "blurry",
      "low quality",
      "distorted",
      "static",
      "watermark",
      "text",
      "logo",
      "signature",
      "bad anatomy",
      "deformed",
      "mutation",
    ],
    supportsNegativePrompt: true,
    supportsWeightSyntax: false,
    avoidTerms: ["4K", "8K", "ultra HD", "photorealistic"], // Model can't deliver, creates artifacts
    boostTerms: ["smooth motion", "natural movement", "fluid"],
    notes: [
      "Best for quick prototypes",
      "Keep prompts under 300 chars for best results",
      "Focus on motion description, not quality adjectives",
    ],
  },

  "ltx-2": {
    maxLength: 500,
    preferredStyle: "descriptive",
    keywordWeights: {
      realistic: 1.4,
      cinematic: 1.3,
      detailed: 1.2,
    },
    negativePromptLibrary: [
      "blurry",
      "low quality",
      "distorted",
      "watermark",
      "logo",
      "bad anatomy",
      "flickering",
      "jittery",
      "unstable",
    ],
    supportsNegativePrompt: true,
    supportsWeightSyntax: false,
    avoidTerms: [], // Open source, handles most terms well
    boostTerms: ["4K", "detailed", "cinematic lighting", "smooth"],
    notes: [
      "Open source model, good for 4K",
      "Supports audio sync",
      "Can run locally on RTX 4090",
    ],
  },

  "pixverse-4": {
    maxLength: 400,
    preferredStyle: "concise",
    keywordWeights: {
      camera: 1.5, // Strong camera control
      pan: 1.3,
      zoom: 1.3,
      tilt: 1.3,
    },
    negativePromptLibrary: [
      "blurry",
      "distorted",
      "watermark",
      "text",
      "low quality",
      "artifact",
    ],
    supportsNegativePrompt: true,
    supportsWeightSyntax: false,
    avoidTerms: ["photorealistic"], // Better for stylized
    boostTerms: ["dynamic camera", "camera movement", "smooth pan"],
    notes: [
      "20+ camera control options",
      "Better for stylized content",
      "Good camera physics",
    ],
  },

  // ============================================
  // STANDARD TIER
  // ============================================
  "wan-2.5": {
    maxLength: 600,
    preferredStyle: "descriptive",
    keywordWeights: {
      speech: 1.5,
      dialogue: 1.5,
      talking: 1.4,
      "lip sync": 1.5,
      audio: 1.3,
    },
    negativePromptLibrary: [
      "blurry",
      "low quality",
      "distorted",
      "watermark",
      "static",
      "frozen",
      "bad lip sync",
      "out of sync",
      "flickering",
    ],
    supportsNegativePrompt: true,
    supportsWeightSyntax: false,
    promptSuffix: ", high quality, smooth motion",
    avoidTerms: ["8K"], // 1080p max
    boostTerms: ["natural dialogue", "lip sync", "speech", "talking", "multilingual"],
    notes: [
      "Best for dialogue scenes with lip sync",
      "One-pass audio/video sync",
      "6 aspect ratios supported",
      "Multilingual prompt support",
    ],
  },

  "wan-2.6": {
    maxLength: 600,
    preferredStyle: "descriptive",
    keywordWeights: {
      speech: 1.5,
      dialogue: 1.5,
      detailed: 1.3,
      sharp: 1.3,
    },
    negativePromptLibrary: [
      "blurry",
      "low quality",
      "distorted",
      "watermark",
      "flickering",
      "jittery",
      "unstable",
      "bad lip sync",
    ],
    supportsNegativePrompt: true,
    supportsWeightSyntax: false,
    avoidTerms: [],
    boostTerms: ["sharp details", "crisp", "clear", "stable", "consistent"],
    notes: [
      "Sharper than 2.5",
      "Better temporal consistency",
      "Less flicker",
      "Improved text rendering",
    ],
  },

  "luma-ray-2": {
    maxLength: 500,
    preferredStyle: "cinematic",
    keywordWeights: {
      physics: 1.5,
      natural: 1.4,
      realistic: 1.3,
      interpolation: 1.5,
    },
    negativePromptLibrary: [
      "artificial",
      "fake",
      "cartoon",
      "unrealistic physics",
      "floating",
      "glitching",
    ],
    supportsNegativePrompt: true,
    supportsWeightSyntax: false,
    promptPrefix: "Cinematic shot. ",
    avoidTerms: ["anime", "cartoon", "stylized"],
    boostTerms: ["natural physics", "realistic motion", "smooth interpolation", "coherent"],
    notes: [
      "Unique start+end frame interpolation",
      "Best for transitions and morphing",
      "10x compute vs Ray 1",
      "Great physics simulation",
    ],
  },

  "hunyuan-1.5": {
    maxLength: 500,
    preferredStyle: "descriptive",
    keywordWeights: {
      motion: 1.3,
      movement: 1.3,
      detailed: 1.2,
    },
    negativePromptLibrary: [
      "blurry",
      "low quality",
      "distorted",
      "artifact",
      "watermark",
      "text overlay",
    ],
    supportsNegativePrompt: true,
    supportsWeightSyntax: false,
    avoidTerms: ["4K", "8K"], // 720p max
    boostTerms: ["detailed", "smooth motion", "text alignment"],
    notes: [
      "13B parameters - largest open source",
      "Good text-video alignment",
      "Requires 60-80GB VRAM for local",
    ],
  },

  // ============================================
  // PREMIUM TIER
  // ============================================
  "kling-2.6": {
    maxLength: 800,
    preferredStyle: "descriptive",
    keywordWeights: {
      motion: 1.5,
      "camera control": 1.5,
      physics: 1.4,
      emotion: 1.3,
      expression: 1.3,
    },
    negativePromptLibrary: [
      "blurry",
      "low quality",
      "distorted",
      "watermark",
      "bad anatomy",
      "unrealistic physics",
      "floating objects",
      "glitching",
      "morphing",
      "artifacts",
    ],
    supportsNegativePrompt: true,
    supportsWeightSyntax: false,
    avoidTerms: [],
    boostTerms: [
      "motion brush",
      "precise camera control",
      "6-axis camera",
      "multi-region animation",
      "emotional expression",
      "4K",
    ],
    notes: [
      "Motion brush with 6 regions",
      "Motion transfer from reference video",
      "6-axis camera control (-10 to +10)",
      "Native audio generation",
      "Best for complex multi-character scenes",
    ],
  },

  "hailuo-2.3": {
    maxLength: 600,
    preferredStyle: "descriptive",
    keywordWeights: {
      dance: 1.5,
      expression: 1.5,
      "micro-expression": 1.4,
      movement: 1.3,
    },
    negativePromptLibrary: [
      "blurry",
      "low quality",
      "distorted",
      "stiff",
      "robotic",
      "unnatural movement",
      "frozen expression",
    ],
    supportsNegativePrompt: true,
    supportsWeightSyntax: false,
    avoidTerms: ["audio", "sound"], // No audio support
    boostTerms: ["complex motion", "dance", "micro-expression", "subtle movement", "anime style"],
    notes: [
      "Best for dance and complex body motion",
      "Excellent micro-expressions",
      "NCR architecture (2.5x more efficient)",
      "Good for anime style",
      "25fps only",
    ],
  },

  "luma-ray-3": {
    maxLength: 600,
    preferredStyle: "cinematic",
    keywordWeights: {
      reasoning: 1.5,
      character: 1.4,
      consistency: 1.4,
      HDR: 1.3,
    },
    negativePromptLibrary: [
      "inconsistent",
      "character morphing",
      "identity change",
      "low dynamic range",
      "flat colors",
      "artifacts",
    ],
    supportsNegativePrompt: true,
    supportsWeightSyntax: false,
    promptPrefix: "Cinematic HDR shot. ",
    avoidTerms: [],
    boostTerms: [
      "character consistency",
      "reasoning-driven",
      "HDR",
      "high dynamic range",
      "keyframe",
      "draft mode",
    ],
    notes: [
      "Reasoning-driven generation",
      "Best character reference preservation",
      "First HDR pipeline on market",
      "Draft mode 20x faster",
      "Video-to-video with keyframes",
    ],
  },

  "veo-3.1": {
    maxLength: 500,
    preferredStyle: "cinematic",
    keywordWeights: {
      physics: 1.5,
      realistic: 1.5,
      cinematic: 1.4,
      audio: 1.3,
    },
    negativePromptLibrary: [
      "unrealistic",
      "fake physics",
      "cartoon",
      "anime",
      "low quality",
      "blurry",
      "artifacts",
      "glitching",
    ],
    supportsNegativePrompt: true,
    supportsWeightSyntax: false,
    promptPrefix: "Cinematic film shot, realistic physics. ",
    avoidTerms: ["anime", "cartoon", "stylized", "abstract"],
    boostTerms: [
      "photorealistic",
      "physically accurate",
      "cinematic",
      "4K",
      "contextual audio",
      "film-like",
    ],
    notes: [
      "Best physics simulation available",
      "Contextual audio generation",
      "Last frame support for chaining",
      "Highest fidelity",
      "SynthID watermark",
      "Videos stored 2 days only",
    ],
  },

  "sora-2": {
    maxLength: 1000,
    preferredStyle: "cinematic",
    keywordWeights: {
      narrative: 1.5,
      story: 1.4,
      cinematic: 1.4,
      "long duration": 1.3,
    },
    negativePromptLibrary: [
      "blurry",
      "low quality",
      "artifact",
      "glitch",
      "inconsistent",
      "morphing",
    ],
    supportsNegativePrompt: true,
    supportsWeightSyntax: false,
    avoidTerms: [
      "copyrighted character",
      "real celebrity",
      "real person",
      "trademarked",
      "famous person",
    ],
    boostTerms: [
      "long form narrative",
      "cinematic",
      "story-driven",
      "35 second",
      "extended duration",
    ],
    notes: [
      "Longest duration (35s)",
      "No copyrighted characters",
      "No real human faces/celebrities",
      "Not available in EU/UK/Switzerland",
      "Best for long narrative sequences",
    ],
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get config for provider with defaults
 */
export function getProviderConfig(provider: VideoProvider): ProviderPromptConfig {
  return PROVIDER_PROMPT_CONFIGS[provider];
}

/**
 * Check if a term should be avoided for provider
 */
export function shouldAvoidTerm(term: string, provider: VideoProvider): boolean {
  const config = PROVIDER_PROMPT_CONFIGS[provider];
  return config.avoidTerms.some((avoid) => term.toLowerCase().includes(avoid.toLowerCase()));
}

/**
 * Get boost terms for provider
 */
export function getBoostTerms(provider: VideoProvider): string[] {
  return PROVIDER_PROMPT_CONFIGS[provider].boostTerms;
}

/**
 * Get provider style preference
 */
export function getPreferredStyle(provider: VideoProvider): PromptStyle {
  return PROVIDER_PROMPT_CONFIGS[provider].preferredStyle;
}

/**
 * Get max prompt length for provider
 */
export function getMaxPromptLength(provider: VideoProvider): number {
  return PROVIDER_PROMPT_CONFIGS[provider].maxLength;
}

/**
 * Check if provider supports negative prompts
 */
export function supportsNegativePrompt(provider: VideoProvider): boolean {
  return PROVIDER_PROMPT_CONFIGS[provider].supportsNegativePrompt;
}
