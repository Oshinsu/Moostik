/**
 * API Route: Complete Episode Data
 * POST /api/episodes/[id]/complete
 * 
 * Adds missing variations and durations to all shots
 * Prepares episode for full generation
 */

import { NextRequest, NextResponse } from "next/server";
import { getEpisode, saveEpisode } from "@/lib/storage";
import type { Shot, Variation } from "@/types";

interface CompleteRequest {
  /** Add pending variations to shots without any */
  addMissingVariations?: boolean;
  /** Add duration to all shots based on scene type */
  addDurations?: boolean;
  /** Default duration for shots (overrides scene-based) */
  defaultDuration?: number;
}

// Scene type to recommended duration mapping
const SCENE_DURATIONS: Record<string, number> = {
  genocide: 10,      // Emotional impact needs time
  emotional: 10,     // Let feelings breathe
  battle: 5,         // Fast-paced action
  bar_scene: 10,     // Atmospheric, slow
  training: 5,       // Dynamic movement
  establishing: 10,  // World building
  flashback: 10,     // Dreamy, slow
  transition: 5,     // Quick passage
};

// Camera angles for variations
const CAMERA_ANGLES = ["extreme_wide", "wide", "medium", "close_up", "low_angle"] as const;
type CameraAngle = typeof CAMERA_ANGLES[number];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: episodeId } = await params;
    const body: CompleteRequest = await request.json();
    const { 
      addMissingVariations = true, 
      addDurations = true,
      defaultDuration 
    } = body;

    console.log(`[Complete] Completing episode ${episodeId}`);

    // Load episode
    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: `Episode ${episodeId} not found` },
        { status: 404 }
      );
    }

    let variationsAdded = 0;
    let durationsAdded = 0;
    const timestamp = Date.now();

    // Process each shot
    const updatedShots = episode.shots.map((shot, shotIndex) => {
      const updatedShot = { ...shot };

      // Add duration if missing
      if (addDurations && !updatedShot.durationSeconds) {
        updatedShot.durationSeconds = defaultDuration || 
          SCENE_DURATIONS[shot.sceneType || "establishing"] || 
          10;
        durationsAdded++;
      }

      // Add variations if missing
      if (addMissingVariations && (!shot.variations || shot.variations.length === 0)) {
        const newVariations: Variation[] = CAMERA_ANGLES.map((angle, angleIndex) => ({
          id: `var-${angle}-${timestamp}-${shotIndex}`,
          cameraAngle: angle as CameraAngle,
          status: "pending" as const,
        }));
        
        updatedShot.variations = newVariations;
        updatedShot.status = "pending";
        variationsAdded += CAMERA_ANGLES.length;
        
        console.log(`[Complete] Added ${CAMERA_ANGLES.length} variations to shot ${shot.id}`);
      }

      return updatedShot;
    });

    // Update episode
    const updatedEpisode = {
      ...episode,
      shots: updatedShots,
      updatedAt: new Date().toISOString(),
    };

    await saveEpisode(updatedEpisode);

    // Calculate stats
    const totalVariations = updatedShots.reduce(
      (sum, shot) => sum + (shot.variations?.length || 0), 
      0
    );
    const pendingVariations = updatedShots.reduce(
      (sum, shot) => sum + (shot.variations?.filter(v => v.status === "pending").length || 0),
      0
    );
    const totalDuration = updatedShots.reduce(
      (sum, shot) => sum + (shot.durationSeconds || 0),
      0
    );

    const response = {
      success: true,
      episodeId,
      changes: {
        variationsAdded,
        durationsAdded,
      },
      stats: {
        totalShots: updatedShots.length,
        totalVariations,
        pendingVariations,
        completedVariations: totalVariations - pendingVariations,
        totalDurationSeconds: totalDuration,
        estimatedRuntime: `${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toString().padStart(2, '0')}`,
      },
      shotsWithDurations: updatedShots.map(s => ({
        id: s.id,
        name: s.name,
        sceneType: s.sceneType,
        durationSeconds: s.durationSeconds,
        variationCount: s.variations?.length || 0,
        pendingCount: s.variations?.filter(v => v.status === "pending").length || 0,
      })),
    };

    console.log(`[Complete] Done: ${variationsAdded} variations added, ${durationsAdded} durations set`);
    console.log(`[Complete] Total runtime: ${response.stats.estimatedRuntime}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error("[Complete] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/episodes/[id]/complete
 * Get completion status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: episodeId } = await params;

    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: `Episode ${episodeId} not found` },
        { status: 404 }
      );
    }

    const shotsWithoutVariations = episode.shots.filter(
      s => !s.variations || s.variations.length === 0
    );
    const shotsWithoutDuration = episode.shots.filter(
      s => !s.durationSeconds
    );
    const pendingVariations = episode.shots.reduce(
      (sum, shot) => sum + (shot.variations?.filter(v => v.status === "pending").length || 0),
      0
    );
    const totalVariations = episode.shots.reduce(
      (sum, shot) => sum + (shot.variations?.length || 0),
      0
    );

    return NextResponse.json({
      episodeId,
      isComplete: shotsWithoutVariations.length === 0 && shotsWithoutDuration.length === 0,
      missing: {
        variationsCount: shotsWithoutVariations.length,
        durationsCount: shotsWithoutDuration.length,
        shotsNeedingVariations: shotsWithoutVariations.map(s => s.id),
        shotsNeedingDuration: shotsWithoutDuration.map(s => s.id),
      },
      progress: {
        totalShots: episode.shots.length,
        totalVariations,
        pendingVariations,
        completedVariations: totalVariations - pendingVariations,
        completionPercent: totalVariations > 0 
          ? Math.round(((totalVariations - pendingVariations) / totalVariations) * 100)
          : 0,
      },
    });

  } catch (error) {
    console.error("[Complete] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
