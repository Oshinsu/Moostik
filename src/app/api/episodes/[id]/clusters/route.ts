import { NextRequest, NextResponse } from "next/server";
import { getEpisode } from "@/lib/storage";
import { analyzeEpisode } from "@/lib/scene-cluster-manager";
import type { Episode, Act } from "@/types";

/**
 * GET /api/episodes/[id]/clusters
 * 
 * Analyse l'épisode et retourne les clusters de scènes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const episode = await getEpisode(id);

    if (!episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    // Cast episode to include optional acts
    const episodeWithActs = episode as Episode & { acts?: Act[] };

    // Analyze episode to get clusters
    const analysis = await analyzeEpisode(episodeWithActs);

    return NextResponse.json({
      episodeId: analysis.episodeId,
      clusters: analysis.clusters,
      actClusters: analysis.actClusters,
      locationClusters: analysis.locationClusters,
      characterClusters: analysis.characterClusters,
      unclustered: analysis.unclustered,
      stats: {
        totalShots: analysis.totalShots,
        totalClusters: analysis.totalClusters,
        actClustersCount: analysis.actClusters.length,
        locationClustersCount: analysis.locationClusters.length,
        characterClustersCount: analysis.characterClusters.length,
      }
    });

  } catch (error) {
    console.error("[Clusters] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze clusters" },
      { status: 500 }
    );
  }
}
