import { NextRequest, NextResponse } from "next/server";
import { getEpisodes, createEpisode } from "@/lib/storage";
import { validateEpisodeInput } from "@/lib/validation";
import { apiLogger as logger } from "@/lib/logger";
import {
  isMoostikError,
  createErrorResponse,
  getStatusCode,
} from "@/lib/errors";

// GET /api/episodes - List all episodes
export async function GET() {
  const startTime = Date.now();

  try {
    const episodes = await getEpisodes();
    logger.debug("Episodes fetched", { count: episodes.length, duration: `${Date.now() - startTime}ms` });
    return NextResponse.json(episodes);
  } catch (error) {
    logger.error("Failed to fetch episodes", error);
    return NextResponse.json(
      createErrorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}

// POST /api/episodes - Create new episode
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validation avec messages d'erreur clairs
    const validated = validateEpisodeInput(body);

    const episode = await createEpisode(
      validated.number,
      validated.title,
      validated.description
    );

    logger.info("Episode created", {
      id: episode.id,
      title: episode.title,
      duration: `${Date.now() - startTime}ms`,
    });

    return NextResponse.json(episode, { status: 201 });
  } catch (error) {
    if (isMoostikError(error)) {
      logger.warn("Episode creation validation failed", { error: error.message });
    } else {
      logger.error("Failed to create episode", error);
    }

    return NextResponse.json(
      createErrorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
