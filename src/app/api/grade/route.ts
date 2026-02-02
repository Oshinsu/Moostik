/**
 * API GRADE - Agent de Notation d'Images Moostik
 * ===========================================================================
 * 
 * Endpoints:
 * - POST /api/grade - Note une image unique
 * - POST /api/grade/batch - Note plusieurs images
 * 
 * SOTA Fevrier 2026
 * ===========================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  gradeImage, 
  gradeImageBatch, 
  type GradeContext, 
  type GradingOptions,
  type ImageGrade,
  type BatchGradeResult,
  getGradeColor,
  getGradeDescription,
} from "@/lib/agents/image-grading-agent";
import { checkBibleCompliance } from "@/lib/agents/bible-checker";

// ============================================================================
// POST /api/grade - Note une image unique
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, context, options, action } = body;

    // Action batch - noter plusieurs images
    if (action === "batch") {
      return handleBatchGrading(body);
    }

    // Action bible-check - verification bible uniquement
    if (action === "bible-check") {
      return handleBibleCheck(body);
    }

    // Action stats - statistiques de notation
    if (action === "stats") {
      return handleStats(body);
    }

    // Validation
    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl est requis" },
        { status: 400 }
      );
    }

    if (!context?.episodeId || !context?.shotId) {
      return NextResponse.json(
        { error: "context.episodeId et context.shotId sont requis" },
        { status: 400 }
      );
    }

    // Notation de l'image
    const gradeContext: GradeContext = {
      episodeId: context.episodeId,
      shotId: context.shotId,
      variationId: context.variationId,
      characterIds: context.characterIds,
      locationIds: context.locationIds,
    };

    const gradingOptions: GradingOptions = {
      includeCharacterComparison: options?.includeCharacterComparison ?? true,
      includeLocationComparison: options?.includeLocationComparison ?? true,
      includeBibleCheck: options?.includeBibleCheck ?? true,
      includeNarrativeCheck: options?.includeNarrativeCheck ?? true,
      maxReferenceImages: options?.maxReferenceImages ?? 6,
    };

    console.log(`[API Grade] Notation de l'image: ${imageUrl}`);
    const startTime = Date.now();

    const grade = await gradeImage(imageUrl, gradeContext, gradingOptions);

    console.log(`[API Grade] Note: ${grade.grade} (${grade.overall}/100) en ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      grade,
      metadata: {
        gradeColor: getGradeColor(grade.grade),
        gradeDescription: getGradeDescription(grade.grade),
        imageUrl,
        context: gradeContext,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API Grade] Erreur:", error);
    return NextResponse.json(
      { 
        error: "Erreur lors de la notation",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Handler pour notation batch
// ============================================================================

async function handleBatchGrading(body: {
  images: Array<{ id: string; url: string; context: GradeContext }>;
  options?: GradingOptions;
}): Promise<NextResponse> {
  const { images, options } = body;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return NextResponse.json(
      { error: "images est requis et doit etre un tableau non vide" },
      { status: 400 }
    );
  }

  console.log(`[API Grade Batch] Notation de ${images.length} images`);
  const startTime = Date.now();

  const result = await gradeImageBatch(images, options);

  // Convertir Map en objet pour JSON
  const resultsObject: Record<string, ImageGrade> = {};
  result.results.forEach((grade, id) => {
    resultsObject[id] = grade;
  });

  console.log(`[API Grade Batch] Complete en ${Date.now() - startTime}ms`);
  console.log(`[API Grade Batch] Resume: ${result.summary.graded} notes, ${result.summary.failed} echecs, moyenne ${result.summary.averageScore}/100`);

  return NextResponse.json({
    success: true,
    results: resultsObject,
    summary: result.summary,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// Handler pour verification bible uniquement
// ============================================================================

async function handleBibleCheck(body: {
  imageUrl: string;
  useVision?: boolean;
}): Promise<NextResponse> {
  const { imageUrl, useVision = true } = body;

  if (!imageUrl) {
    return NextResponse.json(
      { error: "imageUrl est requis" },
      { status: 400 }
    );
  }

  console.log(`[API Grade Bible] Verification bible pour: ${imageUrl}`);

  const result = await checkBibleCompliance(imageUrl, { useVision });

  return NextResponse.json({
    success: true,
    result,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// Handler pour statistiques
// ============================================================================

async function handleStats(body: {
  episodeId?: string;
}): Promise<NextResponse> {
  // TODO: Implementer les statistiques depuis Supabase
  // Pour l'instant, retourne des stats placeholder
  
  return NextResponse.json({
    success: true,
    stats: {
      totalGraded: 0,
      averageScore: 0,
      gradeDistribution: {
        S: 0,
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        F: 0,
      },
      regenerateRecommended: 0,
      commonViolations: [],
      message: "Statistiques non encore implementees - necessite integration Supabase",
    },
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// GET /api/grade - Documentation de l'API
// ============================================================================

export async function GET() {
  return NextResponse.json({
    name: "Moostik Image Grading API",
    version: "1.0.0",
    description: "Agent IA de notation d'images pour le projet MOOSTIK",
    endpoints: {
      "POST /api/grade": {
        description: "Note une image unique",
        body: {
          imageUrl: "string (required) - URL de l'image a noter",
          context: {
            episodeId: "string (required)",
            shotId: "string (required)",
            variationId: "string (optional)",
            characterIds: "string[] (optional)",
            locationIds: "string[] (optional)",
          },
          options: {
            includeCharacterComparison: "boolean (default: true)",
            includeLocationComparison: "boolean (default: true)",
            includeBibleCheck: "boolean (default: true)",
            includeNarrativeCheck: "boolean (default: true)",
            maxReferenceImages: "number (default: 6)",
          },
        },
        response: {
          success: "boolean",
          grade: {
            overall: "number (0-100)",
            grade: "S | A | B | C | D | F",
            breakdown: "object avec scores par critere",
            violations: "string[] - regles violees",
            suggestions: "string[] - ameliorations",
            regenerateRecommended: "boolean",
          },
        },
      },
      "POST /api/grade (action: batch)": {
        description: "Note plusieurs images",
        body: {
          action: "batch",
          images: "[{ id, url, context }]",
          options: "GradingOptions",
        },
      },
      "POST /api/grade (action: bible-check)": {
        description: "Verification bible uniquement",
        body: {
          action: "bible-check",
          imageUrl: "string",
          useVision: "boolean (default: true)",
        },
      },
    },
    criteria: {
      characterFidelity: { weight: "30%", description: "Ressemblance avec les references personnage" },
      environmentFidelity: { weight: "25%", description: "Ressemblance avec les references lieu" },
      bibleCompliance: { weight: "25%", description: "Conformite avec la DA Moostik" },
      narrativeCoherence: { weight: "20%", description: "Coherence avec le contexte du shot" },
    },
    gradeScale: {
      S: "95-100 - Exceptionnel - Qualite production",
      A: "85-94 - Excellent - Pret pour utilisation",
      B: "70-84 - Bon - Ameliorations mineures possibles",
      C: "55-69 - Passable - Necessite revision",
      D: "40-54 - Insuffisant - Regeneration conseillee",
      F: "0-39 - Echec - Regeneration obligatoire",
    },
    estimatedCost: "$0.01-0.02 par image (Gemini 3 Pro Vision)",
  });
}
