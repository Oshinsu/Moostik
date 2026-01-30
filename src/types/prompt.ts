/**
 * MOOSTIK - Types Prompt & Camera
 */

// ============================================================================
// CAMERA ANGLES
// ============================================================================

export type CameraAngle =
  | "extreme_wide"
  | "wide"
  | "medium"
  | "close_up"
  | "extreme_close_up"
  | "low_angle"
  | "high_angle"
  | "dutch_angle"
  | "pov"
  | "macro";

// ============================================================================
// MOOSTIK PROMPT STRUCTURE
// ============================================================================

export interface MoostikPrompt {
  task: string;
  deliverable: string;
  goal: string;
  invariants: string[];
  foreground: {
    subjects: string[];
    micro_detail: string[];
    emotion?: string;
  };
  midground: {
    environment?: string[];
    micro_city_architecture?: string[];
    action?: string[];
    impact_gore_stylized?: string[];
    threat?: string[];
  };
  background: {
    location?: string[];
    human_threat?: string[];
    martinique_cues?: string[];
    martinique_cues_abstract?: string[];
  };
  lighting: {
    key: string;
    fill: string;
    effects: string;
  };
  camera: {
    framing: string;
    lens: string;
    movement: string;
    depth_of_field: string;
  };
  grade: {
    look: string;
    mood: string;
  };
  negative_prompt: string[];
}
