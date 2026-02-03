import { describe, it, expect } from "vitest";
import {
  PLAN_TIER_MAP,
  getCanonicalPlanTier,
  CREDIT_COSTS,
  PLAN_DEFINITIONS,
  type CanonicalPlanTier,
  type UnifiedPlanTier,
} from "../unified";

describe("Unified Types", () => {
  describe("PLAN_TIER_MAP", () => {
    it("should map legacy 'creator' to 'starter'", () => {
      expect(PLAN_TIER_MAP.creator).toBe("starter");
    });

    it("should map legacy 'production' to 'pro'", () => {
      expect(PLAN_TIER_MAP.production).toBe("pro");
    });

    it("should preserve canonical plan names", () => {
      expect(PLAN_TIER_MAP.free).toBe("free");
      expect(PLAN_TIER_MAP.starter).toBe("starter");
      expect(PLAN_TIER_MAP.pro).toBe("pro");
      expect(PLAN_TIER_MAP.studio).toBe("studio");
      expect(PLAN_TIER_MAP.enterprise).toBe("enterprise");
    });
  });

  describe("getCanonicalPlanTier", () => {
    it("should return canonical tier for valid input", () => {
      expect(getCanonicalPlanTier("creator")).toBe("starter");
      expect(getCanonicalPlanTier("production")).toBe("pro");
      expect(getCanonicalPlanTier("studio")).toBe("studio");
    });

    it("should return 'free' for unknown input", () => {
      expect(getCanonicalPlanTier("unknown")).toBe("free");
      expect(getCanonicalPlanTier("")).toBe("free");
    });
  });

  describe("CREDIT_COSTS", () => {
    it("should have all required operation types", () => {
      expect(CREDIT_COSTS.image_standard).toBeDefined();
      expect(CREDIT_COSTS.image_hd).toBeDefined();
      expect(CREDIT_COSTS.video_kling).toBeDefined();
      expect(CREDIT_COSTS.export_4k).toBeDefined();
    });

    it("should have positive credit costs", () => {
      Object.values(CREDIT_COSTS).forEach((cost) => {
        expect(cost.creditsCost).toBeGreaterThan(0);
      });
    });

    it("should have HD cost more than standard", () => {
      expect(CREDIT_COSTS.image_hd.creditsCost).toBeGreaterThan(
        CREDIT_COSTS.image_standard.creditsCost
      );
    });

    it("should have 4K export cost more than 1080p", () => {
      expect(CREDIT_COSTS.export_4k.creditsCost).toBeGreaterThan(
        CREDIT_COSTS.export_1080p.creditsCost
      );
    });
  });

  describe("PLAN_DEFINITIONS", () => {
    const tiers: CanonicalPlanTier[] = [
      "free",
      "starter",
      "pro",
      "studio",
      "enterprise",
    ];

    it("should have all canonical tiers defined", () => {
      tiers.forEach((tier) => {
        expect(PLAN_DEFINITIONS[tier]).toBeDefined();
        expect(PLAN_DEFINITIONS[tier].tier).toBe(tier);
      });
    });

    it("should have increasing prices from free to enterprise", () => {
      const prices = tiers.map((tier) => PLAN_DEFINITIONS[tier].priceMonthly);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    });

    it("should have increasing credits from free to studio", () => {
      const basicTiers: CanonicalPlanTier[] = [
        "free",
        "starter",
        "pro",
        "studio",
      ];
      const credits = basicTiers.map(
        (tier) => PLAN_DEFINITIONS[tier].creditsMonthly
      );
      for (let i = 1; i < credits.length; i++) {
        expect(credits[i]).toBeGreaterThan(credits[i - 1]);
      }
    });

    it("should have free tier with no cost", () => {
      expect(PLAN_DEFINITIONS.free.priceMonthly).toBe(0);
      expect(PLAN_DEFINITIONS.free.priceYearly).toBe(0);
    });

    it("should have yearly discount over monthly", () => {
      tiers
        .filter((t) => t !== "free")
        .forEach((tier) => {
          const plan = PLAN_DEFINITIONS[tier];
          const monthlyTotal = plan.priceMonthly * 12;
          expect(plan.priceYearly).toBeLessThan(monthlyTotal);
        });
    });

    it("should have correct feature progression", () => {
      // Free should not have video generation
      expect(PLAN_DEFINITIONS.free.features.hasVideoGeneration).toBe(false);

      // Pro and above should have video generation
      expect(PLAN_DEFINITIONS.pro.features.hasVideoGeneration).toBe(true);
      expect(PLAN_DEFINITIONS.studio.features.hasVideoGeneration).toBe(true);
      expect(PLAN_DEFINITIONS.enterprise.features.hasVideoGeneration).toBe(
        true
      );

      // Only enterprise should have white label
      expect(PLAN_DEFINITIONS.free.features.hasWhiteLabel).toBe(false);
      expect(PLAN_DEFINITIONS.pro.features.hasWhiteLabel).toBe(false);
      expect(PLAN_DEFINITIONS.enterprise.features.hasWhiteLabel).toBe(true);
    });
  });
});
