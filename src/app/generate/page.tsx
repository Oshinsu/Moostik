"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  Film,
  Image as ImageIcon,
  Zap,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface Episode {
  id: string;
  number: number;
  title: string;
  shots: Shot[];
}

interface Shot {
  id: string;
  number: number;
  name: string;
  status: string;
  variations: Variation[];
}

interface Variation {
  id: string;
  cameraAngle: string;
  status: string;
  imageUrl?: string;
  videoStatus?: string;
  videoUrl?: string;
}

interface GenerationStats {
  totalShots: number;
  totalVariations: number;
  completedImages: number;
  pendingImages: number;
  failedImages: number;
  generatingImages: number;
  completedVideos: number;
  pendingVideos: number;
}

const VIDEO_PROVIDERS = [
  { id: "wan", name: "Wan 2.1", cost: "$0.20/5s", quality: "Excellent" },
  { id: "kling", name: "Kling 1.6", cost: "$0.40/5s", quality: "Premium" },
  { id: "luma", name: "Luma Ray 2", cost: "$0.25/5s", quality: "Great" },
  { id: "runway", name: "Runway Gen-4", cost: "$0.30/5s", quality: "Premium" },
];

export default function GeneratePage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [stats, setStats] = useState<GenerationStats | null>(null);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);
  const [videoProvider, setVideoProvider] = useState("wan");
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEpisodes();
  }, []);

  useEffect(() => {
    if (selectedEpisode) {
      calculateStats(selectedEpisode);
    }
  }, [selectedEpisode]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const loadEpisodes = async () => {
    try {
      const response = await fetch("/api/episodes");
      const data = await response.json();
      setEpisodes(data);
      if (data.length > 0) {
        loadEpisode(data[0].id);
      }
    } catch (err) {
      setError("Erreur de chargement des épisodes");
    }
  };

  const loadEpisode = async (episodeId: string) => {
    try {
      const response = await fetch(`/api/episodes/${episodeId}`);
      const data = await response.json();
      setSelectedEpisode(data);
    } catch (err) {
      setError("Erreur de chargement de l'épisode");
    }
  };

  const calculateStats = (episode: Episode): GenerationStats => {
    const newStats: GenerationStats = {
      totalShots: episode.shots.length,
      totalVariations: 0,
      completedImages: 0,
      pendingImages: 0,
      failedImages: 0,
      generatingImages: 0,
      completedVideos: 0,
      pendingVideos: 0,
    };

    for (const shot of episode.shots) {
      for (const v of shot.variations) {
        newStats.totalVariations++;
        if (v.status === "completed" && v.imageUrl) {
          newStats.completedImages++;
          if (v.videoStatus === "completed") {
            newStats.completedVideos++;
          } else {
            newStats.pendingVideos++;
          }
        } else if (v.status === "failed") {
          newStats.failedImages++;
        } else if (v.status === "generating") {
          newStats.generatingImages++;
        } else {
          newStats.pendingImages++;
        }
      }
    }

    setStats(newStats);
    return newStats;
  };

  const generateAllImages = async () => {
    if (!selectedEpisode) return;

    setIsGeneratingImages(true);
    setError(null);
    addLog(`🚀 Démarrage de la génération pour "${selectedEpisode.title}"...`);

    try {
      const response = await fetch("/api/generate/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId: selectedEpisode.id,
          maxParallelShots: 3,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Échec de la génération");
      }

      addLog(`✅ Génération terminée: ${result.generated}/${result.total} images`);
      if (result.errors > 0) {
        addLog(`⚠️ ${result.errors} erreurs rencontrées`);
      }

      // Reload episode to update stats
      await loadEpisode(selectedEpisode.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      addLog(`❌ Erreur: ${message}`);
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const generateAllVideos = async () => {
    if (!selectedEpisode || !stats) return;

    setIsGeneratingVideos(true);
    setError(null);
    addLog(`🎬 Démarrage de la génération vidéo avec ${videoProvider}...`);

    try {
      // Get all variations with completed images but no videos
      const variationsToProcess: Array<{
        shotId: string;
        variation: Variation;
      }> = [];

      for (const shot of selectedEpisode.shots) {
        for (const v of shot.variations) {
          if (v.status === "completed" && v.imageUrl && v.videoStatus !== "completed") {
            variationsToProcess.push({ shotId: shot.id, variation: v });
          }
        }
      }

      addLog(`📋 ${variationsToProcess.length} vidéos à générer`);

      let completed = 0;
      let failed = 0;

      for (const item of variationsToProcess) {
        addLog(`⏳ Génération: Shot ${item.shotId} - ${item.variation.cameraAngle}...`);

        try {
          const response = await fetch("/api/video/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              episodeId: selectedEpisode.id,
              shotId: item.shotId,
              variationId: item.variation.id,
              provider: videoProvider,
              waitForCompletion: true,
              config: {
                sourceImage: item.variation.imageUrl,
                durationSeconds: 5,
                aspectRatio: "16:9",
              },
            }),
          });

          if (response.ok) {
            completed++;
            addLog(`✅ Vidéo générée (${completed}/${variationsToProcess.length})`);
          } else {
            failed++;
            const err = await response.json();
            addLog(`❌ Échec: ${err.error}`);
          }
        } catch {
          failed++;
          addLog(`❌ Erreur réseau`);
        }

        // Small delay between videos
        await new Promise((r) => setTimeout(r, 1000));
      }

      addLog(`🎬 Génération terminée: ${completed} succès, ${failed} échecs`);
      await loadEpisode(selectedEpisode.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      addLog(`❌ Erreur: ${message}`);
    } finally {
      setIsGeneratingVideos(false);
    }
  };

  const imageProgress = stats
    ? (stats.completedImages / stats.totalVariations) * 100
    : 0;
  const videoProgress = stats && stats.completedImages > 0
    ? (stats.completedVideos / stats.completedImages) * 100
    : 0;

  return (
    <div className="flex h-screen bg-[#0b0b0e]">
      <Sidebar episodes={episodes} onCreateEpisode={() => {}} />

      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="relative p-6 border-b border-blood-900/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-crimson-900/15 via-[#0b0b0e] to-blood-900/10" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-crimson-500 animate-pulse" />
                <span className="text-xs text-crimson-400 uppercase tracking-widest font-medium">
                  Génération SOTA
                </span>
              </div>
              <h1 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-crimson-400 via-blood-500 to-crimson-500 bg-clip-text text-transparent">
                  Générateur d&apos;Épisode
                </span>
              </h1>
              <p className="text-zinc-500 mt-1">
                Génère toutes les images et vidéos pour l&apos;épisode
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Episode Selector */}
              <div className="bg-zinc-900/50 rounded-xl p-6 border border-blood-900/20">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Film className="h-5 w-5 text-crimson-500" />
                  Épisode
                </h2>

                <Select
                  value={selectedEpisode?.id}
                  onValueChange={(id) => loadEpisode(id)}
                >
                  <SelectTrigger className="bg-zinc-800 border-blood-900/30">
                    <SelectValue placeholder="Sélectionner un épisode" />
                  </SelectTrigger>
                  <SelectContent>
                    {episodes.map((ep) => (
                      <SelectItem key={ep.id} value={ep.id}>
                        EP{ep.number} - {ep.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedEpisode && stats && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">
                        {stats.totalShots}
                      </div>
                      <div className="text-xs text-zinc-500">Shots</div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">
                        {stats.totalVariations}
                      </div>
                      <div className="text-xs text-zinc-500">Variations</div>
                    </div>
                    <div className="bg-emerald-900/30 rounded-lg p-3 text-center border border-emerald-500/20">
                      <div className="text-2xl font-bold text-emerald-400">
                        {stats.completedImages}
                      </div>
                      <div className="text-xs text-emerald-500/70">Images ✓</div>
                    </div>
                    <div className="bg-amber-900/30 rounded-lg p-3 text-center border border-amber-500/20">
                      <div className="text-2xl font-bold text-amber-400">
                        {stats.pendingImages + stats.failedImages}
                      </div>
                      <div className="text-xs text-amber-500/70">À générer</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Generation */}
              <div className="bg-zinc-900/50 rounded-xl p-6 border border-blood-900/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-crimson-500" />
                    Images (Replicate)
                  </h2>
                  <Badge
                    variant="outline"
                    className={
                      stats && stats.completedImages === stats.totalVariations
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }
                  >
                    {stats?.completedImages || 0} / {stats?.totalVariations || 0}
                  </Badge>
                </div>

                <Progress value={imageProgress} className="h-2 mb-4" />

                <div className="flex items-center gap-4">
                  <Button
                    onClick={generateAllImages}
                    disabled={isGeneratingImages || isGeneratingVideos || !selectedEpisode}
                    className="bg-crimson-600 hover:bg-crimson-700"
                  >
                    {isGeneratingImages ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Générer toutes les images
                      </>
                    )}
                  </Button>

                  {stats && stats.failedImages > 0 && (
                    <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                      <XCircle className="h-3 w-3 mr-1" />
                      {stats.failedImages} échecs
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-zinc-500 mt-3">
                  Utilise google/nano-banana-pro via Replicate. ~0.01$/image.
                </p>
              </div>

              {/* Video Generation */}
              <div className="bg-zinc-900/50 rounded-xl p-6 border border-blood-900/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Film className="h-5 w-5 text-emerald-500" />
                    Vidéos I2V
                  </h2>
                  <Badge
                    variant="outline"
                    className={
                      stats && stats.completedVideos === stats.completedImages
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }
                  >
                    {stats?.completedVideos || 0} / {stats?.completedImages || 0}
                  </Badge>
                </div>

                <Progress value={videoProgress} className="h-2 mb-4" />

                <div className="flex items-center gap-4 mb-4">
                  <Select value={videoProvider} onValueChange={setVideoProvider}>
                    <SelectTrigger className="w-[200px] bg-zinc-800 border-blood-900/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_PROVIDERS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.cost})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={generateAllVideos}
                    disabled={
                      isGeneratingVideos ||
                      isGeneratingImages ||
                      !selectedEpisode ||
                      (stats?.completedImages || 0) === 0
                    }
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isGeneratingVideos ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Générer toutes les vidéos
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-zinc-500">
                  Génère des vidéos 5s à partir des images. Coût variable selon provider.
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-300">Erreur</div>
                    <div className="text-sm text-red-400/80">{error}</div>
                  </div>
                </div>
              )}

              {/* Logs */}
              <div className="bg-zinc-900/50 rounded-xl p-6 border border-blood-900/20">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-zinc-500" />
                  Journal
                </h2>

                <ScrollArea className="h-48 bg-zinc-950 rounded-lg p-3 font-mono text-xs">
                  {logs.length === 0 ? (
                    <div className="text-zinc-600 italic">
                      Les logs de génération apparaîtront ici...
                    </div>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className="text-zinc-400 mb-1">
                        {log}
                      </div>
                    ))
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
