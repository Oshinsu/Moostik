import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

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

    // Check if we have a source image for img2img
    if (sourceImage && sourceImage.startsWith("data:")) {
      // Use SDXL img2img with source image
      try {
        const output = await replicate.run(
          "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
          {
            input: {
              image: sourceImage,
              prompt: fullPrompt,
              negative_prompt: "blurry, low quality, distorted, deformed, ugly, bad anatomy",
              num_inference_steps: 30,
              guidance_scale: 7.5,
              prompt_strength: 0.75,
              width,
              height,
            },
          }
        );

        const imageUrl = Array.isArray(output) ? output[0] : output;

        return NextResponse.json({
          success: true,
          imageUrl,
          prompt: fullPrompt,
          style,
          angle,
        });
      } catch (replicateError) {
        console.error("[Standalone Generate] Replicate error:", replicateError);
        // Fall through to return source image on error
      }
    } else {
      // Use SDXL text2img
      try {
        const output = await replicate.run(
          "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
          {
            input: {
              prompt: fullPrompt,
              negative_prompt: "blurry, low quality, distorted, deformed, ugly, bad anatomy",
              num_inference_steps: 30,
              guidance_scale: 7.5,
              width,
              height,
            },
          }
        );

        const imageUrl = Array.isArray(output) ? output[0] : output;

        return NextResponse.json({
          success: true,
          imageUrl,
          prompt: fullPrompt,
          style,
          angle,
        });
      } catch (replicateError) {
        console.error("[Standalone Generate] Replicate error:", replicateError);
        // Return placeholder on error
        return NextResponse.json({
          success: false,
          error: "Generation failed - API unavailable",
          imageUrl: sourceImage || null, // Return source as fallback
          prompt: fullPrompt,
        });
      }
    }

    // Fallback if no generation happened
    return NextResponse.json({
      success: true,
      imageUrl: sourceImage || null,
      prompt: fullPrompt,
      style,
      angle,
      note: "Mock generation - API not configured",
    });

  } catch (error) {
    console.error("[Standalone Generate] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
