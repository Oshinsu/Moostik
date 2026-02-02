/**
 * API Route: Download Proxy
 * GET /api/download?url=...&filename=...
 * 
 * Proxy pour télécharger des fichiers et contourner les problèmes CORS
 * Force le Content-Disposition: attachment pour déclencher le téléchargement
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const filename = searchParams.get("filename") || "download.png";

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    let fileBuffer: Buffer;
    let contentType = "application/octet-stream";

    // Vérifier si c'est un fichier local (chemin relatif ou /api/images)
    if (url.startsWith("/api/images") || url.startsWith("/output")) {
      // Fichier local - lire depuis le système de fichiers
      const localPath = url.startsWith("/api/images")
        ? url.replace("/api/images/", "output/")
        : url.replace(/^\//, "");

      const fullPath = path.join(process.cwd(), localPath);

      try {
        fileBuffer = await fs.readFile(fullPath);

        // Déterminer le content-type
        const ext = path.extname(fullPath).toLowerCase();
        const mimeTypes: Record<string, string> = {
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".webp": "image/webp",
          ".gif": "image/gif",
          ".mp4": "video/mp4",
          ".webm": "video/webm",
        };
        contentType = mimeTypes[ext] || "application/octet-stream";
      } catch (fsError) {
        console.error("File not found locally:", fullPath);
        // Fallback: essayer de fetch depuis l'URL complète
        const response = await fetch(new URL(url, request.url).toString());
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        fileBuffer = Buffer.from(await response.arrayBuffer());
        contentType = response.headers.get("content-type") || contentType;
      }
    } else if (url.startsWith("http://") || url.startsWith("https://")) {
      // URL externe - fetch
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      fileBuffer = Buffer.from(await response.arrayBuffer());
      contentType = response.headers.get("content-type") || contentType;
    } else {
      // URL relative - construire l'URL complète
      const fullUrl = new URL(url, request.url).toString();
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      fileBuffer = Buffer.from(await response.arrayBuffer());
      contentType = response.headers.get("content-type") || contentType;
    }

    // Nettoyer le filename
    const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-");

    // Retourner avec headers de téléchargement
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${cleanFilename}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Download failed" },
      { status: 500 }
    );
  }
}
