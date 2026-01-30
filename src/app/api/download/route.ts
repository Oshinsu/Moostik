import { NextRequest, NextResponse } from "next/server";
import { readFile, readdir, stat } from "fs/promises";
import path from "path";
import JSZip from "jszip";
import { getEpisode } from "@/lib/storage";

// GET /api/download?episodeId=ep0 - Download episode as ZIP
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get("episodeId");

    if (!episodeId) {
      return NextResponse.json(
        { error: "Missing required param: episodeId" },
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

    const imagesDir = path.join(
      process.cwd(),
      "output",
      "images",
      episodeId
    );

    // Check if images directory exists
    try {
      await stat(imagesDir);
    } catch {
      return NextResponse.json(
        { error: "No images found for this episode" },
        { status: 404 }
      );
    }

    const zip = new JSZip();

    // Add episode metadata
    zip.file(
      "episode.json",
      JSON.stringify(episode, null, 2)
    );

    // Add all images
    const files = await readdir(imagesDir);
    const imageFiles = files.filter((f) =>
      [".png", ".jpg", ".jpeg", ".webp"].some((ext) =>
        f.toLowerCase().endsWith(ext)
      )
    );

    for (const file of imageFiles) {
      const filePath = path.join(imagesDir, file);
      const content = await readFile(filePath);
      zip.file(`images/${file}`, content);
    }

    // Generate ZIP
    const zipContent = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    // Return as downloadable file
    return new Response(zipContent, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${episodeId}-${episode.title.replace(/[^a-z0-9]/gi, "_")}.zip"`,
      },
    });
  } catch (error) {
    console.error("[Download] Error:", error);
    return NextResponse.json(
      { error: "Failed to create download" },
      { status: 500 }
    );
  }
}
