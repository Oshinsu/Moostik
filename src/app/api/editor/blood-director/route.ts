/**
 * BLOOD DIRECTOR API
 * POST /api/editor/blood-director
 * 
 * Agent autonome de montage narratif Bloodwing
 */

import { NextRequest, NextResponse } from "next/server";
import { getEpisode } from "@/lib/storage";
import { getCharacters, getLocations } from "@/lib/storage";
import {
  bloodDirectorEdit,
  detectTimelineGaps,
  generateShotSuggestions,
  type BloodDirectorConfig,
  type EditingStyle,
  EDITING_STYLE_PRESETS,
} from "@/lib/editor/blood-director";

interface BloodDirectorRequest {
  episodeId: string;
  style: EditingStyle;
  targetDuration?: number;
  focusCharacters?: string[];
  focusLocations?: string[];
  excludeShots?: string[];
  pacePreference?: "slow" | "medium" | "fast" | "dynamic";
  transitionStyle?: "minimal" | "standard" | "dramatic";
  includeDialogue?: boolean;
  respectNarrativeOrder?: boolean;
  musicTrack?: {
    url: string;
    bpm?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: BloodDirectorRequest = await request.json();
    
    if (!body.episodeId) {
      return NextResponse.json(
        { error: "Missing episodeId" },
        { status: 400 }
      );
    }
    
    if (!body.style || !EDITING_STYLE_PRESETS[body.style]) {
      return NextResponse.json(
        { error: `Invalid style. Valid: ${Object.keys(EDITING_STYLE_PRESETS).join(", ")}` },
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
    
    // Build config
    const config: BloodDirectorConfig = {
      style: body.style,
      targetDuration: body.targetDuration,
      focusCharacters: body.focusCharacters,
      focusLocations: body.focusLocations,
      excludeShots: body.excludeShots,
      pacePreference: body.pacePreference || "medium",
      transitionStyle: body.transitionStyle || "standard",
      includeDialogue: body.includeDialogue ?? true,
      respectNarrativeOrder: body.respectNarrativeOrder ?? true,
    };
    
    // Add music beats if provided
    if (body.musicTrack?.bpm) {
      const beatInterval = 60 / body.musicTrack.bpm;
      const beats: number[] = [];
      const maxTime = config.targetDuration || 300;
      for (let t = 0; t < maxTime; t += beatInterval) {
        beats.push(t);
      }
      config.musicTrack = {
        url: body.musicTrack.url,
        bpm: body.musicTrack.bpm,
        beats,
      };
    }
    
    console.log(`[BloodDirector] Editing episode ${episode.title} with style: ${body.style}`);
    
    // Run Blood Director
    const result = await bloodDirectorEdit(episode, config, characters, locations);
    
    console.log(`[BloodDirector] Generated ${result.timeline.length} edit decisions`);
    console.log(`[BloodDirector] Total duration: ${result.totalDuration.toFixed(1)}s`);
    console.log(`[BloodDirector] Found ${result.gaps.length} gaps, ${result.suggestions.length} suggestions`);
    
    return NextResponse.json({
      success: true,
      episodeId: body.episodeId,
      style: body.style,
      preset: EDITING_STYLE_PRESETS[body.style],
      result,
    });
    
  } catch (error) {
    console.error("[BloodDirector] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/editor/blood-director
 * Get available editing styles and presets
 */
export async function GET() {
  return NextResponse.json({
    styles: Object.entries(EDITING_STYLE_PRESETS).map(([id, preset]) => ({
      id,
      ...preset,
    })),
  });
}
