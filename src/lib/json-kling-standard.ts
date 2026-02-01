/**
 * JSON KLING 2.6 STANDARD - MOOSTIK BLOODWINGS EDITION
 * ===========================================================================
 * Standard JSON pour la generation video avec Kling 2.6
 * Supporte: 6-axis camera control, motion brush, motion transfer, interpolation
 * 
 * FEATURES:
 * - 50+ camera presets cinematographiques
 * - 20+ emotion/mood presets
 * - Motion brush presets pour animation selective
 * - Moostik-specific scene presets (POV gigantisme, vol, etc.)
 * - Style transfer et reference management
 * - Automatic prompt enhancement
 * 
 * SOTA Janvier 2026
 * ===========================================================================
 */

// ============================================================================
// TYPES
// ============================================================================

export interface JsonKlingMeta {
  model_version: "kling-2.6" | "kling-2.5" | "kling-2.2";
  task_type: "image_to_video" | "text_to_video" | "video_extend";
  project: string;
  shot_id: string;
  scene_intent: string;
  generation_date?: string;
  /** Moostik-specific: POV type */
  pov_type?: "human" | "moostik" | "neutral";
  /** Moostik-specific: Gigantism level (0-10) */
  gigantism_level?: number;
}

export interface JsonKlingSource {
  type: "single_frame" | "first_last_frame" | "text_only";
  first_frame?: string;           // URL image source
  last_frame?: string;            // URL image destination (interpolation)
  reference_shots?: string[];     // URLs shots precedents pour coherence
  style_reference?: string;       // URL image style
}

export interface JsonKlingCamera {
  pan: number;      // -10 to 10, horizontal movement
  tilt: number;     // -10 to 10, vertical movement  
  roll: number;     // -10 to 10, rotation
  zoom: number;     // -10 to 10, in/out
  truck: number;    // -10 to 10, lateral movement
  pedestal: number; // -10 to 10, up/down movement
}

export interface JsonKlingMotionBrushRegion {
  mask_url?: string;
  area?: "top" | "bottom" | "left" | "right" | "center" | "full";
  direction: "up" | "down" | "left" | "right" | "circular" | "random";
  intensity: number; // 0 to 1
}

export interface JsonKlingMotionBrush {
  enabled: boolean;
  regions: JsonKlingMotionBrushRegion[];
}

export interface JsonKlingMotion {
  intensity: number;              // 0 to 1, overall motion strength
  camera: JsonKlingCamera;
  motion_brush?: JsonKlingMotionBrush;
  motion_transfer?: string;       // URL video reference pour style mouvement
}

export interface JsonKlingParameters {
  duration: 5 | 10;               // Kling supporte 5s ou 10s
  aspect_ratio: "16:9" | "9:16" | "1:1" | "4:3" | "21:9";
  resolution: "480p" | "720p" | "1080p" | "4k";
  quality: "draft" | "standard" | "professional";
  fps?: 24 | 30;
  seed?: number;
}

export interface JsonKlingPrompt {
  positive: string;               // Description mouvement/action
  negative: string;               // A eviter
  style_keywords?: string[];      // Mots-cles style
}

export interface JsonKlingConstraints {
  must_include: string[];
  must_not_include: string[];
  continuity_with?: string;       // Shot ID precedent
  maintain_consistency?: boolean; // Coherence avec refs
}

export interface JsonKling {
  meta: JsonKlingMeta;
  source: JsonKlingSource;
  motion: JsonKlingMotion;
  parameters: JsonKlingParameters;
  prompt: JsonKlingPrompt;
  constraints: JsonKlingConstraints;
}

// ============================================================================
// CAMERA PRESETS - 50+ CINEMATOGRAPHIC MOVEMENTS
// ============================================================================

export const KLING_CAMERA_PRESETS: Record<string, Partial<JsonKlingCamera>> = {
  // === STATIC ===
  static: { pan: 0, tilt: 0, roll: 0, zoom: 0, truck: 0, pedestal: 0 },
  locked_off: { pan: 0, tilt: 0, roll: 0, zoom: 0, truck: 0, pedestal: 0 },
  
  // === ZOOM ===
  slow_zoom_in: { pan: 0, tilt: 0, roll: 0, zoom: 3, truck: 0, pedestal: 0 },
  slow_zoom_out: { pan: 0, tilt: 0, roll: 0, zoom: -3, truck: 0, pedestal: 0 },
  medium_zoom_in: { pan: 0, tilt: 0, roll: 0, zoom: 5, truck: 0, pedestal: 0 },
  medium_zoom_out: { pan: 0, tilt: 0, roll: 0, zoom: -5, truck: 0, pedestal: 0 },
  fast_zoom_in: { pan: 0, tilt: 0, roll: 0, zoom: 8, truck: 0, pedestal: 0 },
  fast_zoom_out: { pan: 0, tilt: 0, roll: 0, zoom: -8, truck: 0, pedestal: 0 },
  crash_zoom: { pan: 0, tilt: 0, roll: 0, zoom: 10, truck: 0, pedestal: 0 },
  
  // === PAN (Horizontal Rotation) ===
  pan_left: { pan: -5, tilt: 0, roll: 0, zoom: 0, truck: 0, pedestal: 0 },
  pan_right: { pan: 5, tilt: 0, roll: 0, zoom: 0, truck: 0, pedestal: 0 },
  slow_pan_left: { pan: -3, tilt: 0, roll: 0, zoom: 0, truck: 0, pedestal: 0 },
  slow_pan_right: { pan: 3, tilt: 0, roll: 0, zoom: 0, truck: 0, pedestal: 0 },
  whip_pan_left: { pan: -10, tilt: 0, roll: 0, zoom: 0, truck: 0, pedestal: 0 },
  whip_pan_right: { pan: 10, tilt: 0, roll: 0, zoom: 0, truck: 0, pedestal: 0 },
  
  // === TILT (Vertical Rotation) ===
  tilt_up: { pan: 0, tilt: 5, roll: 0, zoom: 0, truck: 0, pedestal: 0 },
  tilt_down: { pan: 0, tilt: -5, roll: 0, zoom: 0, truck: 0, pedestal: 0 },
  slow_tilt_up: { pan: 0, tilt: 3, roll: 0, zoom: 0, truck: 0, pedestal: 0 },
  slow_tilt_down: { pan: 0, tilt: -3, roll: 0, zoom: 0, truck: 0, pedestal: 0 },
  dramatic_tilt_up: { pan: 0, tilt: 8, roll: 0, zoom: 0, truck: 0, pedestal: 0 },
  
  // === DOLLY (Forward/Backward Movement) ===
  dolly_in: { pan: 0, tilt: 0, roll: 0, zoom: 5, truck: 0, pedestal: 0 },
  dolly_out: { pan: 0, tilt: 0, roll: 0, zoom: -5, truck: 0, pedestal: 0 },
  slow_dolly_in: { pan: 0, tilt: 0, roll: 0, zoom: 3, truck: 0, pedestal: 0 },
  slow_dolly_out: { pan: 0, tilt: 0, roll: 0, zoom: -3, truck: 0, pedestal: 0 },
  fast_dolly_in: { pan: 0, tilt: 0, roll: 0, zoom: 8, truck: 0, pedestal: 0 },
  
  // === TRUCK (Lateral Movement) ===
  truck_left: { pan: 0, tilt: 0, roll: 0, zoom: 0, truck: -5, pedestal: 0 },
  truck_right: { pan: 0, tilt: 0, roll: 0, zoom: 0, truck: 5, pedestal: 0 },
  slow_truck_left: { pan: 0, tilt: 0, roll: 0, zoom: 0, truck: -3, pedestal: 0 },
  slow_truck_right: { pan: 0, tilt: 0, roll: 0, zoom: 0, truck: 3, pedestal: 0 },
  
  // === PEDESTAL (Up/Down Movement) ===
  pedestal_up: { pan: 0, tilt: 0, roll: 0, zoom: 0, truck: 0, pedestal: 5 },
  pedestal_down: { pan: 0, tilt: 0, roll: 0, zoom: 0, truck: 0, pedestal: -5 },
  
  // === CRANE ===
  crane_up: { pan: 0, tilt: -2, roll: 0, zoom: 0, truck: 0, pedestal: 5 },
  crane_down: { pan: 0, tilt: 2, roll: 0, zoom: 0, truck: 0, pedestal: -5 },
  slow_crane_up: { pan: 0, tilt: -1, roll: 0, zoom: 0, truck: 0, pedestal: 3 },
  dramatic_crane_down: { pan: 0, tilt: 3, roll: 0, zoom: 2, truck: 0, pedestal: -7 },
  
  // === ORBIT ===
  orbit_left: { pan: -3, tilt: 0, roll: 0, zoom: 0, truck: -3, pedestal: 0 },
  orbit_right: { pan: 3, tilt: 0, roll: 0, zoom: 0, truck: 3, pedestal: 0 },
  slow_orbit_left: { pan: -2, tilt: 0, roll: 0, zoom: 0, truck: -2, pedestal: 0 },
  slow_orbit_right: { pan: 2, tilt: 0, roll: 0, zoom: 0, truck: 2, pedestal: 0 },
  full_orbit: { pan: 5, tilt: 0, roll: 0, zoom: 0, truck: 5, pedestal: 0 },
  
  // === ROLL (Dutch Angle) ===
  roll_left: { pan: 0, tilt: 0, roll: -3, zoom: 0, truck: 0, pedestal: 0 },
  roll_right: { pan: 0, tilt: 0, roll: 3, zoom: 0, truck: 0, pedestal: 0 },
  dutch_tilt: { pan: 0, tilt: 0, roll: 5, zoom: 0, truck: 0, pedestal: 0 },
  dramatic_dutch: { pan: 0, tilt: 0, roll: 8, zoom: 0, truck: 0, pedestal: 0 },
  
  // === COMBINED CINEMATIC ===
  dramatic_push: { pan: 0, tilt: -1, roll: 0, zoom: 7, truck: 0, pedestal: 0 },
  reveal_pan: { pan: 8, tilt: 0, roll: 0, zoom: 2, truck: 2, pedestal: 0 },
  epic_reveal: { pan: 5, tilt: -2, roll: 0, zoom: 3, truck: 3, pedestal: 2 },
  tension_build: { pan: 0, tilt: -1, roll: 1, zoom: 4, truck: 0, pedestal: 0 },
  emotional_closeup: { pan: 0, tilt: 0, roll: 0, zoom: 6, truck: 0, pedestal: -1 },
  vertigo_effect: { pan: 0, tilt: 0, roll: 0, zoom: 5, truck: 0, pedestal: -5 },
  hitchcock_zoom: { pan: 0, tilt: 0, roll: 0, zoom: 7, truck: 0, pedestal: -3 },
  
  // === MOOSTIK SPECIFIC - POV Flight ===
  moostik_takeoff: { pan: 0, tilt: -5, roll: 2, zoom: 0, truck: 0, pedestal: 8 },
  moostik_dive: { pan: 0, tilt: 7, roll: 0, zoom: 5, truck: 0, pedestal: -8 },
  moostik_glide: { pan: 2, tilt: -1, roll: 0, zoom: 0, truck: 3, pedestal: 0 },
  moostik_hover: { pan: 0, tilt: 0, roll: 1, zoom: 0, truck: 0, pedestal: 1 },
  moostik_approach_target: { pan: 0, tilt: -2, roll: 0, zoom: 6, truck: 0, pedestal: -2 },
  moostik_escape: { pan: 0, tilt: -3, roll: 3, zoom: -5, truck: 0, pedestal: 5 },
  
  // === MOOSTIK SPECIFIC - Gigantism POV ===
  gigantic_reveal: { pan: 0, tilt: 8, roll: 0, zoom: -3, truck: 0, pedestal: 0 },
  micro_pov_approach: { pan: 0, tilt: -3, roll: 0, zoom: 8, truck: 0, pedestal: -1 },
  human_looming: { pan: 0, tilt: -7, roll: 0, zoom: 0, truck: 0, pedestal: 0 },
  
  // === DIALOGUE ===
  dialogue_push: { pan: 0, tilt: 0, roll: 0, zoom: 2, truck: 0, pedestal: 0 },
  reaction_shot: { pan: 3, tilt: 0, roll: 0, zoom: 3, truck: 0, pedestal: 0 },
  two_shot_drift: { pan: 0, tilt: 0, roll: 0, zoom: 0, truck: 2, pedestal: 0 },
  
  // === ESTABLISHING ===
  establishing_sweep: { pan: 6, tilt: -1, roll: 0, zoom: 0, truck: 3, pedestal: 0 },
  location_reveal: { pan: 0, tilt: 4, roll: 0, zoom: 0, truck: 0, pedestal: -5 },
  aerial_survey: { pan: 3, tilt: 2, roll: 0, zoom: -2, truck: 2, pedestal: 3 },
};

export const KLING_MOTION_PRESETS: Record<string, number> = {
  // Standard
  static: 0.0,
  minimal: 0.1,
  subtle: 0.2,
  gentle: 0.35,
  moderate: 0.5,
  dynamic: 0.7,
  intense: 0.85,
  extreme: 1.0,
  
  // Scene-specific
  portrait_breathing: 0.15,
  landscape_drift: 0.25,
  action_combat: 0.8,
  emotional_tremor: 0.3,
  suspense_stillness: 0.05,
  celebration: 0.6,
  nightmare: 0.75,
  memory_haze: 0.2,
};

// ============================================================================
// MOOD/EMOTION PRESETS
// ============================================================================

export interface MoodPreset {
  motionIntensity: number;
  cameraPreset: keyof typeof KLING_CAMERA_PRESETS;
  colorGrading?: string;
  atmosphericNotes: string[];
}

export const KLING_MOOD_PRESETS: Record<string, MoodPreset> = {
  peaceful: {
    motionIntensity: 0.2,
    cameraPreset: "slow_zoom_in",
    colorGrading: "warm golden hour",
    atmosphericNotes: ["soft light", "gentle breeze", "calm atmosphere"],
  },
  tense: {
    motionIntensity: 0.35,
    cameraPreset: "tension_build",
    colorGrading: "desaturated cold",
    atmosphericNotes: ["sharp shadows", "stillness before storm", "held breath"],
  },
  dramatic: {
    motionIntensity: 0.6,
    cameraPreset: "dramatic_push",
    colorGrading: "high contrast",
    atmosphericNotes: ["dynamic lighting", "emotional weight", "pivotal moment"],
  },
  terrifying: {
    motionIntensity: 0.4,
    cameraPreset: "dutch_tilt",
    colorGrading: "sickly green shadows",
    atmosphericNotes: ["unnatural stillness", "creeping dread", "something wrong"],
  },
  triumphant: {
    motionIntensity: 0.7,
    cameraPreset: "epic_reveal",
    colorGrading: "golden heroic",
    atmosphericNotes: ["swelling music beat", "hero pose", "light rays"],
  },
  melancholic: {
    motionIntensity: 0.15,
    cameraPreset: "slow_zoom_out",
    colorGrading: "muted blue hour",
    atmosphericNotes: ["lonely", "fading light", "memory dissolving"],
  },
  action: {
    motionIntensity: 0.85,
    cameraPreset: "whip_pan_right",
    colorGrading: "vivid saturated",
    atmosphericNotes: ["blur of motion", "impact", "adrenaline"],
  },
  mysterious: {
    motionIntensity: 0.25,
    cameraPreset: "reveal_pan",
    colorGrading: "deep shadows purple",
    atmosphericNotes: ["fog", "partial reveal", "unknown lurking"],
  },
  intimate: {
    motionIntensity: 0.1,
    cameraPreset: "emotional_closeup",
    colorGrading: "warm skin tones",
    atmosphericNotes: ["close", "vulnerable", "connection"],
  },
  epic: {
    motionIntensity: 0.5,
    cameraPreset: "crane_up",
    colorGrading: "cinematic teal orange",
    atmosphericNotes: ["vast scale", "heroic framing", "destiny"],
  },
  horrific: {
    motionIntensity: 0.3,
    cameraPreset: "dramatic_dutch",
    colorGrading: "blood red accents",
    atmosphericNotes: ["visceral", "shock", "no escape"],
  },
  nostalgic: {
    motionIntensity: 0.2,
    cameraPreset: "slow_dolly_out",
    colorGrading: "faded warm film",
    atmosphericNotes: ["memory grain", "soft focus edges", "time passed"],
  },
  // Moostik-specific moods
  moostik_predator: {
    motionIntensity: 0.4,
    cameraPreset: "moostik_approach_target",
    colorGrading: "infrared heat vision",
    atmosphericNotes: ["hunter focus", "target locked", "pulse sensing"],
  },
  moostik_genocide_trauma: {
    motionIntensity: 0.6,
    cameraPreset: "dramatic_dutch",
    colorGrading: "toxic green nightmare",
    atmosphericNotes: ["BYSS cloud", "mass death", "survivor guilt"],
  },
  moostik_hope: {
    motionIntensity: 0.35,
    cameraPreset: "slow_crane_up",
    colorGrading: "amber dawn",
    atmosphericNotes: ["new beginning", "clan rises", "vengeance coming"],
  },
};

// ============================================================================
// MOTION BRUSH PRESETS
// ============================================================================

export const KLING_MOTION_BRUSH_PRESETS: Record<string, JsonKlingMotionBrush> = {
  // Wings flapping
  moostik_wings: {
    enabled: true,
    regions: [
      { area: "left", direction: "up", intensity: 0.8 },
      { area: "right", direction: "up", intensity: 0.8 },
    ],
  },
  // Subtle background movement
  background_drift: {
    enabled: true,
    regions: [
      { area: "full", direction: "left", intensity: 0.2 },
    ],
  },
  // Fog/mist animation
  fog_crawl: {
    enabled: true,
    regions: [
      { area: "bottom", direction: "right", intensity: 0.3 },
    ],
  },
  // Character breathing
  breathing: {
    enabled: true,
    regions: [
      { area: "center", direction: "up", intensity: 0.15 },
    ],
  },
  // Wind in vegetation
  wind_vegetation: {
    enabled: true,
    regions: [
      { area: "top", direction: "right", intensity: 0.4 },
      { area: "center", direction: "right", intensity: 0.25 },
    ],
  },
  // Water ripples
  water_surface: {
    enabled: true,
    regions: [
      { area: "bottom", direction: "circular", intensity: 0.35 },
    ],
  },
  // Fire flicker
  fire_flicker: {
    enabled: true,
    regions: [
      { area: "center", direction: "up", intensity: 0.6 },
      { area: "center", direction: "random", intensity: 0.4 },
    ],
  },
  // Dust particles
  dust_float: {
    enabled: true,
    regions: [
      { area: "full", direction: "up", intensity: 0.15 },
    ],
  },
  // Blood drip
  blood_drip: {
    enabled: true,
    regions: [
      { area: "top", direction: "down", intensity: 0.5 },
    ],
  },
  // Human hand swat (gigantism POV)
  giant_hand_descend: {
    enabled: true,
    regions: [
      { area: "top", direction: "down", intensity: 0.9 },
    ],
  },
};

export const KLING_DEFAULT_PARAMS: JsonKlingParameters = {
  duration: 5,
  aspect_ratio: "16:9",
  resolution: "1080p",
  quality: "professional",
  fps: 24,
};

export const KLING_DEFAULT_NEGATIVE = [
  "blurry",
  "distorted",
  "flickering",
  "jittery",
  "low quality",
  "artifacts",
  "morphing face",
  "inconsistent lighting",
  "temporal noise",
  "frame skipping",
].join(", ");

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Cree un JsonKling vide avec valeurs par defaut
 */
export function createEmptyJsonKling(shotId: string, project: string = "MOOSTIK"): JsonKling {
  return {
    meta: {
      model_version: "kling-2.6",
      task_type: "image_to_video",
      project,
      shot_id: shotId,
      scene_intent: "",
      generation_date: new Date().toISOString(),
    },
    source: {
      type: "single_frame",
    },
    motion: {
      intensity: KLING_MOTION_PRESETS.gentle,
      camera: { ...KLING_CAMERA_PRESETS.static } as JsonKlingCamera,
    },
    parameters: { ...KLING_DEFAULT_PARAMS },
    prompt: {
      positive: "",
      negative: KLING_DEFAULT_NEGATIVE,
    },
    constraints: {
      must_include: [],
      must_not_include: [],
    },
  };
}

/**
 * Cree un JsonKling complet a partir des donnees du shot
 */
export function createJsonKling(options: {
  shotId: string;
  project?: string;
  sceneIntent: string;
  sourceType: "single_frame" | "first_last_frame" | "text_only";
  firstFrame?: string;
  lastFrame?: string;
  referenceShots?: string[];
  cameraPreset?: keyof typeof KLING_CAMERA_PRESETS;
  motionIntensity?: keyof typeof KLING_MOTION_PRESETS;
  duration?: 5 | 10;
  aspectRatio?: JsonKlingParameters["aspect_ratio"];
  resolution?: JsonKlingParameters["resolution"];
  prompt: string;
  negativePrompt?: string;
  mustInclude?: string[];
  mustNotInclude?: string[];
  continuityWith?: string;
  motionBrush?: JsonKlingMotionBrush;
  seed?: number;
}): JsonKling {
  const {
    shotId,
    project = "MOOSTIK",
    sceneIntent,
    sourceType,
    firstFrame,
    lastFrame,
    referenceShots,
    cameraPreset = "static",
    motionIntensity = "gentle",
    duration = 5,
    aspectRatio = "16:9",
    resolution = "1080p",
    prompt,
    negativePrompt,
    mustInclude = [],
    mustNotInclude = [],
    continuityWith,
    motionBrush,
    seed,
  } = options;

  return {
    meta: {
      model_version: "kling-2.6",
      task_type: sourceType === "text_only" ? "text_to_video" : "image_to_video",
      project,
      shot_id: shotId,
      scene_intent: sceneIntent,
      generation_date: new Date().toISOString(),
    },
    source: {
      type: sourceType,
      first_frame: firstFrame,
      last_frame: lastFrame,
      reference_shots: referenceShots,
    },
    motion: {
      intensity: KLING_MOTION_PRESETS[motionIntensity] ?? 0.35,
      camera: { ...KLING_CAMERA_PRESETS.static, ...KLING_CAMERA_PRESETS[cameraPreset] } as JsonKlingCamera,
      motion_brush: motionBrush,
    },
    parameters: {
      duration,
      aspect_ratio: aspectRatio,
      resolution,
      quality: "professional",
      fps: 24,
      seed,
    },
    prompt: {
      positive: prompt,
      negative: negativePrompt || KLING_DEFAULT_NEGATIVE,
    },
    constraints: {
      must_include: mustInclude,
      must_not_include: mustNotInclude,
      continuity_with: continuityWith,
      maintain_consistency: !!referenceShots?.length,
    },
  };
}

/**
 * Convertit un JsonKling en parametres pour l'API Kling
 */
export function jsonKlingToApiParams(json: JsonKling): Record<string, unknown> {
  const params: Record<string, unknown> = {
    prompt: json.prompt.positive,
    negative_prompt: json.prompt.negative,
    duration: json.parameters.duration,
    aspect_ratio: json.parameters.aspect_ratio,
  };

  // Source images
  if (json.source.first_frame) {
    params.image = json.source.first_frame;
  }
  if (json.source.last_frame) {
    params.end_image = json.source.last_frame;
  }

  // Camera controls (6-axis)
  if (json.motion.camera) {
    params.camera_control = {
      pan: json.motion.camera.pan,
      tilt: json.motion.camera.tilt,
      roll: json.motion.camera.roll,
      zoom: json.motion.camera.zoom,
      horizontal: json.motion.camera.truck,
      vertical: json.motion.camera.pedestal,
    };
  }

  // Motion intensity
  params.motion_intensity = json.motion.intensity;

  // Seed
  if (json.parameters.seed) {
    params.seed = json.parameters.seed;
  }

  // Quality
  if (json.parameters.quality === "professional") {
    params.professional_mode = true;
  }

  return params;
}

/**
 * Determine le camera preset optimal pour un type de scene
 */
export function getCameraPresetForScene(
  sceneType: string,
  action?: string
): keyof typeof KLING_CAMERA_PRESETS {
  const sceneTypeMap: Record<string, keyof typeof KLING_CAMERA_PRESETS> = {
    portrait: "slow_zoom_in",
    landscape: "pan_right",
    establishing: "crane_down",
    reveal: "reveal_pan",
    action: "dramatic_push",
    dialogue: "static",
    transition: "dolly_in",
    flashback: "slow_zoom_out",
    dramatic: "dramatic_push",
    peaceful: "slow_zoom_in",
    tense: "slow_zoom_in",
  };

  // Check action keywords
  if (action) {
    const actionLower = action.toLowerCase();
    if (actionLower.includes("fly") || actionLower.includes("vol")) return "crane_up";
    if (actionLower.includes("approach") || actionLower.includes("approche")) return "dolly_in";
    if (actionLower.includes("reveal") || actionLower.includes("revele")) return "reveal_pan";
    if (actionLower.includes("orbit") || actionLower.includes("tourne")) return "orbit_right";
  }

  return sceneTypeMap[sceneType] || "static";
}

/**
 * Determine l'intensite de mouvement pour un type de scene
 */
export function getMotionIntensityForScene(
  sceneType: string,
  hasCharacterMovement: boolean = false
): keyof typeof KLING_MOTION_PRESETS {
  if (hasCharacterMovement) {
    return sceneType === "action" ? "dynamic" : "moderate";
  }

  const intensityMap: Record<string, keyof typeof KLING_MOTION_PRESETS> = {
    portrait: "subtle",
    landscape: "gentle",
    establishing: "gentle",
    action: "intense",
    dialogue: "subtle",
    transition: "moderate",
    flashback: "subtle",
    dramatic: "moderate",
    peaceful: "subtle",
    tense: "gentle",
  };

  return intensityMap[sceneType] || "gentle";
}

/**
 * Valide un JsonKling
 */
export function validateJsonKling(json: JsonKling): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Meta validation
  if (!json.meta.shot_id) errors.push("shot_id requis");
  if (!json.meta.scene_intent) errors.push("scene_intent requis");

  // Source validation
  if (json.source.type === "single_frame" && !json.source.first_frame) {
    errors.push("first_frame requis pour single_frame");
  }
  if (json.source.type === "first_last_frame") {
    if (!json.source.first_frame) errors.push("first_frame requis pour interpolation");
    if (!json.source.last_frame) errors.push("last_frame requis pour interpolation");
  }

  // Motion validation
  if (json.motion.intensity < 0 || json.motion.intensity > 1) {
    errors.push("motion.intensity doit etre entre 0 et 1");
  }
  
  const cameraFields = ["pan", "tilt", "roll", "zoom", "truck", "pedestal"] as const;
  for (const field of cameraFields) {
    const value = json.motion.camera[field];
    if (value < -10 || value > 10) {
      errors.push(`camera.${field} doit etre entre -10 et 10`);
    }
  }

  // Parameters validation
  if (![5, 10].includes(json.parameters.duration)) {
    errors.push("duration doit etre 5 ou 10 secondes");
  }

  // Prompt validation
  if (!json.prompt.positive || json.prompt.positive.length < 10) {
    errors.push("prompt.positive requis (min 10 caracteres)");
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// MOOSTIK-SPECIFIC SCENE PRESETS
// ============================================================================

export interface MoostikScenePreset {
  name: string;
  description: string;
  cameraPreset: keyof typeof KLING_CAMERA_PRESETS;
  motionIntensity: number;
  motionBrush?: keyof typeof KLING_MOTION_BRUSH_PRESETS;
  mood: keyof typeof KLING_MOOD_PRESETS;
  duration: 5 | 10;
  promptEnhancements: string[];
  negativeEnhancements: string[];
}

export const MOOSTIK_SCENE_PRESETS: Record<string, MoostikScenePreset> = {
  // === FLIGHT SCENES ===
  moostik_flight_peaceful: {
    name: "Vol paisible",
    description: "Moostik volant calmement dans l'air caribéen",
    cameraPreset: "moostik_glide",
    motionIntensity: 0.35,
    motionBrush: "moostik_wings",
    mood: "peaceful",
    duration: 5,
    promptEnhancements: [
      "graceful wing movement",
      "micro-scale flight",
      "Caribbean warm light",
      "Pixar-quality rendering",
    ],
    negativeEnhancements: ["clumsy", "static wings", "ugly", "deformed"],
  },
  moostik_flight_attack: {
    name: "Vol d'attaque",
    description: "Moostik en mode prédateur, approche de la cible",
    cameraPreset: "moostik_approach_target",
    motionIntensity: 0.7,
    motionBrush: "moostik_wings",
    mood: "moostik_predator",
    duration: 5,
    promptEnhancements: [
      "predator focus",
      "target locked",
      "intense determination",
      "blood sensor activated",
      "demonic cute intensity",
    ],
    negativeEnhancements: ["friendly", "calm", "playful", "distracted"],
  },
  moostik_flight_escape: {
    name: "Fuite désespérée",
    description: "Moostik fuyant un danger (main humaine, insecticide)",
    cameraPreset: "moostik_escape",
    motionIntensity: 0.9,
    motionBrush: "moostik_wings",
    mood: "terrifying",
    duration: 5,
    promptEnhancements: [
      "desperate escape",
      "giant threat looming",
      "survival instinct",
      "blur of motion",
      "heart-pounding",
    ],
    negativeEnhancements: ["slow", "calm", "safe", "peaceful"],
  },
  
  // === GIGANTISM POV SCENES ===
  pov_human_looming: {
    name: "POV humain menaçant",
    description: "Vue Moostik d'un humain gigantesque qui approche",
    cameraPreset: "human_looming",
    motionIntensity: 0.4,
    mood: "terrifying",
    duration: 10,
    promptEnhancements: [
      "extreme low angle",
      "giant human silhouette",
      "micro-scale perspective",
      "overwhelming size difference",
      "doom approaching",
    ],
    negativeEnhancements: ["normal scale", "friendly human", "eye level"],
  },
  pov_ear_approach: {
    name: "Approche de l'oreille",
    description: "Moostik approchant une oreille humaine gigantesque",
    cameraPreset: "micro_pov_approach",
    motionIntensity: 0.5,
    mood: "moostik_predator",
    duration: 10,
    promptEnhancements: [
      "giant ear canyon",
      "skin texture like landscape",
      "hair forest",
      "warm blood pulsing beneath",
      "target destination",
    ],
    negativeEnhancements: ["normal size", "cartoon ear", "small"],
  },
  pov_hand_swat: {
    name: "Main qui s'abat",
    description: "Main humaine gigantesque descendant pour écraser",
    cameraPreset: "gigantic_reveal",
    motionIntensity: 0.8,
    motionBrush: "giant_hand_descend",
    mood: "horrific",
    duration: 5,
    promptEnhancements: [
      "massive hand descending",
      "planet-sized palm",
      "shadow of doom",
      "no escape",
      "micro-scale terror",
    ],
    negativeEnhancements: ["small hand", "gentle", "slow"],
  },
  
  // === BAR TI-SANG SCENES ===
  bar_ambiance: {
    name: "Ambiance Bar Ti-Sang",
    description: "Intérieur du bar Moostik, ambiance tamisée",
    cameraPreset: "slow_orbit_right",
    motionIntensity: 0.25,
    motionBrush: "dust_float",
    mood: "mysterious",
    duration: 10,
    promptEnhancements: [
      "amber candlelight",
      "tire wall architecture",
      "moostik patrons",
      "blood-red cocktails",
      "speakeasy atmosphere",
      "micro-gothic luxury",
    ],
    negativeEnhancements: ["bright", "modern", "human scale", "clean"],
  },
  bar_confrontation: {
    name: "Confrontation au bar",
    description: "Moment de tension entre personnages au bar",
    cameraPreset: "tension_build",
    motionIntensity: 0.35,
    mood: "tense",
    duration: 10,
    promptEnhancements: [
      "dramatic lighting",
      "characters face-off",
      "held breath moment",
      "bar patrons watching",
    ],
    negativeEnhancements: ["relaxed", "friendly", "casual"],
  },
  
  // === GENOCIDE SCENES ===
  genocide_byss_cloud: {
    name: "Nuage BYSS",
    description: "Le nuage toxique envahissant la Martinique",
    cameraPreset: "dramatic_crane_down",
    motionIntensity: 0.6,
    motionBrush: "fog_crawl",
    mood: "moostik_genocide_trauma",
    duration: 10,
    promptEnhancements: [
      "toxic green cloud",
      "mass death",
      "falling moostiks",
      "apocalyptic sky",
      "no escape",
      "genocide horror",
    ],
    negativeEnhancements: ["peaceful", "survival", "hope", "clean air"],
  },
  genocide_survivor: {
    name: "Survivant du génocide",
    description: "Moostik survivant traumatisé après l'attaque",
    cameraPreset: "emotional_closeup",
    motionIntensity: 0.2,
    motionBrush: "breathing",
    mood: "melancholic",
    duration: 10,
    promptEnhancements: [
      "shell-shocked",
      "trauma in eyes",
      "dust-covered",
      "sole survivor",
      "haunted expression",
      "Pixar emotional depth",
    ],
    negativeEnhancements: ["happy", "clean", "unaffected", "cheerful"],
  },
  
  // === EMOTIONAL SCENES ===
  papy_tik_wisdom: {
    name: "Sagesse de Papy Tik",
    description: "Papy Tik partageant sa sagesse philosophique",
    cameraPreset: "dialogue_push",
    motionIntensity: 0.15,
    mood: "intimate",
    duration: 10,
    promptEnhancements: [
      "wise elder moostik",
      "one eye glowing",
      "philosophical moment",
      "amber light",
      "weight of experience",
      "Pixar elder character",
    ],
    negativeEnhancements: ["young", "two eyes", "energetic", "casual"],
  },
  baby_dorval_trauma: {
    name: "Trauma Baby Dorval",
    description: "Baby Dorval confrontant ses souvenirs traumatiques",
    cameraPreset: "dutch_tilt",
    motionIntensity: 0.4,
    mood: "horrific",
    duration: 10,
    promptEnhancements: [
      "Caribbean child",
      "dark skin",
      "trauma flashback",
      "orphan pain",
      "Pixar emotional realism",
      "haunted eyes",
    ],
    negativeEnhancements: ["happy", "carefree", "adult", "caucasian"],
  },
  
  // === ESTABLISHING SCENES ===
  martinique_dawn: {
    name: "Aube Martinique",
    description: "Vue panoramique de la Martinique à l'aube",
    cameraPreset: "aerial_survey",
    motionIntensity: 0.3,
    motionBrush: "background_drift",
    mood: "epic",
    duration: 10,
    promptEnhancements: [
      "Caribbean paradise",
      "tropical mountains",
      "first light",
      "cinematic establishing shot",
      "lush vegetation",
      "morning mist",
    ],
    negativeEnhancements: ["night", "urban", "cold", "barren"],
  },
  cooltik_village_reveal: {
    name: "Révélation Village Cooltik",
    description: "Première vue du village caché des Moostiks",
    cameraPreset: "epic_reveal",
    motionIntensity: 0.45,
    mood: "mysterious",
    duration: 10,
    promptEnhancements: [
      "hidden civilization",
      "micro-scale city",
      "organic architecture",
      "bioluminescent lights",
      "leaf structures",
      "wonder reveal",
    ],
    negativeEnhancements: ["human city", "modern", "visible", "simple"],
  },
};

// ============================================================================
// ADVANCED BUILDERS
// ============================================================================

/**
 * Builder fluide pour JsonKling
 */
export class JsonKlingBuilder {
  private config: Partial<JsonKling> = {};
  
  constructor(shotId: string, project: string = "MOOSTIK") {
    this.config = createEmptyJsonKling(shotId, project);
  }
  
  /** Define scene intent */
  intent(intent: string): this {
    this.config.meta!.scene_intent = intent;
    return this;
  }
  
  /** Set source type and frames */
  source(type: JsonKlingSource["type"], firstFrame?: string, lastFrame?: string): this {
    this.config.source = { type, first_frame: firstFrame, last_frame: lastFrame };
    return this;
  }
  
  /** Add reference shots */
  references(...refs: string[]): this {
    this.config.source!.reference_shots = refs;
    return this;
  }
  
  /** Apply camera preset */
  camera(preset: keyof typeof KLING_CAMERA_PRESETS): this {
    this.config.motion!.camera = { 
      ...KLING_CAMERA_PRESETS.static, 
      ...KLING_CAMERA_PRESETS[preset] 
    } as JsonKlingCamera;
    return this;
  }
  
  /** Custom camera values */
  customCamera(camera: Partial<JsonKlingCamera>): this {
    this.config.motion!.camera = { ...this.config.motion!.camera, ...camera };
    return this;
  }
  
  /** Set motion intensity */
  motion(intensity: keyof typeof KLING_MOTION_PRESETS | number): this {
    this.config.motion!.intensity = typeof intensity === "number" 
      ? intensity 
      : KLING_MOTION_PRESETS[intensity];
    return this;
  }
  
  /** Apply motion brush preset */
  motionBrush(preset: keyof typeof KLING_MOTION_BRUSH_PRESETS): this {
    this.config.motion!.motion_brush = KLING_MOTION_BRUSH_PRESETS[preset];
    return this;
  }
  
  /** Apply mood preset */
  mood(preset: keyof typeof KLING_MOOD_PRESETS): this {
    const mood = KLING_MOOD_PRESETS[preset];
    this.config.motion!.intensity = mood.motionIntensity;
    this.config.motion!.camera = { 
      ...KLING_CAMERA_PRESETS.static, 
      ...KLING_CAMERA_PRESETS[mood.cameraPreset] 
    } as JsonKlingCamera;
    return this;
  }
  
  /** Apply Moostik scene preset */
  moostikScene(preset: keyof typeof MOOSTIK_SCENE_PRESETS): this {
    const scene = MOOSTIK_SCENE_PRESETS[preset];
    this.config.meta!.scene_intent = scene.description;
    this.config.motion!.intensity = scene.motionIntensity;
    this.config.motion!.camera = { 
      ...KLING_CAMERA_PRESETS.static, 
      ...KLING_CAMERA_PRESETS[scene.cameraPreset] 
    } as JsonKlingCamera;
    if (scene.motionBrush) {
      this.config.motion!.motion_brush = KLING_MOTION_BRUSH_PRESETS[scene.motionBrush];
    }
    this.config.parameters!.duration = scene.duration;
    // Enhance prompt
    const currentPrompt = this.config.prompt!.positive || "";
    this.config.prompt!.positive = currentPrompt 
      ? `${currentPrompt}. ${scene.promptEnhancements.join(", ")}`
      : scene.promptEnhancements.join(", ");
    // Enhance negative
    const currentNeg = this.config.prompt!.negative || "";
    this.config.prompt!.negative = `${currentNeg}, ${scene.negativeEnhancements.join(", ")}`;
    return this;
  }
  
  /** Set duration */
  duration(d: 5 | 10): this {
    this.config.parameters!.duration = d;
    return this;
  }
  
  /** Set aspect ratio */
  aspectRatio(ratio: JsonKlingParameters["aspect_ratio"]): this {
    this.config.parameters!.aspect_ratio = ratio;
    return this;
  }
  
  /** Set resolution */
  resolution(res: JsonKlingParameters["resolution"]): this {
    this.config.parameters!.resolution = res;
    return this;
  }
  
  /** Set prompt */
  prompt(positive: string, negative?: string): this {
    this.config.prompt!.positive = positive;
    if (negative) this.config.prompt!.negative = negative;
    return this;
  }
  
  /** Add style keywords */
  styleKeywords(...keywords: string[]): this {
    this.config.prompt!.style_keywords = keywords;
    return this;
  }
  
  /** Set constraints */
  constraints(include: string[], exclude: string[]): this {
    this.config.constraints!.must_include = include;
    this.config.constraints!.must_not_include = exclude;
    return this;
  }
  
  /** Set continuity with previous shot */
  continuityWith(shotId: string): this {
    this.config.constraints!.continuity_with = shotId;
    this.config.constraints!.maintain_consistency = true;
    return this;
  }
  
  /** Set POV type (Moostik-specific) */
  povType(pov: "human" | "moostik" | "neutral"): this {
    this.config.meta!.pov_type = pov;
    return this;
  }
  
  /** Set gigantism level (Moostik-specific) */
  gigantismLevel(level: number): this {
    this.config.meta!.gigantism_level = Math.max(0, Math.min(10, level));
    return this;
  }
  
  /** Set seed */
  seed(s: number): this {
    this.config.parameters!.seed = s;
    return this;
  }
  
  /** Build final JsonKling */
  build(): JsonKling {
    const result = this.config as JsonKling;
    const validation = validateJsonKling(result);
    if (!validation.valid) {
      console.warn("[JsonKlingBuilder] Validation warnings:", validation.errors);
    }
    return result;
  }
}

/**
 * Create a new JsonKling builder
 */
export function klingBuilder(shotId: string, project?: string): JsonKlingBuilder {
  return new JsonKlingBuilder(shotId, project);
}

// ============================================================================
// PROMPT ENHANCEMENT HELPERS
// ============================================================================

/**
 * Enhance a basic prompt with cinematic keywords
 */
export function enhancePromptForKling(
  basePrompt: string,
  options: {
    style?: "cinematic" | "animated" | "realistic" | "stylized";
    mood?: keyof typeof KLING_MOOD_PRESETS;
    quality?: "draft" | "standard" | "professional";
    moostikSpecific?: boolean;
  } = {}
): string {
  const { style = "cinematic", mood, quality = "professional", moostikSpecific = true } = options;
  
  const enhancements: string[] = [basePrompt];
  
  // Style enhancements
  const styleMap: Record<string, string[]> = {
    cinematic: ["cinematic lighting", "film quality", "professional cinematography"],
    animated: ["Pixar quality", "3D animated", "smooth animation"],
    realistic: ["photorealistic", "lifelike", "natural lighting"],
    stylized: ["artistic style", "unique aesthetic", "creative interpretation"],
  };
  enhancements.push(...styleMap[style]);
  
  // Mood enhancements
  if (mood && KLING_MOOD_PRESETS[mood]) {
    enhancements.push(...KLING_MOOD_PRESETS[mood].atmosphericNotes);
  }
  
  // Quality enhancements
  if (quality === "professional") {
    enhancements.push("masterpiece", "high detail", "professional quality");
  }
  
  // Moostik-specific
  if (moostikSpecific) {
    enhancements.push("Pixar-demonic aesthetic", "cute but menacing", "blood-red accents");
  }
  
  return enhancements.join(", ");
}

/**
 * Generate negative prompt based on scene type
 */
export function generateNegativePrompt(
  sceneType: string,
  additionalNegatives: string[] = []
): string {
  const baseNegatives = KLING_DEFAULT_NEGATIVE.split(", ");
  
  const sceneNegatives: Record<string, string[]> = {
    portrait: ["bad anatomy", "extra limbs", "distorted face"],
    action: ["frozen", "static", "stiff movement"],
    dialogue: ["closed mouth when speaking", "no lip movement"],
    establishing: ["cropped", "cluttered", "confusing composition"],
    emotional: ["emotionless", "blank expression", "wooden acting"],
    flight: ["grounded", "static wings", "no movement"],
    gigantism: ["normal scale", "equal size", "no size difference"],
  };
  
  const typeNegatives = sceneNegatives[sceneType] || [];
  
  return [...new Set([...baseNegatives, ...typeNegatives, ...additionalNegatives])].join(", ");
}

/**
 * Get recommended settings for a scene type
 */
export function getRecommendedSettings(sceneType: string): {
  cameraPreset: keyof typeof KLING_CAMERA_PRESETS;
  motionIntensity: number;
  duration: 5 | 10;
  motionBrush?: keyof typeof KLING_MOTION_BRUSH_PRESETS;
} {
  // Check Moostik presets first
  if (sceneType in MOOSTIK_SCENE_PRESETS) {
    const preset = MOOSTIK_SCENE_PRESETS[sceneType];
    return {
      cameraPreset: preset.cameraPreset,
      motionIntensity: preset.motionIntensity,
      duration: preset.duration,
      motionBrush: preset.motionBrush,
    };
  }
  
  // Generic recommendations
  const recommendations: Record<string, ReturnType<typeof getRecommendedSettings>> = {
    portrait: { cameraPreset: "slow_zoom_in", motionIntensity: 0.2, duration: 5, motionBrush: "breathing" },
    landscape: { cameraPreset: "slow_pan_right", motionIntensity: 0.25, duration: 10, motionBrush: "background_drift" },
    action: { cameraPreset: "whip_pan_right", motionIntensity: 0.85, duration: 5 },
    dialogue: { cameraPreset: "dialogue_push", motionIntensity: 0.15, duration: 10 },
    establishing: { cameraPreset: "establishing_sweep", motionIntensity: 0.3, duration: 10 },
    transition: { cameraPreset: "dolly_in", motionIntensity: 0.4, duration: 5 },
    emotional: { cameraPreset: "emotional_closeup", motionIntensity: 0.2, duration: 10, motionBrush: "breathing" },
    flight: { cameraPreset: "moostik_glide", motionIntensity: 0.5, duration: 5, motionBrush: "moostik_wings" },
    horror: { cameraPreset: "dutch_tilt", motionIntensity: 0.4, duration: 10, motionBrush: "dust_float" },
    reveal: { cameraPreset: "epic_reveal", motionIntensity: 0.5, duration: 10 },
  };
  
  return recommendations[sceneType] || {
    cameraPreset: "static",
    motionIntensity: 0.35,
    duration: 5,
  };
}

// ============================================================================
// EXPORT ALL PRESETS FOR EXTERNAL ACCESS
// ============================================================================

export const ALL_PRESETS = {
  camera: KLING_CAMERA_PRESETS,
  motion: KLING_MOTION_PRESETS,
  mood: KLING_MOOD_PRESETS,
  motionBrush: KLING_MOTION_BRUSH_PRESETS,
  moostikScenes: MOOSTIK_SCENE_PRESETS,
} as const;
