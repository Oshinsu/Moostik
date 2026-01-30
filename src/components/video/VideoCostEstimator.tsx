"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  Clock,
  Film,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Star,
  Crown,
} from "lucide-react";
import {
  type VideoProvider,
  PROVIDER_CONFIGS,
  MOOSTIK_BUDGET_TIERS,
} from "@/lib/video/types";

interface VideoCostEstimatorProps {
  provider: VideoProvider;
  shotCount: number;
  durationPerShot: number;
  variationsPerShot?: number;
  className?: string;
  showComparison?: boolean;
  budgetLimit?: number;
}

interface ProviderCost {
  provider: VideoProvider;
  tier: string;
  totalCost: number;
  costPerShot: number;
  processingTimeEstimate: string;
}

export function VideoCostEstimator({
  provider,
  shotCount,
  durationPerShot,
  variationsPerShot = 1,
  className,
  showComparison = true,
  budgetLimit,
}: VideoCostEstimatorProps) {
  const config = PROVIDER_CONFIGS[provider];
  const totalVideos = shotCount * variationsPerShot;

  // Calculate costs for selected provider
  const costs = useMemo(() => {
    const costPerVideo = config.pricing.costPerSecond * durationPerShot;
    const totalCost = costPerVideo * totalVideos;
    const processingTimeMs = (config.timeoutMs * 0.6) * totalVideos / config.maxConcurrent;

    return {
      costPerVideo: Math.max(costPerVideo, config.pricing.minimumCost),
      totalCost: Math.max(totalCost, config.pricing.minimumCost * totalVideos),
      processingTimeMs,
      processingTimeFormatted: formatTime(processingTimeMs),
    };
  }, [provider, shotCount, durationPerShot, variationsPerShot]);

  // Calculate costs for all budget tiers for comparison
  const tierComparison = useMemo(() => {
    return Object.entries(MOOSTIK_BUDGET_TIERS).map(([tierName, tierConfig]) => {
      const tierProvider = PROVIDER_CONFIGS[tierConfig.provider];
      const costPerVideo = tierProvider.pricing.costPerSecond * durationPerShot;
      const totalCost = Math.max(costPerVideo, tierProvider.pricing.minimumCost) * totalVideos;

      return {
        tier: tierName,
        provider: tierConfig.provider,
        totalCost,
        resolution: tierConfig.resolution,
        isSelected: tierConfig.provider === provider,
      };
    });
  }, [provider, shotCount, durationPerShot, variationsPerShot]);

  // Find cheapest alternative
  const cheapestAlternative = useMemo(() => {
    const alternatives = Object.entries(PROVIDER_CONFIGS)
      .map(([prov, conf]) => ({
        provider: prov as VideoProvider,
        totalCost: Math.max(conf.pricing.costPerSecond * durationPerShot, conf.pricing.minimumCost) * totalVideos,
      }))
      .sort((a, b) => a.totalCost - b.totalCost);

    return alternatives[0].provider !== provider ? alternatives[0] : null;
  }, [provider, shotCount, durationPerShot, variationsPerShot]);

  // Check if over budget
  const isOverBudget = budgetLimit ? costs.totalCost > budgetLimit : false;
  const budgetPercentage = budgetLimit ? (costs.totalCost / budgetLimit) * 100 : 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Cost Display */}
      <div className="p-4 bg-gradient-to-br from-[#14131a] to-[#0b0b0e] rounded-xl border border-blood-900/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">
              Coût Estimé
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-mono">
                ${costs.totalCost.toFixed(2)}
              </span>
              <span className="text-sm text-zinc-500">USD</span>
            </div>
          </div>
          <Badge className={cn(
            "text-xs",
            config.tier === "premium" ? "bg-amber-900/20 text-amber-400 border-amber-900/30" :
            config.tier === "standard" ? "bg-blue-900/20 text-blue-400 border-blue-900/30" :
            "bg-emerald-900/20 text-emerald-400 border-emerald-900/30"
          )}>
            {config.tier === "premium" && <Crown className="w-3 h-3 mr-1" />}
            {config.tier === "standard" && <Star className="w-3 h-3 mr-1" />}
            {config.tier === "budget" && <Zap className="w-3 h-3 mr-1" />}
            {config.tier.toUpperCase()}
          </Badge>
        </div>

        {/* Breakdown */}
        <div className="mt-4 pt-4 border-t border-zinc-800/50 grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Par vidéo</p>
            <p className="text-sm font-mono text-white">
              ${costs.costPerVideo.toFixed(3)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Vidéos</p>
            <p className="text-sm font-mono text-white">
              {totalVideos}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Temps estimé</p>
            <p className="text-sm font-mono text-white flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {costs.processingTimeFormatted}
            </p>
          </div>
        </div>

        {/* Budget Progress */}
        {budgetLimit && (
          <div className="mt-4 pt-4 border-t border-zinc-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Budget</p>
              <p className="text-xs text-zinc-400">
                ${costs.totalCost.toFixed(2)} / ${budgetLimit.toFixed(2)}
              </p>
            </div>
            <Progress
              value={Math.min(budgetPercentage, 100)}
              className={cn(
                "h-2",
                isOverBudget ? "bg-red-900/30" : "bg-zinc-800"
              )}
            />
            {isOverBudget && (
              <div className="flex items-center gap-2 text-red-400 text-xs">
                <AlertTriangle className="w-3 h-3" />
                Dépasse le budget de ${(costs.totalCost - budgetLimit).toFixed(2)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tier Comparison */}
      {showComparison && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Comparaison par Tier
          </p>
          <div className="grid grid-cols-2 gap-2">
            {tierComparison.map(({ tier, provider: tierProvider, totalCost, resolution, isSelected }) => (
              <div
                key={tier}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  isSelected
                    ? "bg-blood-900/20 border-blood-600/50"
                    : "bg-[#14131a] border-blood-900/10"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-zinc-400">
                    {tier}
                  </span>
                  <Badge variant="outline" className="text-[9px]">
                    {resolution}
                  </Badge>
                </div>
                <p className="font-mono font-bold text-white">
                  ${totalCost.toFixed(2)}
                </p>
                <p className="text-[10px] text-zinc-600 truncate">
                  {tierProvider}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Savings Suggestion */}
      {cheapestAlternative && costs.totalCost > 5 && (
        <div className="p-3 bg-emerald-900/10 border border-emerald-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="text-emerald-400 font-bold">
                Économisez avec {cheapestAlternative.provider}
              </p>
              <p className="text-zinc-500 mt-1">
                Coût: ${cheapestAlternative.totalCost.toFixed(2)} (
                {Math.round((1 - cheapestAlternative.totalCost / costs.totalCost) * 100)}% moins cher)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-[#14131a] rounded-lg border border-blood-900/10 flex items-center gap-2">
          <DollarSign className="w-3 h-3 text-zinc-500" />
          <span className="text-zinc-500">Coût/seconde:</span>
          <span className="font-mono text-white">${config.pricing.costPerSecond.toFixed(3)}</span>
        </div>
        <div className="p-2 bg-[#14131a] rounded-lg border border-blood-900/10 flex items-center gap-2">
          <Film className="w-3 h-3 text-zinc-500" />
          <span className="text-zinc-500">Durée totale:</span>
          <span className="font-mono text-white">{(durationPerShot * totalVideos)}s</span>
        </div>
      </div>
    </div>
  );
}

// Helper function to format time
function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export default VideoCostEstimator;
