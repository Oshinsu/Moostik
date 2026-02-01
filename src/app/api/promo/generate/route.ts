import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { generateVariation } from "@/lib/replicate";
import type { JsonMoostik } from "@/lib/json-moostik-standard";
import type { CameraAngle } from "@/types";

// POST /api/promo/generate - Generate promo assets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, shotId } = body as {
      categoryId: string;
      shotId?: string; // Optional: if not provided, generate all pending in category
    };

    // Load promo data
    const dataPath = path.join(process.cwd(), "data", "promo-assets.json");
    const data = await fs.readFile(dataPath, "utf-8");
    const promoData = JSON.parse(data);

    // Find category
    const category = promoData.categories.find((c: any) => c.id === categoryId);
    if (!category) {
      return NextResponse.json(
        { error: `Category not found: ${categoryId}` },
        { status: 404 }
      );
    }

    // Get shots to generate
    let shotsToGenerate = category.shots;
    if (shotId) {
      shotsToGenerate = shotsToGenerate.filter((s: any) => s.id === shotId);
      if (shotsToGenerate.length === 0) {
        return NextResponse.json(
          { error: `Shot not found: ${shotId}` },
          { status: 404 }
        );
      }
    }

    const results: any[] = [];
    let generated = 0;
    let failed = 0;

    for (const shot of shotsToGenerate) {
      for (const variation of shot.variations || []) {
        if (variation.status === "completed" && variation.imageUrl) {
          // Already generated
          results.push({
            shotId: shot.id,
            variationId: variation.id,
            success: true,
            skipped: true,
            imageUrl: variation.imageUrl,
          });
          continue;
        }

        try {
          console.log(`[Promo Generate] Generating ${shot.name} - ${variation.cameraAngle}...`);

          // Extract prompt and convert to JsonMoostik format
          const prompt = shot.prompt || {};
          
          // Build JsonMoostik structure from promo asset data
          // Ensure all required fields have values
          const sceneGraph = prompt.scene_graph || {};
          const styleB = sceneGraph.style_bible || {};
          const env = sceneGraph.environment || {};
          
          const jsonMoostik = {
            deliverable: {
              type: "cinematic_still" as const,
              aspect_ratio: "16:9" as const,
              resolution: "4K" as const,
            },
            goal: prompt.goal || prompt.meta?.scene_intent || "Generate promotional image",
            subjects: prompt.subjects || [],
            scene: {
              location: env.space || "studio",
              time: "day",
              atmosphere: typeof env.mood === "string" ? [env.mood] : (env.mood || ["cinematic"]),
              materials: styleB.palette || ["neutral tones"],
            },
            lighting: {
              key: sceneGraph.lighting?.key || "ambient",
              mood: sceneGraph.lighting?.accent || "dramatic",
            },
            camera: {
              format: "large_format",
              lens_mm: 50,
              aperture: "f/2.8",
              angle: sceneGraph.camera?.shot_type || variation.cameraAngle || "front",
            },
            composition: {
              framing: "medium" as const,
              layout: "centered",
              depth: "medium",
            },
            invariants: prompt.invariants || [],
            negative: prompt.negative || prompt.constraints?.must_not_include || [],
            meta: prompt.meta,
            references: prompt.references,
          } as unknown as JsonMoostik;

          console.log(`[Promo Generate] Goal: ${jsonMoostik.goal?.slice(0, 100)}...`);

          // Generate using the replicate module with correct signature
          const result = await generateVariation(
            jsonMoostik,
            (variation.cameraAngle || "front") as CameraAngle,
            `promo-${categoryId}`,
            shot.id,
            variation.id,
            undefined // No reference images for promo
          );

          if (result.url) {
            // Update variation in promo data
            variation.status = "completed";
            variation.imageUrl = result.url;
            variation.generatedAt = new Date().toISOString();
            
            generated++;
            results.push({
              shotId: shot.id,
              variationId: variation.id,
              success: true,
              imageUrl: result.url,
            });

            console.log(`[Promo Generate] ✅ ${shot.name} generated: ${result.url}`);
          } else {
            variation.status = "failed";
            failed++;
            results.push({
              shotId: shot.id,
              variationId: variation.id,
              success: false,
              error: "Generation failed",
            });
            console.error(`[Promo Generate] ❌ ${shot.name} failed`);
          }
        } catch (error) {
          variation.status = "failed";
          failed++;
          results.push({
            shotId: shot.id,
            variationId: variation.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          console.error(`[Promo Generate] Error for ${shot.name}:`, error);
        }
      }
    }

    // Save updated promo data
    await fs.writeFile(dataPath, JSON.stringify(promoData, null, 2));

    return NextResponse.json({
      success: true,
      generated,
      failed,
      total: results.length,
      results,
    });
  } catch (error) {
    console.error("[Promo Generate] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
