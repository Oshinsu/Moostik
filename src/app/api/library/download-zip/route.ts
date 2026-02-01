import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import AdmZip from "adm-zip";

// ============================================================================
// SOTA NAMING CONVENTION - Janvier 2026
// Format: projet-type-nom-version-seed-resolution.ext
// ============================================================================

function generateSOTAFilename(options: {
  project?: string;
  type: string;
  name: string;
  seed?: number;
  resolution?: string;
  extension?: string;
}): string {
  const {
    project = "bloodwings",
    type,
    name,
    seed,
    resolution,
    extension = "png",
  } = options;

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[_\s]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .slice(0, 40);

  const parts = [normalize(project), normalize(type), normalize(name), "v1"];

  if (seed) {
    parts.push(`seed${seed}`);
  }

  if (resolution) {
    parts.push(normalize(resolution));
  }

  return `${parts.join("-")}.${extension}`;
}

// Folder structure
const TYPE_FOLDERS: Record<string, string> = {
  character: "01-personnages",
  location: "02-lieux",
  shot: "03-shots",
  promo: "04-promo",
};

// GET /api/library/download-zip
// Query params: ?type=character|location|shot|promo (optional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");

    const zip = new AdmZip();
    let totalFiles = 0;
    let downloadedFiles = 0;

    // ========================================================================
    // LOAD ALL IMAGES
    // ========================================================================

    // 1. Load references (characters and locations)
    const dataDir = path.join(process.cwd(), "data");
    
    // Characters
    if (!typeFilter || typeFilter === "character") {
      try {
        const charsData = JSON.parse(
          await fs.readFile(path.join(dataDir, "characters.json"), "utf-8")
        );

        for (const char of charsData) {
          for (let i = 0; i < (char.referenceImages || []).length; i++) {
            totalFiles++;
            const imageUrl = char.referenceImages[i];
            if (!imageUrl) continue;

            try {
              const response = await fetch(imageUrl);
              if (!response.ok) continue;

              const buffer = Buffer.from(await response.arrayBuffer());
              const filename = generateSOTAFilename({
                type: "character",
                name: char.name,
                extension: "png",
              });

              zip.addFile(
                `bloodwings-library/${TYPE_FOLDERS.character}/${filename}`,
                buffer
              );
              downloadedFiles++;
            } catch (e) {
              console.error(`Failed to download character ${char.name}:`, e);
            }
          }
        }
      } catch (e) {
        console.log("No characters.json found");
      }
    }

    // Locations
    if (!typeFilter || typeFilter === "location") {
      try {
        const locsData = JSON.parse(
          await fs.readFile(path.join(dataDir, "locations.json"), "utf-8")
        );

        for (const loc of locsData) {
          for (let i = 0; i < (loc.referenceImages || []).length; i++) {
            totalFiles++;
            const imageUrl = loc.referenceImages[i];
            if (!imageUrl) continue;

            try {
              const response = await fetch(imageUrl);
              if (!response.ok) continue;

              const buffer = Buffer.from(await response.arrayBuffer());
              const filename = generateSOTAFilename({
                type: "location",
                name: loc.name,
                extension: "png",
              });

              zip.addFile(
                `bloodwings-library/${TYPE_FOLDERS.location}/${filename}`,
                buffer
              );
              downloadedFiles++;
            } catch (e) {
              console.error(`Failed to download location ${loc.name}:`, e);
            }
          }
        }
      } catch (e) {
        console.log("No locations.json found");
      }
    }

    // 2. Load episode shots
    if (!typeFilter || typeFilter === "shot") {
      const episodesDir = path.join(dataDir, "episodes");
      try {
        const episodes = await fs.readdir(episodesDir);

        for (const epFile of episodes) {
          if (!epFile.endsWith(".json")) continue;

          const epData = JSON.parse(
            await fs.readFile(path.join(episodesDir, epFile), "utf-8")
          );

          for (const shot of epData.shots || []) {
            for (const variation of shot.variations || []) {
              if (variation.status !== "completed" || !variation.imageUrl) continue;
              totalFiles++;

              try {
                const response = await fetch(variation.imageUrl);
                if (!response.ok) continue;

                const buffer = Buffer.from(await response.arrayBuffer());
                const filename = generateSOTAFilename({
                  project: `ep${epData.number}`,
                  type: "shot",
                  name: `${shot.name}-${variation.cameraAngle}`,
                  seed: shot.prompt?.parameters?.seed,
                  extension: "png",
                });

                zip.addFile(
                  `bloodwings-library/${TYPE_FOLDERS.shot}/ep${epData.number}/${filename}`,
                  buffer
                );
                downloadedFiles++;
              } catch (e) {
                console.error(`Failed to download shot ${shot.name}:`, e);
              }
            }
          }
        }
      } catch (e) {
        console.log("No episodes directory found");
      }
    }

    // 3. Load promo assets
    if (!typeFilter || typeFilter === "promo") {
      try {
        const promoData = JSON.parse(
          await fs.readFile(path.join(dataDir, "promo-assets.json"), "utf-8")
        );

        for (const category of promoData.categories || []) {
          for (const shot of category.shots || []) {
            for (const variation of shot.variations || []) {
              if (variation.status !== "completed" || !variation.imageUrl) continue;
              totalFiles++;

              try {
                const response = await fetch(variation.imageUrl);
                if (!response.ok) continue;

                const buffer = Buffer.from(await response.arrayBuffer());
                const filename = generateSOTAFilename({
                  type: category.id,
                  name: shot.name,
                  seed: shot.prompt?.parameters?.seed,
                  resolution: shot.prompt?.parameters?.render_resolution?.replace("x", "-"),
                  extension: "png",
                });

                zip.addFile(
                  `bloodwings-library/${TYPE_FOLDERS.promo}/${category.id}/${filename}`,
                  buffer
                );
                downloadedFiles++;
              } catch (e) {
                console.error(`Failed to download promo ${shot.name}:`, e);
              }
            }
          }
        }
      } catch (e) {
        console.log("No promo-assets.json found");
      }
    }

    // ========================================================================
    // ADD METADATA FILES
    // ========================================================================

    // README
    const readme = `# BLOODWINGS STUDIO - LIBRARY EXPORT
═══════════════════════════════════════════════════════════════

Generated: ${new Date().toISOString().split("T")[0]}
Total Assets: ${downloadedFiles}/${totalFiles}
Filter: ${typeFilter || "ALL"}

## Structure
${Object.entries(TYPE_FOLDERS)
  .map(([type, folder]) => `- ${folder}/`)
  .join("\n")}

## Naming Convention (SOTA Janvier 2026)
Format: projet-type-nom-version-seed-resolution.ext
- Lowercase only
- Hyphens as separators
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

    zip.addFile("bloodwings-library/README.txt", Buffer.from(readme, "utf-8"));

    // Manifest
    const manifest = {
      generated_at: new Date().toISOString(),
      total_assets: downloadedFiles,
      filter: typeFilter || "all",
      folders: TYPE_FOLDERS,
      naming_convention: "projet-type-nom-version-seed-resolution.ext",
      project: "MOOSTIK - Rise of Bloodwings",
      studio: "Bloodwings Studio",
    };

    zip.addFile(
      "bloodwings-library/manifest.json",
      Buffer.from(JSON.stringify(manifest, null, 2), "utf-8")
    );

    // ========================================================================
    // RETURN ZIP
    // ========================================================================

    const zipBuffer = zip.toBuffer();
    const dateStr = new Date().toISOString().split("T")[0];
    const zipFilename = typeFilter
      ? `bloodwings-${typeFilter}-${dateStr}.zip`
      : `bloodwings-library-${dateStr}.zip`;

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[Library ZIP] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate ZIP" },
      { status: 500 }
    );
  }
}
