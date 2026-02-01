"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "./auth-context";
import type { Plan, UserPlan, PlanCheckResponse } from "@/types/auth";

export function usePlan() {
  const { profile, plan, refreshProfile } = useAuth();
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all plans
  useEffect(() => {
    fetch("/api/plans")
      .then(res => res.json())
      .then(data => setAllPlans(data.plans || []))
      .catch(() => setAllPlans([]));
  }, []);

  // Current plan tier
  const currentTier: UserPlan = plan?.tier ?? "free";

  // Check if user has a feature
  const hasFeature = useCallback((feature: keyof Plan): boolean => {
    if (!plan) return false;
    const value = plan[feature];
    return typeof value === "boolean" ? value : !!value;
  }, [plan]);

  // Check if user can use a feature (with tier comparison)
  const canUseFeature = useCallback((
    feature: keyof Plan,
    requiredTier?: UserPlan
  ): PlanCheckResponse => {
    const tiers: UserPlan[] = ["free", "starter", "pro", "studio", "enterprise"];
    const currentIndex = tiers.indexOf(currentTier);
    const requiredIndex = requiredTier ? tiers.indexOf(requiredTier) : 0;
    
    const hasIt = hasFeature(feature);
    const needsUpgrade = requiredTier ? currentIndex < requiredIndex : !hasIt;
    
    return {
      hasFeature: hasIt,
      currentPlan: plan || allPlans.find(p => p.tier === "free")!,
      requiredPlan: requiredTier || "free",
      upgradeRequired: needsUpgrade,
    };
  }, [plan, currentTier, hasFeature, allPlans]);

  // Check limits
  const checkLimit = useCallback((
    limitType: "episodes" | "shots" | "parallel" | "videoDuration",
    currentValue: number
  ): { allowed: boolean; limit: number | null; current: number } => {
    if (!plan) {
      return { allowed: false, limit: 0, current: currentValue };
    }
    
    let limit: number | null = null;
    
    switch (limitType) {
      case "episodes":
        limit = plan.maxEpisodes;
        break;
      case "shots":
        limit = plan.maxShotsPerEpisode;
        break;
      case "parallel":
        limit = plan.maxParallelGenerations;
        break;
      case "videoDuration":
        limit = plan.maxVideoDurationSeconds;
        break;
    }
    
    const allowed = limit === null || currentValue < limit;
    
    return { allowed, limit, current: currentValue };
  }, [plan]);

  // Upgrade plan (redirect to checkout)
  const upgradePlan = useCallback(async (
    planId: string,
    billingPeriod: "monthly" | "yearly" = "monthly"
  ): Promise<{ url?: string; error?: string }> => {
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billingPeriod }),
      });
      
      if (res.ok) {
        const data = await res.json();
        return { url: data.url };
      }
      
      const error = await res.json();
      return { error: error.error };
    } catch {
      return { error: "Failed to create checkout session" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel subscription
  const cancelSubscription = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
      });
      
      if (res.ok) {
        await refreshProfile();
        return { success: true };
      }
      
      const error = await res.json();
      return { success: false, error: error.error };
    } catch {
      return { success: false, error: "Failed to cancel subscription" };
    } finally {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  return {
    currentPlan: plan,
    currentTier,
    allPlans,
    hasFeature,
    canUseFeature,
    checkLimit,
    upgradePlan,
    cancelSubscription,
    isLoading,
    isPro: ["pro", "studio", "enterprise"].includes(currentTier),
    isStudio: ["studio", "enterprise"].includes(currentTier),
    isEnterprise: currentTier === "enterprise",
  };
}
