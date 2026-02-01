import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// GET /api/promo - Get promo assets data
export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), "data", "promo-assets.json");
    const data = await fs.readFile(dataPath, "utf-8");
    const promoData = JSON.parse(data);
    
    return NextResponse.json(promoData);
  } catch (error) {
    console.error("[Promo API] Error:", error);
    return NextResponse.json(
      { error: "Failed to load promo assets" },
      { status: 500 }
    );
  }
}
