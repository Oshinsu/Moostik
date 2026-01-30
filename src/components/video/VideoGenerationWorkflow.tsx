"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
// Custom tab navigation used instead of Tabs component
import {
  Play,
  Pause,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Film,
  Settings,
  ChevronRight,
  Loader2,
  Download,
  ExternalLink,
} from "lucide-react";

import { VideoModelSelector } from "./VideoModelSelector";
import { VideoModelConfig } from "./VideoModelConfig";
import { VideoCostEstimator } from "./VideoCostEstimator";

import type { Shot, Episode } from "@/types/episode";
import {
  type VideoProvider,
  type VideoGenerationInput,
  type VideoGenerationOutput,
  PROVIDER_CONFIGS,
} from "@/lib/video/types";

interface VideoGenerationWorkflowProps {
  episode: Episode;
  shots: Shot[];
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type GenerationStatus = "pending" | "generating" | "completed" | "failed" | "cancelled";

interface ShotVideoStatus {
  shotId: string;
  variationId: string;
  status: GenerationStatus;
  progress?: number;
  videoUrl?: string;
  error?: string;
  cost?: number;
}

export function VideoGenerationWorkflow({
  episode,
  shots,
  open,
  onClose,
  onComplete,
}: VideoGenerationWorkflowProps) {
  // State
  const [selectedProvider, setSelectedProvider] = useState<VideoProvider>("wan-2.5");
  const [videoConfig, setVideoConfig] = useState<Partial<VideoGenerationInput>>({
    durationSeconds: 5,
    aspectRatio: "16:9",
    resolution: "1080p",
    generateAudio: true,
  });
  const [currentTab, setCurrentTab] = useState<"config" | "generate" | "review">("config");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [statuses, setStatuses] = useState<ShotVideoStatus[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number | undefined>(undefined);

  // Get shots that need video generation
  const pendingShots = useMemo(() => {
    return shots.filter((shot) =>
      shot.variations.some(
        (v) => v.status === "completed" && (!v.videoStatus || v.videoStatus === "pending" || v.videoStatus === "failed")
      )
    );
  }, [shots]);

  // Calculate total variations to generate
  const totalVariations = useMemo(() => {
    return pendingShots.reduce((acc, shot) => {
      return acc + shot.variations.filter(
        (v) => v.status === "completed" && (!v.videoStatus || v.videoStatus === "pending" || v.videoStatus === "failed")
      ).length;
    }, 0);
  }, [pendingShots]);

  // Initialize statuses
  const initializeStatuses = useCallback(() => {
    const newStatuses: ShotVideoStatus[] = [];
    pendingShots.forEach((shot) => {
      shot.variations
        .filter((v) => v.status === "completed" && (!v.videoStatus || v.videoStatus === "pending" || v.videoStatus === "failed"))
        .forEach((variation) => {
          newStatuses.push({
            shotId: shot.id,
            variationId: variation.id,
            status: "pending",
          });
        });
    });
    setStatuses(newStatuses);
    return newStatuses;
  }, [pendingShots]);

  // Start generation
  const startGeneration = async () => {
    if (totalVariations === 0) return;

    const statusList = statuses.length > 0 ? statuses : initializeStatuses();
    setIsGenerating(true);
    setIsPaused(false);
    setCurrentTab("generate");

    const providerConfig = PROVIDER_CONFIGS[selectedProvider];
    const maxParallel = providerConfig.maxConcurrent;

    // Process in batches
    for (let i = 0; i < statusList.length; i += maxParallel) {
      if (isPaused) {
        await waitUntilResumed();
      }

      const batch = statusList.slice(i, i + maxParallel);

      // Update batch to generating
      setStatuses((prev) =>
        prev.map((s) =>
          batch.some((b) => b.shotId === s.shotId && b.variationId === s.variationId)
            ? { ...s, status: "generating" as const }
            : s
        )
      );

      // Generate batch in parallel
      await Promise.all(
        batch.map(async (item) => {
          try {
            const shot = pendingShots.find((s) => s.id === item.shotId);
            const variation = shot?.variations.find((v) => v.id === item.variationId);

            if (!shot || !variation || !variation.imageUrl) {
              throw new Error("Image source not found");
            }

            const response = await fetch("/api/video/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                episodeId: episode.id,
                shotId: shot.id,
                variationId: variation.id,
                provider: selectedProvider,
                config: {
                  ...videoConfig,
                  sourceImage: variation.imageUrl,
                  prompt: shot.description || shot.name,
                  sourceType: "image",
                },
              }),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || "Video generation failed");
            }

            const result: VideoGenerationOutput = await response.json();

            setStatuses((prev) =>
              prev.map((s) =>
                s.shotId === item.shotId && s.variationId === item.variationId
                  ? {
                      ...s,
                      status: "completed" as const,
                      videoUrl: result.videoUrl,
                      cost: result.costUsd,
                    }
                  : s
              )
            );
          } catch (error) {
            setStatuses((prev) =>
              prev.map((s) =>
                s.shotId === item.shotId && s.variationId === item.variationId
                  ? {
                      ...s,
                      status: "failed" as const,
                      error: error instanceof Error ? error.message : "Unknown error",
                    }
                  : s
              )
            );
          }
        })
      );

      // Small delay between batches
      if (i + maxParallel < statusList.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setIsGenerating(false);
    setCurrentTab("review");
    onComplete();
  };

  // Pause/Resume
  const waitUntilResumed = (): Promise<void> => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!isPaused) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  // Retry failed
  const retryFailed = async () => {
    const failedItems = statuses.filter((s) => s.status === "failed");
    if (failedItems.length === 0) return;

    setStatuses((prev) =>
      prev.map((s) =>
        s.status === "failed" ? { ...s, status: "pending" as const, error: undefined } : s
      )
    );

    await startGeneration();
  };

  // Stats
  const stats = useMemo(() => {
    const completed = statuses.filter((s) => s.status === "completed").length;
    const failed = statuses.filter((s) => s.status === "failed").length;
    const generating = statuses.filter((s) => s.status === "generating").length;
    const pending = statuses.filter((s) => s.status === "pending").length;
    const totalCost = statuses.reduce((acc, s) => acc + (s.cost || 0), 0);
    const progress = statuses.length > 0 ? ((completed + failed) / statuses.length) * 100 : 0;

    return { completed, failed, generating, pending, totalCost, progress };
  }, [statuses]);

  const statusColors: Record<GenerationStatus, string> = {
    pending: "bg-zinc-600",
    generating: "bg-amber-500 animate-pulse",
    completed: "bg-emerald-500",
    failed: "bg-red-500",
    cancelled: "bg-zinc-500",
  };

  const statusLabels: Record<GenerationStatus, string> = {
    pending: "En attente",
    generating: "Génération...",
    completed: "Terminé",
    failed: "Erreur",
    cancelled: "Annulé",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] bg-[#0b0b0e] border-blood-900/30 text-zinc-100 p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 border-b border-blood-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blood-900/30 flex items-center justify-center">
                <Film className="w-5 h-5 text-blood-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Génération Vidéo - {episode.title}
                </DialogTitle>
                <p className="text-xs text-zinc-500 mt-1">
                  {totalVariations} vidéos à générer depuis {pendingShots.length} shots
                </p>
              </div>
            </div>
            {isGenerating && (
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-900/20 text-amber-400 border-amber-900/30 animate-pulse">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Génération en cours
                </Badge>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Tabs Navigation */}
        <div className="px-6 pt-4 bg-[#0b0b0e]/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => !isGenerating && setCurrentTab("config")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                currentTab === "config"
                  ? "bg-blood-900/30 text-white"
                  : "text-zinc-500 hover:text-white"
              )}
            >
              <Settings className="w-4 h-4" />
              Configuration
            </button>
            <ChevronRight className="w-4 h-4 text-zinc-700" />
            <button
              onClick={() => setCurrentTab("generate")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                currentTab === "generate"
                  ? "bg-blood-900/30 text-white"
                  : "text-zinc-500 hover:text-white"
              )}
            >
              <Play className="w-4 h-4" />
              Génération
            </button>
            <ChevronRight className="w-4 h-4 text-zinc-700" />
            <button
              onClick={() => setCurrentTab("review")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                currentTab === "review"
                  ? "bg-blood-900/30 text-white"
                  : "text-zinc-500 hover:text-white"
              )}
            >
              <Check className="w-4 h-4" />
              Résultats
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Configuration Tab */}
          {currentTab === "config" && (
            <div className="h-full flex">
              {/* Left: Model Selector */}
              <div className="w-1/2 border-r border-blood-900/30 overflow-y-auto p-6">
                <VideoModelSelector
                  selectedProvider={selectedProvider}
                  onSelect={setSelectedProvider}
                  showPricing
                  showCapabilities
                />
              </div>

              {/* Right: Config + Cost */}
              <div className="w-1/2 overflow-y-auto p-6 space-y-6">
                <VideoModelConfig
                  provider={selectedProvider}
                  config={videoConfig}
                  onChange={setVideoConfig}
                />

                <div className="border-t border-blood-900/30 pt-6">
                  <VideoCostEstimator
                    provider={selectedProvider}
                    shotCount={pendingShots.length}
                    durationPerShot={videoConfig.durationSeconds || 5}
                    variationsPerShot={Math.ceil(totalVariations / Math.max(pendingShots.length, 1))}
                    budgetLimit={budgetLimit}
                    showComparison
                  />
                </div>
              </div>
            </div>
          )}

          {/* Generation Tab */}
          {currentTab === "generate" && (
            <div className="h-full flex flex-col p-6">
              {/* Progress Header */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{stats.completed}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">Terminés</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-400">{stats.generating}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">En cours</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-zinc-400">{stats.pending}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">En attente</p>
                    </div>
                    {stats.failed > 0 && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
                        <p className="text-[10px] text-zinc-500 uppercase">Erreurs</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Coût actuel</p>
                    <p className="text-xl font-mono font-bold text-white">
                      ${stats.totalCost.toFixed(2)}
                    </p>
                  </div>
                </div>

                <Progress value={stats.progress} className="h-3 bg-zinc-800" />
              </div>

              {/* Shot List */}
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {pendingShots.map((shot) => {
                    const shotStatuses = statuses.filter((s) => s.shotId === shot.id);
                    const shotCompleted = shotStatuses.filter((s) => s.status === "completed").length;
                    const shotTotal = shotStatuses.length;

                    return (
                      <div
                        key={shot.id}
                        className="p-4 bg-[#14131a] rounded-xl border border-blood-900/10"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-blood-900/50 text-blood-400 font-mono text-[10px]">
                              #{shot.number.toString().padStart(2, "0")}
                            </Badge>
                            <span className="font-medium text-white">{shot.name}</span>
                          </div>
                          <span className="text-xs text-zinc-500">
                            {shotCompleted}/{shotTotal}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {shotStatuses.map((item) => {
                            const variation = shot.variations.find((v) => v.id === item.variationId);
                            return (
                              <div
                                key={item.variationId}
                                className="relative group"
                              >
                                <div className={cn(
                                  "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                                  item.status === "completed" ? "border-emerald-500" :
                                  item.status === "generating" ? "border-amber-500" :
                                  item.status === "failed" ? "border-red-500" :
                                  "border-zinc-700"
                                )}>
                                  {variation?.imageUrl && (
                                    <img
                                      src={variation.imageUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                  {item.status === "generating" && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                                    </div>
                                  )}
                                  {item.status === "completed" && (
                                    <div className="absolute inset-0 bg-emerald-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Play className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                  {item.status === "failed" && (
                                    <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
                                      <X className="w-4 h-4 text-red-400" />
                                    </div>
                                  )}
                                </div>
                                <Badge className={cn(
                                  "absolute -bottom-1 -right-1 text-[8px] px-1",
                                  statusColors[item.status]
                                )}>
                                  {variation?.cameraAngle || "?"}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>

                        {shotStatuses.some((s) => s.error) && (
                          <div className="mt-2 p-2 bg-red-900/20 rounded-lg">
                            <p className="text-[10px] text-red-400">
                              {shotStatuses.find((s) => s.error)?.error}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Review Tab */}
          {currentTab === "review" && (
            <div className="h-full p-6">
              <div className="grid grid-cols-2 gap-6 h-full">
                {/* Summary */}
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-[#14131a] to-[#0b0b0e] rounded-xl border border-blood-900/20">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">
                      Résumé
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-900/10 rounded-lg border border-emerald-900/20">
                        <p className="text-3xl font-bold text-emerald-400">{stats.completed}</p>
                        <p className="text-xs text-zinc-500">Vidéos générées</p>
                      </div>
                      <div className="p-4 bg-red-900/10 rounded-lg border border-red-900/20">
                        <p className="text-3xl font-bold text-red-400">{stats.failed}</p>
                        <p className="text-xs text-zinc-500">Erreurs</p>
                      </div>
                      <div className="p-4 bg-blue-900/10 rounded-lg border border-blue-900/20">
                        <p className="text-3xl font-bold text-blue-400">${stats.totalCost.toFixed(2)}</p>
                        <p className="text-xs text-zinc-500">Coût total</p>
                      </div>
                      <div className="p-4 bg-amber-900/10 rounded-lg border border-amber-900/20">
                        <p className="text-3xl font-bold text-amber-400">
                          {(stats.completed * (videoConfig.durationSeconds || 5))}s
                        </p>
                        <p className="text-xs text-zinc-500">Durée totale</p>
                      </div>
                    </div>
                  </div>

                  {stats.failed > 0 && (
                    <div className="p-4 bg-red-900/10 border border-red-900/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-bold text-red-400">
                            {stats.failed} vidéo(s) ont échoué
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            Vous pouvez les régénérer individuellement.
                          </p>
                          <Button
                            onClick={retryFailed}
                            className="mt-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs"
                          >
                            <RefreshCw className="w-3 h-3 mr-2" />
                            Réessayer les erreurs
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Preview Grid */}
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-2 gap-3">
                    {statuses
                      .filter((s) => s.status === "completed" && s.videoUrl)
                      .map((item) => {
                        const shot = pendingShots.find((s) => s.id === item.shotId);
                        return (
                          <div
                            key={`${item.shotId}-${item.variationId}`}
                            className="group relative aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800"
                          >
                            <video
                              src={item.videoUrl}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => {
                                e.currentTarget.pause();
                                e.currentTarget.currentTime = 0;
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                              <p className="text-xs font-bold text-white truncate">
                                {shot?.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <a
                                  href={item.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Ouvrir
                                </a>
                                <a
                                  href={item.videoUrl}
                                  download
                                  className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  Télécharger
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 border-t border-blood-900/30 bg-[#0b0b0e]/95">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              {currentTab === "config" && (
                <p className="text-xs text-zinc-500">
                  Modèle: <span className="text-white font-mono">{selectedProvider}</span>
                  {" • "}
                  {totalVariations} vidéos
                  {" • "}
                  ~${(PROVIDER_CONFIGS[selectedProvider].pricing.costPer5sVideo * totalVariations).toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isGenerating}
                className="text-zinc-500 hover:text-white"
              >
                {isGenerating ? "Annuler" : "Fermer"}
              </Button>

              {currentTab === "config" && (
                <Button
                  onClick={() => {
                    initializeStatuses();
                    startGeneration();
                  }}
                  disabled={totalVariations === 0}
                  className="moostik-btn-blood text-white px-8 font-bold"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Lancer la génération ({totalVariations})
                </Button>
              )}

              {currentTab === "generate" && isGenerating && (
                <Button
                  onClick={() => setIsPaused(!isPaused)}
                  className="bg-amber-900/30 hover:bg-amber-900/50 text-amber-400"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Reprendre
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
              )}

              {currentTab === "review" && stats.completed > 0 && (
                <Button
                  onClick={onClose}
                  className="moostik-btn-blood text-white px-8 font-bold"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Terminer
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default VideoGenerationWorkflow;
