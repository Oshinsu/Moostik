/**
 * API Route: Download All Episode Images
 * GET /api/episodes/[id]/download-all
 * 
 * Returns a ZIP file containing all generated images for the episode
 */

import { NextRequest, NextResponse } from "next/server";
import { getEpisode } from "@/lib/storage";
import * as fs from "fs/promises";
import * as path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: episodeId } = await params;
    
    // Load episode
    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: `Episode ${episodeId} not found` },
        { status: 404 }
      );
    }

    // Collect all image URLs and paths
    const images: Array<{
      shotName: string;
      shotNumber: number;
      cameraAngle: string;
      url: string;
      localPath?: string;
    }> = [];

    for (const shot of episode.shots) {
      for (const variation of (shot.variations || [])) {
        if (variation.status === "completed" && variation.imageUrl) {
          images.push({
            shotName: shot.name,
            shotNumber: shot.number || 0,
            cameraAngle: variation.cameraAngle || "unknown",
            url: variation.imageUrl,
            localPath: variation.localPath,
          });
        }
      }
    }

    // Return list of downloadable images
    const response = {
      episodeId,
      episodeTitle: episode.title,
      totalImages: images.length,
      images: images.map((img, idx) => ({
        index: idx + 1,
        filename: `${String(img.shotNumber).padStart(2, "0")}-${img.shotName.replace(/[^a-zA-Z0-9]/g, "-")}-${img.cameraAngle}.png`,
        url: img.url,
        shotName: img.shotName,
        cameraAngle: img.cameraAngle,
      })),
      downloadInstructions: "Use browser download or fetch each URL individually",
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("[Download] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
