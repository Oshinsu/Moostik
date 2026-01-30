import { NextRequest, NextResponse } from "next/server";
import { addShot, getEpisode } from "@/lib/storage";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/episodes/[id]/shots - Add new shot
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name } = body as { name: string };

    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    const shot = await addShot(id, name);

    if (!shot) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(shot, { status: 201 });
  } catch (error) {
    console.error("[Shots] POST error:", error);
    return NextResponse.json(
      { error: "Failed to add shot" },
      { status: 500 }
    );
  }
}

// GET /api/episodes/[id]/shots - Get all shots for episode
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

    return NextResponse.json(episode.shots);
  } catch (error) {
    console.error("[Shots] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shots" },
      { status: 500 }
    );
  }
}
