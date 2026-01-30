import { NextResponse } from "next/server";
import { generateCharacterReference, generateLocationReference } from "@/lib/replicate";
import { 
  getCharacters, 
  getLocations,
  updateCharacterReferenceImages,
  updateLocationReferenceImages
} from "@/lib/storage";

/**
 * POST /api/references/regenerate-all
 * Régénère TOUTES les images de référence avec le standard JSON MOOSTIK
 */
export async function POST() {
  const results: {
    characters: { id: string; name: string; success: boolean; error?: string }[];
    locations: { id: string; name: string; success: boolean; error?: string }[];
  } = {
    characters: [],
    locations: [],
  };

  try {
    // Récupérer tous les personnages et lieux
    const characters = await getCharacters();
    const locations = await getLocations();

    console.log(`[Regenerate] Starting regeneration of ${characters.length} characters and ${locations.length} locations`);

    // Régénérer les personnages (avec délai pour éviter rate limiting)
    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      console.log(`[Regenerate] Character ${i + 1}/${characters.length}: ${char.name}`);
      
      try {
        // Délai entre les générations
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        const result = await generateCharacterReference(char.referencePrompt, char.id);
        
        // Mettre à jour avec la nouvelle image
        await updateCharacterReferenceImages(char.id, [result.url], false);
        
        results.characters.push({ id: char.id, name: char.name, success: true });
        console.log(`[Regenerate] ✓ ${char.name} done`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        results.characters.push({ id: char.id, name: char.name, success: false, error: errorMsg });
        console.error(`[Regenerate] ✗ ${char.name} failed:`, errorMsg);
      }
    }

    // Régénérer les lieux
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      console.log(`[Regenerate] Location ${i + 1}/${locations.length}: ${loc.name}`);
      
      try {
        // Délai entre les générations
        await new Promise(resolve => setTimeout(resolve, 3000));

        const result = await generateLocationReference(loc.referencePrompt, loc.id);
        
        // Mettre à jour avec la nouvelle image
        await updateLocationReferenceImages(loc.id, [result.url], false);
        
        results.locations.push({ id: loc.id, name: loc.name, success: true });
        console.log(`[Regenerate] ✓ ${loc.name} done`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        results.locations.push({ id: loc.id, name: loc.name, success: false, error: errorMsg });
        console.error(`[Regenerate] ✗ ${loc.name} failed:`, errorMsg);
      }
    }

    const successChars = results.characters.filter(r => r.success).length;
    const successLocs = results.locations.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Regenerated ${successChars}/${characters.length} characters and ${successLocs}/${locations.length} locations`,
      results,
    });
  } catch (error) {
    console.error("[Regenerate] Fatal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Regeneration failed", results },
      { status: 500 }
    );
  }
}
