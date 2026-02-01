import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * GET /api/images/[...path]
 * Sert les images locales du dossier output
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    // Support both /api/images/ep0/... and /api/images/images/ep0/...
    const imagePath = pathSegments[0] === "images" 
      ? join(process.cwd(), "output", ...pathSegments)
      : join(process.cwd(), "output", "images", ...pathSegments);
    
    const imageBuffer = await readFile(imagePath);
    
    // Déterminer le type MIME
    const ext = imagePath.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };
    
    const contentType = mimeTypes[ext || ''] || 'application/octet-stream';
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Image not found" },
      { status: 404 }
    );
  }
}
