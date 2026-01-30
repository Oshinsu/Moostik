import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";
import { 
  getCharacters, 
  getLocations,
  updateCharacterReferenceImages,
  updateLocationReferenceImages
} from "@/lib/storage";

const OUTPUT_DIR = join(process.cwd(), "output", "references");
const CHARACTERS_DIR = join(OUTPUT_DIR, "characters");
const LOCATIONS_DIR = join(OUTPUT_DIR, "locations");

/**
 * POST /api/references/sync
 * Synchronise TOUTES les images locales avec les personnages et lieux
 */
export async function POST() {
  try {
    const results = {
      characters: { synced: 0, total: 0, images: 0 },
      locations: { synced: 0, total: 0, images: 0 }
    };

    // Sync characters - récupère TOUTES les images pour chaque personnage
    const characters = await getCharacters();
    results.characters.total = characters.length;

    try {
      const charFiles = await readdir(CHARACTERS_DIR);
      const pngFiles = charFiles.filter(f => f.endsWith('.png'));

      for (const character of characters) {
        // Récupère toutes les images qui commencent par l'ID du personnage
        const matchingFiles = pngFiles.filter(f => f.startsWith(character.id));
        if (matchingFiles.length > 0) {
          const imagePaths = matchingFiles.map(f => `/api/images/references/characters/${f}`);
          await updateCharacterReferenceImages(character.id, imagePaths, false);
          results.characters.synced++;
          results.characters.images += matchingFiles.length;
        }
      }
    } catch (e) {
      console.log("No character images directory");
    }

    // Sync locations - récupère TOUTES les variations pour chaque lieu
    const locations = await getLocations();
    results.locations.total = locations.length;

    try {
      const locFiles = await readdir(LOCATIONS_DIR);
      const pngFiles = locFiles.filter(f => f.endsWith('.png'));

      for (const location of locations) {
        // Récupère toutes les images qui commencent par l'ID du lieu
        const matchingFiles = pngFiles.filter(f => f.startsWith(location.id));
        if (matchingFiles.length > 0) {
          // Trier: establishing en premier, puis les autres variations
          const sortedFiles = matchingFiles.sort((a, b) => {
            const order = ['establishing', 'detail', 'atmosphere', 'aerial', 'entrance'];
            const aIdx = order.findIndex(o => a.includes(o));
            const bIdx = order.findIndex(o => b.includes(o));
            if (aIdx === -1 && bIdx === -1) return 0;
            if (aIdx === -1) return 1;
            if (bIdx === -1) return -1;
            return aIdx - bIdx;
          });
          const imagePaths = sortedFiles.map(f => `/api/images/references/locations/${f}`);
          await updateLocationReferenceImages(location.id, imagePaths, false);
          results.locations.synced++;
          results.locations.images += matchingFiles.length;
        }
      }
    } catch (e) {
      console.log("No location images directory");
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${results.characters.synced}/${results.characters.total} characters (${results.characters.images} images) and ${results.locations.synced}/${results.locations.total} locations (${results.locations.images} images)`,
      results
    });
  } catch (error) {
    console.error("[Sync] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
