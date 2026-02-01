/**
 * TIMELINE GAPS API
 * POST /api/editor/gaps
 * 
 * Détection des gaps narratifs et génération de suggestions
 */

import { NextRequest, NextResponse } from "next/server";
import { getEpisode, getCharacters, getLocations } from "@/lib/storage";
import {
  detectTimelineGaps,
  generateShotSuggestions,
  type TimelineGap,
  type ShotSuggestion,
} from "@/lib/editor/blood-director";

interface GapsRequest {
  episodeId: string;
}

interface GapsResponse {
  success: boolean;
  episodeId: string;
  gaps: TimelineGap[];
  suggestions: ShotSuggestion[];
  stats: {
    totalGaps: number;
    criticalGaps: number;
    importantGaps: number;
    minorGaps: number;
    totalSuggestions: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GapsRequest = await request.json();
    
    if (!body.episodeId) {
      return NextResponse.json(
        { error: "Missing episodeId" },
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
    
    console.log(`[Gaps] Analyzing episode: ${episode.title}`);
    
    // Detect gaps
    const gaps = detectTimelineGaps(episode, characters, locations);
    
    // Generate suggestions for each gap
    const allSuggestions: ShotSuggestion[] = [];
    for (const gap of gaps) {
      const suggestions = generateShotSuggestions(gap, characters, locations);
      allSuggestions.push(...suggestions);
    }
    
    // Remove duplicates and sort by confidence
    const uniqueSuggestions = allSuggestions
      .filter((s, i, arr) => arr.findIndex(x => x.type === s.type && x.name === s.name) === i)
      .sort((a, b) => b.confidence - a.confidence);
    
    const stats = {
      totalGaps: gaps.length,
      criticalGaps: gaps.filter(g => g.severity === "critical").length,
      importantGaps: gaps.filter(g => g.severity === "important").length,
      minorGaps: gaps.filter(g => g.severity === "minor").length,
      totalSuggestions: uniqueSuggestions.length,
    };
    
    console.log(`[Gaps] Found ${stats.totalGaps} gaps (${stats.criticalGaps} critical)`);
    console.log(`[Gaps] Generated ${stats.totalSuggestions} suggestions`);
    
    const response: GapsResponse = {
      success: true,
      episodeId: body.episodeId,
      gaps,
      suggestions: uniqueSuggestions,
      stats,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("[Gaps] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
