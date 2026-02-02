/**
 * API Route: Generate Episode Videos with NARRATIVE PROMPTS
 * POST /api/video/generate-episode
 * 
 * Utilise le nouveau système NarrativePromptGenerator qui génère des prompts
 * basés sur l'INTENTION DRAMATIQUE et le CONTEXTE NARRATIF.
 * 
 * Plus de prompts génériques "fire and particles in constant motion" !
 */

import { NextRequest, NextResponse } from "next/server";
import { getEpisode, saveEpisode } from "@/lib/storage";
import {
  getNarrativePromptGenerator,
  detectDramaticIntention,
  type NarrativeContext,
  type NarrativeVideoPrompt,
  type DramaticIntention,
} from "@/lib/video";
import type { Episode, Shot, Variation } from "@/types";

interface GenerateVideoRequest {
  episodeId: string;
  shotIds?: string[]; // Optional: specific shots
  duration?: 5 | 10;
  dryRun?: boolean;
  maxParallel?: number;
}

interface VideoGenerationResult {
  shotId: string;
  variationId: string;
  imagePath: string;
  narrativePrompt: NarrativeVideoPrompt;
  status: "pending" | "queued" | "generated" | "error";
  error?: string;
}

/**
 * Construit le contexte narratif complet pour un shot
 */
function buildNarrativeContext(
  episode: Episode,
  shot: Shot,
  variation: Variation,
  duration: 5 | 10
): NarrativeContext {
  // Trouver la part et la séquence pour ce shot
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

  // Trouver la séquence qui contient ce shot
  const acts = episode.acts || [];
  for (const act of acts) {
    if (act.shotIds?.includes(shot.id)) {
      sequenceNumber = act.number;
      sequenceTitle = act.title;
      sequenceDescription = act.description || "";
      
      // Position dans la séquence
      const shotIndex = act.shotIds.indexOf(shot.id);
      shotPositionInSequence = shotIndex + 1;
      totalShotsInSequence = act.shotIds.length;
      
      // Shots précédent et suivant
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

  // Trouver la part qui contient cette séquence (si l'épisode a des parts)
  // Note: les parts sont une structure enrichie optionnelle, pas dans le type Episode de base
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

  // Détecter l'intention dramatique basée sur le contenu
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
    suggestedCameraMotion: undefined,
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: GenerateVideoRequest = await request.json();
    const { 
      episodeId, 
      shotIds, 
      duration = 10,
      dryRun = false,
    } = body;

    console.log(`[NarrativeVideoGen] Starting for episode ${episodeId}`);
    console.log(`[NarrativeVideoGen] Using NARRATIVE PROMPT SYSTEM`);

    // Load episode
    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: `Episode ${episodeId} not found` },
        { status: 404 }
      );
    }

    const narrativeGenerator = getNarrativePromptGenerator();
    const results: VideoGenerationResult[] = [];
    const narrativePrompts: Map<string, NarrativeVideoPrompt> = new Map();

    // Compteurs par intention
    const intentionCounts: Record<string, number> = {};

    // Filter shots if specific IDs provided
    const shotsToProcess = shotIds
      ? episode.shots.filter(s => shotIds.includes(s.id))
      : episode.shots;

    console.log(`[NarrativeVideoGen] Processing ${shotsToProcess.length} shots`);

    // Generate NARRATIVE video prompts for all completed variations
    for (const shot of shotsToProcess) {
      if (!shot.variations) continue;

      for (const variation of shot.variations) {
        // Only process completed variations with images
        if (variation.status !== "completed" || !variation.imageUrl) {
          continue;
        }

        // Skip if video already generated
        if (variation.videoStatus === "completed" && variation.videoUrl) {
          continue;
        }

        // Construire le contexte narratif COMPLET
        const context = buildNarrativeContext(episode, shot, variation, duration);
        
        // Générer le prompt NARRATIF
        const narrativePrompt = narrativeGenerator.generateNarrativePrompt(context);

        // Track intentions
        intentionCounts[context.dramaticIntention] = (intentionCounts[context.dramaticIntention] || 0) + 1;

        narrativePrompts.set(`${shot.id}_${variation.id}`, narrativePrompt);

        results.push({
          shotId: shot.id,
          variationId: variation.id,
          imagePath: variation.imageUrl,
          narrativePrompt,
          status: dryRun ? "pending" : "queued",
        });

        console.log(`[NarrativeVideoGen] ${shot.name}: ${context.dramaticIntention} (score: ${narrativePrompt.narrativeScore})`);
      }
    }

    console.log(`[NarrativeVideoGen] Generated ${results.length} NARRATIVE prompts`);
    console.log(`[NarrativeVideoGen] Intentions breakdown:`, intentionCounts);

    if (dryRun) {
      const avgScore = results.length > 0
        ? results.reduce((sum, r) => sum + r.narrativePrompt.narrativeScore, 0) / results.length
        : 0;

      return NextResponse.json({
        success: true,
        dryRun: true,
        episodeId,
        system: "NARRATIVE_PROMPT_GENERATOR",
        totalPrompts: results.length,
        averageNarrativeScore: Math.round(avgScore * 10) / 10,
        intentionBreakdown: intentionCounts,
        estimatedDuration: results.length * duration,
        estimatedCost: {
          kling26: `$${(results.length * 0.65).toFixed(2)}`,
          wan26: `$${(results.length * 0.35).toFixed(2)}`,
        },
        
        // Sample avec les infos narratives
        samplePrompts: results.slice(0, 10).map(r => ({
          shotId: r.shotId,
          variationId: r.variationId,
          
          // NOUVELLES INFOS NARRATIVES
          dramaticIntention: r.narrativePrompt.dramaticIntention,
          emotionalCore: r.narrativePrompt.emotionalCore.slice(0, 100) + "...",
          targetEmotion: r.narrativePrompt.rationale.match(/Émotion cible: ([^\n]+)/)?.[1] || "",
          
          // Prompt
          prompt: r.narrativePrompt.prompt.slice(0, 300) + "...",
          
          // Technique
          duration: r.narrativePrompt.recommendedDuration,
          provider: r.narrativePrompt.recommendedProvider,
          narrativeScore: r.narrativePrompt.narrativeScore,
          cameraInstruction: r.narrativePrompt.cameraInstruction.slice(0, 100) + "...",
        })),
        
        // Full prompts
        allPrompts: results.map(r => ({
          shotId: r.shotId,
          variationId: r.variationId,
          
          // NARRATIVE INFO
          dramaticIntention: r.narrativePrompt.dramaticIntention,
          emotionalCore: r.narrativePrompt.emotionalCore,
          motionDescription: r.narrativePrompt.motionDescription,
          cameraInstruction: r.narrativePrompt.cameraInstruction,
          
          // PROMPTS
          prompt: r.narrativePrompt.prompt,
          negativePrompt: r.narrativePrompt.negativePrompt,
          
          // TECHNIQUE
          duration: r.narrativePrompt.recommendedDuration,
          provider: r.narrativePrompt.recommendedProvider,
          narrativeScore: r.narrativePrompt.narrativeScore,
          
          // RATIONALE
          rationale: r.narrativePrompt.rationale,
        })),
      });
    }

    // If not dry run, update episode with video generation data
    const updatedShots = episode.shots.map(shot => {
      const updatedVariations = shot.variations?.map(variation => {
        const key = `${shot.id}_${variation.id}`;
        const narrativePrompt = narrativePrompts.get(key);
        
        if (narrativePrompt) {
          return {
            ...variation,
            videoStatus: "pending" as const,
            videoPrompt: {
              prompt: narrativePrompt.prompt,
              negativePrompt: narrativePrompt.negativePrompt,
              duration: narrativePrompt.recommendedDuration,
              fps: 24,
              aspectRatio: "16:9", // Kling 2.6 only supports 16:9, 9:16, 1:1
              cameraMotion: narrativePrompt.cameraInstruction.split(",")[0],
              provider: narrativePrompt.recommendedProvider,
              estimatedCost: narrativePrompt.recommendedProvider === "kling-2.6" ? 0.65 : 0.35,
              modelConfig: {
                mode: "pro",
                motion_amount: 0.5,
              },
              // NOUVELLES MÉTADONNÉES NARRATIVES
              narrativeMetadata: {
                dramaticIntention: narrativePrompt.dramaticIntention,
                emotionalCore: narrativePrompt.emotionalCore,
                narrativeScore: narrativePrompt.narrativeScore,
              },
            },
            videoDuration: narrativePrompt.recommendedDuration,
            videoCameraMotion: narrativePrompt.cameraInstruction.split(",")[0],
          };
        }
        return variation;
      });

      return {
        ...shot,
        variations: updatedVariations,
      };
    });

    const updatedEpisode = {
      ...episode,
      shots: updatedShots,
      updatedAt: new Date().toISOString(),
    };

    await saveEpisode(updatedEpisode);

    const avgScore = results.length > 0
      ? results.reduce((sum, r) => sum + r.narrativePrompt.narrativeScore, 0) / results.length
      : 0;

    return NextResponse.json({
      success: true,
      dryRun: false,
      system: "NARRATIVE_PROMPT_GENERATOR",
      episodeId,
      videosQueued: results.length,
      averageNarrativeScore: Math.round(avgScore * 10) / 10,
      intentionBreakdown: intentionCounts,
      estimatedCost: {
        kling26: `$${(results.length * 0.65).toFixed(2)}`,
      },
      message: `${results.length} vidéos avec prompts NARRATIFS prêtes. Les prompts capturent maintenant l'INTENTION DRAMATIQUE de chaque shot.`,
      queuedItems: results.map(r => ({
        shotId: r.shotId,
        variationId: r.variationId,
        dramaticIntention: r.narrativePrompt.dramaticIntention,
        duration: r.narrativePrompt.recommendedDuration,
        narrativeScore: r.narrativePrompt.narrativeScore,
      })),
    });

  } catch (error) {
    console.error("[NarrativeVideoGen] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/video/generate-episode?episodeId=ep0
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const episodeId = searchParams.get("episodeId");

  if (!episodeId) {
    return NextResponse.json(
      { error: "episodeId query parameter required" },
      { status: 400 }
    );
  }

  const episode = await getEpisode(episodeId);
  if (!episode) {
    return NextResponse.json(
      { error: `Episode ${episodeId} not found` },
      { status: 404 }
    );
  }

  let pending = 0;
  let generating = 0;
  let completed = 0;
  let failed = 0;
  let noImage = 0;
  const intentionCounts: Record<string, number> = {};

  for (const shot of episode.shots) {
    for (const variation of (shot.variations || [])) {
      if (variation.status !== "completed" || !variation.imageUrl) {
        noImage++;
        continue;
      }

      // Track narrative intentions
      const intention = (variation.videoPrompt as any)?.narrativeMetadata?.dramaticIntention;
      if (intention) {
        intentionCounts[intention] = (intentionCounts[intention] || 0) + 1;
      }

      switch (variation.videoStatus) {
        case "completed":
          completed++;
          break;
        case "generating":
          generating++;
          break;
        case "failed":
          failed++;
          break;
        default:
          pending++;
      }
    }
  }

  return NextResponse.json({
    episodeId,
    system: "NARRATIVE_PROMPT_GENERATOR",
    videoStats: {
      pending,
      generating,
      completed,
      failed,
      noImage,
      total: pending + generating + completed + failed,
    },
    intentionBreakdown: intentionCounts,
    completionPercent: (completed / (pending + generating + completed + failed || 1)) * 100,
  });
}
