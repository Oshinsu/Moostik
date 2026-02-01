/**
 * API Route: Fix Image URLs
 * POST /api/episodes/[id]/fix-image-urls
 * 
 * Updates all image URLs to use local API paths instead of expired Replicate URLs
 */

import { NextRequest, NextResponse } from "next/server";
import { getEpisode, saveEpisode } from "@/lib/storage";
import * as fs from "fs/promises";
import * as path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: episodeId } = await params;

    console.log(`[FixURLs] Fixing image URLs for episode ${episodeId}`);

    // Load episode
    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: `Episode ${episodeId} not found` },
        { status: 404 }
      );
    }

    let fixedCount = 0;
    let notFoundCount = 0;
    const fixedDetails: Array<{ shotId: string; variationId: string; oldUrl: string; newUrl: string }> = [];

    // Update each shot's variations
    const updatedShots = await Promise.all(
      episode.shots.map(async (shot) => {
        const updatedVariations = await Promise.all(
          (shot.variations || []).map(async (variation) => {
            // Check if local path exists
            if (variation.localPath) {
              try {
                await fs.access(variation.localPath);
                
                // Convert local path to API URL
                // localPath: /Users/.../output/images/ep0/shot-xxx/var-xxx.png
                // API URL: /api/images/ep0/shot-xxx/var-xxx.png
                const relativePath = variation.localPath.replace(
                  /.*\/output\/images\//,
                  ""
                );
                const newUrl = `/api/images/${relativePath}`;
                
                if (variation.imageUrl !== newUrl) {
                  fixedDetails.push({
                    shotId: shot.id,
                    variationId: variation.id,
                    oldUrl: variation.imageUrl || "none",
                    newUrl,
                  });
                  fixedCount++;
                  
                  return {
                    ...variation,
                    imageUrl: newUrl,
                  };
                }
              } catch {
                notFoundCount++;
              }
            }
            return variation;
          })
        );

        return {
          ...shot,
          variations: updatedVariations,
        };
      })
    );

    // Save updated episode
    const updatedEpisode = {
      ...episode,
      shots: updatedShots,
      updatedAt: new Date().toISOString(),
    };

    await saveEpisode(updatedEpisode);

    const response = {
      success: true,
      episodeId,
      fixedCount,
      notFoundCount,
      totalVariations: episode.shots.reduce(
        (sum, s) => sum + (s.variations?.length || 0),
        0
      ),
      sampleFixes: fixedDetails.slice(0, 5),
    };

    console.log(`[FixURLs] Fixed ${fixedCount} URLs, ${notFoundCount} not found`);

    return NextResponse.json(response);

  } catch (error) {
    console.error("[FixURLs] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
