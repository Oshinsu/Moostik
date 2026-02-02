/**
 * API Route: Serve Local Videos
 * GET /api/videos/{episodeId}/{shotId}/{variationId}.mp4
 * 
 * Sert les vidéos stockées localement dans output/videos/
 * Similaire à /api/images/ pour les images
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  try {
    const { path: pathParts } = await params;
    
    if (!pathParts || pathParts.length < 3) {
      return NextResponse.json(
        { error: "Invalid video path" },
        { status: 400 }
      );
    }

    // Construire le chemin: output/videos/by-shot/{episodeId}/{shotId}/{filename}
    const [episodeId, shotId, filename] = pathParts;
    const videoPath = path.join(
      process.cwd(),
      "output",
      "videos",
      episodeId,
      "by-shot",
      shotId,
      filename
    );

    // Vérifier que le fichier existe
    try {
      await fs.access(videoPath);
    } catch {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Lire le fichier
    const videoBuffer = await fs.readFile(videoPath);

    // Déterminer le content-type
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: Record<string, string> = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mov": "video/quicktime",
    };
    const contentType = contentTypes[ext] || "video/mp4";

    // Retourner avec les bons headers
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": videoBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    console.error("[API/Videos] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
