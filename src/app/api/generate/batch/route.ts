import { NextRequest, NextResponse } from "next/server";
import { generateMultipleShotsParallel } from "@/lib/replicate";
import { getEpisode, updateShot } from "@/lib/storage";
import { 
  resolveReferencesForShot, 
  enrichPromptWithReferences,
  checkGenerationReadiness 
} from "@/lib/reference-resolver";
import type { ParallelShotGeneration } from "@/lib/replicate";
import type { VariationStatus, ShotStatus } from "@/types/moostik";

// POST /api/generate/batch - Generate multiple shots in parallel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      episodeId,
      shotIds,
      maxParallelShots = 3,
    } = body as {
      episodeId: string;
      shotIds?: string[]; // If not provided, generate all pending shots
      maxParallelShots?: number;
    };

    if (!episodeId) {
      return NextResponse.json(
        { error: "Missing required field: episodeId" },
        { status: 400 }
      );
    }

    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    // Get shots to generate
    let shotsToGenerate = episode.shots;
    if (shotIds && shotIds.length > 0) {
      shotsToGenerate = episode.shots.filter(s => shotIds.includes(s.id));
    }

    // Filter to only pending shots with pending/failed variations
    const filteredShots = shotsToGenerate.filter(shot => 
      shot.status !== "completed" &&
      shot.variations?.some(v => v.status === "pending" || v.status === "failed")
    );

    // Check generation readiness
    const readinessCheck = await checkGenerationReadiness(filteredShots);
    console.log(`[Batch] Readiness check: ${readinessCheck.ready ? 'READY' : 'NOT READY'}`);
    if (readinessCheck.warnings.length > 0) {
      console.log(`[Batch] Warnings: ${readinessCheck.warnings.join(', ')}`);
    }

    // Resolve references and enrich prompts for each shot
    const pendingShots: ParallelShotGeneration[] = await Promise.all(
      filteredShots.map(async shot => {
        // Resolve references for this shot
        const references = await resolveReferencesForShot(
          shot.characterIds || [],
          shot.locationIds || []
        );

        // Enrich prompt with references
        const { prompt: enrichedPrompt } = await enrichPromptWithReferences(
          shot.prompt,
          shot.characterIds || [],
          shot.locationIds || []
        );

        console.log(`[Batch] Shot ${shot.id}: ${references.totalCount} references resolved (${references.validatedCount} validated)`);

        return {
          shotId: shot.id,
          prompt: enrichedPrompt,
          variations: shot.variations.filter(v => v.status === "pending" || v.status === "failed"),
          referenceImages: references.allImageUrls, // Inject reference images
        };
      })
    );

    if (pendingShots.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending shots to generate",
        generated: 0,
      });
    }

    console.log(`[Batch] Starting generation for ${pendingShots.length} shots`);
    const totalVariations = pendingShots.reduce((sum, s) => sum + s.variations.length, 0);
    console.log(`[Batch] Total variations to generate: ${totalVariations}`);

    // Mark all shots as in_progress
    for (const shot of pendingShots) {
      await updateShot(episodeId, shot.shotId, { status: "in_progress" as ShotStatus });
    }

    // Generate all shots in parallel
    const results = await generateMultipleShotsParallel(
      pendingShots,
      episodeId,
      maxParallelShots,
      async (shotId, variationId, status, result, _error) => {
        // Update individual variation status
        const currentEpisode = await getEpisode(episodeId);
        const currentShot = currentEpisode?.shots.find(s => s.id === shotId);
        if (currentShot) {
          // Map the status correctly
          const mappedStatus: VariationStatus = 
            status === "completed" ? "completed" : 
            status === "generating" ? "generating" : "failed";
          
          const updatedVars = currentShot.variations.map(v =>
            v.id === variationId ? {
              ...v,
              status: mappedStatus,
              imageUrl: result?.url,
              localPath: result?.localPath,
              generatedAt: mappedStatus === "completed" ? new Date().toISOString() : undefined,
            } : v
          );
          await updateShot(episodeId, shotId, { variations: updatedVars });
        }
      }
    );

    // Calculate final stats
    let totalGenerated = 0;
    let totalErrors = 0;

    for (const [shotId, shotResults] of results) {
      const successCount = shotResults.filter(r => r.success).length;
      const errorCount = shotResults.filter(r => !r.success).length;
      totalGenerated += successCount;
      totalErrors += errorCount;

      // Update shot status
      const currentEpisode = await getEpisode(episodeId);
      const currentShot = currentEpisode?.shots.find(s => s.id === shotId);
      const allCompleted = currentShot?.variations.every(v => v.status === "completed");
      const allFailed = currentShot?.variations.every(v => v.status === "failed");

      const finalStatus: ShotStatus = allCompleted ? "completed" : (allFailed ? "pending" : "in_progress");
      await updateShot(episodeId, shotId, { status: finalStatus });
    }

    return NextResponse.json({
      success: true,
      generated: totalGenerated,
      errors: totalErrors,
      total: totalVariations,
      shotsProcessed: pendingShots.length,
      readiness: {
        ready: readinessCheck.ready,
        warnings: readinessCheck.warnings.length,
        errors: readinessCheck.errors.length,
      },
    });

  } catch (error) {
    console.error("[Batch] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Batch generation failed" },
      { status: 500 }
    );
  }
}
