// ============================================================================
// SKILL: GENERATE SHOT
// ============================================================================
// Génère un shot MOOSTIK à partir d'une spécification JSON
// Supporte multiple providers (Replicate, Kling, Veo, Runway)
// ============================================================================

import { COST_ESTIMATES } from "../config";

// ============================================================================
// TYPES
// ============================================================================

export interface ShotSpec {
  id: string;
  episodeId: string;
  partIndex: number;
  actIndex: number;
  shotIndex: number;
  variationIndex: number;

  // Prompt data
  sceneDescription: string;
  cameraAngle: string;
  lighting: string;
  mood: string;

  // Character/Location references
  characters: string[];
  location: string;

  // Technical specs
  aspectRatio: "16:9" | "9:16" | "1:1";
  duration?: number; // seconds, for video

  // Chaining
  previousFrameUrl?: string;
  nextFrameHint?: string;
}

export interface GenerationResult {
  success: boolean;
  outputUrl?: string;
  thumbnailUrl?: string;
  cost: number;
  provider: string;
  duration: number; // ms
  error?: string;
  metadata?: {
    seed?: number;
    steps?: number;
    model?: string;
  };
}

export interface ProviderConfig {
  name: string;
  apiKey: string;
  endpoint: string;
  models: {
    image: string;
    video: string;
  };
  limits: {
    maxConcurrent: number;
    rateLimit: number; // per minute
  };
}

// ============================================================================
// PROVIDER IMPLEMENTATIONS
// ============================================================================

const PROVIDERS: Record<string, ProviderConfig> = {
  replicate: {
    name: "Replicate",
    apiKey: process.env.REPLICATE_API_TOKEN || "",
    endpoint: "https://api.replicate.com/v1/predictions",
    models: {
      image: "black-forest-labs/flux-2-pro",
      video: "minimax/video-01-live",
    },
    limits: {
      maxConcurrent: 5,
      rateLimit: 60,
    },
  },
  fal: {
    name: "Fal.ai",
    apiKey: process.env.FAL_API_KEY || "",
    endpoint: "https://fal.run",
    models: {
      image: "fal-ai/flux-pro/v2",
      video: "fal-ai/kling-video/v2/pro",
    },
    limits: {
      maxConcurrent: 3,
      rateLimit: 30,
    },
  },
  kling: {
    name: "Kling",
    apiKey: process.env.KLING_API_KEY || "",
    endpoint: "https://api.klingai.com/v1",
    models: {
      image: "kling-image-v2",
      video: "kling-video-v2.0",
    },
    limits: {
      maxConcurrent: 2,
      rateLimit: 20,
    },
  },
};

// ============================================================================
// PROMPT BUILDER
// ============================================================================

function buildPrompt(shot: ShotSpec): string {
  const parts: string[] = [];

  // Base scene
  parts.push(shot.sceneDescription);

  // Camera
  if (shot.cameraAngle) {
    parts.push(`Camera: ${shot.cameraAngle}`);
  }

  // Lighting
  if (shot.lighting) {
    parts.push(`Lighting: ${shot.lighting}`);
  }

  // Mood
  if (shot.mood) {
    parts.push(`Mood: ${shot.mood}`);
  }

  // Style invariants for MOOSTIK
  parts.push("Style: Pixar-quality 3D animation, dark fantasy aesthetic");
  parts.push("Color palette: deep reds, blacks, amber accents");
  parts.push("Atmosphere: cinematic, dramatic lighting, volumetric fog");

  return parts.join(". ");
}

function buildNegativePrompt(): string {
  return [
    "blurry",
    "low quality",
    "distorted",
    "deformed",
    "ugly",
    "duplicate",
    "watermark",
    "text",
    "signature",
    "bad anatomy",
    "extra limbs",
  ].join(", ");
}

// ============================================================================
// GENERATION FUNCTIONS
// ============================================================================

async function generateImageReplicate(
  prompt: string,
  config: {
    width: number;
    height: number;
    seed?: number;
  }
): Promise<GenerationResult> {
  const startTime = Date.now();
  const provider = PROVIDERS.replicate;

  try {
    const response = await fetch(provider.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Token ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "black-forest-labs/flux-2-pro",
        input: {
          prompt,
          aspect_ratio: config.width > config.height ? "16:9" : config.width < config.height ? "9:16" : "1:1",
          output_format: "png",
          output_quality: 95,
          safety_tolerance: 2,
          seed: config.seed,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`);
    }

    const prediction = await response.json();

    // Poll for result
    let result = prediction;
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise((r) => setTimeout(r, 1000));
      const pollResponse = await fetch(
        `${provider.endpoint}/${prediction.id}`,
        {
          headers: { Authorization: `Token ${provider.apiKey}` },
        }
      );
      result = await pollResponse.json();
    }

    if (result.status === "failed") {
      throw new Error(result.error || "Generation failed");
    }

    // FLUX 2 returns output as string URL or array
    const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;

    return {
      success: true,
      outputUrl,
      cost: COST_ESTIMATES.replicate_flux,
      provider: "replicate",
      duration: Date.now() - startTime,
      metadata: {
        seed: config.seed,
        model: provider.models.image,
      },
    };
  } catch (error) {
    return {
      success: false,
      cost: 0,
      provider: "replicate",
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function generateVideoKling(
  prompt: string,
  config: {
    duration: number;
    firstFrameUrl?: string;
    lastFrameUrl?: string;
  }
): Promise<GenerationResult> {
  const startTime = Date.now();
  const provider = PROVIDERS.kling;

  try {
    const response = await fetch(`${provider.endpoint}/videos/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.models.video,
        prompt,
        duration: config.duration,
        mode: config.firstFrameUrl ? "image-to-video" : "text-to-video",
        image_url: config.firstFrameUrl,
        tail_image_url: config.lastFrameUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Kling API error: ${response.status}`);
    }

    const task = await response.json();

    // Poll for result (Kling uses async task system)
    let result = task;
    while (result.status === "processing" || result.status === "pending") {
      await new Promise((r) => setTimeout(r, 5000));
      const pollResponse = await fetch(
        `${provider.endpoint}/videos/generations/${task.id}`,
        {
          headers: { Authorization: `Bearer ${provider.apiKey}` },
        }
      );
      result = await pollResponse.json();
    }

    if (result.status !== "completed") {
      throw new Error(result.error || "Video generation failed");
    }

    return {
      success: true,
      outputUrl: result.video_url,
      thumbnailUrl: result.thumbnail_url,
      cost: COST_ESTIMATES.kling_video,
      provider: "kling",
      duration: Date.now() - startTime,
      metadata: {
        model: provider.models.video,
      },
    };
  } catch (error) {
    return {
      success: false,
      cost: 0,
      provider: "kling",
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// MAIN SKILL EXPORT
// ============================================================================

export interface GenerateShotParams {
  shot: ShotSpec;
  type: "image" | "video";
  provider?: string;
  options?: {
    width?: number;
    height?: number;
    seed?: number;
    duration?: number;
  };
}

export async function generateShot(
  params: GenerateShotParams
): Promise<GenerationResult> {
  const { shot, type, provider = "replicate", options = {} } = params;

  // Build prompt from shot spec
  const prompt = buildPrompt(shot);

  // Determine dimensions
  const dimensions = {
    "16:9": { width: 1920, height: 1080 },
    "9:16": { width: 1080, height: 1920 },
    "1:1": { width: 1080, height: 1080 },
  }[shot.aspectRatio] || { width: 1920, height: 1080 };

  if (type === "image") {
    return generateImageReplicate(prompt, {
      width: options.width || dimensions.width,
      height: options.height || dimensions.height,
      seed: options.seed,
    });
  } else {
    return generateVideoKling(prompt, {
      duration: options.duration || shot.duration || 5,
      firstFrameUrl: shot.previousFrameUrl,
    });
  }
}

// ============================================================================
// BATCH GENERATION
// ============================================================================

export async function generateShotBatch(
  shots: ShotSpec[],
  type: "image" | "video",
  maxConcurrent: number = 3
): Promise<Map<string, GenerationResult>> {
  const results = new Map<string, GenerationResult>();
  const queue = [...shots];
  const inProgress: Promise<void>[] = [];

  while (queue.length > 0 || inProgress.length > 0) {
    // Fill up to maxConcurrent
    while (queue.length > 0 && inProgress.length < maxConcurrent) {
      const shot = queue.shift()!;
      const promise = generateShot({ shot, type })
        .then((result) => {
          results.set(shot.id, result);
        })
        .catch((error) => {
          results.set(shot.id, {
            success: false,
            cost: 0,
            provider: "unknown",
            duration: 0,
            error: error.message,
          });
        });
      inProgress.push(promise);
    }

    // Wait for at least one to complete
    if (inProgress.length > 0) {
      await Promise.race(inProgress);
      // Remove completed promises
      const completed = inProgress.filter(
        (p) => p.then(() => true).catch(() => true)
      );
      inProgress.splice(0, inProgress.length, ...completed);
    }
  }

  return results;
}

// ============================================================================
// COST TRACKING
// ============================================================================

export function calculateBatchCost(results: Map<string, GenerationResult>): {
  total: number;
  byProvider: Record<string, number>;
  successful: number;
  failed: number;
} {
  let total = 0;
  const byProvider: Record<string, number> = {};
  let successful = 0;
  let failed = 0;

  for (const result of results.values()) {
    total += result.cost;
    byProvider[result.provider] = (byProvider[result.provider] || 0) + result.cost;
    if (result.success) {
      successful++;
    } else {
      failed++;
    }
  }

  return { total, byProvider, successful, failed };
}
