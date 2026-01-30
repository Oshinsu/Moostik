/**
 * MOOSTIK - Retry & Resilience Utilities
 *
 * Ce module fournit des mécanismes de retry robustes
 * avec exponential backoff pour les appels API.
 */

import { ReplicateError, RateLimitError } from "./errors";

// ============================================================================
// TYPES
// ============================================================================

interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelay?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelay?: number;
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Add random jitter to delay (default: true) */
  jitter?: boolean;
  /** Function to determine if error is retryable */
  isRetryable?: (error: unknown) => boolean;
  /** Callback called on each retry */
  onRetry?: (attempt: number, error: unknown, delay: number) => void;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, "signal" | "onRetry" | "isRetryable">> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
};

// ============================================================================
// CORE RETRY FUNCTION
// ============================================================================

/**
 * Exécute une fonction avec retry et exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;
  let attempt = 0;

  while (attempt <= opts.maxRetries) {
    // Check for cancellation
    if (opts.signal?.aborted) {
      throw new Error("Operation cancelled");
    }

    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt++;

      // Check if we should retry
      const shouldRetry =
        attempt <= opts.maxRetries &&
        (opts.isRetryable ? opts.isRetryable(error) : isDefaultRetryable(error));

      if (!shouldRetry) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      let delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      );

      // Handle rate limit specific delay
      if (error instanceof RateLimitError) {
        delay = Math.max(delay, error.retryAfter * 1000);
      }

      // Add jitter
      if (opts.jitter) {
        delay = delay * (0.5 + Math.random());
      }

      // Notify about retry
      opts.onRetry?.(attempt, error, delay);

      // Wait before retrying
      await sleep(delay, opts.signal);
    }
  }

  throw lastError || new Error("Retry failed");
}

/**
 * Version avec résultat détaillé
 */
export async function withRetryResult<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const startTime = Date.now();
  let attempts = 0;

  const wrappedFn = async () => {
    attempts++;
    return fn();
  };

  try {
    const result = await withRetry(wrappedFn, options);
    return {
      success: true,
      result,
      attempts,
      totalTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      attempts,
      totalTime: Date.now() - startTime,
    };
  }
}

// ============================================================================
// REPLICATE-SPECIFIC RETRY
// ============================================================================

/**
 * Configuration optimisée pour les appels Replicate
 */
export const REPLICATE_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelay: 2000, // 2 secondes pour éviter rate limiting
  maxDelay: 60000, // 1 minute max
  backoffMultiplier: 2,
  jitter: true,
  isRetryable: isReplicateRetryable,
  onRetry: (attempt, error, delay) => {
    console.log(
      `[Replicate] Retry attempt ${attempt} after ${Math.round(delay)}ms:`,
      error instanceof Error ? error.message : error
    );
  },
};

/**
 * Exécute un appel Replicate avec retry optimisé
 */
export async function withReplicateRetry<T>(
  fn: () => Promise<T>,
  customOptions?: Partial<RetryOptions>
): Promise<T> {
  return withRetry(fn, { ...REPLICATE_RETRY_OPTIONS, ...customOptions });
}

/**
 * Détermine si une erreur Replicate est retryable
 */
function isReplicateRetryable(error: unknown): boolean {
  // Rate limit errors sont toujours retryables
  if (error instanceof RateLimitError) {
    return true;
  }

  // Errors réseau
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }

  // Errors HTTP temporaires
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Retryable HTTP status codes (via message)
    if (
      message.includes("429") || // Too Many Requests
      message.includes("500") || // Internal Server Error
      message.includes("502") || // Bad Gateway
      message.includes("503") || // Service Unavailable
      message.includes("504") || // Gateway Timeout
      message.includes("timeout") ||
      message.includes("econnreset") ||
      message.includes("econnrefused") ||
      message.includes("network")
    ) {
      return true;
    }
  }

  // ReplicateError avec flag retryable
  if (error instanceof ReplicateError && error.retryable) {
    return true;
  }

  return false;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Détermine si une erreur est retryable par défaut
 */
function isDefaultRetryable(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("timeout") ||
      message.includes("econnreset") ||
      message.includes("econnrefused") ||
      message.includes("network") ||
      message.includes("429") ||
      message.includes("503")
    );
  }
  return false;
}

/**
 * Sleep avec support d'annulation
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Operation cancelled"));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new Error("Operation cancelled"));
    });
  });
}

// ============================================================================
// BATCH PROCESSING WITH RETRY
// ============================================================================

interface BatchOptions<T, R> {
  /** Items to process */
  items: T[];
  /** Processing function */
  processor: (item: T, index: number) => Promise<R>;
  /** Maximum concurrent operations (default: 2) */
  concurrency?: number;
  /** Delay between batches in ms (default: 1000) */
  batchDelay?: number;
  /** Retry options for each item */
  retryOptions?: RetryOptions;
  /** Called on each item completion */
  onProgress?: (completed: number, total: number, result: R | Error) => void;
  /** Continue on error (default: true) */
  continueOnError?: boolean;
}

interface BatchResult<R> {
  successful: R[];
  failed: { index: number; error: Error }[];
  totalTime: number;
}

/**
 * Traite un batch d'items avec concurrence limitée et retry
 */
export async function processBatch<T, R>(
  options: BatchOptions<T, R>
): Promise<BatchResult<R>> {
  const {
    items,
    processor,
    concurrency = 2,
    batchDelay = 1000,
    retryOptions,
    onProgress,
    continueOnError = true,
  } = options;

  const startTime = Date.now();
  const results: BatchResult<R> = {
    successful: [],
    failed: [],
    totalTime: 0,
  };

  let completed = 0;

  // Process in batches
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);

    const batchPromises = batch.map(async (item, batchIndex) => {
      const index = i + batchIndex;

      try {
        const result = retryOptions
          ? await withRetry(() => processor(item, index), retryOptions)
          : await processor(item, index);

        results.successful.push(result);
        completed++;
        onProgress?.(completed, items.length, result);
        return { success: true as const, result };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        results.failed.push({ index, error: err });
        completed++;
        onProgress?.(completed, items.length, err);

        if (!continueOnError) {
          throw err;
        }

        return { success: false as const, error: err };
      }
    });

    await Promise.all(batchPromises);

    // Delay between batches (except for last batch)
    if (i + concurrency < items.length && batchDelay > 0) {
      await sleep(batchDelay);
    }
  }

  results.totalTime = Date.now() - startTime;
  return results;
}

// ============================================================================
// CIRCUIT BREAKER (Simple Implementation)
// ============================================================================

interface CircuitBreakerOptions {
  /** Failure threshold before opening circuit (default: 5) */
  failureThreshold?: number;
  /** Time to wait before trying again in ms (default: 30000) */
  resetTimeout?: number;
}

type CircuitState = "closed" | "open" | "half-open";

class CircuitBreaker {
  private state: CircuitState = "closed";
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly options: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions = {}) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      resetTimeout: options.resetTimeout ?? 30000,
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      // Check if we should try again
      if (Date.now() - this.lastFailureTime > this.options.resetTimeout) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = "closed";
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = "open";
      console.warn(
        `[CircuitBreaker] Circuit opened after ${this.failureCount} failures`
      );
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = "closed";
    this.failureCount = 0;
  }
}

export { CircuitBreaker };
export type { CircuitBreakerOptions, CircuitState, RetryOptions, RetryResult, BatchOptions, BatchResult };
