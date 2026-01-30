import { NextRequest, NextResponse } from "next/server";
import { addShot, getEpisode } from "@/lib/storage";
import { validateId, validateShotInput } from "@/lib/validation";
import { apiLogger as logger } from "@/lib/logger";
import {
  NotFoundError,
  isMoostikError,
  createErrorResponse,
  getStatusCode,
} from "@/lib/errors";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/episodes/[id]/shots - Add new shot
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const episodeId = validateId(id, "episode");

    const body = await request.json();
    const validated = validateShotInput(body);

    const shot = await addShot(
      episodeId,
      validated.name,
      validated.description,
      validated.characterIds,
      validated.locationIds
    );

    if (!shot) {
      throw new NotFoundError("Episode", episodeId);
    }

    logger.info("Shot created", {
      episodeId,
      shotId: shot.id,
      name: shot.name,
    });

    return NextResponse.json(shot, { status: 201 });
  } catch (error) {
    if (isMoostikError(error)) {
      logger.warn("Shot creation failed", { error: error.message });
    } else {
      logger.error("Failed to add shot", error);
    }

    return NextResponse.json(
      createErrorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}

// GET /api/episodes/[id]/shots - Get all shots for episode
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const episodeId = validateId(id, "episode");

    const episode = await getEpisode(episodeId);

    if (!episode) {
      throw new NotFoundError("Episode", episodeId);
    }

    logger.debug("Shots fetched", {
      episodeId,
      count: episode.shots.length,
    });

    return NextResponse.json(episode.shots);
  } catch (error) {
    if (isMoostikError(error)) {
      logger.warn("Failed to fetch shots", { error: error.message });
    } else {
      logger.error("Failed to fetch shots", error);
    }

    return NextResponse.json(
      createErrorResponse(error),
      { status: getStatusCode(error) }
    );
  }
}
