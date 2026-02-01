import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import path from "path";
import type { GeneratedImage, GeneratedImagesResponse } from "@/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/episodes/[id]/generated-images
 * Scanne le dossier output/images/[id]/ pour trouver toutes les images générées
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: episodeId } = await context.params;
    const outputDir = path.join(process.cwd(), "output", "images", episodeId);
    const images: GeneratedImage[] = [];

    try {
      const entries = await readdir(outputDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith(".png")) {
          // Image legacy (shot-001.png, shot-002.png, etc.)
          const filePath = path.join(outputDir, entry.name);
          const stats = await stat(filePath);
          
          // Extraire le numéro du shot du nom de fichier
          const shotMatch = entry.name.match(/shot-(\d+)\.png/);
          const shotNumber = shotMatch ? parseInt(shotMatch[1]) : null;

          images.push({
            id: `legacy-${entry.name}`,
            url: `/api/images/${episodeId}/${entry.name}`,
            localPath: filePath,
            shotId: shotNumber ? `shot-${String(shotNumber).padStart(3, "0")}` : null,
            variationId: null,
            cameraAngle: null,
            filename: entry.name,
            size: stats.size,
            createdAt: stats.mtime.toISOString(),
            type: "legacy",
          });
        } else if (entry.isDirectory() && entry.name.startsWith("shot-")) {
          // Dossier de shot (shot-1-1769759484234/)
          const shotDir = path.join(outputDir, entry.name);
          const shotId = entry.name;

          try {
            const shotFiles = await readdir(shotDir);

            for (const shotFile of shotFiles) {
              if (shotFile.endsWith(".png")) {
                const filePath = path.join(shotDir, shotFile);
                const stats = await stat(filePath);

                // Extraire l'angle de caméra du nom (var-extreme_wide-1769759484235.png)
                const angleMatch = shotFile.match(/var-([a-z_]+)-/);
                const cameraAngle = angleMatch ? angleMatch[1] : null;

                // Extraire l'ID de variation
                const varIdMatch = shotFile.match(/var-[a-z_]+-(\d+)\.png/);
                const variationId = varIdMatch ? `var-${angleMatch?.[1]}-${varIdMatch[1]}` : shotFile.replace(".png", "");

                images.push({
                  id: `${shotId}-${shotFile}`,
                  url: `/api/images/${episodeId}/${shotId}/${shotFile}`,
                  localPath: filePath,
                  shotId,
                  variationId,
                  cameraAngle,
                  filename: shotFile,
                  size: stats.size,
                  createdAt: stats.mtime.toISOString(),
                  type: "variation",
                });
              }
            }
          } catch {
            // Ignorer les erreurs de lecture de dossiers individuels
          }
        }
      }
    } catch (error) {
      // Le dossier n'existe pas encore
      return NextResponse.json({
        images: [],
        stats: {
          total: 0,
          legacy: 0,
          variations: 0,
          totalSize: 0,
        },
      });
    }

    // Trier par date de création (plus récent en premier)
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculer les stats
    const stats = {
      total: images.length,
      legacy: images.filter((i) => i.type === "legacy").length,
      variations: images.filter((i) => i.type === "variation").length,
      totalSize: images.reduce((sum, i) => sum + i.size, 0),
    };

    return NextResponse.json({ images, stats });
  } catch (error) {
    console.error("[Generated Images] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to scan images" },
      { status: 500 }
    );
  }
}
