/**
 * MOOSTIK Prompt Validation
 * Validates prompts against the JSON-MOOSTIK Standard
 */

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  score: number; // 0-100 quality score
}

// ============================================================================
// REQUIRED FIELDS
// ============================================================================

const REQUIRED_META_FIELDS = [
  "model_version",
  "task_type",
  "project",
  "asset_id",
  "scene_intent",
] as const;

const REQUIRED_SCENE_GRAPH_FIELDS = ["style_bible", "environment"] as const;

const REQUIRED_STYLE_BIBLE_FIELDS = ["usp_core", "look", "palette"] as const;

const REQUIRED_ENVIRONMENT_FIELDS = ["space", "gigantism_cues"] as const;

const VALID_TASK_TYPES = [
  "cinematic_keyframe",
  "character_sheet",
  "location_establishing",
  "action_shot",
  "ultra_cinematic_environment_keyframe",
] as const;

const VALID_MODEL_VERSIONS = ["nano-banana-2-pro", "flux-2-pro", "flux-2-max", "imagen-4", "seedream-4.5", "ideogram-v3-turbo", "recraft-v3"] as const;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates a prompt against the JSON-MOOSTIK Standard
 */
export function validateMoostikPrompt(prompt: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!prompt || typeof prompt !== "object") {
    return {
      valid: false,
      errors: [{ field: "root", message: "Prompt must be an object", severity: "error" }],
      warnings: [],
      score: 0,
    };
  }

  const p = prompt as Record<string, unknown>;

  // Validate meta
  if (!p.meta) {
    errors.push({ field: "meta", message: "Missing required field: meta", severity: "error" });
  } else {
    validateMeta(p.meta, errors, warnings);
  }

  // Validate scene_graph
  if (!p.scene_graph) {
    errors.push({
      field: "scene_graph",
      message: "Missing required field: scene_graph",
      severity: "error",
    });
  } else {
    validateSceneGraph(p.scene_graph, errors, warnings);
  }

  // Validate parameters (optional but recommended)
  if (!p.parameters) {
    warnings.push({
      field: "parameters",
      message: "Missing parameters section (recommended)",
      severity: "warning",
    });
  } else {
    validateParameters(p.parameters, warnings);
  }

  // Validate prompt_text exists
  if (!p.prompt_text || typeof p.prompt_text !== "string") {
    errors.push({
      field: "prompt_text",
      message: "Missing or invalid prompt_text (must be a string)",
      severity: "error",
    });
  } else if ((p.prompt_text as string).length < 50) {
    warnings.push({
      field: "prompt_text",
      message: "prompt_text is very short (recommended: 50+ characters)",
      severity: "warning",
    });
  }

  // Calculate score
  const score = calculateScore(errors, warnings, p);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

function validateMeta(
  meta: unknown,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (typeof meta !== "object" || meta === null) {
    errors.push({ field: "meta", message: "meta must be an object", severity: "error" });
    return;
  }

  const m = meta as Record<string, unknown>;

  for (const field of REQUIRED_META_FIELDS) {
    if (!m[field]) {
      errors.push({
        field: `meta.${field}`,
        message: `Missing required field: meta.${field}`,
        severity: "error",
      });
    }
  }

  // Validate task_type
  if (m.task_type && !VALID_TASK_TYPES.includes(m.task_type as typeof VALID_TASK_TYPES[number])) {
    warnings.push({
      field: "meta.task_type",
      message: `Unknown task_type: ${m.task_type}. Valid types: ${VALID_TASK_TYPES.join(", ")}`,
      severity: "warning",
    });
  }

  // Validate model_version
  if (
    m.model_version &&
    !VALID_MODEL_VERSIONS.includes(m.model_version as typeof VALID_MODEL_VERSIONS[number])
  ) {
    warnings.push({
      field: "meta.model_version",
      message: `Unknown model_version: ${m.model_version}`,
      severity: "warning",
    });
  }
}

function validateSceneGraph(
  sceneGraph: unknown,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (typeof sceneGraph !== "object" || sceneGraph === null) {
    errors.push({
      field: "scene_graph",
      message: "scene_graph must be an object",
      severity: "error",
    });
    return;
  }

  const sg = sceneGraph as Record<string, unknown>;

  for (const field of REQUIRED_SCENE_GRAPH_FIELDS) {
    if (!sg[field]) {
      errors.push({
        field: `scene_graph.${field}`,
        message: `Missing required field: scene_graph.${field}`,
        severity: "error",
      });
    }
  }

  // Validate style_bible
  if (sg.style_bible && typeof sg.style_bible === "object") {
    const sb = sg.style_bible as Record<string, unknown>;
    for (const field of REQUIRED_STYLE_BIBLE_FIELDS) {
      if (!sb[field]) {
        errors.push({
          field: `scene_graph.style_bible.${field}`,
          message: `Missing required field: scene_graph.style_bible.${field}`,
          severity: "error",
        });
      }
    }

    // Validate palette is an array
    if (sb.palette && !Array.isArray(sb.palette)) {
      errors.push({
        field: "scene_graph.style_bible.palette",
        message: "palette must be an array",
        severity: "error",
      });
    }
  }

  // Validate environment
  if (sg.environment && typeof sg.environment === "object") {
    const env = sg.environment as Record<string, unknown>;
    for (const field of REQUIRED_ENVIRONMENT_FIELDS) {
      if (!env[field]) {
        errors.push({
          field: `scene_graph.environment.${field}`,
          message: `Missing required field: scene_graph.environment.${field}`,
          severity: "error",
        });
      }
    }

    // Validate gigantism_cues is an array
    if (env.gigantism_cues && !Array.isArray(env.gigantism_cues)) {
      errors.push({
        field: "scene_graph.environment.gigantism_cues",
        message: "gigantism_cues must be an array",
        severity: "error",
      });
    } else if (Array.isArray(env.gigantism_cues) && env.gigantism_cues.length === 0) {
      warnings.push({
        field: "scene_graph.environment.gigantism_cues",
        message: "gigantism_cues is empty (recommended: at least 2-3 cues)",
        severity: "warning",
      });
    }
  }

  // Validate camera (optional but recommended)
  if (!sg.camera) {
    warnings.push({
      field: "scene_graph.camera",
      message: "Missing camera configuration (recommended)",
      severity: "warning",
    });
  }

  // Validate lighting (optional but recommended)
  if (!sg.lighting) {
    warnings.push({
      field: "scene_graph.lighting",
      message: "Missing lighting configuration (recommended)",
      severity: "warning",
    });
  }
}

function validateParameters(parameters: unknown, warnings: ValidationError[]): void {
  if (typeof parameters !== "object" || parameters === null) {
    warnings.push({
      field: "parameters",
      message: "parameters must be an object",
      severity: "warning",
    });
    return;
  }

  const p = parameters as Record<string, unknown>;

  if (!p.aspect_ratio) {
    warnings.push({
      field: "parameters.aspect_ratio",
      message: "Missing aspect_ratio (recommended)",
      severity: "warning",
    });
  }

  if (!p.render_resolution) {
    warnings.push({
      field: "parameters.render_resolution",
      message: "Missing render_resolution (recommended)",
      severity: "warning",
    });
  }
}

function calculateScore(
  errors: ValidationError[],
  warnings: ValidationError[],
  prompt: Record<string, unknown>
): number {
  let score = 100;

  // Deduct for errors (major)
  score -= errors.length * 15;

  // Deduct for warnings (minor)
  score -= warnings.length * 5;

  // Bonus for optional fields
  if (prompt.parameters) score += 5;
  if (prompt.constraints) score += 5;
  if (prompt.negative_prompt) score += 5;

  // Bonus for rich content
  const promptText = prompt.prompt_text as string | undefined;
  if (promptText && promptText.length > 200) score += 5;
  if (promptText && promptText.length > 500) score += 5;

  return Math.max(0, Math.min(100, score));
}

// ============================================================================
// QUICK VALIDATION
// ============================================================================

/**
 * Quick check if a prompt has minimum required structure
 */
export function isValidPromptStructure(prompt: unknown): boolean {
  if (!prompt || typeof prompt !== "object") return false;

  const p = prompt as Record<string, unknown>;

  return !!(
    p.meta &&
    p.scene_graph &&
    (p.prompt_text || p.prompt)
  );
}

/**
 * Extract prompt text from various formats
 */
export function extractPromptText(prompt: unknown): string | null {
  if (!prompt || typeof prompt !== "object") return null;

  const p = prompt as Record<string, unknown>;

  if (typeof p.prompt_text === "string") return p.prompt_text;
  if (typeof p.prompt === "string") return p.prompt;

  return null;
}

// ============================================================================
// SANITIZATION
// ============================================================================

/**
 * Sanitize prompt text to remove potentially harmful content
 */
export function sanitizePromptText(text: string): string {
  return text
    // Remove potential injection attempts
    .replace(/\{[^}]*\}/g, "")
    .replace(/<[^>]*>/g, "")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();
}
