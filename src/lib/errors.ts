/**
 * MOOSTIK - Centralized Error Handling
 *
 * Ce module fournit un système d'erreurs typées pour améliorer
 * la gestion des erreurs et le debugging dans l'application.
 */

// ============================================================================
// BASE ERROR CLASSES
// ============================================================================

export class MoostikError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "MoostikError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

// ============================================================================
// SPECIFIC ERROR TYPES
// ============================================================================

export class ValidationError extends MoostikError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends MoostikError {
  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" not found`, "NOT_FOUND", 404, {
      resource,
      id,
    });
    this.name = "NotFoundError";
  }
}

export class StorageError extends MoostikError {
  constructor(operation: string, path: string, originalError?: Error) {
    super(
      `Storage ${operation} failed for path: ${path}`,
      "STORAGE_ERROR",
      500,
      {
        operation,
        path,
        originalError: originalError?.message,
      }
    );
    this.name = "StorageError";
  }
}

export class ReplicateError extends MoostikError {
  public readonly retryable: boolean;

  constructor(
    message: string,
    code: string,
    retryable: boolean = false,
    details?: Record<string, unknown>
  ) {
    super(message, code, 502, details);
    this.name = "ReplicateError";
    this.retryable = retryable;
  }
}

export class RateLimitError extends ReplicateError {
  public readonly retryAfter: number;

  constructor(retryAfter: number = 60) {
    super(
      `Rate limit exceeded. Retry after ${retryAfter} seconds`,
      "RATE_LIMIT",
      true,
      { retryAfter }
    );
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class PathTraversalError extends MoostikError {
  constructor(path: string) {
    super(
      `Invalid path detected: potential path traversal attempt`,
      "PATH_TRAVERSAL",
      403,
      { path }
    );
    this.name = "PathTraversalError";
  }
}

export class ConfigurationError extends MoostikError {
  constructor(variable: string) {
    super(
      `Missing or invalid configuration: ${variable}`,
      "CONFIG_ERROR",
      500,
      { variable }
    );
    this.name = "ConfigurationError";
  }
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Type guard pour vérifier si une erreur est une MoostikError
 */
export function isMoostikError(error: unknown): error is MoostikError {
  return error instanceof MoostikError;
}

/**
 * Extrait un message d'erreur sécurisé pour l'utilisateur
 */
export function getErrorMessage(error: unknown): string {
  if (isMoostikError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

/**
 * Extrait le code d'erreur HTTP
 */
export function getStatusCode(error: unknown): number {
  if (isMoostikError(error)) {
    return error.statusCode;
  }
  return 500;
}

/**
 * Crée une réponse d'erreur standardisée pour les API routes
 */
export function createErrorResponse(error: unknown): {
  error: string;
  code: string;
  details?: Record<string, unknown>;
} {
  if (isMoostikError(error)) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
    };
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  return {
    error: message,
    code: "INTERNAL_ERROR",
  };
}

/**
 * Wrapper pour les handlers API avec gestion d'erreurs centralisée
 */
export function withErrorHandling<T>(
  handler: () => Promise<T>,
  context: string
): Promise<T> {
  return handler().catch((error) => {
    console.error(`[${context}] Error:`, error);
    throw error;
  });
}
