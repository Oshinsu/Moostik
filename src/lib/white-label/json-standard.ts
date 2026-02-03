/**
 * ══════════════════════════════════════════════════════════════════════════════
 * WHITE LABEL - JSON STANDARD GÉNÉRIQUE
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Système de prompts structurés générique pour la génération d'images.
 * Adaptable à n'importe quel univers.
 *
 * Sources:
 * - /home/user/Moostik/src/lib/json-moostik-standard.ts
 * - /home/user/Moostik/src/lib/json-kling-standard.ts
 * - /home/user/Moostik/src/lib/json-veo-standard.ts
 * ══════════════════════════════════════════════════════════════════════════════
 */

import type { UniverseConfig } from "./universe-config";
import type { Character, Location, StructuredPrompt } from "./types";

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: INTERFACES JSON STANDARD
// ═══════════════════════════════════════════════════════════════════════════════

export interface JsonStandardMeta {
  universeId: string;
  universeName: string;
  model: string;                           // Ex: "nano-banana-pro", "flux-pro"
  version: string;
  generatedAt: string;
}

export interface JsonStandardReferences {
  daStyle: string;                         // Direction artistique
  imageRefs: {
    url: string;
    type: "character" | "location" | "style" | "pose";
    weight: number;                        // 0.0 - 1.0
    description?: string;
  }[];
}

export interface JsonStandardSubject {
  id: string;
  priority: number;
  type: "character" | "object" | "creature";
  description: string;
  pose?: string;
  expression?: string;
  referenceUrl?: string;
}

export interface JsonStandardScene {
  location?: string;
  locationId?: string;
  description: string;
  timeOfDay: string;
  weather?: string;
  mood: string;
  scale?: string;                          // Pour le gigantisme
}

export interface JsonStandardComposition {
  framing: "extreme_close" | "close" | "medium_close" | "medium" | "medium_wide" | "wide" | "extreme_wide";
  focusPoint?: string;
  depthOfField: "shallow" | "medium" | "deep";
  ruleOfThirds?: boolean;
}

export interface JsonStandardCamera {
  angle: string;                           // Ex: "eye_level", "low_angle", "high_angle"
  lens: string;                            // Ex: "35mm", "50mm", "85mm", "wide"
  movement?: string;                       // Pour vidéo
}

export interface JsonStandardLighting {
  type: string;                            // Ex: "dramatic", "soft", "harsh", "natural"
  keyLight: string;
  fillLight?: string;
  rimLight?: string;
  practical?: string;                      // Lumières dans la scène
}

export interface JsonStandardConstraints {
  mustInclude: string[];
  mustNotInclude: string[];
  styleKeywords: string[];
}

export interface JsonStandardParameters {
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9";
  resolution: "720p" | "1080p" | "2K" | "4K";
  steps?: number;
  guidanceScale?: number;
  seed?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: JSON STANDARD COMPLET
// ═══════════════════════════════════════════════════════════════════════════════

export interface JsonStandard {
  meta: JsonStandardMeta;
  references: JsonStandardReferences;

  // Contenu principal
  goal: string;
  subjects: JsonStandardSubject[];
  scene: JsonStandardScene;
  composition: JsonStandardComposition;
  camera: JsonStandardCamera;
  lighting: JsonStandardLighting;

  // Contraintes
  constraints: JsonStandardConstraints;
  parameters: JsonStandardParameters;

  // Prompts finaux (générés)
  positivePrompt?: string;
  negativePrompt?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: BUILDER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class JsonStandardBuilder {
  private universeConfig: UniverseConfig;
  private json: Partial<JsonStandard>;

  constructor(universeConfig: UniverseConfig) {
    this.universeConfig = universeConfig;
    this.json = {
      meta: {
        universeId: universeConfig.meta.id,
        universeName: universeConfig.meta.name,
        model: "nano-banana-pro",
        version: "1.0",
        generatedAt: new Date().toISOString(),
      },
      references: {
        daStyle: `${universeConfig.visualStyle.quality}, ${universeConfig.visualStyle.aesthetic}`,
        imageRefs: [],
      },
      subjects: [],
      constraints: {
        mustInclude: [],
        mustNotInclude: [...universeConfig.negativePrompts.global],
        styleKeywords: universeConfig.meta.tone,
      },
      parameters: {
        aspectRatio: "16:9",
        resolution: "4K",
        steps: 30,
        guidanceScale: 7.5,
      },
    };
  }

  /**
   * Définit l'objectif de l'image
   */
  setGoal(goal: string): this {
    this.json.goal = goal;
    return this;
  }

  /**
   * Ajoute un personnage comme sujet
   */
  addCharacter(character: Character, priority: number = 1, options?: {
    pose?: string;
    expression?: string;
  }): this {
    const subject: JsonStandardSubject = {
      id: character.id,
      priority,
      type: "character",
      description: this.buildCharacterDescription(character),
      pose: options?.pose,
      expression: options?.expression,
      referenceUrl: character.referenceImages[0],
    };

    this.json.subjects = this.json.subjects || [];
    this.json.subjects.push(subject);

    // Ajouter l'image de référence
    if (character.referenceImages[0]) {
      this.json.references!.imageRefs.push({
        url: character.referenceImages[0],
        type: "character",
        weight: priority === 1 ? 0.8 : 0.6,
        description: character.name,
      });
    }

    return this;
  }

  /**
   * Définit le lieu de la scène
   */
  setLocation(location: Location, options?: {
    timeOfDay?: string;
    weather?: string;
    mood?: string;
  }): this {
    this.json.scene = {
      location: location.name,
      locationId: location.id,
      description: location.description,
      timeOfDay: options?.timeOfDay || "day",
      weather: options?.weather,
      mood: options?.mood || location.atmosphere[0] || "neutral",
      scale: location.scale,
    };

    // Ajouter les contraintes du lieu
    if (location.forbidden) {
      this.json.constraints!.mustNotInclude.push(...location.forbidden);
    }
    if (location.required) {
      this.json.constraints!.mustInclude.push(...location.required);
    }

    // Ajouter l'image de référence
    if (location.referenceImages[0]) {
      this.json.references!.imageRefs.push({
        url: location.referenceImages[0],
        type: "location",
        weight: 0.5,
        description: location.name,
      });
    }

    return this;
  }

  /**
   * Définit la composition
   */
  setComposition(composition: Partial<JsonStandardComposition>): this {
    this.json.composition = {
      framing: composition.framing || "medium",
      focusPoint: composition.focusPoint,
      depthOfField: composition.depthOfField || "medium",
      ruleOfThirds: composition.ruleOfThirds,
    };
    return this;
  }

  /**
   * Définit la caméra
   */
  setCamera(camera: Partial<JsonStandardCamera>): this {
    this.json.camera = {
      angle: camera.angle || "eye_level",
      lens: camera.lens || "50mm",
      movement: camera.movement,
    };
    return this;
  }

  /**
   * Définit l'éclairage
   */
  setLighting(lighting: Partial<JsonStandardLighting>): this {
    this.json.lighting = {
      type: lighting.type || "natural",
      keyLight: lighting.keyLight || this.universeConfig.architecture.lighting.primary,
      fillLight: lighting.fillLight,
      rimLight: lighting.rimLight,
      practical: lighting.practical,
    };
    return this;
  }

  /**
   * Définit les paramètres de génération
   */
  setParameters(params: Partial<JsonStandardParameters>): this {
    this.json.parameters = {
      ...this.json.parameters!,
      ...params,
    };
    return this;
  }

  /**
   * Ajoute des contraintes personnalisées
   */
  addConstraints(options: {
    mustInclude?: string[];
    mustNotInclude?: string[];
    styleKeywords?: string[];
  }): this {
    if (options.mustInclude) {
      this.json.constraints!.mustInclude.push(...options.mustInclude);
    }
    if (options.mustNotInclude) {
      this.json.constraints!.mustNotInclude.push(...options.mustNotInclude);
    }
    if (options.styleKeywords) {
      this.json.constraints!.styleKeywords.push(...options.styleKeywords);
    }
    return this;
  }

  /**
   * Construit le JSON final avec les prompts générés
   */
  build(): JsonStandard {
    const json = this.json as JsonStandard;

    // Générer le positive prompt
    json.positivePrompt = this.generatePositivePrompt();

    // Générer le negative prompt
    json.negativePrompt = this.generateNegativePrompt();

    return json;
  }

  /**
   * Génère le prompt positif à partir du JSON
   */
  private generatePositivePrompt(): string {
    const parts: string[] = [];

    // Style de base
    parts.push(this.json.references!.daStyle);

    // Goal
    if (this.json.goal) {
      parts.push(this.json.goal);
    }

    // Sujets (triés par priorité)
    const subjects = [...(this.json.subjects || [])].sort((a, b) => a.priority - b.priority);
    for (const subject of subjects) {
      let subjectDesc = subject.description;
      if (subject.pose) subjectDesc += `, ${subject.pose}`;
      if (subject.expression) subjectDesc += `, ${subject.expression}`;
      parts.push(subjectDesc);
    }

    // Feature critique de l'espèce
    const criticalFeature = this.universeConfig.species.anatomy.criticalFeature;
    if (criticalFeature.critical) {
      parts.push(`MUST INCLUDE: visible ${criticalFeature.name}, ${criticalFeature.style}`);
    }

    // Scène
    if (this.json.scene) {
      parts.push(this.json.scene.description);
      if (this.json.scene.timeOfDay) parts.push(this.json.scene.timeOfDay);
      if (this.json.scene.mood) parts.push(`${this.json.scene.mood} mood`);
    }

    // Composition
    if (this.json.composition) {
      parts.push(`${this.json.composition.framing} shot`);
      if (this.json.composition.depthOfField) {
        parts.push(`${this.json.composition.depthOfField} depth of field`);
      }
    }

    // Caméra
    if (this.json.camera) {
      if (this.json.camera.angle) parts.push(`${this.json.camera.angle} camera angle`);
      if (this.json.camera.lens) parts.push(`${this.json.camera.lens} lens`);
    }

    // Éclairage
    if (this.json.lighting) {
      parts.push(`${this.json.lighting.type} lighting`);
      if (this.json.lighting.keyLight) parts.push(this.json.lighting.keyLight);
    }

    // Style keywords
    if (this.json.constraints?.styleKeywords) {
      parts.push(...this.json.constraints.styleKeywords);
    }

    // Must include
    if (this.json.constraints?.mustInclude) {
      parts.push(...this.json.constraints.mustInclude);
    }

    return parts.join(", ");
  }

  /**
   * Génère le prompt négatif
   */
  private generateNegativePrompt(): string {
    const negatives = new Set<string>();

    // Ajouter les negatives de l'univers
    this.universeConfig.negativePrompts.global.forEach(n => negatives.add(n));
    this.universeConfig.negativePrompts.character.forEach(n => negatives.add(n));
    this.universeConfig.negativePrompts.location.forEach(n => negatives.add(n));

    // Ajouter les must not include
    if (this.json.constraints?.mustNotInclude) {
      this.json.constraints.mustNotInclude.forEach(n => negatives.add(n));
    }

    return Array.from(negatives).join(", ");
  }

  /**
   * Construit la description d'un personnage
   */
  private buildCharacterDescription(character: Character): string {
    const parts: string[] = [];

    // Type d'espèce + traits visuels
    parts.push(`${character.speciesType} character`);
    parts.push(...character.visualTraits.slice(0, 5));

    // Signature visuelle si disponible
    if (character.visualSignature?.distinctiveFeature) {
      parts.push(character.visualSignature.distinctiveFeature);
    }

    return parts.join(", ");
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: CONVERSION DEPUIS STRUCTURED PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Convertit un StructuredPrompt en JsonStandard
 */
export function structuredPromptToJsonStandard(
  prompt: StructuredPrompt,
  universeConfig: UniverseConfig,
  characters: Map<string, Character>,
  locations: Map<string, Location>
): JsonStandard {
  const builder = new JsonStandardBuilder(universeConfig);

  builder.setGoal(prompt.goal);

  // Ajouter les sujets
  for (const subject of prompt.subjects) {
    const character = characters.get(subject.id);
    if (character) {
      builder.addCharacter(character, subject.priority, {
        pose: subject.pose,
        expression: subject.expression,
      });
    }
  }

  // Définir le lieu
  if (prompt.scene.locationId) {
    const location = locations.get(prompt.scene.locationId);
    if (location) {
      builder.setLocation(location, {
        timeOfDay: prompt.scene.timeOfDay,
        weather: prompt.scene.weather,
        mood: prompt.scene.mood,
      });
    }
  }

  // Composition
  builder.setComposition({
    framing: prompt.composition.framing,
    focusPoint: prompt.composition.focusPoint,
    depthOfField: prompt.composition.depthOfField,
  });

  // Caméra
  builder.setCamera({
    angle: prompt.camera.angle,
    lens: prompt.camera.lens,
    movement: prompt.camera.movement,
  });

  // Éclairage
  builder.setLighting({
    type: prompt.lighting.type,
    keyLight: prompt.lighting.keyLight,
    fillLight: prompt.lighting.fillLight,
    rimLight: prompt.lighting.rimLight,
  });

  return builder.build();
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: PRESETS DE CAMÉRA (Génériques)
// ═══════════════════════════════════════════════════════════════════════════════

export const CAMERA_ANGLE_PRESETS: Record<string, { name: string; promptModifier: string }> = {
  // Angles standards
  eye_level: { name: "Eye Level", promptModifier: "eye level shot, straight on camera angle" },
  low_angle: { name: "Low Angle", promptModifier: "low angle shot, looking up, hero shot" },
  high_angle: { name: "High Angle", promptModifier: "high angle shot, looking down" },
  dutch_angle: { name: "Dutch Angle", promptModifier: "dutch angle, tilted camera, dramatic" },
  birds_eye: { name: "Bird's Eye", promptModifier: "bird's eye view, top down, overhead" },
  worms_eye: { name: "Worm's Eye", promptModifier: "worm's eye view, extreme low angle" },

  // POV
  pov: { name: "POV", promptModifier: "point of view shot, first person perspective" },
  over_shoulder: { name: "Over Shoulder", promptModifier: "over the shoulder shot, OTS" },

  // Profils
  profile: { name: "Profile", promptModifier: "profile shot, side view, 90 degree angle" },
  three_quarter: { name: "3/4 View", promptModifier: "three quarter view, 45 degree angle" },

  // Cadrages
  extreme_close: { name: "Extreme Close-up", promptModifier: "extreme close-up, macro, detail shot" },
  close_up: { name: "Close-up", promptModifier: "close-up shot, face detail" },
  medium_close: { name: "Medium Close", promptModifier: "medium close-up, chest up" },
  medium: { name: "Medium Shot", promptModifier: "medium shot, waist up" },
  medium_wide: { name: "Medium Wide", promptModifier: "medium wide shot, knee up" },
  wide: { name: "Wide Shot", promptModifier: "wide shot, full body, establishing" },
  extreme_wide: { name: "Extreme Wide", promptModifier: "extreme wide shot, landscape, epic" },
};

export const LIGHTING_PRESETS: Record<string, Partial<JsonStandardLighting>> = {
  dramatic: {
    type: "dramatic",
    keyLight: "strong directional key light with harsh shadows",
    fillLight: "minimal fill, high contrast",
    rimLight: "bright rim light for separation",
  },
  soft: {
    type: "soft",
    keyLight: "diffused soft key light",
    fillLight: "gentle fill light, low contrast",
    rimLight: "subtle rim light",
  },
  natural: {
    type: "natural",
    keyLight: "natural daylight",
    fillLight: "ambient bounce light",
  },
  moody: {
    type: "moody",
    keyLight: "low key lighting, selective illumination",
    fillLight: "deep shadows, mysterious",
    rimLight: "subtle edge lighting",
  },
  golden_hour: {
    type: "golden hour",
    keyLight: "warm golden sunlight",
    fillLight: "warm ambient fill",
    rimLight: "golden rim highlights",
  },
  night: {
    type: "night",
    keyLight: "moonlight or artificial light source",
    fillLight: "very dark, minimal",
    practical: "practical lights in scene",
  },
};
