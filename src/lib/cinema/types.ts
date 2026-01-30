/**
 * MOOSTIK Cinema Studio Types
 * Inspired by Higgsfield's Cinema Studio
 *
 * Professional camera simulation with:
 * - Real optical physics
 * - Simulated lenses
 * - Deterministic camera control
 * - Stacked camera movements (up to 3)
 */

// ============================================
// CAMERA & LENS CONFIGURATION
// ============================================

export type SensorType =
  | "full_frame"      // 35mm
  | "super35"         // Cinema standard
  | "aps_c"           // 1.5x crop
  | "micro_four"      // 2x crop
  | "imax"            // Large format
  | "65mm"            // Premium cinema
  | "16mm"            // Vintage film
  | "8mm";            // Super 8 look

export type LensType =
  | "spherical"       // Standard
  | "anamorphic"      // Cinematic wide
  | "vintage"         // Character lenses
  | "macro"           // Extreme detail
  | "tilt_shift"      // Miniature/architecture
  | "fisheye"         // Extreme wide
  | "cinema_prime";   // High-end cinema

export interface CameraConfig {
  /** Sensor/film format */
  sensor: SensorType;

  /** Lens type */
  lens: LensType;

  /** Focal length in mm */
  focalLength: number;

  /** Aperture f-stop (lower = more blur) */
  aperture: number;

  /** Focus distance in meters */
  focusDistance?: number;

  /** ISO sensitivity (affects grain) */
  iso?: number;

  /** Shutter angle (180 = standard, 360 = smooth, 45 = staccato) */
  shutterAngle?: number;

  /** Film stock simulation */
  filmStock?: FilmStock;
}

export type FilmStock =
  | "kodak_vision3_500t"    // Tungsten, warm
  | "kodak_vision3_250d"    // Daylight, neutral
  | "kodak_5219"            // High contrast
  | "fuji_eterna"           // Neutral, fine grain
  | "fuji_reala"            // Soft colors
  | "cinestill_800t"        // Tungsten, halation
  | "portra_400"            // Portrait classic
  | "ektachrome"            // Vibrant reversal
  | "tri_x_400"             // B&W classic
  | "digital_arri"          // ARRI LogC
  | "digital_red"           // RED IPP2
  | "digital_sony";         // S-Log3

export interface LensCharacteristics {
  type: LensType;

  /** Bokeh quality */
  bokehShape: "circular" | "oval" | "polygonal" | "swirly" | "cat_eye";

  /** Chromatic aberration level */
  chromaticAberration: "none" | "subtle" | "vintage" | "heavy";

  /** Vignetting amount */
  vignetting: "none" | "light" | "moderate" | "heavy";

  /** Distortion type */
  distortion: "none" | "barrel" | "pincushion" | "mustache";

  /** Sharpness profile */
  sharpness: "clinical" | "balanced" | "soft" | "vintage_soft";

  /** Flare characteristics */
  flare: "minimal" | "subtle" | "anamorphic_streak" | "vintage_orbs";
}

// ============================================
// CAMERA MOVEMENTS (Stack up to 3)
// ============================================

export type MovementType =
  | "static"          // No movement
  | "pan"             // Horizontal rotation
  | "tilt"            // Vertical rotation
  | "roll"            // Dutch rotation
  | "dolly"           // Forward/backward
  | "truck"           // Side to side
  | "pedestal"        // Up/down
  | "zoom"            // Focal length change
  | "focus_pull"      // Focus shift
  | "orbit"           // Circle around subject
  | "crane"           // Complex vertical
  | "steadicam"       // Floating movement
  | "handheld"        // Natural shake
  | "whip_pan"        // Fast pan
  | "push_in"         // Slow dolly in
  | "pull_out"        // Slow dolly out
  | "tracking"        // Follow subject
  | "arc"             // Curved movement
  | "vertigo"         // Dolly + zoom opposite
  | "360_rotation";   // Full rotation

export interface CameraMovement {
  type: MovementType;

  /** Movement direction */
  direction?: "left" | "right" | "up" | "down" | "forward" | "backward" | "clockwise" | "counterclockwise";

  /** Movement intensity (0-100) */
  intensity: number;

  /** Easing curve */
  easing: "linear" | "ease_in" | "ease_out" | "ease_in_out" | "bounce" | "elastic";

  /** Duration in seconds */
  duration?: number;

  /** Start time offset in seconds */
  startOffset?: number;

  /** End position/value (for zoom, focus) */
  endValue?: number;
}

export interface StackedMovements {
  /** Primary movement */
  primary: CameraMovement;

  /** Secondary movement (optional) */
  secondary?: CameraMovement;

  /** Tertiary movement (optional, max 3 total) */
  tertiary?: CameraMovement;
}

// ============================================
// DEPTH OF FIELD
// ============================================

export interface DepthOfField {
  /** Focus mode */
  mode: "auto" | "manual" | "tracking" | "rack_focus";

  /** Blur amount for background */
  backgroundBlur: "none" | "light" | "moderate" | "heavy" | "extreme";

  /** Blur amount for foreground */
  foregroundBlur: "none" | "light" | "moderate" | "heavy";

  /** Focus target (for tracking) */
  focusTarget?: "face" | "eyes" | "body" | "custom_point";

  /** Custom focus point (normalized 0-1) */
  customFocusPoint?: { x: number; y: number };

  /** Rack focus keyframes */
  rackFocus?: {
    startPoint: { x: number; y: number };
    endPoint: { x: number; y: number };
    duration: number;
  };
}

// ============================================
// LIGHTING
// ============================================

export type LightingSetup =
  | "natural_daylight"
  | "golden_hour"
  | "blue_hour"
  | "overcast"
  | "night_moonlight"
  | "night_artificial"
  | "studio_key"
  | "studio_rembrandt"
  | "studio_butterfly"
  | "studio_split"
  | "neon_noir"
  | "candle_light"
  | "fire_light"
  | "bioluminescent";     // MOOSTIK special

export interface LightingConfig {
  setup: LightingSetup;

  /** Key light intensity */
  keyIntensity: number;

  /** Fill light ratio (1:1 = flat, 4:1 = dramatic) */
  fillRatio: string;

  /** Backlight/rim light */
  rimLight: boolean;

  /** Color temperature in Kelvin */
  colorTemperature: number;

  /** Additional color tint */
  tint?: { r: number; g: number; b: number };

  /** Atmosphere effects */
  atmosphere?: "none" | "haze" | "fog" | "smoke" | "dust" | "rain" | "particles";

  /** Atmosphere density */
  atmosphereDensity?: number;
}

// ============================================
// CINEMA STUDIO SESSION
// ============================================

export interface CinemaStudioSession {
  id: string;
  name: string;

  /** Photography or Videography mode */
  mode: "photography" | "videography";

  /** Camera configuration */
  camera: CameraConfig;

  /** Stacked camera movements */
  movements?: StackedMovements;

  /** Depth of field settings */
  depthOfField: DepthOfField;

  /** Lighting setup */
  lighting: LightingConfig;

  /** Reference images for consistency */
  referenceImages?: string[];

  /** Character anchor for identity */
  characterAnchor?: {
    characterId: string;
    preserveFace: boolean;
    preserveWardrobe: boolean;
  };

  /** Start frame (for interpolation) */
  startFrame?: string;

  /** End frame (for interpolation) */
  endFrame?: string;

  /** Metadata */
  createdAt: string;
  updatedAt: string;
}

// ============================================
// CINEMA STUDIO OUTPUT
// ============================================

export interface CinemaStudioInput {
  /** Session configuration */
  session: CinemaStudioSession;

  /** Source image */
  sourceImage: string;

  /** Text prompt */
  prompt: string;

  /** Negative prompt */
  negativePrompt?: string;

  /** Output settings */
  output: {
    type: "image" | "video";
    aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "21:9" | "2.35:1" | "2.76:1";
    resolution: "720p" | "1080p" | "2k" | "4k";
    fps?: number;
    duration?: number; // seconds for video
  };
}

export interface CinemaStudioOutput {
  id: string;
  sessionId: string;

  /** Result URL */
  resultUrl: string;
  thumbnailUrl?: string;
  localPath?: string;

  /** Camera metadata used */
  cameraUsed: CameraConfig;
  movementsUsed?: StackedMovements;

  /** Generation info */
  prompt: string;
  seed?: number;
  processingTimeMs: number;

  createdAt: string;
}

// ============================================
// CINEMA PRESETS
// ============================================

export interface CinemaPreset {
  id: string;
  name: string;
  description: string;
  category: "blockbuster" | "indie" | "vintage" | "noir" | "fantasy" | "horror" | "moostik";

  camera: Partial<CameraConfig>;
  movements?: Partial<StackedMovements>;
  depthOfField?: Partial<DepthOfField>;
  lighting?: Partial<LightingConfig>;
}

export const CINEMA_PRESETS: CinemaPreset[] = [
  // Blockbuster
  {
    id: "blockbuster_hero",
    name: "Blockbuster Hero Shot",
    description: "Low angle, anamorphic, dramatic lighting",
    category: "blockbuster",
    camera: {
      sensor: "super35",
      lens: "anamorphic",
      focalLength: 40,
      aperture: 2.8,
      filmStock: "kodak_vision3_500t"
    },
    movements: {
      primary: { type: "push_in", intensity: 30, easing: "ease_out" }
    },
    lighting: {
      setup: "studio_rembrandt",
      keyIntensity: 80,
      fillRatio: "4:1",
      rimLight: true,
      colorTemperature: 5600
    }
  },

  // Vintage
  {
    id: "vintage_16mm",
    name: "Vintage 16mm",
    description: "Grainy, warm, nostalgic feel",
    category: "vintage",
    camera: {
      sensor: "16mm",
      lens: "vintage",
      focalLength: 25,
      aperture: 2.0,
      iso: 800,
      filmStock: "kodak_vision3_500t"
    },
    depthOfField: {
      mode: "manual",
      backgroundBlur: "heavy"
    },
    lighting: {
      setup: "golden_hour",
      keyIntensity: 70,
      fillRatio: "2:1",
      rimLight: false,
      colorTemperature: 4500
    }
  },

  // MOOSTIK Dark
  {
    id: "moostik_dark",
    name: "MOOSTIK Dark",
    description: "Pixar-dark aesthetic with bioluminescent accents",
    category: "moostik",
    camera: {
      sensor: "full_frame",
      lens: "cinema_prime",
      focalLength: 50,
      aperture: 1.8,
      filmStock: "digital_arri"
    },
    movements: {
      primary: { type: "dolly", direction: "forward", intensity: 20, easing: "ease_in_out" },
      secondary: { type: "tilt", direction: "up", intensity: 10, easing: "ease_out" }
    },
    depthOfField: {
      mode: "tracking",
      backgroundBlur: "moderate",
      focusTarget: "eyes"
    },
    lighting: {
      setup: "bioluminescent",
      keyIntensity: 60,
      fillRatio: "3:1",
      rimLight: true,
      colorTemperature: 4000,
      tint: { r: 180, g: 20, b: 40 }, // Blood red accent
      atmosphere: "haze",
      atmosphereDensity: 0.3
    }
  },

  // Noir
  {
    id: "classic_noir",
    name: "Classic Noir",
    description: "High contrast, deep shadows, dramatic angles",
    category: "noir",
    camera: {
      sensor: "full_frame",
      lens: "spherical",
      focalLength: 35,
      aperture: 4.0,
      filmStock: "tri_x_400"
    },
    movements: {
      primary: { type: "static", intensity: 0, easing: "linear" }
    },
    lighting: {
      setup: "studio_split",
      keyIntensity: 100,
      fillRatio: "8:1",
      rimLight: false,
      colorTemperature: 5000,
      atmosphere: "smoke",
      atmosphereDensity: 0.4
    }
  },

  // Horror
  {
    id: "horror_dread",
    name: "Horror Dread",
    description: "Unsettling angles, shallow focus, cold tones",
    category: "horror",
    camera: {
      sensor: "full_frame",
      lens: "vintage",
      focalLength: 28,
      aperture: 1.4,
      filmStock: "cinestill_800t"
    },
    movements: {
      primary: { type: "push_in", direction: "forward", intensity: 15, easing: "linear" },
      secondary: { type: "roll", direction: "clockwise", intensity: 5, easing: "ease_in" }
    },
    depthOfField: {
      mode: "rack_focus",
      backgroundBlur: "extreme",
      foregroundBlur: "light"
    },
    lighting: {
      setup: "night_moonlight",
      keyIntensity: 40,
      fillRatio: "6:1",
      rimLight: true,
      colorTemperature: 7000,
      tint: { r: 100, g: 120, b: 180 }, // Cold blue
      atmosphere: "fog",
      atmosphereDensity: 0.5
    }
  },

  // Action
  {
    id: "action_chase",
    name: "Action Chase",
    description: "Tracking shot, handheld energy, fast cuts",
    category: "blockbuster",
    camera: {
      sensor: "super35",
      lens: "spherical",
      focalLength: 24,
      aperture: 2.8,
      shutterAngle: 45, // Staccato motion
      filmStock: "digital_red"
    },
    movements: {
      primary: { type: "tracking", intensity: 70, easing: "linear" },
      secondary: { type: "handheld", intensity: 40, easing: "linear" }
    },
    lighting: {
      setup: "natural_daylight",
      keyIntensity: 100,
      fillRatio: "1:1",
      rimLight: false,
      colorTemperature: 5600
    }
  }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get preset by ID
 */
export function getPreset(id: string): CinemaPreset | undefined {
  return CINEMA_PRESETS.find(p => p.id === id);
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: CinemaPreset["category"]): CinemaPreset[] {
  return CINEMA_PRESETS.filter(p => p.category === category);
}

/**
 * Build camera prompt modifier from config
 */
export function buildCameraPrompt(config: CameraConfig): string {
  const parts = [
    `Shot on ${config.sensor.replace(/_/g, " ")} sensor`,
    `${config.focalLength}mm ${config.lens.replace(/_/g, " ")} lens`,
    `f/${config.aperture} aperture`
  ];

  if (config.filmStock) {
    parts.push(`${config.filmStock.replace(/_/g, " ")} film look`);
  }

  if (config.shutterAngle && config.shutterAngle !== 180) {
    parts.push(`${config.shutterAngle}° shutter`);
  }

  return parts.join(", ");
}

/**
 * Build movement prompt modifier
 */
export function buildMovementPrompt(movements: StackedMovements): string {
  const parts: string[] = [];

  if (movements.primary.type !== "static") {
    parts.push(`${movements.primary.type.replace(/_/g, " ")} ${movements.primary.direction || ""}`);
  }

  if (movements.secondary && movements.secondary.type !== "static") {
    parts.push(`with ${movements.secondary.type.replace(/_/g, " ")}`);
  }

  if (movements.tertiary && movements.tertiary.type !== "static") {
    parts.push(`and ${movements.tertiary.type.replace(/_/g, " ")}`);
  }

  return parts.length > 0 ? `Camera: ${parts.join(" ")}` : "Static shot";
}

/**
 * Build lighting prompt modifier
 */
export function buildLightingPrompt(lighting: LightingConfig): string {
  const parts = [
    lighting.setup.replace(/_/g, " "),
    `${lighting.colorTemperature}K color temperature`
  ];

  if (lighting.rimLight) {
    parts.push("rim/backlight");
  }

  if (lighting.atmosphere && lighting.atmosphere !== "none") {
    parts.push(`atmospheric ${lighting.atmosphere}`);
  }

  return parts.join(", ");
}

/**
 * Combine all prompt modifiers for Cinema Studio
 */
export function buildCinemaStudioPrompt(
  basePrompt: string,
  session: CinemaStudioSession
): string {
  const parts = [
    basePrompt,
    buildCameraPrompt(session.camera),
    session.movements ? buildMovementPrompt(session.movements) : "",
    buildLightingPrompt(session.lighting),
    session.depthOfField.backgroundBlur !== "none"
      ? `${session.depthOfField.backgroundBlur} bokeh blur`
      : ""
  ].filter(Boolean);

  return parts.join(". ");
}
