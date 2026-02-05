import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { generateVariation } from "@/lib/replicate";
import { jsonMoostikToPrompt } from "@/lib/json-moostik-standard";
import type { JsonMoostik } from "@/lib/json-moostik-standard";
import type { CameraAngle } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

interface AssetShot {
  id: string;
  name: string;
  type: string;
  status?: string;
  prompt: {
    meta?: Record<string, unknown>;
    goal?: string;
    subjects?: Array<{ type: string; id: string; description?: string }>;
    invariants?: string[];
    negative?: string[];
  };
  parameters: {
    aspect_ratio: string;
    resolution: string;
    seed?: number;
  };
  variations?: Array<{
    id: string;
    cameraAngle: string;
    status: string;
    imageUrl?: string;
  }>;
  characterId?: string;
  locationId?: string;
  depth?: string;
  expression?: string;
}

interface AssetCategory {
  id: string;
  title: string;
  description: string;
  assetCount?: number;
  shots: AssetShot[];
}

interface SeriesAssets {
  id: string;
  title: string;
  description: string;
  version?: string;
  totalAssets?: number;
  categories: AssetCategory[];
}

// ============================================================================
// POST - Generate a series asset
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, shotId } = body;

    if (!categoryId || !shotId) {
      return NextResponse.json(
        { error: "categoryId and shotId are required" },
        { status: 400 }
      );
    }

    // Load series assets data
    const dataPath = path.join(process.cwd(), "data", "series-assets.json");
    const data = await fs.readFile(dataPath, "utf-8");
    const assetsData: SeriesAssets = JSON.parse(data);

    // Find category and shot
    const category = assetsData.categories.find((c) => c.id === categoryId);
    if (!category) {
      return NextResponse.json(
        { error: `Category ${categoryId} not found` },
        { status: 404 }
      );
    }

    const shot = category.shots.find((s) => s.id === shotId);
    if (!shot) {
      return NextResponse.json(
        { error: `Shot ${shotId} not found in category ${categoryId}` },
        { status: 404 }
      );
    }

    // Check if already generated
    if (shot.status === "completed" && shot.variations?.[0]?.imageUrl) {
      return NextResponse.json({
        success: true,
        message: "Asset already generated",
        imageUrl: shot.variations[0].imageUrl,
        shotId: shot.id,
      });
    }

    // Build JsonMoostik from shot prompt
    const jsonMoostik = {
      meta: {
        model_version: "flux-2-pro",
        task_type: "cinematic_keyframe",
        project: "MOOSTIK_SERIES_ASSETS",
        asset_id: shot.id.toUpperCase(),
        scene_intent: shot.prompt.meta?.scene_intent || shot.prompt.goal || "",
      },
      goal: shot.prompt.goal || shot.name,
      subjects: (shot.prompt.subjects || []).map((s: { id: string; description?: string }, idx: number) => ({
        id: s.id,
        priority: idx + 1,
        description: s.description || "",
      })),
      scene: {
        location: shot.locationId || "unknown",
        time: "cinematic",
        materials: shot.prompt.invariants || [],
        atmosphere: ["cinematic"],
      },
      camera: {
        format: "large_format",
        lens_mm: 50,
        aperture: "f/2.8",
        angle: shot.variations?.[0]?.cameraAngle || "wide",
      },
      composition: {
        framing: "medium" as const,
        layout: "centered",
        depth: "medium",
      },
      invariants: shot.prompt.invariants || [],
      negative: shot.prompt.negative || [],
    } as unknown as JsonMoostik;

    // Convert to prompt string
    const promptString = jsonMoostikToPrompt(jsonMoostik);

    console.log(`[Series Assets] Generating ${shot.id}...`);
    console.log(`[Series Assets] Prompt: ${promptString.substring(0, 200)}...`);

    // Generate image
    const result = await generateVariation(
      jsonMoostik,
      (shot.variations?.[0]?.cameraAngle || "wide") as CameraAngle,
      "series-assets",
      shot.id,
      "v1"
    );

    if (!result.url) {
      throw new Error("Generation failed - no URL returned");
    }

    // Update status in the data file
    shot.status = "completed";
    if (!shot.variations) {
      shot.variations = [{ id: "v1", cameraAngle: "wide", status: "pending" }];
    }
    shot.variations[0].status = "completed";
    shot.variations[0].imageUrl = result.url;

    // Save updated data
    await fs.writeFile(dataPath, JSON.stringify(assetsData, null, 2));

    console.log(`[Series Assets] Generated ${shot.id}: ${result.url}`);

    return NextResponse.json({
      success: true,
      shotId: shot.id,
      imageUrl: result.url,
      localPath: result.localPath,
      seed: result.seed,
    });
  } catch (error) {
    console.error("[Series Assets] Generation error:", error);
    return NextResponse.json(
      { 
        error: "Generation failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Get generation status
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const shotId = searchParams.get("shotId");

    // Load data
    const dataPath = path.join(process.cwd(), "data", "series-assets.json");
    const data = await fs.readFile(dataPath, "utf-8");
    const assetsData: SeriesAssets = JSON.parse(data);

    // If specific shot requested
    if (categoryId && shotId) {
      const category = assetsData.categories.find((c) => c.id === categoryId);
      const shot = category?.shots.find((s) => s.id === shotId);
      
      if (!shot) {
        return NextResponse.json({ error: "Shot not found" }, { status: 404 });
      }

      return NextResponse.json({
        shotId: shot.id,
        status: shot.status || "pending",
        imageUrl: shot.variations?.[0]?.imageUrl,
      });
    }

    // Return overall statistics
    let total = 0;
    let pending = 0;
    let completed = 0;
    const byCategory: Record<string, { total: number; completed: number }> = {};

    for (const category of assetsData.categories) {
      byCategory[category.id] = { total: 0, completed: 0 };
      
      for (const shot of category.shots) {
        total++;
        byCategory[category.id].total++;
        
        if (shot.status === "completed") {
          completed++;
          byCategory[category.id].completed++;
        } else {
          pending++;
        }
      }
    }

    return NextResponse.json({
      total,
      pending,
      completed,
      progress: Math.round((completed / total) * 100),
      byCategory,
    });
  } catch (error) {
    console.error("[Series Assets] Status error:", error);
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 }
    );
  }
}
