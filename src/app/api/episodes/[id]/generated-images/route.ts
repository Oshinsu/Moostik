import { NextRequest, NextResponse } from "next/server";
import { getEpisode } from "@/lib/storage";
import type { GeneratedImage } from "@/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/episodes/[id]/generated-images
 * Retourne les images générées depuis les données de l'épisode
 * Compatible avec le déploiement serverless (Vercel/Netlify)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: episodeId } = await context.params;
    
    // Charger l'épisode depuis le JSON
    const episode = await getEpisode(episodeId);
    
    if (!episode) {
      return NextResponse.json({
        images: [],
        stats: { total: 0, legacy: 0, variations: 0, totalSize: 0 },
      });
    }

    const images: GeneratedImage[] = [];

    // Parcourir tous les shots et leurs variations
    for (const shot of episode.shots || []) {
      for (const variation of shot.variations || []) {
        if (variation.imageUrl && variation.status === "completed") {
          images.push({
            id: variation.id,
            url: variation.imageUrl,
            localPath: variation.localPath || null,
            shotId: shot.id,
            variationId: variation.id,
            cameraAngle: variation.cameraAngle,
            filename: `${shot.id}-${variation.cameraAngle}.png`,
            size: 0, // Non disponible sans accès au fichier
            createdAt: variation.generatedAt || shot.createdAt,
            type: "variation",
          });
        }
      }
    }

    // Trier par date de création (plus récent en premier)
    images.sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    // Calculer les stats
    const stats = {
      total: images.length,
      legacy: 0,
      variations: images.length,
      totalSize: 0,
    };

    return NextResponse.json({ images, stats });
  } catch (error) {
    console.error("[Generated Images] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load images" },
      { status: 500 }
    );
  }
}
