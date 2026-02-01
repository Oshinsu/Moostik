/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MOOSTIK GLOBAL CONTEXT SYSTEM
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Ce fichier définit le CONTEXTE GLOBAL qui est injecté avant chaque génération
 * d'image ou de vidéo. Il garantit la cohérence visuelle et narrative.
 * 
 * SOTA Janvier 2026 - Standard BLOODWINGS
 * ══════════════════════════════════════════════════════════════════════════════
 */

import { 
  MOOSTIK_GIGANTISM_CUES, 
  MOOSTIK_HUMAN_RULES, 
  MOOSTIK_DEFAULT_NB2_PARAMS,
  MOOSTIK_CONSTITUTIONAL_INVARIANTS,
  MOOSTIK_CONSTITUTIONAL_NEGATIVES,
  type JsonMoostik,
  type JsonMoostikParameters,
} from "./json-moostik-standard";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES - CONTEXTE GLOBAL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Position dans la timeline narrative
 */
export type TimelinePosition = "before_genocide" | "during_genocide" | "after_genocide";

/**
 * Type de scène pour les presets
 */
export type SceneType = "peaceful" | "tense" | "apocalyptic" | "sacred" | "bar" | "military" | "training" | "village";

/**
 * Contexte global MOOSTIK
 * Chargé une fois et injecté dans chaque génération
 */
export interface MoostikGlobalContext {
  // ═══ IDENTITÉ DU PROJET ═══
  project: {
    name: "MOOSTIK";
    episode: string;
    timeline_position: TimelinePosition;
    narrative_arc: string;
  };
  
  // ═══ DA REFERENCE ═══
  da_reference: {
    url: string;
    style_keywords: string[];
    look: string;
  };
  
  // ═══ RÈGLES DE GIGANTISME ═══
  gigantism: {
    enabled: boolean;
    default_cues: string[];
    human_as_terrain: string[];
    interior_cues: string[];
    exterior_cues: string[];
  };
  
  // ═══ RÈGLES HUMAINS ═══
  humans: {
    ethnicity: string;
    skin_tone: string;
    style: string;
    children: string;
    pov_rule: string;
  };
  
  // ═══ INVARIANTS CONSTITUTIONNELS ═══
  invariants: string[];
  negatives: string[];
  
  // ═══ PARAMÈTRES NB2 PAR DÉFAUT ═══
  default_parameters: JsonMoostikParameters;
  
  // ═══ ÉTAT DU MONDE ═══
  world_state: {
    active_events: string[];
    cultural_mood: string;
    threats: string[];
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXTE PAR DÉFAUT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Contexte global par défaut pour EP0
 */
export const DEFAULT_MOOSTIK_CONTEXT: MoostikGlobalContext = {
  project: {
    name: "MOOSTIK",
    episode: "ep0",
    timeline_position: "during_genocide",
    narrative_arc: "L'histoire du génocide des Moostik par les humains et la naissance de la résistance Bloodwings",
  },
  
  da_reference: {
    url: "bloodwings_da.png",
    style_keywords: [
      "Pixar-dark",
      "démoniaque mignon",
      "cute demonic",
      "ILM-grade VFX",
      "feature film quality",
      "micro-scale world",
    ],
    look: "premium 3D animated feature film, Pixar-dark aesthetic with dramatic lighting, cute but menacing mosquito characters, Renaissance bio-organic architecture at micro scale",
  },
  
  gigantism: {
    enabled: true,
    default_cues: MOOSTIK_GIGANTISM_CUES.default,
    human_as_terrain: MOOSTIK_GIGANTISM_CUES.human_as_terrain,
    interior_cues: MOOSTIK_GIGANTISM_CUES.interior,
    exterior_cues: MOOSTIK_GIGANTISM_CUES.exterior,
  },
  
  humans: MOOSTIK_HUMAN_RULES,
  
  invariants: MOOSTIK_CONSTITUTIONAL_INVARIANTS,
  negatives: MOOSTIK_CONSTITUTIONAL_NEGATIVES,
  
  default_parameters: MOOSTIK_DEFAULT_NB2_PARAMS,
  
  world_state: {
    active_events: [
      "Génocide BYSS en cours",
      "Village Cooltik détruit",
      "Survivants en fuite",
    ],
    cultural_mood: "Terreur, perte, début de la résistance",
    threats: [
      "Enfant humain avec bombe BYSS",
      "Spray insecticide toxique",
      "Mains humaines écrasantes",
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXTES PAR TIMELINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Contexte spécifique AVANT le génocide
 */
export const CONTEXT_BEFORE_GENOCIDE: Partial<MoostikGlobalContext> = {
  project: {
    name: "MOOSTIK",
    episode: "ep0",
    timeline_position: "before_genocide",
    narrative_arc: "La vie paisible du village Cooltik avant l'horreur",
  },
  world_state: {
    active_events: [
      "Vie quotidienne paisible",
      "Activités communautaires",
      "Innocence et joie",
    ],
    cultural_mood: "Paix, bonheur, inconscience du danger",
    threats: [],
  },
};

/**
 * Contexte spécifique PENDANT le génocide
 */
export const CONTEXT_DURING_GENOCIDE: Partial<MoostikGlobalContext> = {
  project: {
    name: "MOOSTIK",
    episode: "ep0",
    timeline_position: "during_genocide",
    narrative_arc: "L'apocalypse BYSS et la destruction du village",
  },
  world_state: {
    active_events: [
      "Spray BYSS en cours",
      "Morts massives",
      "Fuite désespérée",
      "Sacrifice de Mama Dorval",
    ],
    cultural_mood: "Terreur absolue, chaos, mort omniprésente",
    threats: [
      "Nuage toxique BYSS",
      "Main de l'enfant",
      "Brouillard mortel",
    ],
  },
};

/**
 * Contexte spécifique APRÈS le génocide
 */
export const CONTEXT_AFTER_GENOCIDE: Partial<MoostikGlobalContext> = {
  project: {
    name: "MOOSTIK",
    episode: "ep0",
    timeline_position: "after_genocide",
    narrative_arc: "Les survivants et la naissance des Bloodwings",
  },
  world_state: {
    active_events: [
      "Deuil et reconstruction",
      "Formation des Bloodwings",
      "Préparation de la vengeance",
    ],
    cultural_mood: "Deuil, colère, détermination, espoir sombre",
    threats: [
      "Humains toujours présents",
      "Risque de nouveau génocide",
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// FONCTIONS DE CHARGEMENT DE CONTEXTE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Charge le contexte global pour un épisode
 */
export function loadGlobalContext(
  episodeId: string,
  timelinePosition?: TimelinePosition
): MoostikGlobalContext {
  // Base context
  const context = { ...DEFAULT_MOOSTIK_CONTEXT };
  context.project.episode = episodeId;
  
  // Apply timeline-specific overrides
  if (timelinePosition) {
    context.project.timeline_position = timelinePosition;
    
    switch (timelinePosition) {
      case "before_genocide":
        Object.assign(context.world_state, CONTEXT_BEFORE_GENOCIDE.world_state);
        break;
      case "during_genocide":
        Object.assign(context.world_state, CONTEXT_DURING_GENOCIDE.world_state);
        break;
      case "after_genocide":
        Object.assign(context.world_state, CONTEXT_AFTER_GENOCIDE.world_state);
        break;
    }
  }
  
  return context;
}

/**
 * Sélectionne les gigantism cues appropriés selon le type de scène
 */
export function getGigantismCues(
  context: MoostikGlobalContext,
  sceneType: "interior" | "exterior" | "human_interaction" | "default"
): string[] {
  if (!context.gigantism.enabled) return [];
  
  switch (sceneType) {
    case "interior":
      return [...context.gigantism.default_cues, ...context.gigantism.interior_cues];
    case "exterior":
      return [...context.gigantism.default_cues, ...context.gigantism.exterior_cues];
    case "human_interaction":
      return [...context.gigantism.default_cues, ...context.gigantism.human_as_terrain];
    default:
      return context.gigantism.default_cues;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INJECTION DE CONTEXTE DANS LES PROMPTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Injecte le contexte global dans un prompt JsonMoostik
 * Appelé automatiquement avant chaque génération
 */
export function injectGlobalContext(
  prompt: JsonMoostik,
  context: MoostikGlobalContext,
  options: {
    sceneType?: "interior" | "exterior" | "human_interaction" | "default";
    includeGigantism?: boolean;
    includeHumanRules?: boolean;
  } = {}
): JsonMoostik {
  const {
    sceneType = "default",
    includeGigantism = true,
    includeHumanRules = true,
  } = options;
  
  // Clone le prompt pour ne pas modifier l'original
  const enrichedPrompt: JsonMoostik = JSON.parse(JSON.stringify(prompt));
  
  // ═══ Injecter les invariants s'ils ne sont pas complets ═══
  if (enrichedPrompt.invariants.length < context.invariants.length) {
    enrichedPrompt.invariants = [...new Set([
      ...enrichedPrompt.invariants,
      ...context.invariants,
    ])];
  }
  
  // ═══ Injecter les negatives s'ils ne sont pas complets ═══
  if (enrichedPrompt.negative.length < context.negatives.length) {
    enrichedPrompt.negative = [...new Set([
      ...enrichedPrompt.negative,
      ...context.negatives,
    ])];
  }
  
  // ═══ Créer scene_graph si absent ═══
  if (!enrichedPrompt.scene_graph) {
    enrichedPrompt.scene_graph = {
      style_bible: {
        usp_core: [
          "Moostik POV: everything appears COLOSSAL",
          "Humans are terrain hazards, not characters",
          "Proboscis is the ONLY weapon",
          "Démoniaque mignon aesthetic",
        ],
        look: context.da_reference.look,
        palette: ["obsidian black", "blood red", "deep crimson", "copper", "warm amber"],
      },
      environment: {
        space: enrichedPrompt.scene.location,
        gigantism_cues: [],
        mood: context.world_state.cultural_mood,
      },
    };
  }
  
  // ═══ Injecter les gigantism cues ═══
  if (includeGigantism && enrichedPrompt.scene_graph?.environment) {
    const gigantismCues = getGigantismCues(context, sceneType);
    enrichedPrompt.scene_graph.environment.gigantism_cues = [
      ...new Set([
        ...(enrichedPrompt.scene_graph.environment.gigantism_cues || []),
        ...gigantismCues,
      ]),
    ];
  }
  
  // ═══ Créer constraints si absent ═══
  if (!enrichedPrompt.constraints) {
    enrichedPrompt.constraints = {
      must_include: [
        "visible proboscis on all Moostik characters",
        "micro-scale texture cues",
      ],
      must_not_include: [
        "human faces in Moostik-scale scenes",
        "modern technology",
      ],
    };
  }
  
  // ═══ Ajouter règles humains si nécessaire ═══
  if (includeHumanRules) {
    const humanConstraint = `Humans must be ${context.humans.ethnicity} with ${context.humans.skin_tone}`;
    if (!enrichedPrompt.constraints.must_include.includes(humanConstraint)) {
      enrichedPrompt.constraints.must_include.push(humanConstraint);
    }
    
    if (!enrichedPrompt.constraints.must_not_include.includes("white/caucasian humans")) {
      enrichedPrompt.constraints.must_not_include.push("white/caucasian humans");
    }
  }
  
  // ═══ Créer parameters si absent ═══
  if (!enrichedPrompt.parameters) {
    enrichedPrompt.parameters = { ...context.default_parameters };
  }
  
  // ═══ Créer meta si absent ═══
  if (!enrichedPrompt.meta) {
    enrichedPrompt.meta = {
      model_version: "nano-banana-2-pro",
      task_type: "cinematic_keyframe",
      project: `MOOSTIK_${context.project.episode.toUpperCase()}`,
      asset_id: `shot_${Date.now()}`,
      scene_intent: enrichedPrompt.goal,
    };
  }
  
  return enrichedPrompt;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export {
  MOOSTIK_GIGANTISM_CUES,
  MOOSTIK_HUMAN_RULES,
  MOOSTIK_DEFAULT_NB2_PARAMS,
};
