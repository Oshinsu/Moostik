import { NextRequest, NextResponse } from "next/server";
import { getLocations, saveLocations, initializeLocations } from "@/lib/storage";
import type { Location } from "@/types/moostik";
import { createErrorResponse, getStatusCode, ValidationError, NotFoundError, MoostikError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API:Locations");

// GET /api/locations - Get all locations
export async function GET() {
  try {
    let locations = await getLocations();
    
    // Initialize with defaults if empty
    if (locations.length === 0) {
      locations = await initializeLocations();
    }
    
    return NextResponse.json(locations);
  } catch (error) {
    logger.error("GET error", error);
    return NextResponse.json(createErrorResponse(error), { status: getStatusCode(error) });
  }
}

// POST /api/locations - Add new location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const location = body as Location;

    if (!location.id || !location.name) {
      throw new ValidationError("Missing required fields: id, name");
    }

    const locations = await getLocations();
    
    // Check if ID already exists
    if (locations.some(l => l.id === location.id)) {
      throw new MoostikError("Location with this ID already exists", "CONFLICT", 409);
    }

    locations.push(location);
    await saveLocations(locations);

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    logger.error("POST error", error);
    return NextResponse.json(createErrorResponse(error), { status: getStatusCode(error) });
  }
}

// PUT /api/locations - Update location
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body as Location & { id: string };

    if (!id) {
      throw new ValidationError("Missing required field: id");
    }

    const locations = await getLocations();
    const index = locations.findIndex(l => l.id === id);

    if (index === -1) {
      throw new NotFoundError("Location", id);
    }

    locations[index] = { ...locations[index], ...updates };
    await saveLocations(locations);

    return NextResponse.json(locations[index]);
  } catch (error) {
    logger.error("PUT error", error);
    return NextResponse.json(createErrorResponse(error), { status: getStatusCode(error) });
  }
}
