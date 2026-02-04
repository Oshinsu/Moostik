/**
 * MOOSTIK VideoPromptOptimizer
 * SOTA prompt optimization system for video generation - January 2026
 *
 * Adapts prompts per provider for optimal quality and consistency
 */

import { VideoProvider } from "./types";
import { PROVIDER_PROMPT_CONFIGS, type ProviderPromptConfig, type PromptStyle } from "./provider-configs";
import { getPromptTemplate, applyTemplateToPrompt, type SceneType } from "./prompt-templates";
import { scorePrompt, type PromptScore } from "./prompt-scorer";

// ============================================
// VIDEO PROMPT OPTIMIZER CLASS
// ============================================

export interface OptimizedPrompt {
  original: string;
  optimized: string;
  negativePrompt: string;
  provider: VideoProvider;
  score: PromptScore;
  appliedTransformations: string[];
  warnings: string[];
}

export interface OptimizeOptions {
  sceneType?: SceneType;
  style?: PromptStyle;
  characterNames?: string[];
  locationName?: string;
  emotion?: string;
  cameraMotion?: string;
  preserveExact?: string[]; // Terms to preserve exactly
  forceLength?: number; // Override max length
}

export class VideoPromptOptimizer {
  /**
   * Main optimization entry point - adapts prompt for specific provider
   */
  optimizeForProvider(
    prompt: string,
    provider: VideoProvider,
    options: OptimizeOptions = {}
  ): OptimizedPrompt {
    const config = PROVIDER_PROMPT_CONFIGS[provider];
    const transformations: string[] = [];
    const warnings: string[] = [];
    let optimized = prompt;

    // 1. Apply scene template if sceneType specified
    if (options.sceneType) {
      const template = getPromptTemplate(options.sceneType, provider);
      if (template) {
        // Convert options to string values for template
        const templateValues: Record<string, string | undefined> = {
          character_name: options.characterNames?.join(", "),
          location: options.locationName,
          emotion: options.emotion,
          camera_motion: options.cameraMotion,
        };
        optimized = applyTemplateToPrompt(optimized, template, templateValues);
        transformations.push(`applied_template:${options.sceneType}`);
      }
    }

    // 2. Apply provider-specific style
    const preferredStyle = config?.preferredStyle ?? "descriptive";
    optimized = this.applyStyle(optimized, preferredStyle);
    transformations.push(`style:${preferredStyle}`);

    // 3. Apply keyword weights (boost important terms)
    optimized = this.applyKeywordWeights(optimized, config?.keywordWeights ?? {}, options.preserveExact);
    transformations.push("keyword_weights");

    // 4. Add camera motion if specified
    if (options.cameraMotion) {
      optimized = this.addCameraMotion(optimized, options.cameraMotion, provider);
      transformations.push(`camera:${options.cameraMotion}`);
    }

    // 5. Truncate to provider limit
    const maxLength = options.forceLength ?? config?.maxLength ?? 800;
    if (optimized.length > maxLength) {
      const originalLength = optimized.length;
      optimized = this.truncateToLimit(optimized, maxLength, options.preserveExact);
      warnings.push(`truncated:${originalLength}→${optimized.length}`);
      transformations.push(`truncate:${maxLength}`);
    }

    // 6. Get optimal negative prompt
    const negativePrompt = this.getOptimalNegativePrompt(provider, options.sceneType);

    // 7. Score the result
    const score = scorePrompt(optimized, provider);

    // Add warnings from scoring
    warnings.push(...score.warnings);

    return {
      original: prompt,
      optimized,
      negativePrompt,
      provider,
      score,
      appliedTransformations: transformations,
      warnings,
    };
  }

  /**
   * Truncate prompt to provider length limit while preserving key terms
   */
  truncateToLimit(prompt: string, maxLength: number, preserveExact?: string[]): string {
    if (prompt.length <= maxLength) return prompt;

    // Split into sentences
    const sentences = prompt.split(/(?<=[.!?])\s+/);
    let result = "";

    for (const sentence of sentences) {
      const test = result ? `${result} ${sentence}` : sentence;
      if (test.length <= maxLength) {
        result = test;
      } else {
        break;
      }
    }

    // If we have preserveExact terms, ensure they're included
    if (preserveExact && preserveExact.length > 0) {
      for (const term of preserveExact) {
        if (!result.toLowerCase().includes(term.toLowerCase())) {
          // Try to append at cost of length
          const appendage = `, ${term}`;
          if (result.length + appendage.length <= maxLength) {
            result += appendage;
          }
        }
      }
    }

    // Truncate with ellipsis if still too long
    if (result.length > maxLength) {
      result = result.substring(0, maxLength - 3) + "...";
    }

    return result;
  }

  /**
   * Apply style transformation (concise, descriptive, cinematic)
   */
  applyStyle(prompt: string, style: PromptStyle): string {
    switch (style) {
      case "concise":
        // Remove filler words and compress
        return this.makePromptConcise(prompt);

      case "descriptive":
        // Keep detailed descriptions
        return this.ensureDescriptive(prompt);

      case "cinematic":
        // Add cinematic language
        return this.makeCinematic(prompt);

      default:
        return prompt;
    }
  }

  /**
   * Make prompt concise for providers with shorter limits (Wan, Pixverse)
   */
  private makePromptConcise(prompt: string): string {
    // Remove filler phrases
    const fillers = [
      /\s*(?:very|really|quite|rather|somewhat)\s+/gi,
      /\s*(?:kind of|sort of)\s+/gi,
      /\s*(?:in the style of)\s+/gi,
      /\s*(?:that is|which is)\s+/gi,
      /\s*(?:there is|there are)\s+/gi,
    ];

    let result = prompt;
    for (const filler of fillers) {
      result = result.replace(filler, " ");
    }

    // Remove double spaces
    result = result.replace(/\s+/g, " ").trim();

    return result;
  }

  /**
   * Ensure prompt has enough descriptive detail
   */
  private ensureDescriptive(prompt: string): string {
    // For Kling, Hailuo - they benefit from more detail
    // Check if prompt has adjectives, if not it's probably too sparse
    const hasAdjectives = /(?:detailed|realistic|cinematic|dramatic|subtle|slow|fast|smooth)/i.test(prompt);

    if (!hasAdjectives) {
      return `Highly detailed, cinematic shot: ${prompt}`;
    }

    return prompt;
  }

  /**
   * Add cinematic language for premium providers (Veo, Sora, Luma)
   */
  private makeCinematic(prompt: string): string {
    // Don't modify if already has cinematic markers
    if (/(?:cinematic|film|movie|camera|dolly|tracking|crane)/i.test(prompt)) {
      return prompt;
    }

    return `Cinematic film shot. ${prompt}`;
  }

  /**
   * Apply keyword weights by repeating important terms
   */
  private applyKeywordWeights(
    prompt: string,
    weights: Record<string, number>,
    preserveExact?: string[]
  ): string {
    // For important keywords, we can emphasize them differently per provider
    // Some providers support (keyword:weight) syntax, others just benefit from repetition

    let result = prompt;

    for (const [keyword, weight] of Object.entries(weights)) {
      if (weight > 1 && result.toLowerCase().includes(keyword.toLowerCase())) {
        // Only apply weights to keywords that exist in the prompt
        // Don't change preserveExact terms
        if (preserveExact?.some((t) => t.toLowerCase() === keyword.toLowerCase())) {
          continue;
        }
        // For high-weight keywords, we could add emphasis
        // Most video models don't support (keyword:1.5) syntax like Stable Diffusion
        // So we just ensure the keyword is present
      }
    }

    return result;
  }

  /**
   * Add camera motion instruction in provider-optimal format
   */
  private addCameraMotion(prompt: string, motion: string, provider: VideoProvider): string {
    // Some providers have specific camera motion keywords
    const providerMotionMap: Record<string, Record<string, string>> = {
      "kling-2.6": {
        pan_left: "smooth pan left",
        pan_right: "smooth pan right",
        zoom_in: "slow zoom in",
        zoom_out: "slow zoom out",
        dolly: "dolly forward",
        static: "locked camera, static shot",
      },
      "veo-3.1": {
        pan_left: "camera pans slowly to the left",
        pan_right: "camera pans slowly to the right",
        zoom_in: "camera slowly zooms in",
        zoom_out: "camera slowly zooms out",
        dolly: "camera dollies forward",
        static: "static camera, locked frame",
      },
    };

    const motionInstruction = providerMotionMap[provider]?.[motion] || motion;

    // Add at the end for most providers
    if (!prompt.toLowerCase().includes(motionInstruction.toLowerCase())) {
      return `${prompt}. ${motionInstruction}`;
    }

    return prompt;
  }

  /**
   * Get optimal negative prompt based on provider and scene type
   */
  getOptimalNegativePrompt(provider: VideoProvider, sceneType?: SceneType): string {
    const config = PROVIDER_PROMPT_CONFIGS[provider];
    const baseNegative = config?.negativePromptLibrary ?? [];

    // Add scene-specific negatives
    const sceneNegatives: Record<SceneType, string[]> = {
      genocide: ["cartoon", "anime", "bright colors", "happy", "smiling"],
      emotional: ["static expression", "robotic", "stiff", "unnatural"],
      battle: ["slow motion", "peaceful", "calm", "static"],
      bar_scene: ["outdoor", "bright sunlight", "action", "violence"],
      training: ["lazy", "casual", "relaxed", "sloppy movement"],
      establishing: ["close-up", "face", "action", "movement"],
      flashback: ["modern", "present day", "HD", "crisp"],
      transition: ["jarring", "abrupt", "static"],
    };

    const additionalNegatives = sceneType ? sceneNegatives[sceneType] || [] : [];
    const allNegatives = Array.from(new Set([...baseNegative, ...additionalNegatives]));

    return allNegatives.join(", ");
  }

  /**
   * Score prompt quality for a provider
   */
  scorePromptQuality(prompt: string, provider: VideoProvider): PromptScore {
    return scorePrompt(prompt, provider);
  }

  /**
   * Quick optimization without full scoring (for performance)
   */
  quickOptimize(prompt: string, provider: VideoProvider): string {
    const config = PROVIDER_PROMPT_CONFIGS[provider];

    let optimized = this.applyStyle(prompt, config?.preferredStyle ?? "descriptive");
    optimized = this.truncateToLimit(optimized, config?.maxLength ?? 800);

    return optimized;
  }

  /**
   * Batch optimize multiple prompts
   */
  optimizeBatch(
    prompts: Array<{ prompt: string; sceneType?: SceneType }>,
    provider: VideoProvider
  ): OptimizedPrompt[] {
    return prompts.map(({ prompt, sceneType }) =>
      this.optimizeForProvider(prompt, provider, { sceneType })
    );
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const videoPromptOptimizer = new VideoPromptOptimizer();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Quick optimization for a single prompt
 */
export function optimizePrompt(
  prompt: string,
  provider: VideoProvider,
  options?: OptimizeOptions
): OptimizedPrompt {
  return videoPromptOptimizer.optimizeForProvider(prompt, provider, options);
}

/**
 * Get negative prompt for provider/scene combo
 */
export function getNegativePrompt(provider: VideoProvider, sceneType?: SceneType): string {
  return videoPromptOptimizer.getOptimalNegativePrompt(provider, sceneType);
}

/**
 * Score a prompt without full optimization
 */
export function scoreVideoPrompt(prompt: string, provider: VideoProvider): PromptScore {
  return videoPromptOptimizer.scorePromptQuality(prompt, provider);
}
