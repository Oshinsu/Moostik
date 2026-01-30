/**
 * MOOSTIK Video Generation API
 * Endpoint for generating videos from images using SOTA I2V models
 */

import { NextRequest, NextResponse } from "next/server";
import {
  type VideoProvider,
  type VideoGenerationInput,
  type VideoGenerationOutput,
  PROVIDER_CONFIGS,
} from "@/lib/video/types";
import {
  generateVideoAndWait,
  generateVideo,
  ReplicateVideoError,
} from "@/lib/video/providers/replicate";

export const maxDuration = 300; // 5 minutes timeout

interface GenerateVideoRequest {
  episodeId: string;
  shotId: string;
  variationId: string;
  provider: VideoProvider;
  config: Partial<VideoGenerationInput>;
  waitForCompletion?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateVideoRequest = await request.json();

    // Validate required fields
    if (!body.episodeId || !body.shotId || !body.variationId) {
      return NextResponse.json(
        { error: "Missing required fields: episodeId, shotId, variationId" },
        { status: 400 }
      );
    }

    if (!body.provider || !PROVIDER_CONFIGS[body.provider]) {
      return NextResponse.json(
        { error: `Invalid provider: ${body.provider}` },
        { status: 400 }
      );
    }

    if (!body.config?.sourceImage) {
      return NextResponse.json(
        { error: "Missing source image" },
        { status: 400 }
      );
    }

    // Build full input with defaults
    const providerConfig = PROVIDER_CONFIGS[body.provider];
    const caps = providerConfig.capabilities;

    const input: VideoGenerationInput = {
      sourceType: body.config.sourceType || "image",
      prompt: body.config.prompt || "",
      sourceImage: body.config.sourceImage,
      durationSeconds: Math.min(
        body.config.durationSeconds || 5,
        caps.maxDurationSeconds
      ),
      aspectRatio: body.config.aspectRatio || "16:9",
      resolution: body.config.resolution || caps.supportedResolutions[0],
      fps: body.config.fps || caps.fps[0],
      generateAudio: caps.supportsAudio && body.config.generateAudio,
      audioPrompt: body.config.audioPrompt,
      negativePrompt: body.config.negativePrompt,
      cameraMotion: body.config.cameraMotion,
      motionIntensity: body.config.motionIntensity,
      cfgScale: body.config.cfgScale,
      seed: body.config.seed,
      endImage: body.config.endImage,
      motionTransfer: body.config.motionTransfer,
      motionBrush: body.config.motionBrush,
    };

    let result: VideoGenerationOutput;

    if (body.waitForCompletion !== false) {
      // Wait for video to complete (default behavior)
      result = await generateVideoAndWait(input, body.provider, {
        timeoutMs: providerConfig.timeoutMs,
        pollIntervalMs: 2000,
      });
    } else {
      // Just start the generation and return immediately
      result = await generateVideo(input, body.provider);
    }

    // Calculate cost
    const cost = providerConfig.pricing.costPerSecond * input.durationSeconds;
    result.costUsd = Math.max(cost, providerConfig.pricing.minimumCost);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Video generation error:", error);

    if (error instanceof ReplicateVideoError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          retryable: error.retryable,
        },
        { status: error.retryable ? 503 : 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        code: "UNKNOWN_ERROR",
        retryable: false,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check status of a video generation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const replicateId = searchParams.get("id");
  const provider = searchParams.get("provider") as VideoProvider;

  if (!replicateId || !provider) {
    return NextResponse.json(
      { error: "Missing required params: id, provider" },
      { status: 400 }
    );
  }

  try {
    const { checkVideoStatus } = await import("@/lib/video/providers/replicate");
    const status = await checkVideoStatus(replicateId, provider);
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
