import { NextRequest, NextResponse } from "next/server";
import { getCharacters, saveCharacters, initializeCharacters } from "@/lib/storage";
import type { Character } from "@/types/moostik";
import { createErrorResponse, getStatusCode, ValidationError, NotFoundError, MoostikError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API:Characters");

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
    logger.error("GET error", error);
    return NextResponse.json(createErrorResponse(error), { status: getStatusCode(error) });
  }
}

// POST /api/characters - Add new character
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const character = body as Character;

    if (!character.id || !character.name) {
      throw new ValidationError("Missing required fields: id, name");
    }

    const characters = await getCharacters();
    
    // Check if ID already exists
    if (characters.some(c => c.id === character.id)) {
      throw new MoostikError("Character with this ID already exists", "CONFLICT", 409);
    }

    characters.push(character);
    await saveCharacters(characters);

    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    logger.error("POST error", error);
    return NextResponse.json(createErrorResponse(error), { status: getStatusCode(error) });
  }
}

// PUT /api/characters - Update character
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body as Character & { id: string };

    if (!id) {
      throw new ValidationError("Missing required field: id");
    }

    const characters = await getCharacters();
    const index = characters.findIndex(c => c.id === id);

    if (index === -1) {
      throw new NotFoundError("Character", id);
    }

    characters[index] = { ...characters[index], ...updates };
    await saveCharacters(characters);

    return NextResponse.json(characters[index]);
  } catch (error) {
    logger.error("PUT error", error);
    return NextResponse.json(createErrorResponse(error), { status: getStatusCode(error) });
  }
}
