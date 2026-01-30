import { NextRequest, NextResponse } from "next/server";
import { getEpisode, saveEpisode, deleteEpisode } from "@/lib/storage";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/episodes/[id] - Get single episode
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const episode = await getEpisode(id);

    if (!episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(episode);
  } catch (error) {
    console.error("[Episode] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch episode" },
      { status: 500 }
    );
  }
}

// PUT /api/episodes/[id] - Update episode
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const episode = await getEpisode(id);

    if (!episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description } = body as {
      title?: string;
      description?: string;
    };

    if (title !== undefined) episode.title = title;
    if (description !== undefined) episode.description = description;

    await saveEpisode(episode);
    return NextResponse.json(episode);
  } catch (error) {
    console.error("[Episode] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update episode" },
      { status: 500 }
    );
  }
}

// DELETE /api/episodes/[id] - Delete episode
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteEpisode(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Episode] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete episode" },
      { status: 500 }
    );
  }
}
