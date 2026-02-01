"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Film,
  Play,
  Sparkles,
  Crown,
  Star,
  Zap,
  Volume2,
  Mic,
  Palette,
  Target,
} from "lucide-react";

import { Sidebar } from "@/components/Sidebar";
import { VideoModelSelector } from "@/components/video/VideoModelSelector";
import { VideoCostEstimator } from "@/components/video/VideoCostEstimator";
import { VideoGenerationWorkflow } from "@/components/video/VideoGenerationWorkflow";
import { useMoostik } from "@/contexts/MoostikContext";

import {
  type VideoProvider,
  PROVIDER_CONFIGS,
  MOOSTIK_BUDGET_TIERS,
} from "@/lib/video/types";

export default function VideoPage() {
  const { episodes } = useMoostik();
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<VideoProvider>("wan-2.5");
  const [selectedTier, setSelectedTier] = useState<keyof typeof MOOSTIK_BUDGET_TIERS>("draft");
  const [showWorkflow, setShowWorkflow] = useState(false);

  const selectedEpisode = episodes.find((e) => e.id === selectedEpisodeId);

  // Calculate episode stats
  const getEpisodeStats = (episodeId: string) => {
    const episode = episodes.find((e) => e.id === episodeId);
    if (!episode) return { total: 0, pending: 0, completed: 0, failed: 0 };

    let total = 0;
    let pending = 0;
    let completed = 0;
    let failed = 0;

    episode.shots.forEach((shot) => {
      shot.variations.forEach((v) => {
        if (v.status === "completed") {
          total++;
          if (!v.videoStatus || v.videoStatus === "pending") pending++;
          else if (v.videoStatus === "completed") completed++;
          else if (v.videoStatus === "failed") failed++;
        }
      });
    });

    return { total, pending, completed, failed };
  };

  // Provider feature icons
  const getProviderFeatureIcons = (provider: VideoProvider) => {
    const caps = PROVIDER_CONFIGS[provider].capabilities;
    const icons = [];

    if (caps.supportsAudio) icons.push({ icon: Volume2, label: "Audio", color: "text-emerald-400" });
    if (caps.supportsLipSync) icons.push({ icon: Mic, label: "Lip-Sync", color: "text-purple-400" });
    if (caps.supportsMotionBrush) icons.push({ icon: Palette, label: "Motion Brush", color: "text-amber-400" });
    if (caps.supportsMotionTransfer) icons.push({ icon: Target, label: "Motion Transfer", color: "text-pink-400" });
    if (caps.supportsInterpolation) icons.push({ icon: Play, label: "Interpolation", color: "text-cyan-400" });

    return icons;
  };

  return (
    <div className="flex h-screen bg-[#0b0b0e]">
      <Sidebar />

      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header - MOOSTIK Bloodwings Style */}
        <header className="relative border-b border-blood-900/30 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blood-900/20 via-[#0b0b0e] to-purple-900/10" />

          {/* Animated blood veins */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-blood-700/50 via-purple-600/30 to-transparent animate-pulse" />
            <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-blood-600/30 to-purple-700/50 animate-pulse" style={{ animationDelay: '0.8s' }} />
          </div>

          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blood-600/30 to-purple-600/20 border border-blood-600/30 flex items-center justify-center">
                  <Film className="w-6 h-6 text-blood-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-blood-500 animate-pulse" />
                    <span className="text-xs text-blood-400 uppercase tracking-widest font-medium">Animation Studio</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-blood-400 via-purple-500 to-blood-500 bg-clip-text text-transparent">
                      Génération Vidéo I2V
                    </span>
                  </h1>
                  <p className="text-sm text-zinc-500">
                    12 modèles SOTA • Image-to-Video • Janvier 2026
                  </p>
                </div>
              </div>

            <div className="flex items-center gap-3">
              {/* Episode Selector */}
              <Select
                value={selectedEpisodeId || ""}
                onValueChange={setSelectedEpisodeId}
              >
                <SelectTrigger className="w-64 bg-[#14131a] border-blood-900/30">
                  <SelectValue placeholder="Sélectionner un épisode..." />
                </SelectTrigger>
                <SelectContent className="bg-[#14131a] border-blood-900/30">
                  {episodes.map((ep) => {
                    const stats = getEpisodeStats(ep.id);
                    return (
                      <SelectItem key={ep.id} value={ep.id}>
                        <div className="flex items-center gap-2">
                          <span>Épisode {ep.number}: {ep.title}</span>
                          {stats.pending > 0 && (
                            <Badge className="text-[9px] bg-amber-900/20 text-amber-400">
                              {stats.pending} en attente
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {selectedEpisode && (
                <Button
                  onClick={() => setShowWorkflow(true)}
                  className="moostik-btn-blood text-white px-6 font-bold"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Générer les vidéos
                </Button>
              )}
            </div>
          </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Model Explorer */}
          <div className="w-1/2 border-r border-blood-900/30 flex flex-col">
            {/* Tier Quick Select */}
            <div className="p-4 border-b border-blood-900/30 bg-[#0b0b0e]/50">
              <div className="flex items-center gap-2">
                {(Object.entries(MOOSTIK_BUDGET_TIERS) as [keyof typeof MOOSTIK_BUDGET_TIERS, typeof MOOSTIK_BUDGET_TIERS[keyof typeof MOOSTIK_BUDGET_TIERS]][]).map(
                  ([tier, config]) => (
                    <button
                      key={tier}
                      onClick={() => {
                        setSelectedTier(tier);
                        setSelectedProvider(config.provider);
                      }}
                      className={cn(
                        "flex-1 p-3 rounded-lg border transition-all text-center",
                        selectedTier === tier
                          ? "bg-blood-900/20 border-blood-600/50"
                          : "bg-[#14131a] border-blood-900/10 hover:border-blood-900/30"
                      )}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {tier === "prototype" && <Zap className="w-3 h-3 text-emerald-400" />}
                        {tier === "draft" && <Star className="w-3 h-3 text-blue-400" />}
                        {tier === "standard" && <Sparkles className="w-3 h-3 text-amber-400" />}
                        {tier === "high" && <Crown className="w-3 h-3 text-purple-400" />}
                        <span className="text-xs font-bold uppercase">{tier}</span>
                      </div>
                      <p className="text-lg font-mono font-bold text-white">
                        ${config.estimatedCostPerEpisode.toFixed(2)}
                      </p>
                      <p className="text-[9px] text-zinc-500">/épisode</p>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Model List */}
            <ScrollArea className="flex-1 p-4">
              <VideoModelSelector
                selectedProvider={selectedProvider}
                onSelect={setSelectedProvider}
                showPricing
                showCapabilities
              />
            </ScrollArea>
          </div>

          {/* Right: Selected Provider Details + Cost */}
          <div className="w-1/2 flex flex-col overflow-hidden">
            {/* Provider Details */}
            <div className="p-6 border-b border-blood-900/30">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-xl flex items-center justify-center text-3xl",
                  PROVIDER_CONFIGS[selectedProvider].tier === "premium"
                    ? "bg-amber-900/20"
                    : PROVIDER_CONFIGS[selectedProvider].tier === "standard"
                    ? "bg-blue-900/20"
                    : "bg-emerald-900/20"
                )}>
                  {getProviderEmoji(selectedProvider)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">
                      {getProviderName(selectedProvider)}
                    </h2>
                    <Badge className={cn(
                      "text-xs",
                      PROVIDER_CONFIGS[selectedProvider].tier === "premium"
                        ? "bg-amber-900/20 text-amber-400"
                        : PROVIDER_CONFIGS[selectedProvider].tier === "standard"
                        ? "bg-blue-900/20 text-blue-400"
                        : "bg-emerald-900/20 text-emerald-400"
                    )}>
                      {PROVIDER_CONFIGS[selectedProvider].tier}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-500 mt-1">
                    {getProviderCompany(selectedProvider)}
                  </p>

                  {/* Feature Icons */}
                  <div className="flex items-center gap-2 mt-3">
                    {getProviderFeatureIcons(selectedProvider).map(({ icon: Icon, label, color }) => (
                      <div
                        key={label}
                        className="flex items-center gap-1 px-2 py-1 bg-[#14131a] rounded-lg border border-blood-900/10"
                        title={label}
                      >
                        <Icon className={cn("w-3 h-3", color)} />
                        <span className="text-[10px] text-zinc-400">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div className="mt-4 p-3 bg-[#14131a] rounded-lg border border-blood-900/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">
                  Points forts
                </p>
                <div className="flex flex-wrap gap-1">
                  {PROVIDER_CONFIGS[selectedProvider].capabilities.strengths.map((strength, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px] border-zinc-700">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Capabilities Grid */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                <div className="p-2 bg-[#14131a] rounded-lg border border-blood-900/10 text-center">
                  <p className="text-[10px] text-zinc-500">Résolution</p>
                  <p className="text-sm font-mono font-bold text-white">
                    {PROVIDER_CONFIGS[selectedProvider].capabilities.supportedResolutions[
                      PROVIDER_CONFIGS[selectedProvider].capabilities.supportedResolutions.length - 1
                    ]}
                  </p>
                </div>
                <div className="p-2 bg-[#14131a] rounded-lg border border-blood-900/10 text-center">
                  <p className="text-[10px] text-zinc-500">Durée max</p>
                  <p className="text-sm font-mono font-bold text-white">
                    {PROVIDER_CONFIGS[selectedProvider].capabilities.maxDurationSeconds}s
                  </p>
                </div>
                <div className="p-2 bg-[#14131a] rounded-lg border border-blood-900/10 text-center">
                  <p className="text-[10px] text-zinc-500">FPS</p>
                  <p className="text-sm font-mono font-bold text-white">
                    {PROVIDER_CONFIGS[selectedProvider].capabilities.fps.join("/")}
                  </p>
                </div>
                <div className="p-2 bg-[#14131a] rounded-lg border border-blood-900/10 text-center">
                  <p className="text-[10px] text-zinc-500">Concurrent</p>
                  <p className="text-sm font-mono font-bold text-white">
                    {PROVIDER_CONFIGS[selectedProvider].maxConcurrent}
                  </p>
                </div>
              </div>
            </div>

            {/* Cost Estimator */}
            <ScrollArea className="flex-1 p-6">
              {selectedEpisode ? (
                <div className="space-y-6">
                  <VideoCostEstimator
                    provider={selectedProvider}
                    shotCount={selectedEpisode.shots.length}
                    durationPerShot={5}
                    variationsPerShot={Math.ceil(
                      selectedEpisode.shots.reduce((acc, s) => acc + s.variations.filter((v) => v.status === "completed").length, 0) /
                      Math.max(selectedEpisode.shots.length, 1)
                    )}
                    showComparison
                  />

                  {/* Episode Preview */}
                  <div className="p-4 bg-[#14131a] rounded-xl border border-blood-900/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                        Épisode {selectedEpisode.number}
                      </p>
                      <Badge variant="outline" className="text-[9px]">
                        {getEpisodeStats(selectedEpisode.id).pending} vidéos à générer
                      </Badge>
                    </div>
                    <h3 className="font-bold text-white">{selectedEpisode.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      {selectedEpisode.description}
                    </p>

                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {(() => {
                        const stats = getEpisodeStats(selectedEpisode.id);
                        return (
                          <>
                            <div className="p-2 bg-zinc-900/50 rounded-lg text-center">
                              <p className="text-lg font-bold text-white">{stats.total}</p>
                              <p className="text-[9px] text-zinc-500">Images</p>
                            </div>
                            <div className="p-2 bg-emerald-900/20 rounded-lg text-center">
                              <p className="text-lg font-bold text-emerald-400">{stats.completed}</p>
                              <p className="text-[9px] text-zinc-500">Vidéos OK</p>
                            </div>
                            <div className="p-2 bg-amber-900/20 rounded-lg text-center">
                              <p className="text-lg font-bold text-amber-400">{stats.pending}</p>
                              <p className="text-[9px] text-zinc-500">En attente</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Shot Thumbnails Grid */}
                    {selectedEpisode.shots.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">
                          Shots ({selectedEpisode.shots.length})
                        </p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {selectedEpisode.shots.slice(0, 8).map((shot) => {
                            const completedVariation = shot.variations.find(v => v.status === "completed");
                            const hasVideo = completedVariation?.videoStatus === "completed";
                            return (
                              <div
                                key={shot.id}
                                className="relative aspect-video rounded-md overflow-hidden bg-zinc-900 border border-blood-900/20"
                              >
                                {completedVariation?.imageUrl ? (
                                  <>
                                    <img
                                      src={completedVariation.imageUrl}
                                      alt={shot.prompt.slice(0, 30)}
                                      className="w-full h-full object-cover"
                                    />
                                    {/* Video status indicator */}
                                    <div className={cn(
                                      "absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-black/50",
                                      hasVideo ? "bg-emerald-500" : "bg-amber-500"
                                    )} />
                                    {/* Shot number */}
                                    <div className="absolute top-0.5 left-0.5 px-1 py-0.5 bg-black/70 rounded text-[8px] font-mono text-white">
                                      {shot.number}
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Film className="w-3 h-3 text-zinc-700" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {selectedEpisode.shots.length > 8 && (
                          <p className="text-[9px] text-zinc-600 mt-1.5 text-center">
                            +{selectedEpisode.shots.length - 8} shots supplémentaires
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Film className="w-12 h-12 text-zinc-700 mb-4" />
                  <p className="text-zinc-500 font-medium">
                    Sélectionnez un épisode
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    pour voir l&apos;estimation des coûts
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </main>

      {/* Video Generation Workflow Modal */}
      {selectedEpisode && (
        <VideoGenerationWorkflow
          episode={selectedEpisode}
          shots={selectedEpisode.shots}
          open={showWorkflow}
          onClose={() => setShowWorkflow(false)}
          onComplete={() => {
            setShowWorkflow(false);
            // Refresh data
          }}
        />
      )}
    </div>
  );
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
    "ltx-2": "LTX-2 (Open)",
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

function getProviderEmoji(id: VideoProvider): string {
  const emojis: Record<VideoProvider, string> = {
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
  return emojis[id] || "🎬";
}
