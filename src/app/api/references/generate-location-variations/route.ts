import { NextResponse } from "next/server";
import { generateWithJsonMoostik } from "@/lib/replicate";
import { getLocations, updateLocationReferenceImages } from "@/lib/storage";
import { 
  createEmptyJsonMoostik, 
  MOOSTIK_CAMERA_PRESETS, 
  MOOSTIK_LIGHTING_PRESETS,
  MOOSTIK_ATMOSPHERE_PRESETS,
  type JsonMoostik 
} from "@/lib/json-moostik-standard";
import path from "path";

// 5 variations JSON MOOSTIK pour chaque lieu
const LOCATION_VARIATIONS: {
  id: string;
  name: string;
  camera: typeof MOOSTIK_CAMERA_PRESETS.location_establishing;
  lighting: typeof MOOSTIK_LIGHTING_PRESETS.cathedral;
  composition: { framing: "extreme_wide" | "wide" | "medium" | "close"; layout: string; depth: string };
  atmosphere: string[];
}[] = [
  {
    id: "establishing",
    name: "Plan d'ensemble",
    camera: {
      format: "IMAX",
      lens_mm: 14,
      aperture: "f/11",
      angle: "wide establishing shot, full architecture visible",
    },
    lighting: {
      key: "divine golden hour light (#FFB25A) through blood-drop stained glass",
      fill: "deep sacred shadows (#0B0B0E)",
      rim: "warm copper highlight on architectural edges (#9B6A3A)",
      notes: "god rays, atmospheric dust motes, reverent scale",
    },
    composition: {
      framing: "extreme_wide",
      layout: "centered monumental architecture, sky negative space",
      depth: "foreground debris/foliage | mid architecture | background sky/atmosphere",
    },
    atmosphere: ["volumetric god rays", "dust motes", "morning mist", "sacred stillness"],
  },
  {
    id: "detail",
    name: "Détail architectural",
    camera: {
      format: "medium_format",
      lens_mm: 100,
      aperture: "f/2.8",
      angle: "intimate detail shot, shallow depth of field",
    },
    lighting: {
      key: "soft diffused amber (#FFB25A) from nearby bioluminescent source",
      fill: "subtle bounce from chitin surfaces (#1A0F10)",
      rim: "crisp edge light revealing micro-textures (#B0002A)",
      notes: "emphasis on material quality, 8K texture resolution",
    },
    composition: {
      framing: "close",
      layout: "rule of thirds, intricate detail as focal point",
      depth: "sharp focus on detail | soft bokeh foreground | creamy background blur",
    },
    atmosphere: ["intimate scale", "texture emphasis", "material showcase"],
  },
  {
    id: "atmosphere",
    name: "Atmosphérique nocturne",
    camera: {
      format: "large_format",
      lens_mm: 35,
      aperture: "f/4.0",
      angle: "eye-level immersive, heavy atmosphere",
    },
    lighting: {
      key: "bioluminescent amber lanterns (#FFB25A) scattered throughout",
      fill: "deep obsidian shadows (#0B0B0E)",
      rim: "crimson accent from blood-ruby windows (#B0002A)",
      notes: "heavy volumetric fog, mysterious mood, firefly-like particles",
    },
    composition: {
      framing: "medium",
      layout: "depth through layers of fog, light sources as beacons",
      depth: "fog layer foreground | architecture mid | glowing elements background",
    },
    atmosphere: ["thick volumetric fog", "bioluminescent particles", "crimson haze", "mysterious mood"],
  },
  {
    id: "aerial",
    name: "Vue aérienne",
    camera: {
      format: "drone_aerial",
      lens_mm: 24,
      aperture: "f/8.0",
      angle: "45-degree high angle bird's eye view",
    },
    lighting: {
      key: "dramatic top-down sunlight (#FFB25A)",
      fill: "shadow patterns define structure (#0B0B0E)",
      rim: "edge definition from sun angle (#9B6A3A)",
      notes: "shadows reveal architectural layout, sense of scale",
    },
    composition: {
      framing: "wide",
      layout: "layout visible, surrounding context, negative space",
      depth: "architecture primary | surrounding terrain | distant horizon",
    },
    atmosphere: ["clear air", "sharp shadows", "scale reference", "geographic context"],
  },
  {
    id: "entrance",
    name: "Point d'entrée",
    camera: {
      format: "large_format",
      lens_mm: 50,
      aperture: "f/5.6",
      angle: "POV entering location, inviting perspective",
    },
    lighting: {
      key: "warm interior glow beckoning from within (#FFB25A)",
      fill: "cooler exterior ambient (#1A1A2A)",
      rim: "doorway/archway silhouette framing (#0B0B0E)",
      notes: "warm-cool contrast, welcoming yet mysterious",
    },
    composition: {
      framing: "medium",
      layout: "framing device (archway/door), leading lines into depth",
      depth: "architectural frame foreground | threshold mid | interior glow background",
    },
    atmosphere: ["threshold moment", "warm invitation", "depth beckoning", "anticipation"],
  },
];

export async function POST(request: Request) {
  const results: {
    locationId: string;
    locationName: string;
    variations: { id: string; success: boolean; url?: string; error?: string }[];
  }[] = [];

  try {
    // Check if specific location/variation requested
    const body = await request.json().catch(() => ({}));
    const { locationId, variationType } = body as { locationId?: string; variationType?: string };

    const locations = await getLocations();
    const outputDir = path.join(process.cwd(), "output", "references", "locations");

    // Filter to specific location if requested
    const targetLocations = locationId 
      ? locations.filter(l => l.id === locationId)
      : locations;

    if (locationId && targetLocations.length === 0) {
      return NextResponse.json({ error: `Location not found: ${locationId}` }, { status: 404 });
    }

    // Filter to specific variation if requested
    const targetVariations = variationType
      ? LOCATION_VARIATIONS.filter(v => v.id === variationType)
      : LOCATION_VARIATIONS;

    if (variationType && targetVariations.length === 0) {
      return NextResponse.json({ error: `Invalid variation: ${variationType}` }, { status: 400 });
    }

    console.log(`[LocationVariations] Generating ${targetVariations.length} variations for ${targetLocations.length} locations`);

    for (let locIdx = 0; locIdx < targetLocations.length; locIdx++) {
      const location = targetLocations[locIdx];
      console.log(`\n[LocationVariations] Location ${locIdx + 1}/${targetLocations.length}: ${location.name}`);
      
      const locationResults: { id: string; success: boolean; url?: string; error?: string }[] = [];
      const imageUrls: string[] = [];

      for (let varIdx = 0; varIdx < targetVariations.length; varIdx++) {
        const variation = targetVariations[varIdx];
        console.log(`  [${varIdx + 1}/${targetVariations.length}] ${variation.name}...`);

        // Délai entre générations pour éviter rate limiting
        if (varIdx > 0 || locIdx > 0) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        try {
          // Construire le JSON MOOSTIK complet
          const jsonMoostik = buildLocationJsonMoostik(location, variation);
          
          console.log(`  [JSON MOOSTIK] Goal: ${jsonMoostik.goal}`);
          
          const filename = `${location.id}-${variation.id}.png`;
          
          const result = await generateWithJsonMoostik(jsonMoostik, {
            dir: outputDir,
            filename,
          });

          const localUrl = `/api/images/references/locations/${filename}`;
          imageUrls.push(localUrl);
          
          locationResults.push({ id: variation.id, success: true, url: localUrl });
          console.log(`  ✓ ${variation.name} done`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          locationResults.push({ id: variation.id, success: false, error: errorMsg });
          console.error(`  ✗ ${variation.name} failed:`, errorMsg);
        }
      }

      // Mettre à jour les images de référence du lieu
      if (imageUrls.length > 0) {
        await updateLocationReferenceImages(location.id, imageUrls, false);
      }

      results.push({
        locationId: location.id,
        locationName: location.name,
        variations: locationResults,
      });
    }

    const totalSuccess = results.reduce((sum, r) => sum + r.variations.filter(v => v.success).length, 0);
    const totalImages = targetLocations.length * targetVariations.length;

    return NextResponse.json({
      success: true,
      message: `Generated ${totalSuccess}/${totalImages} location images with JSON MOOSTIK standard`,
      results,
    });
  } catch (error) {
    console.error("[LocationVariations] Fatal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed", results },
      { status: 500 }
    );
  }
}

function buildLocationJsonMoostik(
  location: { id: string; name: string; description: string; referencePrompt: string; type: string },
  variation: typeof LOCATION_VARIATIONS[0]
): JsonMoostik {
  const base = createEmptyJsonMoostik();
  
  return {
    ...base,
    deliverable: {
      type: "location_establishing",
      aspect_ratio: "16:9",
      resolution: "4K",
    },
    goal: `${variation.name} of ${location.name} - cinematic establishing shot showcasing unique Moostik Renaissance bio-organic architecture.`,
    subjects: [
      {
        id: location.id,
        priority: 1,
        description: `${location.name}: ${location.description}. ${location.referencePrompt}`,
      },
    ],
    scene: {
      location: location.name,
      time: variation.id === "atmosphere" ? "Night, bioluminescent glow" : "Golden hour, atmospheric light",
      atmosphere: variation.atmosphere,
      materials: ["chitin walls", "resin pillars", "wing-membrane windows", "silk thread details", "nectar-wax surfaces", "blood-ruby glass accents"],
    },
    composition: {
      framing: variation.composition.framing,
      layout: variation.composition.layout,
      depth: variation.composition.depth,
    },
    camera: variation.camera,
    lighting: variation.lighting,
    text: {
      strings: [],
      font_style: "none",
      rules: "No text in image",
    },
    negative: [
      ...base.negative,
      "human architecture",
      "human buildings", 
      "human furniture",
      "electric lights",
      "modern materials",
      "concrete",
      "glass skyscrapers",
      "human silhouettes",
      "illustration style",
      "flat colors",
      "simple shading",
    ],
  };
}
