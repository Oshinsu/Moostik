import { NextRequest, NextResponse } from "next/server";
import { getEpisode } from "@/lib/storage";
import { checkGenerationReadiness } from "@/lib/reference-resolver";
import type { Shot } from "@/types";

/**
 * POST /api/generate/check-readiness
 * 
 * Vérifie si les shots sont prêts pour la génération
 * en analysant les références de personnages et lieux.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { episodeId, shotIds } = body as {
      episodeId: string;
      shotIds?: string[];
    };

    if (!episodeId) {
      return NextResponse.json(
        { error: "Missing required field: episodeId" },
        { status: 400 }
      );
    }

    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    // Filter shots if specific IDs provided
    let shotsToCheck: Shot[] = episode.shots;
    if (shotIds && shotIds.length > 0) {
      shotsToCheck = episode.shots.filter(s => shotIds.includes(s.id));
    }

    if (shotsToCheck.length === 0) {
      return NextResponse.json({
        ready: true,
        canProceedWithWarnings: true,
        warnings: [],
        errors: [],
        missingCharacterRefs: [],
        missingLocationRefs: [],
        unvalidatedRefs: [],
        stats: {
          totalShots: 0,
          totalCharacters: 0,
          totalLocations: 0,
          charactersWithRefs: 0,
          locationsWithRefs: 0,
          validatedCharacters: 0,
          validatedLocations: 0,
        },
      });
    }

    // Check readiness
    const readinessCheck = await checkGenerationReadiness(shotsToCheck);

    return NextResponse.json(readinessCheck);

  } catch (error) {
    console.error("[CheckReadiness] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Check readiness failed" },
      { status: 500 }
    );
  }
}
