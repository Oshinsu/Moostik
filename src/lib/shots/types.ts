/**
 * MOOSTIK x9 Shots Generator Types
 * Inspired by Higgsfield's "Shots" feature
 *
 * Generates 9 cinematic camera angles from a single source image
 * with perfect identity retention and style consistency.
 */

// ============================================
// CINEMATIC CAMERA ANGLES (9-SHOT GRID)
// ============================================

export type CinematicAngle =
  | "extreme_wide"      // Établissement - contexte complet
  | "wide"              // Plan large - personnage + environnement
  | "medium_wide"       // Plan moyen large - corps entier
  | "medium"            // Plan américain - cuisses et plus
  | "medium_close"      // Plan rapproché - poitrine et plus
  | "close_up"          // Gros plan - visage
  | "extreme_close_up"  // Très gros plan - yeux/détail
  | "over_shoulder"     // Par-dessus l'épaule
  | "low_angle"         // Contre-plongée
  | "high_angle"        // Plongée
  | "dutch_angle"       // Angle hollandais
  | "profile"           // Profil
  | "three_quarter";    // Trois-quarts

export interface CinematicAngleConfig {
  angle: CinematicAngle;
  label: string;
  labelFr: string;
  promptModifier: string;
  cameraPosition: string;
  focalLength: string; // mm
  aperture: string; // f-stop
  description: string;
  gridPosition: number; // 0-8 for 3x3 grid
  useCase: string[];
}

// ============================================
// 9-SHOT GRID CONFIGURATION
// ============================================

export const SHOTS_GRID_CONFIG: CinematicAngleConfig[] = [
  // Row 1: Wide shots
  {
    angle: "extreme_wide",
    label: "Extreme Wide",
    labelFr: "Plan d'ensemble",
    promptModifier: "extreme wide shot, establishing shot, full environment visible, small figure in frame",
    cameraPosition: "very far from subject",
    focalLength: "14-24mm",
    aperture: "f/8",
    description: "Contexte complet, personnage petit dans le cadre",
    gridPosition: 0,
    useCase: ["establishing", "location_reveal", "scale"]
  },
  {
    angle: "wide",
    label: "Wide Shot",
    labelFr: "Plan large",
    promptModifier: "wide shot, full body visible with environment, cinematic framing",
    cameraPosition: "far from subject",
    focalLength: "24-35mm",
    aperture: "f/5.6",
    description: "Corps entier avec environnement",
    gridPosition: 1,
    useCase: ["action", "movement", "context"]
  },
  {
    angle: "medium_wide",
    label: "Medium Wide",
    labelFr: "Plan moyen large",
    promptModifier: "medium wide shot, full body framing, character prominent",
    cameraPosition: "moderate distance",
    focalLength: "35-50mm",
    aperture: "f/4",
    description: "Corps entier, personnage proéminent",
    gridPosition: 2,
    useCase: ["introduction", "stance", "posture"]
  },

  // Row 2: Medium shots
  {
    angle: "low_angle",
    label: "Low Angle",
    labelFr: "Contre-plongée",
    promptModifier: "low angle shot, camera below eye level looking up, heroic perspective",
    cameraPosition: "below subject",
    focalLength: "35-50mm",
    aperture: "f/4",
    description: "Caméra basse, regard vers le haut - héroïque",
    gridPosition: 3,
    useCase: ["power", "heroic", "intimidation"]
  },
  {
    angle: "medium",
    label: "Medium Shot",
    labelFr: "Plan américain",
    promptModifier: "medium shot, waist-up framing, conversational distance",
    cameraPosition: "eye level",
    focalLength: "50-85mm",
    aperture: "f/2.8",
    description: "Cadrage taille et plus - standard dialogue",
    gridPosition: 4,
    useCase: ["dialogue", "interaction", "standard"]
  },
  {
    angle: "high_angle",
    label: "High Angle",
    labelFr: "Plongée",
    promptModifier: "high angle shot, camera above looking down, vulnerable perspective",
    cameraPosition: "above subject",
    focalLength: "35-50mm",
    aperture: "f/4",
    description: "Caméra haute, regard vers le bas - vulnérabilité",
    gridPosition: 5,
    useCase: ["vulnerability", "submission", "overview"]
  },

  // Row 3: Close shots
  {
    angle: "over_shoulder",
    label: "Over Shoulder",
    labelFr: "Par-dessus l'épaule",
    promptModifier: "over the shoulder shot, partial figure in foreground, focus on subject",
    cameraPosition: "behind secondary subject",
    focalLength: "50-85mm",
    aperture: "f/2.8",
    description: "Perspective dialogue avec profondeur",
    gridPosition: 6,
    useCase: ["dialogue", "confrontation", "connection"]
  },
  {
    angle: "close_up",
    label: "Close-Up",
    labelFr: "Gros plan",
    promptModifier: "close-up shot, face filling frame, emotional detail, sharp focus on eyes",
    cameraPosition: "close to subject",
    focalLength: "85-135mm",
    aperture: "f/2",
    description: "Visage en gros plan - émotion",
    gridPosition: 7,
    useCase: ["emotion", "reaction", "intimacy"]
  },
  {
    angle: "extreme_close_up",
    label: "Extreme Close-Up",
    labelFr: "Très gros plan",
    promptModifier: "extreme close-up, macro detail, eyes or specific feature filling frame",
    cameraPosition: "very close",
    focalLength: "100-200mm macro",
    aperture: "f/1.8",
    description: "Détail extrême - yeux, texture",
    gridPosition: 8,
    useCase: ["detail", "tension", "micro_expression"]
  }
];

// ============================================
// SHOTS GENERATION
// ============================================

export interface ShotsGridRequest {
  /** Source image URL or base64 */
  sourceImage: string;

  /** Base prompt describing the scene/character */
  basePrompt: string;

  /** Character ID for identity locking */
  characterId?: string;

  /** Style to maintain across all shots */
  stylePreset?: ShotsStyle;

  /** Which angles to generate (default: all 9) */
  angles?: CinematicAngle[];

  /** Aspect ratio for generated images */
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";

  /** Resolution */
  resolution?: "720p" | "1080p" | "4k";

  /** Seed for reproducibility */
  seed?: number;

  /** MOOSTIK-specific: Episode and shot context */
  context?: {
    episodeId: string;
    shotId: string;
    sceneType: string;
  };
}

export type ShotsStyle =
  | "cinematic"
  | "photorealistic"
  | "pixar_dark"       // MOOSTIK default
  | "anime"
  | "stylized_3d"
  | "noir"
  | "fantasy"
  | "horror";

export interface ShotResult {
  id: string;
  angle: CinematicAngle;
  angleConfig: CinematicAngleConfig;
  imageUrl: string;
  localPath?: string;
  prompt: string;
  seed?: number;
  status: "pending" | "generating" | "completed" | "failed";
  error?: string;
  generatedAt?: string;
}

export interface ShotsGridResult {
  id: string;
  sourceImage: string;
  characterId?: string;
  shots: ShotResult[];
  style: ShotsStyle;

  /** Statistics */
  stats: {
    total: number;
    completed: number;
    failed: number;
    generationTimeMs: number;
    creditsCost: number;
  };

  createdAt: string;
  completedAt?: string;
}

// ============================================
// IDENTITY ANCHORING (Character Lock)
// ============================================

export interface IdentityAnchor {
  /** Character ID from MOOSTIK Bible */
  characterId: string;

  /** Reference images for this character */
  referenceImages: string[];

  /** Facial geometry lock points */
  facialGeometry?: {
    landmarks: number[][];
    embeddings?: number[];
  };

  /** Wardrobe details to preserve */
  wardrobeDetails?: string[];

  /** Distinctive features (e.g., proboscis for mosquito characters) */
  distinctiveFeatures: string[];

  /** Color palette to maintain */
  colorPalette: string[];
}

// ============================================
// PRESET GRID CONFIGURATIONS
// ============================================

/** Character introduction - 9 angles to establish character */
export const CHARACTER_INTRO_GRID: CinematicAngle[] = [
  "extreme_wide", "wide", "medium_wide",
  "low_angle", "medium", "high_angle",
  "three_quarter", "close_up", "extreme_close_up"
];

/** Action sequence - dynamic angles */
export const ACTION_GRID: CinematicAngle[] = [
  "wide", "medium_wide", "low_angle",
  "dutch_angle", "medium", "over_shoulder",
  "close_up", "extreme_close_up", "high_angle"
];

/** Dialogue sequence - conversation-focused */
export const DIALOGUE_GRID: CinematicAngle[] = [
  "medium_wide", "over_shoulder", "medium",
  "close_up", "medium_close", "over_shoulder",
  "close_up", "profile", "extreme_close_up"
];

/** Emotional sequence - expression-focused */
export const EMOTIONAL_GRID: CinematicAngle[] = [
  "medium", "close_up", "extreme_close_up",
  "profile", "three_quarter", "close_up",
  "high_angle", "low_angle", "extreme_close_up"
];

// ============================================
// MOOSTIK CONSTITUTIONAL SHOTS CONFIG
// ============================================

export const MOOSTIK_SHOTS_STYLE: ShotsStyle = "pixar_dark";

export const MOOSTIK_IDENTITY_INVARIANTS = [
  "anthropomorphic mosquito",
  "visible needle-like proboscis",
  "compound eyes with warm amber glow",
  "chitin-textured exoskeleton",
  "Pixar-dark 3D feature-film quality",
  "ILM-grade VFX",
  "obsidian black primary color",
  "blood red and crimson accents",
  "copper metallic highlights"
];

export const MOOSTIK_NEGATIVE_INVARIANTS = [
  "anime style",
  "cartoon",
  "2D flat",
  "proboscis not visible",
  "human architecture",
  "electric lights",
  "modern buildings"
];

/**
 * Build MOOSTIK-compliant prompt for a shot angle
 */
export function buildMoostikShotPrompt(
  basePrompt: string,
  angleConfig: CinematicAngleConfig,
  characterId?: string
): string {
  const parts = [
    basePrompt,
    angleConfig.promptModifier,
    `Camera: ${angleConfig.cameraPosition}`,
    `Lens: ${angleConfig.focalLength} at ${angleConfig.aperture}`,
    ...MOOSTIK_IDENTITY_INVARIANTS
  ];

  if (characterId) {
    parts.push(`Character: ${characterId}`);
  }

  const prompt = parts.join(". ");
  const negative = `AVOID: ${MOOSTIK_NEGATIVE_INVARIANTS.join(", ")}`;

  return `${prompt}. ${negative}`;
}

/**
 * Get angle config by angle type
 */
export function getAngleConfig(angle: CinematicAngle): CinematicAngleConfig | undefined {
  return SHOTS_GRID_CONFIG.find(config => config.angle === angle);
}

/**
 * Get all angles for a grid preset
 */
export function getGridPreset(preset: "character" | "action" | "dialogue" | "emotional"): CinematicAngle[] {
  switch (preset) {
    case "character": return CHARACTER_INTRO_GRID;
    case "action": return ACTION_GRID;
    case "dialogue": return DIALOGUE_GRID;
    case "emotional": return EMOTIONAL_GRID;
    default: return SHOTS_GRID_CONFIG.map(c => c.angle);
  }
}
