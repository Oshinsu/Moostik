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
// TYPES - STRUCTURE JSON MOOSTIK
// ═══════════════════════════════════════════════════════════════════════════════

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
 * STRUCTURE JSON MOOSTIK - LA CONSTITUTION
 * Tout prompt de génération DOIT suivre cette structure
 */
export interface JsonMoostik {
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
 * Convertit un JSON MOOSTIK en prompt texte CINÉMATOGRAPHIQUE pour l'API
 * Format optimisé pour rendu photoréaliste/film, PAS illustration
 */
export function jsonMoostikToPrompt(json: JsonMoostik): string {
  // STRUCTURE CINÉMATOGRAPHIQUE - comme un brief de DoP (Director of Photography)
  
  const cinematicPrompt = `
Cinematic still frame from a Pixar-dark animated feature film. ${json.goal}

SHOT: ${json.composition.framing} shot, ${json.camera.lens_mm}mm ${json.camera.format} camera, ${json.camera.aperture} aperture. ${json.camera.angle}.

SUBJECT: ${json.subjects.map(s => s.description).join(". ")}

ENVIRONMENT: ${json.scene.location}. ${json.scene.time}. Materials: ${json.scene.materials.join(", ")}.

ATMOSPHERE: ${json.scene.atmosphere.join(", ")}. Volumetric lighting, particulate matter in air, photorealistic depth haze.

LIGHTING SETUP:
- Key: ${json.lighting.key}
- Fill: ${json.lighting.fill}  
- Rim/Back: ${json.lighting.rim}
- Practicals & FX: ${json.lighting.notes}

COMPOSITION: ${json.composition.layout}. Depth staging: ${json.composition.depth}.

RENDER QUALITY: ILM/Weta-grade VFX, 8K textures, subsurface scattering on organic materials, physically accurate light transport, film grain, anamorphic lens characteristics, cinematic color grading with crushed blacks and warm highlights.

STYLE MANDATE: Feature film production quality. NOT an illustration. NOT a concept art. NOT a cartoon. This is a FINAL FRAME from a $200M animated feature. Photorealistic materials, volumetric atmosphere, cinematic lens artifacts, theatrical color science.

COLOR PALETTE: Obsidian black (#0B0B0E), blood red (#8B0015), deep crimson (#B0002A), aged copper (#9B6A3A), warm amber (#FFB25A). Teal shadows for contrast.
`.trim();

  return cinematicPrompt;
}

/**
 * Obtient le negative prompt depuis un JSON MOOSTIK
 */
export function getJsonMoostikNegative(json: JsonMoostik): string {
  return json.negative.join(", ");
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
