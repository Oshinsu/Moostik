import { NextRequest, NextResponse } from "next/server";
import { getLocations, saveLocations, initializeLocations } from "@/lib/storage";
import type { Location } from "@/types/moostik";

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
    console.error("[Locations] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

// POST /api/locations - Add new location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const location = body as Location;

    if (!location.id || !location.name) {
      return NextResponse.json(
        { error: "Missing required fields: id, name" },
        { status: 400 }
      );
    }

    const locations = await getLocations();
    
    // Check if ID already exists
    if (locations.some(l => l.id === location.id)) {
      return NextResponse.json(
        { error: "Location with this ID already exists" },
        { status: 409 }
      );
    }

    locations.push(location);
    await saveLocations(locations);

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error("[Locations] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}

// PUT /api/locations - Update location
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body as Location & { id: string };

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const locations = await getLocations();
    const index = locations.findIndex(l => l.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    locations[index] = { ...locations[index], ...updates };
    await saveLocations(locations);

    return NextResponse.json(locations[index]);
  } catch (error) {
    console.error("[Locations] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}
