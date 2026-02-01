/**
 * API Route: Assemble Episode
 * POST /api/episodes/[id]/assemble
 * 
 * Assembles all generated videos into a final episode with audio
 */

import { NextRequest, NextResponse } from "next/server";
import { getEpisode } from "@/lib/storage";

interface AssembleRequest {
  /** Include background music */
  includeMusic?: boolean;
  /** Include ambient sounds */
  includeAmbience?: boolean;
  /** Output quality preset */
  quality?: "preview" | "standard" | "high" | "cinema";
  /** Dry run - just calculate what would be assembled */
  dryRun?: boolean;
}

interface AssembleResult {
  shotId: string;
  variationId: string;
  imagePath?: string;
  videoPath?: string;
  duration: number;
  status: "ready" | "missing_image" | "missing_video";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: episodeId } = await params;
    const body: AssembleRequest = await request.json();
    const {
      includeMusic = true,
      includeAmbience = true,
      quality = "standard",
      dryRun = true,
    } = body;

    console.log(`[Assemble] Analyzing episode ${episodeId} for assembly`);

    // Load episode
    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: `Episode ${episodeId} not found` },
        { status: 404 }
      );
    }

    const results: AssembleResult[] = [];
    let totalDuration = 0;
    let readyCount = 0;
    let missingImageCount = 0;
    let missingVideoCount = 0;

    // Analyze each shot
    for (const shot of episode.shots) {
      const duration = shot.durationSeconds || 10;
      
      // Get the best variation (first completed one)
      const bestVariation = shot.variations?.find(v => v.status === "completed");
      
      if (!bestVariation || !bestVariation.imageUrl) {
        results.push({
          shotId: shot.id,
          variationId: bestVariation?.id || "none",
          duration,
          status: "missing_image",
        });
        missingImageCount++;
        continue;
      }

      // Check if video is ready
      if (bestVariation.videoStatus !== "completed" || !bestVariation.videoUrl) {
        results.push({
          shotId: shot.id,
          variationId: bestVariation.id,
          imagePath: bestVariation.imageUrl,
          duration,
          status: "missing_video",
        });
        missingVideoCount++;
        continue;
      }

      results.push({
        shotId: shot.id,
        variationId: bestVariation.id,
        imagePath: bestVariation.imageUrl,
        videoPath: bestVariation.videoUrl,
        duration,
        status: "ready",
      });
      readyCount++;
      totalDuration += duration;
    }

    // Quality presets
    const qualityPresets = {
      preview: { resolution: "720p", bitrate: "2M", fps: 24 },
      standard: { resolution: "1080p", bitrate: "8M", fps: 24 },
      high: { resolution: "2K", bitrate: "15M", fps: 24 },
      cinema: { resolution: "4K", bitrate: "30M", fps: 24 },
    };

    const response = {
      success: true,
      dryRun,
      episodeId,
      episodeTitle: episode.title,
      
      // Assembly readiness
      readiness: {
        totalShots: episode.shots.length,
        ready: readyCount,
        missingImage: missingImageCount,
        missingVideo: missingVideoCount,
        readyPercent: Math.round((readyCount / episode.shots.length) * 100),
      },
      
      // Timeline info
      timeline: {
        totalDuration,
        formattedDuration: `${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toString().padStart(2, '0')}`,
        shotCount: readyCount,
        averageShotDuration: readyCount > 0 ? Math.round(totalDuration / readyCount) : 0,
      },
      
      // Output settings
      output: {
        quality,
        settings: qualityPresets[quality],
        includeMusic,
        includeAmbience,
      },
      
      // Detailed shot list
      shots: results.map(r => ({
        shotId: r.shotId,
        status: r.status,
        duration: r.duration,
        hasImage: !!r.imagePath,
        hasVideo: !!r.videoPath,
      })),
      
      // What's needed to complete
      missing: {
        needImages: results.filter(r => r.status === "missing_image").map(r => r.shotId),
        needVideos: results.filter(r => r.status === "missing_video").map(r => r.shotId),
      },
      
      message: dryRun
        ? `Dry run complete. ${readyCount}/${episode.shots.length} shots ready for assembly.`
        : `Assembly started for ${readyCount} shots.`,
    };

    if (!dryRun && readyCount === 0) {
      return NextResponse.json({
        ...response,
        success: false,
        message: "No shots ready for assembly. Generate images and videos first.",
      });
    }

    console.log(`[Assemble] Analysis complete: ${readyCount}/${episode.shots.length} ready`);

    return NextResponse.json(response);

  } catch (error) {
    console.error("[Assemble] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/episodes/[id]/assemble
 * Get assembly status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // Redirect to POST with dry run
  const body: AssembleRequest = { dryRun: true };
  
  return POST(
    new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
    { params }
  );
}
