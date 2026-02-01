/**
 * SHOT ANALYZER - Analyse Intelligente de Shots
 * ===========================================================================
 * Analyse les shots pour determiner:
 * - Frame strategy (single vs first/last)
 * - Duration optimale (5s vs 10s pour Kling, 4/6/8s pour Veo)
 * - Complexite du mouvement
 * - Besoins de chaining
 * - References necessaires
 * SOTA Janvier 2026
 * ===========================================================================
 */

import type { Shot } from "@/types/episode";
import type { Episode } from "@/types/episode";

// ============================================================================
// TYPES
// ============================================================================

export type FrameStrategy = "single" | "first_last" | "text_only";
export type MotionComplexity = "static" | "subtle" | "dynamic" | "complex";
export type ChainType = "continuation" | "cut" | "transition" | "independent";

export interface ShotAnalysis {
  shotId: string;
  frameStrategy: FrameStrategy;
  recommendedDuration: {
    kling: 5 | 10;
    veo: 4 | 6 | 8;
  };
  motionComplexity: MotionComplexity;
  requiresChaining: boolean;
  chainType: ChainType;
  chainSource?: string;           // Shot ID source pour chaining
  referenceNeeds: {
    characters: string[];
    locations: string[];
    previousShots: string[];      // Shots precedents comme reference
    styleReference?: string;
  };
  sceneCharacteristics: {
    hasDialogue: boolean;
    hasTransformation: boolean;
    hasCharacterMovement: boolean;
    isEstablishing: boolean;
    isTransition: boolean;
    isFlashback: boolean;
    emotionalIntensity: "low" | "medium" | "high";
  };
  reasoning: string;              // Explication de l'analyse
}

export interface EpisodeContext {
  episodeId: string;
  totalShots: number;
  currentIndex: number;
  previousShot?: Shot;
  nextShot?: Shot;
  act?: number;
  narrativePosition: "opening" | "rising" | "climax" | "falling" | "resolution";
}

// ============================================================================
// KEYWORDS FOR DETECTION
// ============================================================================

const TRANSFORMATION_KEYWORDS = [
  // French
  "devient", "se transforme", "passe de", "évolue", "change", "mue",
  "transition", "morphing", "métamorphose", "se modifie", "altère",
  // English
  "becomes", "transforms", "changes", "morphs", "evolves", "shifts",
  "transitions", "turns into", "converts",
  // Time transitions
  "jour->nuit", "nuit->jour", "day to night", "night to day",
  "sunrise", "sunset", "lever", "coucher",
];

const DIALOGUE_KEYWORDS = [
  "parle", "dit", "répond", "demande", "crie", "murmure", "chuchote",
  "dialogue", "conversation", "speaks", "says", "asks", "shouts",
  "whispers", "talks", "discusses",
];

const MOVEMENT_KEYWORDS = [
  "marche", "court", "vole", "saute", "tombe", "monte", "descend",
  "s'approche", "s'éloigne", "traverse", "entre", "sort",
  "walks", "runs", "flies", "jumps", "falls", "climbs", "descends",
  "approaches", "leaves", "crosses", "enters", "exits",
];

const ESTABLISHING_KEYWORDS = [
  "vue d'ensemble", "plan large", "establishing", "overview",
  "panorama", "paysage", "exterior wide", "master shot",
];

const TRANSITION_KEYWORDS = [
  "flashback", "flash-forward", "rêve", "dream", "souvenir",
  "memory", "imagination", "vision", "transition",
];

const EMOTIONAL_HIGH_KEYWORDS = [
  "dramatique", "intense", "émotionnel", "tragique", "climax",
  "dramatic", "intense", "emotional", "tragic", "peak",
  "confrontation", "révélation", "revelation",
];

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyse complete d'un shot
 */
export function analyzeShot(shot: Shot, context: EpisodeContext): ShotAnalysis {
  const description = getFullDescription(shot);
  
  // Detect scene characteristics
  const sceneCharacteristics = detectSceneCharacteristics(description, shot);
  
  // Determine frame strategy
  const frameStrategy = decideFrameStrategy(shot, sceneCharacteristics);
  
  // Calculate motion complexity
  const motionComplexity = calculateMotionComplexity(sceneCharacteristics);
  
  // Determine chaining needs
  const { requiresChaining, chainType, chainSource } = analyzeChaining(shot, context);
  
  // Determine reference needs
  const referenceNeeds = analyzeReferenceNeeds(shot, context, chainType);
  
  // Calculate recommended durations
  const recommendedDuration = calculateRecommendedDuration(
    sceneCharacteristics,
    motionComplexity
  );
  
  // Generate reasoning
  const reasoning = generateReasoning(
    shot,
    frameStrategy,
    motionComplexity,
    chainType,
    sceneCharacteristics
  );

  return {
    shotId: shot.id,
    frameStrategy,
    recommendedDuration,
    motionComplexity,
    requiresChaining,
    chainType,
    chainSource,
    referenceNeeds,
    sceneCharacteristics,
    reasoning,
  };
}

/**
 * Analyse un episode entier et retourne les analyses pour chaque shot
 */
export function analyzeEpisode(episode: Episode): Map<string, ShotAnalysis> {
  const analyses = new Map<string, ShotAnalysis>();
  const shots = episode.shots || [];

  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    const context = buildEpisodeContext(episode, i);
    const analysis = analyzeShot(shot, context);
    analyses.set(shot.id, analysis);
  }

  return analyses;
}

/**
 * Construit le contexte d'episode pour un shot
 */
export function buildEpisodeContext(episode: Episode, shotIndex: number): EpisodeContext {
  const shots = episode.shots || [];
  const totalShots = shots.length;
  
  // Determine narrative position
  const progress = shotIndex / totalShots;
  let narrativePosition: EpisodeContext["narrativePosition"];
  
  if (progress < 0.15) narrativePosition = "opening";
  else if (progress < 0.4) narrativePosition = "rising";
  else if (progress < 0.6) narrativePosition = "climax";
  else if (progress < 0.85) narrativePosition = "falling";
  else narrativePosition = "resolution";

  // Determine act
  const acts = episode.acts || [];
  let currentAct = 1;
  for (let a = 0; a < acts.length; a++) {
    const actShots = acts[a].shotIds || [];
    if (actShots.includes(shots[shotIndex]?.id)) {
      currentAct = a + 1;
      break;
    }
  }

  return {
    episodeId: episode.id,
    totalShots,
    currentIndex: shotIndex,
    previousShot: shotIndex > 0 ? shots[shotIndex - 1] : undefined,
    nextShot: shotIndex < totalShots - 1 ? shots[shotIndex + 1] : undefined,
    act: currentAct,
    narrativePosition,
  };
}

// ============================================================================
// DETECTION HELPERS
// ============================================================================

function getFullDescription(shot: Shot): string {
  const parts = [
    shot.description || "",
    shot.name || "",
    (shot.prompt as any)?.goal || "",
    (shot.prompt as any)?.meta?.scene_intent || "",
  ];
  return parts.join(" ").toLowerCase();
}

function detectSceneCharacteristics(description: string, shot: Shot): ShotAnalysis["sceneCharacteristics"] {
  const descLower = description.toLowerCase();
  
  return {
    hasDialogue: DIALOGUE_KEYWORDS.some(kw => descLower.includes(kw)),
    hasTransformation: TRANSFORMATION_KEYWORDS.some(kw => descLower.includes(kw)),
    hasCharacterMovement: MOVEMENT_KEYWORDS.some(kw => descLower.includes(kw)),
    isEstablishing: ESTABLISHING_KEYWORDS.some(kw => descLower.includes(kw)) ||
                    shot.sceneType === "establishing",
    isTransition: TRANSITION_KEYWORDS.some(kw => descLower.includes(kw)) ||
                  (shot.sceneType as string) === "flashback" || (shot.sceneType as string) === "dream",
    isFlashback: descLower.includes("flashback") || descLower.includes("souvenir") ||
                 (shot.sceneType as string) === "flashback",
    emotionalIntensity: detectEmotionalIntensity(descLower, shot),
  };
}

function detectEmotionalIntensity(
  description: string,
  shot: Shot
): "low" | "medium" | "high" {
  if (EMOTIONAL_HIGH_KEYWORDS.some(kw => description.includes(kw))) {
    return "high";
  }
  
  // Check scene type (casting to string for broader compatibility)
  const sceneType = shot.sceneType as string;
  if (sceneType === "dramatic" || sceneType === "climax" || 
      sceneType === "battle" || sceneType === "genocide") {
    return "high";
  }
  
  if (sceneType === "peaceful" || sceneType === "establishing") {
    return "low";
  }
  
  return "medium";
}

// ============================================================================
// STRATEGY DECISIONS
// ============================================================================

/**
 * Decide la strategie de frame (single vs first_last)
 */
export function decideFrameStrategy(
  shot: Shot,
  characteristics: ShotAnalysis["sceneCharacteristics"]
): FrameStrategy {
  // Check if has explicit start/end states in prompt
  const prompt = shot.prompt as any;
  const hasStartEndDefined = prompt?.scene_graph?.start_state && 
                             prompt?.scene_graph?.end_state;
  
  if (hasStartEndDefined) {
    return "first_last";
  }

  // First/Last for transformations
  if (characteristics.hasTransformation) {
    return "first_last";
  }

  // First/Last for transitions and flashbacks
  if (characteristics.isTransition || characteristics.isFlashback) {
    return "first_last";
  }

  // First/Last for high emotional intensity with movement
  if (characteristics.emotionalIntensity === "high" && 
      characteristics.hasCharacterMovement) {
    return "first_last";
  }

  // Single frame for everything else
  return "single";
}

/**
 * Calculate motion complexity
 */
function calculateMotionComplexity(
  characteristics: ShotAnalysis["sceneCharacteristics"]
): MotionComplexity {
  let score = 0;

  if (characteristics.hasCharacterMovement) score += 2;
  if (characteristics.hasTransformation) score += 2;
  if (characteristics.hasDialogue) score += 1;
  if (characteristics.emotionalIntensity === "high") score += 1;
  if (characteristics.isTransition) score += 1;

  if (score === 0) return "static";
  if (score <= 1) return "subtle";
  if (score <= 3) return "dynamic";
  return "complex";
}

/**
 * Analyze chaining requirements
 */
function analyzeChaining(
  shot: Shot,
  context: EpisodeContext
): { requiresChaining: boolean; chainType: ChainType; chainSource?: string } {
  if (!context.previousShot) {
    return { requiresChaining: false, chainType: "independent" };
  }

  const prevShot = context.previousShot;
  
  // Same character continuity
  const sameCharacter = shot.characterIds?.some(
    cId => prevShot.characterIds?.includes(cId)
  );
  
  // Same location continuity
  const sameLocation = shot.locationIds?.some(
    lId => prevShot.locationIds?.includes(lId)
  );
  
  // Check for transition markers (casting to string for broader compatibility)
  const shotSceneType = shot.sceneType as string;
  const isTransition = shotSceneType === "flashback" || 
                       shotSceneType === "transition" ||
                       shotSceneType === "dream";
  
  // Determine chain type
  if (isTransition) {
    return { 
      requiresChaining: true, 
      chainType: "transition",
      chainSource: prevShot.id 
    };
  }
  
  if (sameCharacter && sameLocation) {
    return { 
      requiresChaining: true, 
      chainType: "continuation",
      chainSource: prevShot.id 
    };
  }
  
  if (sameCharacter || sameLocation) {
    return { 
      requiresChaining: true, 
      chainType: "cut",
      chainSource: prevShot.id 
    };
  }
  
  return { requiresChaining: false, chainType: "independent" };
}

/**
 * Analyze reference needs
 */
function analyzeReferenceNeeds(
  shot: Shot,
  context: EpisodeContext,
  chainType: ChainType
): ShotAnalysis["referenceNeeds"] {
  const previousShots: string[] = [];
  
  // Add previous shot if chaining
  if (chainType !== "independent" && context.previousShot) {
    previousShots.push(context.previousShot.id);
  }
  
  // For transitions, might need the shot before previous too
  if (chainType === "transition" && context.currentIndex >= 2) {
    // Would need episode access here - simplified
  }

  return {
    characters: shot.characterIds || [],
    locations: shot.locationIds || [],
    previousShots,
    styleReference: undefined, // Could be enhanced based on scene type
  };
}

/**
 * Calculate recommended durations for different providers
 */
function calculateRecommendedDuration(
  characteristics: ShotAnalysis["sceneCharacteristics"],
  motionComplexity: MotionComplexity
): ShotAnalysis["recommendedDuration"] {
  // Kling: 5s or 10s
  let klingDuration: 5 | 10 = 5;
  
  if (characteristics.hasDialogue) klingDuration = 10;
  if (characteristics.hasTransformation) klingDuration = 10;
  if (motionComplexity === "complex") klingDuration = 10;
  if (characteristics.emotionalIntensity === "high") klingDuration = 10;
  
  // Veo: 4s, 6s, or 8s
  let veoDuration: 4 | 6 | 8 = 6;
  
  if (characteristics.isEstablishing || motionComplexity === "static") {
    veoDuration = 4;
  }
  if (characteristics.hasDialogue || motionComplexity === "complex") {
    veoDuration = 8;
  }
  if (characteristics.hasTransformation) {
    veoDuration = 8;
  }

  return { kling: klingDuration, veo: veoDuration };
}

/**
 * Generate reasoning explanation
 */
function generateReasoning(
  shot: Shot,
  frameStrategy: FrameStrategy,
  motionComplexity: MotionComplexity,
  chainType: ChainType,
  characteristics: ShotAnalysis["sceneCharacteristics"]
): string {
  const reasons: string[] = [];
  
  // Frame strategy reasoning
  if (frameStrategy === "first_last") {
    if (characteristics.hasTransformation) {
      reasons.push("First/Last frames: transformation visible dans la scene");
    } else if (characteristics.isTransition) {
      reasons.push("First/Last frames: scene de transition narrative");
    } else {
      reasons.push("First/Last frames: mouvement complexe necessitant interpolation");
    }
  } else {
    reasons.push("Single frame: scene sans transformation majeure");
  }
  
  // Motion reasoning
  reasons.push(`Complexite mouvement: ${motionComplexity}`);
  
  // Chaining reasoning
  if (chainType !== "independent") {
    reasons.push(`Chaining: ${chainType} avec shot precedent`);
  }
  
  // Special characteristics
  if (characteristics.hasDialogue) {
    reasons.push("Scene avec dialogue: duree longue recommandee");
  }
  if (characteristics.isFlashback) {
    reasons.push("Flashback: traitement visuel special");
  }

  return reasons.join(". ") + ".";
}

// ============================================================================
// BATCH ANALYSIS
// ============================================================================

/**
 * Analyse rapide pour determiner si un shot necessite first/last frame
 */
export function needsFirstLastFrame(shot: Shot): boolean {
  const description = getFullDescription(shot);
  const characteristics = detectSceneCharacteristics(description, shot);
  return decideFrameStrategy(shot, characteristics) === "first_last";
}

/**
 * Determine le provider optimal pour un shot
 */
export function recommendProvider(
  analysis: ShotAnalysis
): "kling" | "veo" | "luma" {
  // Veo for physics-heavy scenes
  if (analysis.sceneCharacteristics.hasTransformation) {
    return "veo"; // Better physics simulation
  }
  
  // Kling for camera movements
  if (analysis.motionComplexity === "dynamic" && 
      !analysis.sceneCharacteristics.hasDialogue) {
    return "kling"; // 6-axis camera control
  }
  
  // Veo for dialogue (audio generation)
  if (analysis.sceneCharacteristics.hasDialogue) {
    return "veo"; // Contextual audio
  }
  
  // Kling for general purpose
  return "kling";
}
