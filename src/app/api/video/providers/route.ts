/**
 * MOOSTIK Video Providers API
 * Returns all available I2V providers with their capabilities and pricing
 */

import { NextResponse } from "next/server";
import {
  type VideoProvider,
  PROVIDER_CONFIGS,
  MOOSTIK_BUDGET_TIERS,
  MOOSTIK_ANIMATION_PROVIDERS,
  MOOSTIK_SCENE_PROVIDERS,
  REPLICATE_MODELS,
  getOptimalProvider,
} from "@/lib/video/types";

export async function GET() {
  // Transform configs into a more UI-friendly format
  const providers = Object.entries(PROVIDER_CONFIGS).map(([id, config]) => ({
    id,
    name: getProviderName(id as VideoProvider),
    company: getProviderCompany(id as VideoProvider),
    tier: config.tier,
    replicateModel: config.replicateModel,
    capabilities: {
      ...config.capabilities,
      // Add computed fields
      maxResolution: config.capabilities.supportedResolutions[
        config.capabilities.supportedResolutions.length - 1
      ],
      hasAdvancedFeatures:
        config.capabilities.supportsMotionBrush ||
        config.capabilities.supportsMotionTransfer ||
        config.capabilities.supportsInterpolation,
    },
    pricing: {
      ...config.pricing,
      // Add formatted pricing
      costPerMinute: config.pricing.costPerSecond * 60,
      costFormatted: `$${config.pricing.costPer5sVideo.toFixed(2)}/5s`,
    },
    timing: {
      maxConcurrent: config.maxConcurrent,
      timeoutMs: config.timeoutMs,
      estimatedProcessingMs: config.timeoutMs * 0.6,
    },
  }));

  // Group by tier
  const byTier = {
    budget: providers.filter((p) => p.tier === "budget"),
    standard: providers.filter((p) => p.tier === "standard"),
    premium: providers.filter((p) => p.tier === "premium"),
  };

  // Sort each tier by price
  Object.values(byTier).forEach((tierProviders) => {
    tierProviders.sort((a, b) => a.pricing.costPer5sVideo - b.pricing.costPer5sVideo);
  });

  return NextResponse.json({
    providers,
    byTier,
    budgetTiers: MOOSTIK_BUDGET_TIERS,
    animationProviders: MOOSTIK_ANIMATION_PROVIDERS,
    sceneProviders: MOOSTIK_SCENE_PROVIDERS,
    replicateModels: REPLICATE_MODELS,
    meta: {
      totalProviders: providers.length,
      lastUpdated: "2026-01-30",
      version: "sota-january-2026",
    },
  });
}

// Helper functions
function getProviderName(id: VideoProvider): string {
  const names: Record<VideoProvider, string> = {
    "wan-2.2": "Wan 2.2 Fast",
    "wan-2.5": "Wan 2.5",
    "wan-2.6": "Wan 2.6",
    "kling-2.6": "Kling 2.6 Pro",
    "veo-3.1": "Google Veo 3.1",
    "hailuo-2.3": "Hailuo 2.3 Pro",
    "luma-ray-2": "Luma Ray 2",
    "luma-ray-3": "Luma Ray 3",
    "ltx-2": "LTX-2 (Open Source)",
    "sora-2": "OpenAI Sora 2",
    "hunyuan-1.5": "Hunyuan 1.5",
    "pixverse-4": "PixVerse 4",
  };
  return names[id] || id;
}

function getProviderCompany(id: VideoProvider): string {
  const companies: Record<VideoProvider, string> = {
    "wan-2.2": "Alibaba",
    "wan-2.5": "Alibaba",
    "wan-2.6": "Alibaba",
    "kling-2.6": "Kuaishou",
    "veo-3.1": "Google DeepMind",
    "hailuo-2.3": "MiniMax",
    "luma-ray-2": "Luma AI",
    "luma-ray-3": "Luma AI",
    "ltx-2": "Lightricks",
    "sora-2": "OpenAI",
    "hunyuan-1.5": "Tencent",
    "pixverse-4": "PixVerse",
  };
  return companies[id] || "Unknown";
}
