/**
 * MOOSTIK - Helpers pour la génération de prompts
 */

import type { CameraAngle, MoostikPrompt } from "@/types";
import { MOOSTIK_INVARIANTS, MOOSTIK_NEGATIVE_PROMPT, CAMERA_ANGLE_PROMPTS } from "./index";

// ============================================================================
// PROMPT TO TEXT - Conversion du prompt structuré en texte pour l'API
// ============================================================================

export function promptToText(prompt: MoostikPrompt, cameraAngle?: CameraAngle): string {
  const parts: string[] = [];
  
  // System prompt / Invariants
  parts.push("STYLE: Pixar-dark 3D feature film, ILM-grade, démoniaque mignon aesthetic.");
  parts.push("MOOSTIK: Microscopic anthropomorphic mosquitoes, large amber/orange eyes, translucent wings with red veins, proboscis only weapon.");
  parts.push("ARCHITECTURE: Renaissance fantastique Moostik, NO human architecture, bioluminescent amber/crimson lanterns.");
  parts.push("TECH: Medieval fantasy ONLY, no modern weapons/electricity/machines.");
  
  // Task and goal
  parts.push(prompt.task);
  parts.push(prompt.goal);
  
  // Foreground
  if (prompt.foreground?.subjects?.length) {
    parts.push(`FOREGROUND: ${prompt.foreground.subjects.join(". ")}`);
  }
  if (prompt.foreground?.micro_detail?.length) {
    parts.push(`MICRO DETAILS: ${prompt.foreground.micro_detail.join(". ")}`);
  }
  if (prompt.foreground?.emotion) {
    parts.push(`EMOTION: ${prompt.foreground.emotion}`);
  }
  
  // Midground
  if (prompt.midground?.environment?.length) {
    parts.push(`ENVIRONMENT: ${prompt.midground.environment.join(". ")}`);
  }
  if (prompt.midground?.micro_city_architecture?.length) {
    parts.push(`MOOSTIK ARCHITECTURE: ${prompt.midground.micro_city_architecture.join(". ")}`);
  }
  if (prompt.midground?.action?.length) {
    parts.push(`ACTION: ${prompt.midground.action.join(". ")}`);
  }
  if (prompt.midground?.threat?.length) {
    parts.push(`THREAT: ${prompt.midground.threat.join(". ")}`);
  }
  
  // Background
  if (prompt.background?.location?.length) {
    parts.push(`LOCATION: ${prompt.background.location.join(". ")}`);
  }
  if (prompt.background?.human_threat?.length) {
    parts.push(`HUMAN THREAT: ${prompt.background.human_threat.join(". ")}`);
  }
  
  // Lighting
  parts.push(`LIGHTING: Key: ${prompt.lighting.key}. Fill: ${prompt.lighting.fill}. Effects: ${prompt.lighting.effects}`);
  
  // Camera
  if (cameraAngle) {
    const anglePrompt = CAMERA_ANGLE_PROMPTS[cameraAngle];
    parts.push(`CAMERA: ${anglePrompt}. ${prompt.camera.framing}. Lens: ${prompt.camera.lens}. DOF: ${prompt.camera.depth_of_field}`);
  } else {
    parts.push(`CAMERA: ${prompt.camera.framing}. Lens: ${prompt.camera.lens}. DOF: ${prompt.camera.depth_of_field}`);
  }
  
  // Grade
  parts.push(`GRADE: ${prompt.grade.look}. Mood: ${prompt.grade.mood}`);
  
  // Negative prompt
  const negatives = [
    ...MOOSTIK_NEGATIVE_PROMPT,
    ...(prompt.negative_prompt || [])
  ];
  parts.push(`AVOID: ${negatives.join(", ")}`);
  
  return parts.join(" | ");
}

// ============================================================================
// EMPTY PROMPT FACTORY
// ============================================================================

export function createEmptyPrompt(): MoostikPrompt {
  return {
    task: "",
    deliverable: "One single cinematic frame, Pixar-dark 3D, ILM-grade VFX, 8K micro-textures",
    goal: "",
    invariants: [...MOOSTIK_INVARIANTS],
    foreground: {
      subjects: [],
      micro_detail: [],
      emotion: ""
    },
    midground: {
      environment: [],
      micro_city_architecture: [],
      action: [],
      threat: []
    },
    background: {
      location: [],
      human_threat: [],
      martinique_cues: []
    },
    lighting: {
      key: "Warm bioluminescent amber/crimson lantern light",
      fill: "Cool ambient bounce",
      effects: "Volumetric atmosphere, depth haze"
    },
    camera: {
      framing: "Cinematic composition",
      lens: "Macro equivalent",
      movement: "Static keyframe",
      depth_of_field: "Shallow focus on subject"
    },
    grade: {
      look: "Pixar-dark cinematic, high contrast, rich blacks",
      mood: "Démoniaque mignon"
    },
    negative_prompt: [...MOOSTIK_NEGATIVE_PROMPT]
  };
}

// ============================================================================
// SHOT & VARIATION FACTORIES
// ============================================================================

import type { Shot, Variation, SceneType } from "@/types";

export function createShot(
  number: number,
  name: string,
  description: string,
  sceneType: SceneType,
  prompt: MoostikPrompt,
  characterIds: string[] = [],
  locationIds: string[] = []
): Shot {
  const id = `shot-${number}-${Date.now()}`;
  const now = new Date().toISOString();
  
  return {
    id,
    number,
    name,
    description,
    sceneType,
    prompt,
    variations: [],
    status: "pending",
    createdAt: now,
    updatedAt: now,
    characterIds,
    locationIds
  };
}

export function createVariation(cameraAngle: CameraAngle): Variation {
  return {
    id: `var-${cameraAngle}-${Date.now()}`,
    cameraAngle,
    status: "pending"
  };
}

export function createShotVariations(shot: Shot, angles: CameraAngle[]): Variation[] {
  return angles.map(angle => createVariation(angle));
}
