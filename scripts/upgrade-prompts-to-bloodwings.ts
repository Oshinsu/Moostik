/**
 * MOOSTIK - Upgrade Prompts to BLOODWINGS Format
 * SOTA Janvier 2026
 * 
 * Ce script upgrade tous les prompts EP0 au format BLOODWINGS complet :
 * - Ajoute meta.scene_intent
 * - Ajoute scene_graph.gigantism_cues
 * - Ajoute parameters NB2
 * - Ajoute constraints
 * - Enrichit les descriptions subjects
 * - Étend les negatives
 */

import * as fs from "fs";
import * as path from "path";

const EPISODES_DIR = path.join(__dirname, "../data/episodes");

// ============================================================================
// GIGANTISM CUES PAR TYPE DE SCÈNE
// ============================================================================

const GIGANTISM_CUES = {
  village: [
    "fabric threads appear as massive tree trunks",
    "crumbs look like weathered boulders",
    "lint balls tumble like slow tumbleweeds",
    "dust motes drift like slow asteroids",
    "carpet fibers form a dense forest",
  ],
  interior: [
    "furniture legs appear as towering columns",
    "table surface stretches like an infinite plain",
    "lamp light appears as a distant sun",
    "baseboards tower like fortress walls",
  ],
  exterior: [
    "grass blades tower like green skyscrapers",
    "raindrops fall like massive meteors",
    "dew drops cling like spherical lakes",
    "flower petals serve as landing platforms",
  ],
  human_interaction: [
    "human hand approaches as a slow-moving wall of doom",
    "human fingers rise as colossal pillars",
    "child's shadow covers entire village like eclipse",
    "human breath creates hurricane winds",
    "spray droplets fall like toxic rain",
  ],
  bar: [
    "glass surfaces reflect like frozen lakes",
    "drink droplets cling like decorative spheres",
    "smoke wisps curl like massive clouds",
    "lantern light pools like amber lakes",
  ],
  genocide: [
    "BYSS spray cloud spreads as apocalyptic fog",
    "aerosol nozzle looms as a volcano",
    "toxic mist engulfs like a tidal wave",
    "child's fingers grip like continental plates",
    "ember particles float like dying stars",
  ],
};

// ============================================================================
// SCENE INTENTS ENRICHIS PAR SHOT
// ============================================================================

const SCENE_INTENTS: Record<string, string> = {
  "shot-1": "Peaceful moostik village moments before genocide: child's titan-hand approaches like a slow-motion apocalypse. Contrast between idyllic micro-scale life and looming macro-scale death. Pixar-dark beauty meets horror.",
  "shot-2": "Mama Dorval's ultimate sacrifice: a mother mosquito shields her baby with her own body as toxic BYSS spray descends. Heroic tragedy at microscopic scale. The most emotionally devastating moment of the series.",
  "shot-3": "The toxic BYSS cloud spreads through the village like a biblical plague. Volumetric crimson fog, ember particles, mass death. The genocide in full apocalyptic horror.",
  "shot-4": "Baby Dorval emerges alone from the devastation. His mother's body lies beneath the toxic residue. A lone survivor in a landscape of death. Overwhelming grief at micro-scale.",
  "shot-5": "General Aedes discovers the orphaned Baby Dorval among the corpses. The moment of hope in despair - the birth of a future warrior. Military mentor meets traumatized child.",
  "shot-6": "Young Dorval trains with General Aedes at Fort Sang-Noir. The transformation from victim to warrior. Discipline, determination, and the seeds of vengeance.",
  "shot-7": "Young Dorval studies human anatomy with Scholar Culex at the Academy of Blood. Know your enemy. The intellectual side of resistance.",
  "shot-8": "The secret Bloodwings hideout beneath the bar. Veterans gather, plans are made. The resistance takes shape in shadows and whispers.",
  "shot-9": "Singer Stegomyia performs at Bar Ti Sang. A moment of culture and beauty amidst the darkness. Music as resistance, art as survival.",
  "shot-10": "General Aedes rallies the Bloodwings for action. The call to arms. Warriors unite with a common purpose - survival and vengeance.",
  "shot-011": "Present day: Koko, Mila, and Trez surround Papy Tik at Bar Ti Sang. The survivors share their trauma, preserving memory for future generations. Intimate storytelling moment.",
  "shot-012": "Flashback to the peaceful village before the horror. Idyllic daily life, community, innocence. The calm before the storm that makes the tragedy hit harder.",
  "shot-013": "The desperate flight through the jalousies (window shutters). Moostiks squeeze through the slats to escape the toxic cloud. Claustrophobic survival horror.",
  "shot-014": "Young Dorval swears vengeance over his mother's grave. The oath that defines his life. Raw emotion, determination, the birth of a warrior's purpose.",
  "shot-015": "The official formation of the Bloodwings resistance. Veterans and survivors unite under the Droplet-Eye banner. Hope rises from ashes.",
  "shot-exp-16": "The innocence that kills: Caribbean child discovers the BYSS can like a new toy. Tragic irony - play becomes genocide. POV emphasizes the child's massive scale.",
  "shot-exp-17": "The first spray: the child presses the nozzle, releasing the toxic cloud. The moment of doom. Slow-motion catastrophe from Moostik perspective.",
  "shot-exp-18": "First victims fall as the spray reaches them. Bodies drop mid-flight, mid-conversation. The randomness and totality of the massacre.",
  "shot-exp-19": "Mama Dorval's scream echoes through the village as she realizes the danger. A mother's instinct activates. The race to save her child begins.",
  "shot-exp-20": "Mama Dorval wraps her wings around Baby Dorval as the spray cloud engulfs them. The protective cocoon. Love manifest as physical shield.",
  "shot-exp-21": "Mama Dorval's last breath as she succumbs to the poison. Her wings still protecting her child. The ultimate maternal sacrifice.",
  "shot-exp-22": "Baby Dorval stirs beneath his mother's wings, alone and confused. The horror of waking to genocide. Innocence confronting mortality.",
  "shot-exp-23": "Wide shot of the devastated village. Bodies everywhere, structures destroyed, toxic residue coating everything. The aftermath of genocide.",
  "shot-exp-24": "Discovery of the jalousies escape route. A potential path to survival. Hope amidst hopelessness.",
  "shot-exp-25": "Approach to the jalousies passage. The narrow slats loom like prison bars. Tension builds as survivors gather.",
  "shot-exp-26": "Squeezing through the jalousies. Claustrophobic desperation. Wings folded, bodies compressed, survival instinct overriding fear.",
  "shot-exp-27": "Emergence from the jalousies into light. Survivors see the outside world. Relief mixed with trauma. Rebirth through architectural escape.",
  "shot-exp-28": "Alone in the vast world. A single Moostik against the infinite exterior. Existential solitude. The weight of being the last.",
};

// ============================================================================
// DEFAULT NB2 PARAMETERS
// ============================================================================

const DEFAULT_PARAMS = {
  aspect_ratio: "16:9",
  render_resolution: "3840x2160",
  output_count: 1,
  steps: 70,
  guidance_strength: 8.5,
  sharpness: 0.34,
  film_grain: 0.13,
};

// ============================================================================
// USP CORE PAR DÉFAUT
// ============================================================================

const USP_CORE = [
  "Moostik POV: everything appears COLOSSAL from mosquito perspective",
  "Humans are terrain hazards, not characters - show body parts as landscapes",
  "Proboscis is the ONLY weapon - visible on all Moostik characters",
  "Démoniaque mignon aesthetic - cute but menacing",
  "Caribbean/Martiniquais humans ONLY - ebony skin, Pixar-stylized",
];

// ============================================================================
// EXTENDED NEGATIVES
// ============================================================================

const EXTENDED_NEGATIVES = [
  // Style
  "anime style",
  "cartoon style",
  "2D illustration",
  "flat shading",
  "cheap CGI look",
  "neon oversaturation",
  "concept art style",
  "sketch style",
  
  // Architecture
  "human architecture in Moostik scenes",
  "human silhouettes in Moostik cities",
  "human furniture in Moostik locations",
  "modern buildings",
  "concrete structures",
  
  // Technology
  "modern technology",
  "guns",
  "manufactured weapons",
  "tanks",
  "machines",
  "vehicles",
  "electricity",
  "electronics",
  "screens",
  "computers",
  "LED lights",
  
  // Anatomy
  "mosquito without visible proboscis",
  "oversized mosquitoes",
  "human-scale insects",
  "realistic mosquitoes",
  "cute cartoon bugs",
  
  // Humans
  "white caucasian humans",
  "asian humans",
  "light-skinned humans",
  "non-Pixar realistic humans",
  "human faces in Moostik-scale scenes",
  
  // Other
  "random logos",
  "watermarks",
  "readable text unless specified",
  "gore close-ups",
  "intestines visible",
];

// ============================================================================
// CONSTRAINTS PAR TYPE DE SCÈNE
// ============================================================================

function getConstraints(shotId: string, sceneType: string): { must_include: string[]; must_not_include: string[] } {
  const base = {
    must_include: [
      "visible proboscis on all Moostik characters",
      "micro-scale texture cues",
      "Pixar-dark feature film quality",
    ],
    must_not_include: [
      "human faces in Moostik-scale scenes",
      "modern technology",
      "white/caucasian humans",
    ],
  };
  
  // Scènes avec humains
  if (shotId.includes("shot-1") || shotId.includes("shot-exp-16") || shotId.includes("shot-exp-17")) {
    base.must_include.push("Caribbean child hands with ebony skin");
    base.must_include.push("BYSS aerosol can visible");
    base.must_include.push("gigantic scale from Moostik POV");
  }
  
  // Scènes de génocide
  if (sceneType === "genocide" || shotId.includes("exp-17") || shotId.includes("exp-18") || shotId.includes("exp-19")) {
    base.must_include.push("toxic BYSS spray cloud");
    base.must_include.push("apocalyptic atmosphere");
    base.must_include.push("ember particles and soot");
  }
  
  // Scènes de bar
  if (shotId.includes("shot-011") || shotId.includes("shot-8") || shotId.includes("shot-9")) {
    base.must_include.push("bioluminescent amber lighting");
    base.must_include.push("intimate bar atmosphere");
  }
  
  return base;
}

// ============================================================================
// DÉTERMINER LE TYPE DE SCÈNE
// ============================================================================

function getSceneType(shot: any): string {
  const name = shot.name?.toLowerCase() || "";
  const id = shot.id?.toLowerCase() || "";
  
  if (name.includes("bar") || name.includes("voix") || id.includes("011")) return "bar";
  if (name.includes("spray") || name.includes("nuage") || name.includes("victime") || name.includes("toxique")) return "genocide";
  if (name.includes("village") || name.includes("paisible")) return "village";
  if (name.includes("jalousie") || name.includes("passage")) return "interior";
  if (name.includes("enfant") || name.includes("ombre") || name.includes("main")) return "human_interaction";
  
  return "village";
}

// ============================================================================
// UPGRADE PROMPT
// ============================================================================

function upgradePrompt(shot: any): any {
  const prompt = shot.prompt;
  if (!prompt) return shot;
  
  const sceneType = getSceneType(shot);
  const shotId = shot.id;
  
  // Générer un seed fixe basé sur l'ID du shot
  const seed = Math.abs(shotId.split("").reduce((a: number, b: string) => a + b.charCodeAt(0), 0) * 1000000);
  
  // Ajouter meta si absent
  if (!prompt.meta) {
    prompt.meta = {
      model_version: "nano-banana-2-pro",
      task_type: "cinematic_keyframe",
      project: "MOOSTIK_EP0",
      asset_id: shotId,
      scene_intent: SCENE_INTENTS[shotId] || SCENE_INTENTS[shotId.split("-").slice(0, 2).join("-")] || shot.description || prompt.goal,
    };
  }
  
  // Ajouter references si absent
  if (!prompt.references) {
    prompt.references = {
      da: "bloodwings_da.png",
    };
  }
  
  // Ajouter scene_graph si absent
  if (!prompt.scene_graph) {
    const gigantismCues = GIGANTISM_CUES[sceneType as keyof typeof GIGANTISM_CUES] || GIGANTISM_CUES.village;
    
    prompt.scene_graph = {
      style_bible: {
        usp_core: USP_CORE,
        look: "premium 3D animated feature film, Pixar-dark, cute demonic, démoniaque mignon",
        palette: ["obsidian black", "blood red", "deep crimson", "copper", "warm amber"],
      },
      environment: {
        space: prompt.scene?.location || shot.name,
        gigantism_cues: gigantismCues,
        mood: sceneType === "genocide" ? "apocalyptic horror" :
              sceneType === "bar" ? "intimate reflection" :
              sceneType === "village" ? "idyllic peace" : "atmospheric tension",
      },
    };
  }
  
  // Ajouter parameters si absent
  if (!prompt.parameters) {
    prompt.parameters = {
      ...DEFAULT_PARAMS,
      seed,
    };
  }
  
  // Ajouter constraints si absent
  if (!prompt.constraints) {
    prompt.constraints = getConstraints(shotId, sceneType);
  }
  
  // Étendre les negatives si incomplets
  if (prompt.negative && prompt.negative.length < EXTENDED_NEGATIVES.length) {
    prompt.negative = [...new Set([...prompt.negative, ...EXTENDED_NEGATIVES])];
  }
  
  // Enrichir les subjects avec style Pixar
  if (prompt.subjects) {
    prompt.subjects = prompt.subjects.map((subject: any) => {
      // Si la description ne mentionne pas Pixar, l'enrichir
      if (!subject.description?.toLowerCase().includes("pixar")) {
        const enrichedDesc = `${subject.description}. Pixar-dark 3D feature film quality, démoniaque mignon aesthetic, 8K textures, ILM-grade VFX.`;
        return { ...subject, description: enrichedDesc };
      }
      return subject;
    });
  }
  
  return { ...shot, prompt };
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  MOOSTIK - Upgrade Prompts to BLOODWINGS Format            ║");
  console.log("║  SOTA Janvier 2026                                         ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");
  
  const episodeFiles = fs.readdirSync(EPISODES_DIR).filter(f => f.endsWith(".json"));
  
  let totalUpgraded = 0;
  
  for (const file of episodeFiles) {
    const filePath = path.join(EPISODES_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const episode = JSON.parse(content);
    
    console.log(`\n📁 Processing ${file}...`);
    
    let upgradedCount = 0;
    
    for (let i = 0; i < episode.shots.length; i++) {
      const shot = episode.shots[i];
      
      // Vérifier si déjà au format BLOODWINGS complet
      const hasAllFields = shot.prompt?.meta && shot.prompt?.scene_graph && shot.prompt?.parameters && shot.prompt?.constraints;
      
      if (!hasAllFields) {
        episode.shots[i] = upgradePrompt(shot);
        upgradedCount++;
        console.log(`   ✓ ${shot.id} → Upgraded to BLOODWINGS`);
      } else {
        console.log(`   ○ ${shot.id} → Already BLOODWINGS`);
      }
    }
    
    // Sauvegarder
    fs.writeFileSync(filePath, JSON.stringify(episode, null, 2));
    
    totalUpgraded += upgradedCount;
    console.log(`   📊 ${upgradedCount}/${episode.shots.length} shots upgraded`);
  }
  
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║                    Upgrade Complete!                       ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log(`\n📊 Total shots upgraded: ${totalUpgraded}`);
  console.log("\n✅ All prompts now include:");
  console.log("   - meta.scene_intent (rich narrative description)");
  console.log("   - scene_graph.gigantism_cues (micro-scale POV)");
  console.log("   - parameters (NB2 optimized: steps=70, guidance=8.5)");
  console.log("   - constraints (must_include/must_not_include)");
  console.log("   - Extended negatives (29+ elements)");
  console.log("   - Enriched subject descriptions (Pixar-dark style)");
}

main();
