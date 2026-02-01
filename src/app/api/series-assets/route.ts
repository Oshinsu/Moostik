import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// GET /api/series-assets - Get series assets data
export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "data", "series-assets.json");
    const data = await fs.readFile(dataPath, "utf-8");
    const assetsData = JSON.parse(data);
    
    return NextResponse.json(assetsData);
  } catch (error) {
    console.error("[Series Assets API] Error:", error);
    return NextResponse.json(
      { error: "Failed to load series assets" },
      { status: 500 }
    );
  }
}
