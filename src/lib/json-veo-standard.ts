/**
 * JSON VEO 3.1 STANDARD - MOOSTIK BLOODWINGS EDITION
 * ===========================================================================
 * Standard JSON pour la generation video avec Google Veo 3.1 / Veo 3.1 Fast
 * 
 * FEATURES UNIQUES VEO:
 * - Physics simulation avancee (gravite, fluides, tissus, particules)
 * - Generation audio contextuelle native
 * - First/Last frame interpolation native
 * - Contextual reasoning pour coherence narrative
 * - Video extend pour prolonger des sequences
 * 
 * PRESETS MOOSTIK:
 * - 30+ physics presets (vol, BYSS cloud, micro-scale)
 * - 25+ audio presets (ambiances caribbeennes, genocide horror)
 * - Scene presets specifiques univers Moostik
 * - Builder fluide pour configuration rapide
 * 
 * SOTA Janvier 2026
 * ===========================================================================
 */

// ============================================================================
// TYPES
// ============================================================================

export interface JsonVeoMeta {
  model_version: "veo-3.1-fast" | "veo-3.1" | "veo-3.0";
  task_type: "image_to_video" | "text_to_video" | "video_extend";
  project: string;
  shot_id: string;
  scene_intent?: string;
  generation_date?: string;
}

export interface JsonVeoSource {
  type: "single_frame" | "first_last_frame" | "text_only" | "extend";
  first_frame?: string;           // URL image source
  last_frame?: string;            // URL image destination (natif Veo)
  extend_from?: string;           // URL video a prolonger
  reference_images?: string[];    // Images de reference pour coherence
}

export interface JsonVeoPhysics {
  simulation_level: "none" | "basic" | "realistic" | "cinematic";
  gravity: boolean;
  fluid_dynamics: boolean;
  cloth_simulation: boolean;
  particle_effects: boolean;
  collision_detection: boolean;
}

export interface JsonVeoAudio {
  generate: boolean;
  type: "none" | "ambient" | "dialogue" | "music" | "sfx" | "full";
  prompt?: string;                // Description audio contextuelle
  intensity?: number;             // 0 to 1
  style?: "realistic" | "cinematic" | "stylized";
}

export interface JsonVeoParameters {
  duration: 4 | 6 | 8;            // Veo quantifie a 4/6/8s
  aspect_ratio: "16:9" | "9:16" | "1:1" | "4:3" | "21:9";
  resolution: "720p" | "1080p" | "4k";
  fps: 24 | 30 | 60;
  quality: "draft" | "standard" | "high";
  seed?: number;
}

export interface JsonVeoPrompt {
  positive: string;               // Description action/scene
  negative: string;               // A eviter
  contextual_reasoning?: string;  // Veo 3.1 reasoning feature
  style_reference?: string;       // Description style visuel
}

export interface JsonVeoConstraints {
  must_include: string[];
  must_not_include: string[];
  continuity_with?: string;       // Shot ID precedent
  chain_from_video?: string;      // Video URL pour chaining
}

export interface JsonVeo {
  meta: JsonVeoMeta;
  source: JsonVeoSource;
  physics: JsonVeoPhysics;
  audio: JsonVeoAudio;
  parameters: JsonVeoParameters;
  prompt: JsonVeoPrompt;
  constraints: JsonVeoConstraints;
}

// ============================================================================
// PHYSICS PRESETS - 30+ SIMULATION CONFIGURATIONS
// ============================================================================

export const VEO_PHYSICS_PRESETS: Record<string, JsonVeoPhysics> = {
  // === BASE LEVELS ===
  none: {
    simulation_level: "none",
    gravity: false,
    fluid_dynamics: false,
    cloth_simulation: false,
    particle_effects: false,
    collision_detection: false,
  },
  basic: {
    simulation_level: "basic",
    gravity: true,
    fluid_dynamics: false,
    cloth_simulation: false,
    particle_effects: false,
    collision_detection: false,
  },
  realistic: {
    simulation_level: "realistic",
    gravity: true,
    fluid_dynamics: true,
    cloth_simulation: true,
    particle_effects: true,
    collision_detection: true,
  },
  cinematic: {
    simulation_level: "cinematic",
    gravity: true,
    fluid_dynamics: true,
    cloth_simulation: true,
    particle_effects: true,
    collision_detection: true,
  },
  
  // === ENVIRONMENT SPECIFIC ===
  underwater: {
    simulation_level: "realistic",
    gravity: false,
    fluid_dynamics: true,
    cloth_simulation: true,
    particle_effects: true,
    collision_detection: false,
  },
  storm: {
    simulation_level: "cinematic",
    gravity: true,
    fluid_dynamics: true,
    cloth_simulation: true,
    particle_effects: true,
    collision_detection: false,
  },
  interior: {
    simulation_level: "basic",
    gravity: true,
    fluid_dynamics: false,
    cloth_simulation: true,
    particle_effects: false,
    collision_detection: true,
  },
  tropical_jungle: {
    simulation_level: "realistic",
    gravity: true,
    fluid_dynamics: false,
    cloth_simulation: true,
    particle_effects: true,
    collision_detection: false,
  },
  rain_heavy: {
    simulation_level: "cinematic",
    gravity: true,
    fluid_dynamics: true,
    cloth_simulation: true,
    particle_effects: true,
    collision_detection: false,
  },
  fog_dense: {
    simulation_level: "realistic",
    gravity: false,
    fluid_dynamics: true,
    cloth_simulation: false,
    particle_effects: true,
    collision_detection: false,
  },
  fire_scene: {
    simulation_level: "cinematic",
    gravity: true,
    fluid_dynamics: true,
    cloth_simulation: true,
    particle_effects: true,
    collision_detection: false,
  },
  dust_storm: {
    simulation_level: "cinematic",
    gravity: true,
    fluid_dynamics: true,
    cloth_simulation: true,
    particle_effects: true,
    collision_detection: false,
  },
  
  // === MOOSTIK SPECIFIC ===
  moostik_flight: {
    simulation_level: "realistic",
    gravity: false,
    fluid_dynamics: true,
    cloth_simulation: false,
    particle_effects: true,
    collision_detection: false,
  },
  moostik_wing_physics: {
    simulation_level: "cinematic",
    gravity: false,
    fluid_dynamics: true,
    cloth_simulation: true,
    particle_effects: false,
    collision_detection: false,
  },
  byss_toxic_cloud: {
    simulation_level: "cinematic",
    gravity: true,
    fluid_dynamics: true,
    cloth_simulation: false,
    particle_effects: true,
    collision_detection: false,
  },
  micro_scale_world: {
    simulation_level: "realistic",
    gravity: true,
    fluid_dynamics: true,
    cloth_simulation: true,
    particle_effects: true,
    collision_detection: true,
  },
  blood_droplet: {
    simulation_level: "cinematic",
    gravity: true,
    fluid_dynamics: true,
    cloth_simulation: false,
    particle_effects: true,
    collision_detection: false,
  },
  giant_impact: {
    simulation_level: "cinematic",
    gravity: true,
    fluid_dynamics: true,
    cloth_simulation: true,
    particle_effects: true,
    collision_detection: true,
  },
  
  // === EMOTIONAL/STYLISTIC ===
  dreamlike: {
    simulation_level: "realistic",
    gravity: false,
    fluid_dynamics: true,
    cloth_simulation: true,
    particle_effects: true,
    collision_detection: false,
  },
  nightmare: {
    simulation_level: "cinematic",
    gravity: true,
    fluid_dynamics: true,
    cloth_simulation: true,
    particle_effects: true,
    collision_detection: false,
  },
  memory_haze: {
    simulation_level: "basic",
    gravity: false,
    fluid_dynamics: true,
    cloth_simulation: false,
    particle_effects: true,
    collision_detection: false,
  },
  action_chaos: {
    simulation_level: "cinematic",
    gravity: true,
    fluid_dynamics: true,
    cloth_simulation: true,
    particle_effects: true,
    collision_detection: true,
  },
  peaceful_stillness: {
    simulation_level: "basic",
    gravity: true,
    fluid_dynamics: false,
    cloth_simulation: true,
    particle_effects: false,
    collision_detection: false,
  },
};

// ============================================================================
// AUDIO PRESETS - 25+ SOUNDSCAPE CONFIGURATIONS
// ============================================================================

export const VEO_AUDIO_PRESETS: Record<string, Partial<JsonVeoAudio>> = {
  // === BASE LEVELS ===
  silent: { generate: false, type: "none" },
  ambient_soft: { generate: true, type: "ambient", intensity: 0.3, style: "realistic" },
  ambient_medium: { generate: true, type: "ambient", intensity: 0.5, style: "realistic" },
  ambient_full: { generate: true, type: "ambient", intensity: 0.7, style: "cinematic" },
  dialogue: { generate: true, type: "dialogue", intensity: 0.8, style: "realistic" },
  music_subtle: { generate: true, type: "music", intensity: 0.4, style: "cinematic" },
  music_epic: { generate: true, type: "music", intensity: 0.8, style: "cinematic" },
  sfx_only: { generate: true, type: "sfx", intensity: 0.6, style: "realistic" },
  sfx_dramatic: { generate: true, type: "sfx", intensity: 0.9, style: "cinematic" },
  full_cinematic: { generate: true, type: "full", intensity: 0.9, style: "cinematic" },
  
  // === ENVIRONMENT SPECIFIC ===
  caribbean_day: { 
    generate: true, 
    type: "ambient", 
    intensity: 0.5, 
    style: "realistic",
    prompt: "Caribbean tropical day, bird songs, warm breeze, distant ocean"
  },
  caribbean_night: { 
    generate: true, 
    type: "ambient", 
    intensity: 0.6, 
    style: "realistic",
    prompt: "Caribbean tropical night, crickets, frogs, nocturnal insects, warm humidity"
  },
  jungle_alive: { 
    generate: true, 
    type: "ambient", 
    intensity: 0.7, 
    style: "realistic",
    prompt: "Dense tropical jungle, wildlife calls, rustling leaves, humid atmosphere"
  },
  storm_approaching: { 
    generate: true, 
    type: "ambient", 
    intensity: 0.8, 
    style: "cinematic",
    prompt: "Ominous storm approaching, thunder rolling, wind building, tension"
  },
  storm_full: { 
    generate: true, 
    type: "full", 
    intensity: 0.95, 
    style: "cinematic",
    prompt: "Full tropical storm, thunder, heavy rain, howling wind, chaos"
  },
  
  // === MOOSTIK SPECIFIC ===
  moostik_buzz: { 
    generate: true, 
    type: "sfx", 
    intensity: 0.4, 
    style: "realistic",
    prompt: "Mosquito buzzing, wing sounds, micro-scale flight audio"
  },
  moostik_swarm: { 
    generate: true, 
    type: "sfx", 
    intensity: 0.7, 
    style: "cinematic",
    prompt: "Multiple mosquitoes, swarm buzzing, coordinated flight sounds"
  },
  bar_ti_sang_ambiance: { 
    generate: true, 
    type: "ambient", 
    intensity: 0.6, 
    style: "stylized",
    prompt: "Underground speakeasy, muffled music, glasses clinking, low murmurs, mysterious"
  },
  genocide_horror: { 
    generate: true, 
    type: "full", 
    intensity: 0.9, 
    style: "cinematic",
    prompt: "Mass death scene, desperate buzzing, toxic hiss, falling bodies, horror ambiance"
  },
  moostik_attack: { 
    generate: true, 
    type: "sfx", 
    intensity: 0.8, 
    style: "cinematic",
    prompt: "Predator mosquito diving, wind whoosh, heartbeat target sensing"
  },
  
  // === EMOTIONAL/NARRATIVE ===
  tension_building: { 
    generate: true, 
    type: "music", 
    intensity: 0.6, 
    style: "cinematic",
    prompt: "Building tension, low strings, heartbeat rhythm, suspense"
  },
  emotional_sadness: { 
    generate: true, 
    type: "music", 
    intensity: 0.5, 
    style: "cinematic",
    prompt: "Melancholic, solo piano, emotional weight, loss and grief"
  },
  triumphant: { 
    generate: true, 
    type: "music", 
    intensity: 0.85, 
    style: "cinematic",
    prompt: "Heroic triumph, orchestral swell, victory moment, epic brass"
  },
  horror_creeping: { 
    generate: true, 
    type: "ambient", 
    intensity: 0.7, 
    style: "cinematic",
    prompt: "Creeping horror, subtle wrongness, unnatural silence, dread"
  },
  memory_flashback: { 
    generate: true, 
    type: "ambient", 
    intensity: 0.4, 
    style: "stylized",
    prompt: "Memory haze, muffled sounds, echo effect, nostalgic distance"
  },
};

export const VEO_DEFAULT_PARAMS: JsonVeoParameters = {
  duration: 6,
  aspect_ratio: "16:9",
  resolution: "1080p",
  fps: 24,
  quality: "high",
};

export const VEO_DEFAULT_NEGATIVE = [
  "blurry",
  "distorted",
  "low quality",
  "artifacts",
  "morphing",
  "flickering",
  "jittery camera",
  "inconsistent physics",
  "floating objects",
  "temporal glitches",
].join(", ");

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Cree un JsonVeo vide avec valeurs par defaut
 */
export function createEmptyJsonVeo(shotId: string, project: string = "MOOSTIK"): JsonVeo {
  return {
    meta: {
      model_version: "veo-3.1-fast",
      task_type: "image_to_video",
      project,
      shot_id: shotId,
      generation_date: new Date().toISOString(),
    },
    source: {
      type: "single_frame",
    },
    physics: { ...VEO_PHYSICS_PRESETS.basic },
    audio: { ...VEO_AUDIO_PRESETS.ambient_soft } as JsonVeoAudio,
    parameters: { ...VEO_DEFAULT_PARAMS },
    prompt: {
      positive: "",
      negative: VEO_DEFAULT_NEGATIVE,
    },
    constraints: {
      must_include: [],
      must_not_include: [],
    },
  };
}

/**
 * Cree un JsonVeo complet a partir des donnees du shot
 */
export function createJsonVeo(options: {
  shotId: string;
  project?: string;
  sceneIntent?: string;
  sourceType: "single_frame" | "first_last_frame" | "text_only" | "extend";
  firstFrame?: string;
  lastFrame?: string;
  extendFrom?: string;
  referenceImages?: string[];
  physicsPreset?: keyof typeof VEO_PHYSICS_PRESETS;
  audioPreset?: keyof typeof VEO_AUDIO_PRESETS;
  audioPrompt?: string;
  duration?: 4 | 6 | 8;
  aspectRatio?: JsonVeoParameters["aspect_ratio"];
  resolution?: JsonVeoParameters["resolution"];
  fps?: 24 | 30 | 60;
  prompt: string;
  negativePrompt?: string;
  contextualReasoning?: string;
  mustInclude?: string[];
  mustNotInclude?: string[];
  continuityWith?: string;
  chainFromVideo?: string;
  seed?: number;
  useFastModel?: boolean;
}): JsonVeo {
  const {
    shotId,
    project = "MOOSTIK",
    sceneIntent,
    sourceType,
    firstFrame,
    lastFrame,
    extendFrom,
    referenceImages,
    physicsPreset = "basic",
    audioPreset = "ambient_soft",
    audioPrompt,
    duration = 6,
    aspectRatio = "16:9",
    resolution = "1080p",
    fps = 24,
    prompt,
    negativePrompt,
    contextualReasoning,
    mustInclude = [],
    mustNotInclude = [],
    continuityWith,
    chainFromVideo,
    seed,
    useFastModel = true,
  } = options;

  const audioConfig = { ...VEO_AUDIO_PRESETS[audioPreset] } as JsonVeoAudio;
  if (audioPrompt) {
    audioConfig.prompt = audioPrompt;
  }

  return {
    meta: {
      model_version: useFastModel ? "veo-3.1-fast" : "veo-3.1",
      task_type: sourceType === "extend" ? "video_extend" : 
                 sourceType === "text_only" ? "text_to_video" : "image_to_video",
      project,
      shot_id: shotId,
      scene_intent: sceneIntent,
      generation_date: new Date().toISOString(),
    },
    source: {
      type: sourceType,
      first_frame: firstFrame,
      last_frame: lastFrame,
      extend_from: extendFrom,
      reference_images: referenceImages,
    },
    physics: { ...VEO_PHYSICS_PRESETS[physicsPreset] },
    audio: audioConfig,
    parameters: {
      duration,
      aspect_ratio: aspectRatio,
      resolution,
      fps,
      quality: useFastModel ? "standard" : "high",
      seed,
    },
    prompt: {
      positive: prompt,
      negative: negativePrompt || VEO_DEFAULT_NEGATIVE,
      contextual_reasoning: contextualReasoning,
    },
    constraints: {
      must_include: mustInclude,
      must_not_include: mustNotInclude,
      continuity_with: continuityWith,
      chain_from_video: chainFromVideo,
    },
  };
}

/**
 * Convertit un JsonVeo en parametres pour l'API Veo
 */
export function jsonVeoToApiParams(json: JsonVeo): Record<string, unknown> {
  const params: Record<string, unknown> = {
    prompt: json.prompt.positive,
    negative_prompt: json.prompt.negative,
    duration_seconds: json.parameters.duration,
    aspect_ratio: json.parameters.aspect_ratio,
    output_resolution: json.parameters.resolution,
    fps: json.parameters.fps,
  };

  // Source handling
  if (json.source.first_frame) {
    params.image = json.source.first_frame;
  }
  if (json.source.last_frame) {
    params.end_image = json.source.last_frame;
  }
  if (json.source.extend_from) {
    params.extend_video = json.source.extend_from;
  }

  // Physics (Veo's strength)
  if (json.physics.simulation_level !== "none") {
    params.physics_simulation = json.physics.simulation_level;
  }

  // Audio generation (Veo's unique feature)
  if (json.audio.generate) {
    params.generate_audio = true;
    params.audio_type = json.audio.type;
    if (json.audio.prompt) {
      params.audio_prompt = json.audio.prompt;
    }
  }

  // Contextual reasoning (Veo 3.1 feature)
  if (json.prompt.contextual_reasoning) {
    params.contextual_reasoning = json.prompt.contextual_reasoning;
  }

  // Seed
  if (json.parameters.seed) {
    params.seed = json.parameters.seed;
  }

  // Model selection
  params.model = json.meta.model_version === "veo-3.1-fast" ? "fast" : "standard";

  return params;
}

/**
 * Determine le physics preset optimal pour un type de scene
 */
export function getPhysicsPresetForScene(
  sceneType: string,
  environment?: string
): keyof typeof VEO_PHYSICS_PRESETS {
  // Environment-based
  if (environment) {
    const envLower = environment.toLowerCase();
    if (envLower.includes("water") || envLower.includes("ocean") || envLower.includes("underwater")) {
      return "underwater";
    }
    if (envLower.includes("storm") || envLower.includes("wind") || envLower.includes("rain")) {
      return "storm";
    }
    if (envLower.includes("interior") || envLower.includes("indoor") || envLower.includes("room")) {
      return "interior";
    }
  }

  // Scene type based
  const sceneTypeMap: Record<string, keyof typeof VEO_PHYSICS_PRESETS> = {
    action: "cinematic",
    battle: "cinematic",
    dialogue: "basic",
    portrait: "none",
    landscape: "realistic",
    establishing: "realistic",
    transition: "basic",
    flashback: "basic",
    dramatic: "cinematic",
    peaceful: "realistic",
  };

  return sceneTypeMap[sceneType] || "basic";
}

/**
 * Determine l'audio preset optimal pour un type de scene
 */
export function getAudioPresetForScene(
  sceneType: string,
  hasDialogue: boolean = false
): keyof typeof VEO_AUDIO_PRESETS {
  if (hasDialogue) return "dialogue";

  const audioMap: Record<string, keyof typeof VEO_AUDIO_PRESETS> = {
    action: "full_cinematic",
    battle: "full_cinematic",
    dialogue: "dialogue",
    portrait: "ambient_soft",
    landscape: "ambient_full",
    establishing: "music_subtle",
    transition: "music_subtle",
    flashback: "ambient_soft",
    dramatic: "full_cinematic",
    peaceful: "ambient_soft",
  };

  return audioMap[sceneType] || "ambient_soft";
}

/**
 * Determine la duree optimale pour un type de scene
 */
export function getOptimalDuration(
  sceneType: string,
  hasDialogue: boolean = false,
  complexity: "low" | "medium" | "high" = "medium"
): 4 | 6 | 8 {
  // Dialogue scenes need more time
  if (hasDialogue) return 8;

  // Complexity-based
  if (complexity === "high") return 8;
  if (complexity === "low") return 4;

  // Scene type based
  const durationMap: Record<string, 4 | 6 | 8> = {
    action: 6,
    battle: 8,
    dialogue: 8,
    portrait: 4,
    landscape: 6,
    establishing: 6,
    transition: 4,
    flashback: 6,
    dramatic: 8,
    peaceful: 6,
  };

  return durationMap[sceneType] || 6;
}

/**
 * Genere un prompt de reasoning contextuel pour Veo 3.1
 */
export function generateContextualReasoning(
  sceneIntent: string,
  previousShotDescription?: string,
  nextShotDescription?: string
): string {
  let reasoning = `Scene intent: ${sceneIntent}. `;

  if (previousShotDescription) {
    reasoning += `This shot follows: "${previousShotDescription}". Maintain visual continuity. `;
  }

  if (nextShotDescription) {
    reasoning += `This shot leads to: "${nextShotDescription}". Prepare transition. `;
  }

  reasoning += "Generate smooth, cinematic motion that serves the narrative purpose.";

  return reasoning;
}

/**
 * Valide un JsonVeo
 */
export function validateJsonVeo(json: JsonVeo): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Meta validation
  if (!json.meta.shot_id) errors.push("shot_id requis");

  // Source validation
  if (json.source.type === "single_frame" && !json.source.first_frame) {
    errors.push("first_frame requis pour single_frame");
  }
  if (json.source.type === "first_last_frame") {
    if (!json.source.first_frame) errors.push("first_frame requis pour interpolation");
    if (!json.source.last_frame) errors.push("last_frame requis pour interpolation");
  }
  if (json.source.type === "extend" && !json.source.extend_from) {
    errors.push("extend_from requis pour video_extend");
  }

  // Parameters validation
  if (![4, 6, 8].includes(json.parameters.duration)) {
    errors.push("duration doit etre 4, 6 ou 8 secondes pour Veo");
  }

  // Prompt validation
  if (!json.prompt.positive || json.prompt.positive.length < 10) {
    errors.push("prompt.positive requis (min 10 caracteres)");
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// MOOSTIK-SPECIFIC SCENE PRESETS FOR VEO
// ============================================================================

export interface MoostikVeoScenePreset {
  name: string;
  description: string;
  physicsPreset: keyof typeof VEO_PHYSICS_PRESETS;
  audioPreset: keyof typeof VEO_AUDIO_PRESETS;
  duration: 4 | 6 | 8;
  useFastModel: boolean;
  promptEnhancements: string[];
  reasoningTemplate: string;
}

export const MOOSTIK_VEO_SCENE_PRESETS: Record<string, MoostikVeoScenePreset> = {
  // === FLIGHT SCENES ===
  moostik_flight_majestic: {
    name: "Vol majestueux",
    description: "Moostik volant gracieusement, physique des ailes realiste",
    physicsPreset: "moostik_wing_physics",
    audioPreset: "moostik_buzz",
    duration: 6,
    useFastModel: false,
    promptEnhancements: [
      "graceful wing physics",
      "air currents interaction",
      "micro-scale flight dynamics",
      "Pixar-quality character animation",
    ],
    reasoningTemplate: "Generate realistic mosquito flight with accurate wing physics and air dynamics.",
  },
  moostik_swarm_attack: {
    name: "Attaque en essaim",
    description: "Essaim de Moostiks coordonnes en attaque",
    physicsPreset: "moostik_flight",
    audioPreset: "moostik_swarm",
    duration: 8,
    useFastModel: false,
    promptEnhancements: [
      "coordinated swarm movement",
      "multiple mosquitoes",
      "attack formation",
      "predator intensity",
    ],
    reasoningTemplate: "Generate coordinated swarm attack with multiple mosquitoes moving in predatory formation.",
  },
  
  // === GENOCIDE/BYSS SCENES ===
  byss_cloud_approach: {
    name: "Approche nuage BYSS",
    description: "Le nuage toxique BYSS envahissant le ciel",
    physicsPreset: "byss_toxic_cloud",
    audioPreset: "genocide_horror",
    duration: 8,
    useFastModel: false,
    promptEnhancements: [
      "toxic green cloud rolling",
      "death approaching",
      "apocalyptic atmosphere",
      "particle simulation",
      "volumetric fog",
    ],
    reasoningTemplate: "Generate ominous toxic cloud with realistic fluid dynamics, rolling in as harbinger of death.",
  },
  genocide_mass_death: {
    name: "Genocide - Mort de masse",
    description: "Moostiks tombant du ciel pendant le genocide",
    physicsPreset: "giant_impact",
    audioPreset: "genocide_horror",
    duration: 8,
    useFastModel: false,
    promptEnhancements: [
      "falling bodies",
      "mass death",
      "gravity physics",
      "tragic scale",
      "genocide horror",
    ],
    reasoningTemplate: "Generate mass death scene with realistic falling physics, tragic and horrifying.",
  },
  
  // === BAR TI-SANG SCENES ===
  bar_interior_ambiance: {
    name: "Interieur Bar Ti-Sang",
    description: "Ambiance du bar clandestin Moostik",
    physicsPreset: "interior",
    audioPreset: "bar_ti_sang_ambiance",
    duration: 6,
    useFastModel: true,
    promptEnhancements: [
      "speakeasy atmosphere",
      "amber candlelight",
      "dust particles in air",
      "micro-scale interior",
    ],
    reasoningTemplate: "Generate cozy but mysterious bar interior with atmospheric particles and warm lighting.",
  },
  bar_blood_cocktail: {
    name: "Cocktail de sang",
    description: "Gros plan sur un cocktail de sang Moostik",
    physicsPreset: "blood_droplet",
    audioPreset: "ambient_soft",
    duration: 4,
    useFastModel: true,
    promptEnhancements: [
      "blood-red liquid",
      "glass surface tension",
      "micro bubbles",
      "luxurious presentation",
    ],
    reasoningTemplate: "Generate close-up of blood cocktail with realistic liquid physics and surface tension.",
  },
  
  // === GIGANTISM POV SCENES ===
  pov_giant_human_looms: {
    name: "POV Humain geant",
    description: "Vue Moostik d'un humain gigantesque menacant",
    physicsPreset: "giant_impact",
    audioPreset: "horror_creeping",
    duration: 6,
    useFastModel: false,
    promptEnhancements: [
      "extreme scale difference",
      "looming threat",
      "micro perspective",
      "terrifying size",
    ],
    reasoningTemplate: "Generate POV shot from micro-scale showing gigantic human as overwhelming threat.",
  },
  pov_ear_landscape: {
    name: "POV Paysage oreille",
    description: "L'oreille humaine vue comme un paysage par le Moostik",
    physicsPreset: "micro_scale_world",
    audioPreset: "moostik_attack",
    duration: 8,
    useFastModel: false,
    promptEnhancements: [
      "ear as canyon landscape",
      "skin texture terrain",
      "hair forest",
      "blood warmth sensing",
      "predator approach",
    ],
    reasoningTemplate: "Generate approach to giant ear from mosquito POV, treating anatomy as landscape.",
  },
  
  // === EMOTIONAL SCENES ===
  papy_tik_monologue: {
    name: "Monologue Papy Tik",
    description: "Papy Tik partageant sa sagesse, moment intime",
    physicsPreset: "peaceful_stillness",
    audioPreset: "emotional_sadness",
    duration: 8,
    useFastModel: true,
    promptEnhancements: [
      "intimate moment",
      "wise elder",
      "emotional depth",
      "subtle movement",
      "Pixar emotional realism",
    ],
    reasoningTemplate: "Generate intimate dialogue scene with subtle emotional acting and atmospheric stillness.",
  },
  baby_dorval_nightmare: {
    name: "Cauchemar Baby Dorval",
    description: "Baby Dorval revivant le traumatisme du genocide",
    physicsPreset: "nightmare",
    audioPreset: "horror_creeping",
    duration: 8,
    useFastModel: false,
    promptEnhancements: [
      "nightmare imagery",
      "trauma flashback",
      "distorted reality",
      "child's terror",
      "PTSD visualization",
    ],
    reasoningTemplate: "Generate nightmare sequence with distorted physics representing trauma.",
  },
  
  // === ESTABLISHING/LANDSCAPE ===
  martinique_sunrise: {
    name: "Lever de soleil Martinique",
    description: "Vue panoramique de la Martinique a l'aube",
    physicsPreset: "tropical_jungle",
    audioPreset: "caribbean_day",
    duration: 8,
    useFastModel: true,
    promptEnhancements: [
      "Caribbean sunrise",
      "tropical paradise",
      "morning mist",
      "cinematic establishing shot",
    ],
    reasoningTemplate: "Generate beautiful establishing shot of Martinique at sunrise with atmospheric effects.",
  },
  cooltik_village_living: {
    name: "Village Cooltik vivant",
    description: "Le village Moostik avec activite quotidienne",
    physicsPreset: "micro_scale_world",
    audioPreset: "moostik_swarm",
    duration: 8,
    useFastModel: false,
    promptEnhancements: [
      "micro civilization",
      "organic architecture",
      "daily life activity",
      "bioluminescent lights",
      "utopian hidden world",
    ],
    reasoningTemplate: "Generate living micro-scale village with multiple characters and activities.",
  },
  
  // === ACTION SCENES ===
  human_swat_dodge: {
    name: "Esquive claque humaine",
    description: "Moostik esquivant une main humaine gigantesque",
    physicsPreset: "action_chaos",
    audioPreset: "sfx_dramatic",
    duration: 6,
    useFastModel: false,
    promptEnhancements: [
      "split-second dodge",
      "giant hand impact",
      "survival instinct",
      "action slow-motion",
    ],
    reasoningTemplate: "Generate intense action sequence of narrow escape from giant human hand.",
  },
  insecticide_spray_escape: {
    name: "Fuite spray insecticide",
    description: "Moostiks fuyant un nuage d'insecticide",
    physicsPreset: "byss_toxic_cloud",
    audioPreset: "genocide_horror",
    duration: 6,
    useFastModel: false,
    promptEnhancements: [
      "chemical cloud",
      "desperate flight",
      "poison particles",
      "life or death",
    ],
    reasoningTemplate: "Generate escape scene from toxic spray with particle physics and desperation.",
  },
};

// ============================================================================
// ADVANCED BUILDER
// ============================================================================

/**
 * Builder fluide pour JsonVeo
 */
export class JsonVeoBuilder {
  private config: Partial<JsonVeo> = {};
  
  constructor(shotId: string, project: string = "MOOSTIK") {
    this.config = createEmptyJsonVeo(shotId, project);
  }
  
  /** Define scene intent */
  intent(intent: string): this {
    this.config.meta!.scene_intent = intent;
    return this;
  }
  
  /** Set model version */
  model(fast: boolean = true): this {
    this.config.meta!.model_version = fast ? "veo-3.1-fast" : "veo-3.1";
    this.config.parameters!.quality = fast ? "standard" : "high";
    return this;
  }
  
  /** Set source type and frames */
  source(type: JsonVeoSource["type"], firstFrame?: string, lastFrame?: string): this {
    this.config.source = { 
      type, 
      first_frame: firstFrame, 
      last_frame: lastFrame 
    };
    return this;
  }
  
  /** Set video to extend */
  extendFrom(videoUrl: string): this {
    this.config.source!.type = "extend";
    this.config.source!.extend_from = videoUrl;
    this.config.meta!.task_type = "video_extend";
    return this;
  }
  
  /** Add reference images */
  references(...refs: string[]): this {
    this.config.source!.reference_images = refs;
    return this;
  }
  
  /** Apply physics preset */
  physics(preset: keyof typeof VEO_PHYSICS_PRESETS): this {
    this.config.physics = { ...VEO_PHYSICS_PRESETS[preset] };
    return this;
  }
  
  /** Custom physics configuration */
  customPhysics(physics: Partial<JsonVeoPhysics>): this {
    this.config.physics = { ...this.config.physics!, ...physics };
    return this;
  }
  
  /** Apply audio preset */
  audio(preset: keyof typeof VEO_AUDIO_PRESETS): this {
    const audioPreset = VEO_AUDIO_PRESETS[preset];
    this.config.audio = { ...this.config.audio!, ...audioPreset } as JsonVeoAudio;
    return this;
  }
  
  /** Set custom audio prompt */
  audioPrompt(prompt: string): this {
    this.config.audio!.prompt = prompt;
    return this;
  }
  
  /** Disable audio generation */
  silentAudio(): this {
    this.config.audio = { generate: false, type: "none" };
    return this;
  }
  
  /** Apply Moostik scene preset */
  moostikScene(preset: keyof typeof MOOSTIK_VEO_SCENE_PRESETS): this {
    const scene = MOOSTIK_VEO_SCENE_PRESETS[preset];
    this.config.meta!.scene_intent = scene.description;
    this.config.meta!.model_version = scene.useFastModel ? "veo-3.1-fast" : "veo-3.1";
    this.config.physics = { ...VEO_PHYSICS_PRESETS[scene.physicsPreset] };
    this.config.audio = { ...VEO_AUDIO_PRESETS[scene.audioPreset] } as JsonVeoAudio;
    this.config.parameters!.duration = scene.duration;
    this.config.parameters!.quality = scene.useFastModel ? "standard" : "high";
    // Enhance prompt
    const currentPrompt = this.config.prompt!.positive || "";
    this.config.prompt!.positive = currentPrompt 
      ? `${currentPrompt}. ${scene.promptEnhancements.join(", ")}`
      : scene.promptEnhancements.join(", ");
    // Set reasoning
    this.config.prompt!.contextual_reasoning = scene.reasoningTemplate;
    return this;
  }
  
  /** Set duration */
  duration(d: 4 | 6 | 8): this {
    this.config.parameters!.duration = d;
    return this;
  }
  
  /** Set aspect ratio */
  aspectRatio(ratio: JsonVeoParameters["aspect_ratio"]): this {
    this.config.parameters!.aspect_ratio = ratio;
    return this;
  }
  
  /** Set resolution */
  resolution(res: JsonVeoParameters["resolution"]): this {
    this.config.parameters!.resolution = res;
    return this;
  }
  
  /** Set FPS */
  fps(f: 24 | 30 | 60): this {
    this.config.parameters!.fps = f;
    return this;
  }
  
  /** Set prompt */
  prompt(positive: string, negative?: string): this {
    this.config.prompt!.positive = positive;
    if (negative) this.config.prompt!.negative = negative;
    return this;
  }
  
  /** Set contextual reasoning */
  reasoning(reasoning: string): this {
    this.config.prompt!.contextual_reasoning = reasoning;
    return this;
  }
  
  /** Generate reasoning from context */
  reasoningFromContext(
    prevDescription?: string,
    nextDescription?: string
  ): this {
    this.config.prompt!.contextual_reasoning = generateContextualReasoning(
      this.config.meta!.scene_intent || "",
      prevDescription,
      nextDescription
    );
    return this;
  }
  
  /** Set constraints */
  constraints(include: string[], exclude: string[]): this {
    this.config.constraints!.must_include = include;
    this.config.constraints!.must_not_include = exclude;
    return this;
  }
  
  /** Set continuity with previous shot */
  continuityWith(shotId: string): this {
    this.config.constraints!.continuity_with = shotId;
    return this;
  }
  
  /** Chain from previous video */
  chainFrom(videoUrl: string): this {
    this.config.constraints!.chain_from_video = videoUrl;
    return this;
  }
  
  /** Set seed */
  seed(s: number): this {
    this.config.parameters!.seed = s;
    return this;
  }
  
  /** Build final JsonVeo */
  build(): JsonVeo {
    const result = this.config as JsonVeo;
    const validation = validateJsonVeo(result);
    if (!validation.valid) {
      console.warn("[JsonVeoBuilder] Validation warnings:", validation.errors);
    }
    return result;
  }
}

/**
 * Create a new JsonVeo builder
 */
export function veoBuilder(shotId: string, project?: string): JsonVeoBuilder {
  return new JsonVeoBuilder(shotId, project);
}

// ============================================================================
// PROMPT ENHANCEMENT HELPERS
// ============================================================================

/**
 * Enhance a basic prompt for Veo with physics and audio awareness
 */
export function enhancePromptForVeo(
  basePrompt: string,
  options: {
    physicsEmphasis?: boolean;
    audioEmphasis?: boolean;
    moostikSpecific?: boolean;
    emotionalTone?: "neutral" | "tense" | "peaceful" | "action" | "horror";
  } = {}
): string {
  const { 
    physicsEmphasis = false, 
    audioEmphasis = false, 
    moostikSpecific = true,
    emotionalTone = "neutral"
  } = options;
  
  const enhancements: string[] = [basePrompt];
  
  // Physics enhancements
  if (physicsEmphasis) {
    enhancements.push("realistic physics simulation", "natural movement", "believable dynamics");
  }
  
  // Audio-aware enhancements (Veo generates audio)
  if (audioEmphasis) {
    enhancements.push("audio-synchronized motion", "sound-reactive elements", "cinematic audio cues");
  }
  
  // Moostik-specific
  if (moostikSpecific) {
    enhancements.push("Pixar-demonic style", "micro-scale realism", "Caribbean atmosphere");
  }
  
  // Emotional tone
  const toneEnhancements: Record<string, string[]> = {
    neutral: ["balanced composition", "clear action"],
    tense: ["building tension", "held breath moment", "suspense"],
    peaceful: ["serene atmosphere", "gentle motion", "tranquility"],
    action: ["dynamic energy", "impact moments", "kinetic flow"],
    horror: ["dread atmosphere", "unsettling elements", "visceral fear"],
  };
  enhancements.push(...toneEnhancements[emotionalTone]);
  
  return enhancements.join(", ");
}

/**
 * Generate audio prompt from scene description
 */
export function generateAudioPrompt(
  sceneDescription: string,
  sceneType: string,
  environment?: string
): string {
  const parts: string[] = [];
  
  // Base from scene description
  parts.push(`Soundscape for: ${sceneDescription}`);
  
  // Environment audio
  if (environment) {
    const envLower = environment.toLowerCase();
    if (envLower.includes("jungle") || envLower.includes("forest")) {
      parts.push("tropical wildlife, rustling leaves, humid atmosphere");
    }
    if (envLower.includes("bar") || envLower.includes("interior")) {
      parts.push("indoor ambiance, muffled sounds, intimate space");
    }
    if (envLower.includes("storm") || envLower.includes("rain")) {
      parts.push("rain and thunder, wind howling, storm intensity");
    }
  }
  
  // Scene type audio
  const sceneAudio: Record<string, string> = {
    action: "impact sounds, whooshes, kinetic energy",
    dialogue: "clear voice space, ambient bed, emotional undertone",
    establishing: "environmental ambiance, location presence, scale",
    emotional: "subtle music cue, emotional resonance, intimacy",
    horror: "unsettling tones, dread sounds, silence and shock",
    flight: "air rush, wing sounds, movement through space",
  };
  if (sceneAudio[sceneType]) {
    parts.push(sceneAudio[sceneType]);
  }
  
  return parts.join(". ");
}

/**
 * Get recommended Veo settings for a scene type
 */
export function getRecommendedVeoSettings(sceneType: string): {
  physicsPreset: keyof typeof VEO_PHYSICS_PRESETS;
  audioPreset: keyof typeof VEO_AUDIO_PRESETS;
  duration: 4 | 6 | 8;
  useFastModel: boolean;
} {
  // Check Moostik presets first
  if (sceneType in MOOSTIK_VEO_SCENE_PRESETS) {
    const preset = MOOSTIK_VEO_SCENE_PRESETS[sceneType];
    return {
      physicsPreset: preset.physicsPreset,
      audioPreset: preset.audioPreset,
      duration: preset.duration,
      useFastModel: preset.useFastModel,
    };
  }
  
  // Generic recommendations
  const recommendations: Record<string, ReturnType<typeof getRecommendedVeoSettings>> = {
    portrait: { physicsPreset: "none", audioPreset: "ambient_soft", duration: 4, useFastModel: true },
    landscape: { physicsPreset: "realistic", audioPreset: "ambient_full", duration: 6, useFastModel: true },
    action: { physicsPreset: "action_chaos", audioPreset: "sfx_dramatic", duration: 6, useFastModel: false },
    dialogue: { physicsPreset: "basic", audioPreset: "dialogue", duration: 8, useFastModel: true },
    establishing: { physicsPreset: "realistic", audioPreset: "ambient_full", duration: 6, useFastModel: true },
    transition: { physicsPreset: "basic", audioPreset: "music_subtle", duration: 4, useFastModel: true },
    emotional: { physicsPreset: "basic", audioPreset: "emotional_sadness", duration: 8, useFastModel: true },
    flight: { physicsPreset: "moostik_flight", audioPreset: "moostik_buzz", duration: 6, useFastModel: false },
    horror: { physicsPreset: "nightmare", audioPreset: "horror_creeping", duration: 8, useFastModel: false },
    genocide: { physicsPreset: "byss_toxic_cloud", audioPreset: "genocide_horror", duration: 8, useFastModel: false },
  };
  
  return recommendations[sceneType] || {
    physicsPreset: "basic",
    audioPreset: "ambient_soft",
    duration: 6,
    useFastModel: true,
  };
}

// ============================================================================
// EXPORT ALL PRESETS FOR EXTERNAL ACCESS
// ============================================================================

export const ALL_VEO_PRESETS = {
  physics: VEO_PHYSICS_PRESETS,
  audio: VEO_AUDIO_PRESETS,
  moostikScenes: MOOSTIK_VEO_SCENE_PRESETS,
} as const;
