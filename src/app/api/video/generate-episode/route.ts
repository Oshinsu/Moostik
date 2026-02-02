/**
 * API Route: Generate Episode Videos
 * POST /api/video/generate-episode
 * 
 * Generates videos for all completed images in an episode using Kling 2.6
 */

import { NextRequest, NextResponse } from "next/server";
import { getEpisode, saveEpisode } from "@/lib/storage";
import {
  getImageAnalyzer,
  type SceneContext,
  type VideoPromptSuggestion,
} from "@/lib/video";
import type { SceneType } from "@/lib/video/prompt-templates";

interface GenerateVideoRequest {
  episodeId: string;
  shotIds?: string[]; // Optional: specific shots
  duration?: 5 | 10;
  dryRun?: boolean; // If true, only generate prompts without actual video generation
  maxParallel?: number;
}

interface VideoGenerationResult {
  shotId: string;
  variationId: string;
  imagePath: string;
  videoPrompt: VideoPromptSuggestion;
  status: "pending" | "queued" | "generated" | "error";
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: GenerateVideoRequest = await request.json();
    const { 
      episodeId, 
      shotIds, 
      duration = 10,
      dryRun = false,
      maxParallel = 2,
    } = body;

    console.log(`[VideoGen] Starting video generation for episode ${episodeId}`);
    console.log(`[VideoGen] Dry run: ${dryRun}, Duration: ${duration}s`);

    // Load episode
    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: `Episode ${episodeId} not found` },
        { status: 404 }
      );
    }

    const analyzer = getImageAnalyzer();
    const results: VideoGenerationResult[] = [];
    const videoPrompts: Map<string, VideoPromptSuggestion> = new Map();

    // Filter shots if specific IDs provided
    const shotsToProcess = shotIds
      ? episode.shots.filter(s => shotIds.includes(s.id))
      : episode.shots;

    console.log(`[VideoGen] Processing ${shotsToProcess.length} shots`);

    // Generate video prompts for all completed variations
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

        const context: SceneContext = {
          shotId: shot.id,
          shotName: shot.name,
          sceneType: (shot.sceneType || "establishing") as SceneType,
          description: shot.description,
          characterIds: shot.characterIds || [],
          locationIds: shot.locationIds || [],
          cameraAngle: variation.cameraAngle,
        };

        // Generate optimized video prompt
        const videoPrompt = analyzer.analyzeAndGeneratePrompt(
          variation.imageUrl,
          context,
          {
            preferredDuration: duration,
            emphasizeEmotion: ["genocide", "emotional", "flashback", "survival"].includes(shot.sceneType || ""),
          }
        );

        videoPrompts.set(`${shot.id}_${variation.id}`, videoPrompt);

        results.push({
          shotId: shot.id,
          variationId: variation.id,
          imagePath: variation.imageUrl,
          videoPrompt,
          status: dryRun ? "pending" : "queued",
        });
      }
    }

    console.log(`[VideoGen] Generated ${results.length} video prompts`);

    if (dryRun) {
      // Just return the prompts without generating
      const avgScore = results.length > 0
        ? results.reduce((sum, r) => sum + r.videoPrompt.promptScore, 0) / results.length
        : 0;

      return NextResponse.json({
        success: true,
        dryRun: true,
        episodeId,
        totalPrompts: results.length,
        averagePromptScore: Math.round(avgScore * 10) / 10,
        estimatedDuration: results.length * duration,
        estimatedCost: {
          kling26: `$${(results.length * duration * 0.095).toFixed(2)}`,
          wan26: `$${(results.length * duration * 0.05).toFixed(2)}`,
          prototype: `$${(results.length * duration * 0.017).toFixed(2)}`,
        },
        samplePrompts: results.slice(0, 5).map(r => ({
          shotId: r.shotId,
          variationId: r.variationId,
          shortPrompt: r.videoPrompt.shortPrompt.slice(0, 200) + "...",
          recommendedDuration: r.videoPrompt.recommendedDuration,
          promptScore: r.videoPrompt.promptScore,
          cameraMotion: r.videoPrompt.cameraMotion.type,
        })),
        allPrompts: results.map(r => ({
          shotId: r.shotId,
          variationId: r.variationId,
          shortPrompt: r.videoPrompt.shortPrompt,
          detailedPrompt: r.videoPrompt.detailedPrompt,
          negativePrompt: r.videoPrompt.negativePrompt,
          recommendedDuration: r.videoPrompt.recommendedDuration,
          cameraMotion: r.videoPrompt.cameraMotion,
          motionRegions: r.videoPrompt.motionRegions,
          promptScore: r.videoPrompt.promptScore,
          rationale: r.videoPrompt.rationale,
        })),
      });
    }

    // If not dry run, update episode with video generation status
    const updatedShots = episode.shots.map(shot => {
      const updatedVariations = shot.variations?.map(variation => {
        const key = `${shot.id}_${variation.id}`;
        const videoPrompt = videoPrompts.get(key);
        
        if (videoPrompt) {
          return {
            ...variation,
            videoStatus: "pending" as const,
            videoPrompt: {
              prompt: videoPrompt.shortPrompt,
              negativePrompt: videoPrompt.negativePrompt,
              duration: videoPrompt.recommendedDuration,
              fps: 24,
              aspectRatio: "21:9",
              cameraMotion: videoPrompt.cameraMotion.type,
              provider: "kling-2.6",
              estimatedCost: 0.65,
              modelConfig: {
                mode: "pro",
                motion_amount: 0.5,
              },
            },
            videoDuration: videoPrompt.recommendedDuration,
            videoCameraMotion: videoPrompt.cameraMotion.type,
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

    // Calculate stats
    const avgScore = results.length > 0
      ? results.reduce((sum, r) => sum + r.videoPrompt.promptScore, 0) / results.length
      : 0;

    const response = {
      success: true,
      dryRun: false,
      episodeId,
      videosQueued: results.length,
      averagePromptScore: Math.round(avgScore * 10) / 10,
      estimatedDuration: results.length * duration,
      estimatedCost: {
        kling26: `$${(results.length * duration * 0.095).toFixed(2)}`,
      },
      message: `${results.length} videos queued for generation. Use the video batch generation endpoint to start actual generation.`,
      queuedItems: results.map(r => ({
        shotId: r.shotId,
        variationId: r.variationId,
        duration: r.videoPrompt.recommendedDuration,
        cameraMotion: r.videoPrompt.cameraMotion.type,
      })),
    };

    console.log(`[VideoGen] Done: ${results.length} videos queued`);

    return NextResponse.json(response);

  } catch (error) {
    console.error("[VideoGen] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/video/generate-episode?episodeId=ep0
 * Get video generation status for episode
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

  // Count video statuses
  let pending = 0;
  let generating = 0;
  let completed = 0;
  let failed = 0;
  let noImage = 0;

  for (const shot of episode.shots) {
    for (const variation of (shot.variations || [])) {
      if (variation.status !== "completed" || !variation.imageUrl) {
        noImage++;
        continue;
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
    videoStats: {
      pending,
      generating,
      completed,
      failed,
      noImage,
      total: pending + generating + completed + failed,
      readyForVideo: pending + generating + completed + failed,
    },
    completionPercent: (completed / (pending + generating + completed + failed || 1)) * 100,
  });
}
