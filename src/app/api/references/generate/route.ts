import { NextRequest, NextResponse } from "next/server";
import { generateCharacterReference, generateLocationReference } from "@/lib/replicate";
import { 
  getCharacter, 
  getLocation, 
  updateCharacterReferenceImages, 
  updateLocationReferenceImages 
} from "@/lib/storage";

/**
 * POST /api/references/generate
 * Génère une image de référence pour un personnage ou un lieu
 * 
 * Body:
 * - type: "character" | "location"
 * - id: string (ID du personnage ou lieu)
 * - customPrompt?: string (prompt personnalisé optionnel)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, customPrompt } = body;

    if (!type || !id) {
      return NextResponse.json(
        { error: "Missing required fields: type, id" },
        { status: 400 }
      );
    }

    if (type !== "character" && type !== "location") {
      return NextResponse.json(
        { error: "Invalid type. Must be 'character' or 'location'" },
        { status: 400 }
      );
    }

    let result;
    let finalPrompt: string;

    if (type === "character") {
      // Récupérer le personnage
      const character = await getCharacter(id);
      if (!character) {
        return NextResponse.json(
          { error: `Character not found: ${id}` },
          { status: 404 }
        );
      }

      // Construire le prompt de référence (fond blanc)
      finalPrompt = customPrompt || buildCharacterReferencePrompt(character.referencePrompt);
      
      console.log("[References] Generating character reference for:", character.name);
      console.log("[References] Prompt:", finalPrompt.substring(0, 200) + "...");

      // Générer l'image
      result = await generateCharacterReference(finalPrompt, id);

      // Mettre à jour le personnage avec la nouvelle référence
      const existingImages = character.referenceImages || [];
      const updatedImages = [...existingImages, result.url];
      await updateCharacterReferenceImages(id, updatedImages, false);

      return NextResponse.json({
        success: true,
        type: "character",
        id,
        name: character.name,
        imageUrl: result.url,
        localPath: result.localPath,
        totalReferences: updatedImages.length,
      });
    } else {
      // Récupérer le lieu
      const location = await getLocation(id);
      if (!location) {
        return NextResponse.json(
          { error: `Location not found: ${id}` },
          { status: 404 }
        );
      }

      // Construire le prompt de référence
      finalPrompt = customPrompt || buildLocationReferencePrompt(location.referencePrompt);

      console.log("[References] Generating location reference for:", location.name);
      console.log("[References] Prompt:", finalPrompt.substring(0, 200) + "...");

      // Générer l'image
      result = await generateLocationReference(finalPrompt, id);

      // Mettre à jour le lieu avec la nouvelle référence
      const existingImages = location.referenceImages || [];
      const updatedImages = [...existingImages, result.url];
      await updateLocationReferenceImages(id, updatedImages, false);

      return NextResponse.json({
        success: true,
        type: "location",
        id,
        name: location.name,
        imageUrl: result.url,
        localPath: result.localPath,
        totalReferences: updatedImages.length,
      });
    }
  } catch (error) {
    console.error("[References] Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}

/**
 * Construit un prompt optimisé pour une image de référence de personnage
 * (fond blanc/neutre, vue de face, style clean)
 */
function buildCharacterReferencePrompt(basePrompt: string): string {
  return `Character reference sheet on pure white background, T-pose front view, ${basePrompt}, clean studio lighting, no shadows, isolated character, high detail character design, professional concept art style, white background, centered composition`;
}

/**
 * Construit un prompt optimisé pour une image de référence de lieu
 * (vue d'établissement, style clean)
 */
function buildLocationReferencePrompt(basePrompt: string): string {
  return `Location establishing shot reference, ${basePrompt}, clean architectural visualization, wide establishing view, high detail environment design, professional concept art style, clear composition, no characters`;
}
