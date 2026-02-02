#!/usr/bin/env npx tsx

/**
 * MOOSTIK - Export Library Script
 * Génère un ZIP de toute la bibliothèque d'assets
 * 
 * Usage: npx tsx scripts/export-library.ts
 */

import { promises as fs } from "fs";
import path from "path";
import AdmZip from "adm-zip";

// ============================================================================
// CONFIG
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

const OUTPUT_DIR = path.join(process.cwd(), "output");
const DATA_DIR = path.join(process.cwd(), "data");

// ============================================================================
// HELPERS
// ============================================================================

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

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function addFilesToZip(
  zip: AdmZip,
  files: Array<{ path: string; relativePath: string }>,
  zipBasePath: string,
  label: string
): Promise<number> {
  let count = 0;
  const batches = chunkArray(files, 50);
  
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
    
    process.stdout.write(`\r  ${label}: ${count}/${files.length} fichiers...`);
  }
  
  console.log(`\r  ✅ ${label}: ${count} fichiers`);
  return count;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║         MOOSTIK - EXPORT BIBLIOTHÈQUE COMPLÈTE              ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  const zip = new AdmZip();
  const stats = {
    references: { characters: 0, locations: 0 },
    episodes: {} as Record<string, number>,
    promo: 0,
    videos: 0,
    total: 0,
  };

  const startTime = Date.now();

  // ========================================================================
  // 1. REFERENCES
  // ========================================================================
  
  console.log("📁 [1/4] Références...");
  
  const charRefDir = path.join(OUTPUT_DIR, "references", "characters");
  const charFiles = await getAllFiles(charRefDir);
  stats.references.characters = await addFilesToZip(
    zip,
    charFiles,
    `MOOSTIK-Library/${FOLDER_STRUCTURE.references.characters}`,
    "Personnages"
  );
  stats.total += stats.references.characters;
  
  const locRefDir = path.join(OUTPUT_DIR, "references", "locations");
  const locFiles = await getAllFiles(locRefDir);
  stats.references.locations = await addFilesToZip(
    zip,
    locFiles,
    `MOOSTIK-Library/${FOLDER_STRUCTURE.references.locations}`,
    "Lieux"
  );
  stats.total += stats.references.locations;

  // ========================================================================
  // 2. EPISODES
  // ========================================================================
  
  console.log("\n📁 [2/4] Episodes...");
  
  const imagesDir = path.join(OUTPUT_DIR, "images");
  
  try {
    const episodeDirs = await fs.readdir(imagesDir);
    
    for (const epDir of episodeDirs) {
      const epPath = path.join(imagesDir, epDir);
      const epStat = await fs.stat(epPath);
      
      if (!epStat.isDirectory()) continue;
      
      let epNumber = epDir;
      try {
        const epData = JSON.parse(
          await fs.readFile(path.join(DATA_DIR, "episodes", `${epDir}.json`), "utf-8")
        );
        epNumber = `EP${epData.number || epDir}`;
      } catch {
        epNumber = epDir.toUpperCase();
      }
      
      const epFiles = await getAllFiles(epPath);
      const count = await addFilesToZip(
        zip,
        epFiles,
        `MOOSTIK-Library/${FOLDER_STRUCTURE.episodes}/${epNumber}`,
        epNumber
      );
      
      stats.episodes[epNumber] = count;
      stats.total += count;
    }
  } catch {
    console.log("  ⚠️ Pas de dossier images");
  }

  // ========================================================================
  // 3. PROMO
  // ========================================================================
  
  console.log("\n📁 [3/4] Promo...");
  
  const promoDir = path.join(OUTPUT_DIR, "promo");
  const promoFiles = await getAllFiles(promoDir);
  
  if (promoFiles.length > 0) {
    stats.promo = await addFilesToZip(
      zip,
      promoFiles,
      `MOOSTIK-Library/${FOLDER_STRUCTURE.promo}`,
      "Promo"
    );
    stats.total += stats.promo;
  } else {
    console.log("  ⚠️ Pas d'assets promo");
  }

  // ========================================================================
  // 4. VIDEOS
  // ========================================================================
  
  console.log("\n📁 [4/4] Vidéos...");
  
  const videosDir = path.join(OUTPUT_DIR, "videos");
  const videoFiles = await getAllFiles(videosDir);
  
  if (videoFiles.length > 0) {
    stats.videos = await addFilesToZip(
      zip,
      videoFiles,
      `MOOSTIK-Library/${FOLDER_STRUCTURE.videos}`,
      "Vidéos"
    );
    stats.total += stats.videos;
  } else {
    console.log("  ⚠️ Pas de vidéos");
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
├── 01-References/
│   ├── 01-Personnages/       ${stats.references.characters} fichiers
│   └── 02-Lieux/             ${stats.references.locations} fichiers
├── 02-Episodes/
${Object.entries(stats.episodes)
  .map(([ep, count]) => `│   └── ${ep}/                ${count} fichiers`)
  .join("\n")}
├── 03-Promo/                 ${stats.promo} fichiers
└── 04-Videos/                ${stats.videos} fichiers

═══════════════════════════════════════════════════════════════════════════════
                                  CRÉDITS
═══════════════════════════════════════════════════════════════════════════════

🩸 Studio: Bloodwings Studio
📽️ Projet: MOOSTIK - Rise of the Bloodwings  
🤖 Génération: Flux Kontext Pro / Nano Banana 2 Pro

"We are the real vampires." 🩸

© 2026 Bloodwings Studio - All Rights Reserved
`;

  zip.addFile("MOOSTIK-Library/README.txt", Buffer.from(readme, "utf-8"));

  const manifest = {
    export_date: new Date().toISOString(),
    project: "MOOSTIK - Rise of the Bloodwings",
    studio: "Bloodwings Studio",
    statistics: stats,
    folder_structure: FOLDER_STRUCTURE,
  };

  zip.addFile(
    "MOOSTIK-Library/manifest.json",
    Buffer.from(JSON.stringify(manifest, null, 2), "utf-8")
  );

  // ========================================================================
  // 6. ÉCRITURE DES ZIPS SÉPARÉS (pour éviter la limite 2GB)
  // ========================================================================

  console.log("\n💾 Génération des ZIPs par catégorie...");
  
  const dateStr = new Date().toISOString().split("T")[0];
  const exportDir = path.join(OUTPUT_DIR, `export-${dateStr}`);
  await fs.mkdir(exportDir, { recursive: true });
  
  const zipFiles: string[] = [];
  
  // ZIP References
  if (stats.references.characters > 0 || stats.references.locations > 0) {
    const refZip = new AdmZip();
    const charDir = path.join(OUTPUT_DIR, "references", "characters");
    const locDir = path.join(OUTPUT_DIR, "references", "locations");
    
    for (const file of await getAllFiles(charDir)) {
      const buffer = await fs.readFile(file.path);
      refZip.addFile(`01-Personnages/${file.relativePath}`, buffer);
    }
    for (const file of await getAllFiles(locDir)) {
      const buffer = await fs.readFile(file.path);
      refZip.addFile(`02-Lieux/${file.relativePath}`, buffer);
    }
    
    const refPath = path.join(exportDir, `moostik-references-${dateStr}.zip`);
    refZip.writeZip(refPath);
    zipFiles.push(refPath);
    console.log(`  ✅ References: ${refPath}`);
  }
  
  // ZIP par Episode
  for (const [epName, count] of Object.entries(stats.episodes)) {
    if (count === 0) continue;
    
    const epZip = new AdmZip();
    const epDirName = epName.replace("EP", "").toLowerCase();
    let epSourceDir = "";
    
    // Trouver le bon dossier source
    const imagesDir = path.join(OUTPUT_DIR, "images");
    const dirs = await fs.readdir(imagesDir);
    for (const dir of dirs) {
      if (dir.includes(epDirName) || dir === `ep${epDirName}` || dir === epDirName) {
        epSourceDir = path.join(imagesDir, dir);
        break;
      }
    }
    
    if (!epSourceDir) {
      // Essayer de trouver par le nom exact
      for (const dir of dirs) {
        const epPath = path.join(imagesDir, dir);
        const files = await getAllFiles(epPath);
        if (files.length === count) {
          epSourceDir = epPath;
          break;
        }
      }
    }
    
    if (epSourceDir) {
      for (const file of await getAllFiles(epSourceDir)) {
        const buffer = await fs.readFile(file.path);
        epZip.addFile(file.relativePath, buffer);
      }
      
      const epPath = path.join(exportDir, `moostik-${epName.toLowerCase()}-${dateStr}.zip`);
      epZip.writeZip(epPath);
      zipFiles.push(epPath);
      console.log(`  ✅ ${epName}: ${epPath}`);
    }
  }
  
  // ZIP Videos (si présents)
  if (stats.videos > 0) {
    const vidZip = new AdmZip();
    for (const file of await getAllFiles(path.join(OUTPUT_DIR, "videos"))) {
      const buffer = await fs.readFile(file.path);
      vidZip.addFile(file.relativePath, buffer);
    }
    const vidPath = path.join(exportDir, `moostik-videos-${dateStr}.zip`);
    vidZip.writeZip(vidPath);
    zipFiles.push(vidPath);
    console.log(`  ✅ Videos: ${vidPath}`);
  }
  
  // README global
  const readmeContent = `
MOOSTIK - EXPORT BIBLIOTHÈQUE
═════════════════════════════
Date: ${new Date().toLocaleString("fr-FR")}
Total: ${stats.total} fichiers

Fichiers ZIP:
${zipFiles.map(f => `  • ${path.basename(f)}`).join("\n")}

Statistiques:
  • Personnages: ${stats.references.characters}
  • Lieux: ${stats.references.locations}
${Object.entries(stats.episodes).map(([ep, c]) => `  • ${ep}: ${c}`).join("\n")}
  • Vidéos: ${stats.videos}

© 2026 Bloodwings Studio
`;
  await fs.writeFile(path.join(exportDir, "README.txt"), readmeContent);
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  
  // Calculer la taille totale
  let totalSize = 0;
  for (const zipFile of zipFiles) {
    const s = await fs.stat(zipFile);
    totalSize += s.size;
  }
  const sizeMB = (totalSize / 1024 / 1024).toFixed(2);

  console.log(`\n✅ Export terminé !`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📦 Dossier: ${exportDir}`);
  console.log(`📊 Taille totale: ${sizeMB} MB`);
  console.log(`📁 Total fichiers: ${stats.total}`);
  console.log(`🗜️ Nombre de ZIPs: ${zipFiles.length}`);
  console.log(`⏱️ Temps: ${elapsed}s`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // Stats détaillées
  console.log("📊 Détail:");
  console.log(`   • Personnages: ${stats.references.characters}`);
  console.log(`   • Lieux: ${stats.references.locations}`);
  Object.entries(stats.episodes).forEach(([ep, count]) => {
    console.log(`   • ${ep}: ${count}`);
  });
  console.log(`   • Promo: ${stats.promo}`);
  console.log(`   • Vidéos: ${stats.videos}`);
  console.log("");
  
  console.log("📂 Fichiers générés:");
  for (const zipFile of zipFiles) {
    const s = await fs.stat(zipFile);
    console.log(`   • ${path.basename(zipFile)} (${(s.size / 1024 / 1024).toFixed(1)} MB)`);
  }
  console.log("");
}

main().catch(console.error);
