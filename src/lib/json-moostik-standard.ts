/**
 * ══════════════════════════════════════════════════════════════════════════════
 * JSON MOOSTIK - STANDARD CONSTITUTIONNEL
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Ce fichier définit LA structure de prompt officielle pour toute génération
 * d'image dans l'univers Moostik. C'est la RÉFÉRENCE CONSTITUTIONNELLE.
 * 
 * TOUT prompt doit suivre cette structure exacte.
 * ══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES - STRUCTURE JSON MOOSTIK BLOODWINGS (SOTA Janvier 2026)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * META - Métadonnées du shot pour traçabilité et organisation
 */
export interface JsonMoostikMeta {
  /** Version du modèle utilisé */
  model_version: "nano-banana-2-pro" | "flux-2-pro" | "flux-2-max" | "imagen-4" | "seedream-4.5" | "ideogram-v3-turbo" | "recraft-v3";
  /** Type de tâche */
  task_type: "cinematic_keyframe" | "character_sheet" | "location_establishing" | "action_shot" | "ultra_cinematic_environment_keyframe";
  /** Projet parent */
  project: string;
  /** ID unique de l'asset */
  asset_id: string;
  /** Description narrative riche de l'intention de la scène */
  scene_intent: string;
}

/**
 * STYLE BIBLE - Règles stylistiques du projet
 */
export interface JsonMoostikStyleBible {
  /** Points différenciateurs clés de l'univers */
  usp_core: string[];
  /** Description du look général */
  look: string;
  /** Palette de couleurs */
  palette: string[];
}

/**
 * ENVIRONMENT - Description de l'environnement avec gigantisme
 */
export interface JsonMoostikEnvironment {
  /** Description de l'espace */
  space: string;
  /** GIGANTISME - indices d'échelle micro (POV Moostik) */
  gigantism_cues: string[];
  /** Éléments spécifiques Moostik dans la scène */
  moostik_elements?: {
    tableaux_paintings?: Array<{ title_visual_only: string; description: string }>;
    frames?: string;
    statues?: string[];
    pedestals?: string;
    [key: string]: unknown;
  };
  /** Ambiance générale */
  mood?: string;
}

/**
 * SCENE GRAPH - Structure narrative complète
 */
export interface JsonMoostikSceneGraph {
  /** Bible stylistique */
  style_bible: JsonMoostikStyleBible;
  /** Environnement avec gigantisme */
  environment: JsonMoostikEnvironment;
  /** Configuration caméra avancée */
  camera?: {
    shot_type: string;
    lens: string;
    composition: string;
    motion_suggestion?: string;
  };
  /** Configuration éclairage avancé */
  lighting?: {
    key: string;
    accent?: string;
    fx?: string;
  };
}

/**
 * PARAMETERS - Paramètres techniques Nano Banana Pro
 */
export interface JsonMoostikParameters {
  /** Ratio d'aspect (ex: "21:9") */
  aspect_ratio: string;
  /** Résolution de rendu (ex: "4096x1744") */
  render_resolution: string;
  /** Nombre d'images à générer */
  output_count?: number;
  /** Seed pour reproductibilité */
  seed?: number;
  /** Nombre d'étapes de diffusion (défaut: 70) */
  steps: number;
  /** Force du guidage (défaut: 8.5) */
  guidance_strength: number;
  /** Netteté (défaut: 0.34) */
  sharpness: number;
  /** Grain film (défaut: 0.13) */
  film_grain: number;
}

/**
 * CONSTRAINTS - Contraintes must_include / must_not_include
 */
export interface JsonMoostikConstraints {
  /** Éléments OBLIGATOIRES dans l'image */
  must_include: string[];
  /** Éléments INTERDITS dans l'image */
  must_not_include: string[];
}

/**
 * REFERENCES - Références DA et images
 */
export interface JsonMoostikReferences {
  /** URL de la DA de référence */
  da?: string;
  /** URLs des images de référence pour cohérence */
  character_refs?: string[];
  /** URLs des références de lieu */
  location_refs?: string[];
}

export interface JsonMoostikSubject {
  id: string;
  name?: string; // Nom du personnage
  priority: number;
  description: string;
  importance?: "primary" | "secondary" | "background"; // Importance dans la scène
  action?: string; // Action en cours du personnage
  reference_image?: string; // URL de l'image de référence si disponible
}

export interface JsonMoostikScene {
  location: string;
  time: string;
  atmosphere: string[];
  materials: string[];
}

export interface JsonMoostikComposition {
  framing: "extreme_wide" | "wide" | "medium" | "close" | "extreme_close" | "macro";
  layout: string;
  depth: string;
}

export interface JsonMoostikCamera {
  format: string;
  lens_mm: number;
  aperture: string;
  angle: string;
}

export interface JsonMoostikLighting {
  key: string;
  fill: string;
  rim: string;
  notes: string;
}

export interface JsonMoostikText {
  strings: string[];
  font_style: string;
  rules: string;
}

export interface JsonMoostikDeliverable {
  type: "cinematic_still" | "character_sheet" | "location_establishing" | "action_shot";
  aspect_ratio: "16:9" | "21:9" | "4:3" | "1:1";
  resolution: "2K" | "4K" | "8K";
}

/**
 * STRUCTURE JSON MOOSTIK BLOODWINGS - LA CONSTITUTION SOTA
 * Tout prompt de génération DOIT suivre cette structure
 * Format inspiré du standard BLOODWINGS Janvier 2026
 */
export interface JsonMoostik {
  // ═══ NOUVEAUX CHAMPS BLOODWINGS ═══
  /** Métadonnées du shot */
  meta?: JsonMoostikMeta;
  /** Références DA et images */
  references?: JsonMoostikReferences;
  /** Structure narrative complète */
  scene_graph?: JsonMoostikSceneGraph;
  /** Paramètres techniques NB2 */
  parameters?: JsonMoostikParameters;
  /** Contraintes must_include/must_not_include */
  constraints?: JsonMoostikConstraints;
  
  // ═══ CHAMPS LEGACY (rétrocompatibilité) ═══
  task: "generate_image";
  deliverable: JsonMoostikDeliverable;
  goal: string;
  invariants: string[];
  subjects: JsonMoostikSubject[];
  scene: JsonMoostikScene;
  composition: JsonMoostikComposition;
  camera: JsonMoostikCamera;
  lighting: JsonMoostikLighting;
  text: JsonMoostikText;
  negative: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// GIGANTISME - POV MOOSTIK (Échelle micro)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GIGANTISME - Indices d'échelle pour le POV Moostik
 * Tout apparaît COLOSSAL depuis la perspective d'un moustique
 */
export const MOOSTIK_GIGANTISM_CUES = {
  /** Indices génériques d'échelle micro */
  default: [
    "fabric threads appear as massive tree trunks",
    "crumbs look like weathered boulders",
    "lint balls tumble like slow tumbleweeds",
    "dust motes drift like slow asteroids in sunbeams",
    "a single water droplet appears as a small lake",
    "carpet fibers form a dense forest",
    "human fingerprints visible as terrain ridges",
  ],
  /** Humains traités comme terrain (jamais comme personnages) */
  human_as_terrain: [
    "human ear as a canyon cliff face",
    "human hand as a slow-moving wall of doom",
    "human fingers as colossal pillars",
    "human skin pores as tiny craters",
    "human hair strands as massive cables",
    "human eyelash as a curved tree trunk",
    "human breath as a hurricane wind",
  ],
  /** Indices pour scènes intérieures */
  interior: [
    "furniture legs as architectural columns",
    "table surface as an infinite plain",
    "carpet as a shaggy tundra landscape",
    "lamp as a distant sun/moon",
    "electrical outlets as cave entrances",
    "baseboards as towering walls",
  ],
  /** Indices pour scènes extérieures */
  exterior: [
    "grass blades as giant green towers",
    "raindrops as falling meteors",
    "puddles as vast lakes",
    "pebbles as mountains",
    "flower petals as landing platforms",
    "tree bark as cliff face terrain",
  ],
};

/**
 * RÈGLES HUMAINS CARIBÉENS - OBLIGATOIRE
 */
export const MOOSTIK_HUMAN_RULES = {
  /** Ethnicité obligatoire */
  ethnicity: "Antillean/Caribbean/Martiniquais ONLY",
  /** Teint de peau */
  skin_tone: "ebony/dark skin with warm subsurface scattering",
  /** Style de rendu */
  style: "Pixar-stylized proportions, NOT photorealistic",
  /** Description enfants générale */
  children: "5-year-old Caribbean child, ebony skin, innocent playful demeanor",
  /** Description enfant tueur (génocide) */
  child_killer: "5-year-old Caribbean child, ebony skin, innocent playful demeanor, unaware of the genocide they cause",
  /** Règle POV */
  pov_rule: "From Moostik POV, humans are COLOSSAL titans - show only hands, feet, or silhouettes, NEVER full faces in Moostik scenes",
};

/**
 * PARAMÈTRES NB2 PAR DÉFAUT
 */
export const MOOSTIK_DEFAULT_NB2_PARAMS: JsonMoostikParameters = {
  aspect_ratio: "16:9",
  render_resolution: "3840x2160",
  output_count: 1,
  steps: 70,
  guidance_strength: 8.5,
  sharpness: 0.34,
  film_grain: 0.13,
};

// ═══════════════════════════════════════════════════════════════════════════════
// INVARIANTS MOOSTIK - CE QUI NE CHANGE JAMAIS
// ═══════════════════════════════════════════════════════════════════════════════

export const MOOSTIK_CONSTITUTIONAL_INVARIANTS = [
  // Style
  "Style: Pixar-dark 3D feature-film quality, ILM-grade VFX, démoniaque mignon aesthetic",
  "Palette: obsidian black (#0B0B0E), blood red (#8B0015), deep crimson (#B0002A), copper (#9B6A3A), warm amber (#FFB25A)",
  
  // Anatomie Moostik
  "Moostik anatomy: MUST have visible needle-like proboscis (their ONLY weapon), large expressive amber/orange eyes, translucent wings with crimson veins",
  "Moostik scale: MICROSCOPIC - dust-speck sized compared to humans",
  "Moostik bodies: matte obsidian chitin (#0B0B0E) with subtle satin highlights",
  
  // Architecture
  "Moostik architecture: Renaissance bio-organic Gothic style - NO human architecture in Moostik scenes",
  "Moostik materials: chitin, resin, wing-membrane, silk threads, nectar-wax, blood-ruby",
  "Moostik lighting: bioluminescent amber/crimson lanterns, nectar-wax candles - NO electric lights",
  
  // Technologie
  "Technology: Medieval fantasy ONLY - NO modern weapons, NO electricity, NO machines",
  "Combat: Proboscis fighting ONLY - NO guns, tanks, or manufactured weapons",
  
  // Symboles
  "Clan sigil: Droplet-Eye (blood drop with stylized eye) on wax seals and insignia",
  
  // Humains
  "Humans: Antillean/Caribbean ONLY (ebony skin), Pixar-stylized proportions",
  "Human POV: Humans appear as COLOSSAL titans from Moostik perspective",
];

export const MOOSTIK_CONSTITUTIONAL_NEGATIVES = [
  // Style interdits
  "anime style",
  "cartoon style", 
  "2D illustration",
  "flat shading",
  "cheap CGI look",
  "neon oversaturation",
  
  // Architecture interdite
  "human architecture in Moostik scenes",
  "human silhouettes in Moostik cities",
  "human furniture in Moostik locations",
  
  // Technologie interdite
  "modern technology",
  "guns",
  "weapons",
  "tanks",
  "machines",
  "vehicles",
  "electricity",
  "electronics",
  "screens",
  "computers",
  
  // Anatomie interdite
  "mosquito without visible proboscis",
  "oversized mosquitoes",
  "human-scale insects",
  
  // Humains interdits
  "white caucasian humans",
  "non-Pixar realistic humans",
  
  // Autres
  "random logos",
  "watermarks",
  "readable text unless specified",
  "gore close-ups",
  "intestines",
];

// ═══════════════════════════════════════════════════════════════════════════════
// PRESETS - CONFIGURATIONS PRÉ-DÉFINIES
// ═══════════════════════════════════════════════════════════════════════════════

export const MOOSTIK_CAMERA_PRESETS = {
  character_sheet: {
    format: "large_format",
    lens_mm: 85,
    aperture: "f/4.0",
    angle: "front + three-quarter + profile turnaround",
  },
  location_establishing: {
    format: "large_format",
    lens_mm: 24,
    aperture: "f/8.0",
    angle: "wide establishing shot",
  },
  action_macro: {
    format: "macro",
    lens_mm: 100,
    aperture: "f/2.8",
    angle: "low angle micro POV",
  },
  portrait: {
    format: "medium_format",
    lens_mm: 85,
    aperture: "f/2.8",
    angle: "eye-level intimate",
  },
  epic_wide: {
    format: "IMAX",
    lens_mm: 14,
    aperture: "f/11",
    angle: "ultra-wide dramatic",
  },
};

export const MOOSTIK_LIGHTING_PRESETS = {
  character_sheet: {
    key: "soft top-front beauty light (#FFB25A)",
    fill: "low fill from below (#1A0F10)",
    rim: "strong crimson rim (#B0002A) for wing/proboscis outline",
    notes: "clean studio lighting, no harsh shadows",
  },
  bar_scene: {
    key: "warm amber practicals from lanterns (#FFB25A)",
    fill: "deep shadow areas (#0B0B0E)",
    rim: "subtle crimson accent (#8B0015)",
    notes: "intimate cantina atmosphere, volumetric haze",
  },
  genocide: {
    key: "violent crimson glow from BYSS spray (#B0002A)",
    fill: "cool moonlight bounce (#1A1A3A)",
    rim: "ember sparks and soot particles",
    notes: "apocalyptic, heavy volumetrics, god-rays through toxic fog",
  },
  cathedral: {
    key: "divine light through blood-drop stained glass (#B0002A + #FFB25A)",
    fill: "sacred darkness (#0B0B0E)",
    rim: "ethereal glow on architectural details",
    notes: "reverent atmosphere, incense smoke volumetrics",
  },
  training: {
    key: "harsh crimson military light (#8B0015)",
    fill: "minimal (#14131A)",
    rim: "sharp discipline highlight",
    notes: "dramatic contrast, sweat and determination visible",
  },
};

export const MOOSTIK_ATMOSPHERE_PRESETS = {
  peaceful: ["warm humidity", "soft pollen particles", "gentle dew mist"],
  tense: ["thick fog", "dust motes", "nervous wing vibration blur"],
  apocalyptic: ["toxic BYSS aerosol fog", "ember particles", "soot smoke", "ash flecks"],
  sacred: ["incense smoke", "divine light rays", "ethereal haze"],
  bar: ["warm haze", "nectar steam", "intimate shadows"],
  military: ["training dust", "wing-beat air currents", "disciplined stillness"],
};

// ═══════════════════════════════════════════════════════════════════════════════
// FONCTIONS DE CONSTRUCTION DE PROMPTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Crée un JSON MOOSTIK vide avec les invariants constitutionnels
 */
export function createEmptyJsonMoostik(): JsonMoostik {
  return {
    task: "generate_image",
    deliverable: {
      type: "cinematic_still",
      aspect_ratio: "16:9",
      resolution: "4K",
    },
    goal: "",
    invariants: [...MOOSTIK_CONSTITUTIONAL_INVARIANTS],
    subjects: [],
    scene: {
      location: "",
      time: "",
      atmosphere: [],
      materials: [],
    },
    composition: {
      framing: "medium",
      layout: "rule of thirds",
      depth: "foreground/mid/background staging",
    },
    camera: MOOSTIK_CAMERA_PRESETS.portrait,
    lighting: MOOSTIK_LIGHTING_PRESETS.character_sheet,
    text: {
      strings: [],
      font_style: "none",
      rules: "No text in image",
    },
    negative: [...MOOSTIK_CONSTITUTIONAL_NEGATIVES],
  };
}

/**
 * Crée un JSON MOOSTIK pour une fiche personnage (character sheet)
 */
export function createCharacterSheetJson(
  characterId: string,
  characterName: string,
  visualDescription: string,
  additionalTraits: string[] = []
): JsonMoostik {
  return {
    task: "generate_image",
    deliverable: {
      type: "character_sheet",
      aspect_ratio: "21:9",
      resolution: "4K",
    },
    goal: `Character reference turnaround sheet for ${characterName} - front, three-quarter, and profile views on neutral background.`,
    invariants: [
      ...MOOSTIK_CONSTITUTIONAL_INVARIANTS,
      `Character identity: ${characterName} must be instantly recognizable`,
      "Turnaround consistency: all three views must show the SAME character",
    ],
    subjects: [
      {
        id: characterId,
        priority: 1,
        description: `${characterName}: ${visualDescription}. ${additionalTraits.join(". ")}`,
      },
    ],
    scene: {
      location: "Neutral character sheet stage",
      time: "Studio lighting",
      atmosphere: ["clean", "professional", "no distractions"],
      materials: ["dark gradient background", "matte dark ground with warm rim reflection"],
    },
    composition: {
      framing: "medium",
      layout: "three views side by side: front | three-quarter | profile",
      depth: "character centered, background recedes",
    },
    camera: MOOSTIK_CAMERA_PRESETS.character_sheet,
    lighting: MOOSTIK_LIGHTING_PRESETS.character_sheet,
    text: {
      strings: [],
      font_style: "none",
      rules: "No text in character sheet",
    },
    negative: [
      ...MOOSTIK_CONSTITUTIONAL_NEGATIVES,
      "cropped character",
      "wings cut off",
      "proboscis not visible",
      "inconsistent views",
      "background elements",
    ],
  };
}

/**
 * Crée un JSON MOOSTIK pour un lieu (location establishing shot)
 */
export function createLocationJson(
  locationId: string,
  locationName: string,
  description: string,
  architecturalFeatures: string[],
  atmosphericElements: string[]
): JsonMoostik {
  return {
    task: "generate_image",
    deliverable: {
      type: "location_establishing",
      aspect_ratio: "16:9",
      resolution: "4K",
    },
    goal: `Establishing shot of ${locationName} - showcase the unique Moostik Renaissance bio-organic architecture.`,
    invariants: [
      ...MOOSTIK_CONSTITUTIONAL_INVARIANTS,
      `Location identity: ${locationName} must have distinctive recognizable features`,
      "NO human architecture - entirely Moostik bio-organic aesthetic",
    ],
    subjects: [
      {
        id: locationId,
        priority: 1,
        description: `${locationName}: ${description}. Architectural features: ${architecturalFeatures.join(", ")}`,
      },
    ],
    scene: {
      location: locationName,
      time: "Atmospheric lighting",
      atmosphere: atmosphericElements,
      materials: ["chitin", "resin", "wing-membrane", "silk threads", "nectar-wax", "blood-ruby glass"],
    },
    composition: {
      framing: "wide",
      layout: "establishing shot with clear architectural hierarchy",
      depth: "foreground details / mid architecture / background atmosphere",
    },
    camera: MOOSTIK_CAMERA_PRESETS.location_establishing,
    lighting: MOOSTIK_LIGHTING_PRESETS.cathedral,
    text: {
      strings: [],
      font_style: "none",
      rules: "No text in location shot",
    },
    negative: [
      ...MOOSTIK_CONSTITUTIONAL_NEGATIVES,
      "human architecture",
      "human buildings",
      "modern buildings",
      "electric lights",
      "human furniture",
    ],
  };
}

/**
 * Convertit un JSON MOOSTIK BLOODWINGS en prompt texte CINÉMATOGRAPHIQUE pour l'API
 * Format optimisé pour rendu photoréaliste/film, PAS illustration
 * SOTA Janvier 2026 - Intègre scene_intent, gigantism, constraints
 */
export function jsonMoostikToPrompt(json: JsonMoostik): string {
  // STRUCTURE CINÉMATOGRAPHIQUE - comme un brief de DoP (Director of Photography)
  
  // ═══ SCENE INTENT (nouveau - description narrative riche) ═══
  const sceneIntent = json.meta?.scene_intent || json.goal;
  
  // ═══ GIGANTISM CUES (nouveau - échelle micro POV Moostik) ═══
  const gigantismCues = json.scene_graph?.environment?.gigantism_cues || [];
  const gigantismSection = gigantismCues.length > 0 
    ? `\nMICRO-SCALE GIGANTISM (POV Moostik): ${gigantismCues.join(". ")}. Everything appears COLOSSAL from mosquito perspective.`
    : "";
  
  // ═══ STYLE BIBLE USP (nouveau - points différenciateurs) ═══
  const uspCore = json.scene_graph?.style_bible?.usp_core || [];
  const uspSection = uspCore.length > 0
    ? `\nUNIVERSE RULES: ${uspCore.join(". ")}.`
    : "";
  
  // ═══ CONSTRAINTS (nouveau - must_include checklist) ═══
  const mustInclude = json.constraints?.must_include || [];
  const constraintsSection = mustInclude.length > 0
    ? `\nMUST INCLUDE: ${mustInclude.join(", ")}.`
    : "";
  
  // ═══ ENVIRONMENT SPACE (nouveau - description enrichie) ═══
  const environmentSpace = json.scene_graph?.environment?.space || "";
  const environmentMood = json.scene_graph?.environment?.mood || "";
  
  const cinematicPrompt = `
SCENE INTENT: ${sceneIntent}

Cinematic still frame from a Pixar-dark animated feature film. ${json.goal}
${uspSection}
${gigantismSection}

SHOT: ${json.composition.framing} shot, ${json.camera.lens_mm}mm ${json.camera.format} camera, ${json.camera.aperture} aperture. ${json.camera.angle}.

SUBJECT: ${json.subjects.map(s => {
    const subjectParts = [s.description];
    if (s.action) subjectParts.push(`Action: ${s.action}`);
    return subjectParts.join(". ");
  }).join(". ")}

ENVIRONMENT: ${environmentSpace || json.scene.location}. ${json.scene.time}. ${environmentMood ? `Mood: ${environmentMood}.` : ""} Materials: ${json.scene.materials.join(", ")}.

ATMOSPHERE: ${json.scene.atmosphere.join(", ")}. Volumetric lighting, particulate matter in air, photorealistic depth haze.

LIGHTING SETUP:
- Key: ${json.lighting.key}
- Fill: ${json.lighting.fill}  
- Rim/Back: ${json.lighting.rim}
- Practicals & FX: ${json.lighting.notes}

COMPOSITION: ${json.composition.layout}. Depth staging: ${json.composition.depth}.
${constraintsSection}

RENDER QUALITY: ILM/Weta-grade VFX, 8K textures, subsurface scattering on organic materials, physically accurate light transport, film grain, anamorphic lens characteristics, cinematic color grading with crushed blacks and warm highlights.

STYLE MANDATE: Feature film production quality. NOT an illustration. NOT a concept art. NOT a cartoon. This is a FINAL FRAME from a $200M animated feature. Photorealistic materials, volumetric atmosphere, cinematic lens artifacts, theatrical color science.

COLOR PALETTE: Obsidian black (#0B0B0E), blood red (#8B0015), deep crimson (#B0002A), aged copper (#9B6A3A), warm amber (#FFB25A). Teal shadows for contrast.

HUMAN CHARACTERS (if present): Antillean/Caribbean/Martiniquais ONLY - ebony dark skin with warm subsurface scattering, Pixar-stylized proportions. From Moostik POV, humans are COLOSSAL titans.
`.trim();

  return cinematicPrompt;
}

/**
 * Obtient le negative prompt depuis un JSON MOOSTIK
 * Combine les negatives legacy et les constraints.must_not_include
 */
export function getJsonMoostikNegative(json: JsonMoostik): string {
  const negatives = [...json.negative];
  
  // Ajouter les must_not_include des constraints
  if (json.constraints?.must_not_include) {
    negatives.push(...json.constraints.must_not_include);
  }
  
  // Dédupliquer
  return [...new Set(negatives)].join(", ");
}

/**
 * Crée un JSON MOOSTIK BLOODWINGS complet avec tous les nouveaux champs
 * Format SOTA Janvier 2026
 */
export function createBloodwingsJsonMoostik(options: {
  assetId: string;
  project?: string;
  sceneIntent: string;
  goal: string;
  subjects: JsonMoostikSubject[];
  location: string;
  timelinePosition: "before_genocide" | "during_genocide" | "after_genocide";
  sceneType: "peaceful" | "tense" | "apocalyptic" | "sacred" | "bar" | "military";
  gigantismCues?: string[];
  uspCore?: string[];
  mustInclude?: string[];
  mustNotInclude?: string[];
  seed?: number;
}): JsonMoostik {
  const {
    assetId,
    project = "MOOSTIK_EP0",
    sceneIntent,
    goal,
    subjects,
    location,
    timelinePosition,
    sceneType,
    gigantismCues = MOOSTIK_GIGANTISM_CUES.default,
    uspCore = [
      "Moostik POV: everything appears COLOSSAL",
      "Humans are terrain hazards, not characters",
      "Proboscis is the ONLY weapon",
      "Démoniaque mignon aesthetic"
    ],
    mustInclude = [],
    mustNotInclude = [],
    seed,
  } = options;
  
  // Mapping des types de scène vers les presets de lighting
  const lightingPresetMap: Record<string, keyof typeof MOOSTIK_LIGHTING_PRESETS> = {
    peaceful: "bar_scene",
    tense: "training",
    apocalyptic: "genocide",
    sacred: "cathedral",
    bar: "bar_scene",
    military: "training",
  };
  
  // Sélectionner le preset de lighting selon le type de scène
  const lightingKey = lightingPresetMap[sceneType] || "bar_scene";
  const lightingPreset = MOOSTIK_LIGHTING_PRESETS[lightingKey];
  const atmospherePreset = MOOSTIK_ATMOSPHERE_PRESETS[sceneType] || MOOSTIK_ATMOSPHERE_PRESETS.peaceful;
  
  return {
    // ═══ NOUVEAUX CHAMPS BLOODWINGS ═══
    meta: {
      model_version: "nano-banana-2-pro",
      task_type: "cinematic_keyframe",
      project,
      asset_id: assetId,
      scene_intent: sceneIntent,
    },
    references: {
      da: "bloodwings_da.png",
    },
    scene_graph: {
      style_bible: {
        usp_core: uspCore,
        look: "premium 3D animated feature film, Pixar-dark, cute demonic, démoniaque mignon",
        palette: ["obsidian black", "blood red", "deep crimson", "copper", "warm amber"],
      },
      environment: {
        space: location,
        gigantism_cues: gigantismCues,
        mood: sceneType === "apocalyptic" ? "apocalyptic horror" : 
              sceneType === "peaceful" ? "idyllic tranquility" :
              sceneType === "sacred" ? "reverent awe" : "atmospheric tension",
      },
    },
    parameters: {
      ...MOOSTIK_DEFAULT_NB2_PARAMS,
      seed: seed || Math.floor(Math.random() * 100000000),
    },
    constraints: {
      must_include: [
        "visible proboscis on all Moostik characters",
        "micro-scale texture cues",
        ...mustInclude,
      ],
      must_not_include: [
        "human faces in Moostik-scale scenes",
        "modern technology",
        "white/caucasian humans",
        ...mustNotInclude,
      ],
    },
    
    // ═══ CHAMPS LEGACY ═══
    task: "generate_image",
    deliverable: {
      type: "cinematic_still",
      aspect_ratio: "16:9",
      resolution: "4K",
    },
    goal,
    invariants: [...MOOSTIK_CONSTITUTIONAL_INVARIANTS],
    subjects,
    scene: {
      location,
      time: timelinePosition === "before_genocide" ? "Peaceful golden hour" :
            timelinePosition === "during_genocide" ? "Apocalyptic toxic haze" :
            "Post-genocide twilight",
      atmosphere: atmospherePreset,
      materials: ["chitin", "resin", "wing-membrane", "silk threads", "nectar-wax", "blood-ruby"],
    },
    composition: {
      framing: "wide",
      layout: "rule of thirds with strong depth",
      depth: "foreground micro-details, mid subject, background atmosphere",
    },
    camera: MOOSTIK_CAMERA_PRESETS.epic_wide,
    lighting: lightingPreset,
    text: {
      strings: [],
      font_style: "none",
      rules: "No readable text in image",
    },
    negative: [...MOOSTIK_CONSTITUTIONAL_NEGATIVES],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT DU STANDARD POUR DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export const JSON_MOOSTIK_TEMPLATE = `
{
  "task": "generate_image",
  "deliverable": { 
    "type": "cinematic_still | character_sheet | location_establishing | action_shot", 
    "aspect_ratio": "16:9 | 21:9 | 4:3 | 1:1", 
    "resolution": "2K | 4K | 8K" 
  },
  "goal": "One-sentence objective describing the image purpose.",
  "invariants": [
    "Style: Pixar-dark 3D feature-film quality",
    "Moostik anatomy: MUST have visible proboscis",
    "Architecture: NO human buildings in Moostik scenes",
    "Technology: Medieval fantasy ONLY",
    "Palette: obsidian black, blood red, crimson, copper, amber"
  ],
  "subjects": [
    { 
      "id": "subject_id", 
      "priority": 1, 
      "description": "Detailed physical + wardrobe + attitude description",
      "reference_image": "optional URL to reference image"
    }
  ],
  "scene": {
    "location": "Where the scene takes place",
    "time": "When (time of day, era, moment)",
    "atmosphere": ["fog", "haze", "particles", "humidity"],
    "materials": ["chitin", "resin", "wing-membrane", "silk"]
  },
  "composition": {
    "framing": "wide | medium | close | macro",
    "layout": "rule of thirds | centered | negative space",
    "depth": "foreground/mid/background staging description"
  },
  "camera": { 
    "format": "large_format | medium_format | macro", 
    "lens_mm": 35, 
    "aperture": "f/2.8", 
    "angle": "eye-level | low angle | high angle | dutch" 
  },
  "lighting": { 
    "key": "main light description", 
    "fill": "fill light description", 
    "rim": "rim/back light description", 
    "notes": "volumetrics, atmosphere, special effects" 
  },
  "text": {
    "strings": ["any text to appear in image"],
    "font_style": "DIN | Eurostile | none",
    "rules": "Text must be legible OR No text in image"
  },
  "negative": [
    "anime style",
    "cartoon",
    "human architecture",
    "modern technology",
    "mosquito without proboscis"
  ]
}
`;
