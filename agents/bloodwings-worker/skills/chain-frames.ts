// ============================================================================
// SKILL: CHAIN FRAMES
// ============================================================================
// Assure la cohérence visuelle entre shots via first/last frame chaining
// Extrait le dernier frame d'une vidéo et l'utilise comme premier du suivant
// ============================================================================

export interface FrameChainConfig {
  extractionMethod: "ffmpeg" | "api" | "canvas";
  format: "png" | "jpg" | "webp";
  quality: number; // 0-100
}

export interface ChainResult {
  success: boolean;
  frameUrl?: string;
  error?: string;
  metadata?: {
    timestamp: number;
    width: number;
    height: number;
  };
}

// ============================================================================
// FRAME EXTRACTION
// ============================================================================

/**
 * Extract the last frame from a video URL
 * Used to chain with the next shot
 */
export async function extractLastFrame(
  videoUrl: string,
  config: FrameChainConfig = {
    extractionMethod: "api",
    format: "png",
    quality: 95,
  }
): Promise<ChainResult> {
  try {
    // Use Replicate's frame extraction model
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "lucataco/video-to-frames:abc123", // Placeholder model
        input: {
          video_url: videoUrl,
          frame_position: "last",
          format: config.format,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Frame extraction failed: ${response.status}`);
    }

    const prediction = await response.json();

    // Poll for result
    let result = prediction;
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise((r) => setTimeout(r, 1000));
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          },
        }
      );
      result = await pollResponse.json();
    }

    if (result.status === "failed") {
      throw new Error(result.error || "Frame extraction failed");
    }

    return {
      success: true,
      frameUrl: result.output,
      metadata: {
        timestamp: result.output_metadata?.timestamp || 0,
        width: result.output_metadata?.width || 1920,
        height: result.output_metadata?.height || 1080,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Extract the first frame from a video URL
 * Used for thumbnail generation
 */
export async function extractFirstFrame(
  videoUrl: string,
  config: FrameChainConfig = {
    extractionMethod: "api",
    format: "png",
    quality: 95,
  }
): Promise<ChainResult> {
  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "lucataco/video-to-frames:abc123",
        input: {
          video_url: videoUrl,
          frame_position: "first",
          format: config.format,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Frame extraction failed: ${response.status}`);
    }

    const prediction = await response.json();

    let result = prediction;
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise((r) => setTimeout(r, 1000));
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          },
        }
      );
      result = await pollResponse.json();
    }

    if (result.status === "failed") {
      throw new Error(result.error || "Frame extraction failed");
    }

    return {
      success: true,
      frameUrl: result.output,
      metadata: {
        timestamp: 0,
        width: result.output_metadata?.width || 1920,
        height: result.output_metadata?.height || 1080,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// CHAIN VALIDATION
// ============================================================================

export interface ChainValidation {
  isValid: boolean;
  score: number; // 0-100 similarity score
  issues: string[];
}

/**
 * Validate visual consistency between two frames
 * Uses perceptual hashing to compare
 */
export async function validateChain(
  previousFrameUrl: string,
  currentFrameUrl: string,
  threshold: number = 70
): Promise<ChainValidation> {
  try {
    // Use image similarity model
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "image-similarity-model:abc123", // Placeholder
        input: {
          image1_url: previousFrameUrl,
          image2_url: currentFrameUrl,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Validation failed: ${response.status}`);
    }

    const prediction = await response.json();

    let result = prediction;
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise((r) => setTimeout(r, 1000));
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          },
        }
      );
      result = await pollResponse.json();
    }

    const score = result.output?.similarity_score || 0;
    const issues: string[] = [];

    if (score < threshold) {
      issues.push(`Similarity score (${score}) below threshold (${threshold})`);
    }

    if (result.output?.color_shift > 0.2) {
      issues.push("Significant color shift detected");
    }

    if (result.output?.composition_change > 0.3) {
      issues.push("Major composition change detected");
    }

    return {
      isValid: score >= threshold && issues.length === 0,
      score,
      issues,
    };
  } catch (error) {
    return {
      isValid: false,
      score: 0,
      issues: [error instanceof Error ? error.message : "Validation error"],
    };
  }
}

// ============================================================================
// CHAIN BUILDER
// ============================================================================

export interface ChainedShot {
  shotId: string;
  videoUrl: string;
  firstFrameUrl: string;
  lastFrameUrl: string;
  previousShotId?: string;
  nextShotId?: string;
}

/**
 * Build a complete chain of shots with frame extraction
 */
export async function buildShotChain(
  shots: Array<{ id: string; videoUrl: string }>
): Promise<ChainedShot[]> {
  const chainedShots: ChainedShot[] = [];

  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    const previousShot = i > 0 ? shots[i - 1] : undefined;
    const nextShot = i < shots.length - 1 ? shots[i + 1] : undefined;

    // Extract frames
    const [firstFrame, lastFrame] = await Promise.all([
      extractFirstFrame(shot.videoUrl),
      extractLastFrame(shot.videoUrl),
    ]);

    chainedShots.push({
      shotId: shot.id,
      videoUrl: shot.videoUrl,
      firstFrameUrl: firstFrame.frameUrl || "",
      lastFrameUrl: lastFrame.frameUrl || "",
      previousShotId: previousShot?.id,
      nextShotId: nextShot?.id,
    });
  }

  return chainedShots;
}

/**
 * Validate an entire shot chain
 */
export async function validateShotChain(
  chain: ChainedShot[],
  threshold: number = 70
): Promise<{
  isValid: boolean;
  validations: Array<{ from: string; to: string; validation: ChainValidation }>;
}> {
  const validations: Array<{
    from: string;
    to: string;
    validation: ChainValidation;
  }> = [];

  for (let i = 0; i < chain.length - 1; i++) {
    const currentShot = chain[i];
    const nextShot = chain[i + 1];

    const validation = await validateChain(
      currentShot.lastFrameUrl,
      nextShot.firstFrameUrl,
      threshold
    );

    validations.push({
      from: currentShot.shotId,
      to: nextShot.shotId,
      validation,
    });
  }

  const isValid = validations.every((v) => v.validation.isValid);

  return { isValid, validations };
}
