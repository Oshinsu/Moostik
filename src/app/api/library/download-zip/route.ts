import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import AdmZip from "adm-zip";

// ============================================================================
// STRUCTURE DES DOSSIERS POUR LE ZIP
// ============================================================================

const FOLDER_STRUCTURE = {
  references: {
    characters: "01-References/01-Personnages",
    locations: "01-References/02-Lieux",
  },
  episodes: "02-Episodes",
  promo: "03-Promo",
  videos: "04-Videos",
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Récupère tous les fichiers d'un dossier récursivement
 */
async function getAllFiles(
  dirPath: string,
  baseDir: string = dirPath
): Promise<Array<{ path: string; relativePath: string }>> {
  const results: Array<{ path: string; relativePath: string }> = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await getAllFiles(fullPath, baseDir);
        results.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".webm"].includes(ext)) {
          results.push({
            path: fullPath,
            relativePath: path.relative(baseDir, fullPath),
          });
        }
      }
    }
  } catch {
    // Dossier n'existe pas
  }

  return results;
}

/**
 * Normalise un nom pour le ZIP
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-_.]/g, "")
    .replace(/-+/g, "-");
}

/**
 * Divise un tableau en chunks
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Ajoute des fichiers au ZIP en parallèle
 */
async function addFilesToZipParallel(
  zip: AdmZip,
  files: Array<{ path: string; relativePath: string }>,
  zipBasePath: string,
  batchSize: number = 20
): Promise<number> {
  let count = 0;
  const batches = chunkArray(files, batchSize);
  
  for (const batch of batches) {
    const results = await Promise.all(
      batch.map(async (file) => {
        try {
          const buffer = await fs.readFile(file.path);
          return { file, buffer, success: true };
        } catch {
          return { file, buffer: null, success: false };
        }
      })
    );
    
    for (const { file, buffer, success } of results) {
      if (success && buffer) {
        const zipPath = `${zipBasePath}/${file.relativePath}`;
        zip.addFile(zipPath, buffer);
        count++;
      }
    }
  }
  
  return count;
}

// ============================================================================
// MAIN API
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type"); // character, location, shot, video, all

    const zip = new AdmZip();
    const stats = {
      references: { characters: 0, locations: 0 },
      episodes: {} as Record<string, number>,
      promo: 0,
      videos: 0,
      total: 0,
    };

    const outputDir = path.join(process.cwd(), "output");
    const dataDir = path.join(process.cwd(), "data");

    console.log("[ZIP] Starting full library export...");

    // ========================================================================
    // 1. REFERENCES - Personnages et Lieux (lecture parallèle)
    // ========================================================================
    
    if (!typeFilter || typeFilter === "character" || typeFilter === "all") {
      const charRefDir = path.join(outputDir, "references", "characters");
      const charFiles = await getAllFiles(charRefDir);
      
      stats.references.characters = await addFilesToZipParallel(
        zip,
        charFiles,
        `MOOSTIK-Library/${FOLDER_STRUCTURE.references.characters}`,
        30
      );
      stats.total += stats.references.characters;
      console.log(`[ZIP] ✅ ${stats.references.characters} character references`);
    }

    if (!typeFilter || typeFilter === "location" || typeFilter === "all") {
      const locRefDir = path.join(outputDir, "references", "locations");
      const locFiles = await getAllFiles(locRefDir);
      
      stats.references.locations = await addFilesToZipParallel(
        zip,
        locFiles,
        `MOOSTIK-Library/${FOLDER_STRUCTURE.references.locations}`,
        30
      );
      stats.total += stats.references.locations;
      console.log(`[ZIP] ✅ ${stats.references.locations} location references`);
    }

    // ========================================================================
    // 2. EPISODES - Tous les shots générés (lecture parallèle)
    // ========================================================================
    
    if (!typeFilter || typeFilter === "shot" || typeFilter === "all") {
      const imagesDir = path.join(outputDir, "images");
      
      try {
        const episodeDirs = await fs.readdir(imagesDir);
        
        for (const epDir of episodeDirs) {
          const epPath = path.join(imagesDir, epDir);
          const epStat = await fs.stat(epPath);
          
          if (!epStat.isDirectory()) continue;
          
          let epNumber = epDir;
          try {
            const epData = JSON.parse(
              await fs.readFile(path.join(dataDir, "episodes", `${epDir}.json`), "utf-8")
            );
            epNumber = `EP${epData.number || epDir}`;
          } catch {
            epNumber = epDir.toUpperCase();
          }
          
          const epFiles = await getAllFiles(epPath);
          const count = await addFilesToZipParallel(
            zip,
            epFiles,
            `MOOSTIK-Library/${FOLDER_STRUCTURE.episodes}/${epNumber}`,
            30 // Plus gros batch pour les images
          );
          
          stats.episodes[epNumber] = count;
          stats.total += count;
          console.log(`[ZIP] ✅ ${count} images for ${epNumber}`);
        }
      } catch {
        console.log("[ZIP] No images directory found");
      }
    }

    // ========================================================================
    // 3. PROMO ASSETS (lecture parallèle)
    // ========================================================================
    
    if (!typeFilter || typeFilter === "promo" || typeFilter === "all") {
      const promoDir = path.join(outputDir, "promo");
      const promoFiles = await getAllFiles(promoDir);
      
      stats.promo = await addFilesToZipParallel(
        zip,
        promoFiles,
        `MOOSTIK-Library/${FOLDER_STRUCTURE.promo}`,
        30
      );
      stats.total += stats.promo;
      console.log(`[ZIP] ✅ ${stats.promo} promo assets`);
    }

    // ========================================================================
    // 4. VIDEOS (lecture parallèle)
    // ========================================================================
    
    if (!typeFilter || typeFilter === "video" || typeFilter === "all") {
      const videosDir = path.join(outputDir, "videos");
      const videoFiles = await getAllFiles(videosDir);
      
      stats.videos = await addFilesToZipParallel(
        zip,
        videoFiles,
        `MOOSTIK-Library/${FOLDER_STRUCTURE.videos}`,
        10 // Plus petit batch pour les vidéos (plus lourdes)
      );
      stats.total += stats.videos;
      console.log(`[ZIP] ✅ ${stats.videos} videos`);
    }

    // ========================================================================
    // 5. README & MANIFEST
    // ========================================================================

    const readme = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                      MOOSTIK - BIBLIOTHÈQUE COMPLÈTE                        ║
║                         Rise of the Bloodwings                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

📅 Exporté le: ${new Date().toLocaleString("fr-FR")}
📊 Total assets: ${stats.total}

═══════════════════════════════════════════════════════════════════════════════
                              STRUCTURE DES DOSSIERS
═══════════════════════════════════════════════════════════════════════════════

MOOSTIK-Library/
│
├── 01-References/
│   ├── 01-Personnages/       ${stats.references.characters} fichiers
│   │   ├── baby-dorval.png
│   │   ├── mama-dorval.png
│   │   └── ...
│   │
│   └── 02-Lieux/             ${stats.references.locations} fichiers
│       ├── cooltik-village.png
│       ├── bar-ti-sang.png
│       └── ...
│
├── 02-Episodes/
${Object.entries(stats.episodes)
  .map(([ep, count]) => `│   ├── ${ep}/                   ${count} fichiers`)
  .join("\n")}
│   │   ├── shot-001/
│   │   │   ├── main.png
│   │   │   ├── chaos-wide.png
│   │   │   └── ...
│   │   └── shot-002/
│   │       └── ...
│
├── 03-Promo/                 ${stats.promo} fichiers
│   └── ...
│
└── 04-Videos/                ${stats.videos} fichiers
    └── ...

═══════════════════════════════════════════════════════════════════════════════
                                 STATISTIQUES
═══════════════════════════════════════════════════════════════════════════════

📸 Images de référence:
   • Personnages: ${stats.references.characters}
   • Lieux: ${stats.references.locations}

🎬 Shots par épisode:
${Object.entries(stats.episodes)
  .map(([ep, count]) => `   • ${ep}: ${count} images`)
  .join("\n")}

🎨 Assets promo: ${stats.promo}
🎥 Vidéos: ${stats.videos}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                             TOTAL: ${stats.total} FICHIERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

═══════════════════════════════════════════════════════════════════════════════
                                  CRÉDITS
═══════════════════════════════════════════════════════════════════════════════

🩸 Studio: Bloodwings Studio
📽️ Projet: MOOSTIK - Rise of the Bloodwings  
🤖 Génération: Flux Kontext Pro / Nano Banana 2 Pro
🌐 Site: https://moostik.vercel.app

"We are the real vampires." 🩸

© 2026 Bloodwings Studio - All Rights Reserved
`;

    zip.addFile("MOOSTIK-Library/README.txt", Buffer.from(readme, "utf-8"));

    const manifest = {
      export_date: new Date().toISOString(),
      project: "MOOSTIK - Rise of the Bloodwings",
      studio: "Bloodwings Studio",
      filter: typeFilter || "all",
      statistics: stats,
      folder_structure: FOLDER_STRUCTURE,
    };

    zip.addFile(
      "MOOSTIK-Library/manifest.json",
      Buffer.from(JSON.stringify(manifest, null, 2), "utf-8")
    );

    // ========================================================================
    // 6. GÉNÉRATION DU ZIP
    // ========================================================================

    if (stats.total === 0) {
      return NextResponse.json(
        { error: "Aucun fichier trouvé à exporter", stats },
        { status: 404 }
      );
    }

    const zipBuffer = zip.toBuffer();
    const dateStr = new Date().toISOString().split("T")[0];
    const zipFilename = typeFilter && typeFilter !== "all"
      ? `moostik-${typeFilter}-${dateStr}.zip`
      : `moostik-library-complete-${dateStr}.zip`;

    console.log(`[ZIP] ✅ Export complete: ${stats.total} files, ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    return new NextResponse(new Uint8Array(zipBuffer), {
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
      { error: error instanceof Error ? error.message : "Failed to generate ZIP" },
      { status: 500 }
    );
  }
}
