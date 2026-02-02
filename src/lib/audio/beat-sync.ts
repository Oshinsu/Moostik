/**
 * BEAT-SYNC ENGINE - Moostik Studio
 * Système de synchronisation audio/vidéo basé sur l'analyse musicale
 * 
 * SOTA Janvier 2026:
 * - librosa.beat.beat_track() (Python)
 * - Essentia BeatTrackerMultiFeature
 * - music-tempo (Node.js)
 * - web-audio-beat-detector (Browser)
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Valeurs de notes musicales
 * - whole: ronde (4 temps)
 * - half: blanche (2 temps)
 * - quarter: noire (1 temps)
 * - eighth: croche (1/2 temps)
 * - sixteenth: double croche (1/4 temps)
 * - thirtysecond: triple croche (1/8 temps)
 */
export type NoteValue = 
  | "whole"      // ronde - 4 temps
  | "half"       // blanche - 2 temps
  | "quarter"    // noire - 1 temps
  | "eighth"     // croche - 1/2 temps
  | "sixteenth"  // double croche - 1/4 temps
  | "thirtysecond"; // triple croche - 1/8 temps

/**
 * Signature temporelle
 */
export interface TimeSignature {
  numerator: number;   // ex: 4 (nombre de temps par mesure)
  denominator: number; // ex: 4 (valeur de la note = 1 temps)
}

/**
 * Résultat de l'analyse audio
 */
export interface AudioAnalysis {
  bpm: number;
  confidence: number; // 0-1
  beats: number[];    // positions des beats en secondes
  measures: number[]; // positions des mesures en secondes
  duration: number;   // durée totale en secondes
  timeSignature: TimeSignature;
}

/**
 * Grille musicale avec toutes les subdivisions
 */
export interface MusicalGrid {
  bpm: number;
  timeSignature: TimeSignature;
  beatDuration: number;      // durée d'un beat en secondes
  measureDuration: number;   // durée d'une mesure en secondes
  
  // Positions en secondes pour chaque type de note
  measures: number[];        // positions des mesures
  beats: number[];           // noires (quarter notes)
  halfBeats: number[];       // croches (eighth notes)
  quarterBeats: number[];    // double croches (sixteenth notes)
  eighthBeats: number[];     // triple croches (thirtysecond notes)
}

/**
 * Point de cut pour le montage
 */
export interface CutPoint {
  time: number;           // position en secondes
  type: NoteValue;        // type de note sur laquelle on coupe
  measureIndex: number;   // index de la mesure
  beatIndex: number;      // index du beat dans la mesure
  strength: number;       // force du cut (1 = temps fort, 0.5 = temps faible)
}

/**
 * Configuration du montage automatique
 */
export interface AutoEditConfig {
  preferredCuts: NoteValue[];     // types de notes préférés pour les cuts
  minCutDuration: number;         // durée min entre 2 cuts (secondes)
  maxCutDuration: number;         // durée max entre 2 cuts (secondes)
  preferStrongBeats: boolean;     // préférer les temps forts
  syncMode: "strict" | "loose";   // strict = exactement sur le beat, loose = proche
  transitionDuration: number;     // durée des transitions (secondes)
}

/**
 * Segment vidéo dans le montage
 */
export interface VideoSegment {
  shotId: string;
  variationId: string;
  sourceUrl: string;
  startTime: number;      // début dans la timeline
  endTime: number;        // fin dans la timeline
  inPoint: number;        // point d'entrée dans le clip source
  outPoint: number;       // point de sortie dans le clip source
  transition?: {
    type: "cut" | "fade" | "crossfade";
    duration: number;
  };
}

/**
 * Timeline complète du montage
 */
export interface EditTimeline {
  duration: number;
  audioTrack?: {
    url: string;
    bpm: number;
    startOffset: number;
  };
  videoSegments: VideoSegment[];
  markers: CutPoint[];
}

// ============================================================================
// CONSTANTES
// ============================================================================

/**
 * Multiplicateurs pour les valeurs de notes
 * (relative à une noire = 1)
 */
export const NOTE_MULTIPLIERS: Record<NoteValue, number> = {
  whole: 4,           // ronde = 4 temps
  half: 2,            // blanche = 2 temps
  quarter: 1,         // noire = 1 temps
  eighth: 0.5,        // croche = 1/2 temps
  sixteenth: 0.25,    // double croche = 1/4 temps
  thirtysecond: 0.125, // triple croche = 1/8 temps
};

/**
 * Noms français des notes
 */
export const NOTE_NAMES_FR: Record<NoteValue, string> = {
  whole: "Ronde",
  half: "Blanche",
  quarter: "Noire",
  eighth: "Croche",
  sixteenth: "Double croche",
  thirtysecond: "Triple croche",
};

/**
 * Configuration par défaut
 */
export const DEFAULT_AUTO_EDIT_CONFIG: AutoEditConfig = {
  preferredCuts: ["quarter", "half"],
  minCutDuration: 1.5,
  maxCutDuration: 8,
  preferStrongBeats: true,
  syncMode: "strict",
  transitionDuration: 0,
};

// ============================================================================
// FONCTIONS DE CALCUL
// ============================================================================

/**
 * Calcule la durée d'une note en secondes
 */
export function getNoteDuration(bpm: number, noteValue: NoteValue): number {
  const beatDuration = 60 / bpm; // durée d'une noire en secondes
  return beatDuration * NOTE_MULTIPLIERS[noteValue];
}

/**
 * Calcule la durée d'une mesure en secondes
 */
export function getMeasureDuration(bpm: number, timeSignature: TimeSignature): number {
  const beatDuration = 60 / bpm;
  return beatDuration * timeSignature.numerator;
}

/**
 * Génère une grille musicale complète
 */
export function generateMusicalGrid(
  bpm: number,
  duration: number,
  timeSignature: TimeSignature = { numerator: 4, denominator: 4 }
): MusicalGrid {
  const beatDuration = 60 / bpm;
  const measureDuration = getMeasureDuration(bpm, timeSignature);
  
  const measures: number[] = [];
  const beats: number[] = [];
  const halfBeats: number[] = [];
  const quarterBeats: number[] = [];
  const eighthBeats: number[] = [];
  
  // Générer les positions
  let time = 0;
  let measureIndex = 0;
  
  while (time < duration) {
    // Mesure
    measures.push(time);
    
    // Beats dans la mesure
    for (let beat = 0; beat < timeSignature.numerator && time < duration; beat++) {
      beats.push(time);
      
      // Croches (2 par beat)
      for (let half = 0; half < 2 && time + half * beatDuration / 2 < duration; half++) {
        const halfTime = time + half * beatDuration / 2;
        if (half > 0) halfBeats.push(halfTime);
        
        // Double croches (2 par croche)
        for (let quarter = 0; quarter < 2; quarter++) {
          const quarterTime = halfTime + quarter * beatDuration / 4;
          if (quarter > 0 && quarterTime < duration) quarterBeats.push(quarterTime);
          
          // Triple croches (2 par double croche)
          for (let eighth = 0; eighth < 2; eighth++) {
            const eighthTime = quarterTime + eighth * beatDuration / 8;
            if (eighth > 0 && eighthTime < duration) eighthBeats.push(eighthTime);
          }
        }
      }
      
      time += beatDuration;
    }
    
    measureIndex++;
  }
  
  return {
    bpm,
    timeSignature,
    beatDuration,
    measureDuration,
    measures,
    beats,
    halfBeats,
    quarterBeats,
    eighthBeats,
  };
}

/**
 * Trouve le beat le plus proche d'un temps donné
 */
export function findNearestBeat(
  time: number,
  grid: MusicalGrid,
  noteValue: NoteValue = "quarter"
): { time: number; distance: number } {
  let positions: number[];
  
  switch (noteValue) {
    case "whole":
    case "half":
      positions = grid.measures;
      break;
    case "quarter":
      positions = grid.beats;
      break;
    case "eighth":
      positions = [...grid.beats, ...grid.halfBeats].sort((a, b) => a - b);
      break;
    case "sixteenth":
      positions = [...grid.beats, ...grid.halfBeats, ...grid.quarterBeats].sort((a, b) => a - b);
      break;
    case "thirtysecond":
      positions = [
        ...grid.beats,
        ...grid.halfBeats,
        ...grid.quarterBeats,
        ...grid.eighthBeats,
      ].sort((a, b) => a - b);
      break;
    default:
      positions = grid.beats;
  }
  
  let nearest = positions[0] || 0;
  let minDistance = Math.abs(time - nearest);
  
  for (const pos of positions) {
    const distance = Math.abs(time - pos);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = pos;
    }
  }
  
  return { time: nearest, distance: minDistance };
}

/**
 * Génère des points de cut basés sur la grille musicale
 */
export function generateCutPoints(
  grid: MusicalGrid,
  config: AutoEditConfig = DEFAULT_AUTO_EDIT_CONFIG
): CutPoint[] {
  const cutPoints: CutPoint[] = [];
  const { preferredCuts, minCutDuration, preferStrongBeats } = config;
  
  // Collecter toutes les positions possibles avec leur type
  const allPositions: Array<{ time: number; type: NoteValue; strength: number }> = [];
  
  // Mesures (temps très forts)
  grid.measures.forEach((time) => {
    allPositions.push({ time, type: "whole", strength: 1.0 });
  });
  
  // Noires (temps forts)
  grid.beats.forEach((time, i) => {
    const isDownbeat = i % grid.timeSignature.numerator === 0;
    if (!isDownbeat) {
      allPositions.push({ time, type: "quarter", strength: 0.8 });
    }
  });
  
  // Croches
  grid.halfBeats.forEach((time) => {
    allPositions.push({ time, type: "eighth", strength: 0.5 });
  });
  
  // Double croches
  grid.quarterBeats.forEach((time) => {
    allPositions.push({ time, type: "sixteenth", strength: 0.3 });
  });
  
  // Trier par temps
  allPositions.sort((a, b) => a.time - b.time);
  
  // Filtrer selon les préférences
  let lastCutTime = -Infinity;
  
  for (const pos of allPositions) {
    // Vérifier la durée minimum
    if (pos.time - lastCutTime < minCutDuration) continue;
    
    // Vérifier le type de note préféré
    if (!preferredCuts.includes(pos.type)) continue;
    
    // Si on préfère les temps forts, filtrer
    if (preferStrongBeats && pos.strength < 0.5) continue;
    
    // Calculer les indices
    const measureIndex = Math.floor(pos.time / grid.measureDuration);
    const beatInMeasure = (pos.time % grid.measureDuration) / grid.beatDuration;
    
    cutPoints.push({
      time: pos.time,
      type: pos.type,
      measureIndex,
      beatIndex: Math.floor(beatInMeasure),
      strength: pos.strength,
    });
    
    lastCutTime = pos.time;
  }
  
  return cutPoints;
}

/**
 * Crée une timeline automatique à partir des vidéos et de la grille
 */
export function createAutoEditTimeline(
  videos: Array<{
    shotId: string;
    variationId: string;
    url: string;
    duration: number;
    sceneType?: string;
    narrativeWeight?: number;
  }>,
  grid: MusicalGrid,
  config: AutoEditConfig = DEFAULT_AUTO_EDIT_CONFIG
): EditTimeline {
  const cutPoints = generateCutPoints(grid, config);
  const segments: VideoSegment[] = [];
  
  // Durée totale = durée de la grille musicale
  const totalDuration = grid.measures[grid.measures.length - 1] + grid.measureDuration;
  
  // Trier les vidéos par poids narratif si disponible
  const sortedVideos = [...videos].sort((a, b) => 
    (b.narrativeWeight || 0.5) - (a.narrativeWeight || 0.5)
  );
  
  // Placer les vidéos sur les cut points
  let videoIndex = 0;
  
  for (let i = 0; i < cutPoints.length; i++) {
    const startCut = cutPoints[i];
    const endCut = cutPoints[i + 1];
    
    if (!endCut) break;
    
    const video = sortedVideos[videoIndex % sortedVideos.length];
    const segmentDuration = endCut.time - startCut.time;
    
    // Vérifier que le segment respecte les durées min/max
    if (segmentDuration < config.minCutDuration) continue;
    if (segmentDuration > config.maxCutDuration && i < cutPoints.length - 2) continue;
    
    segments.push({
      shotId: video.shotId,
      variationId: video.variationId,
      sourceUrl: video.url,
      startTime: startCut.time,
      endTime: endCut.time,
      inPoint: 0,
      outPoint: Math.min(segmentDuration, video.duration),
      transition: {
        type: config.transitionDuration > 0 ? "crossfade" : "cut",
        duration: config.transitionDuration,
      },
    });
    
    videoIndex++;
  }
  
  return {
    duration: totalDuration,
    videoSegments: segments,
    markers: cutPoints,
  };
}

/**
 * Exporte la timeline au format EDL (Edit Decision List)
 */
export function exportToEDL(timeline: EditTimeline, title: string = "MOOSTIK_EDIT"): string {
  const lines: string[] = [
    `TITLE: ${title}`,
    `FCM: NON-DROP FRAME`,
    ``,
  ];
  
  timeline.videoSegments.forEach((segment, i) => {
    const eventNum = (i + 1).toString().padStart(3, "0");
    const startTC = secondsToTimecode(segment.startTime);
    const endTC = secondsToTimecode(segment.endTime);
    const srcIn = secondsToTimecode(segment.inPoint);
    const srcOut = secondsToTimecode(segment.outPoint);
    
    lines.push(`${eventNum}  AX       V     C        ${srcIn} ${srcOut} ${startTC} ${endTC}`);
    lines.push(`* FROM CLIP NAME: ${segment.shotId}`);
    lines.push(``);
  });
  
  return lines.join("\n");
}

/**
 * Convertit des secondes en timecode (HH:MM:SS:FF à 24fps)
 */
function secondsToTimecode(seconds: number, fps: number = 24): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const f = Math.floor((seconds % 1) * fps);
  
  return [h, m, s, f].map(v => v.toString().padStart(2, "0")).join(":");
}
