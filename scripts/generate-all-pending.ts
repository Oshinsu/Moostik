/**
 * MOOSTIK - Génération Massive EP0
 * SOTA BLOODWINGS Janvier 2026
 * 
 * Lance la génération de toutes les variations en attente
 */

import * as fs from "fs";
import * as path from "path";

const API_BASE = "http://localhost:3000";
const EPISODES_DIR = path.join(__dirname, "../data/episodes");

interface Shot {
  id: string;
  name: string;
  variations: Array<{
    id: string;
    status: string;
    imageUrl?: string;
  }>;
}

interface Episode {
  id: string;
  shots: Shot[];
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateBatch(episodeId: string, shotId: string, variationIds: string[]) {
  const response = await fetch(`${API_BASE}/api/generate/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      episodeId,
      shotId,
      variationIds,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Batch generation failed: ${error}`);
  }
  
  return response.json();
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     🚀 MOOSTIK - PRODUCTION MASSIVE BLOODWINGS 🚀          ║");
  console.log("║              SOTA Janvier 2026 - EP0                       ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");
  
  // Charger l'épisode
  const episodePath = path.join(EPISODES_DIR, "ep0.json");
  const episode: Episode = JSON.parse(fs.readFileSync(episodePath, "utf-8"));
  
  // Collecter les variations en attente
  const pendingShots: Array<{ shotId: string; shotName: string; variationIds: string[] }> = [];
  
  for (const shot of episode.shots) {
    const pendingVariations = (shot.variations || [])
      .filter(v => v.status === "pending" || v.status === "failed" || !v.imageUrl)
      .map(v => v.id);
    
    if (pendingVariations.length > 0) {
      pendingShots.push({
        shotId: shot.id,
        shotName: shot.name,
        variationIds: pendingVariations,
      });
    }
  }
  
  const totalVariations = pendingShots.reduce((sum, s) => sum + s.variationIds.length, 0);
  
  console.log(`📊 PLAN DE PRODUCTION:`);
  console.log(`   • Shots à traiter: ${pendingShots.length}`);
  console.log(`   • Variations totales: ${totalVariations}`);
  console.log(`   • Estimé: ~${Math.ceil(totalVariations * 15 / 60)} minutes\n`);
  
  if (pendingShots.length === 0) {
    console.log("✅ Toutes les images sont déjà générées !");
    return;
  }
  
  let completedShots = 0;
  let completedVariations = 0;
  let errors: string[] = [];
  
  console.log("🎬 DÉBUT DE LA GÉNÉRATION...\n");
  
  for (const shot of pendingShots) {
    const progress = `[${completedShots + 1}/${pendingShots.length}]`;
    console.log(`${progress} 🎥 ${shot.shotName}`);
    console.log(`       ID: ${shot.shotId}`);
    console.log(`       Variations: ${shot.variationIds.length}`);
    
    try {
      // Générer par petits lots de 3 pour éviter les timeouts
      const batchSize = 3;
      for (let i = 0; i < shot.variationIds.length; i += batchSize) {
        const batch = shot.variationIds.slice(i, i + batchSize);
        console.log(`       → Lot ${Math.floor(i/batchSize) + 1}/${Math.ceil(shot.variationIds.length/batchSize)}: ${batch.join(", ")}`);
        
        await generateBatch(episode.id, shot.shotId, batch);
        completedVariations += batch.length;
        
        // Pause entre les lots
        if (i + batchSize < shot.variationIds.length) {
          await sleep(2000);
        }
      }
      
      console.log(`       ✅ Complété\n`);
      completedShots++;
      
    } catch (error) {
      console.log(`       ❌ Erreur: ${error}\n`);
      errors.push(`${shot.shotId}: ${error}`);
    }
    
    // Pause entre les shots
    await sleep(3000);
  }
  
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║               PRODUCTION TERMINÉE                          ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log(`\n📊 RÉSULTATS:`);
  console.log(`   • Shots traités: ${completedShots}/${pendingShots.length}`);
  console.log(`   • Variations générées: ${completedVariations}/${totalVariations}`);
  
  if (errors.length > 0) {
    console.log(`\n❌ ERREURS (${errors.length}):`);
    errors.forEach(e => console.log(`   • ${e}`));
  }
  
  console.log("\n🌍 LET'S CHANGE THE WORLD! 🚀");
}

main().catch(console.error);
