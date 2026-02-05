#!/usr/bin/env npx ts-node
/**
 * ══════════════════════════════════════════════════════════════════════════════
 * UPGRADE T05 TO SOTA BLOODWINGS
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Ce script :
 * 1. Marque les variations existantes comme "legacy"
 * 2. Corrige tous les prompts vers le format SOTA BLOODWINGS
 * 3. Ajoute de nouvelles variations "pending" pour régénération
 * 
 * Usage: npx ts-node scripts/upgrade-t05-to-sota.ts
 * ══════════════════════════════════════════════════════════════════════════════
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════════
// INVARIANTS CONSTITUTIONNELS COMPLETS (12+)
// ═══════════════════════════════════════════════════════════════════════════════

const CONSTITUTIONAL_INVARIANTS = [
  // Style
  "Style: Pixar-dark 3D feature-film quality, ILM-grade VFX, démoniaque mignon aesthetic",
  "Palette: obsidian black (#0B0B0E), blood red (#8B0015), deep crimson (#B0002A), copper (#9B6A3A), warm amber (#FFB25A)",
  
  // Anatomie Moostik
  "Moostik anatomy: MUST have visible needle-like proboscis (their ONLY weapon), large expressive amber/orange eyes, translucent wings with crimson veins",
  "Moostik scale: MICROSCOPIC - dust-speck sized compared to humans",
  "Moostik bodies: matte obsidian chitin (#0B0B0E) with subtle satin highlights",
  
  // Architecture
  "Moostik architecture: Renaissance bio-organic Gothic style - NO human architecture in Moostik scenes",
  "Moostik materials: chitin, resin, wing-membrane, silk threads, nectar-wax, blood-ruby",
  "Moostik lighting: bioluminescent amber/crimson lanterns, nectar-wax candles - NO electric lights",
  
  // Technologie
  "Technology: Medieval fantasy ONLY - NO modern weapons, NO electricity, NO machines",
  "Combat: Proboscis fighting ONLY - NO guns, tanks, or manufactured weapons",
  
  // Symboles
  "Clan sigil: Droplet-Eye (blood drop with stylized eye) on wax seals and insignia",
  
  // Humains
  "Humans: Antillean/Caribbean ONLY (ebony skin), Pixar-stylized proportions",
  "Human POV: Humans appear as COLOSSAL titans from Moostik perspective",
];

// ═══════════════════════════════════════════════════════════════════════════════
// NEGATIVES CONSTITUTIONNELS COMPLETS (24+)
// ═══════════════════════════════════════════════════════════════════════════════

const CONSTITUTIONAL_NEGATIVES = [
  // Style interdits
  "anime style",
  "cartoon style", 
  "2D illustration",
  "flat shading",
  "cheap CGI look",
  "neon oversaturation",
  
  // Architecture interdite
  "human architecture in Moostik scenes",
  "human silhouettes in Moostik cities",
  "human furniture in Moostik locations",
  
  // Technologie interdite
  "modern technology",
  "guns",
  "weapons",
  "tanks",
  "machines",
  "vehicles",
  "electricity",
  "electronics",
  "screens",
  "computers",
  
  // Anatomie interdite
  "mosquito without visible proboscis",
  "oversized mosquitoes",
  "human-scale insects",
  
  // Humains interdits
  "white caucasian humans",
  "non-Pixar realistic humans",
  
  // Autres
  "random logos",
  "watermarks",
  "readable text unless specified",
  "gore close-ups",
  "intestines",
];

// ═══════════════════════════════════════════════════════════════════════════════
// GIGANTISM CUES
// ═══════════════════════════════════════════════════════════════════════════════

const GIGANTISM_CUES = {
  default: [
    "fabric threads appear as massive tree trunks",
    "crumbs look like weathered boulders",
    "dust motes drift like slow asteroids in sunbeams",
    "a single water droplet appears as a small lake",
    "human fingerprints visible as terrain ridges",
  ],
  human_as_terrain: [
    "human hand as a slow-moving wall of doom",
    "human fingers as colossal pillars 50 meters tall",
    "human skin pores as tiny craters",
    "human breath as a hurricane wind",
  ],
  interior: [
    "furniture legs as architectural columns",
    "table surface as an infinite plain",
    "carpet as a shaggy tundra landscape",
    "lamp as a distant sun/moon",
  ],
  exterior: [
    "grass blades as giant green towers",
    "raindrops as falling meteors",
    "puddles as vast lakes",
    "pebbles as mountains",
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE BIBLE
// ═══════════════════════════════════════════════════════════════════════════════

const STYLE_BIBLE = {
  usp_core: [
    "Moostik POV: everything appears COLOSSAL from microscopic perspective",
    "Humans are terrain hazards and titans, not characters",
    "Proboscis is the ONLY weapon - visible on all Moostik characters",
    "Démoniaque mignon (cute demonic) aesthetic",
    "Feature film quality - $200M animated production value",
  ],
  look: "premium 3D animated feature film, Pixar-dark aesthetic, ILM-grade VFX, cute demonic characters, Renaissance bio-organic architecture at micro scale",
  palette: ["obsidian black (#0B0B0E)", "blood red (#8B0015)", "deep crimson (#B0002A)", "copper (#9B6A3A)", "warm amber (#FFB25A)"],
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log("═══════════════════════════════════════════════════════════════════════════════");
  console.log("UPGRADE T05 TO SOTA BLOODWINGS");
  console.log("═══════════════════════════════════════════════════════════════════════════════\n");

  // Load episode
  const episodePath = path.join(__dirname, "../data/episodes/t05.json");
  const rawData = fs.readFileSync(episodePath, "utf-8");
  const episode = JSON.parse(rawData);

  console.log(`📁 Épisode chargé: ${episode.title}`);
  console.log(`🎬 Nombre de shots: ${episode.shots.length}\n`);

  let legacyCount = 0;
  let upgradeCount = 0;

  // Process each shot
  for (const shot of episode.shots) {
    console.log(`\n▸ Processing shot-${shot.number.toString().padStart(3, "0")}: ${shot.name}`);

    // 1. Mark existing variations as legacy
    if (shot.variations && shot.variations.length > 0) {
      for (const variation of shot.variations) {
        if (variation.status === "completed" && !variation.id.includes("legacy")) {
          // Rename to legacy
          const legacyId = `legacy-${variation.id}`;
          variation.legacyId = variation.id;
          variation.id = legacyId;
          variation.isLegacy = true;
          variation.legacyReason = "Pre-SOTA BLOODWINGS - missing scene_graph, constraints, incomplete invariants";
          legacyCount++;
          console.log(`   ✓ Variation marquée legacy: ${legacyId}`);
        }
      }
    }

    // 2. Upgrade prompt to SOTA BLOODWINGS
    const prompt = shot.prompt;
    
    // Determine scene type from shot
    const sceneType = shot.sceneType || "default";
    const isHumanInteraction = shot.characterIds?.includes("child-killer") || 
                               shot.description?.toLowerCase().includes("humain") ||
                               shot.description?.toLowerCase().includes("doigt") ||
                               shot.description?.toLowerCase().includes("main");
    const isExterior = shot.locationIds?.some((id: string) => id.includes("exterior") || id.includes("storm"));
    
    // Select appropriate gigantism cues
    let selectedGigantism = [...GIGANTISM_CUES.default];
    if (isHumanInteraction) {
      selectedGigantism = [...selectedGigantism, ...GIGANTISM_CUES.human_as_terrain];
    }
    if (isExterior) {
      selectedGigantism = [...selectedGigantism, ...GIGANTISM_CUES.exterior];
    } else {
      selectedGigantism = [...selectedGigantism, ...GIGANTISM_CUES.interior];
    }

    // Create scene_graph
    prompt.scene_graph = {
      style_bible: STYLE_BIBLE,
      environment: {
        space: prompt.scene?.location || shot.description,
        gigantism_cues: selectedGigantism,
        mood: getMoodFromSceneType(sceneType),
      },
      camera: {
        shot_type: prompt.camera?.format || "IMAX",
        lens: `${prompt.camera?.lens_mm || 35}mm ${prompt.camera?.aperture || "f/2.8"}`,
        composition: prompt.composition?.layout || "rule of thirds",
        motion_suggestion: getMotionFromDescription(shot.description),
      },
      lighting: {
        key: prompt.lighting?.key || "dramatic Pixar-dark key",
        accent: prompt.lighting?.rim || "crimson rim",
        fx: prompt.lighting?.notes || "volumetric haze",
      },
    };

    // Create constraints
    prompt.constraints = {
      must_include: [
        "visible proboscis on all Moostik characters",
        "micro-scale texture cues showing GIGANTISM",
        "Pixar-dark 3D feature film quality",
        ...getMustIncludeForShot(shot),
      ],
      must_not_include: [
        "human faces in Moostik-scale scenes",
        "modern technology",
        "white/caucasian humans",
        "anime or cartoon style",
        "mosquito without visible proboscis",
      ],
    };

    // Upgrade invariants to constitutional
    prompt.invariants = [...CONSTITUTIONAL_INVARIANTS];
    
    // Add shot-specific invariants
    if (isHumanInteraction) {
      prompt.invariants.push("Human elements: TITAN scale - hands/fingers appear 50+ meters tall from Moostik POV");
    }
    if (sceneType === "apocalyptic") {
      prompt.invariants.push("Apocalyptic atmosphere: toxic BYSS fog, ember particles, fire glow, death everywhere");
    }

    // Upgrade negatives to constitutional
    prompt.negative = [...CONSTITUTIONAL_NEGATIVES];

    // Create meta if missing
    if (!prompt.meta) {
      prompt.meta = {
        model_version: "nano-banana-2-pro",
        task_type: "cinematic_keyframe",
        project: "MOOSTIK_T05",
        asset_id: shot.id.toUpperCase().replace(/-/g, "_"),
        scene_intent: shot.description,
      };
    }

    // Create parameters if missing
    if (!prompt.parameters) {
      prompt.parameters = {
        aspect_ratio: "21:9",
        render_resolution: "3840x2160",
        output_count: 1,
        steps: 70,
        guidance_strength: 8.5,
        sharpness: 0.34,
        film_grain: 0.13,
      };
    }

    // Ensure subjects have importance
    if (prompt.subjects) {
      prompt.subjects = prompt.subjects.map((subject: any, index: number) => ({
        ...subject,
        importance: subject.importance || (index === 0 ? "primary" : "secondary"),
      }));
    }

    // 3. Add new SOTA variation for regeneration
    const newVariation = {
      id: `sota-${shot.id}-main`,
      cameraAngle: "cinematic_sota",
      status: "pending",
      createdAt: new Date().toISOString(),
      sotaVersion: "BLOODWINGS_2026_01",
      notes: "SOTA BLOODWINGS regeneration with complete scene_graph and constraints",
    };

    if (!shot.variations) {
      shot.variations = [];
    }
    
    // Check if SOTA variation already exists
    const existingSota = shot.variations.find((v: any) => v.id.startsWith("sota-"));
    if (!existingSota) {
      shot.variations.push(newVariation);
      console.log(`   ✓ Nouvelle variation SOTA ajoutée: ${newVariation.id}`);
    }

    // Update shot status
    shot.status = "pending";
    shot.updatedAt = new Date().toISOString();
    
    upgradeCount++;
    console.log(`   ✓ Prompt upgradé vers SOTA BLOODWINGS`);
  }

  // Save updated episode
  const outputPath = episodePath;
  fs.writeFileSync(outputPath, JSON.stringify(episode, null, 2));

  console.log("\n═══════════════════════════════════════════════════════════════════════════════");
  console.log("RÉSUMÉ");
  console.log("═══════════════════════════════════════════════════════════════════════════════");
  console.log(`✅ Variations marquées legacy: ${legacyCount}`);
  console.log(`✅ Prompts upgradés SOTA: ${upgradeCount}`);
  console.log(`📁 Fichier sauvegardé: ${outputPath}`);
  console.log("\n🚀 Prêt pour régénération avec: npm run generate:batch -- --episode=t05");
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getMoodFromSceneType(sceneType: string): string {
  const moods: Record<string, string> = {
    apocalyptic: "apocalyptic horror, death, chaos, fire, destruction",
    peaceful: "idyllic tranquility, warmth, community",
    tense: "tension, fear, uncertainty",
    sacred: "reverent awe, spiritual weight",
    bar: "intimate nostalgia, warm shadows, sensuality",
    military: "discipline, determination, focused fury",
    training: "sweat, effort, transformation",
    default: "atmospheric tension",
  };
  return moods[sceneType] || moods.default;
}

function getMotionFromDescription(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes("fuit") || lower.includes("cours") || lower.includes("escape")) {
    return "desperate flight, fast movement blur, urgency";
  }
  if (lower.includes("explos") || lower.includes("flamme") || lower.includes("fire")) {
    return "explosive energy, particles flying, chaos";
  }
  if (lower.includes("sacrifice") || lower.includes("mort") || lower.includes("death")) {
    return "slow motion heroic, time frozen in tragedy";
  }
  if (lower.includes("pond") || lower.includes("nymphe") || lower.includes("bébé")) {
    return "gentle, tender, intimate stillness";
  }
  return "cinematic stillness with atmospheric particles";
}

function getMustIncludeForShot(shot: any): string[] {
  const mustInclude: string[] = [];
  
  // Based on scene type
  if (shot.sceneType === "apocalyptic") {
    mustInclude.push("toxic BYSS fog or fire elements");
    mustInclude.push("dramatic apocalyptic lighting");
  }
  
  // Based on characters
  if (shot.characterIds?.includes("child-killer")) {
    mustInclude.push("Caribbean child hand/fingers as TITAN elements (ebony skin, Pixar style)");
  }
  if (shot.characterIds?.some((id: string) => 
    ["koko-survivor", "mila-survivor", "trez-survivor", "mama-dorval", "baby-dorval"].includes(id)
  )) {
    mustInclude.push("Moostik characters with visible proboscis and amber eyes");
  }
  
  // Based on location
  if (shot.locationIds?.includes("cooltik-village")) {
    mustInclude.push("bio-organic chitin cottages and Renaissance micro-architecture");
  }
  if (shot.locationIds?.includes("tire-city")) {
    mustInclude.push("tire interior as vast cathedral space");
  }
  
  return mustInclude;
}

// Run
main().catch(console.error);
