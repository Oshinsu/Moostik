/**
 * IMAGE GRADING AGENT
 * ===========================================================================
 * Agent IA de notation d'images utilisant Gemini 3 Pro Vision via OpenRouter
 * 
 * Evalue les images generees selon 4 criteres:
 * - Character Fidelity (30%) - Ressemblance avec les references personnage
 * - Environment Fidelity (25%) - Ressemblance avec les references lieu
 * - Bible Compliance (25%) - Conformite avec la DA Moostik
 * - Narrative Coherence (20%) - Coherence avec le contexte du shot
 * 
 * SOTA Fevrier 2026
 * ===========================================================================
 */

import { getCharacter, getLocation, getEpisode } from "@/lib/storage";
import { analyzeImageWithVision, type VisionAnalysisResult } from "@/lib/ai/openrouter-client";
import { checkBibleCompliance, type BibleComplianceResult } from "./bible-checker";
import type { Shot, Episode } from "@/types/episode";
import type { Character } from "@/types/character";
import type { Location } from "@/types/location";

// ============================================================================
// TYPES
// ============================================================================

export type GradeLetter = "S" | "A" | "B" | "C" | "D" | "F";

export interface GradeDimension {
  score: number;        // 0-100
  weight: number;       // 0-1
  feedback: string;     // Explication
  details?: string[];   // Details specifiques
}

export interface ImageGrade {
  overall: number;                    // 0-100
  grade: GradeLetter;
  breakdown: {
    characterFidelity: GradeDimension;
    environmentFidelity: GradeDimension;
    bibleCompliance: GradeDimension;
    narrativeCoherence: GradeDimension;
  };
  violations: string[];               // Regles violees de la bible
  suggestions: string[];              // Ameliorations proposees
  regenerateRecommended: boolean;
  analysisTime: number;               // ms
  model: string;                      // Model utilise
  cost: number;                       // Cout en USD
}

export interface GradeContext {
  episodeId: string;
  shotId: string;
  variationId?: string;
  characterIds?: string[];
  locationIds?: string[];
}

export interface GradingOptions {
  includeCharacterComparison?: boolean;
  includeLocationComparison?: boolean;
  includeBibleCheck?: boolean;
  includeNarrativeCheck?: boolean;
  maxReferenceImages?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const WEIGHTS = {
  characterFidelity: 0.30,
  environmentFidelity: 0.25,
  bibleCompliance: 0.25,
  narrativeCoherence: 0.20,
};

const GRADE_THRESHOLDS: Record<GradeLetter, number> = {
  S: 95,
  A: 85,
  B: 70,
  C: 55,
  D: 40,
  F: 0,
};

// ============================================================================
// GRADING PROMPTS
// ============================================================================

const GRADING_SYSTEM_PROMPT = `Tu es un expert en direction artistique pour le projet MOOSTIK - une serie animee style Pixar demoniaque mignon sur des moustiques vampires anthropomorphes.

Tu dois evaluer les images generees selon ces criteres stricts:

## STYLE MOOSTIK OBLIGATOIRE
- Style: Pixar demoniaque mignon, 3D feature film quality
- Corps: Chitine obsidienne mate (#0B0B0E), moustiques anthropomorphes
- Yeux: Grands yeux expressifs ambre chaud (#FFB25A)
- Trompe: TOUJOURS visible, fine comme une aiguille, leur seule arme
- Ailes: Translucides avec veines cramoisies
- Palette: Obsidian black, blood red (#8B0015), deep crimson (#B0002A), copper accent (#9B6A3A), warm amber (#FFB25A)

## ELEMENTS INTERDITS
- Architecture humaine dans scenes Moostik
- Technologie moderne (electricite, ecrans, vehicules)
- Armes metalliques (epees, pistolets)
- Style cartoon/anime/2D
- Moustiques a echelle normale (ils sont MICROSCOPIQUES)
- Humains caucasiens (uniquement Antillais/Caribbeens)

Reponds en JSON avec cette structure exacte:
{
  "characterFidelity": { "score": 0-100, "feedback": "...", "details": ["..."] },
  "environmentFidelity": { "score": 0-100, "feedback": "...", "details": ["..."] },
  "bibleCompliance": { "score": 0-100, "feedback": "...", "violations": ["..."] },
  "narrativeCoherence": { "score": 0-100, "feedback": "...", "details": ["..."] },
  "suggestions": ["..."],
  "regenerateRecommended": true/false
}`;

function buildGradingPrompt(
  context: GradeContext,
  shot?: Shot,
  characters?: Character[],
  locations?: Location[],
  episode?: Episode
): string {
  const parts: string[] = [];

  parts.push("## IMAGE A EVALUER\nAnalyse l'image fournie selon les criteres MOOSTIK.\n");

  // Shot context
  if (shot) {
    parts.push(`## CONTEXTE DU SHOT
- Nom: ${shot.name}
- Description: ${shot.description || "Non specifie"}
- Type de scene: ${shot.sceneType || "Non specifie"}
- Personnages attendus: ${shot.characterIds?.join(", ") || "Aucun"}
- Lieux attendus: ${shot.locationIds?.join(", ") || "Aucun"}
`);
  }

  // Characters to compare
  if (characters && characters.length > 0) {
    parts.push("## PERSONNAGES DE REFERENCE\n");
    for (const char of characters) {
      parts.push(`### ${char.name} (${char.id})
- Type: ${char.type}
- Traits visuels: ${char.visualTraits?.join(", ") || "Non specifie"}
- Description: ${char.description || "Non specifie"}
`);
    }
  }

  // Locations to compare
  if (locations && locations.length > 0) {
    parts.push("## LIEUX DE REFERENCE\n");
    for (const loc of locations) {
      parts.push(`### ${loc.name} (${loc.id})
- Type: ${loc.type}
- Elements architecturaux: ${loc.architecturalFeatures?.join(", ") || "Non specifie"}
- Atmosphere: ${loc.atmosphericElements?.join(", ") || "Non specifie"}
`);
    }
  }

  // Episode context for narrative coherence
  if (episode) {
    parts.push(`## CONTEXTE NARRATIF
- Episode: ${episode.title} (EP${episode.number})
- Description: ${episode.description || "Non specifie"}
`);
  }

  parts.push(`
## EVALUATION DEMANDEE
Evalue cette image selon:
1. FIDELITE PERSONNAGE (30%): Ressemblance avec les references des personnages
2. FIDELITE ENVIRONNEMENT (25%): Ressemblance avec les references des lieux
3. CONFORMITE BIBLE (25%): Respect de la DA Moostik (palette, anatomie, style)
4. COHERENCE NARRATIVE (20%): Coherence avec le contexte du shot et de l'episode

Sois strict et precis. Note de 0 a 100 pour chaque critere.
Identifie toutes les violations de la bible Moostik.
Propose des suggestions d'amelioration concretes.
Recommande la regeneration si le score global < 60 ou si violations critiques.
`);

  return parts.join("\n");
}

// ============================================================================
// GRADE CALCULATION
// ============================================================================

function calculateOverallScore(breakdown: ImageGrade["breakdown"]): number {
  return Math.round(
    breakdown.characterFidelity.score * WEIGHTS.characterFidelity +
    breakdown.environmentFidelity.score * WEIGHTS.environmentFidelity +
    breakdown.bibleCompliance.score * WEIGHTS.bibleCompliance +
    breakdown.narrativeCoherence.score * WEIGHTS.narrativeCoherence
  );
}

function scoreToGrade(score: number): GradeLetter {
  if (score >= GRADE_THRESHOLDS.S) return "S";
  if (score >= GRADE_THRESHOLDS.A) return "A";
  if (score >= GRADE_THRESHOLDS.B) return "B";
  if (score >= GRADE_THRESHOLDS.C) return "C";
  if (score >= GRADE_THRESHOLDS.D) return "D";
  return "F";
}

export function getGradeColor(grade: GradeLetter): string {
  const colors: Record<GradeLetter, string> = {
    S: "#FFD700",  // Gold
    A: "#22C55E",  // Green
    B: "#3B82F6",  // Blue
    C: "#F59E0B",  // Amber
    D: "#F97316",  // Orange
    F: "#EF4444",  // Red
  };
  return colors[grade];
}

export function getGradeDescription(grade: GradeLetter): string {
  const descriptions: Record<GradeLetter, string> = {
    S: "Exceptionnel - Qualite production",
    A: "Excellent - Pret pour utilisation",
    B: "Bon - Ameliorations mineures possibles",
    C: "Passable - Necessite revision",
    D: "Insuffisant - Regeneration conseillee",
    F: "Echec - Regeneration obligatoire",
  };
  return descriptions[grade];
}

// ============================================================================
// MAIN GRADING FUNCTION
// ============================================================================

export async function gradeImage(
  imageUrl: string,
  context: GradeContext,
  options: GradingOptions = {}
): Promise<ImageGrade> {
  const startTime = Date.now();
  
  const {
    includeCharacterComparison = true,
    includeLocationComparison = true,
    includeBibleCheck = true,
    includeNarrativeCheck = true,
    maxReferenceImages = 6,
  } = options;

  // Load context data
  const episode = context.episodeId ? await getEpisode(context.episodeId) : null;
  const shot = episode?.shots.find(s => s.id === context.shotId);
  
  // Determine character and location IDs
  const characterIds = context.characterIds || shot?.characterIds || [];
  const locationIds = context.locationIds || shot?.locationIds || [];
  
  // Load characters and locations
  const characters: Character[] = [];
  const locations: Location[] = [];
  
  if (includeCharacterComparison) {
    for (const id of characterIds) {
      const char = await getCharacter(id);
      if (char) characters.push(char);
    }
  }
  
  if (includeLocationComparison) {
    for (const id of locationIds) {
      const loc = await getLocation(id);
      if (loc) locations.push(loc);
    }
  }

  // Collect reference images
  const referenceImages: string[] = [];
  
  for (const char of characters) {
    if (char.referenceImages) {
      referenceImages.push(...char.referenceImages.slice(0, 2));
    }
  }
  
  for (const loc of locations) {
    if (loc.referenceImages) {
      referenceImages.push(...loc.referenceImages.slice(0, 2));
    }
  }

  // Limit reference images
  const limitedRefs = referenceImages.slice(0, maxReferenceImages);

  // Build grading prompt
  const gradingPrompt = buildGradingPrompt(
    context,
    shot || undefined,
    characters.length > 0 ? characters : undefined,
    locations.length > 0 ? locations : undefined,
    episode || undefined
  );

  // Call vision model
  let visionResult: VisionAnalysisResult;
  
  try {
    visionResult = await analyzeImageWithVision(
      imageUrl,
      gradingPrompt,
      limitedRefs,
      {
        systemPrompt: GRADING_SYSTEM_PROMPT,
        model: "google/gemini-3-pro",
        temperature: 0.3,
        maxTokens: 2048,
      }
    );
  } catch (error) {
    console.error("[ImageGrading] Vision analysis failed:", error);
    
    // Return default failed grade
    return createFailedGrade(startTime, error);
  }

  // Parse vision response
  let parsedResponse: {
    characterFidelity: { score: number; feedback: string; details?: string[] };
    environmentFidelity: { score: number; feedback: string; details?: string[] };
    bibleCompliance: { score: number; feedback: string; violations?: string[] };
    narrativeCoherence: { score: number; feedback: string; details?: string[] };
    suggestions: string[];
    regenerateRecommended: boolean;
  };

  try {
    // Extract JSON from response
    const jsonMatch = visionResult.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    parsedResponse = JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error("[ImageGrading] Failed to parse response:", parseError);
    console.log("[ImageGrading] Raw response:", visionResult.content);
    
    // Try to extract scores from text
    parsedResponse = extractScoresFromText(visionResult.content);
  }

  // Build grade breakdown
  const breakdown: ImageGrade["breakdown"] = {
    characterFidelity: {
      score: Math.min(100, Math.max(0, parsedResponse.characterFidelity?.score || 50)),
      weight: WEIGHTS.characterFidelity,
      feedback: parsedResponse.characterFidelity?.feedback || "Analyse non disponible",
      details: parsedResponse.characterFidelity?.details,
    },
    environmentFidelity: {
      score: Math.min(100, Math.max(0, parsedResponse.environmentFidelity?.score || 50)),
      weight: WEIGHTS.environmentFidelity,
      feedback: parsedResponse.environmentFidelity?.feedback || "Analyse non disponible",
      details: parsedResponse.environmentFidelity?.details,
    },
    bibleCompliance: {
      score: Math.min(100, Math.max(0, parsedResponse.bibleCompliance?.score || 50)),
      weight: WEIGHTS.bibleCompliance,
      feedback: parsedResponse.bibleCompliance?.feedback || "Analyse non disponible",
      details: parsedResponse.bibleCompliance?.violations,
    },
    narrativeCoherence: {
      score: Math.min(100, Math.max(0, parsedResponse.narrativeCoherence?.score || 50)),
      weight: WEIGHTS.narrativeCoherence,
      feedback: parsedResponse.narrativeCoherence?.feedback || "Analyse non disponible",
      details: parsedResponse.narrativeCoherence?.details,
    },
  };

  // Calculate overall
  const overall = calculateOverallScore(breakdown);
  const grade = scoreToGrade(overall);

  // Collect violations
  const violations = parsedResponse.bibleCompliance?.violations || [];

  // Check bible compliance with local checker if enabled
  if (includeBibleCheck) {
    const bibleCheck = await checkBibleCompliance(imageUrl);
    if (bibleCheck.violations.length > 0) {
      violations.push(...bibleCheck.violations.filter(v => !violations.includes(v)));
    }
  }

  // Determine if regeneration is recommended
  const regenerateRecommended = 
    parsedResponse.regenerateRecommended || 
    overall < 60 || 
    violations.some(v => v.toLowerCase().includes("critique") || v.toLowerCase().includes("obligatoire"));

  const analysisTime = Date.now() - startTime;

  return {
    overall,
    grade,
    breakdown,
    violations,
    suggestions: parsedResponse.suggestions || [],
    regenerateRecommended,
    analysisTime,
    model: visionResult.model,
    cost: visionResult.cost,
  };
}

// ============================================================================
// BATCH GRADING
// ============================================================================

export interface BatchGradeResult {
  results: Map<string, ImageGrade>;
  summary: {
    total: number;
    graded: number;
    failed: number;
    averageScore: number;
    gradeDistribution: Record<GradeLetter, number>;
    regenerateCount: number;
    totalCost: number;
    totalTime: number;
  };
}

export async function gradeImageBatch(
  images: Array<{ id: string; url: string; context: GradeContext }>,
  options: GradingOptions = {}
): Promise<BatchGradeResult> {
  const startTime = Date.now();
  const results = new Map<string, ImageGrade>();
  
  let graded = 0;
  let failed = 0;
  let totalScore = 0;
  let totalCost = 0;
  let regenerateCount = 0;
  
  const gradeDistribution: Record<GradeLetter, number> = {
    S: 0, A: 0, B: 0, C: 0, D: 0, F: 0,
  };

  // Process images (could be parallelized with rate limiting)
  for (const image of images) {
    try {
      const grade = await gradeImage(image.url, image.context, options);
      results.set(image.id, grade);
      
      graded++;
      totalScore += grade.overall;
      totalCost += grade.cost;
      gradeDistribution[grade.grade]++;
      
      if (grade.regenerateRecommended) {
        regenerateCount++;
      }
    } catch (error) {
      console.error(`[BatchGrade] Failed to grade ${image.id}:`, error);
      failed++;
    }
  }

  return {
    results,
    summary: {
      total: images.length,
      graded,
      failed,
      averageScore: graded > 0 ? Math.round(totalScore / graded) : 0,
      gradeDistribution,
      regenerateCount,
      totalCost,
      totalTime: Date.now() - startTime,
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createFailedGrade(startTime: number, error: unknown): ImageGrade {
  return {
    overall: 0,
    grade: "F",
    breakdown: {
      characterFidelity: { score: 0, weight: WEIGHTS.characterFidelity, feedback: "Analyse echouee" },
      environmentFidelity: { score: 0, weight: WEIGHTS.environmentFidelity, feedback: "Analyse echouee" },
      bibleCompliance: { score: 0, weight: WEIGHTS.bibleCompliance, feedback: "Analyse echouee" },
      narrativeCoherence: { score: 0, weight: WEIGHTS.narrativeCoherence, feedback: "Analyse echouee" },
    },
    violations: [`Erreur d'analyse: ${error instanceof Error ? error.message : "Inconnue"}`],
    suggestions: ["Verifier l'URL de l'image", "Reessayer l'analyse"],
    regenerateRecommended: true,
    analysisTime: Date.now() - startTime,
    model: "none",
    cost: 0,
  };
}

function extractScoresFromText(text: string): {
  characterFidelity: { score: number; feedback: string };
  environmentFidelity: { score: number; feedback: string };
  bibleCompliance: { score: number; feedback: string; violations: string[] };
  narrativeCoherence: { score: number; feedback: string };
  suggestions: string[];
  regenerateRecommended: boolean;
} {
  // Fallback parsing when JSON fails
  const scoreRegex = /(\d{1,3})\s*(?:\/\s*100|%)/g;
  const scores: number[] = [];
  
  let match;
  while ((match = scoreRegex.exec(text)) !== null) {
    const score = parseInt(match[1], 10);
    if (score >= 0 && score <= 100) {
      scores.push(score);
    }
  }

  // Use found scores or defaults
  const [char = 50, env = 50, bible = 50, narr = 50] = scores;

  return {
    characterFidelity: { score: char, feedback: "Score extrait du texte" },
    environmentFidelity: { score: env, feedback: "Score extrait du texte" },
    bibleCompliance: { score: bible, feedback: "Score extrait du texte", violations: [] },
    narrativeCoherence: { score: narr, feedback: "Score extrait du texte" },
    suggestions: ["Analyse incomplete - verifier manuellement"],
    regenerateRecommended: (char + env + bible + narr) / 4 < 60,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  WEIGHTS as GRADE_WEIGHTS,
  GRADE_THRESHOLDS,
};
