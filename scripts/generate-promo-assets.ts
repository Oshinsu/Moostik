#!/usr/bin/env npx ts-node

/**
 * BLOODWINGS STUDIO - PROMO ASSETS GENERATOR
 * ===========================================================================
 * Génère tous les assets promo définis dans promo-assets.json
 * Utilise les techniques SOTA JSON Moostik Janvier 2026
 * ===========================================================================
 */

import fs from "fs/promises";
import path from "path";

const API_BASE = process.env.API_BASE || "http://localhost:3000";
const BATCH_SIZE = 2; // 2 images à la fois pour éviter les timeouts
const PAUSE_BETWEEN_BATCHES = 5000; // 5 secondes entre les batches

interface Variation {
  id: string;
  cameraAngle: string;
  status: string;
  imageUrl?: string;
}

interface Shot {
  id: string;
  name: string;
  prompt: any;
  variations: Variation[];
}

interface Category {
  id: string;
  title: string;
  shots: Shot[];
}

interface PromoData {
  categories: Category[];
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadPromoData(): Promise<PromoData> {
  const dataPath = path.join(process.cwd(), "data", "promo-assets.json");
  const content = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(content);
}

async function savePromoData(data: PromoData): Promise<void> {
  const dataPath = path.join(process.cwd(), "data", "promo-assets.json");
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}

async function generateBatch(
  categoryId: string,
  shots: { shot: Shot; variation: Variation }[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  // Generate one shot at a time using the promo API
  for (const { shot, variation } of shots) {
    try {
      const response = await fetch(`${API_BASE}/api/promo/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          shotId: shot.id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`  ❌ ${shot.id} failed: ${response.status} - ${errorText.slice(0, 100)}`);
        continue;
      }

      const data = await response.json();
      
      for (const result of data.results || []) {
        if (result.success && result.imageUrl) {
          results.set(`${result.shotId}-${result.variationId}`, result.imageUrl);
          console.log(`  ✅ ${result.shotId} généré`);
        } else if (result.skipped) {
          console.log(`  ⏭️ ${result.shotId} déjà généré`);
          results.set(`${result.shotId}-${result.variationId}`, result.imageUrl);
        } else {
          console.error(`  ❌ ${result.shotId}: ${result.error || "Unknown error"}`);
        }
      }
    } catch (error) {
      console.error(`  ❌ ${shot.id} network error:`, error);
    }

    // Small pause between shots
    await sleep(1000);
  }

  return results;
}

async function main() {
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║         🩸 BLOODWINGS PROMO ASSETS GENERATOR 🩸               ║");
  console.log("║                 SOTA JSON Moostik Janvier 2026                ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log("\n");

  // Load promo data
  console.log("📂 Chargement des assets promo...");
  const promoData = await loadPromoData();

  // Count pending
  let totalPending = 0;
  const pendingByCategory: Record<string, { shot: Shot; variation: Variation }[]> = {};

  for (const category of promoData.categories) {
    pendingByCategory[category.id] = [];
    
    for (const shot of category.shots) {
      for (const variation of shot.variations) {
        if (variation.status === "pending") {
          totalPending++;
          pendingByCategory[category.id].push({ shot, variation });
        }
      }
    }
  }

  if (totalPending === 0) {
    console.log("\n✅ Tous les assets promo sont déjà générés !");
    return;
  }

  console.log(`\n🎯 ${totalPending} assets à générer\n`);

  // Process by category
  let generated = 0;
  let failed = 0;

  for (const category of promoData.categories) {
    const pending = pendingByCategory[category.id];
    if (pending.length === 0) continue;

    console.log(`\n${"═".repeat(60)}`);
    console.log(`📁 ${category.title} (${pending.length} assets)`);
    console.log(`${"═".repeat(60)}`);

    // Process in batches
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const batch = pending.slice(i, i + BATCH_SIZE);
      
      console.log(`\n📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(pending.length / BATCH_SIZE)}`);
      
      const results = await generateBatch(category.id, batch);

      // Update promo data with results
      for (const { shot, variation } of batch) {
        const key = `${shot.id}-${variation.id}`;
        const imageUrl = results.get(key);

        // Find and update the variation
        const categoryData = promoData.categories.find((c) => c.id === category.id);
        const shotData = categoryData?.shots.find((s) => s.id === shot.id);
        const variationData = shotData?.variations.find((v) => v.id === variation.id);

        if (variationData) {
          if (imageUrl) {
            variationData.status = "completed";
            variationData.imageUrl = imageUrl;
            generated++;
          } else {
            variationData.status = "failed";
            failed++;
          }
        }
      }

      // Save progress
      await savePromoData(promoData);

      // Pause between batches
      if (i + BATCH_SIZE < pending.length) {
        console.log(`  ⏳ Pause ${PAUSE_BETWEEN_BATCHES / 1000}s...`);
        await sleep(PAUSE_BETWEEN_BATCHES);
      }
    }
  }

  // Final report
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║                      RAPPORT FINAL                           ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`\n  ✅ Générés: ${generated}`);
  console.log(`  ❌ Échoués: ${failed}`);
  console.log(`  📊 Taux de succès: ${((generated / (generated + failed)) * 100).toFixed(1)}%`);
  console.log("\n🩸 Génération terminée !\n");
}

main().catch(console.error);
