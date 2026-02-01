import { NextRequest, NextResponse } from "next/server";
import { getEpisode, saveEpisode, deleteEpisode } from "@/lib/storage";
import { createErrorResponse, getStatusCode, NotFoundError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API:Episode");

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/episodes/[id] - Get single episode
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const episode = await getEpisode(id);

    if (!episode) {
      throw new NotFoundError("Episode", id);
    }

    return NextResponse.json(episode);
  } catch (error) {
    logger.error("GET error", error);
    return NextResponse.json(createErrorResponse(error), { status: getStatusCode(error) });
  }
}

// PUT /api/episodes/[id] - Update episode
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const episode = await getEpisode(id);

    if (!episode) {
      throw new NotFoundError("Episode", id);
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
    logger.error("PUT error", error);
    return NextResponse.json(createErrorResponse(error), { status: getStatusCode(error) });
  }
}

// DELETE /api/episodes/[id] - Delete episode
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteEpisode(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("DELETE error", error);
    return NextResponse.json(createErrorResponse(error), { status: getStatusCode(error) });
  }
}
