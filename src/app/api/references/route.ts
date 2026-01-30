import { NextRequest, NextResponse } from "next/server";
import { 
  getCharacters, 
  getLocations, 
  getReferenceStats,
  validateCharacterReference,
  validateLocationReference,
  updateCharacterReferenceImages,
  updateLocationReferenceImages
} from "@/lib/storage";

/**
 * GET /api/references
 * Récupère toutes les références (personnages et lieux) avec leurs stats
 */
export async function GET() {
  try {
    const [characters, locations, stats] = await Promise.all([
      getCharacters(),
      getLocations(),
      getReferenceStats(),
    ]);

    return NextResponse.json({
      characters,
      locations,
      stats,
    });
  } catch (error) {
    console.error("[References] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch references" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/references
 * Met à jour la validation ou supprime une image de référence
 * 
 * Body:
 * - action: "validate" | "delete_image"
 * - type: "character" | "location"
 * - id: string
 * - validated?: boolean (pour action validate)
 * - imageIndex?: number (pour action delete_image)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, type, id, validated, imageIndex } = body;

    if (!action || !type || !id) {
      return NextResponse.json(
        { error: "Missing required fields: action, type, id" },
        { status: 400 }
      );
    }

    if (action === "validate") {
      if (typeof validated !== "boolean") {
        return NextResponse.json(
          { error: "Missing required field: validated (boolean)" },
          { status: 400 }
        );
      }

      if (type === "character") {
        const success = await validateCharacterReference(id, validated);
        if (!success) {
          return NextResponse.json(
            { error: `Character not found: ${id}` },
            { status: 404 }
          );
        }
      } else if (type === "location") {
        const success = await validateLocationReference(id, validated);
        if (!success) {
          return NextResponse.json(
            { error: `Location not found: ${id}` },
            { status: 404 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Invalid type" },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, action: "validate", validated });
    }

    if (action === "delete_image") {
      if (typeof imageIndex !== "number") {
        return NextResponse.json(
          { error: "Missing required field: imageIndex (number)" },
          { status: 400 }
        );
      }

      if (type === "character") {
        const characters = await getCharacters();
        const character = characters.find((c) => c.id === id);
        if (!character) {
          return NextResponse.json(
            { error: `Character not found: ${id}` },
            { status: 404 }
          );
        }

        const newImages = [...(character.referenceImages || [])];
        if (imageIndex < 0 || imageIndex >= newImages.length) {
          return NextResponse.json(
            { error: "Invalid imageIndex" },
            { status: 400 }
          );
        }

        newImages.splice(imageIndex, 1);
        await updateCharacterReferenceImages(id, newImages, character.validated || false);
      } else if (type === "location") {
        const locations = await getLocations();
        const location = locations.find((l) => l.id === id);
        if (!location) {
          return NextResponse.json(
            { error: `Location not found: ${id}` },
            { status: 404 }
          );
        }

        const newImages = [...(location.referenceImages || [])];
        if (imageIndex < 0 || imageIndex >= newImages.length) {
          return NextResponse.json(
            { error: "Invalid imageIndex" },
            { status: 400 }
          );
        }

        newImages.splice(imageIndex, 1);
        await updateLocationReferenceImages(id, newImages, location.validated || false);
      } else {
        return NextResponse.json(
          { error: "Invalid type" },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, action: "delete_image" });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[References] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update reference" },
      { status: 500 }
    );
  }
}
