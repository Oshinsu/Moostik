#!/usr/bin/env bun
/**
 * Script pour générer les images de référence manquantes
 * Génère une par une avec délai pour éviter le rate limiting
 */

const BASE_URL = "http://localhost:3000";

const MISSING_CHARACTERS = ["papy-moostik", "young-papy", "baby-papy", "mama-moostik", "singer-stegomyia"];
const MISSING_LOCATIONS = ["tire-fortress", "university-culex", "cathedral-sang", "memorial-genocide", "nursery-pods", "blood-bank-vault"];

async function generateOne(type: "character" | "location", id: string): Promise<boolean> {
  try {
    console.log(`\n🎨 Génération ${type}: ${id}...`);
    
    const response = await fetch(`${BASE_URL}/api/references/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ "${data.name}" généré!`);
      console.log(`   URL: ${data.imageUrl}`);
      return true;
    } else {
      console.error(`❌ Erreur: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Exception:`, error);
    return false;
  }
}

async function sleep(seconds: number) {
  console.log(`⏳ Attente ${seconds}s...`);
  await new Promise(r => setTimeout(r, seconds * 1000));
}

async function main() {
  console.log("🎬 MOOSTIK - Génération des références manquantes\n");
  
  // Vérifier ce qui manque vraiment
  const response = await fetch(`${BASE_URL}/api/references`);
  const data = await response.json();
  
  const missingChars = data.characters
    .filter((c: any) => !c.referenceImages || c.referenceImages.length === 0)
    .map((c: any) => c.id);
    
  const missingLocs = data.locations
    .filter((l: any) => !l.referenceImages || l.referenceImages.length === 0)
    .map((l: any) => l.id);
  
  console.log(`📊 Manquants: ${missingChars.length} personnages + ${missingLocs.length} lieux\n`);
  
  let success = 0;
  let failed = 0;
  
  // Générer les personnages manquants
  if (missingChars.length > 0) {
    console.log("═══════════════════════════════════════");
    console.log("👥 PERSONNAGES MANQUANTS");
    console.log("═══════════════════════════════════════");
    
    for (const id of missingChars) {
      const ok = await generateOne("character", id);
      ok ? success++ : failed++;
      await sleep(5); // 5 secondes entre chaque
    }
  }
  
  // Générer les lieux manquants
  if (missingLocs.length > 0) {
    console.log("\n═══════════════════════════════════════");
    console.log("🏛️  LIEUX MANQUANTS");
    console.log("═══════════════════════════════════════");
    
    for (const id of missingLocs) {
      const ok = await generateOne("location", id);
      ok ? success++ : failed++;
      await sleep(5); // 5 secondes entre chaque
    }
  }
  
  // Résumé
  console.log("\n═══════════════════════════════════════");
  console.log("📊 RÉSUMÉ FINAL");
  console.log("═══════════════════════════════════════");
  console.log(`✅ Réussites: ${success}`);
  console.log(`❌ Échecs: ${failed}`);
  
  // Stats finales
  const finalResponse = await fetch(`${BASE_URL}/api/references`);
  const finalData = await finalResponse.json();
  console.log(`\n📊 Total références: ${finalData.stats.charactersWithRefs}/${finalData.stats.totalCharacters} personnages, ${finalData.stats.locationsWithRefs}/${finalData.stats.totalLocations} lieux`);
}

main().catch(console.error);
