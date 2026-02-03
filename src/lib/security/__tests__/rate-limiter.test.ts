import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  getRequestIdentifier,
  RATE_LIMIT_CONFIGS,
  type RateLimitConfig,
} from "../rate-limiter";

describe("Rate Limiter", () => {
  const testConfig: RateLimitConfig = {
    maxRequests: 3,
    windowMs: 1000, // 1 second window for fast tests
    authenticatedMaxRequests: 5,
  };

  describe("checkRateLimit", () => {
    it("should allow requests under the limit", () => {
      const identifier = `test-user-${Date.now()}`;

      const result1 = checkRateLimit(identifier, testConfig);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = checkRateLimit(identifier, testConfig);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);

      const result3 = checkRateLimit(identifier, testConfig);
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it("should block requests over the limit", () => {
      const identifier = `test-user-block-${Date.now()}`;

      // Use up all requests
      for (let i = 0; i < 3; i++) {
        checkRateLimit(identifier, testConfig);
      }

      // This should be blocked
      const result = checkRateLimit(identifier, testConfig);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it("should use higher limit for authenticated users", () => {
      const identifier = `test-auth-user-${Date.now()}`;

      // Authenticated users get 5 requests
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(identifier, testConfig, true);
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked
      const result = checkRateLimit(identifier, testConfig, true);
      expect(result.allowed).toBe(false);
    });

    it("should reset after window expires", async () => {
      const identifier = `test-reset-${Date.now()}`;
      const shortConfig: RateLimitConfig = {
        maxRequests: 1,
        windowMs: 50, // 50ms window
      };

      // First request allowed
      const result1 = checkRateLimit(identifier, shortConfig);
      expect(result1.allowed).toBe(true);

      // Second request blocked
      const result2 = checkRateLimit(identifier, shortConfig);
      expect(result2.allowed).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Request should be allowed again
      const result3 = checkRateLimit(identifier, shortConfig);
      expect(result3.allowed).toBe(true);
    });
  });

  describe("getRequestIdentifier", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name === "x-forwarded-for") return "192.168.1.100, 10.0.0.1";
            return null;
          },
        },
      } as unknown as Request;

      const identifier = getRequestIdentifier(mockRequest);
      expect(identifier).toBe("192.168.1.100");
    });

    it("should include user ID when provided", () => {
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name === "x-forwarded-for") return "192.168.1.100";
            return null;
          },
        },
      } as unknown as Request;

      const identifier = getRequestIdentifier(mockRequest, "user-123");
      expect(identifier).toBe("user-123:192.168.1.100");
    });

    it("should return 'unknown' when no IP available", () => {
      const mockRequest = {
        headers: {
          get: () => null,
        },
      } as unknown as Request;

      const identifier = getRequestIdentifier(mockRequest);
      expect(identifier).toBe("unknown");
    });
  });

  describe("RATE_LIMIT_CONFIGS", () => {
    it("should have standard config", () => {
      expect(RATE_LIMIT_CONFIGS.standard).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.standard.maxRequests).toBeGreaterThan(0);
    });

    it("should have generation config with lower limits", () => {
      expect(RATE_LIMIT_CONFIGS.generation).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.generation.maxRequests).toBeLessThan(
        RATE_LIMIT_CONFIGS.standard.maxRequests
      );
    });

    it("should have auth config with strict limits", () => {
      expect(RATE_LIMIT_CONFIGS.auth).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.auth.maxRequests).toBeLessThanOrEqual(10);
    });
  });
});
