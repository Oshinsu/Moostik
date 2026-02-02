/**
 * BEAT-SYNC ENGINE - Moostik Studio
 * Système de synchronisation audio/vidéo basé sur l'analyse musicale
 * 
 * SOTA Janvier 2026:
 * - librosa.beat.beat_track() (Python)
 * - Essentia BeatTrackerMultiFeature
 * - music-tempo (Node.js)
 * - web-audio-beat-detector (Browser)
 * 
 * THÉORIE DU MONTAGE INTÉGRÉE:
 * - Eisenstein: Montage dialectique (collision de plans)
 * - Pudovkin: Montage rythmique (flux émotionnel)
 * - Hollywood ASL (Average Shot Length) par genre
 * - Structures EDM (build-up → drop → breakdown)
 * - Cadences musicales (tension/release)
 */

// ============================================================================
// TYPES - NOTES MUSICALES COMPLÈTES
// ============================================================================

/**
 * Valeurs de notes musicales - TOUTES LES SUBDIVISIONS
 * 
 * De la plus longue à la plus courte:
 * - maxima: maxime (8 temps) - rare, musique ancienne
 * - longa: longue (4 temps en 4/4)
 * - whole: ronde (4 temps)
 * - half: blanche (2 temps)
 * - quarter: noire (1 temps) - RÉFÉRENCE
 * - eighth: croche (1/2 temps)
 * - sixteenth: double croche (1/4 temps)
 * - thirtysecond: triple croche (1/8 temps)
 * - sixtyfourth: quadruple croche (1/16 temps)
 * - hundredtwentyeighth: quintuple croche (1/32 temps)
 */
export type NoteValue = 
  | "maxima"              // maxime - 8 temps (très rare)
  | "longa"               // longue - 4 temps
  | "whole"               // ronde - 4 temps
  | "half"                // blanche - 2 temps
  | "dotted_half"         // blanche pointée - 3 temps
  | "quarter"             // noire - 1 temps
  | "dotted_quarter"      // noire pointée - 1.5 temps
  | "eighth"              // croche - 1/2 temps
  | "dotted_eighth"       // croche pointée - 3/4 temps
  | "triplet_quarter"     // triolet de noires - 2/3 temps
  | "sixteenth"           // double croche - 1/4 temps
  | "triplet_eighth"      // triolet de croches - 1/3 temps
  | "thirtysecond"        // triple croche - 1/8 temps
  | "sixtyfourth"         // quadruple croche - 1/16 temps
  | "hundredtwentyeighth"; // quintuple croche - 1/32 temps

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
// CONSTANTES - NOTES MUSICALES
// ============================================================================

/**
 * Multiplicateurs pour les valeurs de notes
 * (relative à une noire = 1)
 */
export const NOTE_MULTIPLIERS: Record<NoteValue, number> = {
  maxima: 8,                 // maxime = 8 temps
  longa: 4,                  // longue = 4 temps
  whole: 4,                  // ronde = 4 temps
  half: 2,                   // blanche = 2 temps
  dotted_half: 3,            // blanche pointée = 3 temps
  quarter: 1,                // noire = 1 temps (RÉFÉRENCE)
  dotted_quarter: 1.5,       // noire pointée = 1.5 temps
  eighth: 0.5,               // croche = 1/2 temps
  dotted_eighth: 0.75,       // croche pointée = 3/4 temps
  triplet_quarter: 2/3,      // triolet de noires = 2/3 temps
  sixteenth: 0.25,           // double croche = 1/4 temps
  triplet_eighth: 1/3,       // triolet de croches = 1/3 temps
  thirtysecond: 0.125,       // triple croche = 1/8 temps
  sixtyfourth: 0.0625,       // quadruple croche = 1/16 temps
  hundredtwentyeighth: 0.03125, // quintuple croche = 1/32 temps
};

/**
 * Noms français des notes
 */
export const NOTE_NAMES_FR: Record<NoteValue, string> = {
  maxima: "Maxime",
  longa: "Longue",
  whole: "Ronde",
  half: "Blanche",
  dotted_half: "Blanche pointée",
  quarter: "Noire",
  dotted_quarter: "Noire pointée",
  eighth: "Croche",
  dotted_eighth: "Croche pointée",
  triplet_quarter: "Triolet ♩",
  sixteenth: "Double croche",
  triplet_eighth: "Triolet ♪",
  thirtysecond: "Triple croche",
  sixtyfourth: "Quadruple croche",
  hundredtwentyeighth: "Quintuple croche",
};

/**
 * Symboles musicaux Unicode
 */
export const NOTE_SYMBOLS: Record<NoteValue, string> = {
  maxima: "𝅜",
  longa: "𝅝",
  whole: "𝅗𝅥",
  half: "𝅗𝅥",
  dotted_half: "𝅗𝅥.",
  quarter: "♩",
  dotted_quarter: "♩.",
  eighth: "♪",
  dotted_eighth: "♪.",
  triplet_quarter: "♩³",
  sixteenth: "♬",
  triplet_eighth: "♪³",
  thirtysecond: "𝅘𝅥𝅰",
  sixtyfourth: "𝅘𝅥𝅱",
  hundredtwentyeighth: "𝅘𝅥𝅲",
};

// ============================================================================
// SYMPHONIES DE MONTAGE - PRESETS CINEMATOGRAPHIQUES
// ============================================================================

/**
 * Type de symphonie de montage
 */
export type MontageSymhonyId = 
  | "eisenstein_collision"      // Montage dialectique - chocs visuels
  | "pudovkin_flow"             // Montage rythmique - flux émotionnel
  | "edm_drop"                  // Build-up → explosion de cuts
  | "classical_crescendo"       // Accélération progressive
  | "action_fury"               // Mad Max / Bourne - ASL 2-3s
  | "kubrick_contemplative"     // 2001 style - ASL 10-13s
  | "tarantino_dialogue"        // Longs plans → cuts brutaux
  | "tiktok_viral"              // Cuts ultra-rapides
  | "horror_tension"            // Silence → sursaut
  | "nolan_parallel"            // Timelines parallèles
  | "wes_anderson_symmetry"     // Coupes symétriques
  | "godard_jump_cut"           // Jump cuts disruptifs
  | "tarkovsky_meditation"      // Plans contemplatifs
  | "bay_chaos"                 // Chaos contrôlé
  | "wong_kar_wai_mood"         // Atmosphérique, slowmo
  | "cadence_authentic"         // V → I : résolution forte
  | "cadence_plagal"            // IV → I : résolution douce
  | "cadence_deceptive"         // V → VI : surprise
  | "call_response"             // Question → réponse
  | "tension_release";          // Montée → relâchement

/**
 * Définition d'une symphonie de montage
 */
export interface MontageSymhony {
  id: MontageSymhonyId;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  icon: string;
  category: "director" | "genre" | "musical" | "social" | "structure";
  
  // Configuration de base
  config: AutoEditConfig;
  
  // Pattern de cuts (définit la structure rythmique)
  pattern: {
    type: "constant" | "accelerating" | "decelerating" | "wave" | "random" | "custom";
    phases?: MontagePhase[];
  };
  
  // Statistiques de référence
  reference: {
    avgShotLength: number;  // ASL en secondes
    cutsPerMinute: number;  // CPM moyen
    source?: string;        // Film/réalisateur de référence
  };
  
  // BPM recommandés
  recommendedBpm: {
    min: number;
    max: number;
    ideal: number;
  };
}

/**
 * Phase dans un pattern de montage
 */
export interface MontagePhase {
  name: string;
  nameFr: string;
  startPercent: number;    // % du début de la phase
  endPercent: number;      // % de fin de la phase
  preferredNotes: NoteValue[];
  intensityMultiplier: number; // 0.5 = lent, 2 = rapide
  transitionType: "cut" | "fade" | "crossfade" | "whip";
}

/**
 * BIBLIOTHÈQUE DES SYMPHONIES DE MONTAGE
 * 
 * Basé sur:
 * - Théorie du montage soviétique (Eisenstein, Pudovkin)
 * - Standards Hollywood ASL (Average Shot Length)
 * - Structures musicales (cadences, EDM)
 * - Styles de réalisateurs reconnus
 */
export const MONTAGE_SYMPHONIES: Record<MontageSymhonyId, MontageSymhony> = {
  
  // ========================================================================
  // STYLES DE RÉALISATEURS
  // ========================================================================
  
  eisenstein_collision: {
    id: "eisenstein_collision",
    name: "Eisenstein Collision",
    nameFr: "Collision Eisenstein",
    description: "Dialectical montage: thesis + antithesis = synthesis. Sharp cuts on strong beats for intellectual collision.",
    descriptionFr: "Montage dialectique : thèse + antithèse = synthèse. Coupes nettes sur temps forts pour collision intellectuelle.",
    icon: "⚡",
    category: "director",
    config: {
      preferredCuts: ["quarter", "whole"],
      minCutDuration: 1.0,
      maxCutDuration: 4.0,
      preferStrongBeats: true,
      syncMode: "strict",
      transitionDuration: 0,
    },
    pattern: {
      type: "constant",
    },
    reference: {
      avgShotLength: 2.5,
      cutsPerMinute: 24,
      source: "Battleship Potemkin (1925)",
    },
    recommendedBpm: { min: 100, max: 140, ideal: 120 },
  },
  
  pudovkin_flow: {
    id: "pudovkin_flow",
    name: "Pudovkin Flow",
    nameFr: "Flux Pudovkin",
    description: "Rhythmic montage: emotional continuity through smooth timing and parallel action.",
    descriptionFr: "Montage rythmique : continuité émotionnelle par timing fluide et actions parallèles.",
    icon: "🌊",
    category: "director",
    config: {
      preferredCuts: ["half", "dotted_half", "quarter"],
      minCutDuration: 2.0,
      maxCutDuration: 6.0,
      preferStrongBeats: false,
      syncMode: "loose",
      transitionDuration: 0.3,
    },
    pattern: {
      type: "wave",
      phases: [
        { name: "Inhale", nameFr: "Inspiration", startPercent: 0, endPercent: 50, preferredNotes: ["half"], intensityMultiplier: 0.8, transitionType: "crossfade" },
        { name: "Exhale", nameFr: "Expiration", startPercent: 50, endPercent: 100, preferredNotes: ["quarter"], intensityMultiplier: 1.2, transitionType: "crossfade" },
      ],
    },
    reference: {
      avgShotLength: 4.0,
      cutsPerMinute: 15,
      source: "Mother (1926)",
    },
    recommendedBpm: { min: 60, max: 100, ideal: 80 },
  },
  
  kubrick_contemplative: {
    id: "kubrick_contemplative",
    name: "Kubrick Contemplative",
    nameFr: "Contemplatif Kubrick",
    description: "Long takes with precise geometry. Cuts on whole notes for maximum visual impact.",
    descriptionFr: "Plans longs avec géométrie précise. Coupes sur rondes pour impact visuel maximal.",
    icon: "🎭",
    category: "director",
    config: {
      preferredCuts: ["whole", "longa", "half"],
      minCutDuration: 8.0,
      maxCutDuration: 20.0,
      preferStrongBeats: true,
      syncMode: "strict",
      transitionDuration: 0,
    },
    pattern: { type: "constant" },
    reference: {
      avgShotLength: 13.0,
      cutsPerMinute: 4.6,
      source: "2001: A Space Odyssey (1968)",
    },
    recommendedBpm: { min: 40, max: 80, ideal: 60 },
  },
  
  tarantino_dialogue: {
    id: "tarantino_dialogue",
    name: "Tarantino Dialogue",
    nameFr: "Dialogue Tarantino",
    description: "Extended dialogue scenes with sudden violent cuts. Build tension then release.",
    descriptionFr: "Scènes de dialogue étendues avec coupes violentes soudaines. Tension puis libération.",
    icon: "💬",
    category: "director",
    config: {
      preferredCuts: ["whole", "half", "sixteenth"],
      minCutDuration: 3.0,
      maxCutDuration: 15.0,
      preferStrongBeats: true,
      syncMode: "strict",
      transitionDuration: 0,
    },
    pattern: {
      type: "custom",
      phases: [
        { name: "Dialogue", nameFr: "Dialogue", startPercent: 0, endPercent: 75, preferredNotes: ["whole", "half"], intensityMultiplier: 0.5, transitionType: "cut" },
        { name: "Action Burst", nameFr: "Explosion Action", startPercent: 75, endPercent: 100, preferredNotes: ["sixteenth", "eighth"], intensityMultiplier: 3.0, transitionType: "whip" },
      ],
    },
    reference: {
      avgShotLength: 5.0,
      cutsPerMinute: 12,
      source: "Pulp Fiction (1994)",
    },
    recommendedBpm: { min: 80, max: 130, ideal: 100 },
  },
  
  nolan_parallel: {
    id: "nolan_parallel",
    name: "Nolan Parallel",
    nameFr: "Parallèle Nolan",
    description: "Intercut timelines with mathematical precision. Accelerating convergence.",
    descriptionFr: "Lignes temporelles entrelacées avec précision mathématique. Convergence accélérée.",
    icon: "⏱️",
    category: "director",
    config: {
      preferredCuts: ["quarter", "eighth", "half"],
      minCutDuration: 1.5,
      maxCutDuration: 8.0,
      preferStrongBeats: true,
      syncMode: "strict",
      transitionDuration: 0,
    },
    pattern: {
      type: "accelerating",
      phases: [
        { name: "Setup", nameFr: "Installation", startPercent: 0, endPercent: 30, preferredNotes: ["half", "quarter"], intensityMultiplier: 0.7, transitionType: "cut" },
        { name: "Building", nameFr: "Construction", startPercent: 30, endPercent: 70, preferredNotes: ["quarter"], intensityMultiplier: 1.0, transitionType: "cut" },
        { name: "Convergence", nameFr: "Convergence", startPercent: 70, endPercent: 100, preferredNotes: ["eighth", "sixteenth"], intensityMultiplier: 2.0, transitionType: "cut" },
      ],
    },
    reference: {
      avgShotLength: 3.5,
      cutsPerMinute: 17,
      source: "Dunkirk (2017)",
    },
    recommendedBpm: { min: 100, max: 160, ideal: 128 },
  },
  
  wes_anderson_symmetry: {
    id: "wes_anderson_symmetry",
    name: "Wes Anderson Symmetry",
    nameFr: "Symétrie Anderson",
    description: "Perfectly centered compositions with whip pans. Cuts on exact beats.",
    descriptionFr: "Compositions parfaitement centrées avec panoramiques rapides. Coupes sur temps exacts.",
    icon: "📐",
    category: "director",
    config: {
      preferredCuts: ["quarter", "half"],
      minCutDuration: 2.0,
      maxCutDuration: 5.0,
      preferStrongBeats: true,
      syncMode: "strict",
      transitionDuration: 0,
    },
    pattern: { type: "constant" },
    reference: {
      avgShotLength: 3.5,
      cutsPerMinute: 17,
      source: "The Grand Budapest Hotel (2014)",
    },
    recommendedBpm: { min: 100, max: 140, ideal: 120 },
  },
  
  godard_jump_cut: {
    id: "godard_jump_cut",
    name: "Godard Jump Cut",
    nameFr: "Jump Cut Godard",
    description: "Disruptive jump cuts breaking continuity. Intentional mismatch on off-beats.",
    descriptionFr: "Jump cuts disruptifs brisant la continuité. Décalage intentionnel sur contre-temps.",
    icon: "✂️",
    category: "director",
    config: {
      preferredCuts: ["triplet_eighth", "sixteenth", "eighth"],
      minCutDuration: 0.5,
      maxCutDuration: 3.0,
      preferStrongBeats: false,
      syncMode: "loose",
      transitionDuration: 0,
    },
    pattern: { type: "random" },
    reference: {
      avgShotLength: 1.8,
      cutsPerMinute: 33,
      source: "Breathless (1960)",
    },
    recommendedBpm: { min: 90, max: 150, ideal: 110 },
  },
  
  tarkovsky_meditation: {
    id: "tarkovsky_meditation",
    name: "Tarkovsky Meditation",
    nameFr: "Méditation Tarkovski",
    description: "Ultra-long takes sculpting time itself. Minimal cuts, maximum duration.",
    descriptionFr: "Plans ultra-longs sculptant le temps lui-même. Cuts minimaux, durée maximale.",
    icon: "🕯️",
    category: "director",
    config: {
      preferredCuts: ["maxima", "longa", "whole"],
      minCutDuration: 15.0,
      maxCutDuration: 60.0,
      preferStrongBeats: true,
      syncMode: "loose",
      transitionDuration: 1.0,
    },
    pattern: { type: "constant" },
    reference: {
      avgShotLength: 25.0,
      cutsPerMinute: 2.4,
      source: "Stalker (1979)",
    },
    recommendedBpm: { min: 30, max: 60, ideal: 40 },
  },
  
  bay_chaos: {
    id: "bay_chaos",
    name: "Bay Chaos",
    nameFr: "Chaos Bay",
    description: "Controlled chaos: rapid cuts, spinning cameras, visual overload.",
    descriptionFr: "Chaos contrôlé : coupes rapides, caméras tournantes, surcharge visuelle.",
    icon: "💥",
    category: "director",
    config: {
      preferredCuts: ["sixteenth", "eighth", "triplet_eighth"],
      minCutDuration: 0.5,
      maxCutDuration: 2.0,
      preferStrongBeats: false,
      syncMode: "loose",
      transitionDuration: 0,
    },
    pattern: { type: "random" },
    reference: {
      avgShotLength: 1.5,
      cutsPerMinute: 40,
      source: "Transformers (2007)",
    },
    recommendedBpm: { min: 130, max: 180, ideal: 150 },
  },
  
  wong_kar_wai_mood: {
    id: "wong_kar_wai_mood",
    name: "Wong Kar-Wai Mood",
    nameFr: "Atmosphère Wong Kar-Wai",
    description: "Dreamy slowmo with step-printed frames. Cuts flow like memory.",
    descriptionFr: "Ralentis oniriques avec images dupliquées. Coupes fluides comme la mémoire.",
    icon: "🌙",
    category: "director",
    config: {
      preferredCuts: ["dotted_half", "half", "dotted_quarter"],
      minCutDuration: 3.0,
      maxCutDuration: 12.0,
      preferStrongBeats: false,
      syncMode: "loose",
      transitionDuration: 0.5,
    },
    pattern: { type: "wave" },
    reference: {
      avgShotLength: 6.0,
      cutsPerMinute: 10,
      source: "In the Mood for Love (2000)",
    },
    recommendedBpm: { min: 50, max: 90, ideal: 70 },
  },
  
  // ========================================================================
  // GENRES CINEMATOGRAPHIQUES
  // ========================================================================
  
  action_fury: {
    id: "action_fury",
    name: "Action Fury",
    nameFr: "Furie Action",
    description: "Mad Max / John Wick intensity. ASL 2-3 seconds, relentless energy.",
    descriptionFr: "Intensité Mad Max / John Wick. ASL 2-3 secondes, énergie implacable.",
    icon: "🔥",
    category: "genre",
    config: {
      preferredCuts: ["eighth", "quarter", "sixteenth"],
      minCutDuration: 0.8,
      maxCutDuration: 3.0,
      preferStrongBeats: true,
      syncMode: "strict",
      transitionDuration: 0,
    },
    pattern: {
      type: "accelerating",
      phases: [
        { name: "Setup", nameFr: "Installation", startPercent: 0, endPercent: 20, preferredNotes: ["quarter"], intensityMultiplier: 0.8, transitionType: "cut" },
        { name: "Intensity", nameFr: "Intensité", startPercent: 20, endPercent: 80, preferredNotes: ["eighth", "sixteenth"], intensityMultiplier: 1.5, transitionType: "cut" },
        { name: "Climax", nameFr: "Climax", startPercent: 80, endPercent: 100, preferredNotes: ["sixteenth", "thirtysecond"], intensityMultiplier: 2.5, transitionType: "whip" },
      ],
    },
    reference: {
      avgShotLength: 2.4,
      cutsPerMinute: 25,
      source: "Mad Max: Fury Road (2015)",
    },
    recommendedBpm: { min: 120, max: 180, ideal: 140 },
  },
  
  horror_tension: {
    id: "horror_tension",
    name: "Horror Tension",
    nameFr: "Tension Horreur",
    description: "Extended silence followed by shock cuts. Build dread, then strike.",
    descriptionFr: "Silence prolongé suivi de coupes choc. Construire l'angoisse, puis frapper.",
    icon: "👻",
    category: "genre",
    config: {
      preferredCuts: ["whole", "longa", "sixteenth"],
      minCutDuration: 4.0,
      maxCutDuration: 20.0,
      preferStrongBeats: true,
      syncMode: "strict",
      transitionDuration: 0,
    },
    pattern: {
      type: "custom",
      phases: [
        { name: "Dread", nameFr: "Angoisse", startPercent: 0, endPercent: 85, preferredNotes: ["longa", "whole"], intensityMultiplier: 0.3, transitionType: "fade" },
        { name: "Strike", nameFr: "Frappe", startPercent: 85, endPercent: 95, preferredNotes: ["sixteenth"], intensityMultiplier: 5.0, transitionType: "cut" },
        { name: "Aftermath", nameFr: "Après-coup", startPercent: 95, endPercent: 100, preferredNotes: ["half"], intensityMultiplier: 0.5, transitionType: "fade" },
      ],
    },
    reference: {
      avgShotLength: 8.0,
      cutsPerMinute: 7.5,
      source: "Hereditary (2018)",
    },
    recommendedBpm: { min: 50, max: 90, ideal: 66 },
  },
  
  // ========================================================================
  // STRUCTURES MUSICALES - EDM
  // ========================================================================
  
  edm_drop: {
    id: "edm_drop",
    name: "EDM Drop",
    nameFr: "Drop EDM",
    description: "Build-up with accelerating cuts, massive explosion at the drop, breakdown after.",
    descriptionFr: "Build-up avec coupes accélérées, explosion massive au drop, breakdown après.",
    icon: "🎧",
    category: "musical",
    config: {
      preferredCuts: ["quarter", "eighth", "sixteenth"],
      minCutDuration: 0.25,
      maxCutDuration: 4.0,
      preferStrongBeats: true,
      syncMode: "strict",
      transitionDuration: 0,
    },
    pattern: {
      type: "custom",
      phases: [
        { name: "Intro", nameFr: "Intro", startPercent: 0, endPercent: 12.5, preferredNotes: ["half", "quarter"], intensityMultiplier: 0.5, transitionType: "fade" },
        { name: "Build-up", nameFr: "Build-up", startPercent: 12.5, endPercent: 25, preferredNotes: ["eighth", "sixteenth"], intensityMultiplier: 2.0, transitionType: "cut" },
        { name: "DROP", nameFr: "DROP", startPercent: 25, endPercent: 50, preferredNotes: ["sixteenth", "thirtysecond"], intensityMultiplier: 3.0, transitionType: "whip" },
        { name: "Breakdown", nameFr: "Breakdown", startPercent: 50, endPercent: 62.5, preferredNotes: ["half", "whole"], intensityMultiplier: 0.4, transitionType: "crossfade" },
        { name: "Build-up 2", nameFr: "Build-up 2", startPercent: 62.5, endPercent: 75, preferredNotes: ["eighth", "sixteenth"], intensityMultiplier: 2.5, transitionType: "cut" },
        { name: "DROP 2", nameFr: "DROP 2", startPercent: 75, endPercent: 100, preferredNotes: ["sixteenth", "thirtysecond"], intensityMultiplier: 3.5, transitionType: "whip" },
      ],
    },
    reference: {
      avgShotLength: 1.5,
      cutsPerMinute: 40,
      source: "Standard EDM structure (128 BPM)",
    },
    recommendedBpm: { min: 120, max: 150, ideal: 128 },
  },
  
  classical_crescendo: {
    id: "classical_crescendo",
    name: "Classical Crescendo",
    nameFr: "Crescendo Classique",
    description: "Gradual acceleration from largo to presto. Orchestral intensity build.",
    descriptionFr: "Accélération graduelle de largo à presto. Construction d'intensité orchestrale.",
    icon: "🎻",
    category: "musical",
    config: {
      preferredCuts: ["whole", "half", "quarter", "eighth"],
      minCutDuration: 1.0,
      maxCutDuration: 12.0,
      preferStrongBeats: true,
      syncMode: "strict",
      transitionDuration: 0.2,
    },
    pattern: {
      type: "accelerating",
      phases: [
        { name: "Largo", nameFr: "Largo", startPercent: 0, endPercent: 25, preferredNotes: ["whole", "dotted_half"], intensityMultiplier: 0.3, transitionType: "crossfade" },
        { name: "Andante", nameFr: "Andante", startPercent: 25, endPercent: 50, preferredNotes: ["half", "quarter"], intensityMultiplier: 0.6, transitionType: "crossfade" },
        { name: "Allegro", nameFr: "Allegro", startPercent: 50, endPercent: 75, preferredNotes: ["quarter", "eighth"], intensityMultiplier: 1.2, transitionType: "cut" },
        { name: "Presto", nameFr: "Presto", startPercent: 75, endPercent: 100, preferredNotes: ["eighth", "sixteenth"], intensityMultiplier: 2.0, transitionType: "cut" },
      ],
    },
    reference: {
      avgShotLength: 4.0,
      cutsPerMinute: 15,
      source: "Ravel's Boléro structure",
    },
    recommendedBpm: { min: 60, max: 180, ideal: 100 },
  },
  
  // ========================================================================
  // CADENCES MUSICALES
  // ========================================================================
  
  cadence_authentic: {
    id: "cadence_authentic",
    name: "Authentic Cadence (V→I)",
    nameFr: "Cadence Authentique (V→I)",
    description: "Strong resolution: dominant to tonic. Maximum closure feeling.",
    descriptionFr: "Résolution forte : dominante vers tonique. Sentiment de clôture maximum.",
    icon: "✓",
    category: "musical",
    config: {
      preferredCuts: ["quarter", "half"],
      minCutDuration: 2.0,
      maxCutDuration: 6.0,
      preferStrongBeats: true,
      syncMode: "strict",
      transitionDuration: 0,
    },
    pattern: {
      type: "custom",
      phases: [
        { name: "Dominant (V)", nameFr: "Dominante (V)", startPercent: 0, endPercent: 70, preferredNotes: ["quarter", "eighth"], intensityMultiplier: 1.2, transitionType: "cut" },
        { name: "Tonic (I)", nameFr: "Tonique (I)", startPercent: 70, endPercent: 100, preferredNotes: ["half", "whole"], intensityMultiplier: 0.6, transitionType: "crossfade" },
      ],
    },
    reference: {
      avgShotLength: 3.0,
      cutsPerMinute: 20,
      source: "Music theory - Perfect cadence",
    },
    recommendedBpm: { min: 80, max: 140, ideal: 100 },
  },
  
  cadence_plagal: {
    id: "cadence_plagal",
    name: "Plagal Cadence (IV→I)",
    nameFr: "Cadence Plagale (IV→I)",
    description: "Soft resolution: subdominant to tonic. 'Amen' feeling, gentle close.",
    descriptionFr: "Résolution douce : sous-dominante vers tonique. Sentiment 'Amen', fin douce.",
    icon: "🙏",
    category: "musical",
    config: {
      preferredCuts: ["half", "dotted_half", "whole"],
      minCutDuration: 3.0,
      maxCutDuration: 10.0,
      preferStrongBeats: false,
      syncMode: "loose",
      transitionDuration: 0.5,
    },
    pattern: {
      type: "decelerating",
    },
    reference: {
      avgShotLength: 5.0,
      cutsPerMinute: 12,
      source: "Music theory - Amen cadence",
    },
    recommendedBpm: { min: 50, max: 100, ideal: 72 },
  },
  
  cadence_deceptive: {
    id: "cadence_deceptive",
    name: "Deceptive Cadence (V→VI)",
    nameFr: "Cadence Rompue (V→VI)",
    description: "Unexpected resolution: surprise twist, subverted expectations.",
    descriptionFr: "Résolution inattendue : retournement surprise, attentes subverties.",
    icon: "❓",
    category: "musical",
    config: {
      preferredCuts: ["quarter", "triplet_quarter", "eighth"],
      minCutDuration: 1.0,
      maxCutDuration: 4.0,
      preferStrongBeats: false,
      syncMode: "loose",
      transitionDuration: 0,
    },
    pattern: {
      type: "custom",
      phases: [
        { name: "Expectation", nameFr: "Attente", startPercent: 0, endPercent: 60, preferredNotes: ["quarter", "half"], intensityMultiplier: 1.0, transitionType: "cut" },
        { name: "Deception", nameFr: "Rupture", startPercent: 60, endPercent: 70, preferredNotes: ["triplet_eighth"], intensityMultiplier: 2.0, transitionType: "whip" },
        { name: "New Direction", nameFr: "Nouvelle Direction", startPercent: 70, endPercent: 100, preferredNotes: ["quarter", "eighth"], intensityMultiplier: 1.3, transitionType: "cut" },
      ],
    },
    reference: {
      avgShotLength: 2.5,
      cutsPerMinute: 24,
      source: "Music theory - Interrupted cadence",
    },
    recommendedBpm: { min: 90, max: 140, ideal: 110 },
  },
  
  // ========================================================================
  // STRUCTURES NARRATIVES
  // ========================================================================
  
  call_response: {
    id: "call_response",
    name: "Call & Response",
    nameFr: "Question-Réponse",
    description: "Alternating pattern: action/reaction, shot/reverse-shot rhythm.",
    descriptionFr: "Pattern alternant : action/réaction, rythme champ/contre-champ.",
    icon: "🔄",
    category: "structure",
    config: {
      preferredCuts: ["half", "quarter"],
      minCutDuration: 1.5,
      maxCutDuration: 4.0,
      preferStrongBeats: true,
      syncMode: "strict",
      transitionDuration: 0,
    },
    pattern: {
      type: "wave",
      phases: [
        { name: "Call", nameFr: "Question", startPercent: 0, endPercent: 50, preferredNotes: ["half"], intensityMultiplier: 1.0, transitionType: "cut" },
        { name: "Response", nameFr: "Réponse", startPercent: 50, endPercent: 100, preferredNotes: ["quarter"], intensityMultiplier: 1.2, transitionType: "cut" },
      ],
    },
    reference: {
      avgShotLength: 2.5,
      cutsPerMinute: 24,
      source: "Classical dialogue structure",
    },
    recommendedBpm: { min: 80, max: 120, ideal: 96 },
  },
  
  tension_release: {
    id: "tension_release",
    name: "Tension & Release",
    nameFr: "Tension-Détente",
    description: "Build tension with accelerating cuts, release with long holds.",
    descriptionFr: "Construire la tension avec coupes accélérées, relâcher avec plans longs.",
    icon: "📈📉",
    category: "structure",
    config: {
      preferredCuts: ["eighth", "quarter", "whole"],
      minCutDuration: 0.5,
      maxCutDuration: 10.0,
      preferStrongBeats: true,
      syncMode: "strict",
      transitionDuration: 0,
    },
    pattern: {
      type: "custom",
      phases: [
        { name: "Build", nameFr: "Construction", startPercent: 0, endPercent: 40, preferredNotes: ["quarter", "eighth"], intensityMultiplier: 1.5, transitionType: "cut" },
        { name: "Peak", nameFr: "Pic", startPercent: 40, endPercent: 50, preferredNotes: ["sixteenth", "eighth"], intensityMultiplier: 2.5, transitionType: "cut" },
        { name: "Release", nameFr: "Relâchement", startPercent: 50, endPercent: 70, preferredNotes: ["half", "whole"], intensityMultiplier: 0.4, transitionType: "crossfade" },
        { name: "Rest", nameFr: "Repos", startPercent: 70, endPercent: 100, preferredNotes: ["whole"], intensityMultiplier: 0.3, transitionType: "fade" },
      ],
    },
    reference: {
      avgShotLength: 3.5,
      cutsPerMinute: 17,
      source: "Universal dramatic structure",
    },
    recommendedBpm: { min: 80, max: 140, ideal: 100 },
  },
  
  // ========================================================================
  // FORMATS SOCIAUX
  // ========================================================================
  
  tiktok_viral: {
    id: "tiktok_viral",
    name: "TikTok Viral",
    nameFr: "TikTok Viral",
    description: "Ultra-fast cuts for maximum retention. Hook in first 0.5s.",
    descriptionFr: "Coupes ultra-rapides pour rétention maximale. Accroche en 0.5s.",
    icon: "📱",
    category: "social",
    config: {
      preferredCuts: ["sixteenth", "thirtysecond", "eighth"],
      minCutDuration: 0.3,
      maxCutDuration: 1.5,
      preferStrongBeats: true,
      syncMode: "strict",
      transitionDuration: 0,
    },
    pattern: {
      type: "constant",
    },
    reference: {
      avgShotLength: 0.8,
      cutsPerMinute: 75,
      source: "TikTok viral content analysis",
    },
    recommendedBpm: { min: 120, max: 180, ideal: 150 },
  },
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

/**
 * Obtenir une symphonie de montage par ID
 */
export function getMontageSymhony(id: MontageSymhonyId): MontageSymhony {
  return MONTAGE_SYMPHONIES[id];
}

/**
 * Obtenir toutes les symphonies d'une catégorie
 */
export function getMontageSymhoniesByCategory(category: MontageSymhony["category"]): MontageSymhony[] {
  return Object.values(MONTAGE_SYMPHONIES).filter(s => s.category === category);
}

/**
 * Appliquer une symphonie de montage à la génération
 */
export function applySymphonyToGrid(
  symphony: MontageSymhony,
  grid: MusicalGrid,
  duration: number
): CutPoint[] {
  const cutPoints: CutPoint[] = [];
  
  if (symphony.pattern.type === "custom" && symphony.pattern.phases) {
    // Appliquer les phases personnalisées
    for (const phase of symphony.pattern.phases) {
      const phaseStart = (phase.startPercent / 100) * duration;
      const phaseEnd = (phase.endPercent / 100) * duration;
      
      // Modifier la config pour cette phase
      const phaseConfig: AutoEditConfig = {
        ...symphony.config,
        preferredCuts: phase.preferredNotes,
        minCutDuration: symphony.config.minCutDuration / phase.intensityMultiplier,
        maxCutDuration: symphony.config.maxCutDuration / phase.intensityMultiplier,
      };
      
      // Générer les cuts pour cette phase
      const phaseCuts = generateCutPoints(grid, phaseConfig)
        .filter(c => c.time >= phaseStart && c.time < phaseEnd);
      
      cutPoints.push(...phaseCuts);
    }
  } else if (symphony.pattern.type === "accelerating") {
    // Pattern accélérant : durées de plus en plus courtes
    let lastTime = 0;
    let currentDuration = symphony.config.maxCutDuration;
    const decayFactor = 0.9;
    
    while (lastTime < duration) {
      const nearestBeat = findNearestBeat(lastTime, grid, symphony.config.preferredCuts[0]);
      cutPoints.push({
        time: nearestBeat.time,
        type: symphony.config.preferredCuts[0],
        measureIndex: Math.floor(nearestBeat.time / grid.measureDuration),
        beatIndex: Math.floor((nearestBeat.time % grid.measureDuration) / grid.beatDuration),
        strength: 1.0,
      });
      
      lastTime = nearestBeat.time + currentDuration;
      currentDuration = Math.max(symphony.config.minCutDuration, currentDuration * decayFactor);
    }
  } else if (symphony.pattern.type === "decelerating") {
    // Pattern décélérant : durées de plus en plus longues
    let lastTime = 0;
    let currentDuration = symphony.config.minCutDuration;
    const growthFactor = 1.1;
    
    while (lastTime < duration) {
      const nearestBeat = findNearestBeat(lastTime, grid, symphony.config.preferredCuts[0]);
      cutPoints.push({
        time: nearestBeat.time,
        type: symphony.config.preferredCuts[0],
        measureIndex: Math.floor(nearestBeat.time / grid.measureDuration),
        beatIndex: Math.floor((nearestBeat.time % grid.measureDuration) / grid.beatDuration),
        strength: 1.0,
      });
      
      lastTime = nearestBeat.time + currentDuration;
      currentDuration = Math.min(symphony.config.maxCutDuration, currentDuration * growthFactor);
    }
  } else {
    // Pattern constant ou autre
    return generateCutPoints(grid, symphony.config);
  }
  
  return cutPoints.sort((a, b) => a.time - b.time);
}

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
