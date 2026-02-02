#!/usr/bin/env npx ts-node
/**
 * ══════════════════════════════════════════════════════════════════════════════
 * GENERATE SOTA VARIATIONS - 4 VARIATIONS PAR SHOT
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Ce script analyse chaque shot et génère 3 variations supplémentaires intelligentes :
 * - Variation A: Angle/cadrage alternatif
 * - Variation B: Focus différent (personnage, détail, environnement)
 * - Variation C: Moment narratif (avant, pendant, après l'action)
 * 
 * Total: 43 shots x 4 variations = 172 images SOTA
 * ══════════════════════════════════════════════════════════════════════════════
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════════
// VARIATION STRATEGIES
// ═══════════════════════════════════════════════════════════════════════════════

interface VariationStrategy {
  id: string;
  suffix: string;
  cameraAngle: string;
  description: string;
  promptModifiers: {
    composition?: { framing: string; layout: string; depth: string };
    camera?: { angle: string; lens_mm?: number };
    focusShift?: string;
    momentShift?: string;
  };
}

/**
 * Stratégies de variation selon le type de scène
 */
const VARIATION_STRATEGIES: Record<string, VariationStrategy[]> = {
  // Scènes apocalyptiques - variations dramatiques
  apocalyptic: [
    {
      id: "chaos-wide",
      suffix: "chaos-wide",
      cameraAngle: "ultra_wide_chaos",
      description: "Ultra wide establishing shot showing full scale of destruction",
      promptModifiers: {
        composition: { framing: "extreme_wide", layout: "chaos composition with multiple focal points", depth: "massive depth showing destruction layers" },
        camera: { angle: "extreme low angle looking up at towering flames", lens_mm: 14 },
      },
    },
    {
      id: "victim-pov",
      suffix: "victim-pov",
      cameraAngle: "victim_pov",
      description: "POV from terrified Moostik - intimate horror perspective",
      promptModifiers: {
        composition: { framing: "close", layout: "POV framing with danger looming", depth: "shallow focus on immediate threat" },
        camera: { angle: "dutch angle POV, disorienting terror", lens_mm: 24 },
        focusShift: "Focus on the threat/danger element approaching",
      },
    },
    {
      id: "aftermath-detail",
      suffix: "aftermath-detail",
      cameraAngle: "macro_detail",
      description: "Macro detail shot of destruction aftermath",
      promptModifiers: {
        composition: { framing: "macro", layout: "detail composition highlighting destruction", depth: "extreme shallow DOF on detail" },
        camera: { angle: "eye-level macro", lens_mm: 100 },
        momentShift: "Moment just after impact - dust settling, embers floating",
      },
    },
  ],

  // Scènes de fuite - variations de mouvement
  chase: [
    {
      id: "pursuit-wide",
      suffix: "pursuit-wide",
      cameraAngle: "tracking_wide",
      description: "Wide tracking shot showing full pursuit scale",
      promptModifiers: {
        composition: { framing: "wide", layout: "dynamic diagonal composition showing chase path", depth: "deep staging with pursuers and escapees" },
        camera: { angle: "tracking side angle, motion blur suggestion", lens_mm: 35 },
      },
    },
    {
      id: "escapee-close",
      suffix: "escapee-close",
      cameraAngle: "close_terror",
      description: "Close-up on escaping character's terror",
      promptModifiers: {
        composition: { framing: "close", layout: "tight framing on face/expression", depth: "shallow DOF, background threat blurred" },
        camera: { angle: "three-quarter angle, desperation visible", lens_mm: 85 },
        focusShift: "Focus on primary character's emotional state",
      },
    },
    {
      id: "threat-looming",
      suffix: "threat-looming",
      cameraAngle: "threat_emphasis",
      description: "Emphasize the pursuing threat's scale and menace",
      promptModifiers: {
        composition: { framing: "medium", layout: "threat dominant in frame", depth: "threat sharp, victims small" },
        camera: { angle: "low angle emphasizing threat size", lens_mm: 24 },
        focusShift: "Focus on the threat/antagonist element",
      },
    },
  ],

  // Scènes émotionnelles - variations d'intimité
  emotional: [
    {
      id: "intimate-portrait",
      suffix: "intimate-portrait",
      cameraAngle: "portrait_intimate",
      description: "Intimate portrait capturing emotional depth",
      promptModifiers: {
        composition: { framing: "close", layout: "portrait composition, rule of thirds", depth: "shallow DOF isolating subject" },
        camera: { angle: "eye-level intimate", lens_mm: 85 },
      },
    },
    {
      id: "environmental-context",
      suffix: "env-context",
      cameraAngle: "environmental",
      description: "Show character in environmental context",
      promptModifiers: {
        composition: { framing: "wide", layout: "character small in frame, environment tells story", depth: "deep staging showing world" },
        camera: { angle: "high angle showing vulnerability", lens_mm: 24 },
      },
    },
    {
      id: "symbolic-detail",
      suffix: "symbolic-detail",
      cameraAngle: "symbolic_macro",
      description: "Symbolic detail shot - hands, eyes, key prop",
      promptModifiers: {
        composition: { framing: "macro", layout: "centered symbolic element", depth: "extreme shallow DOF" },
        camera: { angle: "intimate macro angle", lens_mm: 100 },
        focusShift: "Focus on symbolic/emotional detail - proboscis, wings, eyes",
      },
    },
  ],

  // Scènes d'action - variations dynamiques
  action: [
    {
      id: "action-peak",
      suffix: "action-peak",
      cameraAngle: "peak_action",
      description: "Peak action moment frozen in time",
      promptModifiers: {
        composition: { framing: "medium", layout: "dynamic diagonal, action frozen at peak", depth: "mid-depth with motion elements" },
        camera: { angle: "dynamic three-quarter, implied motion", lens_mm: 35 },
        momentShift: "Peak moment of action - maximum tension",
      },
    },
    {
      id: "impact-close",
      suffix: "impact-close",
      cameraAngle: "impact_detail",
      description: "Close-up on moment of impact",
      promptModifiers: {
        composition: { framing: "close", layout: "tight on impact point", depth: "shallow focus on contact" },
        camera: { angle: "low angle impact POV", lens_mm: 50 },
        momentShift: "Moment of impact - collision, contact, result",
      },
    },
    {
      id: "reaction-shot",
      suffix: "reaction",
      cameraAngle: "reaction_emphasis",
      description: "Reaction shot - witness perspective",
      promptModifiers: {
        composition: { framing: "medium", layout: "witness in foreground, action in background", depth: "split focus showing reaction and cause" },
        camera: { angle: "over-shoulder or witness POV", lens_mm: 35 },
        focusShift: "Focus on witnesses/observers reacting",
      },
    },
  ],

  // Scènes d'établissement - variations architecturales
  establishing: [
    {
      id: "grand-scale",
      suffix: "grand-scale",
      cameraAngle: "epic_wide",
      description: "Epic wide showing full architectural grandeur",
      promptModifiers: {
        composition: { framing: "extreme_wide", layout: "architectural symmetry or dramatic asymmetry", depth: "infinite depth showing scale" },
        camera: { angle: "low angle emphasizing grandeur", lens_mm: 14 },
      },
    },
    {
      id: "architectural-detail",
      suffix: "arch-detail",
      cameraAngle: "detail_focus",
      description: "Architectural detail - craftsmanship focus",
      promptModifiers: {
        composition: { framing: "close", layout: "detail composition", depth: "shallow DOF on architectural element" },
        camera: { angle: "three-quarter detail angle", lens_mm: 85 },
        focusShift: "Focus on bio-organic architectural details - chitin, membrane, silk",
      },
    },
    {
      id: "inhabitant-scale",
      suffix: "inhabitant-scale",
      cameraAngle: "scale_reference",
      description: "Show scale with inhabitant for reference",
      promptModifiers: {
        composition: { framing: "wide", layout: "Moostik figure for scale reference", depth: "character in foreground, architecture behind" },
        camera: { angle: "eye-level with character", lens_mm: 35 },
      },
    },
  ],

  // Scènes de bar/ambiance - variations atmosphériques
  bar: [
    {
      id: "atmosphere-wide",
      suffix: "atmosphere-wide",
      cameraAngle: "wide_atmosphere",
      description: "Wide atmospheric shot capturing bar mood",
      promptModifiers: {
        composition: { framing: "wide", layout: "atmospheric composition with depth", depth: "layered patrons, smoke, light" },
        camera: { angle: "slightly elevated surveying scene", lens_mm: 24 },
      },
    },
    {
      id: "patron-portrait",
      suffix: "patron-portrait",
      cameraAngle: "portrait_bar",
      description: "Portrait of patron in bar lighting",
      promptModifiers: {
        composition: { framing: "close", layout: "portrait with bar elements", depth: "shallow DOF, bokeh lights" },
        camera: { angle: "intimate three-quarter", lens_mm: 85 },
      },
    },
    {
      id: "detail-sensual",
      suffix: "sensual-detail",
      cameraAngle: "sensual_macro",
      description: "Sensual detail - nectar, curves, light on chitin",
      promptModifiers: {
        composition: { framing: "macro", layout: "sensual detail composition", depth: "extreme shallow, soft background" },
        camera: { angle: "intimate low angle", lens_mm: 100 },
        focusShift: "Focus on sensual elements - nectar drops, curved forms, light on surfaces",
      },
    },
  ],

  // Scènes de formation/entraînement - variations militaires
  training: [
    {
      id: "formation-wide",
      suffix: "formation-wide",
      cameraAngle: "military_wide",
      description: "Wide shot showing full formation/training ground",
      promptModifiers: {
        composition: { framing: "wide", layout: "military formation composition", depth: "deep showing ranks and scale" },
        camera: { angle: "slightly elevated military perspective", lens_mm: 35 },
      },
    },
    {
      id: "drill-action",
      suffix: "drill-action",
      cameraAngle: "action_training",
      description: "Dynamic training action shot",
      promptModifiers: {
        composition: { framing: "medium", layout: "dynamic training composition", depth: "mid-depth with motion blur" },
        camera: { angle: "low angle heroic", lens_mm: 35 },
        momentShift: "Peak training moment - strike, block, formation",
      },
    },
    {
      id: "warrior-portrait",
      suffix: "warrior-portrait",
      cameraAngle: "warrior_close",
      description: "Close portrait of warrior in training",
      promptModifiers: {
        composition: { framing: "close", layout: "warrior portrait, determination visible", depth: "shallow focus on face" },
        camera: { angle: "eye-level warrior respect", lens_mm: 85 },
        focusShift: "Focus on warrior's determination and proboscis weapon",
      },
    },
  ],

  // Default pour autres scènes
  default: [
    {
      id: "alternative-angle",
      suffix: "alt-angle",
      cameraAngle: "alternative",
      description: "Alternative camera angle",
      promptModifiers: {
        composition: { framing: "medium", layout: "alternative composition", depth: "balanced staging" },
        camera: { angle: "complementary angle to main shot", lens_mm: 35 },
      },
    },
    {
      id: "detail-focus",
      suffix: "detail-focus",
      cameraAngle: "detail",
      description: "Detail-focused variation",
      promptModifiers: {
        composition: { framing: "close", layout: "detail-oriented", depth: "shallow DOF" },
        camera: { angle: "intimate detail angle", lens_mm: 85 },
      },
    },
    {
      id: "context-wide",
      suffix: "context-wide",
      cameraAngle: "context",
      description: "Wider context shot",
      promptModifiers: {
        composition: { framing: "wide", layout: "contextual composition", depth: "deep staging" },
        camera: { angle: "establishing context angle", lens_mm: 24 },
      },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE TYPE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectSceneCategory(shot: any): string {
  const description = (shot.description || "").toLowerCase();
  const name = (shot.name || "").toLowerCase();
  const sceneType = shot.sceneType || "";
  
  // Apocalyptic scenes
  if (sceneType === "apocalyptic" || 
      description.includes("explos") || 
      description.includes("flamm") || 
      description.includes("feu") ||
      description.includes("byss") ||
      description.includes("génocide") ||
      description.includes("mort") ||
      description.includes("écras")) {
    return "apocalyptic";
  }
  
  // Chase/escape scenes
  if (description.includes("fuit") || 
      description.includes("fuite") || 
      description.includes("cours") ||
      description.includes("chase") ||
      description.includes("escape") ||
      description.includes("poursuit")) {
    return "chase";
  }
  
  // Emotional/sacrifice scenes
  if (description.includes("sacrifice") || 
      description.includes("deuil") || 
      description.includes("pleur") ||
      description.includes("émotion") ||
      description.includes("silenc") ||
      description.includes("grandit")) {
    return "emotional";
  }
  
  // Action scenes
  if (description.includes("combat") || 
      description.includes("impact") || 
      description.includes("frappe") ||
      description.includes("attaque") ||
      name.includes("impact") ||
      description.includes("balaye")) {
    return "action";
  }
  
  // Establishing/architecture scenes
  if (name.includes("establishing") || 
      description.includes("village") ||
      description.includes("cité") ||
      description.includes("pneu") ||
      description.includes("construction") ||
      description.includes("tire city")) {
    return "establishing";
  }
  
  // Bar scenes
  if (description.includes("bar") || 
      description.includes("nectar") ||
      description.includes("baddies") ||
      description.includes("sexy") ||
      description.includes("ti sang")) {
    return "bar";
  }
  
  // Training scenes
  if (description.includes("entraîn") || 
      description.includes("militaire") ||
      description.includes("formation") ||
      description.includes("proboscis") ||
      description.includes("tactique")) {
    return "training";
  }
  
  return "default";
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log("═══════════════════════════════════════════════════════════════════════════════");
  console.log("GENERATE SOTA VARIATIONS - 4 PAR SHOT");
  console.log("═══════════════════════════════════════════════════════════════════════════════\n");

  // Load episode
  const episodePath = path.join(__dirname, "../data/episodes/t05.json");
  const rawData = fs.readFileSync(episodePath, "utf-8");
  const episode = JSON.parse(rawData);

  console.log(`📁 Épisode: ${episode.title}`);
  console.log(`🎬 Shots: ${episode.shots.length}`);
  console.log(`🎯 Target: ${episode.shots.length * 4} images (4 variations par shot)\n`);

  let totalVariationsAdded = 0;
  const categoryCounts: Record<string, number> = {};

  // Process each shot
  for (const shot of episode.shots) {
    const category = detectSceneCategory(shot);
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    
    const strategies = VARIATION_STRATEGIES[category] || VARIATION_STRATEGIES.default;
    
    console.log(`\n▸ Shot ${shot.number.toString().padStart(3, "0")}: ${shot.name}`);
    console.log(`  Category: ${category}`);
    
    // Get existing SOTA variation count
    const existingSotaVariations = (shot.variations || []).filter((v: any) => 
      v.id.startsWith("sota-") && !v.id.includes("legacy")
    );
    
    // We want exactly 4 total SOTA variations (1 main + 3 additional)
    const variationsNeeded = 4 - existingSotaVariations.length;
    
    if (variationsNeeded <= 0) {
      console.log(`  ✓ Already has ${existingSotaVariations.length} SOTA variations`);
      continue;
    }
    
    console.log(`  Adding ${variationsNeeded} variations...`);
    
    // Add variations based on strategies
    for (let i = 0; i < Math.min(variationsNeeded, strategies.length); i++) {
      const strategy = strategies[i];
      const variationId = `sota-${shot.id}-${strategy.suffix}`;
      
      // Check if this variation already exists
      const exists = shot.variations?.some((v: any) => v.id === variationId);
      if (exists) continue;
      
      // Clone and modify prompt for this variation
      const basePrompt = JSON.parse(JSON.stringify(shot.prompt));
      
      // Apply strategy modifiers
      if (strategy.promptModifiers.composition) {
        basePrompt.composition = {
          ...basePrompt.composition,
          ...strategy.promptModifiers.composition,
        };
      }
      
      if (strategy.promptModifiers.camera) {
        basePrompt.camera = {
          ...basePrompt.camera,
          ...strategy.promptModifiers.camera,
        };
        // Update scene_graph camera if exists
        if (basePrompt.scene_graph?.camera) {
          basePrompt.scene_graph.camera = {
            ...basePrompt.scene_graph.camera,
            shot_type: strategy.cameraAngle,
            lens: `${strategy.promptModifiers.camera.lens_mm || basePrompt.camera.lens_mm}mm`,
          };
        }
      }
      
      // Add focus/moment modifiers to goal and scene_intent
      if (strategy.promptModifiers.focusShift) {
        basePrompt.goal = `${basePrompt.goal} ${strategy.promptModifiers.focusShift}`;
        if (basePrompt.meta?.scene_intent) {
          basePrompt.meta.scene_intent = `${basePrompt.meta.scene_intent} ${strategy.promptModifiers.focusShift}`;
        }
      }
      
      if (strategy.promptModifiers.momentShift) {
        basePrompt.goal = `${basePrompt.goal} ${strategy.promptModifiers.momentShift}`;
        if (basePrompt.meta?.scene_intent) {
          basePrompt.meta.scene_intent = `${basePrompt.meta.scene_intent} ${strategy.promptModifiers.momentShift}`;
        }
      }
      
      // Update asset_id
      if (basePrompt.meta) {
        basePrompt.meta.asset_id = `${shot.id.toUpperCase().replace(/-/g, "_")}_${strategy.suffix.toUpperCase()}`;
      }
      
      // Create new variation
      const newVariation = {
        id: variationId,
        cameraAngle: strategy.cameraAngle,
        status: "pending",
        createdAt: new Date().toISOString(),
        sotaVersion: "BLOODWINGS_2026_01",
        strategy: strategy.id,
        description: strategy.description,
        promptOverrides: {
          composition: strategy.promptModifiers.composition,
          camera: strategy.promptModifiers.camera,
          focusShift: strategy.promptModifiers.focusShift,
          momentShift: strategy.promptModifiers.momentShift,
        },
        // Store the full modified prompt for this variation
        customPrompt: basePrompt,
      };
      
      if (!shot.variations) {
        shot.variations = [];
      }
      shot.variations.push(newVariation);
      totalVariationsAdded++;
      
      console.log(`    + ${variationId}: ${strategy.description}`);
    }
    
    // Reset shot status to pending for regeneration
    shot.status = "pending";
    shot.updatedAt = new Date().toISOString();
  }

  // Save updated episode
  fs.writeFileSync(episodePath, JSON.stringify(episode, null, 2));

  // Summary
  console.log("\n═══════════════════════════════════════════════════════════════════════════════");
  console.log("RÉSUMÉ");
  console.log("═══════════════════════════════════════════════════════════════════════════════");
  console.log(`\n📊 Catégories détectées:`);
  for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`   - ${cat}: ${count} shots`);
  }
  console.log(`\n✅ Variations ajoutées: ${totalVariationsAdded}`);
  console.log(`📁 Fichier sauvegardé: ${episodePath}`);
  
  const totalVariations = episode.shots.reduce((sum: number, shot: any) => 
    sum + (shot.variations?.filter((v: any) => v.id.startsWith("sota-") && v.status === "pending").length || 0), 0
  );
  console.log(`\n🚀 Total variations SOTA à générer: ${totalVariations}`);
  console.log(`⏱️ Estimation (10 parallèle, ~15s/image): ~${Math.ceil(totalVariations * 15 / 10 / 60)} minutes`);
}

// Run
main().catch(console.error);
