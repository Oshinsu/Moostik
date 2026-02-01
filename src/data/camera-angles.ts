/**
 * MOOSTIK - Camera Angles Data
 */

import type { CameraAngle } from "@/types/prompt";

// ============================================================================
// CAMERA ANGLES PROMPTS
// ============================================================================

export const CAMERA_ANGLE_PROMPTS: Record<CameraAngle, string> = {
  extreme_wide: "extreme wide shot, establishing, shows full environment scale",
  wide: "wide shot, full scene visible, character in environment",
  medium: "medium shot, character from waist up, emotional focus",
  close_up: "close-up shot, face and upper body, intimate emotional detail",
  extreme_close_up: "extreme close-up, eyes or specific detail, maximum emotion",
  low_angle: "low angle shot, looking up, subject appears powerful/imposing",
  high_angle: "high angle shot, looking down, subject appears vulnerable/small",
  dutch_angle: "dutch angle, tilted frame, creates unease/tension",
  pov: "POV shot, first-person perspective from character viewpoint",
  macro: "macro shot, extreme detail of tiny elements, shows microscopic scale"
};

// ============================================================================
// CAMERA ANGLES LABELS (FR)
// ============================================================================

/** Labels français pour les angles de caméra */
export const CAMERA_ANGLE_LABELS_FR: Record<string, string> = {
  extreme_wide: "Très Large",
  wide: "Large",
  medium: "Medium",
  close_up: "Gros Plan",
  extreme_close_up: "Très Gros Plan",
  low_angle: "Contre-plongée",
  high_angle: "Plongée",
  dutch_angle: "Angle Néerlandais",
  pov: "Point de Vue",
  macro: "Macro",
};

/**
 * Retourne le label français d'un angle de caméra
 * @param angle - Code de l'angle (ex: "extreme_wide")
 * @returns Label français ou l'angle original si non trouvé
 */
export function getCameraAngleLabel(angle: string): string {
  return CAMERA_ANGLE_LABELS_FR[angle] || angle;
}

// ============================================================================
// CAMERA ANGLES LIST (pour l'UI)
// ============================================================================

// Pour l'UI - liste des angles avec labels et descriptions
export const CAMERA_ANGLES: {
  angle: CameraAngle;
  label: string;
  labelFr: string;
  description: string;
}[] = [
  { angle: "extreme_wide", label: "Extreme Wide", labelFr: "Très Large", description: "Plan très large, établissement" },
  { angle: "wide", label: "Wide", labelFr: "Large", description: "Plan large, scène complète" },
  { angle: "medium", label: "Medium", labelFr: "Medium", description: "Plan moyen, focus émotionnel" },
  { angle: "close_up", label: "Close Up", labelFr: "Gros Plan", description: "Gros plan, détail intime" },
  { angle: "extreme_close_up", label: "Extreme Close Up", labelFr: "Très Gros Plan", description: "Très gros plan, émotion max" },
  { angle: "low_angle", label: "Low Angle", labelFr: "Contre-plongée", description: "Contre-plongée, puissance" },
  { angle: "high_angle", label: "High Angle", labelFr: "Plongée", description: "Plongée, vulnérabilité" },
  { angle: "dutch_angle", label: "Dutch Angle", labelFr: "Angle Néerlandais", description: "Angle néerlandais, tension" },
  { angle: "pov", label: "POV", labelFr: "Point de Vue", description: "Point de vue subjectif" },
  { angle: "macro", label: "Macro", labelFr: "Macro", description: "Macro, échelle microscopique" },
];
