"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  Zap,
  Volume2,
  Sparkles,
  Film,
  Play,
  Mic,
  Palette,
  Target,
  Clock,
  DollarSign,
  AlertTriangle,
  Crown,
  Star,
  ChevronRight,
} from "lucide-react";
import {
  type VideoProvider,
  type ProviderTier,
  PROVIDER_CONFIGS,
} from "@/lib/video/types";

interface VideoModelSelectorProps {
  selectedProvider: VideoProvider;
  onSelect: (provider: VideoProvider) => void;
  filterTier?: ProviderTier;
  showPricing?: boolean;
  showCapabilities?: boolean;
  compact?: boolean;
}

const TIER_COLORS: Record<ProviderTier, { bg: string; text: string; border: string }> = {
  budget: { bg: "bg-emerald-900/20", text: "text-emerald-400", border: "border-emerald-900/30" },
  standard: { bg: "bg-blue-900/20", text: "text-blue-400", border: "border-blue-900/30" },
  premium: { bg: "bg-amber-900/20", text: "text-amber-400", border: "border-amber-900/30" },
  local: { bg: "bg-purple-900/20", text: "text-purple-400", border: "border-purple-900/30" },
};

const TIER_LABELS: Record<ProviderTier, string> = {
  budget: "Budget",
  standard: "Standard",
  premium: "Premium",
  local: "Local",
};

const PROVIDER_ICONS: Record<VideoProvider, string> = {
  "wan-2.2": "🚀",
  "wan-2.5": "✨",
  "wan-2.6": "🌟",
  "kling-2.6": "🎬",
  "veo-3.1": "🏆",
  "hailuo-2.3": "💃",
  "luma-ray-2": "🌈",
  "luma-ray-3": "⚡",
  "ltx-2": "🔓",
  "sora-2": "🎥",
  "hunyuan-1.5": "🐉",
  "pixverse-4": "🎨",
};

const PROVIDER_NAMES: Record<VideoProvider, string> = {
  "wan-2.2": "Wan 2.2 Fast",
  "wan-2.5": "Wan 2.5",
  "wan-2.6": "Wan 2.6",
  "kling-2.6": "Kling 2.6 Pro",
  "veo-3.1": "Google Veo 3.1",
  "hailuo-2.3": "Hailuo 2.3 Pro",
  "luma-ray-2": "Luma Ray 2",
  "luma-ray-3": "Luma Ray 3",
  "ltx-2": "LTX-2 (Open)",
  "sora-2": "OpenAI Sora 2",
  "hunyuan-1.5": "Hunyuan 1.5",
  "pixverse-4": "PixVerse 4",
};

const PROVIDER_COMPANIES: Record<VideoProvider, string> = {
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

export function VideoModelSelector({
  selectedProvider,
  onSelect,
  filterTier,
  showPricing = true,
  showCapabilities = true,
  compact = false,
}: VideoModelSelectorProps) {
  const [hoveredProvider, setHoveredProvider] = useState<VideoProvider | null>(null);

  const providers = Object.entries(PROVIDER_CONFIGS)
    .filter(([_, config]) => !filterTier || config.tier === filterTier)
    .sort((a, b) => a[1].pricing.costPer5sVideo - b[1].pricing.costPer5sVideo);

  const groupedByTier = providers.reduce((acc, [provider, config]) => {
    if (!acc[config.tier]) acc[config.tier] = [];
    acc[config.tier].push([provider as VideoProvider, config]);
    return acc;
  }, {} as Record<ProviderTier, [VideoProvider, typeof PROVIDER_CONFIGS[VideoProvider]][]>);

  const tierOrder: ProviderTier[] = ["budget", "standard", "premium", "local"];

  if (compact) {
    return (
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          Modèle I2V
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {providers.map(([provider, config]) => {
            const isSelected = selectedProvider === provider;
            const tierColor = TIER_COLORS[config.tier];
            return (
              <button
                key={provider}
                onClick={() => onSelect(provider as VideoProvider)}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border transition-all text-left",
                  isSelected
                    ? "bg-blood-900/30 border-blood-600/50"
                    : "bg-[#14131a] border-blood-900/10 hover:border-blood-900/30"
                )}
              >
                <span className="text-lg">{PROVIDER_ICONS[provider as VideoProvider]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {PROVIDER_NAMES[provider as VideoProvider]}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    ${config.pricing.costPer5sVideo.toFixed(2)}/5s
                  </p>
                </div>
                {isSelected && <Check className="w-3 h-3 text-blood-400" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
              Sélection du Modèle I2V
            </h3>
            <p className="text-xs text-zinc-600 mt-1">
              12 modèles SOTA disponibles - Janvier 2026
            </p>
          </div>
          <Badge className="bg-blood-900/20 text-blood-400 border-blood-900/30 text-xs">
            {selectedProvider ? PROVIDER_NAMES[selectedProvider] : "Aucun"}
          </Badge>
        </div>

        {/* Tier Groups */}
        <div className="space-y-6">
          {tierOrder.map((tier) => {
            const tierProviders = groupedByTier[tier];
            if (!tierProviders || tierProviders.length === 0) return null;

            const tierColor = TIER_COLORS[tier];

            return (
              <div key={tier} className="space-y-3">
                {/* Tier Header */}
                <div className="flex items-center gap-2">
                  <Badge className={cn(tierColor.bg, tierColor.text, tierColor.border, "text-[10px]")}>
                    {tier === "premium" && <Crown className="w-2.5 h-2.5 mr-1" />}
                    {tier === "standard" && <Star className="w-2.5 h-2.5 mr-1" />}
                    {tier === "budget" && <Zap className="w-2.5 h-2.5 mr-1" />}
                    {TIER_LABELS[tier]}
                  </Badge>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>

                {/* Provider Cards */}
                <div className="grid gap-2">
                  {tierProviders.map(([provider, config]) => {
                    const isSelected = selectedProvider === provider;
                    const isHovered = hoveredProvider === provider;
                    const caps = config.capabilities;

                    return (
                      <div
                        key={provider}
                        onClick={() => onSelect(provider)}
                        onMouseEnter={() => setHoveredProvider(provider)}
                        onMouseLeave={() => setHoveredProvider(null)}
                        className={cn(
                          "group relative flex items-stretch rounded-xl border cursor-pointer transition-all duration-300 overflow-hidden",
                          isSelected
                            ? "bg-blood-900/20 border-blood-600/50 ring-1 ring-blood-600/30"
                            : "bg-[#14131a] border-blood-900/10 hover:border-blood-900/40 hover:bg-[#1a1920]"
                        )}
                      >
                        {/* Main Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            {/* Left: Icon + Name */}
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                                isSelected ? "bg-blood-900/30" : "bg-zinc-900/50"
                              )}>
                                {PROVIDER_ICONS[provider]}
                              </div>
                              <div>
                                <h4 className="font-bold text-white flex items-center gap-2">
                                  {PROVIDER_NAMES[provider]}
                                  {isSelected && <Check className="w-4 h-4 text-blood-400" />}
                                </h4>
                                <p className="text-xs text-zinc-500">
                                  {PROVIDER_COMPANIES[provider]}
                                </p>
                              </div>
                            </div>

                            {/* Right: Pricing */}
                            {showPricing && (
                              <div className="text-right">
                                <p className="font-mono font-bold text-white">
                                  ${config.pricing.costPer5sVideo.toFixed(2)}
                                </p>
                                <p className="text-[10px] text-zinc-500">par 5 secondes</p>
                              </div>
                            )}
                          </div>

                          {/* Capabilities Row */}
                          {showCapabilities && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {/* Resolution */}
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className="text-[10px] bg-zinc-900/50 border-zinc-800">
                                    <Film className="w-2.5 h-2.5 mr-1" />
                                    {caps.supportedResolutions[caps.supportedResolutions.length - 1]}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Résolutions: {caps.supportedResolutions.join(", ")}
                                </TooltipContent>
                              </Tooltip>

                              {/* Duration */}
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className="text-[10px] bg-zinc-900/50 border-zinc-800">
                                    <Clock className="w-2.5 h-2.5 mr-1" />
                                    {caps.maxDurationSeconds}s max
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Durée: {caps.minDurationSeconds}s - {caps.maxDurationSeconds}s
                                </TooltipContent>
                              </Tooltip>

                              {/* Audio */}
                              {caps.supportsAudio && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge className="text-[10px] bg-emerald-900/20 text-emerald-400 border-emerald-900/30">
                                      <Volume2 className="w-2.5 h-2.5 mr-1" />
                                      Audio
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>Génération audio native</TooltipContent>
                                </Tooltip>
                              )}

                              {/* Lip Sync */}
                              {caps.supportsLipSync && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge className="text-[10px] bg-purple-900/20 text-purple-400 border-purple-900/30">
                                      <Mic className="w-2.5 h-2.5 mr-1" />
                                      Lip-Sync
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>Synchronisation labiale native</TooltipContent>
                                </Tooltip>
                              )}

                              {/* Motion Brush */}
                              {caps.supportsMotionBrush && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge className="text-[10px] bg-amber-900/20 text-amber-400 border-amber-900/30">
                                      <Palette className="w-2.5 h-2.5 mr-1" />
                                      Motion Brush
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>Contrôle du mouvement par région (jusqu'à 6)</TooltipContent>
                                </Tooltip>
                              )}

                              {/* Interpolation */}
                              {caps.supportsInterpolation && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge className="text-[10px] bg-cyan-900/20 text-cyan-400 border-cyan-900/30">
                                      <Play className="w-2.5 h-2.5 mr-1" />
                                      Interpolation
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>Image de début + fin supportées</TooltipContent>
                                </Tooltip>
                              )}

                              {/* Motion Transfer */}
                              {caps.supportsMotionTransfer && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge className="text-[10px] bg-pink-900/20 text-pink-400 border-pink-900/30">
                                      <Target className="w-2.5 h-2.5 mr-1" />
                                      Motion Transfer
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>Transfert de mouvement depuis une vidéo référence</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          )}

                          {/* Strengths (on hover) */}
                          {(isHovered || isSelected) && (
                            <div className="mt-3 pt-3 border-t border-zinc-800/50">
                              <div className="flex flex-wrap gap-1">
                                {caps.strengths.slice(0, 3).map((strength, idx) => (
                                  <span key={idx} className="text-[10px] text-zinc-500">
                                    {idx > 0 && "•"} {strength}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        <div className={cn(
                          "w-1 transition-colors",
                          isSelected ? "bg-blood-600" : "bg-transparent group-hover:bg-zinc-700"
                        )} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default VideoModelSelector;
