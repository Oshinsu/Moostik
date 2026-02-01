#!/usr/bin/env bun
/**
 * MOOSTIK - Génération Complète des Références
 * ============================================================================
 * Génère 5+ variations pour chaque lieu et personnage:
 * 
 * LIEUX (5 variations):
 * - establishing: Vue d'établissement large
 * - detail: Détails architecturaux macro
 * - atmosphere: Ambiance et éclairage
 * - aerial: Vue aérienne/plongeante
 * - entrance: Point d'entrée/accès
 * 
 * PERSONNAGES (5 situations):
 * - portrait: Portrait émotionnel close-up
 * - action: En action/combat
 * - social: Interaction sociale
 * - emotional: Moment émotionnel intense
 * - environment: Dans son environnement typique
 * ============================================================================
 */

import * as fs from "fs";
import * as path from "path";

const BASE_URL = "http://localhost:3000";

// ============================================================================
// TYPES DE VARIATIONS
// ============================================================================

interface LocationVariation {
  suffix: string;
  name: string;
  promptModifier: string;
}

interface CharacterSituation {
  suffix: string;
  name: string;
  promptModifier: string;
  sceneType: string;
}

const LOCATION_VARIATIONS: LocationVariation[] = [
  {
    suffix: "establishing",
    name: "Vue d'Établissement",
    promptModifier: "wide establishing shot, full architecture visible, epic scale, IMAX framing, 14mm ultra-wide lens, dramatic lighting, volumetric fog, showcasing the grandeur",
  },
  {
    suffix: "detail",
    name: "Détails Macro",
    promptModifier: "extreme close-up macro shot, intricate architectural details, chitin textures, ornate carvings, 100mm macro lens f/2.8, shallow depth of field, highlighting craftsmanship",
  },
  {
    suffix: "atmosphere",
    name: "Ambiance",
    promptModifier: "atmospheric mood shot, dramatic lighting, volumetric god rays, bioluminescent glow, warm amber and crimson light, fog and haze, cinematic color grading",
  },
  {
    suffix: "aerial",
    name: "Vue Aérienne",
    promptModifier: "aerial bird's eye view, top-down perspective, showing layout and scale, drone shot aesthetic, revealing the full extent of the location",
  },
  {
    suffix: "entrance",
    name: "Point d'Entrée",
    promptModifier: "entrance portal view, welcoming or foreboding gateway, threshold perspective, character would enter through here, dramatic framing of doorway/gate",
  },
];

const CHARACTER_SITUATIONS: CharacterSituation[] = [
  {
    suffix: "portrait",
    name: "Portrait Émotionnel",
    promptModifier: "emotional portrait close-up, 85mm lens f/2.8, eye-level, catching light in eyes, subtle expression revealing inner thoughts, intimate framing",
    sceneType: "emotional",
  },
  {
    suffix: "action",
    name: "En Action",
    promptModifier: "dynamic action pose, mid-motion, proboscis extended or wings spread, intense determination, motion blur on extremities, dramatic low angle",
    sceneType: "battle",
  },
  {
    suffix: "social",
    name: "Interaction Sociale",
    promptModifier: "social interaction scene, engaging with others, natural body language, bar or gathering setting, warm ambient lighting, medium shot",
    sceneType: "bar_scene",
  },
  {
    suffix: "emotional",
    name: "Moment Intense",
    promptModifier: "emotionally charged moment, grief or joy or rage, tears or triumph, dramatic rim lighting, close-up on face and proboscis, raw emotion",
    sceneType: "emotional",
  },
  {
    suffix: "environment",
    name: "Dans son Environnement",
    promptModifier: "environmental portrait, character in their natural habitat, wide shot showing context, surrounded by meaningful objects and setting",
    sceneType: "establishing",
  },
];

// ============================================================================
// FONCTIONS DE GÉNÉRATION
// ============================================================================

interface GenerateResult {
  success: boolean;
  id: string;
  variation: string;
  imageUrl?: string;
  error?: string;
}

async function generateLocationVariation(
  locationId: string,
  locationName: string,
  basePrompt: string,
  referenceImage: string,
  variation: LocationVariation
): Promise<GenerateResult> {
  const fullPrompt = `${basePrompt}, ${variation.promptModifier}, using reference image for architectural consistency`;
  
  try {
    const response = await fetch(`${BASE_URL}/api/references/generate-location-variations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationId,
        variationType: variation.suffix,
        customPrompt: fullPrompt,
        referenceImage,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`  ✅ ${locationName} - ${variation.name}: ${data.imageUrl}`);
      return { success: true, id: locationId, variation: variation.suffix, imageUrl: data.imageUrl };
    } else {
      console.error(`  ❌ ${locationName} - ${variation.name}: ${data.error}`);
      return { success: false, id: locationId, variation: variation.suffix, error: data.error };
    }
  } catch (error) {
    console.error(`  ❌ ${locationName} - ${variation.name}: Exception`, error);
    return { success: false, id: locationId, variation: variation.suffix, error: String(error) };
  }
}

async function generateCharacterSituation(
  characterId: string,
  characterName: string,
  basePrompt: string,
  referenceImage: string,
  situation: CharacterSituation,
  typicalLocation?: string
): Promise<GenerateResult> {
  // Construire le prompt avec la situation et la référence
  const locationContext = typicalLocation ? `, set in ${typicalLocation}` : "";
  const fullPrompt = `${basePrompt}, ${situation.promptModifier}${locationContext}, maintaining character consistency from reference`;
  
  try {
    const response = await fetch(`${BASE_URL}/api/references/generate-character-situations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        characterId,
        situationType: situation.suffix,
        customPrompt: fullPrompt,
        referenceImage,
        sceneType: situation.sceneType,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`  ✅ ${characterName} - ${situation.name}: ${data.imageUrl}`);
      return { success: true, id: characterId, variation: situation.suffix, imageUrl: data.imageUrl };
    } else {
      console.error(`  ❌ ${characterName} - ${situation.name}: ${data.error}`);
      return { success: false, id: characterId, variation: situation.suffix, error: data.error };
    }
  } catch (error) {
    console.error(`  ❌ ${characterName} - ${situation.name}: Exception`, error);
    return { success: false, id: characterId, variation: situation.suffix, error: String(error) };
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     MOOSTIK - Génération Complète des Références               ║");
  console.log("║     5 variations par lieu + 5 situations par personnage        ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");

  // Charger les données
  const charactersPath = path.join(__dirname, "../data/characters.json");
  const locationsPath = path.join(__dirname, "../data/locations.json");
  
  const characters = JSON.parse(fs.readFileSync(charactersPath, "utf-8"));
  const locations = JSON.parse(fs.readFileSync(locationsPath, "utf-8"));

  console.log(`📊 À générer:`);
  console.log(`   ${locations.length} lieux × 5 variations = ${locations.length * 5} images`);
  console.log(`   ${characters.length} personnages × 5 situations = ${characters.length * 5} images`);
  console.log(`   TOTAL: ${locations.length * 5 + characters.length * 5} images\n`);

  const allResults: GenerateResult[] = [];

  // ══════════════════════════════════════════════════════════════════════════
  // GÉNÉRATION DES LIEUX
  // ══════════════════════════════════════════════════════════════════════════
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🏛️  LIEUX - 5 Variations par Lieu");
  console.log("═══════════════════════════════════════════════════════════════\n");

  for (const location of locations) {
    console.log(`\n📍 ${location.name} (${location.id})`);
    
    // Vérifier qu'il y a une image de référence
    const refImage = location.referenceImages?.[0];
    if (!refImage) {
      console.log(`  ⚠️  Pas d'image de référence - skip`);
      continue;
    }

    // Vérifier quelles variations existent déjà
    const existingVariations = new Set<string>();
    const outputDir = path.join(__dirname, "../output/references/locations");
    for (const variation of LOCATION_VARIATIONS) {
      const filename = `${location.id}-${variation.suffix}.png`;
      if (fs.existsSync(path.join(outputDir, filename))) {
        existingVariations.add(variation.suffix);
      }
    }

    // Générer les variations manquantes
    for (const variation of LOCATION_VARIATIONS) {
      if (existingVariations.has(variation.suffix)) {
        console.log(`  ⏭️  ${variation.name} - existe déjà`);
        continue;
      }

      const result = await generateLocationVariation(
        location.id,
        location.name,
        location.referencePrompt,
        refImage,
        variation
      );
      allResults.push(result);

      // Délai entre les générations
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GÉNÉRATION DES PERSONNAGES
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("👥 PERSONNAGES - 5 Situations par Personnage");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Mapping personnage -> lieu typique
  const characterLocations: Record<string, string> = {
    "papy-tik": "Bar Ti Sang",
    "young-dorval": "Fort Sang-Noir training grounds",
    "baby-dorval": "Cooltik Village nursery",
    "mama-dorval": "Cooltik Village home",
    "general-aedes": "Fort Sang-Noir command center",
    "scholar-culex": "Academy of Blood library",
    "bartender-anopheles": "Bar Ti Sang counter",
    "singer-stegomyia": "Bar Ti Sang stage",
    "femme-fatale-tigresse": "Bar Ti Sang shadows",
    "evil-pik": "Fort Sang-Noir dungeons",
    "petit-t1": "Fort Sang-Noir barracks",
    "doc-hemoglobin": "Academy of Blood medical wing",
    "mama-zika": "Nursery Pods sanctuary",
    "captain-dengue": "Tire City patrol routes",
    "infiltrator-aedes-albopictus": "Human territory shadows",
    "child-killer": "Martinique house interior",
    "koko-survivor": "Genocide Memorial",
    "mila-survivor": "Cathedral of Blood sanctuary",
    "trez-survivor": "Tire City watchtower",
  };

  for (const character of characters) {
    console.log(`\n👤 ${character.name} (${character.id})`);
    
    // Vérifier qu'il y a une image de référence
    const refImage = character.referenceImages?.[0];
    if (!refImage) {
      console.log(`  ⚠️  Pas d'image de référence - skip`);
      continue;
    }

    // Vérifier quelles situations existent déjà
    const existingSituations = new Set<string>();
    const outputDir = path.join(__dirname, "../output/references/characters");
    for (const situation of CHARACTER_SITUATIONS) {
      const filename = `${character.id}-${situation.suffix}.png`;
      if (fs.existsSync(path.join(outputDir, filename))) {
        existingSituations.add(situation.suffix);
      }
    }

    const typicalLocation = characterLocations[character.id];

    // Générer les situations manquantes
    for (const situation of CHARACTER_SITUATIONS) {
      if (existingSituations.has(situation.suffix)) {
        console.log(`  ⏭️  ${situation.name} - existe déjà`);
        continue;
      }

      const result = await generateCharacterSituation(
        character.id,
        character.name,
        character.referencePrompt,
        refImage,
        situation,
        typicalLocation
      );
      allResults.push(result);

      // Délai entre les générations
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RÉSUMÉ
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("📊 RÉSUMÉ");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const successes = allResults.filter(r => r.success);
  const failures = allResults.filter(r => !r.success);

  console.log(`✅ Générées avec succès: ${successes.length}`);
  console.log(`❌ Échecs: ${failures.length}`);

  if (failures.length > 0) {
    console.log("\nÉchecs détaillés:");
    failures.forEach(f => console.log(`   - ${f.id} / ${f.variation}: ${f.error}`));
  }

  console.log("\n🎉 Génération terminée!");
}

main().catch(console.error);
