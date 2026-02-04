/**
 * MOOSTIK Narrative Video Prompt Generator
 * SOTA System - January 2026
 * 
 * Génère des prompts vidéo CONTEXTUELS et NARRATIFS
 * basés sur l'intention dramatique, pas juste la description technique.
 * 
 * Le but : faire RESSENTIR quelque chose au spectateur.
 */

import { VideoProvider } from "./types";
import { createLogger } from "../logger";

const logger = createLogger("narrative-prompt-generator");

// ============================================
// TYPES - INTENTION DRAMATIQUE
// ============================================

/**
 * L'intention dramatique définit CE QU'ON VEUT FAIRE RESSENTIR
 * au spectateur, pas juste ce qui se passe visuellement.
 */
export type DramaticIntention =
  | "TERROR_TITAN"        // Terreur face à l'inéluctable (doigts titans SNK)
  | "APOCALYPSE_BIRTH"    // Naissance de l'apocalypse (BYSS qui explose)
  | "GENOCIDE_WITNESS"    // Témoin impuissant du massacre
  | "DESPERATE_FLIGHT"    // Fuite désespérée, survie
  | "MATERNAL_SACRIFICE"  // Sacrifice d'une mère pour son enfant
  | "CHILD_TRAUMA"        // Trauma d'un enfant qui voit l'horreur
  | "COMMUNITY_DEATH"     // Mort d'une communauté/civilisation
  | "REBIRTH_HOPE"        // Renaissance, espoir fragile
  | "VENGEANCE_BIRTH"     // Naissance de la vengeance
  | "TRAINING_MONTAGE"    // Montée en puissance, détermination
  | "NOIR_ATMOSPHERE"     // Ambiance bar, conspiration
  | "REVELATION_SHOCK"    // Révélation choquante
  | "MEMORY_HAUNTING"     // Souvenir qui hante
  | "SCALE_REVELATION"    // Révélation d'échelle (titans vs moustiques)
  | "IMPACT_DESTRUCTION"  // Impact et destruction physique
  | "ESTABLISHING_WORLD"; // Établir le monde, contexte

/**
 * Contexte narratif complet pour un shot
 */
export interface NarrativeContext {
  // Identité du shot
  shotId: string;
  shotName: string;
  shotDescription: string;
  
  // Position narrative
  partNumber: number;
  partTitle: string;
  partAtmosphere: string;
  sequenceNumber: number;
  sequenceTitle: string;
  sequenceDescription: string;
  shotPositionInSequence: number;
  totalShotsInSequence: number;
  
  // Personnages et lieux
  characterIds: string[];
  locationIds: string[];
  
  // Contexte avant/après
  previousShotDescription?: string;
  nextShotDescription?: string;
  
  // Intention et émotion
  dramaticIntention: DramaticIntention;
  targetEmotion: string;        // Ce que le spectateur doit ressentir
  visualGoal: string;           // L'objectif visuel spécifique
  
  // Technique
  cameraAngle: string;
  suggestedCameraMotion?: string;
}

/**
 * Prompt vidéo narratif généré
 */
export interface NarrativeVideoPrompt {
  // Le prompt optimisé
  prompt: string;
  negativePrompt: string;
  
  // Métadonnées
  dramaticIntention: DramaticIntention;
  emotionalCore: string;
  motionDescription: string;
  cameraInstruction: string;
  
  // Qualité
  narrativeScore: number;  // 0-100
  rationale: string;
  
  // Technique
  recommendedDuration: 5 | 10;
  recommendedProvider: VideoProvider;
}

// ============================================
// BIBLIOTHÈQUE D'INTENTIONS DRAMATIQUES
// ============================================

interface IntentionTemplate {
  emotionalCore: string;
  motionLanguage: string[];
  cameraApproach: string;
  atmosphereKeywords: string[];
  pacing: "slow" | "medium" | "fast";
  duration: 5 | 10;
  negativeAdditions: string[];
}

const INTENTION_TEMPLATES: Record<DramaticIntention, IntentionTemplate> = {
  // ============================================
  // TERROR_TITAN - Doigts titans, impuissance face au colossal
  // ============================================
  TERROR_TITAN: {
    emotionalCore: "Absolute terror. The feeling of being an ant under a descending boot. SNK energy - inevitable doom approaching.",
    motionLanguage: [
      "COLOSSAL descent, impossibly slow yet unstoppable",
      "Ground TREMBLES with seismic force",
      "Structures CRUMBLE like paper under titan weight",
      "Debris EXPLODES outward from impact point",
      "Dust clouds RISE in slow-motion horror",
      "Each millimeter of descent is a death sentence",
    ],
    cameraApproach: "Low angle looking UP at descending doom, camera pushes BACK in terror as impact approaches. Slight shake from tremors.",
    atmosphereKeywords: ["titan-scale", "colossal", "seismic", "inevitable", "crushing", "apocalyptic weight"],
    pacing: "slow",
    duration: 10,
    negativeAdditions: ["fast motion", "cheerful", "small scale", "gentle", "soft impact"],
  },

  // ============================================
  // APOCALYPSE_BIRTH - BYSS qui explose, naissance de l'horreur
  // ============================================
  APOCALYPSE_BIRTH: {
    emotionalCore: "Witnessing the birth of apocalypse. A weapon of mass destruction activating. The moment everything changes forever.",
    motionLanguage: [
      "Toxic cloud ERUPTS with violent force",
      "Flames LICK outward in hungry tendrils",
      "Pressure wave RIPPLES through air",
      "Chemical mist SPREADS like a plague",
      "Sparks and embers DANCE in death spiral",
      "The can ROARS to life like a dragon awakening",
    ],
    cameraApproach: "Push in toward the source of destruction, then pull back as the horror expands. Dynamic, following the spread of death.",
    atmosphereKeywords: ["toxic", "chemical warfare", "eruption", "birth of death", "weapon activation"],
    pacing: "medium",
    duration: 10,
    negativeAdditions: ["peaceful", "natural", "organic", "gentle mist", "calm"],
  },

  // ============================================
  // GENOCIDE_WITNESS - Témoin impuissant du massacre
  // ============================================
  GENOCIDE_WITNESS: {
    emotionalCore: "Silent witness to unspeakable horror. Eyes that see too much. The weight of surviving while others die.",
    motionLanguage: [
      "Eyes WIDEN in frozen horror",
      "Tears FORM but cannot fall",
      "Body TREMBLES with suppressed scream",
      "Breath CATCHES in throat",
      "Hands CLUTCH in helpless grip",
      "Gaze LOCKED on the unthinkable",
    ],
    cameraApproach: "Intimate close-up, static or very slow push in. Let the face tell the story. Hold on the moment of realization.",
    atmosphereKeywords: ["witness", "frozen horror", "silent scream", "trauma", "helpless"],
    pacing: "slow",
    duration: 10,
    negativeAdditions: ["action", "movement", "escape", "fighting back", "hope"],
  },

  // ============================================
  // DESPERATE_FLIGHT - Fuite pour survivre
  // ============================================
  DESPERATE_FLIGHT: {
    emotionalCore: "Pure survival instinct. Running from death itself. Every second counts. Breathless terror.",
    motionLanguage: [
      "Wings BEAT frantically against the air",
      "Legs PUMP with desperate energy",
      "Body WEAVES through obstacles",
      "Chest HEAVES with exhausted breath",
      "Eyes DART searching for escape",
      "Muscles STRAIN at breaking point",
    ],
    cameraApproach: "Tracking shot following the escape, handheld energy. Occasional look back at pursuing danger. Claustrophobic framing.",
    atmosphereKeywords: ["pursuit", "survival", "escape", "breathless", "hunted"],
    pacing: "fast",
    duration: 5,
    negativeAdditions: ["calm", "walking", "relaxed", "safe", "leisurely"],
  },

  // ============================================
  // MATERNAL_SACRIFICE - Une mère qui donne sa vie
  // ============================================
  MATERNAL_SACRIFICE: {
    emotionalCore: "A mother's ultimate love. Giving everything so her child can live. The most profound sacrifice.",
    motionLanguage: [
      "Arms WRAP protectively around child",
      "Body SHIELDS against incoming death",
      "Eyes MEET in final goodbye",
      "Lips MOVE with last words of love",
      "Wings FOLD as final embrace",
      "Life FADES with peaceful acceptance",
    ],
    cameraApproach: "Two-shot capturing both mother and child. Slow, reverent movement. Hold on the final embrace. Soft focus on threat in background.",
    atmosphereKeywords: ["sacrifice", "maternal love", "protection", "final embrace", "letting go"],
    pacing: "slow",
    duration: 10,
    negativeAdditions: ["violence focus", "gore", "abandonment", "selfishness", "escape"],
  },

  // ============================================
  // CHILD_TRAUMA - Un enfant face à l'horreur
  // ============================================
  CHILD_TRAUMA: {
    emotionalCore: "Innocence shattered. A child's mind breaking under impossible horror. The birth of a survivor.",
    motionLanguage: [
      "Small body CURLS into protective ball",
      "Eyes SQUEEZE shut against reality",
      "Tiny hands COVER ears",
      "Tears STREAM down innocent face",
      "Trembling INTENSIFIES with each horror",
      "Childhood DIES in this moment",
    ],
    cameraApproach: "Child's eye level. The world towering above, terrifying. Close-up on face, then pull back to show isolation.",
    atmosphereKeywords: ["innocence lost", "childhood trauma", "overwhelming", "alone", "small against the world"],
    pacing: "slow",
    duration: 10,
    negativeAdditions: ["adult perspective", "action hero", "brave", "fighting", "unaffected"],
  },

  // ============================================
  // COMMUNITY_DEATH - Mort d'une civilisation
  // ============================================
  COMMUNITY_DEATH: {
    emotionalCore: "An entire world dying. Not just people, but a culture, a history, a future. Collective extinction.",
    motionLanguage: [
      "Structures COLLAPSE in waves",
      "Bodies FALL like leaves in autumn",
      "Fire SPREADS from building to building",
      "Screams ECHO then go silent",
      "Life DRAINS from the streets",
      "A civilization CRUMBLES to dust",
    ],
    cameraApproach: "Wide establishing shot, then crane down into the chaos. Show the scale of loss. End on a single detail of destroyed life.",
    atmosphereKeywords: ["extinction", "genocide", "cultural death", "mass destruction", "end of world"],
    pacing: "medium",
    duration: 10,
    negativeAdditions: ["single casualty", "small scale", "recoverable", "temporary", "minor damage"],
  },

  // ============================================
  // REBIRTH_HOPE - Renaissance après l'horreur
  // ============================================
  REBIRTH_HOPE: {
    emotionalCore: "Life refusing to die. Hope emerging from ashes. The first breath after almost drowning.",
    motionLanguage: [
      "Light BREAKS through darkness",
      "First breath FILLS lungs with new air",
      "Eyes OPEN to new possibility",
      "Body UNCURLS from protective position",
      "Small steps TAKEN toward tomorrow",
      "Hands REACH toward the light",
    ],
    cameraApproach: "Rising movement, from dark to light. Soft, warm lighting gradually increasing. Gentle push in toward hope.",
    atmosphereKeywords: ["rebirth", "dawn", "new beginning", "survival", "fragile hope"],
    pacing: "slow",
    duration: 10,
    negativeAdditions: ["despair", "giving up", "darkness", "death", "ending"],
  },

  // ============================================
  // VENGEANCE_BIRTH - Naissance de la vengeance
  // ============================================
  VENGEANCE_BIRTH: {
    emotionalCore: "Grief transforming into rage. The decision to fight back. The birth of a warrior from ashes of loss.",
    motionLanguage: [
      "Tears DRY as resolve hardens",
      "Fists CLENCH with new purpose",
      "Eyes BURN with cold fire",
      "Jaw SETS in determination",
      "Body RISES from mourning position",
      "A warrior is BORN from grief",
    ],
    cameraApproach: "Low angle, empowering. Slow push in as transformation happens. Light shifts from cold to warm determined glow.",
    atmosphereKeywords: ["vengeance", "transformation", "resolve", "warrior birth", "cold determination"],
    pacing: "slow",
    duration: 10,
    negativeAdditions: ["forgiveness", "acceptance", "peace", "moving on", "weakness"],
  },

  // ============================================
  // TRAINING_MONTAGE - Montée en puissance
  // ============================================
  TRAINING_MONTAGE: {
    emotionalCore: "Building strength through discipline. Pain becoming power. The body learning to be a weapon.",
    motionLanguage: [
      "Muscles STRAIN against resistance",
      "Sweat DRIPS with honest effort",
      "Strikes SHARPEN with repetition",
      "Breath STEADIES into warrior rhythm",
      "Form PERFECTS through practice",
      "Power GROWS with each repetition",
    ],
    cameraApproach: "Dynamic tracking, following the motion. Multiple angles showing improvement. Build energy through editing rhythm.",
    atmosphereKeywords: ["discipline", "training", "strength building", "warrior path", "determination"],
    pacing: "medium",
    duration: 5,
    negativeAdditions: ["lazy", "casual", "weak", "unfocused", "giving up"],
  },

  // ============================================
  // NOIR_ATMOSPHERE - Bar, conspiration
  // ============================================
  NOIR_ATMOSPHERE: {
    emotionalCore: "Secrets whispered in shadows. Plans forming over drinks. The calm before the storm.",
    motionLanguage: [
      "Smoke CURLS through amber light",
      "Glasses CLINK in silent toast",
      "Eyes MEET across the bar",
      "Lips MOVE with whispered secrets",
      "Shadows DANCE on weathered faces",
      "Tension BUILDS in the silence",
    ],
    cameraApproach: "Slow pan across faces. Push in during key moments. Chiaroscuro lighting, noir style.",
    atmosphereKeywords: ["noir", "conspiracy", "secrets", "bar atmosphere", "tension"],
    pacing: "slow",
    duration: 10,
    negativeAdditions: ["bright", "cheerful", "loud", "action", "outdoor"],
  },

  // ============================================
  // REVELATION_SHOCK - Révélation choquante
  // ============================================
  REVELATION_SHOCK: {
    emotionalCore: "The moment truth crashes in. Everything understood in an instant. The world shifts on its axis.",
    motionLanguage: [
      "Eyes WIDEN with realization",
      "Body FREEZES mid-motion",
      "Breath STOPS in chest",
      "Color DRAINS from face",
      "Mind RACES behind still face",
      "World TILTS with new understanding",
    ],
    cameraApproach: "Crash zoom or slow push to extreme close-up. Hold on the face. Time seems to stop.",
    atmosphereKeywords: ["revelation", "shock", "truth", "realization", "everything changes"],
    pacing: "slow",
    duration: 5,
    negativeAdditions: ["confusion", "denial", "ignorance", "casual reaction"],
  },

  // ============================================
  // MEMORY_HAUNTING - Souvenir qui hante
  // ============================================
  MEMORY_HAUNTING: {
    emotionalCore: "The past that won't stay buried. Memories that cut like fresh wounds. Living with ghosts.",
    motionLanguage: [
      "Images BLUR at the edges",
      "Colors SHIFT to memory palette",
      "Faces SWIM in and out of focus",
      "Time FRAGMENTS and repeats",
      "Sound ECHOES from far away",
      "Past and present MERGE",
    ],
    cameraApproach: "Dreamy, unstable movement. Soft focus, vignette. Dissolves between memory and present.",
    atmosphereKeywords: ["haunting", "memory", "trauma", "flashback", "ghost of past"],
    pacing: "slow",
    duration: 10,
    negativeAdditions: ["sharp", "present", "clear", "happy memory", "forgotten"],
  },

  // ============================================
  // SCALE_REVELATION - Révélation d'échelle titan vs moustique
  // ============================================
  SCALE_REVELATION: {
    emotionalCore: "The terrifying truth of scale. Realizing how small you are. The universe's cruel joke on size.",
    motionLanguage: [
      "Camera PULLS BACK to reveal true scale",
      "Tiny figures DWARFED by colossal elements",
      "Human elements LOOM like mountains",
      "Perspective SHIFTS to show reality",
      "The familiar becomes MONSTROUS at scale",
      "Insignificance CRUSHES the spirit",
    ],
    cameraApproach: "Start close, pull back dramatically. Dolly zoom for vertigo effect. End wide to show scale disparity.",
    atmosphereKeywords: ["scale", "insignificance", "titan perspective", "overwhelming", "microscopic"],
    pacing: "slow",
    duration: 10,
    negativeAdditions: ["equal size", "normal scale", "empowering", "matching"],
  },

  // ============================================
  // IMPACT_DESTRUCTION - Impact et destruction physique
  // ============================================
  IMPACT_DESTRUCTION: {
    emotionalCore: "Physics made visible. The beauty of destruction. Force meeting matter. The moment of impact.",
    motionLanguage: [
      "Impact RADIATES shockwaves",
      "Material SHATTERS into fragments",
      "Debris ARCS through air",
      "Dust BILLOWS from destruction",
      "Structure DEFORMS under force",
      "Energy TRANSFERS visibly",
    ],
    cameraApproach: "High-speed capture feel. Multiple angles on impact. Slow motion to appreciate destruction physics.",
    atmosphereKeywords: ["impact", "destruction", "physics", "shockwave", "debris"],
    pacing: "medium",
    duration: 5,
    negativeAdditions: ["gentle", "soft", "intact", "undamaged", "peaceful"],
  },

  // ============================================
  // ESTABLISHING_WORLD - Établir le monde
  // ============================================
  ESTABLISHING_WORLD: {
    emotionalCore: "Inviting the viewer into a world. Setting the stage. Creating context for the story to come.",
    motionLanguage: [
      "Camera SWEEPS across landscape",
      "Light PLAYS on environment",
      "Life MOVES in the distance",
      "Atmosphere BREATHES with the world",
      "Details EMERGE from the whole",
      "A world REVEALS itself",
    ],
    cameraApproach: "Wide crane or drone-style movement. Slow, majestic. Let the world speak for itself.",
    atmosphereKeywords: ["establishing", "world-building", "scope", "context", "setting"],
    pacing: "slow",
    duration: 10,
    negativeAdditions: ["close-up", "action", "character focus", "tight framing"],
  },
};

// ============================================
// MAPPINGS SHOT → INTENTION
// ============================================

/**
 * Mapping des patterns de shots vers leurs intentions dramatiques
 */
const SHOT_INTENTION_PATTERNS: Array<{
  patterns: RegExp[];
  intention: DramaticIntention;
  targetEmotion: string;
}> = [
  // Doigts titans / échelle humaine
  {
    patterns: [/doigt.*titan/i, /titan.*finger/i, /fingers.*colossal/i, /human.*scale/i, /titan.*scale/i],
    intention: "TERROR_TITAN",
    targetEmotion: "Terreur absolue face à l'inéluctable. Sentiment d'être un insecte sous une botte.",
  },
  // BYSS / aérosol / explosion
  {
    patterns: [/byss/i, /aerosol/i, /toxic.*cloud/i, /gaz.*toxique/i, /bombe/i],
    intention: "APOCALYPSE_BIRTH",
    targetEmotion: "Assister à la naissance de l'horreur. Le moment où tout bascule.",
  },
  // Impact / écrasement
  {
    patterns: [/impact/i, /crush/i, /écras/i, /destroy/i, /destruction/i],
    intention: "IMPACT_DESTRUCTION",
    targetEmotion: "La violence physique de la destruction. L'impact viscéral.",
  },
  // Témoin / regard / witness
  {
    patterns: [/witness/i, /témoin/i, /regard/i, /watching/i, /voir.*horreur/i],
    intention: "GENOCIDE_WITNESS",
    targetEmotion: "Impuissance du témoin. Le poids de voir sans pouvoir agir.",
  },
  // Fuite / escape
  {
    patterns: [/fuite/i, /escape/i, /run/i, /fuir/i, /surviv/i],
    intention: "DESPERATE_FLIGHT",
    targetEmotion: "Survie pure. Chaque seconde compte.",
  },
  // Sacrifice maternel
  {
    patterns: [/mama.*sacrifice/i, /mother.*protect/i, /sacrifice.*mère/i, /protect.*child/i],
    intention: "MATERNAL_SACRIFICE",
    targetEmotion: "L'amour maternel ultime. Donner sa vie pour son enfant.",
  },
  // Enfant traumatisé
  {
    patterns: [/baby.*trauma/i, /child.*horror/i, /enfant.*peur/i, /bébé.*terreur/i],
    intention: "CHILD_TRAUMA",
    targetEmotion: "Innocence brisée. Un enfant qui voit trop.",
  },
  // Village / communauté qui meurt
  {
    patterns: [/village.*burn/i, /community.*die/i, /genocide/i, /massacre/i, /cooltik/i],
    intention: "COMMUNITY_DEATH",
    targetEmotion: "Une civilisation entière qui s'éteint.",
  },
  // Renaissance / espoir
  {
    patterns: [/rebirth/i, /renaissance/i, /hope/i, /espoir/i, /new.*begin/i],
    intention: "REBIRTH_HOPE",
    targetEmotion: "L'espoir fragile qui émerge des cendres.",
  },
  // Vengeance
  {
    patterns: [/vengeance/i, /revenge/i, /warrior.*born/i, /rage/i, /bloodwing/i],
    intention: "VENGEANCE_BIRTH",
    targetEmotion: "Le deuil qui se transforme en rage froide.",
  },
  // Entraînement
  {
    patterns: [/training/i, /entraîn/i, /practice/i, /drill/i, /combat.*learn/i],
    intention: "TRAINING_MONTAGE",
    targetEmotion: "La douleur devient puissance.",
  },
  // Bar Ti Sang
  {
    patterns: [/bar.*ti.*sang/i, /bar.*scene/i, /conspir/i, /whisper/i],
    intention: "NOIR_ATMOSPHERE",
    targetEmotion: "Secrets dans l'ombre. Tension palpable.",
  },
  // Flashback / mémoire
  {
    patterns: [/flashback/i, /memory/i, /souvenir/i, /remember/i],
    intention: "MEMORY_HAUNTING",
    targetEmotion: "Le passé qui refuse de mourir.",
  },
  // Échelle / scale reveal
  {
    patterns: [/scale.*reveal/i, /perspective/i, /pov.*moostik/i, /microscopic/i],
    intention: "SCALE_REVELATION",
    targetEmotion: "La vérité terrifiante de l'échelle.",
  },
  // Establishing
  {
    patterns: [/establish/i, /wide.*shot/i, /vue.*large/i, /panoram/i],
    intention: "ESTABLISHING_WORLD",
    targetEmotion: "Découvrir un monde, créer le contexte.",
  },
];

// ============================================
// NARRATIVE PROMPT GENERATOR CLASS
// ============================================

export class NarrativePromptGenerator {
  /**
   * Détecte l'intention dramatique d'un shot basé sur son contexte
   */
  detectIntention(
    shotDescription: string,
    shotName: string,
    sequenceDescription: string,
    visualGoal?: string
  ): { intention: DramaticIntention; targetEmotion: string; confidence: number } {
    const combinedText = `${shotName} ${shotDescription} ${sequenceDescription} ${visualGoal || ""}`.toLowerCase();
    
    // Chercher dans les patterns
    for (const { patterns, intention, targetEmotion } of SHOT_INTENTION_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(combinedText)) {
          return { intention, targetEmotion, confidence: 0.9 };
        }
      }
    }
    
    // Fallback basé sur des mots-clés généraux
    if (/fire|flame|burn|feu/i.test(combinedText)) {
      return { intention: "APOCALYPSE_BIRTH", targetEmotion: "Destruction et chaos.", confidence: 0.6 };
    }
    if (/death|mort|die/i.test(combinedText)) {
      return { intention: "COMMUNITY_DEATH", targetEmotion: "Perte et deuil.", confidence: 0.5 };
    }
    if (/fight|combat|battle/i.test(combinedText)) {
      return { intention: "TRAINING_MONTAGE", targetEmotion: "Force et détermination.", confidence: 0.5 };
    }
    
    // Default
    return { 
      intention: "ESTABLISHING_WORLD", 
      targetEmotion: "Découverte du monde Moostik.", 
      confidence: 0.3 
    };
  }

  /**
   * Génère un prompt vidéo narratif complet
   */
  generateNarrativePrompt(context: NarrativeContext): NarrativeVideoPrompt {
    const template = INTENTION_TEMPLATES[context.dramaticIntention];
    
    logger.info("Generating narrative prompt", {
      shotId: context.shotId,
      intention: context.dramaticIntention,
    });
    
    // Construire le prompt basé sur l'intention
    const prompt = this.buildPrompt(context, template);
    const negativePrompt = this.buildNegativePrompt(template);
    const motionDescription = this.buildMotionDescription(context, template);
    const cameraInstruction = this.buildCameraInstruction(context, template);
    
    // Score de qualité narrative
    const narrativeScore = this.scoreNarrativeQuality(prompt, context, template);
    
    // Rationale
    const rationale = this.buildRationale(context, template);
    
    return {
      prompt,
      negativePrompt,
      dramaticIntention: context.dramaticIntention,
      emotionalCore: template.emotionalCore,
      motionDescription,
      cameraInstruction,
      narrativeScore,
      rationale,
      recommendedDuration: template.duration,
      recommendedProvider: this.selectProvider(context.dramaticIntention),
    };
  }

  /**
   * Construit le prompt principal
   */
  private buildPrompt(context: NarrativeContext, template: IntentionTemplate): string {
    const parts: string[] = [];
    
    // 1. Style visuel MOOSTIK (court)
    parts.push("Pixar-dark 3D animated film, microscopic mosquito civilization");
    
    // 2. INTENTION DRAMATIQUE - Le cœur du prompt (NOUVEAU!)
    parts.push(template.emotionalCore);
    
    // 3. Description visuelle spécifique du shot
    parts.push(context.visualGoal || context.shotDescription);
    
    // 4. Motion narrative (pas générique!)
    const motionLine = this.selectBestMotion(context, template);
    parts.push(`Motion: ${motionLine}`);
    
    // 5. Camera narrative
    parts.push(`Camera: ${template.cameraApproach}`);
    
    // 6. Atmosphère
    const atmosphereKeywords = template.atmosphereKeywords.slice(0, 3).join(", ");
    parts.push(`Atmosphere: ${atmosphereKeywords}`);
    
    // 7. Feeling final (ce que le spectateur doit ressentir)
    parts.push(`FEELING: ${context.targetEmotion}`);
    
    const prompt = parts.join(". ");
    
    // Limite à 800 caractères pour Kling 2.6
    if (prompt.length > 800) {
      return prompt.slice(0, 797) + "...";
    }
    
    return prompt;
  }

  /**
   * Sélectionne le meilleur mouvement narratif pour le contexte
   */
  private selectBestMotion(context: NarrativeContext, template: IntentionTemplate): string {
    // Choisir les motions les plus pertinents pour ce shot spécifique
    const relevantMotions: string[] = [];
    
    // Analyser le contenu du shot pour choisir les bons motions
    const shotText = `${context.shotDescription} ${context.visualGoal || ""}`.toLowerCase();
    
    for (const motion of template.motionLanguage) {
      // Vérifier si le motion est pertinent pour ce shot
      const motionKeyword = motion.split(" ")[0].toLowerCase();
      if (shotText.includes(motionKeyword) || relevantMotions.length < 2) {
        relevantMotions.push(motion);
      }
      if (relevantMotions.length >= 3) break;
    }
    
    // Si on n'a pas trouvé de motions spécifiques, prendre les premiers
    if (relevantMotions.length === 0) {
      relevantMotions.push(...template.motionLanguage.slice(0, 2));
    }
    
    return relevantMotions.join(". ");
  }

  /**
   * Construit le negative prompt
   */
  private buildNegativePrompt(template: IntentionTemplate): string {
    const baseNegatives = [
      "low quality", "blurry", "artifacts", "flickering", 
      "unnatural motion", "jittery", "frozen frames", 
      "watermark", "text overlay"
    ];
    
    return [...baseNegatives, ...template.negativeAdditions].join(", ");
  }

  /**
   * Description du mouvement pour les métadonnées
   */
  private buildMotionDescription(context: NarrativeContext, template: IntentionTemplate): string {
    return `${template.pacing.toUpperCase()} pacing. ${template.motionLanguage.slice(0, 2).join(". ")}`;
  }

  /**
   * Instruction caméra pour les métadonnées
   */
  private buildCameraInstruction(context: NarrativeContext, template: IntentionTemplate): string {
    return context.suggestedCameraMotion || template.cameraApproach;
  }

  /**
   * Score de qualité narrative
   */
  private scoreNarrativeQuality(
    prompt: string, 
    context: NarrativeContext, 
    template: IntentionTemplate
  ): number {
    let score = 70;
    
    // Longueur optimale (400-700)
    if (prompt.length >= 400 && prompt.length <= 700) score += 10;
    else if (prompt.length < 200 || prompt.length > 800) score -= 10;
    
    // Présence de l'intention émotionnelle
    if (prompt.includes("FEELING:")) score += 5;
    
    // Présence de mots-clés atmosphériques
    for (const keyword of template.atmosphereKeywords) {
      if (prompt.toLowerCase().includes(keyword.toLowerCase())) {
        score += 3;
        break;
      }
    }
    
    // Cohérence avec le contexte visuel
    if (context.visualGoal && prompt.includes(context.visualGoal.slice(0, 30))) {
      score += 5;
    }
    
    // Pénalité si générique
    if (prompt.includes("fire and particles in constant motion")) {
      score -= 20; // Le vieux prompt générique!
    }
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Génère le rationale
   */
  private buildRationale(context: NarrativeContext, template: IntentionTemplate): string {
    return `
**Intention Dramatique: ${context.dramaticIntention}**
${template.emotionalCore}

**Pourquoi ce choix:**
- Position: Shot ${context.shotPositionInSequence}/${context.totalShotsInSequence} de "${context.sequenceTitle}"
- Partie: ${context.partTitle} (${context.partAtmosphere})
- Émotion cible: ${context.targetEmotion}

**Motion narrative:**
${template.motionLanguage.slice(0, 3).join("\n")}

**Camera:**
${template.cameraApproach}

**Duration: ${template.duration}s** (${template.pacing} pacing pour cette intention)
    `.trim();
  }

  /**
   * Sélectionne le meilleur provider pour l'intention
   */
  private selectProvider(intention: DramaticIntention): VideoProvider {
    // Mapping intention → provider optimal
    const providerMap: Partial<Record<DramaticIntention, VideoProvider>> = {
      TERROR_TITAN: "kling-2.6",      // Bon pour les mouvements lents et l'émotion
      APOCALYPSE_BIRTH: "kling-2.6",  // Particules et effets
      GENOCIDE_WITNESS: "kling-2.6",  // Expression faciale
      DESPERATE_FLIGHT: "hailuo-2.3", // Action rapide
      MATERNAL_SACRIFICE: "kling-2.6", // Émotion
      CHILD_TRAUMA: "kling-2.6",      // Expression
      COMMUNITY_DEATH: "veo-3.1",     // Wide shots
      REBIRTH_HOPE: "kling-2.6",      // Transition émotionnelle
      VENGEANCE_BIRTH: "kling-2.6",   // Transformation
      TRAINING_MONTAGE: "hailuo-2.3", // Action
      NOIR_ATMOSPHERE: "wan-2.5",     // Ambiance
      MEMORY_HAUNTING: "luma-ray-flash-2",  // Effets dreamlike
      SCALE_REVELATION: "veo-3.1",    // Grand angle
      IMPACT_DESTRUCTION: "hailuo-2.3", // Physique
      ESTABLISHING_WORLD: "veo-3.1",  // Cinématique
    };
    
    return providerMap[intention] || "kling-2.6";
  }

  /**
   * Génère des prompts pour un batch de shots
   */
  generateBatch(contexts: NarrativeContext[]): Map<string, NarrativeVideoPrompt> {
    const results = new Map<string, NarrativeVideoPrompt>();
    
    for (const context of contexts) {
      const prompt = this.generateNarrativePrompt(context);
      results.set(context.shotId, prompt);
    }
    
    logger.info("Batch narrative prompts generated", {
      totalShots: contexts.length,
      averageScore: Array.from(results.values()).reduce((a, b) => a + b.narrativeScore, 0) / contexts.length,
    });
    
    return results;
  }
}

// ============================================
// SINGLETON & EXPORTS
// ============================================

let narrativePromptGeneratorInstance: NarrativePromptGenerator | null = null;

export function getNarrativePromptGenerator(): NarrativePromptGenerator {
  if (!narrativePromptGeneratorInstance) {
    narrativePromptGeneratorInstance = new NarrativePromptGenerator();
  }
  return narrativePromptGeneratorInstance;
}

/**
 * Fonction de convenance pour générer un prompt narratif
 */
export function generateNarrativeVideoPrompt(context: NarrativeContext): NarrativeVideoPrompt {
  return getNarrativePromptGenerator().generateNarrativePrompt(context);
}

/**
 * Détecte l'intention dramatique d'un shot
 */
export function detectDramaticIntention(
  shotDescription: string,
  shotName: string,
  sequenceDescription: string,
  visualGoal?: string
): { intention: DramaticIntention; targetEmotion: string; confidence: number } {
  return getNarrativePromptGenerator().detectIntention(
    shotDescription, 
    shotName, 
    sequenceDescription, 
    visualGoal
  );
}
