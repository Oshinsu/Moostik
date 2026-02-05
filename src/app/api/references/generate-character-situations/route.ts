import { NextRequest, NextResponse } from "next/server";
import { generateWithJsonMoostik } from "@/lib/replicate";
import { getCharacter, getCharacters, updateCharacterReferenceImages, getLocation } from "@/lib/storage";
import { 
  createEmptyJsonMoostik, 
  MOOSTIK_CAMERA_PRESETS, 
  MOOSTIK_LIGHTING_PRESETS,
  MOOSTIK_ATMOSPHERE_PRESETS,
  type JsonMoostik,
  type JsonMoostikSubject 
} from "@/lib/json-moostik-standard";
import path from "path";

// ============================================================================
// 5 SITUATIONS JSON MOOSTIK pour chaque personnage
// ============================================================================
const CHARACTER_SITUATIONS: {
  id: string;
  name: string;
  camera: typeof MOOSTIK_CAMERA_PRESETS.portrait;
  lighting: typeof MOOSTIK_LIGHTING_PRESETS.bar_scene;
  composition: { framing: "extreme_wide" | "wide" | "medium" | "close" | "extreme_close" | "macro"; layout: string; depth: string };
  atmosphere: string[];
  actionPrompt: string;
}[] = [
  {
    id: "portrait",
    name: "Portrait Émotionnel",
    camera: {
      format: "medium_format",
      lens_mm: 85,
      aperture: "f/2.0",
      angle: "eye-level intimate portrait",
    },
    lighting: {
      key: "soft beauty light catching catchlights in eyes (#FFB25A)",
      fill: "subtle warm fill from below (#1A0F10)",
      rim: "strong crimson rim defining proboscis and wings (#B0002A)",
      notes: "Rembrandt triangle, subtle film grain, intimate mood",
    },
    composition: {
      framing: "close",
      layout: "rule of thirds, eyes on upper intersection",
      depth: "sharp focus on face | soft shoulder foreground | blurred background",
    },
    atmosphere: ["intimate", "emotional depth", "catchlights", "subtle dust motes"],
    actionPrompt: "emotional portrait revealing inner thoughts, subtle expression of determination or melancholy",
  },
  {
    id: "action",
    name: "En Action/Combat",
    camera: {
      format: "action_cam",
      lens_mm: 24,
      aperture: "f/4.0",
      angle: "dynamic low angle, heroic perspective",
    },
    lighting: {
      key: "harsh directional combat light (#FFB25A)",
      fill: "minimal, deep shadows (#0B0B0E)",
      rim: "intense crimson back light silhouette (#B0002A)",
      notes: "motion blur on extremities, speed lines in atmosphere",
    },
    composition: {
      framing: "medium",
      layout: "diagonal composition, dynamic tension",
      depth: "motion blur foreground | sharp character mid | blurred action background",
    },
    atmosphere: ["combat intensity", "motion blur", "adrenaline", "wing-beat air currents"],
    actionPrompt: "dynamic action pose, proboscis extended aggressively or defensively, wings spread mid-flight, intense battle determination",
  },
  {
    id: "social",
    name: "Interaction Sociale",
    camera: {
      format: "large_format",
      lens_mm: 50,
      aperture: "f/2.8",
      angle: "medium shot, natural social distance",
    },
    lighting: {
      key: "warm amber practicals from bar lanterns (#FFB25A)",
      fill: "ambient bounce from chitin surfaces (#1A0F10)",
      rim: "subtle crimson accent from background (#8B0015)",
      notes: "cozy bar atmosphere, volumetric haze, intimate gathering",
    },
    composition: {
      framing: "medium",
      layout: "two-shot or group composition space",
      depth: "foreground elements | character focus | bar background blur",
    },
    atmosphere: ["warm haze", "nectar steam", "intimate shadows", "social warmth"],
    actionPrompt: "engaged in conversation or social interaction, natural body language, perhaps holding a nectar goblet, relaxed social demeanor",
  },
  {
    id: "emotional",
    name: "Moment Émotionnel Intense",
    camera: {
      format: "anamorphic",
      lens_mm: 75,
      aperture: "f/2.0",
      angle: "dutch angle or canted for emotional distress",
    },
    lighting: {
      key: "single dramatic source (#FFB25A or #B0002A depending on emotion)",
      fill: "almost none, deep crushing blacks (#0B0B0E)",
      rim: "harsh emotional rim light (#B0002A)",
      notes: "Chiaroscuro, tears catch light if crying, raw vulnerability",
    },
    composition: {
      framing: "extreme_close",
      layout: "tight framing, face fills frame, uncomfortable intimacy",
      depth: "sharp facial detail | everything else soft blur",
    },
    atmosphere: ["emotional intensity", "tears or rage", "heavy breathing visible", "vulnerability"],
    actionPrompt: "raw emotional moment - grief, rage, joy, or despair, tears glistening or proboscis trembling, completely vulnerable and exposed",
  },
  {
    id: "environment",
    name: "Dans son Environnement",
    camera: {
      format: "large_format",
      lens_mm: 35,
      aperture: "f/5.6",
      angle: "environmental portrait, context visible",
    },
    lighting: {
      key: "natural ambient from environment (#FFB25A)",
      fill: "environmental bounce (#1A0F10)",
      rim: "architectural light sources (#B0002A)",
      notes: "character in context, environment as character",
    },
    composition: {
      framing: "wide",
      layout: "character placed in context, meaningful objects visible",
      depth: "environmental foreground | character mid | location background",
    },
    atmosphere: ["location-specific atmosphere", "character in context", "meaningful props"],
    actionPrompt: "at home in their natural environment, surrounded by meaningful objects and context that define their role",
  },
];

// Mapping personnage -> lieu typique
const CHARACTER_LOCATIONS: Record<string, string> = {
  "papy-tik": "bar-ti-sang",
  "young-dorval": "fort-sang-noir",
  "baby-dorval": "cooltik-village",
  "mama-dorval": "cooltik-village",
  "general-aedes": "fort-sang-noir",
  "scholar-culex": "academy-of-blood",
  "bartender-anopheles": "bar-ti-sang",
  "singer-stegomyia": "bar-ti-sang",
  "femme-fatale-tigresse": "bar-ti-sang",
  "evil-pik": "fort-sang-noir",
  "petit-t1": "fort-sang-noir",
  "doc-hemoglobin": "academy-of-blood",
  "mama-zika": "nursery-pods",
  "captain-dengue": "tire-city",
  "infiltrator-aedes-albopictus": "creole-house-enemy",
  "child-killer": "martinique-house-interior",
  "koko-survivor": "genocide-memorial",
  "mila-survivor": "cathedral-of-blood",
  "trez-survivor": "tire-city",
};

/**
 * POST /api/references/generate-character-situations
 * Génère une situation spécifique pour un personnage
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, situationType, customPrompt } = body;

    if (!characterId) {
      return NextResponse.json(
        { error: "Missing characterId" },
        { status: 400 }
      );
    }

    const character = await getCharacter(characterId);
    if (!character) {
      return NextResponse.json(
        { error: `Character not found: ${characterId}` },
        { status: 404 }
      );
    }

    // Si un type de situation spécifique est demandé
    if (situationType) {
      const situation = CHARACTER_SITUATIONS.find(s => s.id === situationType);
      if (!situation) {
        return NextResponse.json(
          { error: `Invalid situation type: ${situationType}` },
          { status: 400 }
        );
      }

      const result = await generateSingleSituation(character, situation, customPrompt);
      return NextResponse.json(result);
    }

    // Sinon, générer toutes les situations
    const allResults = await generateAllSituations(character);
    return NextResponse.json(allResults);

  } catch (error) {
    console.error("[CharacterSituations] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/references/generate-character-situations
 * Génère TOUTES les situations pour TOUS les personnages
 */
export async function GET() {
  const results: {
    characterId: string;
    characterName: string;
    situations: { id: string; success: boolean; url?: string; error?: string }[];
  }[] = [];

  try {
    const characters = await getCharacters();
    const outputDir = path.join(process.cwd(), "output", "references", "characters");

    console.log(`[CharacterSituations] Generating 5 situations for ${characters.length} characters`);

    for (let charIdx = 0; charIdx < characters.length; charIdx++) {
      const character = characters[charIdx];
      
      // Skip human characters for combat situations
      if (character.type === "human") {
        console.log(`[CharacterSituations] Skipping human: ${character.name}`);
        continue;
      }

      console.log(`\n[CharacterSituations] Character ${charIdx + 1}/${characters.length}: ${character.name}`);
      
      const characterResults: { id: string; success: boolean; url?: string; error?: string }[] = [];
      const imageUrls: string[] = [];

      for (let sitIdx = 0; sitIdx < CHARACTER_SITUATIONS.length; sitIdx++) {
        const situation = CHARACTER_SITUATIONS[sitIdx];
        console.log(`  [${sitIdx + 1}/5] ${situation.name}...`);

        // Délai entre générations
        if (sitIdx > 0 || charIdx > 0) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        try {
          const jsonMoostik = buildCharacterJsonMoostik(character, situation);
          
          console.log(`  [JSON MOOSTIK] Goal: ${jsonMoostik.goal}`);
          
          const filename = `${character.id}-${situation.id}.png`;
          
          const result = await generateWithJsonMoostik(jsonMoostik, {
            dir: outputDir,
            filename,
          });

          const localUrl = `/api/images/references/characters/${filename}`;
          imageUrls.push(localUrl);
          
          characterResults.push({ id: situation.id, success: true, url: localUrl });
          console.log(`  ✓ ${situation.name} done`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          characterResults.push({ id: situation.id, success: false, error: errorMsg });
          console.error(`  ✗ ${situation.name} failed:`, errorMsg);
        }
      }

      // Mettre à jour les images de référence
      if (imageUrls.length > 0) {
        const existingImages = character.referenceImages || [];
        await updateCharacterReferenceImages(character.id, [...existingImages, ...imageUrls], false);
      }

      results.push({
        characterId: character.id,
        characterName: character.name,
        situations: characterResults,
      });
    }

    const totalSuccess = results.reduce((sum, r) => sum + r.situations.filter(s => s.success).length, 0);
    const totalImages = results.length * 5;

    return NextResponse.json({
      success: true,
      message: `Generated ${totalSuccess}/${totalImages} character situation images`,
      results,
    });
  } catch (error) {
    console.error("[CharacterSituations] Fatal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed", results },
      { status: 500 }
    );
  }
}

async function generateSingleSituation(
  character: { id: string; name: string; description: string; referencePrompt: string; type: string; referenceImages?: string[] },
  situation: typeof CHARACTER_SITUATIONS[0],
  customPrompt?: string
) {
  const outputDir = path.join(process.cwd(), "output", "references", "characters");
  
  const jsonMoostik = buildCharacterJsonMoostik(character, situation, customPrompt);
  const filename = `${character.id}-${situation.id}.png`;
  
  console.log(`[CharacterSituations] Generating ${situation.name} for ${character.name}`);
  
  const result = await generateWithJsonMoostik(jsonMoostik, {
    dir: outputDir,
    filename,
  });

  const imageUrl = `/api/images/references/characters/${filename}`;
  
  // Mettre à jour les références
  const existingImages = character.referenceImages || [];
  if (!existingImages.includes(imageUrl)) {
    await updateCharacterReferenceImages(character.id, [...existingImages, imageUrl], false);
  }

  return {
    success: true,
    characterId: character.id,
    characterName: character.name,
    situationType: situation.id,
    situationName: situation.name,
    imageUrl,
    localPath: result.localPath,
  };
}

async function generateAllSituations(character: { id: string; name: string; description: string; referencePrompt: string; type: string; referenceImages?: string[] }) {
  const outputDir = path.join(process.cwd(), "output", "references", "characters");
  const results: { id: string; success: boolean; url?: string; error?: string }[] = [];
  const imageUrls: string[] = [];

  for (let i = 0; i < CHARACTER_SITUATIONS.length; i++) {
    const situation = CHARACTER_SITUATIONS[i];
    
    // Délai entre générations
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    try {
      const jsonMoostik = buildCharacterJsonMoostik(character, situation);
      const filename = `${character.id}-${situation.id}.png`;
      
      console.log(`[CharacterSituations] [${i + 1}/5] ${situation.name}...`);
      
      const result = await generateWithJsonMoostik(jsonMoostik, {
        dir: outputDir,
        filename,
      });

      const imageUrl = `/api/images/references/characters/${filename}`;
      imageUrls.push(imageUrl);
      results.push({ id: situation.id, success: true, url: imageUrl });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      results.push({ id: situation.id, success: false, error: errorMsg });
    }
  }

  // Mettre à jour les références
  if (imageUrls.length > 0) {
    const existingImages = character.referenceImages || [];
    await updateCharacterReferenceImages(character.id, [...existingImages, ...imageUrls], false);
  }

  return {
    success: true,
    characterId: character.id,
    characterName: character.name,
    situations: results,
  };
}

function buildCharacterJsonMoostik(
  character: { id: string; name: string; description: string; referencePrompt: string; type: string; referenceImages?: string[] },
  situation: typeof CHARACTER_SITUATIONS[0],
  customPrompt?: string
): JsonMoostik {
  const base = createEmptyJsonMoostik();
  const locationId = CHARACTER_LOCATIONS[character.id];
  
  // Construire le sujet avec action
  const subject: JsonMoostikSubject = {
    id: character.id,
    name: character.name,
    priority: 1,
    description: customPrompt || `${character.name}: ${character.description}. ${character.referencePrompt}`,
    importance: "primary",
    action: situation.actionPrompt,
    reference_image: character.referenceImages?.[0],
  };

  // Adapter l'atmosphère selon la situation
  let atmosphere = situation.atmosphere;
  if (situation.id === "environment" && locationId) {
    // Ajouter des éléments spécifiques au lieu
    if (locationId === "bar-ti-sang") {
      atmosphere = [...atmosphere, "warm nectar steam", "ambient chatter", "cantina glow"];
    } else if (locationId === "fort-sang-noir") {
      atmosphere = [...atmosphere, "military discipline", "training sounds", "crimson banners"];
    } else if (locationId === "academy-of-blood") {
      atmosphere = [...atmosphere, "scholarly quiet", "ancient scrolls", "wisdom"];
    }
  }

  return {
    ...base,
    meta: {
      model_version: "nano-banana-2-pro",
      task_type: "cinematic_keyframe",
      project: "MOOSTIK_EP0",
      asset_id: `${character.id}-${situation.id}`,
      scene_intent: `${situation.name} of ${character.name} - capturing their essence in a ${situation.id} moment`,
    },
    references: {
      character_refs: character.referenceImages,
    },
    deliverable: {
      type: "cinematic_still",
      aspect_ratio: "16:9",
      resolution: "4K",
    },
    goal: `${situation.name} of ${character.name} - ${situation.actionPrompt}`,
    subjects: [subject],
    scene: {
      location: locationId ? `Associated location: ${locationId}` : "Moostik environment",
      time: situation.id === "emotional" ? "Dramatic moment" : "Cinematic lighting",
      atmosphere,
      materials: ["chitin surfaces", "resin elements", "silk threads", "amber nectar", "blood-ruby accents"],
    },
    composition: {
      framing: situation.composition.framing,
      layout: situation.composition.layout,
      depth: situation.composition.depth,
    },
    camera: situation.camera,
    lighting: situation.lighting,
    text: {
      strings: [],
      font_style: "none",
      rules: "No text in image",
    },
    negative: [
      ...base.negative,
      "wrong character",
      "inconsistent appearance",
      "missing proboscis",
      "missing wings",
      "human proportions",
      "wrong species",
    ],
  };
}
