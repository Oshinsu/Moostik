import { NextRequest, NextResponse } from "next/server";
import { getEpisodes, createEpisode } from "@/lib/storage";

// GET /api/episodes - List all episodes
export async function GET() {
  try {
    const episodes = await getEpisodes();
    return NextResponse.json(episodes);
  } catch (error) {
    console.error("[Episodes] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch episodes" },
      { status: 500 }
    );
  }
}

// POST /api/episodes - Create new episode
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, title, description } = body as {
      number: number;
      title: string;
      description: string;
    };

    if (typeof number !== "number" || !title) {
      return NextResponse.json(
        { error: "Missing required fields: number, title" },
        { status: 400 }
      );
    }

    const episode = await createEpisode(number, title, description || "");
    return NextResponse.json(episode, { status: 201 });
  } catch (error) {
    console.error("[Episodes] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create episode" },
      { status: 500 }
    );
  }
}
