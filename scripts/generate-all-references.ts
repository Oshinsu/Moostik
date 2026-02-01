#!/usr/bin/env bun
/**
 * Script pour générer toutes les images de référence
 * Lance les générations en parallèle par batches
 */

const BASE_URL = "http://localhost:3000";

interface GenerateResult {
  success: boolean;
  type: string;
  id: string;
  name: string;
  imageUrl?: string;
  error?: string;
}

async function generateReference(type: "character" | "location", id: string): Promise<GenerateResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/references/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ ${type} "${data.name}" généré: ${data.imageUrl}`);
      return { success: true, type, id, name: data.name, imageUrl: data.imageUrl };
    } else {
      console.error(`❌ ${type} "${id}" erreur: ${data.error}`);
      return { success: false, type, id, name: id, error: data.error };
    }
  } catch (error) {
    console.error(`❌ ${type} "${id}" exception:`, error);
    return { success: false, type, id, name: id, error: String(error) };
  }
}

async function generateBatch(items: { type: "character" | "location"; id: string }[], batchSize: number = 4) {
  const results: GenerateResult[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(`\n🚀 Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(items.length/batchSize)} - ${batch.map(b => b.id).join(", ")}`);
    
    const batchResults = await Promise.all(
      batch.map(item => generateReference(item.type, item.id))
    );
    
    results.push(...batchResults);
    
    // Petit délai entre les batches pour ne pas surcharger
    if (i + batchSize < items.length) {
      console.log("⏳ Attente 2s avant prochain batch...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  return results;
}

async function main() {
  console.log("🎬 MOOSTIK - Génération de toutes les images de référence\n");
  console.log("Style: Pixar démoniaque / Noblesse mignonne / Vrais vampires\n");
  
  // Récupérer les données
  const response = await fetch(`${BASE_URL}/api/references`);
  const data = await response.json();
  
  const characters = data.characters.map((c: { id: string; name: string }) => ({ type: "character" as const, id: c.id, name: c.name }));
  const locations = data.locations.map((l: { id: string; name: string }) => ({ type: "location" as const, id: l.id, name: l.name }));
  
  console.log(`📊 À générer: ${characters.length} personnages + ${locations.length} lieux = ${characters.length + locations.length} images\n`);
  
  // Générer les personnages d'abord
  console.log("═══════════════════════════════════════");
  console.log("👥 PERSONNAGES");
  console.log("═══════════════════════════════════════");
  const characterResults = await generateBatch(characters, 3);
  
  // Puis les lieux
  console.log("\n═══════════════════════════════════════");
  console.log("🏛️  LIEUX");
  console.log("═══════════════════════════════════════");
  const locationResults = await generateBatch(locations, 3);
  
  // Résumé
  const allResults = [...characterResults, ...locationResults];
  const successes = allResults.filter(r => r.success);
  const failures = allResults.filter(r => !r.success);
  
  console.log("\n═══════════════════════════════════════");
  console.log("📊 RÉSUMÉ");
  console.log("═══════════════════════════════════════");
  console.log(`✅ Réussites: ${successes.length}/${allResults.length}`);
  
  if (failures.length > 0) {
    console.log(`❌ Échecs: ${failures.length}`);
    failures.forEach(f => console.log(`   - ${f.type} "${f.id}": ${f.error}`));
  }
  
  console.log("\n🎉 Génération terminée!");
  console.log(`📁 Images sauvegardées dans: public/references/`);
}

main().catch(console.error);
