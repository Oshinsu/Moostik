// ============================================================================
// SKILL: BEAT SYNC
// ============================================================================
// Synchronise les cuts vidéo avec le BPM d'une piste audio
// Analyse le tempo et génère des timestamps de cut optimaux
// ============================================================================

export interface AudioAnalysis {
  bpm: number;
  beats: number[];
  downbeats: number[];
  duration: number;
  energy: number[];
  segments: AudioSegment[];
}

export interface AudioSegment {
  start: number;
  end: number;
  type: "intro" | "verse" | "chorus" | "bridge" | "outro" | "drop" | "buildup";
  energy: number;
  bpm: number;
}

export interface CutPoint {
  timestamp: number;
  type: "beat" | "downbeat" | "segment" | "custom";
  strength: number; // 0-1, how important this cut is
  suggestedTransition: "cut" | "fade" | "dissolve" | "wipe";
}

export interface SyncResult {
  cutPoints: CutPoint[];
  shotDurations: number[];
  totalDuration: number;
  averageShotLength: number;
}

// ============================================================================
// BPM DETECTION
// ============================================================================

/**
 * Analyze audio track and detect BPM, beats, and segments
 */
export async function analyzeAudio(audioUrl: string): Promise<AudioAnalysis> {
  try {
    // Use audio analysis API (e.g., Essentia.js via Replicate)
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "audio-analysis-model:abc123", // Placeholder
        input: {
          audio_url: audioUrl,
          analyze_beats: true,
          analyze_segments: true,
          analyze_energy: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Audio analysis failed: ${response.status}`);
    }

    const prediction = await response.json();

    let result = prediction;
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise((r) => setTimeout(r, 2000));
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
      throw new Error(result.error || "Audio analysis failed");
    }

    return {
      bpm: result.output.bpm,
      beats: result.output.beats,
      downbeats: result.output.downbeats,
      duration: result.output.duration,
      energy: result.output.energy,
      segments: result.output.segments,
    };
  } catch (error) {
    // Fallback: estimate based on common values
    console.error("Audio analysis failed, using defaults:", error);
    return {
      bpm: 120,
      beats: [],
      downbeats: [],
      duration: 180,
      energy: [],
      segments: [],
    };
  }
}

/**
 * Simple BPM detection from audio file (fallback)
 * Uses onset detection heuristics
 */
export function estimateBPM(
  energyProfile: number[],
  sampleRate: number = 44100,
  hopSize: number = 512
): number {
  if (energyProfile.length < 2) return 120; // Default

  // Find peaks in energy profile
  const peaks: number[] = [];
  for (let i = 1; i < energyProfile.length - 1; i++) {
    if (
      energyProfile[i] > energyProfile[i - 1] &&
      energyProfile[i] > energyProfile[i + 1] &&
      energyProfile[i] > 0.5 // Threshold
    ) {
      peaks.push(i);
    }
  }

  if (peaks.length < 2) return 120;

  // Calculate average interval between peaks
  const intervals: number[] = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }

  const avgInterval =
    intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const secondsPerBeat = (avgInterval * hopSize) / sampleRate;
  const bpm = 60 / secondsPerBeat;

  // Clamp to reasonable range
  return Math.max(60, Math.min(200, Math.round(bpm)));
}

// ============================================================================
// CUT POINT GENERATION
// ============================================================================

/**
 * Generate optimal cut points based on audio analysis
 */
export function generateCutPoints(
  analysis: AudioAnalysis,
  options: {
    minShotDuration?: number; // seconds
    maxShotDuration?: number;
    preferDownbeats?: boolean;
    energyThreshold?: number;
  } = {}
): CutPoint[] {
  const {
    minShotDuration = 1.5,
    maxShotDuration = 8,
    preferDownbeats = true,
    energyThreshold = 0.3,
  } = options;

  const cutPoints: CutPoint[] = [];
  let lastCutTime = 0;

  // Process downbeats first (stronger cuts)
  if (preferDownbeats && analysis.downbeats.length > 0) {
    for (const beat of analysis.downbeats) {
      if (beat - lastCutTime >= minShotDuration) {
        cutPoints.push({
          timestamp: beat,
          type: "downbeat",
          strength: 0.9,
          suggestedTransition: "cut",
        });
        lastCutTime = beat;
      }
    }
  }

  // Fill gaps with regular beats
  lastCutTime = 0;
  for (const beat of analysis.beats) {
    // Check if we need a cut here
    const timeSinceLastCut = beat - lastCutTime;

    if (timeSinceLastCut >= maxShotDuration) {
      // Force a cut
      cutPoints.push({
        timestamp: beat,
        type: "beat",
        strength: 0.7,
        suggestedTransition: "cut",
      });
      lastCutTime = beat;
    } else if (
      timeSinceLastCut >= minShotDuration &&
      !cutPoints.find((c) => Math.abs(c.timestamp - beat) < 0.1)
    ) {
      // Optional cut on beat
      const energyIndex = Math.floor(
        (beat / analysis.duration) * analysis.energy.length
      );
      const energy = analysis.energy[energyIndex] || 0;

      if (energy > energyThreshold) {
        cutPoints.push({
          timestamp: beat,
          type: "beat",
          strength: 0.5 + energy * 0.3,
          suggestedTransition: "cut",
        });
        lastCutTime = beat;
      }
    }
  }

  // Add segment transitions (chorus drops, etc.)
  for (const segment of analysis.segments) {
    if (
      segment.type === "drop" ||
      segment.type === "chorus" ||
      segment.type === "bridge"
    ) {
      // Add transition at segment start
      if (!cutPoints.find((c) => Math.abs(c.timestamp - segment.start) < 0.5)) {
        cutPoints.push({
          timestamp: segment.start,
          type: "segment",
          strength: 1.0,
          suggestedTransition: segment.type === "drop" ? "cut" : "dissolve",
        });
      }
    }
  }

  // Sort by timestamp
  cutPoints.sort((a, b) => a.timestamp - b.timestamp);

  // Remove duplicates and too-close cuts
  const filtered: CutPoint[] = [];
  for (const point of cutPoints) {
    if (
      filtered.length === 0 ||
      point.timestamp - filtered[filtered.length - 1].timestamp >= minShotDuration
    ) {
      filtered.push(point);
    }
  }

  return filtered;
}

// ============================================================================
// SHOT DURATION MAPPING
// ============================================================================

/**
 * Map shots to cut points, calculating durations
 */
export function mapShotsToCutPoints(
  shotCount: number,
  cutPoints: CutPoint[],
  totalDuration: number
): SyncResult {
  // If we have more shots than cut points, we need to split
  // If fewer, we need to merge or skip cuts

  const shotDurations: number[] = [];
  const usedCutPoints: CutPoint[] = [];

  if (shotCount <= cutPoints.length) {
    // Use strongest cut points
    const sorted = [...cutPoints].sort((a, b) => b.strength - a.strength);
    const selected = sorted.slice(0, shotCount).sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 0; i < selected.length; i++) {
      const start = i === 0 ? 0 : selected[i - 1].timestamp;
      const end = selected[i].timestamp;
      shotDurations.push(end - start);
      usedCutPoints.push(selected[i]);
    }

    // Add final segment
    if (selected.length > 0) {
      const lastCut = selected[selected.length - 1];
      shotDurations.push(totalDuration - lastCut.timestamp);
    }
  } else {
    // More shots than cut points - distribute evenly
    const avgDuration = totalDuration / shotCount;
    for (let i = 0; i < shotCount; i++) {
      shotDurations.push(avgDuration);
      usedCutPoints.push({
        timestamp: avgDuration * (i + 1),
        type: "custom",
        strength: 0.5,
        suggestedTransition: "cut",
      });
    }
  }

  const averageShotLength =
    shotDurations.reduce((a, b) => a + b, 0) / shotDurations.length;

  return {
    cutPoints: usedCutPoints,
    shotDurations,
    totalDuration,
    averageShotLength,
  };
}

// ============================================================================
// MAIN SYNC FUNCTION
// ============================================================================

export interface BeatSyncOptions {
  audioUrl: string;
  shotCount: number;
  minShotDuration?: number;
  maxShotDuration?: number;
  preferDownbeats?: boolean;
}

/**
 * Main function to synchronize shots with audio
 */
export async function syncShotsToAudio(
  options: BeatSyncOptions
): Promise<SyncResult> {
  const {
    audioUrl,
    shotCount,
    minShotDuration = 1.5,
    maxShotDuration = 8,
    preferDownbeats = true,
  } = options;

  // Analyze audio
  const analysis = await analyzeAudio(audioUrl);

  // Generate cut points
  const cutPoints = generateCutPoints(analysis, {
    minShotDuration,
    maxShotDuration,
    preferDownbeats,
  });

  // Map shots to cut points
  const result = mapShotsToCutPoints(shotCount, cutPoints, analysis.duration);

  return result;
}

/**
 * Generate a timing sheet for video editing
 */
export function generateTimingSheet(
  syncResult: SyncResult,
  shotNames: string[]
): string {
  let sheet = "# Beat Sync Timing Sheet\n\n";
  sheet += `Total Duration: ${syncResult.totalDuration.toFixed(2)}s\n`;
  sheet += `Average Shot Length: ${syncResult.averageShotLength.toFixed(2)}s\n`;
  sheet += `Total Shots: ${shotNames.length}\n\n`;
  sheet += "## Shot Timings\n\n";
  sheet += "| Shot | Start | End | Duration | Cut Type |\n";
  sheet += "|------|-------|-----|----------|----------|\n";

  let currentTime = 0;
  for (let i = 0; i < shotNames.length; i++) {
    const duration = syncResult.shotDurations[i] || 0;
    const cutPoint = syncResult.cutPoints[i];
    const cutType = cutPoint?.suggestedTransition || "cut";

    sheet += `| ${shotNames[i]} | ${currentTime.toFixed(2)}s | ${(currentTime + duration).toFixed(2)}s | ${duration.toFixed(2)}s | ${cutType} |\n`;

    currentTime += duration;
  }

  return sheet;
}
