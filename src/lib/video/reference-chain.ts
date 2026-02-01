/**
 * REFERENCE CHAIN MANAGER - Gestion du Chaining Multi-Shot
 * ===========================================================================
 * Gere le chaining de references entre shots video:
 * - Extraction des derniers frames pour continuite
 * - Construction des chaines de reference
 * - Priorisation des references
 * - Resolution des dependances
 * SOTA Janvier 2026
 * ===========================================================================
 */

import type { Shot, Episode } from "@/types/episode";
import type { ChainType, ShotAnalysis } from "./shot-analyzer";

// ============================================================================
// TYPES
// ============================================================================

export interface ReferenceChain {
  shotId: string;
  chainType: ChainType;
  priority: number;                // 1-10, importance du chaining
  sources: {
    previousShot?: string;         // Shot ID precedent
    previousFrame?: string;        // URL last frame extrait
    previousVideo?: string;        // URL video precedente
    characterRefs: string[];       // URLs references personnages
    locationRefs: string[];        // URLs references lieux
    styleRef?: string;             // Reference style visuel
  };
  continuityConfig: {
    maintainCharacter: boolean;    // Garder coherence personnage
    maintainLocation: boolean;     // Garder coherence lieu
    maintainLighting: boolean;     // Garder coherence eclairage
    maintainCamera: boolean;       // Garder coherence camera
    transitionType?: "cut" | "fade" | "dissolve" | "wipe";
  };
  generationOrder: number;         // Ordre dans la sequence de generation
}

export interface ChainBuildResult {
  chains: Map<string, ReferenceChain>;
  generationOrder: string[];       // Ordre optimal de generation
  dependencies: Map<string, string[]>; // Dependencies entre shots
  warnings: string[];
}

export interface ContinuityAnalysis {
  type: ChainType;
  sameCharacter: boolean;
  sameLocation: boolean;
  sameLighting: boolean;
  directCut: boolean;
  narrativeContinuation: boolean;
  score: number;                   // 0-10
}

// ============================================================================
// CHAIN BUILDER
// ============================================================================

/**
 * Construit les chaines de reference pour tous les shots d'un episode
 */
export async function buildReferenceChains(
  episode: Episode,
  shotAnalyses: Map<string, ShotAnalysis>,
  options: {
    resolveCharacterRefs?: (characterIds: string[]) => Promise<string[]>;
    resolveLocationRefs?: (locationIds: string[]) => Promise<string[]>;
    extractLastFrame?: (videoUrl: string) => Promise<string | null>;
  } = {}
): Promise<ChainBuildResult> {
  const shots = episode.shots || [];
  const chains = new Map<string, ReferenceChain>();
  const dependencies = new Map<string, string[]>();
  const warnings: string[] = [];
  
  // Build chains for each shot
  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    const prevShot = i > 0 ? shots[i - 1] : undefined;
    const analysis = shotAnalyses.get(shot.id);
    
    if (!analysis) {
      warnings.push(`No analysis found for shot ${shot.id}`);
      continue;
    }
    
    // Analyze continuity with previous shot
    const continuity = analyzeContinuity(shot, prevShot);
    
    // Resolve character references
    let characterRefs: string[] = [];
    if (options.resolveCharacterRefs && shot.characterIds?.length) {
      try {
        characterRefs = await options.resolveCharacterRefs(shot.characterIds);
      } catch (e) {
        warnings.push(`Failed to resolve character refs for ${shot.id}`);
      }
    }
    
    // Resolve location references
    let locationRefs: string[] = [];
    if (options.resolveLocationRefs && shot.locationIds?.length) {
      try {
        locationRefs = await options.resolveLocationRefs(shot.locationIds);
      } catch (e) {
        warnings.push(`Failed to resolve location refs for ${shot.id}`);
      }
    }
    
    // Extract previous frame if needed and video exists
    let previousFrame: string | undefined;
    const prevVariation = prevShot?.variations?.find(v => v.status === "completed");
    if (
      analysis.requiresChaining &&
      prevVariation?.videoUrl &&
      options.extractLastFrame
    ) {
      try {
        const frame = await options.extractLastFrame(prevVariation.videoUrl);
        if (frame) previousFrame = frame;
      } catch (e) {
        warnings.push(`Failed to extract frame from previous shot for ${shot.id}`);
      }
    }
    
    // Build chain
    const chain: ReferenceChain = {
      shotId: shot.id,
      chainType: analysis.chainType,
      priority: calculateChainPriority(continuity, analysis),
      sources: {
        previousShot: analysis.requiresChaining ? prevShot?.id : undefined,
        previousFrame,
        previousVideo: analysis.requiresChaining ? prevVariation?.videoUrl : undefined,
        characterRefs,
        locationRefs,
      },
      continuityConfig: {
        maintainCharacter: continuity.sameCharacter,
        maintainLocation: continuity.sameLocation,
        maintainLighting: continuity.sameLighting,
        maintainCamera: continuity.directCut,
        transitionType: getTransitionType(analysis.chainType),
      },
      generationOrder: i,
    };
    
    chains.set(shot.id, chain);
    
    // Track dependencies
    if (analysis.requiresChaining && prevShot) {
      dependencies.set(shot.id, [prevShot.id]);
    } else {
      dependencies.set(shot.id, []);
    }
  }
  
  // Calculate optimal generation order
  const generationOrder = calculateGenerationOrder(shots, dependencies);

  return {
    chains,
    generationOrder,
    dependencies,
    warnings,
  };
}

// ============================================================================
// CONTINUITY ANALYSIS
// ============================================================================

/**
 * Analyse la continuite entre deux shots consecutifs
 */
export function analyzeContinuity(
  currentShot: Shot,
  previousShot?: Shot
): ContinuityAnalysis {
  if (!previousShot) {
    return {
      type: "independent",
      sameCharacter: false,
      sameLocation: false,
      sameLighting: false,
      directCut: false,
      narrativeContinuation: false,
      score: 0,
    };
  }
  
  // Check character continuity
  const sameCharacter = (currentShot.characterIds || []).some(
    cId => (previousShot.characterIds || []).includes(cId)
  );
  
  // Check location continuity
  const sameLocation = (currentShot.locationIds || []).some(
    lId => (previousShot.locationIds || []).includes(lId)
  );
  
  // Check lighting (based on scene type or time of day)
  const currentTime = (currentShot.prompt as any)?.scene?.timeOfDay;
  const prevTime = (previousShot.prompt as any)?.scene?.timeOfDay;
  const sameLighting = currentTime === prevTime;
  
  // Check for direct cut (no transition marker)
  const isTransition = ["flashback", "dream", "transition"].includes(
    currentShot.sceneType || ""
  );
  const directCut = !isTransition && (sameCharacter || sameLocation);
  
  // Narrative continuation
  const narrativeContinuation = sameCharacter && sameLocation;
  
  // Calculate score
  let score = 0;
  if (sameCharacter) score += 3;
  if (sameLocation) score += 3;
  if (sameLighting) score += 2;
  if (directCut) score += 1;
  if (narrativeContinuation) score += 1;
  
  // Determine chain type
  let type: ChainType;
  if (isTransition) {
    type = "transition";
  } else if (narrativeContinuation) {
    type = "continuation";
  } else if (sameCharacter || sameLocation) {
    type = "cut";
  } else {
    type = "independent";
  }

  return {
    type,
    sameCharacter,
    sameLocation,
    sameLighting,
    directCut,
    narrativeContinuation,
    score,
  };
}

// ============================================================================
// PRIORITY & ORDER CALCULATION
// ============================================================================

/**
 * Calculate chain priority (1-10)
 */
function calculateChainPriority(
  continuity: ContinuityAnalysis,
  analysis: ShotAnalysis
): number {
  let priority = continuity.score;
  
  // Boost for specific scenarios
  if (analysis.sceneCharacteristics.hasDialogue) priority += 1;
  if (analysis.frameStrategy === "first_last") priority += 1;
  if (analysis.motionComplexity === "complex") priority += 1;
  
  return Math.min(10, Math.max(1, priority));
}

/**
 * Get transition type based on chain type
 */
function getTransitionType(
  chainType: ChainType
): ReferenceChain["continuityConfig"]["transitionType"] {
  switch (chainType) {
    case "continuation":
      return "cut";
    case "cut":
      return "cut";
    case "transition":
      return "dissolve";
    case "independent":
      return undefined;
    default:
      return undefined;
  }
}

/**
 * Calculate optimal generation order respecting dependencies
 */
function calculateGenerationOrder(
  shots: Shot[],
  dependencies: Map<string, string[]>
): string[] {
  const order: string[] = [];
  const visited = new Set<string>();
  const inProgress = new Set<string>();
  
  function visit(shotId: string): void {
    if (visited.has(shotId)) return;
    if (inProgress.has(shotId)) {
      // Circular dependency - break it
      return;
    }
    
    inProgress.add(shotId);
    
    const deps = dependencies.get(shotId) || [];
    for (const dep of deps) {
      visit(dep);
    }
    
    inProgress.delete(shotId);
    visited.add(shotId);
    order.push(shotId);
  }
  
  for (const shot of shots) {
    visit(shot.id);
  }
  
  return order;
}

// ============================================================================
// CHAIN RESOLUTION
// ============================================================================

/**
 * Resolve all references for a shot based on its chain
 */
export async function resolveChainReferences(
  chain: ReferenceChain,
  maxReferences: number = 14
): Promise<{
  allReferences: string[];
  primaryReference?: string;
  warnings: string[];
}> {
  const warnings: string[] = [];
  const allReferences: string[] = [];
  
  // Priority 1: Previous frame (for chaining)
  if (chain.sources.previousFrame) {
    allReferences.push(chain.sources.previousFrame);
  }
  
  // Priority 2: Character references (validated first)
  for (const ref of chain.sources.characterRefs) {
    if (allReferences.length < maxReferences && !allReferences.includes(ref)) {
      allReferences.push(ref);
    }
  }
  
  // Priority 3: Location references
  for (const ref of chain.sources.locationRefs) {
    if (allReferences.length < maxReferences && !allReferences.includes(ref)) {
      allReferences.push(ref);
    }
  }
  
  // Priority 4: Style reference
  if (chain.sources.styleRef && allReferences.length < maxReferences) {
    if (!allReferences.includes(chain.sources.styleRef)) {
      allReferences.push(chain.sources.styleRef);
    }
  }
  
  if (allReferences.length === 0) {
    warnings.push(`No references resolved for shot ${chain.shotId}`);
  }

  return {
    allReferences,
    primaryReference: allReferences[0],
    warnings,
  };
}

/**
 * Get generation config for a shot based on its chain
 */
export function getGenerationConfig(chain: ReferenceChain): {
  useFirstLastFrame: boolean;
  firstFrame?: string;
  lastFrame?: string;
  referenceImages: string[];
  continuityWith?: string;
} {
  const referenceImages: string[] = [];
  
  // Add character and location refs
  referenceImages.push(...chain.sources.characterRefs);
  referenceImages.push(...chain.sources.locationRefs);
  
  // Limit to max
  const limitedRefs = referenceImages.slice(0, 12);
  
  // Determine frame strategy
  const useFirstLastFrame = chain.chainType === "transition" ||
    (chain.chainType === "continuation" && chain.priority >= 7);
  
  return {
    useFirstLastFrame,
    firstFrame: chain.sources.previousFrame,
    lastFrame: undefined, // Would be generated separately
    referenceImages: limitedRefs,
    continuityWith: chain.sources.previousShot,
  };
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Get all shots that can be generated in parallel (no dependencies)
 */
export function getParallelBatch(
  chains: Map<string, ReferenceChain>,
  completed: Set<string>
): string[] {
  const batch: string[] = [];
  
  for (const [shotId, chain] of chains) {
    if (completed.has(shotId)) continue;
    
    // Check if dependencies are met
    const prevShot = chain.sources.previousShot;
    if (!prevShot || completed.has(prevShot)) {
      batch.push(shotId);
    }
  }
  
  return batch;
}

/**
 * Group shots by their chain type for batch processing
 */
export function groupByChainType(
  chains: Map<string, ReferenceChain>
): Map<ChainType, string[]> {
  const groups = new Map<ChainType, string[]>();
  
  for (const [shotId, chain] of chains) {
    const type = chain.chainType;
    if (!groups.has(type)) {
      groups.set(type, []);
    }
    groups.get(type)!.push(shotId);
  }
  
  return groups;
}
