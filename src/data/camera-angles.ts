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

// Pour l'UI - liste des angles avec labels et descriptions
export const CAMERA_ANGLES: {
  angle: CameraAngle;
  label: string;
  description: string;
}[] = [
  { angle: "extreme_wide", label: "Extreme Wide", description: "Plan très large, établissement" },
  { angle: "wide", label: "Wide", description: "Plan large, scène complète" },
  { angle: "medium", label: "Medium", description: "Plan moyen, focus émotionnel" },
  { angle: "close_up", label: "Close Up", description: "Gros plan, détail intime" },
  { angle: "extreme_close_up", label: "Extreme Close Up", description: "Très gros plan, émotion max" },
  { angle: "low_angle", label: "Low Angle", description: "Contre-plongée, puissance" },
  { angle: "high_angle", label: "High Angle", description: "Plongée, vulnérabilité" },
  { angle: "dutch_angle", label: "Dutch Angle", description: "Angle néerlandais, tension" },
  { angle: "pov", label: "POV", description: "Point de vue subjectif" },
  { angle: "macro", label: "Macro", description: "Macro, échelle microscopique" },
];
