import { NextRequest, NextResponse } from "next/server";
import { generateAndSave, generateVariation, generateShotVariations } from "@/lib/replicate";
import { updateShot, getEpisode, getReferenceImagesForShot } from "@/lib/storage";
import { promptToText } from "@/types/moostik";
import type { MoostikPrompt, CameraAngle, VariationStatus } from "@/types/moostik";

// POST /api/generate - Generate image(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      episodeId, 
      shotId, 
      prompt,
      variationId,
      angle,
      mode = "single" // "single" | "variation" | "all_variations"
    } = body as {
      episodeId: string;
      shotId: string;
      prompt: MoostikPrompt;
      variationId?: string;
      angle?: CameraAngle;
      mode?: "single" | "variation" | "all_variations";
    };

    if (!episodeId || !shotId || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields: episodeId, shotId, prompt" },
        { status: 400 }
      );
    }

    // Verify episode and shot exist
    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    const shot = episode.shots.find((s) => s.id === shotId);
    if (!shot) {
      return NextResponse.json(
        { error: "Shot not found" },
        { status: 404 }
      );
    }

    // Get reference images for this shot based on characterIds and locationIds
    const characterIds = shot.characterIds || [];
    const locationIds = shot.locationIds || [];
    const referenceImages = await getReferenceImagesForShot(characterIds, locationIds);
    
    console.log("[Generate] Mode:", mode, "Shot:", shotId);
    console.log("[Generate] Using", referenceImages.length, "reference images from", 
      characterIds.length, "characters and", locationIds.length, "locations");

    if (mode === "single") {
      // Generate single image (legacy mode)
      const promptText = promptToText(prompt, angle);
      const result = await generateAndSave(
        promptText, 
        episodeId, 
        shotId, 
        variationId || "single",
        undefined,
        referenceImages
      );

      return NextResponse.json({
        success: true,
        imageUrl: result.url,
        localPath: result.localPath,
        referencesUsed: referenceImages.length,
      });

    } else if (mode === "variation" && variationId && angle) {
      // Generate specific variation
      const variation = shot.variations?.find(v => v.id === variationId);
      if (!variation) {
        return NextResponse.json(
          { error: "Variation not found" },
          { status: 404 }
        );
      }

      // Update variation status
      const updatedVariations = shot.variations.map(v =>
        v.id === variationId ? { ...v, status: "generating" as const } : v
      );
      await updateShot(episodeId, shotId, { variations: updatedVariations });

      try {
        const result = await generateVariation(
          prompt, 
          angle, 
          episodeId, 
          shotId, 
          variationId,
          referenceImages
        );

        // Update with result
        const finalVariations = shot.variations.map(v =>
          v.id === variationId ? {
            ...v,
            status: "completed" as const,
            imageUrl: result.url,
            localPath: result.localPath,
            generatedAt: new Date().toISOString(),
          } : v
        );
        await updateShot(episodeId, shotId, { variations: finalVariations });

        return NextResponse.json({
          success: true,
          variationId,
          imageUrl: result.url,
          localPath: result.localPath,
          referencesUsed: referenceImages.length,
        });
      } catch (error) {
        // Update variation to error
        const errorVariations = shot.variations.map(v =>
          v.id === variationId ? {
            ...v,
            status: "failed" as const,
            error: error instanceof Error ? error.message : "Unknown error",
          } : v
        );
        await updateShot(episodeId, shotId, { variations: errorVariations });
        throw error;
      }

    } else if (mode === "all_variations") {
      // Generate all pending variations for this shot
      const pendingVariations = shot.variations?.filter(
        v => v.status === "pending" || v.status === "failed"
      ) || [];

      if (pendingVariations.length === 0) {
        return NextResponse.json({
          success: true,
          message: "No pending variations to generate",
          generated: 0,
        });
      }

      // Mark all as generating
      const generatingVariations = shot.variations.map(v =>
        pendingVariations.some(pv => pv.id === v.id)
          ? { ...v, status: "generating" as const }
          : v
      );
      await updateShot(episodeId, shotId, { 
        variations: generatingVariations,
        status: "in_progress"
      });

      // Generate all variations in parallel
      const results = await generateShotVariations(
        prompt,
        pendingVariations,
        episodeId,
        shotId,
        async (varId, status, result, _error) => {
          // Update individual variation status
          const currentEpisode = await getEpisode(episodeId);
          const currentShot = currentEpisode?.shots.find(s => s.id === shotId);
          if (currentShot) {
            // Map status correctly to our types
            const mappedStatus: VariationStatus = 
              status === "completed" ? "completed" : 
              status === "generating" ? "generating" : "failed";
            
            const updatedVars = currentShot.variations.map(v =>
              v.id === varId ? {
                ...v,
                status: mappedStatus,
                imageUrl: result?.url,
                localPath: result?.localPath,
                generatedAt: mappedStatus === "completed" ? new Date().toISOString() : undefined,
              } : v
            );
            await updateShot(episodeId, shotId, { variations: updatedVars });
          }
        },
        referenceImages
      );

      // Final status update
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      const finalEpisode = await getEpisode(episodeId);
      const finalShot = finalEpisode?.shots.find(s => s.id === shotId);
      const allCompleted = finalShot?.variations.every(v => v.status === "completed");

      await updateShot(episodeId, shotId, {
        status: allCompleted ? "completed" : (errorCount === results.length ? "pending" : "in_progress")
      });

      return NextResponse.json({
        success: true,
        generated: successCount,
        errors: errorCount,
        total: results.length,
        referencesUsed: referenceImages.length,
        results: results.map(r => ({
          variationId: r.variationId,
          success: r.success,
          imageUrl: r.result?.url,
          error: r.error,
        })),
      });
    }

    return NextResponse.json(
      { error: "Invalid mode specified" },
      { status: 400 }
    );

  } catch (error) {
    console.error("[Generate] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
