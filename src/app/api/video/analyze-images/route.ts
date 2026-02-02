/**
 * API Route: Analyze Images for NARRATIVE Video Prompts
 * POST /api/video/analyze-images
 * 
 * Utilise le nouveau système NarrativePromptGenerator qui génère des prompts
 * basés sur l'INTENTION DRAMATIQUE et le CONTEXTE NARRATIF.
 */

import { NextRequest, NextResponse } from "next/server";
import { getEpisode } from "@/lib/storage";
import {
  getNarrativePromptGenerator,
  detectDramaticIntention,
  type NarrativeContext,
  type NarrativeVideoPrompt,
} from "@/lib/video";
import type { Episode, Shot, Variation } from "@/types";

interface AnalyzeRequest {
  episodeId: string;
  shotIds?: string[];
  duration?: 5 | 10;
  includeEmptyVariations?: boolean;
}

interface ShotAnalysis {
  shotId: string;
  shotName: string;
  dramaticIntention: string;
  variationCount: number;
  prompts: Array<{
    variationId: string;
    imagePath: string;
    cameraAngle: string;
    narrativePrompt: NarrativeVideoPrompt;
  }>;
  averageScore: number;
}

interface AnalyzeResponse {
  episodeId: string;
  episodeTitle: string;
  system: "NARRATIVE_PROMPT_GENERATOR";
  totalShots: number;
  analyzedShots: number;
  totalVariations: number;
  shotAnalyses: ShotAnalysis[];
  summary: {
    averageNarrativeScore: number;
    intentionBreakdown: Record<string, number>;
    recommendedDurations: Record<string, number>;
    totalEstimatedDuration: number;
  };
}

/**
 * Construit le contexte narratif pour un shot
 */
function buildNarrativeContext(
  episode: Episode,
  shot: Shot,
  variation: Variation
): NarrativeContext {
  let partNumber = 1;
  let partTitle = "Unknown";
  let partAtmosphere = "Unknown";
  let sequenceNumber = 1;
  let sequenceTitle = "Unknown";
  let sequenceDescription = "";
  let shotPositionInSequence = 1;
  let totalShotsInSequence = 1;
  let previousShotDescription: string | undefined;
  let nextShotDescription: string | undefined;

  const acts = episode.acts || [];
  for (const act of acts) {
    if (act.shotIds?.includes(shot.id)) {
      sequenceNumber = act.number;
      sequenceTitle = act.title;
      sequenceDescription = act.description || "";
      
      const shotIndex = act.shotIds.indexOf(shot.id);
      shotPositionInSequence = shotIndex + 1;
      totalShotsInSequence = act.shotIds.length;
      
      if (shotIndex > 0) {
        const prevShotId = act.shotIds[shotIndex - 1];
        const prevShot = episode.shots.find(s => s.id === prevShotId);
        previousShotDescription = prevShot?.description;
      }
      if (shotIndex < act.shotIds.length - 1) {
        const nextShotId = act.shotIds[shotIndex + 1];
        const nextShot = episode.shots.find(s => s.id === nextShotId);
        nextShotDescription = nextShot?.description;
      }
      break;
    }
  }

  // Parts sont une structure enrichie optionnelle
  const episodeData = episode as unknown as Record<string, unknown>;
  const parts = (episodeData.parts as Array<{
    number: number;
    title: string;
    description?: string;
    palette?: { atmosphere?: string };
    actIds?: string[];
  }>) || [];
  
  for (const part of parts) {
    if (part.actIds?.includes(`seq-${sequenceNumber}`)) {
      partNumber = part.number;
      partTitle = part.title;
      partAtmosphere = part.palette?.atmosphere || part.description || "";
      break;
    }
  }

  const visualGoal = shot.prompt?.goal || shot.description;
  const { intention, targetEmotion } = detectDramaticIntention(
    shot.description,
    shot.name,
    sequenceDescription,
    visualGoal
  );

  return {
    shotId: shot.id,
    shotName: shot.name,
    shotDescription: shot.description,
    partNumber,
    partTitle,
    partAtmosphere,
    sequenceNumber,
    sequenceTitle,
    sequenceDescription,
    shotPositionInSequence,
    totalShotsInSequence,
    characterIds: shot.characterIds || [],
    locationIds: shot.locationIds || [],
    previousShotDescription,
    nextShotDescription,
    dramaticIntention: intention,
    targetEmotion,
    visualGoal: visualGoal || shot.description,
    cameraAngle: variation.cameraAngle || "medium",
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: AnalyzeRequest = await request.json();
    const { episodeId, shotIds, duration = 10, includeEmptyVariations = false } = body;

    console.log(`[NarrativeAnalyze] Starting for episode ${episodeId}`);

    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: `Episode ${episodeId} not found` },
        { status: 404 }
      );
    }

    const narrativeGenerator = getNarrativePromptGenerator();
    const shotAnalyses: ShotAnalysis[] = [];
    let totalVariations = 0;
    const durationCounts: Record<number, number> = { 5: 0, 10: 0 };
    const intentionCounts: Record<string, number> = {};

    const shotsToAnalyze = shotIds
      ? episode.shots.filter(s => shotIds.includes(s.id))
      : episode.shots;

    console.log(`[NarrativeAnalyze] Analyzing ${shotsToAnalyze.length} shots with NARRATIVE system`);

    for (const shot of shotsToAnalyze) {
      if (!includeEmptyVariations && (!shot.variations || shot.variations.length === 0)) {
        continue;
      }

      const prompts: ShotAnalysis["prompts"] = [];
      let shotIntention = "";

      for (const variation of (shot.variations || [])) {
        if (variation.status !== "completed" || !variation.imageUrl) {
          continue;
        }

        // Construire le contexte narratif COMPLET
        const context = buildNarrativeContext(episode, shot, variation);
        shotIntention = context.dramaticIntention;
        
        // Générer le prompt NARRATIF
        const narrativePrompt = narrativeGenerator.generateNarrativePrompt(context);

        // Track
        intentionCounts[context.dramaticIntention] = (intentionCounts[context.dramaticIntention] || 0) + 1;
        durationCounts[narrativePrompt.recommendedDuration]++;
        totalVariations++;

        prompts.push({
          variationId: variation.id,
          imagePath: variation.imageUrl!,
          cameraAngle: variation.cameraAngle,
          narrativePrompt,
        });
      }

      if (prompts.length > 0) {
        const averageScore = prompts.reduce((sum, p) => sum + p.narrativePrompt.narrativeScore, 0) / prompts.length;

        shotAnalyses.push({
          shotId: shot.id,
          shotName: shot.name,
          dramaticIntention: shotIntention,
          variationCount: prompts.length,
          prompts,
          averageScore,
        });
      }
    }

    const allScores = shotAnalyses.flatMap(s => s.prompts.map(p => p.narrativePrompt.narrativeScore));
    const averageNarrativeScore = allScores.length > 0
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length
      : 0;

    const totalEstimatedDuration = (durationCounts[5] * 5) + (durationCounts[10] * 10);

    const response: AnalyzeResponse = {
      episodeId,
      episodeTitle: episode.title,
      system: "NARRATIVE_PROMPT_GENERATOR",
      totalShots: episode.shots.length,
      analyzedShots: shotAnalyses.length,
      totalVariations,
      shotAnalyses: shotAnalyses.map(s => ({
        ...s,
        prompts: s.prompts.map(p => ({
          ...p,
          narrativePrompt: {
            ...p.narrativePrompt,
            // Inclure les infos clés dans la réponse
            prompt: p.narrativePrompt.prompt,
            negativePrompt: p.narrativePrompt.negativePrompt,
            dramaticIntention: p.narrativePrompt.dramaticIntention,
            emotionalCore: p.narrativePrompt.emotionalCore,
            motionDescription: p.narrativePrompt.motionDescription,
            cameraInstruction: p.narrativePrompt.cameraInstruction,
            narrativeScore: p.narrativePrompt.narrativeScore,
            rationale: p.narrativePrompt.rationale,
            recommendedDuration: p.narrativePrompt.recommendedDuration,
            recommendedProvider: p.narrativePrompt.recommendedProvider,
          },
        })),
      })),
      summary: {
        averageNarrativeScore: Math.round(averageNarrativeScore * 10) / 10,
        intentionBreakdown: intentionCounts,
        recommendedDurations: durationCounts,
        totalEstimatedDuration,
      },
    };

    console.log(`[NarrativeAnalyze] Complete: ${totalVariations} variations, avg narrative score: ${averageNarrativeScore.toFixed(1)}`);
    console.log(`[NarrativeAnalyze] Intentions:`, intentionCounts);

    return NextResponse.json(response);

  } catch (error) {
    console.error("[NarrativeAnalyze] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const episodeId = searchParams.get("episodeId");

  if (!episodeId) {
    return NextResponse.json(
      { error: "episodeId query parameter required" },
      { status: 400 }
    );
  }

  const body: AnalyzeRequest = {
    episodeId,
    duration: 10,
  };

  return POST(
    new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })
  );
}
