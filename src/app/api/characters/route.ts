import { NextRequest, NextResponse } from "next/server";
import { getCharacters, saveCharacters, initializeCharacters } from "@/lib/storage";
import type { Character } from "@/types/moostik";

// GET /api/characters - Get all characters
export async function GET() {
  try {
    let characters = await getCharacters();
    
    // Initialize with defaults if empty
    if (characters.length === 0) {
      characters = await initializeCharacters();
    }
    
    return NextResponse.json(characters);
  } catch (error) {
    console.error("[Characters] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch characters" },
      { status: 500 }
    );
  }
}

// POST /api/characters - Add new character
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const character = body as Character;

    if (!character.id || !character.name) {
      return NextResponse.json(
        { error: "Missing required fields: id, name" },
        { status: 400 }
      );
    }

    const characters = await getCharacters();
    
    // Check if ID already exists
    if (characters.some(c => c.id === character.id)) {
      return NextResponse.json(
        { error: "Character with this ID already exists" },
        { status: 409 }
      );
    }

    characters.push(character);
    await saveCharacters(characters);

    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    console.error("[Characters] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create character" },
      { status: 500 }
    );
  }
}

// PUT /api/characters - Update character
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body as Character & { id: string };

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const characters = await getCharacters();
    const index = characters.findIndex(c => c.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    characters[index] = { ...characters[index], ...updates };
    await saveCharacters(characters);

    return NextResponse.json(characters[index]);
  } catch (error) {
    console.error("[Characters] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update character" },
      { status: 500 }
    );
  }
}
