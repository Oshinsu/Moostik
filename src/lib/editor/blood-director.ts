/**
 * BLOOD DIRECTOR - Agent Autonome de Montage Narratif
 * Bloodwing Studio - SOTA Février 2026
 * 
 * Un agent AI qui comprend la structure narrative MOOSTIK et monte
 * automatiquement en respectant les règles du Bloodwing Cinematic Universe.
 */

import type { Episode, Shot, Act, DialogueLine } from "@/types/episode";
import type { Character } from "@/types/character";
import type { Location } from "@/types/location";

// ============================================
// TYPES
// ============================================

export type EditingStyle = 
  | "trailer"           // 60s tension maximum
  | "episode_standard"  // Rythme narratif complet
  | "emotional_cut"     // Focus émotions
  | "action_reel"       // Compilation combats
  | "music_video"       // Sync musique
  | "tiktok_viral"      // Vertical, rapide
  | "documentary";      // Lent, contemplatif

export type TransitionType =
  | "cut"               // Coupe franche
  | "dissolve"          // Fondu enchaîné
  | "fade_black"        // Fondu au noir
  | "fade_white"        // Fondu au blanc
  | "wipe"              // Volet
  | "glitch"            // Effet glitch
  | "blood_splatter"    // Transition sang Bloodwing
  | "mosquito_swarm";   // Essaim STEGOMYIA

export type ShotSuggestionType =
  | "establishing"      // Plan d'ensemble
  | "insert"            // Insert détail
  | "reaction"          // Réaction personnage
  | "transition"        // Plan de transition
  | "cutaway"           // Plan de coupe
  | "pov"               // Point de vue
  | "detail"            // Gros plan détail
  | "wide";             // Plan large

export interface TimelineGap {
  id: string;
  startTime: number;
  endTime: number;
  beforeShot?: Shot;
  afterShot?: Shot;
  type: "narrative" | "pacing" | "continuity" | "emotional";
  severity: "critical" | "important" | "minor";
  reason: string;
  suggestions: ShotSuggestion[];
}

export interface ShotSuggestion {
  id: string;
  type: ShotSuggestionType;
  name: string;
  description: string;
  duration: number;
  characterIds?: string[];
  locationId?: string;
  emotionalTone?: string;
  cameraAngle?: string;
  promptHint?: string;
  confidence: number; // 0-1
}

export interface EditDecision {
  shotId: string;
  startTime: number;
  duration: number;
  transition: TransitionType;
  transitionDuration: number;
  speedMultiplier: number;
  audioLevel: number;
  effects?: string[];
}

export interface BloodDirectorOutput {
  timeline: EditDecision[];
  totalDuration: number;
  stats: {
    shotsUsed: number;
    shotsSkipped: number;
    transitionsApplied: number;
    averageShotDuration: number;
    paceScore: number; // 0-1
    emotionalArc: number[]; // Courbe émotionnelle
  };
  gaps: TimelineGap[];
  suggestions: ShotSuggestion[];
}

export interface BloodDirectorConfig {
  style: EditingStyle;
  targetDuration?: number; // Durée cible en secondes
  musicTrack?: {
    url: string;
    bpm?: number;
    beats?: number[]; // Timestamps des beats
  };
  focusCharacters?: string[];
  focusLocations?: string[];
  excludeShots?: string[];
  pacePreference: "slow" | "medium" | "fast" | "dynamic";
  transitionStyle: "minimal" | "standard" | "dramatic";
  includeDialogue: boolean;
  respectNarrativeOrder: boolean;
}

// ============================================
// STYLE PRESETS
// ============================================

export const EDITING_STYLE_PRESETS: Record<EditingStyle, {
  name: string;
  description: string;
  avgShotDuration: number;
  paceVariation: number;
  preferredTransitions: TransitionType[];
  emotionalCurve: "flat" | "rising" | "falling" | "wave" | "climax";
  aspectRatio: "16:9" | "9:16" | "1:1";
  maxDuration?: number;
}> = {
  trailer: {
    name: "Trailer Cinématique",
    description: "Montage intense avec tension crescendo",
    avgShotDuration: 1.5,
    paceVariation: 0.8,
    preferredTransitions: ["cut", "glitch", "blood_splatter"],
    emotionalCurve: "climax",
    aspectRatio: "16:9",
    maxDuration: 90,
  },
  episode_standard: {
    name: "Épisode Standard",
    description: "Rythme narratif complet avec tous les éléments",
    avgShotDuration: 4,
    paceVariation: 0.5,
    preferredTransitions: ["cut", "dissolve", "fade_black"],
    emotionalCurve: "wave",
    aspectRatio: "16:9",
  },
  emotional_cut: {
    name: "Emotional Cut",
    description: "Focus sur les moments émotionnels intenses",
    avgShotDuration: 3,
    paceVariation: 0.6,
    preferredTransitions: ["dissolve", "fade_black"],
    emotionalCurve: "rising",
    aspectRatio: "16:9",
  },
  action_reel: {
    name: "Action Reel",
    description: "Compilation des scènes de combat",
    avgShotDuration: 1.2,
    paceVariation: 0.9,
    preferredTransitions: ["cut", "glitch", "blood_splatter"],
    emotionalCurve: "flat",
    aspectRatio: "16:9",
    maxDuration: 60,
  },
  music_video: {
    name: "Music Video",
    description: "Synchronisé avec la musique",
    avgShotDuration: 2,
    paceVariation: 0.3, // Moins de variation, plus régulier
    preferredTransitions: ["cut"],
    emotionalCurve: "wave",
    aspectRatio: "16:9",
  },
  tiktok_viral: {
    name: "TikTok Viral",
    description: "Format vertical, rapide, accrocheur",
    avgShotDuration: 0.8,
    paceVariation: 0.7,
    preferredTransitions: ["cut", "glitch"],
    emotionalCurve: "climax",
    aspectRatio: "9:16",
    maxDuration: 60,
  },
  documentary: {
    name: "Documentaire",
    description: "Rythme lent, contemplatif",
    avgShotDuration: 6,
    paceVariation: 0.3,
    preferredTransitions: ["dissolve", "fade_black"],
    emotionalCurve: "rising",
    aspectRatio: "16:9",
  },
};

// ============================================
// SCENE TYPE SCORING
// ============================================

const SCENE_TYPE_SCORES: Record<string, Record<EditingStyle, number>> = {
  genocide: { trailer: 0.9, episode_standard: 0.8, emotional_cut: 1.0, action_reel: 0.7, music_video: 0.5, tiktok_viral: 0.8, documentary: 0.6 },
  survival: { trailer: 0.8, episode_standard: 0.9, emotional_cut: 0.7, action_reel: 0.6, music_video: 0.6, tiktok_viral: 0.7, documentary: 0.8 },
  training: { trailer: 0.7, episode_standard: 0.7, emotional_cut: 0.5, action_reel: 0.9, music_video: 0.7, tiktok_viral: 0.8, documentary: 0.6 },
  planning: { trailer: 0.4, episode_standard: 0.8, emotional_cut: 0.6, action_reel: 0.2, music_video: 0.4, tiktok_viral: 0.3, documentary: 0.9 },
  bar_scene: { trailer: 0.6, episode_standard: 0.8, emotional_cut: 0.7, action_reel: 0.3, music_video: 0.8, tiktok_viral: 0.5, documentary: 0.7 },
  battle: { trailer: 1.0, episode_standard: 0.9, emotional_cut: 0.8, action_reel: 1.0, music_video: 0.7, tiktok_viral: 0.9, documentary: 0.5 },
  emotional: { trailer: 0.7, episode_standard: 0.9, emotional_cut: 1.0, action_reel: 0.2, music_video: 0.6, tiktok_viral: 0.6, documentary: 0.8 },
  establishing: { trailer: 0.5, episode_standard: 0.7, emotional_cut: 0.4, action_reel: 0.3, music_video: 0.5, tiktok_viral: 0.4, documentary: 1.0 },
  flashback: { trailer: 0.8, episode_standard: 0.8, emotional_cut: 0.9, action_reel: 0.4, music_video: 0.6, tiktok_viral: 0.5, documentary: 0.7 },
  montage: { trailer: 0.9, episode_standard: 0.7, emotional_cut: 0.6, action_reel: 0.8, music_video: 1.0, tiktok_viral: 1.0, documentary: 0.5 },
  revelation: { trailer: 0.9, episode_standard: 0.9, emotional_cut: 1.0, action_reel: 0.5, music_video: 0.6, tiktok_viral: 0.7, documentary: 0.8 },
};

// ============================================
// GAP DETECTION
// ============================================

/**
 * Détecte les gaps narratifs dans une timeline
 */
export function detectTimelineGaps(
  episode: Episode,
  characters: Character[],
  locations: Location[]
): TimelineGap[] {
  const gaps: TimelineGap[] = [];
  const shots = episode.shots.filter(s => 
    s.variations.some(v => v.status === "completed")
  );
  
  if (shots.length < 2) return gaps;
  
  for (let i = 0; i < shots.length - 1; i++) {
    const currentShot = shots[i];
    const nextShot = shots[i + 1];
    
    const gap = analyzeGapBetweenShots(
      currentShot, 
      nextShot, 
      characters, 
      locations,
      episode.acts || []
    );
    
    if (gap) {
      gaps.push(gap);
    }
  }
  
  return gaps;
}

function analyzeGapBetweenShots(
  before: Shot,
  after: Shot,
  characters: Character[],
  locations: Location[],
  acts: Act[]
): TimelineGap | null {
  const suggestions: ShotSuggestion[] = [];
  let gapType: TimelineGap["type"] = "narrative";
  let severity: TimelineGap["severity"] = "minor";
  let reason = "";
  
  // Check location change without transition
  const locationChange = 
    before.locationIds?.[0] !== after.locationIds?.[0] &&
    before.locationIds?.[0] && after.locationIds?.[0];
  
  if (locationChange) {
    const newLocation = locations.find(l => l.id === after.locationIds?.[0]);
    reason = `Changement de lieu abrupt (→ ${newLocation?.name || "inconnu"})`;
    severity = "important";
    gapType = "continuity";
    
    suggestions.push({
      id: `sug-${Date.now()}-est`,
      type: "establishing",
      name: `Plan d'établissement: ${newLocation?.name}`,
      description: `Vue extérieure de ${newLocation?.name} pour établir le nouveau lieu`,
      duration: 3,
      locationId: after.locationIds?.[0],
      cameraAngle: "wide",
      confidence: 0.9,
    });
  }
  
  // Check emotional jump
  const emotionBefore = before.audio?.emotionalTone || "neutral";
  const emotionAfter = after.audio?.emotionalTone || "neutral";
  const emotionalJump = isEmotionalJump(emotionBefore, emotionAfter);
  
  if (emotionalJump && !locationChange) {
    reason = `Saut émotionnel (${emotionBefore} → ${emotionAfter})`;
    severity = severity === "important" ? "critical" : "important";
    gapType = "emotional";
    
    suggestions.push({
      id: `sug-${Date.now()}-react`,
      type: "reaction",
      name: "Plan de réaction",
      description: `Réaction d'un personnage pour la transition émotionnelle`,
      duration: 2,
      characterIds: after.characterIds?.slice(0, 1),
      emotionalTone: emotionAfter,
      cameraAngle: "close_up",
      confidence: 0.8,
    });
  }
  
  // Check character appearance without intro
  const newCharacters = (after.characterIds || []).filter(
    id => !(before.characterIds || []).includes(id)
  );
  
  if (newCharacters.length > 0 && !locationChange) {
    const char = characters.find(c => c.id === newCharacters[0]);
    reason = reason 
      ? `${reason} + Apparition de ${char?.name}` 
      : `Apparition soudaine de ${char?.name}`;
    severity = "important";
    
    suggestions.push({
      id: `sug-${Date.now()}-intro`,
      type: "cutaway",
      name: `Introduction: ${char?.name}`,
      description: `Plan d'introduction de ${char?.name} avant son apparition`,
      duration: 2,
      characterIds: [newCharacters[0]],
      cameraAngle: "medium",
      confidence: 0.85,
    });
  }
  
  // Check for act boundary
  const beforeAct = acts.find(a => a.shotIds.includes(before.id));
  const afterAct = acts.find(a => a.shotIds.includes(after.id));
  
  if (beforeAct && afterAct && beforeAct.id !== afterAct.id) {
    reason = `Transition entre Acte ${beforeAct.number} et Acte ${afterAct.number}`;
    severity = "critical";
    gapType = "narrative";
    
    suggestions.push({
      id: `sug-${Date.now()}-trans`,
      type: "transition",
      name: "Plan de transition d'acte",
      description: `Transition visuelle entre les actes`,
      duration: 2,
      cameraAngle: "establishing",
      confidence: 0.95,
    });
  }
  
  // Return gap if any issues found
  if (suggestions.length > 0) {
    return {
      id: `gap-${before.id}-${after.id}`,
      startTime: 0, // Will be calculated based on timeline
      endTime: 0,
      beforeShot: before,
      afterShot: after,
      type: gapType,
      severity,
      reason,
      suggestions,
    };
  }
  
  return null;
}

function isEmotionalJump(before: string, after: string): boolean {
  const emotionScale: Record<string, number> = {
    "neutral": 5,
    "calm": 4,
    "melancholic": 3,
    "sad": 2,
    "terrified": 1,
    "desperate": 1,
    "angry": 7,
    "determined": 6,
    "loving": 4,
    "mocking": 6,
    "triumphant": 8,
  };
  
  const beforeScore = emotionScale[before] || 5;
  const afterScore = emotionScale[after] || 5;
  
  return Math.abs(beforeScore - afterScore) >= 3;
}

// ============================================
// SHOT SUGGESTION GENERATOR
// ============================================

/**
 * Génère des suggestions de shots pour combler un gap
 */
export function generateShotSuggestions(
  gap: TimelineGap,
  characters: Character[],
  locations: Location[]
): ShotSuggestion[] {
  const suggestions: ShotSuggestion[] = [...gap.suggestions];
  
  // Add contextual suggestions based on gap type
  if (gap.type === "continuity" && gap.afterShot?.locationIds?.[0]) {
    const location = locations.find(l => l.id === gap.afterShot?.locationIds?.[0]);
    if (location) {
      suggestions.push({
        id: `sug-${Date.now()}-detail`,
        type: "detail",
        name: `Détail: ${location.name}`,
        description: `Gros plan sur un élément caractéristique de ${location.name}`,
        duration: 1.5,
        locationId: location.id,
        cameraAngle: "extreme_close_up",
        promptHint: location.referencePrompt ? 
          `Detail shot of ${location.name}, focusing on distinctive element` : undefined,
        confidence: 0.7,
      });
    }
  }
  
  if (gap.type === "emotional" && gap.beforeShot?.characterIds?.[0]) {
    const char = characters.find(c => c.id === gap.beforeShot?.characterIds?.[0]);
    if (char) {
      suggestions.push({
        id: `sug-${Date.now()}-pov`,
        type: "pov",
        name: `POV: ${char.name}`,
        description: `Point de vue subjectif de ${char.name}`,
        duration: 2,
        characterIds: [char.id],
        cameraAngle: "pov",
        emotionalTone: gap.afterShot?.audio?.emotionalTone,
        confidence: 0.75,
      });
    }
  }
  
  // Sort by confidence
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// ============================================
// BLOOD DIRECTOR - MAIN ENGINE
// ============================================

/**
 * Agent principal de montage automatique
 */
export async function bloodDirectorEdit(
  episode: Episode,
  config: BloodDirectorConfig,
  characters: Character[],
  locations: Location[]
): Promise<BloodDirectorOutput> {
  const preset = EDITING_STYLE_PRESETS[config.style];
  const shots = episode.shots.filter(s => 
    s.variations.some(v => v.status === "completed") &&
    !config.excludeShots?.includes(s.id)
  );
  
  // Score and sort shots
  const scoredShots = shots.map(shot => ({
    shot,
    score: calculateShotScore(shot, config, characters, locations),
  })).sort((a, b) => {
    if (config.respectNarrativeOrder) {
      return a.shot.number - b.shot.number;
    }
    return b.score - a.score;
  });
  
  // Build timeline
  const timeline: EditDecision[] = [];
  let currentTime = 0;
  let emotionalArc: number[] = [];
  
  // Target duration handling
  const targetDuration = config.targetDuration || preset.maxDuration || 
    scoredShots.reduce((sum, s) => sum + (s.shot.durationSeconds || preset.avgShotDuration), 0);
  
  for (const { shot, score } of scoredShots) {
    if (currentTime >= targetDuration && config.targetDuration) break;
    
    // Calculate duration based on style and score
    let duration = shot.durationSeconds || preset.avgShotDuration;
    
    // Apply pace variation
    if (config.pacePreference === "fast") {
      duration *= 0.7;
    } else if (config.pacePreference === "slow") {
      duration *= 1.3;
    } else if (config.pacePreference === "dynamic") {
      // Vary based on emotional content
      const emotionWeight = getEmotionalWeight(shot);
      duration *= 0.7 + (emotionWeight * 0.6);
    }
    
    // Select transition
    const transition = selectTransition(
      timeline[timeline.length - 1]?.shotId,
      shot,
      config,
      preset
    );
    
    timeline.push({
      shotId: shot.id,
      startTime: currentTime,
      duration,
      transition: transition.type,
      transitionDuration: transition.duration,
      speedMultiplier: 1.0,
      audioLevel: config.includeDialogue && shot.dialogue?.length ? 1.0 : 0.5,
    });
    
    emotionalArc.push(getEmotionalWeight(shot));
    currentTime += duration;
  }
  
  // Apply beat sync if music provided
  if (config.musicTrack?.beats) {
    applyBeatSync(timeline, config.musicTrack.beats);
  }
  
  // Detect remaining gaps
  const gaps = detectTimelineGaps(episode, characters, locations);
  
  // Generate suggestions for gaps
  const suggestions: ShotSuggestion[] = [];
  for (const gap of gaps) {
    suggestions.push(...generateShotSuggestions(gap, characters, locations));
  }
  
  return {
    timeline,
    totalDuration: currentTime,
    stats: {
      shotsUsed: timeline.length,
      shotsSkipped: shots.length - timeline.length,
      transitionsApplied: timeline.filter(t => t.transition !== "cut").length,
      averageShotDuration: currentTime / timeline.length,
      paceScore: calculatePaceScore(timeline),
      emotionalArc,
    },
    gaps,
    suggestions: suggestions.slice(0, 10), // Top 10 suggestions
  };
}

function calculateShotScore(
  shot: Shot,
  config: BloodDirectorConfig,
  characters: Character[],
  locations: Location[]
): number {
  let score = 0.5;
  
  // Scene type score
  const sceneScore = SCENE_TYPE_SCORES[shot.sceneType]?.[config.style] || 0.5;
  score += sceneScore * 0.3;
  
  // Character focus bonus
  if (config.focusCharacters?.length) {
    const hasTargetChar = shot.characterIds?.some(id => 
      config.focusCharacters?.includes(id)
    );
    if (hasTargetChar) score += 0.2;
  }
  
  // Location focus bonus
  if (config.focusLocations?.length) {
    const hasTargetLoc = shot.locationIds?.some(id => 
      config.focusLocations?.includes(id)
    );
    if (hasTargetLoc) score += 0.15;
  }
  
  // Completed variation bonus
  const completedVars = shot.variations.filter(v => v.status === "completed").length;
  score += completedVars * 0.05;
  
  // Video available bonus
  const hasVideo = shot.variations.some(v => v.videoUrl);
  if (hasVideo) score += 0.1;
  
  return Math.min(1, score);
}

function getEmotionalWeight(shot: Shot): number {
  const emotionWeights: Record<string, number> = {
    "neutral": 0.3,
    "calm": 0.2,
    "melancholic": 0.5,
    "sad": 0.6,
    "terrified": 0.9,
    "desperate": 0.95,
    "angry": 0.8,
    "determined": 0.7,
    "loving": 0.5,
    "mocking": 0.4,
    "triumphant": 0.85,
  };
  
  const emotion = shot.audio?.emotionalTone || "neutral";
  return emotionWeights[emotion] || 0.5;
}

function selectTransition(
  prevShotId: string | undefined,
  currentShot: Shot,
  config: BloodDirectorConfig,
  preset: typeof EDITING_STYLE_PRESETS[EditingStyle]
): { type: TransitionType; duration: number } {
  if (!prevShotId) {
    return { type: "fade_black", duration: 0.5 };
  }
  
  // Determine transition based on style
  let type: TransitionType = "cut";
  let duration = 0;
  
  if (config.transitionStyle === "minimal") {
    type = "cut";
    duration = 0;
  } else if (config.transitionStyle === "dramatic") {
    // Use bloodwing-specific transitions for emotional scenes
    if (currentShot.sceneType === "genocide" || currentShot.sceneType === "battle") {
      type = Math.random() > 0.5 ? "blood_splatter" : "glitch";
      duration = 0.3;
    } else if (currentShot.sceneType === "emotional" || currentShot.sceneType === "flashback") {
      type = "dissolve";
      duration = 0.8;
    } else {
      type = preset.preferredTransitions[
        Math.floor(Math.random() * preset.preferredTransitions.length)
      ];
      duration = type === "cut" ? 0 : 0.5;
    }
  } else {
    // Standard - occasional transitions
    if (Math.random() > 0.7) {
      type = preset.preferredTransitions[
        Math.floor(Math.random() * preset.preferredTransitions.length)
      ];
      duration = type === "cut" ? 0 : 0.5;
    }
  }
  
  return { type, duration };
}

function applyBeatSync(timeline: EditDecision[], beats: number[]): void {
  if (beats.length === 0) return;
  
  let beatIndex = 0;
  
  for (let i = 0; i < timeline.length && beatIndex < beats.length; i++) {
    const decision = timeline[i];
    
    // Find nearest beat to shot start
    while (beatIndex < beats.length - 1 && 
           beats[beatIndex + 1] < decision.startTime) {
      beatIndex++;
    }
    
    // Snap to beat if close enough
    const beatTime = beats[beatIndex];
    const diff = Math.abs(decision.startTime - beatTime);
    
    if (diff < 0.5) {
      // Adjust timing to hit beat
      const adjustment = beatTime - decision.startTime;
      decision.startTime = beatTime;
      
      // Adjust previous shot duration if needed
      if (i > 0) {
        timeline[i - 1].duration += adjustment;
      }
      
      beatIndex++;
    }
  }
}

function calculatePaceScore(timeline: EditDecision[]): number {
  if (timeline.length < 2) return 0.5;
  
  const durations = timeline.map(t => t.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower std dev = more consistent pacing
  // Higher std dev = more dynamic
  // Score is normalized between 0-1
  return Math.min(1, stdDev / avgDuration);
}

// ============================================
// BEAT DETECTION
// ============================================

/**
 * Détecte les beats dans une piste audio
 * Note: Cette fonction est un placeholder - en production,
 * utiliser une librairie comme Essentia.js ou une API
 */
export async function detectBeats(audioUrl: string): Promise<number[]> {
  // Placeholder - retourne des beats simulés
  // En production: utiliser Web Audio API + analyse FFT
  const mockBpm = 120;
  const beatInterval = 60 / mockBpm;
  const duration = 180; // 3 minutes
  
  const beats: number[] = [];
  for (let t = 0; t < duration; t += beatInterval) {
    beats.push(t);
  }
  
  return beats;
}

// ============================================
// EXPORTS
// ============================================

export {
  EDITING_STYLE_PRESETS as PRESETS,
};
