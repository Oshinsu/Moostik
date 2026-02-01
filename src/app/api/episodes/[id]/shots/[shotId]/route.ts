import { NextRequest, NextResponse } from "next/server";
import { updateShot, deleteShot, getEpisode } from "@/lib/storage";
import type { MoostikPrompt } from "@/types/moostik";

type RouteContext = {
  params: Promise<{ id: string; shotId: string }>;
};

// GET /api/episodes/[id]/shots/[shotId] - Get single shot
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id, shotId } = await context.params;
    const episode = await getEpisode(id);

    if (!episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    const shot = episode.shots.find((s) => s.id === shotId);
    if (!shot) {
      return NextResponse.json(
        { error: "Shot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(shot);
  } catch (error) {
    console.error("[Shot] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shot" },
      { status: 500 }
    );
  }
}

// PUT /api/episodes/[id]/shots/[shotId] - Update shot
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id, shotId } = await context.params;
    const body = await request.json();
    const { 
      name, 
      description,
      prompt, 
      status,
      sceneType,
      characterIds,
      locationIds,
      variations,
      referenceVariation,
    } = body as {
      name?: string;
      description?: string;
      prompt?: MoostikPrompt;
      status?: "pending" | "generating" | "completed" | "error";
      sceneType?: string;
      characterIds?: string[];
      locationIds?: string[];
      variations?: unknown[];
      referenceVariation?: string;
    };

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (prompt !== undefined) updates.prompt = prompt;
    if (status !== undefined) updates.status = status;
    if (sceneType !== undefined) updates.sceneType = sceneType;
    if (characterIds !== undefined) updates.characterIds = characterIds;
    if (locationIds !== undefined) updates.locationIds = locationIds;
    if (variations !== undefined) updates.variations = variations;
    if (referenceVariation !== undefined) updates.referenceVariation = referenceVariation;

    console.log(`[Shot] Updating shot ${shotId} with fields:`, Object.keys(updates));

    const shot = await updateShot(id, shotId, updates);

    if (!shot) {
      return NextResponse.json(
        { error: "Shot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(shot);
  } catch (error) {
    console.error("[Shot] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update shot" },
      { status: 500 }
    );
  }
}

// DELETE /api/episodes/[id]/shots/[shotId] - Delete shot
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id, shotId } = await context.params;
    const success = await deleteShot(id, shotId);

    if (!success) {
      return NextResponse.json(
        { error: "Shot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Shot] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete shot" },
      { status: 500 }
    );
  }
}
