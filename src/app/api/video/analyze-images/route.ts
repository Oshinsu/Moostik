/**
 * API Route: Analyze Images for Video Prompts
 * POST /api/video/analyze-images
 * 
 * Analyzes generated images and produces optimized video prompts for Kling 2.6
 */

import { NextRequest, NextResponse } from "next/server";
import { getEpisode } from "@/lib/storage";
import {
  getImageAnalyzer,
  generateVideoPromptsForShot,
  type SceneContext,
  type VideoPromptSuggestion,
} from "@/lib/video";
import type { SceneType } from "@/lib/video/prompt-templates";

interface AnalyzeRequest {
  episodeId: string;
  shotIds?: string[]; // Optional: specific shots, otherwise all shots
  duration?: 5 | 10;
  includeEmptyVariations?: boolean;
}

interface ShotAnalysis {
  shotId: string;
  shotName: string;
  sceneType: string;
  variationCount: number;
  prompts: Array<{
    variationId: string;
    imagePath: string;
    cameraAngle: string;
    videoPrompt: VideoPromptSuggestion;
  }>;
  averageScore: number;
}

interface AnalyzeResponse {
  episodeId: string;
  episodeTitle: string;
  totalShots: number;
  analyzedShots: number;
  totalVariations: number;
  shotAnalyses: ShotAnalysis[];
  summary: {
    averagePromptScore: number;
    recommendedDurations: Record<string, number>;
    totalEstimatedDuration: number;
    kling26Optimized: boolean;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: AnalyzeRequest = await request.json();
    const { episodeId, shotIds, duration = 10, includeEmptyVariations = false } = body;

    console.log(`[Analyze] Starting image analysis for episode ${episodeId}`);

    // Load episode
    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: `Episode ${episodeId} not found` },
        { status: 404 }
      );
    }

    const analyzer = getImageAnalyzer();
    const shotAnalyses: ShotAnalysis[] = [];
    let totalVariations = 0;
    const durationCounts: Record<number, number> = { 5: 0, 10: 0 };

    // Filter shots if specific IDs provided
    const shotsToAnalyze = shotIds
      ? episode.shots.filter(s => shotIds.includes(s.id))
      : episode.shots;

    console.log(`[Analyze] Analyzing ${shotsToAnalyze.length} shots`);

    for (const shot of shotsToAnalyze) {
      // Skip shots without variations unless explicitly requested
      if (!includeEmptyVariations && (!shot.variations || shot.variations.length === 0)) {
        console.log(`[Analyze] Skipping shot ${shot.id} - no variations`);
        continue;
      }

      const prompts: ShotAnalysis["prompts"] = [];

      for (const variation of (shot.variations || [])) {
        // Only analyze completed variations with images
        if (variation.status !== "completed" || !variation.imageUrl) {
          continue;
        }

        const context: SceneContext = {
          shotId: shot.id,
          shotName: shot.name,
          sceneType: (shot.sceneType || "establishing") as SceneType,
          description: shot.description,
          characterIds: shot.characterIds || [],
          locationIds: shot.locationIds || [],
          cameraAngle: variation.cameraAngle,
        };

        const videoPrompt = analyzer.analyzeAndGeneratePrompt(
          variation.imageUrl,
          context,
          {
            preferredDuration: duration,
            emphasizeEmotion: ["genocide", "emotional", "flashback"].includes(shot.sceneType || ""),
          }
        );

        prompts.push({
          variationId: variation.id,
          imagePath: variation.imageUrl!,
          cameraAngle: variation.cameraAngle,
          videoPrompt,
        });

        durationCounts[videoPrompt.recommendedDuration]++;
        totalVariations++;
      }

      if (prompts.length > 0) {
        const averageScore = prompts.reduce((sum, p) => sum + p.videoPrompt.promptScore, 0) / prompts.length;

        shotAnalyses.push({
          shotId: shot.id,
          shotName: shot.name,
          sceneType: shot.sceneType || "establishing",
          variationCount: prompts.length,
          prompts,
          averageScore,
        });
      }
    }

    // Calculate summary statistics
    const allScores = shotAnalyses.flatMap(s => s.prompts.map(p => p.videoPrompt.promptScore));
    const averagePromptScore = allScores.length > 0
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length
      : 0;

    const totalEstimatedDuration = (durationCounts[5] * 5) + (durationCounts[10] * 10);

    const response: AnalyzeResponse = {
      episodeId,
      episodeTitle: episode.title,
      totalShots: episode.shots.length,
      analyzedShots: shotAnalyses.length,
      totalVariations,
      shotAnalyses,
      summary: {
        averagePromptScore: Math.round(averagePromptScore * 10) / 10,
        recommendedDurations: durationCounts,
        totalEstimatedDuration,
        kling26Optimized: true,
      },
    };

    console.log(`[Analyze] Complete: ${totalVariations} variations analyzed, avg score: ${averagePromptScore.toFixed(1)}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error("[Analyze] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/video/analyze-images?episodeId=ep0
 * Quick analysis summary
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

  // Redirect to POST with default options
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
