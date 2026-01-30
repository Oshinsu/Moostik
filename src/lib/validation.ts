/**
 * MOOSTIK - Validation & Security Utilities
 *
 * Ce module fournit des fonctions de validation et de sécurité
 * pour protéger l'application contre les entrées malveillantes.
 */

import path from "path";
import { ValidationError, PathTraversalError } from "./errors";

// ============================================================================
// PATH SECURITY
// ============================================================================

/**
 * Valide et nettoie un identifiant (episode, shot, character, location)
 * Prévient les injections de path traversal
 */
export function validateId(id: string, type: string): string {
  if (!id || typeof id !== "string") {
    throw new ValidationError(`Invalid ${type} ID: must be a non-empty string`);
  }

  // Supprimer les espaces
  const trimmed = id.trim();

  // Vérifier les tentatives de path traversal
  if (
    trimmed.includes("..") ||
    trimmed.includes("/") ||
    trimmed.includes("\\") ||
    trimmed.includes("\0")
  ) {
    throw new PathTraversalError(id);
  }

  // Valider le format (alphanumérique, tirets, underscores)
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(trimmed)) {
    throw new ValidationError(
      `Invalid ${type} ID: contains invalid characters. Only alphanumeric, dashes, and underscores allowed.`,
      { id, type }
    );
  }

  // Limiter la longueur
  if (trimmed.length > 100) {
    throw new ValidationError(`Invalid ${type} ID: exceeds maximum length of 100 characters`);
  }

  return trimmed;
}

/**
 * Valide un chemin de fichier et s'assure qu'il reste dans le répertoire autorisé
 */
export function validatePath(
  filePath: string,
  allowedBasePaths: string[]
): string {
  if (!filePath || typeof filePath !== "string") {
    throw new ValidationError("Invalid path: must be a non-empty string");
  }

  // Résoudre le chemin absolu
  const resolved = path.resolve(filePath);

  // Vérifier que le chemin est dans un des répertoires autorisés
  const isAllowed = allowedBasePaths.some((basePath) => {
    const resolvedBase = path.resolve(basePath);
    return resolved.startsWith(resolvedBase + path.sep) || resolved === resolvedBase;
  });

  if (!isAllowed) {
    throw new PathTraversalError(filePath);
  }

  return resolved;
}

/**
 * Crée un chemin sécurisé en validant chaque segment
 */
export function createSafePath(basePath: string, ...segments: string[]): string {
  // Valider chaque segment
  const validatedSegments = segments.map((segment, index) =>
    validateId(segment, `path segment ${index}`)
  );

  // Construire le chemin
  const fullPath = path.join(basePath, ...validatedSegments);

  // Vérifier que le résultat est bien dans le basePath
  return validatePath(fullPath, [basePath]);
}

// ============================================================================
// INPUT VALIDATION
// ============================================================================

/**
 * Valide une chaîne de caractères
 */
export function validateString(
  value: unknown,
  fieldName: string,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    pattern?: RegExp;
  } = {}
): string {
  const { minLength = 0, maxLength = 10000, required = true, pattern } = options;

  if (value === undefined || value === null) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return "";
  }

  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  if (required && trimmed.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }

  if (trimmed.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters`,
      { minLength, actual: trimmed.length }
    );
  }

  if (trimmed.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must not exceed ${maxLength} characters`,
      { maxLength, actual: trimmed.length }
    );
  }

  if (pattern && !pattern.test(trimmed)) {
    throw new ValidationError(`${fieldName} has an invalid format`);
  }

  return trimmed;
}

/**
 * Valide un nombre
 */
export function validateNumber(
  value: unknown,
  fieldName: string,
  options: {
    min?: number;
    max?: number;
    integer?: boolean;
    required?: boolean;
  } = {}
): number {
  const { min, max, integer = false, required = true } = options;

  if (value === undefined || value === null) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return 0;
  }

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (typeof num !== "number" || isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }

  if (integer && !Number.isInteger(num)) {
    throw new ValidationError(`${fieldName} must be an integer`);
  }

  if (min !== undefined && num < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`, { min, actual: num });
  }

  if (max !== undefined && num > max) {
    throw new ValidationError(`${fieldName} must not exceed ${max}`, { max, actual: num });
  }

  return num;
}

/**
 * Valide un tableau
 */
export function validateArray<T>(
  value: unknown,
  fieldName: string,
  itemValidator?: (item: unknown, index: number) => T,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  } = {}
): T[] {
  const { minLength = 0, maxLength = 1000, required = true } = options;

  if (value === undefined || value === null) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return [];
  }

  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`);
  }

  if (value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must contain at least ${minLength} items`,
      { minLength, actual: value.length }
    );
  }

  if (value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must not contain more than ${maxLength} items`,
      { maxLength, actual: value.length }
    );
  }

  if (itemValidator) {
    return value.map((item, index) => {
      try {
        return itemValidator(item, index);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError(`${fieldName}[${index}]: ${error.message}`, error.details);
        }
        throw error;
      }
    });
  }

  return value as T[];
}

/**
 * Valide une URL
 */
export function validateUrl(
  value: unknown,
  fieldName: string,
  options: {
    required?: boolean;
    allowLocal?: boolean;
    allowedProtocols?: string[];
  } = {}
): string {
  const {
    required = true,
    allowLocal = true,
    allowedProtocols = ["http:", "https:", "data:"],
  } = options;

  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return "";
  }

  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  // Autoriser les URLs locales
  if (allowLocal && (trimmed.startsWith("/api/") || trimmed.startsWith("/output/"))) {
    return trimmed;
  }

  // Valider l'URL
  try {
    const url = new URL(trimmed);
    if (!allowedProtocols.includes(url.protocol)) {
      throw new ValidationError(
        `${fieldName} must use one of these protocols: ${allowedProtocols.join(", ")}`
      );
    }
  } catch {
    throw new ValidationError(`${fieldName} is not a valid URL`);
  }

  return trimmed;
}

// ============================================================================
// ENTITY VALIDATION
// ============================================================================

/**
 * Valide les données d'un épisode
 */
export function validateEpisodeInput(data: unknown): {
  number: number;
  title: string;
  description: string;
} {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Invalid episode data");
  }

  const obj = data as Record<string, unknown>;

  return {
    number: validateNumber(obj.number, "Episode number", {
      min: 0,
      max: 999,
      integer: true,
    }),
    title: validateString(obj.title, "Episode title", {
      minLength: 1,
      maxLength: 200,
    }),
    description: validateString(obj.description, "Episode description", {
      required: false,
      maxLength: 5000,
    }),
  };
}

/**
 * Valide les données d'un shot
 */
export function validateShotInput(data: unknown): {
  name: string;
  description: string;
  characterIds: string[];
  locationIds: string[];
} {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Invalid shot data");
  }

  const obj = data as Record<string, unknown>;

  return {
    name: validateString(obj.name, "Shot name", {
      minLength: 1,
      maxLength: 200,
    }),
    description: validateString(obj.description, "Shot description", {
      required: false,
      maxLength: 5000,
    }),
    characterIds: validateArray(
      obj.characterIds,
      "Character IDs",
      (item) => validateId(item as string, "character"),
      { required: false, maxLength: 20 }
    ),
    locationIds: validateArray(
      obj.locationIds,
      "Location IDs",
      (item) => validateId(item as string, "location"),
      { required: false, maxLength: 10 }
    ),
  };
}

// ============================================================================
// SANITIZATION
// ============================================================================

/**
 * Échappe les caractères HTML dangereux
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

/**
 * Supprime les caractères de contrôle
 */
export function sanitizeString(str: string): string {
  // Supprime les caractères de contrôle sauf newline et tab
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}
