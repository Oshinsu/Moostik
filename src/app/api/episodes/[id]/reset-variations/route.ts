/**
 * API Route: Reset Variations Status
 * POST /api/episodes/[id]/reset-variations
 * 
 * Resets stuck variations from "generating" to "pending" to allow regeneration
 */

import { NextRequest, NextResponse } from "next/server";
import { getEpisode, saveEpisode } from "@/lib/storage";

interface ResetRequest {
  shotIds?: string[]; // Optional: specific shots, otherwise all
  resetStatus?: "pending" | "failed"; // What status to reset TO
  fromStatuses?: Array<"generating" | "failed">; // What statuses to reset FROM
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: episodeId } = await params;
    const body: ResetRequest = await request.json();
    const { 
      shotIds,
      resetStatus = "pending",
      fromStatuses = ["generating", "failed"],
    } = body;

    console.log(`[Reset] Resetting variations for episode ${episodeId}`);

    // Load episode
    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: `Episode ${episodeId} not found` },
        { status: 404 }
      );
    }

    let resetCount = 0;
    const resetDetails: Array<{shotId: string; variationId: string; from: string; to: string}> = [];

    // Process each shot
    const updatedShots = episode.shots.map(shot => {
      // Skip if not in shotIds (when specified)
      if (shotIds && !shotIds.includes(shot.id)) {
        return shot;
      }
      
      if (!shot.variations) return shot;
      
      const updatedVariations = shot.variations.map(variation => {
        if (fromStatuses.includes(variation.status as "generating" | "failed")) {
          resetCount++;
          resetDetails.push({
            shotId: shot.id,
            variationId: variation.id,
            from: variation.status,
            to: resetStatus,
          });
          
          return {
            ...variation,
            status: resetStatus,
            imageUrl: undefined,
            localPath: undefined,
            generatedAt: undefined,
          };
        }
        return variation;
      });
      
      // Determine shot status
      const allPending = updatedVariations.every(v => v.status === "pending");
      const allCompleted = updatedVariations.every(v => v.status === "completed");
      const shotStatus: "completed" | "pending" | "in_progress" = allCompleted ? "completed" : allPending ? "pending" : "in_progress";
      
      return {
        ...shot,
        variations: updatedVariations,
        status: shotStatus,
        updatedAt: new Date().toISOString(),
      };
    });

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
      resetCount,
      resetDetails: resetDetails.slice(0, 20), // Limit for response size
      totalReset: resetDetails.length,
    };

    console.log(`[Reset] Done: ${resetCount} variations reset to ${resetStatus}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error("[Reset] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
