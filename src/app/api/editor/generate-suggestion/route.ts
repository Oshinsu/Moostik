/**
 * GENERATE SHOT FROM SUGGESTION API
 * POST /api/editor/generate-suggestion
 * 
 * Génère automatiquement un shot depuis une suggestion
 */

import { NextRequest, NextResponse } from "next/server";
import { getEpisode, getCharacters, getLocations, saveEpisode } from "@/lib/storage";
import { generateAndSave } from "@/lib/replicate";
import { buildJsonMoostikPrompt, type JsonMoostik } from "@/lib/json-moostik-standard";
import type { ShotSuggestion } from "@/lib/editor/blood-director";
import type { Shot, Variation, MoostikPrompt } from "@/types";

interface GenerateSuggestionRequest {
  episodeId: string;
  suggestion: ShotSuggestion;
  insertAfterShotId?: string;
  generateVideo?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSuggestionRequest = await request.json();
    
    if (!body.episodeId || !body.suggestion) {
      return NextResponse.json(
        { error: "Missing episodeId or suggestion" },
        { status: 400 }
      );
    }
    
    // Load data
    const episode = await getEpisode(body.episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }
    
    const characters = await getCharacters();
    const locations = await getLocations();
    
    const suggestion = body.suggestion;
    
    console.log(`[GenerateSuggestion] Creating shot: ${suggestion.name}`);
    
    // Get character and location details
    const character = suggestion.characterIds?.[0] 
      ? characters.find(c => c.id === suggestion.characterIds![0])
      : null;
    const location = suggestion.locationId
      ? locations.find(l => l.id === suggestion.locationId)
      : null;
    
    // Build prompt based on suggestion type
    const prompt = buildSuggestionPrompt(suggestion, character, location);
    
    // Create new shot
    const newShotNumber = episode.shots.length + 1;
    const newShot: Shot = {
      id: `shot-gen-${Date.now()}`,
      number: newShotNumber,
      name: suggestion.name,
      description: suggestion.description,
      sceneType: mapSuggestionTypeToSceneType(suggestion.type),
      prompt: prompt as MoostikPrompt,
      variations: [
        {
          id: `var-${Date.now()}-1`,
          cameraAngle: mapToCameraAngle(suggestion.cameraAngle),
          status: "pending",
        },
      ],
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      characterIds: suggestion.characterIds || [],
      locationIds: suggestion.locationId ? [suggestion.locationId] : [],
      durationSeconds: suggestion.duration,
    };
    
    // Generate image
    console.log(`[GenerateSuggestion] Generating image...`);
    
    try {
      // Get reference images
      const referenceImages: string[] = [];
      if (character?.referenceImages?.[0]) {
        referenceImages.push(character.referenceImages[0]);
      }
      if (location?.referenceImages?.[0]) {
        referenceImages.push(location.referenceImages[0]);
      }
      
      const result = await generateAndSave(
        buildPromptText(prompt),
        body.episodeId,
        newShot.id,
        newShot.variations[0].id,
        undefined,
        referenceImages
      );
      
      // Update variation with result
      newShot.variations[0] = {
        ...newShot.variations[0],
        status: "completed",
        imageUrl: result.url,
        localPath: result.localPath,
        generatedAt: new Date().toISOString(),
      };
      newShot.status = "completed";
      
      console.log(`[GenerateSuggestion] Image generated: ${result.url}`);
    } catch (genError) {
      console.error(`[GenerateSuggestion] Image generation failed:`, genError);
      newShot.variations[0].status = "failed";
    }
    
    // Insert shot at correct position
    let insertIndex = episode.shots.length;
    if (body.insertAfterShotId) {
      const afterIndex = episode.shots.findIndex(s => s.id === body.insertAfterShotId);
      if (afterIndex !== -1) {
        insertIndex = afterIndex + 1;
      }
    }
    
    const updatedShots = [
      ...episode.shots.slice(0, insertIndex),
      newShot,
      ...episode.shots.slice(insertIndex),
    ];
    
    // Renumber shots
    updatedShots.forEach((shot, i) => {
      shot.number = i + 1;
    });
    
    // Save episode
    episode.shots = updatedShots;
    await saveEpisode(episode);
    
    return NextResponse.json({
      success: true,
      shot: newShot,
      insertedAt: insertIndex,
      totalShots: updatedShots.length,
    });
    
  } catch (error) {
    console.error("[GenerateSuggestion] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

function buildSuggestionPrompt(
  suggestion: ShotSuggestion,
  character: { name: string; physicalDescription?: string; referencePrompt?: string } | null,
  location: { name: string; description?: string; referencePrompt?: string } | null
): Partial<JsonMoostik> {
  const prompt: Partial<JsonMoostik> = {
    meta: {
      type: "image",
      model_target: "flux_kontext" as const,
      version: "1.0.0",
      created: new Date().toISOString(),
    },
    references: {
      characters: character ? [{
        id: "char_main",
        name: character.name,
        description: character.physicalDescription || character.name,
        ref_weight: 0.85,
      }] : [],
      environment: location ? {
        id: "env_main",
        name: location.name,
        description: location.description || location.name,
        ref_weight: 0.7,
      } : undefined,
    },
    scene_graph: {
      setting: location?.name || "Scene",
      subjects: character ? [{
        id: "subj_main",
        label: character.name,
        appearance: character.physicalDescription || character.name,
        pose_action: getPoseForSuggestionType(suggestion.type),
        expression_emotion: suggestion.emotionalTone || "neutral",
        depth_layer: "foreground",
      }] : [],
      camera: {
        angle: suggestion.cameraAngle || "medium",
        movement: "static",
        lens_mm: getLensForSuggestionType(suggestion.type),
        depth_of_field: suggestion.type === "detail" ? "shallow" : "deep",
      },
      lighting: {
        style: "cinematic",
        direction: "side",
        mood: suggestion.emotionalTone || "dramatic",
      },
      atmosphere: suggestion.emotionalTone || "tense",
    },
    parameters: {
      aspect_ratio: "16:9",
      quality: "ultra",
      style_preset: "bloodwing_cinematic",
    },
    constraints: {
      mandatory_include: [
        character?.name || suggestion.name,
        location?.name || "environment",
      ].filter(Boolean) as string[],
      negative_prompts: [
        "low quality", "blurry", "text", "watermark",
        "deformed", "ugly", "bad anatomy",
      ],
    },
  };
  
  return prompt;
}

function getPoseForSuggestionType(type: string): string {
  const poses: Record<string, string> = {
    establishing: "background element, environmental context",
    insert: "focused on detail, close interaction",
    reaction: "emotional reaction, expressive face",
    transition: "movement, walking, transitioning",
    cutaway: "observing, passive stance",
    pov: "subjective view, hands visible",
    detail: "extreme close focus on specific element",
    wide: "full body visible, environmental context",
  };
  return poses[type] || "standing, natural pose";
}

function getLensForSuggestionType(type: string): number {
  const lenses: Record<string, number> = {
    establishing: 24,
    insert: 85,
    reaction: 50,
    transition: 35,
    cutaway: 50,
    pov: 35,
    detail: 100,
    wide: 24,
  };
  return lenses[type] || 50;
}

function mapSuggestionTypeToSceneType(type: string): string {
  const mapping: Record<string, string> = {
    establishing: "establishing",
    insert: "montage",
    reaction: "emotional",
    transition: "montage",
    cutaway: "montage",
    pov: "emotional",
    detail: "montage",
    wide: "establishing",
  };
  return mapping[type] || "montage";
}

function mapToCameraAngle(angle?: string): string {
  const mapping: Record<string, string> = {
    wide: "wide",
    medium: "medium",
    close_up: "close_up",
    extreme_close_up: "extreme_close_up",
    establishing: "establishing",
    pov: "pov",
  };
  return mapping[angle || "medium"] || "medium";
}

function buildPromptText(prompt: Partial<JsonMoostik>): string {
  const parts: string[] = [];
  
  if (prompt.scene_graph?.setting) {
    parts.push(prompt.scene_graph.setting);
  }
  
  if (prompt.scene_graph?.subjects?.[0]) {
    const subject = prompt.scene_graph.subjects[0];
    parts.push(`${subject.label}, ${subject.appearance}, ${subject.pose_action}`);
    if (subject.expression_emotion) {
      parts.push(`${subject.expression_emotion} expression`);
    }
  }
  
  if (prompt.scene_graph?.camera) {
    parts.push(`${prompt.scene_graph.camera.angle} shot`);
    if (prompt.scene_graph.camera.lens_mm) {
      parts.push(`${prompt.scene_graph.camera.lens_mm}mm lens`);
    }
  }
  
  if (prompt.scene_graph?.lighting) {
    parts.push(`${prompt.scene_graph.lighting.style} lighting`);
  }
  
  if (prompt.scene_graph?.atmosphere) {
    parts.push(`${prompt.scene_graph.atmosphere} atmosphere`);
  }
  
  parts.push("cinematic, high quality, detailed, bloodwing style");
  
  return parts.join(", ");
}
