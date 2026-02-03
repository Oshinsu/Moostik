/**
 * MOOSTIK Rate Limiter
 * In-memory rate limiting for API endpoints
 *
 * For production, consider using Redis-backed rate limiting
 */

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional: different limits for authenticated users */
  authenticatedMaxRequests?: number;
  /** Optional: skip rate limiting for certain IPs */
  skipIps?: string[];
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (for serverless, consider Redis or Upstash)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
const CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function cleanupOldEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
  lastCleanup = now;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  isAuthenticated: boolean = false
): RateLimitResult {
  cleanupOldEntries();

  const now = Date.now();
  const maxRequests = isAuthenticated && config.authenticatedMaxRequests
    ? config.authenticatedMaxRequests
    : config.maxRequests;

  const entry = rateLimitStore.get(identifier);

  // No existing entry or window expired
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  // Within window
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  // Increment count
  entry.count++;

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get identifier from request (IP + optional user ID)
 */
export function getRequestIdentifier(
  request: Request,
  userId?: string
): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";

  if (userId) {
    return `${userId}:${ip}`;
  }

  return ip;
}

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

export const RATE_LIMIT_CONFIGS = {
  /** Standard API endpoint: 100 req/min */
  standard: {
    maxRequests: 100,
    windowMs: 60 * 1000,
    authenticatedMaxRequests: 200,
  } satisfies RateLimitConfig,

  /** Generation endpoints: 20 req/min */
  generation: {
    maxRequests: 10,
    windowMs: 60 * 1000,
    authenticatedMaxRequests: 20,
  } satisfies RateLimitConfig,

  /** Auth endpoints: 5 req/min (prevent brute force) */
  auth: {
    maxRequests: 5,
    windowMs: 60 * 1000,
  } satisfies RateLimitConfig,

  /** Download endpoints: 50 req/min */
  download: {
    maxRequests: 30,
    windowMs: 60 * 1000,
    authenticatedMaxRequests: 50,
  } satisfies RateLimitConfig,

  /** Expensive operations: 5 req/hour */
  expensive: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
    authenticatedMaxRequests: 10,
  } satisfies RateLimitConfig,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", result.resetAt.toString());

  if (!result.allowed && result.retryAfter) {
    headers.set("Retry-After", result.retryAfter.toString());
  }
}

/**
 * Create a rate limited error response
 */
export function createRateLimitResponse(
  result: RateLimitResult
): Response {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  addRateLimitHeaders(headers, result);

  return new Response(
    JSON.stringify({
      error: "Too many requests",
      retryAfter: result.retryAfter,
      resetAt: new Date(result.resetAt).toISOString(),
    }),
    {
      status: 429,
      headers,
    }
  );
}
