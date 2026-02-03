/**
 * MOOSTIK Security Module
 * Centralized security utilities
 */

export {
  checkRateLimit,
  getRequestIdentifier,
  addRateLimitHeaders,
  createRateLimitResponse,
  RATE_LIMIT_CONFIGS,
  type RateLimitConfig,
  type RateLimitResult,
} from "./rate-limiter";

export {
  verifyAuth,
  requireAuth,
  requireAdmin,
  requireRole,
  optionalAuth,
  checkCredits,
  deductCredits,
  type AuthResult,
  type CreditCheckResult,
} from "./auth-guard";
