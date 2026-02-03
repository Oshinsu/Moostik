/**
 * MOOSTIK Prompt Templates
 * Scene-specific prompt templates for video generation - January 2026
 *
 * Templates optimized for MOOSTIK's specific narrative needs
 */

import { VideoProvider } from "./types";

// ============================================
// TYPES
// ============================================

export type SceneType =
  | "genocide"
  | "emotional"
  | "battle"
  | "bar_scene"
  | "training"
  | "establishing"
  | "flashback"
  | "transition";

export interface PromptTemplate {
  id: string;
  sceneType: SceneType;
  name: string;
  description: string;
  template: string;
  placeholders: TemplatePlaceholder[];
  styleGuide: StyleGuide;
  cameraPresets: CameraPreset[];
  recommendedProviders: VideoProvider[];
  negativePromptAdditions: string[];
}

export interface TemplatePlaceholder {
  key: string;
  description: string;
  required: boolean;
  defaultValue?: string;
  examples?: string[];
}

export interface StyleGuide {
  mood: string;
  lighting: string;
  colorPalette: string[];
  motionStyle: string;
  pacing: "slow" | "medium" | "fast" | "variable";
}

export interface CameraPreset {
  name: string;
  motion: string;
  description: string;
}

// ============================================
// MOOSTIK SCENE TEMPLATES
// ============================================

export const PROMPT_TEMPLATES: Record<SceneType, PromptTemplate> = {
  // ============================================
  // GENOCIDE - Massacre scenes
  // ============================================
  genocide: {
    id: "genocide-001",
    sceneType: "genocide",
    name: "Massacre / Violence Scene",
    description: "Template for depicting genocide and massacre scenes with appropriate gravitas",
    template: `{{atmosphere}} scene. {{character_action}}. {{location_description}}. {{emotion}}. Dramatic shadows, muted colors with crimson accents. {{camera_motion}}. Visceral, unflinching cinematography.`,
    placeholders: [
      {
        key: "atmosphere",
        description: "Overall atmosphere",
        required: true,
        defaultValue: "Harrowing, devastating",
        examples: ["Brutal", "Horrific", "Devastating", "Nightmarish"],
      },
      {
        key: "character_action",
        description: "What the character is doing",
        required: true,
        examples: ["A child witnesses the massacre", "Bodies lie motionless", "Blood seeps through wooden floor"],
      },
      {
        key: "location_description",
        description: "Location details",
        required: true,
        examples: ["Inside a modest Caribbean home", "Martinique colonial house", "Village street at dawn"],
      },
      {
        key: "emotion",
        description: "Emotional tone",
        required: false,
        defaultValue: "Profound grief and horror",
        examples: ["Silent terror", "Frozen shock", "Desperate fear"],
      },
      {
        key: "camera_motion",
        description: "Camera movement",
        required: false,
        defaultValue: "Slow dolly, lingering",
      },
    ],
    styleGuide: {
      mood: "Tragic, somber, unforgettable",
      lighting: "Low key, dramatic shadows, occasional harsh light through shutters",
      colorPalette: ["desaturated", "crimson accents", "dark browns", "pale skin tones"],
      motionStyle: "Slow, deliberate movements",
      pacing: "slow",
    },
    cameraPresets: [
      { name: "witness_pov", motion: "static with subtle shake", description: "From child's eye level" },
      { name: "overhead_revelation", motion: "slow crane down", description: "Reveal the full horror" },
      { name: "close_up_reaction", motion: "static", description: "Face capturing silent scream" },
    ],
    recommendedProviders: ["veo-3.1", "kling-2.6", "hailuo-2.3"],
    negativePromptAdditions: [
      "bright colors",
      "cheerful",
      "happy expressions",
      "cartoon violence",
      "comedic",
      "glamorized",
    ],
  },

  // ============================================
  // EMOTIONAL - Character emotion scenes
  // ============================================
  emotional: {
    id: "emotional-001",
    sceneType: "emotional",
    name: "Emotional Character Scene",
    description: "Template for scenes focusing on character emotions and expressions",
    template: `Intimate {{shot_type}} of {{character_name}}. {{emotion_description}}. {{subtle_action}}. {{lighting}}. {{camera_motion}}. Capture micro-expressions, subtle emotional beats.`,
    placeholders: [
      {
        key: "shot_type",
        description: "Type of shot",
        required: true,
        defaultValue: "close-up",
        examples: ["extreme close-up", "medium close-up", "two-shot"],
      },
      {
        key: "character_name",
        description: "Character name/description",
        required: true,
        examples: ["Baby Dorval", "young survivor", "weathered warrior"],
      },
      {
        key: "emotion_description",
        description: "The emotion being portrayed",
        required: true,
        examples: ["Eyes welling with tears", "Jaw clenched in determination", "Subtle trembling"],
      },
      {
        key: "subtle_action",
        description: "Small physical action",
        required: false,
        examples: ["A single tear falls", "Fingers clench", "Breath catches"],
      },
      {
        key: "lighting",
        description: "Lighting setup",
        required: false,
        defaultValue: "Soft side lighting, emotional",
      },
      {
        key: "camera_motion",
        description: "Camera movement",
        required: false,
        defaultValue: "Subtle push in",
      },
    ],
    styleGuide: {
      mood: "Intimate, vulnerable, raw",
      lighting: "Soft, directional, often single source",
      colorPalette: ["warm skin tones", "muted backgrounds", "occasional color splash for emotion"],
      motionStyle: "Minimal character movement, expressive face",
      pacing: "slow",
    },
    cameraPresets: [
      { name: "intimate_push", motion: "very slow push in", description: "Draw viewer into emotion" },
      { name: "tear_track", motion: "slight tilt following tear", description: "Follow the tear down" },
      { name: "breath_hold", motion: "static, no movement", description: "Let emotion fill frame" },
    ],
    recommendedProviders: ["kling-2.6", "hailuo-2.3", "veo-3.1"],
    negativePromptAdditions: [
      "robotic expression",
      "static face",
      "emotionless",
      "stiff",
      "artificial",
    ],
  },

  // ============================================
  // BATTLE - Combat scenes
  // ============================================
  battle: {
    id: "battle-001",
    sceneType: "battle",
    name: "Combat / Battle Scene",
    description: "Template for action-packed combat and battle sequences",
    template: `{{intensity}} combat scene. {{combatants}} {{action_description}}. {{environment}}. {{camera_style}}. Dynamic, visceral action with real weight and impact.`,
    placeholders: [
      {
        key: "intensity",
        description: "Intensity level",
        required: true,
        defaultValue: "Intense",
        examples: ["Brutal", "Frenetic", "Calculated", "Chaotic"],
      },
      {
        key: "combatants",
        description: "Who is fighting",
        required: true,
        examples: ["Two warriors", "A lone fighter against many", "Armies clash"],
      },
      {
        key: "action_description",
        description: "The specific combat action",
        required: true,
        examples: ["exchange devastating blows", "dodge and counter", "clash in a flurry of strikes"],
      },
      {
        key: "environment",
        description: "Combat environment",
        required: false,
        defaultValue: "Urban battlefield",
        examples: ["Rain-soaked alley", "Burning village", "Arena of rubber tires"],
      },
      {
        key: "camera_style",
        description: "Camera approach",
        required: false,
        defaultValue: "Dynamic tracking shot following the action",
      },
    ],
    styleGuide: {
      mood: "Adrenaline, tension, stakes",
      lighting: "High contrast, dramatic, often practical lights",
      colorPalette: ["dark backgrounds", "warm fire highlights", "steel glints", "blood red"],
      motionStyle: "Fast, precise, impactful",
      pacing: "fast",
    },
    cameraPresets: [
      { name: "impact_follow", motion: "fast track following strike", description: "Follow the punch/kick" },
      { name: "wide_chaos", motion: "slow motion wide shot", description: "Capture scale of battle" },
      { name: "over_shoulder", motion: "handheld, over shoulder", description: "Fighter's POV entering combat" },
    ],
    recommendedProviders: ["hailuo-2.3", "kling-2.6", "veo-3.1"],
    negativePromptAdditions: [
      "slow motion only",
      "peaceful",
      "calm",
      "static poses",
      "stiff movement",
      "floaty physics",
    ],
  },

  // ============================================
  // BAR_SCENE - Ti Sang bar scenes
  // ============================================
  bar_scene: {
    id: "bar-001",
    sceneType: "bar_scene",
    name: "Bar Ti Sang Scene",
    description: "Template for scenes in the Bar Ti Sang - survivor gathering place",
    template: `Interior of Bar Ti Sang. {{atmosphere}}. {{character_action}}. {{ambient_details}}. Warm amber lighting, worn wooden surfaces, steam rising from drinks. {{camera_motion}}.`,
    placeholders: [
      {
        key: "atmosphere",
        description: "Bar atmosphere",
        required: true,
        defaultValue: "Dimly lit, intimate",
        examples: ["Smoky and mysterious", "Busy with murmured conversations", "Tense silence"],
      },
      {
        key: "character_action",
        description: "What characters are doing",
        required: true,
        examples: [
          "Koko nurses his rum, staring into middle distance",
          "Survivors huddle around a table, planning",
          "A stranger enters, all eyes turn",
        ],
      },
      {
        key: "ambient_details",
        description: "Background details",
        required: false,
        defaultValue: "Other patrons in soft focus, ceiling fan rotating slowly",
      },
      {
        key: "camera_motion",
        description: "Camera movement",
        required: false,
        defaultValue: "Slow pan across faces",
      },
    ],
    styleGuide: {
      mood: "Conspiratorial, weary, determined",
      lighting: "Warm amber, practical lights (candles, old bulbs), deep shadows",
      colorPalette: ["amber", "burnt orange", "deep brown", "brass", "worn wood tones"],
      motionStyle: "Natural, unhurried movements",
      pacing: "medium",
    },
    cameraPresets: [
      { name: "bar_tracking", motion: "slow track along bar", description: "Pass by patrons" },
      { name: "table_orbit", motion: "slow orbit around table", description: "Circle the conspirators" },
      { name: "entrance_reveal", motion: "push in from door to character", description: "Dramatic entrance" },
    ],
    recommendedProviders: ["wan-2.5", "wan-2.5", "kling-2.6"],
    negativePromptAdditions: [
      "bright daylight",
      "outdoor",
      "action",
      "violence",
      "modern bar",
      "neon lights",
    ],
  },

  // ============================================
  // TRAINING - Combat training scenes
  // ============================================
  training: {
    id: "training-001",
    sceneType: "training",
    name: "Combat Training Scene",
    description: "Template for training and preparation montages",
    template: `{{training_type}} training. {{character}} {{training_action}}. {{location}}. {{physical_details}}. {{camera_style}}. Disciplined, purposeful movements.`,
    placeholders: [
      {
        key: "training_type",
        description: "Type of training",
        required: true,
        defaultValue: "Intensive combat",
        examples: ["Repetitive drills", "Weapons training", "Endurance conditioning"],
      },
      {
        key: "character",
        description: "Who is training",
        required: true,
        examples: ["Young Dorval", "The three survivors", "New recruits"],
      },
      {
        key: "training_action",
        description: "Specific training action",
        required: true,
        examples: [
          "practices strikes against rubber tire targets",
          "runs through obstacle course",
          "spars with mentor",
        ],
      },
      {
        key: "location",
        description: "Training location",
        required: false,
        defaultValue: "Training grounds of Fort Sang Noir",
      },
      {
        key: "physical_details",
        description: "Physical details",
        required: false,
        examples: ["Sweat dripping", "Muscles straining", "Breath visible in cold air"],
      },
      {
        key: "camera_style",
        description: "Camera approach",
        required: false,
        defaultValue: "Dynamic tracking, following movement",
      },
    ],
    styleGuide: {
      mood: "Determined, focused, building power",
      lighting: "Natural daylight or harsh gym lights, sweat-glistening skin",
      colorPalette: ["earth tones", "sweat highlights", "worn equipment colors"],
      motionStyle: "Precise, repetitive, building intensity",
      pacing: "variable",
    },
    cameraPresets: [
      { name: "rep_tracking", motion: "follow repeated movement", description: "Track the drill" },
      { name: "power_reveal", motion: "low angle push", description: "Emphasize strength" },
      { name: "montage_cuts", motion: "rapid static cuts", description: "Training montage style" },
    ],
    recommendedProviders: ["hailuo-2.3", "kling-2.6", "wan-2.5"],
    negativePromptAdditions: [
      "lazy",
      "casual",
      "relaxed",
      "sloppy movement",
      "poor form",
      "untrained",
    ],
  },

  // ============================================
  // ESTABLISHING - Location establishing shots
  // ============================================
  establishing: {
    id: "establishing-001",
    sceneType: "establishing",
    name: "Establishing Shot",
    description: "Template for wide establishing shots of locations",
    template: `{{shot_scale}} establishing shot of {{location}}. {{time_of_day}}. {{atmosphere}}. {{environmental_details}}. {{camera_motion}}. Cinematic scope, setting the scene.`,
    placeholders: [
      {
        key: "shot_scale",
        description: "Shot scale",
        required: true,
        defaultValue: "Wide",
        examples: ["Extreme wide", "Aerial", "Wide panoramic"],
      },
      {
        key: "location",
        description: "Location being established",
        required: true,
        examples: ["Tire City", "Fort Sang Noir", "The Martinique village before the massacre"],
      },
      {
        key: "time_of_day",
        description: "Time of day",
        required: false,
        defaultValue: "Golden hour",
        examples: ["Dawn", "Dusk", "Harsh midday sun", "Moonlit night"],
      },
      {
        key: "atmosphere",
        description: "Atmospheric conditions",
        required: false,
        examples: ["Mist rising", "Storm clouds gathering", "Heat haze", "Smoke in the air"],
      },
      {
        key: "environmental_details",
        description: "Environmental elements",
        required: false,
        examples: ["Birds circling", "Wind moving through trees", "Distant figures moving"],
      },
      {
        key: "camera_motion",
        description: "Camera movement",
        required: false,
        defaultValue: "Slow push in or crane down",
      },
    ],
    styleGuide: {
      mood: "Epic, contextual, grounding",
      lighting: "Natural, atmospheric, often dramatic sky",
      colorPalette: ["location-specific", "atmospheric haze", "sky gradients"],
      motionStyle: "Slow, majestic",
      pacing: "slow",
    },
    cameraPresets: [
      { name: "aerial_descent", motion: "drone-style descent into location", description: "God's eye view" },
      { name: "horizon_pan", motion: "slow horizontal pan across landscape", description: "Reveal scale" },
      { name: "dawn_reveal", motion: "static, let light change", description: "Time passage" },
    ],
    recommendedProviders: ["veo-3.1", "luma-ray-flash-2", "luma-ray-flash-2"],
    negativePromptAdditions: [
      "close-up",
      "face",
      "action",
      "dialogue",
      "small scale",
      "interior",
    ],
  },

  // ============================================
  // FLASHBACK - Memory/flashback scenes
  // ============================================
  flashback: {
    id: "flashback-001",
    sceneType: "flashback",
    name: "Flashback / Memory Scene",
    description: "Template for flashback and memory sequences",
    template: `Flashback scene. {{memory_content}}. {{visual_treatment}}. {{emotional_tone}}. {{transition_style}}. Dreamlike quality, memory fragments.`,
    placeholders: [
      {
        key: "memory_content",
        description: "What the memory shows",
        required: true,
        examples: [
          "Young Dorval hiding under the bed as boots walk past",
          "Mother's face before the violence",
          "Happy village life before the massacre",
        ],
      },
      {
        key: "visual_treatment",
        description: "Visual style for flashback",
        required: false,
        defaultValue: "Soft focus edges, slight color shift",
        examples: ["Desaturated except for one color", "Vignette darkening", "Film grain overlay"],
      },
      {
        key: "emotional_tone",
        description: "Emotional quality",
        required: false,
        defaultValue: "Haunting, bittersweet",
        examples: ["Nostalgic warmth", "Traumatic fragments", "Peaceful before storm"],
      },
      {
        key: "transition_style",
        description: "How it transitions",
        required: false,
        examples: ["Dissolve from present", "Match cut from eye", "Sound-triggered"],
      },
    ],
    styleGuide: {
      mood: "Dreamlike, haunting, fragmented",
      lighting: "Soft, often overexposed highlights, ethereal",
      colorPalette: ["muted", "single accent color", "sepia tints", "blue-shifted"],
      motionStyle: "Floaty, sometimes slow motion",
      pacing: "slow",
    },
    cameraPresets: [
      { name: "memory_float", motion: "slow drift, no fixed point", description: "Wandering memory" },
      { name: "fragment_cuts", motion: "static, rapid fragments", description: "Memory flashes" },
      { name: "dissolve_morph", motion: "interpolation between states", description: "Time blend" },
    ],
    recommendedProviders: ["luma-ray-flash-2", "luma-ray-flash-2", "wan-2.5"],
    negativePromptAdditions: [
      "modern",
      "crisp HD",
      "present day indicators",
      "sharp focus throughout",
    ],
  },

  // ============================================
  // TRANSITION - Scene transitions
  // ============================================
  transition: {
    id: "transition-001",
    sceneType: "transition",
    name: "Scene Transition",
    description: "Template for smooth scene transitions",
    template: `Transition from {{source_scene}} to {{target_scene}}. {{transition_type}}. {{motion_element}}. Seamless flow between scenes.`,
    placeholders: [
      {
        key: "source_scene",
        description: "Starting scene",
        required: true,
        examples: ["close-up of eye", "wide shot of city", "flames"],
      },
      {
        key: "target_scene",
        description: "Target scene",
        required: true,
        examples: ["eye opens in new location", "sunrise over village", "campfire"],
      },
      {
        key: "transition_type",
        description: "Type of transition",
        required: false,
        defaultValue: "Smooth morph",
        examples: ["Match cut", "Dissolve", "Whip pan", "Through object"],
      },
      {
        key: "motion_element",
        description: "Moving element that connects",
        required: false,
        examples: ["Camera pushes through fire", "Pan follows bird", "Zoom into reflection"],
      },
    ],
    styleGuide: {
      mood: "Flowing, connected, purposeful",
      lighting: "Matches both scenes, transitional",
      colorPalette: ["blends between scene palettes"],
      motionStyle: "Smooth, continuous",
      pacing: "medium",
    },
    cameraPresets: [
      { name: "morph_through", motion: "push through connecting element", description: "Object morph" },
      { name: "match_movement", motion: "continuous motion matching scenes", description: "Action match" },
      { name: "time_lapse", motion: "static, time passes", description: "Time transition" },
    ],
    recommendedProviders: ["luma-ray-flash-2", "luma-ray-flash-2", "wan-2.5"],
    negativePromptAdditions: [
      "jarring cut",
      "abrupt",
      "discontinuous",
      "static",
      "no movement",
    ],
  },
};

// ============================================
// TEMPLATE UTILITIES
// ============================================

/**
 * Get template for scene type
 */
export function getPromptTemplate(sceneType: SceneType, provider?: VideoProvider): PromptTemplate | null {
  const template = PROMPT_TEMPLATES[sceneType];
  if (!template) return null;

  // If provider specified, check if it's recommended
  if (provider && !template.recommendedProviders.includes(provider)) {
    // Still return template but could log warning
    console.warn(`Provider ${provider} not recommended for ${sceneType} scenes`);
  }

  return template;
}

/**
 * Apply template with values
 */
export function applyTemplateToPrompt(
  originalPrompt: string,
  template: PromptTemplate,
  values: Record<string, string | undefined>
): string {
  let result = template.template;

  // Replace placeholders with values or defaults
  for (const placeholder of template.placeholders) {
    const value = values[placeholder.key] || placeholder.defaultValue || "";
    const regex = new RegExp(`{{${placeholder.key}}}`, "g");
    result = result.replace(regex, value);
  }

  // If original prompt has content not covered by template, append it
  if (originalPrompt && !result.toLowerCase().includes(originalPrompt.toLowerCase().substring(0, 20))) {
    result = `${result} ${originalPrompt}`;
  }

  // Clean up any unreplaced placeholders
  result = result.replace(/{{[^}]+}}/g, "");

  // Clean up whitespace
  result = result.replace(/\s+/g, " ").trim();

  return result;
}

/**
 * Get camera preset for scene type
 */
export function getCameraPreset(sceneType: SceneType, presetName: string): CameraPreset | null {
  const template = PROMPT_TEMPLATES[sceneType];
  if (!template) return null;

  return template.cameraPresets.find((p) => p.name === presetName) || null;
}

/**
 * Get style guide for scene type
 */
export function getStyleGuide(sceneType: SceneType): StyleGuide | null {
  const template = PROMPT_TEMPLATES[sceneType];
  return template?.styleGuide || null;
}

/**
 * Get all scene types
 */
export function getAllSceneTypes(): SceneType[] {
  return Object.keys(PROMPT_TEMPLATES) as SceneType[];
}

/**
 * Get recommended providers for scene type
 */
export function getRecommendedProviders(sceneType: SceneType): VideoProvider[] {
  const template = PROMPT_TEMPLATES[sceneType];
  return template?.recommendedProviders || [];
}
