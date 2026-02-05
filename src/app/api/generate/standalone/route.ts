import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Image model - FLUX 2 Pro (February 2026 SOTA)
const IMAGE_MODEL = "black-forest-labs/flux-2-pro";

// Style presets for MOOSTIK
const STYLE_PROMPTS: Record<string, string> = {
  pixar_dark: "pixar-style 3D animation, dark gothic atmosphere, cinematic lighting, detailed textures, dramatic shadows",
  cinematic: "cinematic photography, professional lighting, film grain, anamorphic lens, shallow depth of field",
  photorealistic: "photorealistic, hyperrealistic, 8k resolution, professional photography, natural lighting",
  stylized_3d: "stylized 3D render, bold colors, dramatic lighting, artistic interpretation",
  noir: "film noir style, high contrast black and white, dramatic shadows, moody atmosphere",
  fantasy: "dark fantasy art, magical atmosphere, ethereal lighting, mystical elements",
  horror: "horror movie aesthetic, unsettling atmosphere, dark shadows, eerie lighting",
};

// Map aspect ratio from dimensions
function getAspectRatio(width: number, height: number): string {
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.05) return "1:1";
  if (Math.abs(ratio - 16/9) < 0.1) return "16:9";
  if (Math.abs(ratio - 9/16) < 0.1) return "9:16";
  if (Math.abs(ratio - 4/3) < 0.1) return "4:3";
  if (Math.abs(ratio - 3/4) < 0.1) return "3:4";
  if (Math.abs(ratio - 3/2) < 0.1) return "3:2";
  if (Math.abs(ratio - 2/3) < 0.1) return "2:3";
  return "custom";
}

// POST /api/generate/standalone - Standalone image generation without episode context
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      style = "pixar_dark",
      sourceImage,
      angle,
      width = 1024,
      height = 1024,
    } = body as {
      prompt: string;
      style?: string;
      sourceImage?: string;
      angle?: string;
      width?: number;
      height?: number;
    };

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 }
      );
    }

    // Build full prompt with style
    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.pixar_dark;
    const fullPrompt = `${prompt}. ${stylePrompt}`;

    console.log("[Standalone Generate] Prompt:", fullPrompt.slice(0, 100) + "...");
    console.log("[Standalone Generate] Style:", style, "Angle:", angle);

    try {
      // FLUX 2 Pro input format
      const input: Record<string, unknown> = {
        prompt: fullPrompt,
        aspect_ratio: getAspectRatio(width, height),
        output_format: "webp",
        output_quality: 90,
        safety_tolerance: 2,
      };

      // Add source image for img2img if provided
      if (sourceImage && sourceImage.startsWith("data:")) {
        input.input_images = [sourceImage];
      }

      // Use custom dimensions if aspect ratio is non-standard
      if (input.aspect_ratio === "custom") {
        input.aspect_ratio = "custom";
        input.width = Math.min(width, 2048);
        input.height = Math.min(height, 2048);
      }

      const output = await replicate.run(IMAGE_MODEL, { input });

      // FLUX 2 returns a single URL string or FileOutput
      let imageUrl: string;
      if (typeof output === "string") {
        imageUrl = output;
      } else if (Array.isArray(output) && typeof output[0] === "string") {
        imageUrl = output[0];
      } else if (output && typeof output === "object" && "url" in output) {
        imageUrl = String((output as { url: unknown }).url);
      } else if (output && typeof (output as { url: () => string }).url === "function") {
        imageUrl = (output as { url: () => string }).url();
      } else {
        imageUrl = String(output);
      }

      return NextResponse.json({
        success: true,
        imageUrl,
        prompt: fullPrompt,
        style,
        angle,
        model: IMAGE_MODEL,
      });
    } catch (replicateError) {
      console.error("[Standalone Generate] Replicate error:", replicateError);
      return NextResponse.json({
        success: false,
        error: "Generation failed - API unavailable",
        imageUrl: sourceImage || null,
        prompt: fullPrompt,
      });
    }
  } catch (error) {
    console.error("[Standalone Generate] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
