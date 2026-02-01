/**
 * MOOSTIK - Convert Legacy Shots to SOTA JsonMoostik Format
 * 
 * Ce script convertit les shots utilisant l'ancien format MoostikPrompt
 * vers le nouveau format JsonMoostik SOTA constitutionnel.
 */

import * as fs from "fs";
import * as path from "path";

const EPISODES_DIR = path.join(__dirname, "../data/episodes");

// ============================================================================
// INVARIANTS CONSTITUTIONNELS
// ============================================================================

const SOTA_INVARIANTS = [
  "Style: Pixar-dark 3D feature-film quality, ILM-grade VFX, démoniaque mignon aesthetic",
  "Palette: obsidian black (#0B0B0E), blood red (#8B0015), deep crimson (#B0002A), copper (#9B6A3A), warm amber (#FFB25A)",
  "Moostik anatomy: MUST have visible needle-like proboscis (their ONLY weapon), large expressive amber/orange eyes, translucent wings with crimson veins",
  "Moostik scale: MICROSCOPIC - dust-speck sized compared to humans",
  "Moostik bodies: matte obsidian chitin (#0B0B0E) with subtle satin highlights",
  "Moostik architecture: Renaissance bio-organic Gothic style - NO human architecture in Moostik scenes",
  "Moostik materials: chitin, resin, wing-membrane, silk threads, nectar-wax, blood-ruby",
  "Moostik lighting: bioluminescent amber/crimson lanterns, nectar-wax candles - NO electric lights",
  "Technology: Medieval fantasy ONLY - NO modern weapons, NO electricity, NO machines",
  "Combat: Proboscis fighting ONLY - NO guns, tanks, or manufactured weapons",
  "Clan sigil: Droplet-Eye (blood drop with stylized eye) on wax seals and insignia",
  "Humans: Antillean/Caribbean ONLY (ebony skin), Pixar-stylized proportions",
  "Human POV: Humans appear as COLOSSAL titans from Moostik perspective"
];

const SOTA_NEGATIVE = [
  "human architecture in Moostik scenes",
  "human silhouettes in Moostik cities",
  "human furniture style in Moostik locations",
  "modern technology",
  "guns weapons tanks machines vehicles",
  "electricity electronics screens computers",
  "anime cartoon 2D illustration style",
  "flat shading cheap CGI",
  "oversized mosquitoes human-scale insects",
  "white caucasian humans",
  "readable text watermarks logos",
  "metal weapons swords armor",
  "modern buildings skyscrapers"
];

// ============================================================================
// TYPES
// ============================================================================

interface LegacyPrompt {
  task: string;
  deliverable?: string;
  goal?: string;
  invariants?: string[];
  foreground?: {
    subjects?: string[];
    micro_detail?: string[];
    emotion?: string;
  };
  midground?: {
    environment?: string[];
    micro_city_architecture?: string[];
    action?: string[];
    threat?: string[];
  };
  background?: {
    location?: string[];
    human_threat?: string[];
    martinique_cues?: string[];
  };
  lighting?: {
    key?: string;
    fill?: string;
    effects?: string;
  };
  camera?: {
    framing?: string;
    lens?: string;
    movement?: string;
    depth_of_field?: string;
  };
  grade?: {
    look?: string;
    mood?: string;
  };
  negative_prompt?: string[];
}

interface JsonMoostikSubject {
  id?: string;
  name: string;
  priority: number;
  description: string;
  importance: "primary" | "secondary" | "background";
  action?: string;
  reference_image?: string;
}

interface JsonMoostik {
  task: "generate_image";
  deliverable: {
    type: "cinematic_still" | "character_sheet" | "location_establishing" | "action_shot";
    aspect_ratio: "16:9" | "21:9" | "4:3" | "1:1";
    resolution: "2K" | "4K" | "8K";
  };
  goal: string;
  invariants: string[];
  subjects: JsonMoostikSubject[];
  scene: {
    location: string;
    time: string;
    atmosphere: string[];
    materials: string[];
  };
  composition: {
    framing: "extreme_wide" | "wide" | "medium" | "close" | "extreme_close" | "macro";
    layout?: string;
    depth?: string;
  };
  camera: {
    format?: string;
    lens_mm?: number;
    aperture?: string;
    angle?: string;
  };
  lighting: {
    key: string;
    fill: string;
    rim?: string;
    notes?: string;
  };
  grade?: {
    look?: string;
    mood?: string;
  };
  negative: string[];
}

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

function isLegacyFormat(prompt: any): boolean {
  // Legacy format has "task": "Create: ..." pattern
  if (typeof prompt.task === "string" && prompt.task.startsWith("Create:")) {
    return true;
  }
  // Or has foreground/midground/background structure
  if (prompt.foreground || prompt.midground || prompt.background) {
    return true;
  }
  return false;
}

function isAlreadySota(prompt: any): boolean {
  return prompt.task === "generate_image" && 
         prompt.deliverable && 
         typeof prompt.deliverable === "object" &&
         prompt.deliverable.type;
}

function extractSubjectsFromLegacy(legacy: LegacyPrompt): JsonMoostikSubject[] {
  const subjects: JsonMoostikSubject[] = [];
  
  if (legacy.foreground?.subjects) {
    legacy.foreground.subjects.forEach((subjectStr, index) => {
      // Parse subject string like "Koko, elder survivor mosquito, scarred veteran..."
      const parts = subjectStr.split(",").map(s => s.trim());
      const name = parts[0] || `Subject ${index + 1}`;
      const description = parts.slice(1).join(", ");
      
      subjects.push({
        name,
        priority: index + 1,
        description: description || subjectStr,
        importance: index === 0 ? "primary" : index < 3 ? "secondary" : "background",
        action: legacy.midground?.action?.[index] || undefined,
      });
    });
  }
  
  return subjects;
}

function extractSceneFromLegacy(legacy: LegacyPrompt): JsonMoostik["scene"] {
  const location = legacy.background?.location?.[0] || 
                   legacy.midground?.environment?.[0] || 
                   "Unknown location";
  
  const atmosphere = [
    ...(legacy.midground?.environment || []),
    ...(legacy.background?.martinique_cues || []),
  ].filter(Boolean);
  
  const materials = legacy.midground?.micro_city_architecture || [];
  
  return {
    location,
    time: "Cinematic lighting",
    atmosphere: atmosphere.length > 0 ? atmosphere : ["Atmospheric depth", "Volumetric lighting"],
    materials: materials.length > 0 ? materials : ["Chitin", "Resin", "Wing-membrane"],
  };
}

function convertLegacyToSota(legacy: LegacyPrompt, shotName: string, shotDescription: string): JsonMoostik {
  // Extract goal from task or use description
  const goal = legacy.task?.replace("Create: ", "").split(" - ")[1] || 
               shotDescription || 
               "Generate cinematic frame";

  // Determine shot type from scene type or content
  let shotType: JsonMoostik["deliverable"]["type"] = "cinematic_still";
  if (legacy.foreground?.subjects?.length === 1) {
    shotType = "action_shot";
  }
  
  // Extract framing from camera
  let framing: JsonMoostik["composition"]["framing"] = "wide";
  const framingStr = legacy.camera?.framing?.toLowerCase() || "";
  if (framingStr.includes("close")) framing = "close";
  else if (framingStr.includes("medium")) framing = "medium";
  else if (framingStr.includes("extreme")) framing = "extreme_wide";
  else if (framingStr.includes("macro")) framing = "macro";

  const sota: JsonMoostik = {
    task: "generate_image",
    deliverable: {
      type: shotType,
      aspect_ratio: "16:9",
      resolution: "4K",
    },
    goal,
    invariants: SOTA_INVARIANTS,
    subjects: extractSubjectsFromLegacy(legacy),
    scene: extractSceneFromLegacy(legacy),
    composition: {
      framing,
      layout: legacy.camera?.framing || "Cinematic composition",
      depth: legacy.camera?.depth_of_field || "Shallow focus on subject",
    },
    camera: {
      format: "Anamorphic 2.39:1",
      lens_mm: 35,
      aperture: "f/1.4",
      angle: legacy.camera?.movement || "Static keyframe",
    },
    lighting: {
      key: legacy.lighting?.key || "Warm bioluminescent amber/crimson lantern light",
      fill: legacy.lighting?.fill || "Cool ambient bounce",
      rim: "Subtle edge separation",
      notes: legacy.lighting?.effects || "Volumetric atmosphere",
    },
    grade: legacy.grade || {
      look: "Pixar-dark cinematic, high contrast, rich blacks",
      mood: "Démoniaque mignon",
    },
    negative: legacy.negative_prompt || SOTA_NEGATIVE,
  };

  return sota;
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

function convertEpisode(episodeId: string) {
  console.log(`\n📝 Converting ${episodeId}...`);
  
  const filePath = path.join(EPISODES_DIR, `${episodeId}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️ Episode file not found`);
    return { converted: 0, skipped: 0, alreadySota: 0 };
  }
  
  const content = fs.readFileSync(filePath, "utf-8");
  const episode = JSON.parse(content);
  
  let converted = 0;
  let skipped = 0;
  let alreadySota = 0;
  
  for (const shot of episode.shots || []) {
    if (!shot.prompt) {
      skipped++;
      continue;
    }
    
    if (isAlreadySota(shot.prompt)) {
      alreadySota++;
      continue;
    }
    
    if (isLegacyFormat(shot.prompt)) {
      const sotaPrompt = convertLegacyToSota(
        shot.prompt as LegacyPrompt,
        shot.name,
        shot.description
      );
      
      shot.prompt = sotaPrompt;
      converted++;
      console.log(`  ✓ ${shot.id} → Converted to SOTA`);
    } else {
      skipped++;
    }
  }
  
  // Save updated episode
  fs.writeFileSync(filePath, JSON.stringify(episode, null, 2));
  
  return { converted, skipped, alreadySota };
}

function main() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║  MOOSTIK - Convert Legacy Shots to SOTA    ║");
  console.log("╚════════════════════════════════════════════╝");
  
  const episodes = fs.readdirSync(EPISODES_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => f.replace(".json", ""));
  
  let totalConverted = 0;
  let totalSkipped = 0;
  let totalAlreadySota = 0;
  
  for (const ep of episodes) {
    const { converted, skipped, alreadySota } = convertEpisode(ep);
    totalConverted += converted;
    totalSkipped += skipped;
    totalAlreadySota += alreadySota;
  }
  
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║          Conversion Complete! 🎉           ║");
  console.log("╚════════════════════════════════════════════╝");
  console.log(`\n📊 Summary:`);
  console.log(`   Already SOTA: ${totalAlreadySota}`);
  console.log(`   Converted:    ${totalConverted}`);
  console.log(`   Skipped:      ${totalSkipped}`);
}

main();
