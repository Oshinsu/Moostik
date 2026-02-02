import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { getEpisode, updateShot } from "@/lib/storage";
import { uploadVideoFromUrl } from "@/lib/supabase/storage";
import { REPLICATE_MODELS, VideoProvider } from "@/lib/video/types";

// ============================================
// TYPES
// ============================================

interface VideoPromptData {
  prompt: string;
  negativePrompt?: string;
  duration: number;
  fps: number;
  aspectRatio: string;
  cameraMotion?: string;
  audioPrompt?: string;
  firstFrame?: string;
  lastFrame?: string;
  provider: string;
  estimatedCost: number;
  modelConfig: Record<string, unknown>;
}

interface Variation {
  id: string;
  status: string;
  imageUrl?: string;
  isLegacy?: boolean;
  videoPrompt?: VideoPromptData;
  videoUrl?: string;
  videoStatus?: "pending" | "generating" | "completed" | "failed";
  videoProvider?: string;
  videoError?: string;
  videoGeneratedAt?: string;
}

interface Shot {
  id: string;
  variations: Variation[];
}

// ============================================
// REPLICATE CLIENT
// ============================================

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// ============================================
// MODEL INPUT BUILDERS
// ============================================

function buildReplicateInput(
  provider: VideoProvider,
  videoPrompt: VideoPromptData,
  imageUrl: string
): Record<string, unknown> {
  const baseInput = {
    image: imageUrl,
    prompt: videoPrompt.prompt,
  };

  switch (provider) {
    case "hailuo-2.3-fast":
    case "hailuo-2.3":
      return {
        ...baseInput,
        negative_prompt: videoPrompt.negativePrompt,
        duration: videoPrompt.duration,
        aspect_ratio: videoPrompt.aspectRatio,
      };

    case "veo-3.1-fast":
    case "veo-3.1":
      return {
        ...baseInput,
        negative_prompt: videoPrompt.negativePrompt,
        duration: videoPrompt.duration,
        end_image: videoPrompt.lastFrame, // First/Last frame interpolation
        audio: true,
      };

    case "seedance-1.5-pro":
    case "seedance-1-lite":
      return {
        ...baseInput,
        duration: videoPrompt.duration,
        // Seedance doesn't support negative prompts
        lip_sync: true,
        language: "fr",
      };

    case "kling-2.6":
      return {
        ...baseInput,
        negative_prompt: videoPrompt.negativePrompt,
        duration: videoPrompt.duration,
        mode: "pro",
        motion_amount: videoPrompt.modelConfig?.motion_amount || 0.5,
        audio_mode: "auto",
      };

    case "wan-2.6":
    case "wan-2.5":
    case "wan-2.2":
      return {
        ...baseInput,
        negative_prompt: videoPrompt.negativePrompt,
        duration: Math.min(videoPrompt.duration, 5), // Wan max 5s
      };

    case "luma-ray-2":
    case "luma-ray-3":
      return {
        ...baseInput,
        end_image: videoPrompt.lastFrame, // Interpolation
        duration: videoPrompt.duration,
      };

    default:
      return baseInput;
  }
}

// ============================================
// VIDEO GENERATION
// ============================================

async function generateVideo(
  provider: VideoProvider,
  videoPrompt: VideoPromptData,
  imageUrl: string
): Promise<{ url: string; duration: number }> {
  const model = REPLICATE_MODELS[provider];
  if (!model) {
    throw new Error(`Unknown video provider: ${provider}`);
  }

  console.log(`[Video] Generating with ${provider}: ${model}`);
  console.log(`[Video] Prompt (first 100 chars): ${videoPrompt.prompt.slice(0, 100)}...`);

  const input = buildReplicateInput(provider, videoPrompt, imageUrl);

  const output = await replicate.run(model as `${string}/${string}`, {
    input,
  });

  // Handle different output formats from Replicate
  let videoUrl: string;
  if (typeof output === "string") {
    videoUrl = output;
  } else if (Array.isArray(output) && output.length > 0) {
    videoUrl = output[0];
  } else if (output && typeof output === "object" && "video" in output) {
    videoUrl = (output as { video: string }).video;
  } else {
    throw new Error("Unexpected output format from Replicate");
  }

  return {
    url: videoUrl,
    duration: videoPrompt.duration,
  };
}

// ============================================
// BATCH PROCESSOR
// ============================================

interface BatchResult {
  shotId: string;
  variationId: string;
  success: boolean;
  videoUrl?: string;
  error?: string;
  provider: string;
  cost: number;
}

async function processVariation(
  episodeId: string,
  shot: Shot,
  variation: Variation,
  onProgress: (status: string) => void
): Promise<BatchResult> {
  const videoPrompt = variation.videoPrompt;
  
  if (!videoPrompt) {
    return {
      shotId: shot.id,
      variationId: variation.id,
      success: false,
      error: "No video prompt configured",
      provider: "unknown",
      cost: 0,
    };
  }

  if (!variation.imageUrl) {
    return {
      shotId: shot.id,
      variationId: variation.id,
      success: false,
      error: "No source image available",
      provider: videoPrompt.provider,
      cost: 0,
    };
  }

  try {
    onProgress(`generating`);
    
    const provider = videoPrompt.provider as VideoProvider;
    const result = await generateVideo(provider, videoPrompt, variation.imageUrl);

    // Upload to Supabase
    const supabaseUrl = await uploadVideoToSupabaseStorage(result.url, episodeId, shot.id, variation.id);

    onProgress(`completed`);

    return {
      shotId: shot.id,
      variationId: variation.id,
      success: true,
      videoUrl: supabaseUrl || result.url,
      provider: provider,
      cost: videoPrompt.estimatedCost,
    };
  } catch (error) {
    console.error(`[Video] Error generating ${variation.id}:`, error);
    onProgress(`failed`);
    
    return {
      shotId: shot.id,
      variationId: variation.id,
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
      provider: videoPrompt.provider,
      cost: 0,
    };
  }
}

async function uploadVideoToSupabaseStorage(
  videoUrl: string,
  episodeId: string,
  shotId: string,
  variationId: string
): Promise<string | null> {
  try {
    const result = await uploadVideoFromUrl(videoUrl, episodeId, shotId, variationId);
    return result.success ? result.publicUrl || null : null;
  } catch (error) {
    console.error("[Video] Supabase upload error:", error);
    return null;
  }
}

// ============================================
// PARALLEL BATCH PROCESSING
// ============================================

async function processBatch(
  variations: Array<{ shot: Shot; variation: Variation }>,
  episodeId: string,
  maxConcurrent: number,
  onUpdate: (shotId: string, variationId: string, status: string, result?: BatchResult) => Promise<void>
): Promise<BatchResult[]> {
  const results: BatchResult[] = [];
  const queue = [...variations];

  async function processNext(): Promise<void> {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      const result = await processVariation(
        episodeId,
        item.shot,
        item.variation,
        async (status) => {
          await onUpdate(item.shot.id, item.variation.id, status);
        }
      );

      results.push(result);
      await onUpdate(item.shot.id, item.variation.id, result.success ? "completed" : "failed", result);
    }
  }

  // Run concurrent workers
  const workers = Array(Math.min(maxConcurrent, variations.length))
    .fill(null)
    .map(() => processNext());

  await Promise.all(workers);
  return results;
}

// ============================================
// API ROUTE
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      episodeId,
      shotIds,
      variationIds,
      maxConcurrent = 3,
      providers, // Optional: filter by specific providers
      dryRun = false,
    } = body as {
      episodeId: string;
      shotIds?: string[];
      variationIds?: string[];
      maxConcurrent?: number;
      providers?: VideoProvider[];
      dryRun?: boolean;
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

    // Collect variations to process
    const variationsToProcess: Array<{ shot: Shot; variation: Variation }> = [];
    let totalEstimatedCost = 0;

    for (const shot of episode.shots) {
      // Filter by shotIds if provided
      if (shotIds && shotIds.length > 0 && !shotIds.includes(shot.id)) {
        continue;
      }

      for (const variation of shot.variations) {
        // Skip legacy variations
        if (variation.isLegacy) continue;

        // Filter by variationIds if provided
        if (variationIds && variationIds.length > 0 && !variationIds.includes(variation.id)) {
          continue;
        }

        // Skip if no video prompt
        if (!variation.videoPrompt) continue;

        // Skip if already completed
        if (variation.videoStatus === "completed") continue;

        // Filter by providers if specified
        if (providers && providers.length > 0 && !providers.includes(variation.videoProvider as VideoProvider)) {
          continue;
        }

        variationsToProcess.push({ shot, variation });
        totalEstimatedCost += variation.videoPrompt.estimatedCost;
      }
    }

    if (variationsToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No variations to process",
        processed: 0,
      });
    }

    // Group by provider for stats
    const providerCounts: Record<string, { count: number; cost: number }> = {};
    for (const { variation } of variationsToProcess) {
      const provider = variation.videoProvider || "unknown";
      if (!providerCounts[provider]) {
        providerCounts[provider] = { count: 0, cost: 0 };
      }
      providerCounts[provider].count++;
      providerCounts[provider].cost += variation.videoPrompt?.estimatedCost || 0;
    }

    // Dry run - just return stats
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        variationsToProcess: variationsToProcess.length,
        estimatedCost: totalEstimatedCost,
        byProvider: providerCounts,
        samplePrompts: variationsToProcess.slice(0, 3).map(({ shot, variation }) => ({
          shotId: shot.id,
          variationId: variation.id,
          provider: variation.videoProvider,
          prompt: variation.videoPrompt?.prompt.slice(0, 200) + "...",
        })),
      });
    }

    console.log(`[VideoBatch] Starting generation for ${variationsToProcess.length} videos`);
    console.log(`[VideoBatch] Estimated cost: $${totalEstimatedCost.toFixed(2)}`);
    console.log(`[VideoBatch] By provider:`, providerCounts);

    // Process batch
    const results = await processBatch(
      variationsToProcess,
      episodeId,
      maxConcurrent,
      async (shotId, variationId, status, result) => {
        // Update variation status in episode
        const currentEpisode = await getEpisode(episodeId);
        const currentShot = currentEpisode?.shots.find(s => s.id === shotId);
        if (currentShot) {
          const updatedVars = currentShot.variations.map(v => {
            if (v.id !== variationId) return v;
            return {
              ...v,
              videoStatus: status as "pending" | "generating" | "completed" | "failed",
              videoUrl: result?.videoUrl,
              videoError: result?.error,
              videoGeneratedAt: result?.success ? new Date().toISOString() : undefined,
            };
          });
          await updateShot(episodeId, shotId, { variations: updatedVars });
        }
      }
    );

    // Calculate stats
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const actualCost = successful.reduce((sum, r) => sum + r.cost, 0);

    return NextResponse.json({
      success: true,
      processed: results.length,
      successful: successful.length,
      failed: failed.length,
      actualCost,
      byProvider: providerCounts,
      errors: failed.map(f => ({
        shotId: f.shotId,
        variationId: f.variationId,
        error: f.error,
      })),
    });

  } catch (error) {
    console.error("[VideoBatch] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Video batch generation failed" },
      { status: 500 }
    );
  }
}

// GET - Get video generation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get("episodeId");

    if (!episodeId) {
      return NextResponse.json(
        { error: "Missing episodeId parameter" },
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

    // Calculate stats
    let total = 0;
    let pending = 0;
    let generating = 0;
    let completed = 0;
    let failed = 0;
    const byProvider: Record<string, { total: number; completed: number }> = {};

    for (const shot of episode.shots) {
      for (const variation of shot.variations) {
        if (variation.isLegacy || !variation.videoPrompt) continue;

        total++;
        const provider = variation.videoProvider || "unknown";
        
        if (!byProvider[provider]) {
          byProvider[provider] = { total: 0, completed: 0 };
        }
        byProvider[provider].total++;

        switch (variation.videoStatus) {
          case "pending":
            pending++;
            break;
          case "generating":
            generating++;
            break;
          case "completed":
            completed++;
            byProvider[provider].completed++;
            break;
          case "failed":
            failed++;
            break;
          default:
            pending++;
        }
      }
    }

    return NextResponse.json({
      episodeId,
      total,
      pending,
      generating,
      completed,
      failed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      byProvider,
    });

  } catch (error) {
    console.error("[VideoBatch] Status error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get status" },
      { status: 500 }
    );
  }
}
