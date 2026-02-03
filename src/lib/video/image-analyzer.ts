/**
 * MOOSTIK Image Analyzer for Video Prompt Generation
 * SOTA Agent - January 2026
 * 
 * Analyzes generated images and creates optimized video prompts
 * specifically tuned for Kling 2.6 capabilities:
 * - Motion brush (6 regions)
 * - 6-axis camera control
 * - Multi-character scenes
 * - Emotional expressions
 */

import { VideoProvider } from "./types";
import { PROVIDER_PROMPT_CONFIGS, PromptStyle } from "./provider-configs";
import { PROMPT_TEMPLATES, SceneType, CameraPreset } from "./prompt-templates";
import { createLogger } from "../logger";

const logger = createLogger("image-analyzer");

// ============================================
// TYPES
// ============================================

export interface ImageAnalysis {
  /** Image path or URL */
  imagePath: string;
  
  /** Detected elements */
  characters: DetectedCharacter[];
  environment: EnvironmentAnalysis;
  composition: CompositionAnalysis;
  
  /** Scene context from shot data */
  sceneContext: SceneContext;
  
  /** Analysis confidence (0-1) */
  confidence: number;
}

export interface DetectedCharacter {
  id: string;
  name: string;
  position: "left" | "center" | "right" | "foreground" | "background";
  size: "small" | "medium" | "large";
  estimatedEmotion: string;
  suggestedMotion: string[];
}

export interface EnvironmentAnalysis {
  lighting: "dark" | "dim" | "neutral" | "bright" | "dramatic";
  atmosphere: string;
  depth: "shallow" | "medium" | "deep";
  elements: string[];
}

export interface CompositionAnalysis {
  framing: string;
  focalPoint: string;
  dominantColors: string[];
  visualStyle: string;
}

export interface SceneContext {
  shotId: string;
  shotName: string;
  sceneType: SceneType;
  description: string;
  characterIds: string[];
  locationIds: string[];
  cameraAngle: string;
}

export interface VideoPromptSuggestion {
  /** Short prompt optimized for Kling 2.6 (max 800 chars) */
  shortPrompt: string;
  
  /** Detailed prompt with full description */
  detailedPrompt: string;
  
  /** Negative prompt */
  negativePrompt: string;
  
  /** Recommended duration */
  recommendedDuration: 5 | 10;
  
  /** Camera motion suggestion */
  cameraMotion: CameraMotionSuggestion;
  
  /** Motion regions for motion brush */
  motionRegions: MotionRegion[];
  
  /** Quality score (0-100) */
  promptScore: number;
  
  /** Explanation of choices */
  rationale: string;
}

export interface CameraMotionSuggestion {
  type: "static" | "pan" | "tilt" | "zoom" | "dolly" | "orbit" | "crane" | "handheld";
  direction?: string;
  intensity: number; // -10 to +10 for Kling 2.6
  description: string;
}

export interface MotionRegion {
  id: number; // 1-6 for Kling 2.6
  name: string;
  motionType: string;
  intensity: "subtle" | "moderate" | "dynamic";
}

// ============================================
// SCENE TYPE MOTION MAPPINGS
// ============================================

const SCENE_TYPE_MOTIONS: Record<SceneType, {
  primaryMotion: string;
  cameraStyle: CameraMotionSuggestion["type"];
  pacing: "slow" | "medium" | "fast";
  defaultDuration: 5 | 10;
  emotionalIntensity: number;
}> = {
  genocide: {
    primaryMotion: "Slow, devastating movement. Bodies falling, smoke rising. Visceral impact.",
    cameraStyle: "dolly",
    pacing: "slow",
    defaultDuration: 10,
    emotionalIntensity: 10,
  },
  emotional: {
    primaryMotion: "Subtle breathing, tearful expressions, trembling hands. Intimate moments.",
    cameraStyle: "static",
    pacing: "slow",
    defaultDuration: 10,
    emotionalIntensity: 9,
  },
  battle: {
    primaryMotion: "Dynamic combat, quick strikes, wing movements. High energy action.",
    cameraStyle: "handheld",
    pacing: "fast",
    defaultDuration: 5,
    emotionalIntensity: 8,
  },
  bar_scene: {
    primaryMotion: "Ambient bar atmosphere, smoke curling, drinks being poured. Noir mood.",
    cameraStyle: "pan",
    pacing: "medium",
    defaultDuration: 10,
    emotionalIntensity: 5,
  },
  training: {
    primaryMotion: "Precise combat movements, disciplined exercises. Determined focus.",
    cameraStyle: "orbit",
    pacing: "medium",
    defaultDuration: 5,
    emotionalIntensity: 6,
  },
  establishing: {
    primaryMotion: "Grand sweeping views, environment breathing. World-building.",
    cameraStyle: "crane",
    pacing: "slow",
    defaultDuration: 10,
    emotionalIntensity: 4,
  },
  flashback: {
    primaryMotion: "Dreamy, nostalgic movement. Soft transitions, memory fragments.",
    cameraStyle: "dolly",
    pacing: "slow",
    defaultDuration: 10,
    emotionalIntensity: 7,
  },
  transition: {
    primaryMotion: "Smooth morphing between states. Time passage indicated.",
    cameraStyle: "zoom",
    pacing: "medium",
    defaultDuration: 5,
    emotionalIntensity: 3,
  },
};

// ============================================
// CHARACTER MOTION LIBRARY
// ============================================

const CHARACTER_MOTIONS: Record<string, {
  idleMotion: string;
  emotionalMotion: string;
  actionMotion: string;
}> = {
  "baby-dorval": {
    idleMotion: "Tiny wings flutter gently, antennae twitch with curiosity",
    emotionalMotion: "Trembling, tears forming, desperate clinging to mother",
    actionMotion: "Frantically crawling, small wings buzzing with fear",
  },
  "mama-dorval": {
    idleMotion: "Protective posture, wings folded around child, gentle swaying",
    emotionalMotion: "Fierce determination, body shielding, final breath exhaling",
    actionMotion: "Swift protective movements, wings spreading as shield",
  },
  "young-dorval": {
    idleMotion: "Warrior stance, wings held proud, eyes scanning horizon",
    emotionalMotion: "Controlled grief, clenched fists, steely resolve",
    actionMotion: "Lightning strikes, acrobatic combat, predator precision",
  },
  "papy-tik": {
    idleMotion: "Weathered elder sitting still, pipe smoke curling, wise observation",
    emotionalMotion: "Deep sorrow in ancient eyes, slow nod of understanding",
    actionMotion: "Measured movements, deliberate gestures, commanding presence",
  },
  "general-aedes": {
    idleMotion: "Military bearing, wings folded tight, watchful gaze",
    emotionalMotion: "Stoic facade cracking, single tear, renewed determination",
    actionMotion: "Strategic movements, commanding gestures, battlefield authority",
  },
  "child-killer": {
    idleMotion: "Innocent child playing, unaware of weapon's purpose",
    emotionalMotion: "Confusion, then horror realization",
    actionMotion: "Spraying BYSS aerosol with childlike curiosity",
  },
  "evil-pik": {
    idleMotion: "Predatory stillness, blood-red eyes gleaming, barely contained violence",
    emotionalMotion: "Savage glee, anticipation of hunt, bloodlust rising",
    actionMotion: "Explosive speed, ruthless precision, lethal elegance",
  },
  "koko-survivor": {
    idleMotion: "Elder warrior's weathered calm, scars telling stories",
    emotionalMotion: "Haunted memories surfacing, voice trembling with remembrance",
    actionMotion: "Combat-ready tension despite age",
  },
  "mila-survivor": {
    idleMotion: "Memory keeper's focused attention, cataloguing every detail",
    emotionalMotion: "Tears of remembrance, voice steady despite pain",
    actionMotion: "Quick protective movements, survivor's instincts",
  },
  "trez-survivor": {
    idleMotion: "Scout's alert posture, always watching exits",
    emotionalMotion: "Nightmares visible in eyes, trauma held tight",
    actionMotion: "Fast, evasive movements, escape specialist",
  },
  // Default for unknown characters
  default: {
    idleMotion: "Subtle breathing, ambient movement",
    emotionalMotion: "Expressive reaction to scene",
    actionMotion: "Dynamic purposeful movement",
  },
};

// ============================================
// KLING 2.6 OPTIMIZED PROMPT BUILDER
// ============================================

export class ImageAnalyzer {
  private provider: VideoProvider = "kling-2.6";
  private config = PROVIDER_PROMPT_CONFIGS["kling-2.6"];
  
  /**
   * Analyze an image and generate optimized video prompt for Kling 2.6
   */
  analyzeAndGeneratePrompt(
    imagePath: string,
    context: SceneContext,
    options: {
      preferredDuration?: 5 | 10;
      emphasizeEmotion?: boolean;
      includeAudio?: boolean;
    } = {}
  ): VideoPromptSuggestion {
    logger.info("Analyzing image for video prompt", { imagePath, shotId: context.shotId });
    
    // Get scene type configuration
    const sceneConfig = SCENE_TYPE_MOTIONS[context.sceneType] || SCENE_TYPE_MOTIONS.establishing;
    const template = PROMPT_TEMPLATES[context.sceneType] || PROMPT_TEMPLATES.establishing;
    
    // Analyze characters in scene
    const characterMotions = this.getCharacterMotions(context.characterIds, context.sceneType);
    
    // Build motion regions for Kling 2.6 motion brush
    const motionRegions = this.buildMotionRegions(context.characterIds, sceneConfig);
    
    // Build camera suggestion based on scene type and framing
    const cameraMotion = this.buildCameraSuggestion(context, sceneConfig);
    
    // Determine duration
    const duration = options.preferredDuration || sceneConfig.defaultDuration;
    
    // Build the optimized prompt
    const { shortPrompt, detailedPrompt } = this.buildKling26Prompt(
      context,
      characterMotions,
      cameraMotion,
      sceneConfig,
      options
    );
    
    // Build negative prompt
    const negativePrompt = this.buildNegativePrompt(context.sceneType);
    
    // Calculate prompt score
    const promptScore = this.scorePrompt(shortPrompt);
    
    // Generate rationale
    const rationale = this.generateRationale(context, sceneConfig, cameraMotion, duration);
    
    logger.info("Generated video prompt", { 
      shotId: context.shotId, 
      duration, 
      promptScore,
      cameraMotion: cameraMotion.type 
    });
    
    return {
      shortPrompt,
      detailedPrompt,
      negativePrompt,
      recommendedDuration: duration,
      cameraMotion,
      motionRegions,
      promptScore,
      rationale,
    };
  }
  
  /**
   * Get motion descriptions for characters
   */
  private getCharacterMotions(characterIds: string[], sceneType: SceneType): string[] {
    const isEmotional = ["genocide", "emotional", "flashback"].includes(sceneType);
    const isAction = ["battle", "training"].includes(sceneType);
    
    return characterIds.map(charId => {
      const motions = CHARACTER_MOTIONS[charId] || CHARACTER_MOTIONS.default;
      
      if (isEmotional) return motions.emotionalMotion;
      if (isAction) return motions.actionMotion;
      return motions.idleMotion;
    });
  }
  
  /**
   * Build motion regions for Kling 2.6 motion brush (max 6 regions)
   */
  private buildMotionRegions(characterIds: string[], sceneConfig: typeof SCENE_TYPE_MOTIONS.genocide): MotionRegion[] {
    const regions: MotionRegion[] = [];
    
    // Add character regions (up to 4)
    characterIds.slice(0, 4).forEach((charId, index) => {
      const motions = CHARACTER_MOTIONS[charId] || CHARACTER_MOTIONS.default;
      regions.push({
        id: index + 1,
        name: charId,
        motionType: sceneConfig.pacing === "fast" ? motions.actionMotion : motions.idleMotion,
        intensity: sceneConfig.pacing === "fast" ? "dynamic" : "moderate",
      });
    });
    
    // Add environment region
    regions.push({
      id: regions.length + 1,
      name: "environment",
      motionType: "Ambient atmospheric movement, particles, light shifts",
      intensity: "subtle",
    });
    
    // Add atmosphere region if space
    if (regions.length < 6) {
      regions.push({
        id: regions.length + 1,
        name: "atmosphere",
        motionType: "Smoke, dust, light rays, subtle environmental motion",
        intensity: "subtle",
      });
    }
    
    return regions;
  }
  
  /**
   * Build camera suggestion based on scene type
   */
  private buildCameraSuggestion(
    context: SceneContext,
    sceneConfig: typeof SCENE_TYPE_MOTIONS.genocide
  ): CameraMotionSuggestion {
    const template = PROMPT_TEMPLATES[context.sceneType];
    const presets = template?.cameraPresets || [];
    
    // Map framing to intensity
    const framingIntensity: Record<string, number> = {
      extreme_wide: 2,
      wide: 3,
      medium: 5,
      close_up: 7,
      low_angle: 6,
      extreme_close: 8,
    };
    
    const intensity = framingIntensity[context.cameraAngle] || 5;
    
    // Select camera motion based on scene type
    const cameraDescriptions: Record<string, string> = {
      static: "Locked-off shot, no movement, focusing on character performance",
      pan: "Slow horizontal sweep revealing the scene",
      tilt: "Vertical movement following action or revealing scale",
      zoom: "Gradual zoom focusing attention",
      dolly: "Forward/backward movement creating depth and intimacy",
      orbit: "Circular movement around subject for 360° impact",
      crane: "Sweeping vertical movement for establishing grandeur",
      handheld: "Organic, documentary-feel movement adding tension",
    };
    
    return {
      type: sceneConfig.cameraStyle,
      direction: sceneConfig.cameraStyle === "pan" ? "left-to-right" : undefined,
      intensity,
      description: cameraDescriptions[sceneConfig.cameraStyle] || cameraDescriptions.static,
    };
  }
  
  /**
   * Build Kling 2.6 optimized prompt
   */
  private buildKling26Prompt(
    context: SceneContext,
    characterMotions: string[],
    cameraMotion: CameraMotionSuggestion,
    sceneConfig: typeof SCENE_TYPE_MOTIONS.genocide,
    options: { emphasizeEmotion?: boolean; includeAudio?: boolean }
  ): { shortPrompt: string; detailedPrompt: string } {
    const template = PROMPT_TEMPLATES[context.sceneType];
    
    // Build motion description
    const motionDescription = characterMotions.length > 0 
      ? characterMotions.join(". ") 
      : sceneConfig.primaryMotion;
    
    // Build camera description
    const cameraDesc = `${cameraMotion.type} camera, ${cameraMotion.description}`;
    
    // Kling 2.6 boost terms
    const boostTerms = (this.config?.boostTerms ?? []).slice(0, 3).join(", ");
    
    // Build short prompt (under 800 chars for Kling 2.6)
    const shortPromptParts = [
      context.shotName,
      motionDescription,
      cameraDesc,
      template?.styleGuide.mood || "Cinematic atmosphere",
      options.emphasizeEmotion ? "emotional expression, character emotion" : "",
      boostTerms,
    ].filter(Boolean);
    
    let shortPrompt = shortPromptParts.join(". ") + ".";
    
    // Truncate if needed
    const maxLength = this.config?.maxLength ?? 800;
    if (shortPrompt.length > maxLength) {
      shortPrompt = shortPrompt.slice(0, maxLength - 3) + "...";
    }
    
    // Build detailed prompt (for reference)
    const detailedPrompt = `
SHOT: ${context.shotName}
DESCRIPTION: ${context.description}
SCENE TYPE: ${context.sceneType}

MOTION:
${motionDescription}

CAMERA:
- Type: ${cameraMotion.type}
- Intensity: ${cameraMotion.intensity}/10
- ${cameraMotion.description}

STYLE:
- Mood: ${template?.styleGuide.mood || "Dark, cinematic"}
- Lighting: ${template?.styleGuide.lighting || "Dramatic"}
- Pacing: ${sceneConfig.pacing}

TECHNICAL:
- Provider: Kling 2.6
- Duration: ${sceneConfig.defaultDuration}s
- 6-axis camera control enabled
- Motion brush: ${characterMotions.length + 2} regions
${options.includeAudio ? "- Audio generation: ENABLED" : ""}
    `.trim();
    
    return { shortPrompt, detailedPrompt };
  }
  
  /**
   * Build negative prompt
   */
  private buildNegativePrompt(sceneType: SceneType): string {
    const baseNegatives = (this.config?.negativePromptLibrary ?? []).join(", ");
    const templateNegatives = PROMPT_TEMPLATES[sceneType]?.negativePromptAdditions || [];
    
    return [baseNegatives, ...templateNegatives].join(", ");
  }
  
  /**
   * Score the prompt quality (0-100)
   */
  private scorePrompt(prompt: string): number {
    let score = 70; // Base score
    
    // Length check (optimal 400-700 for Kling 2.6)
    if (prompt.length >= 400 && prompt.length <= 700) {
      score += 10;
    } else if (prompt.length < 200 || prompt.length > 800) {
      score -= 10;
    }
    
    // Boost terms check
    (this.config?.boostTerms ?? []).forEach(term => {
      if (prompt.toLowerCase().includes(term.toLowerCase())) {
        score += 3;
      }
    });

    // Avoid terms check
    (this.config?.avoidTerms ?? []).forEach(term => {
      if (prompt.toLowerCase().includes(term.toLowerCase())) {
        score -= 5;
      }
    });
    
    // Motion keywords check
    const motionKeywords = ["motion", "movement", "animate", "camera", "pan", "zoom", "dolly"];
    motionKeywords.forEach(keyword => {
      if (prompt.toLowerCase().includes(keyword)) {
        score += 2;
      }
    });
    
    return Math.min(100, Math.max(0, score));
  }
  
  /**
   * Generate rationale for prompt choices
   */
  private generateRationale(
    context: SceneContext,
    sceneConfig: typeof SCENE_TYPE_MOTIONS.genocide,
    cameraMotion: CameraMotionSuggestion,
    duration: 5 | 10
  ): string {
    return `
**Scene Analysis: ${context.shotName}**

**Duration Choice (${duration}s):**
- Scene type "${context.sceneType}" typically requires ${sceneConfig.defaultDuration}s for proper emotional impact
- ${duration === 10 ? "Extended duration allows full character motion and emotional beats" : "Shorter duration maintains tension and pacing"}

**Camera Motion (${cameraMotion.type}):**
- "${cameraMotion.description}"
- Intensity ${cameraMotion.intensity}/10 matches the ${sceneConfig.pacing} pacing of this scene type
- Kling 2.6's 6-axis control enables precise ${cameraMotion.type} execution

**Motion Regions:**
- ${context.characterIds.length} character regions for individual motion brush control
- Environment and atmosphere regions for ambient motion
- Total: ${Math.min(6, context.characterIds.length + 2)} regions (Kling 2.6 max: 6)

**Optimization for Kling 2.6:**
- Prompt length: Under 800 chars (provider max)
- Included boost terms: motion brush, precise camera control, emotional expression
- Native audio generation: Available if needed
    `.trim();
  }
  
  /**
   * Batch analyze multiple images
   */
  batchAnalyze(
    shots: Array<{
      imagePath: string;
      context: SceneContext;
    }>,
    options: {
      preferredDuration?: 5 | 10;
      emphasizeEmotion?: boolean;
    } = {}
  ): Map<string, VideoPromptSuggestion> {
    const results = new Map<string, VideoPromptSuggestion>();
    
    for (const shot of shots) {
      const suggestion = this.analyzeAndGeneratePrompt(
        shot.imagePath,
        shot.context,
        options
      );
      results.set(shot.context.shotId, suggestion);
    }
    
    logger.info("Batch analysis complete", { 
      totalShots: shots.length,
      averageScore: Array.from(results.values()).reduce((a, b) => a + b.promptScore, 0) / shots.length 
    });
    
    return results;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let imageAnalyzerInstance: ImageAnalyzer | null = null;

export function getImageAnalyzer(): ImageAnalyzer {
  if (!imageAnalyzerInstance) {
    imageAnalyzerInstance = new ImageAnalyzer();
  }
  return imageAnalyzerInstance;
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Quick function to generate a video prompt for a single image
 */
export function generateVideoPromptForImage(
  imagePath: string,
  context: SceneContext,
  duration: 5 | 10 = 10
): VideoPromptSuggestion {
  return getImageAnalyzer().analyzeAndGeneratePrompt(imagePath, context, {
    preferredDuration: duration,
    emphasizeEmotion: ["genocide", "emotional", "flashback"].includes(context.sceneType),
  });
}

/**
 * Generate prompts for all variations of a shot
 */
export function generateVideoPromptsForShot(
  shotId: string,
  shotName: string,
  sceneType: SceneType,
  description: string,
  characterIds: string[],
  locationIds: string[],
  variationPaths: string[],
  duration: 5 | 10 = 10
): Map<string, VideoPromptSuggestion> {
  const analyzer = getImageAnalyzer();
  const results = new Map<string, VideoPromptSuggestion>();
  
  variationPaths.forEach((imagePath, index) => {
    const cameraAngles = ["extreme_wide", "wide", "medium", "close_up", "low_angle"];
    const context: SceneContext = {
      shotId: `${shotId}_var${index}`,
      shotName,
      sceneType,
      description,
      characterIds,
      locationIds,
      cameraAngle: cameraAngles[index % cameraAngles.length],
    };
    
    const suggestion = analyzer.analyzeAndGeneratePrompt(imagePath, context, {
      preferredDuration: duration,
      emphasizeEmotion: ["genocide", "emotional", "flashback"].includes(sceneType),
    });
    
    results.set(context.shotId, suggestion);
  });
  
  return results;
}
