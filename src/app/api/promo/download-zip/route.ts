import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import AdmZip from "adm-zip";

// ============================================================================
// SOTA NAMING CONVENTION - Janvier 2026
// Format: projet-type-nom-version-seed-resolution.ext
// Règles: lowercase, hyphens (pas underscores), pas d'espaces, max 50 chars
// ============================================================================

interface AssetNamingOptions {
  project: string;
  category: string;
  name: string;
  version?: string;
  seed?: number;
  resolution?: string;
  extension?: string;
}

function generateSOTAFilename(options: AssetNamingOptions): string {
  const {
    project = "bloodwings",
    category,
    name,
    version = "v1",
    seed,
    resolution,
    extension = "png",
  } = options;

  // Normalize: lowercase, replace spaces/underscores with hyphens
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[_\s]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .slice(0, 30);

  const parts = [
    normalize(project),
    normalize(category),
    normalize(name),
    version,
  ];

  if (seed) {
    parts.push(`seed${seed}`);
  }

  if (resolution) {
    parts.push(normalize(resolution));
  }

  return `${parts.join("-")}.${extension}`;
}

// Category folder mapping
const CATEGORY_FOLDERS: Record<string, string> = {
  logos: "01-logos",
  placeholders: "02-placeholders",
  "process-carousel": "03-process-carousel",
  "promo-images": "04-promo-images",
  sketches: "05-sketches",
  "bd-moodboard": "06-bd-moodboard",
};

// GET /api/promo/download-zip - Download all promo assets as ZIP
// Query params: ?category=logos (optional, downloads specific category)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get("category");

    // Load promo data
    const dataPath = path.join(process.cwd(), "data", "promo-assets.json");
    const data = await fs.readFile(dataPath, "utf-8");
    const promoData = JSON.parse(data);

    // Create ZIP
    const zip = new AdmZip();
    let totalFiles = 0;
    let downloadedFiles = 0;

    // Process each category
    for (const category of promoData.categories) {
      // Skip if filtering by category and this isn't it
      if (categoryFilter && category.id !== categoryFilter) {
        continue;
      }

      const folderName = CATEGORY_FOLDERS[category.id] || category.id;

      for (const shot of category.shots) {
        for (const variation of shot.variations || []) {
          totalFiles++;

          if (variation.status === "completed" && variation.imageUrl) {
            try {
              // Fetch image from URL
              const imageResponse = await fetch(variation.imageUrl);
              if (!imageResponse.ok) continue;

              const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

              // Extract metadata from prompt
              const prompt = shot.prompt || {};
              const params = prompt.parameters || {};
              const meta = prompt.meta || {};

              // Generate SOTA filename
              const filename = generateSOTAFilename({
                project: meta.project || "bloodwings",
                category: category.id,
                name: shot.name,
                version: "v1",
                seed: params.seed,
                resolution: params.render_resolution?.replace("x", "-"),
                extension: "png",
              });

              // Add to ZIP with folder structure
              zip.addFile(`bloodwings-promo-pack/${folderName}/${filename}`, imageBuffer);
              downloadedFiles++;
            } catch (error) {
              console.error(`Failed to download ${shot.name}:`, error);
            }
          }
        }
      }
    }

    // Add README with metadata
    const readmeContent = `# BLOODWINGS STUDIO - PROMO ASSETS PACK
═══════════════════════════════════════════════════════════════

Generated: ${new Date().toISOString().split("T")[0]}
Total Assets: ${downloadedFiles}/${totalFiles}

## Structure
${Object.entries(CATEGORY_FOLDERS)
  .map(([id, folder]) => `- ${folder}/`)
  .join("\n")}

## Naming Convention (SOTA Janvier 2026)
Format: projet-type-nom-version-seed-resolution.ext
- Lowercase only
- Hyphens as separators (no spaces/underscores)
- ISO 8601 dates (YYYY-MM-DD)
- Version control (v1, v2, etc.)
- Seed for reproducibility

## Credits
- Studio: Bloodwings Studio
- Project: MOOSTIK - Rise of Bloodwings
- Generation: Nano Banana 2 Pro
- Website: https://moostik.vercel.app

"We are the real vampires." 🩸

═══════════════════════════════════════════════════════════════
© 2026 Bloodwings Studio - All Rights Reserved
`;

    zip.addFile("bloodwings-promo-pack/README.txt", Buffer.from(readmeContent, "utf-8"));

    // Add manifest JSON
    const manifest = {
      generated_at: new Date().toISOString(),
      total_assets: downloadedFiles,
      categories: promoData.categories.map((cat: any) => ({
        id: cat.id,
        title: cat.title,
        folder: CATEGORY_FOLDERS[cat.id],
        assets_count: cat.shots.length,
      })),
      naming_convention: "projet-type-nom-version-seed-resolution.ext",
      project: "MOOSTIK - Rise of Bloodwings",
      studio: "Bloodwings Studio",
    };

    zip.addFile(
      "bloodwings-promo-pack/manifest.json",
      Buffer.from(JSON.stringify(manifest, null, 2), "utf-8")
    );

    // Generate ZIP buffer
    const zipBuffer = zip.toBuffer();

    // Generate filename with date
    const dateStr = new Date().toISOString().split("T")[0];
    const zipFilename = categoryFilter
      ? `bloodwings-${categoryFilter}-${dateStr}.zip`
      : `bloodwings-promo-pack-${dateStr}.zip`;

    // Return ZIP file
    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[Download ZIP] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate ZIP" },
      { status: 500 }
    );
  }
}

// POST /api/promo/download-zip - Download specific assets by IDs
export async function POST(request: NextRequest) {
  try {
    const { assetIds } = await request.json();

    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json(
        { error: "assetIds array required" },
        { status: 400 }
      );
    }

    // Load promo data
    const dataPath = path.join(process.cwd(), "data", "promo-assets.json");
    const data = await fs.readFile(dataPath, "utf-8");
    const promoData = JSON.parse(data);

    // Create ZIP
    const zip = new AdmZip();
    let downloadedFiles = 0;

    // Find and download requested assets
    for (const category of promoData.categories) {
      const folderName = CATEGORY_FOLDERS[category.id] || category.id;

      for (const shot of category.shots) {
        if (!assetIds.includes(shot.id)) continue;

        for (const variation of shot.variations || []) {
          if (variation.status === "completed" && variation.imageUrl) {
            try {
              const imageResponse = await fetch(variation.imageUrl);
              if (!imageResponse.ok) continue;

              const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

              const prompt = shot.prompt || {};
              const params = prompt.parameters || {};
              const meta = prompt.meta || {};

              const filename = generateSOTAFilename({
                project: meta.project || "bloodwings",
                category: category.id,
                name: shot.name,
                version: "v1",
                seed: params.seed,
                resolution: params.render_resolution?.replace("x", "-"),
                extension: "png",
              });

              zip.addFile(`bloodwings-selection/${folderName}/${filename}`, imageBuffer);
              downloadedFiles++;
            } catch (error) {
              console.error(`Failed to download ${shot.name}:`, error);
            }
          }
        }
      }
    }

    if (downloadedFiles === 0) {
      return NextResponse.json(
        { error: "No completed assets found for the given IDs" },
        { status: 404 }
      );
    }

    const zipBuffer = zip.toBuffer();
    const dateStr = new Date().toISOString().split("T")[0];

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="bloodwings-selection-${dateStr}.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[Download ZIP POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate ZIP" },
      { status: 500 }
    );
  }
}
