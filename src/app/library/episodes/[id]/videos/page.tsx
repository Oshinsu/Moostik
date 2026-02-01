"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  Search,
  Grid3X3,
  LayoutList,
  Image as ImageIcon,
  Video,
  Play,
  Check,
  Filter,
  ChevronRight,
  Maximize2,
  ArrowLeft,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCameraAngleLabel } from "@/data/camera-angles";
import { StatusBadge } from "@/components/shared";
import type { Episode, Shot } from "@/types";

/** Item vidéo pour l'affichage dans la grille */
interface VideoItem {
  id: string;
  shotId: string;
  shotNumber: number;
  shotName: string;
  variationId: string;
  cameraAngle: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: string;
  provider?: string;
  duration?: number;
  generatedAt?: string;
  actTitle: string;
}

export default function EpisodeVideosPage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAct, setFilterAct] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Load episode data
  useEffect(() => {
    loadEpisode();
    loadEpisodes();
  }, [episodeId]);

  const loadEpisodes = async () => {
    try {
      const res = await fetch(`/api/episodes`);
      if (res.ok) {
        const data = await res.json();
        setEpisodes(data);
      }
    } catch (err) {
      console.error("Failed to load episodes:", err);
    }
  };

  const loadEpisode = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/episodes/${episodeId}`);
      if (res.ok) {
        const data = await res.json();
        setEpisode(data);
      }
    } catch (error) {
      console.error("Erreur chargement épisode:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get all videos from shots
  const getAllVideos = useCallback((): VideoItem[] => {
    if (!episode) return [];

    const videos: VideoItem[] = [];

    for (const shot of episode.shots) {
      const act = episode.acts?.find((a) =>
        a.shotIds?.includes(`shot-${String(shot.number).padStart(3, "0")}`)
      );

      for (const variation of shot.variations) {
        // Only include variations that have video data or are candidates for video generation
        if (variation.videoUrl || variation.videoStatus || variation.imageUrl) {
          videos.push({
            id: `${shot.id}-${variation.id}-video`,
            shotId: shot.id,
            shotNumber: shot.number,
            shotName: shot.name,
            variationId: variation.id,
            cameraAngle: variation.cameraAngle,
            videoUrl: variation.videoUrl,
            thumbnailUrl: variation.imageUrl,
            status: variation.videoStatus || (variation.imageUrl ? "ready" : "no_image"),
            provider: variation.videoProvider,
            duration: shot.durationSeconds, // Use shot duration
            generatedAt: variation.videoGeneratedAt,
            actTitle: act?.title || "Sans acte",
          });
        }
      }
    }

    return videos;
  }, [episode]);

  // Filter videos
  const filteredVideos = getAllVideos().filter((video) => {
    if (filterStatus !== "all" && video.status !== filterStatus) return false;

    if (filterAct !== "all") {
      const act = episode?.acts?.find((a) => a.id === filterAct);
      if (
        !act?.shotIds.includes(
          `shot-${String(video.shotNumber).padStart(3, "0")}`
        )
      )
        return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        video.shotName.toLowerCase().includes(query) ||
        video.cameraAngle.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Stats
  const allVideos = getAllVideos();
  const stats = {
    total: allVideos.length,
    completed: allVideos.filter((v) => v.status === "completed").length,
    ready: allVideos.filter((v) => v.status === "ready").length,
    generating: allVideos.filter((v) => v.status === "generating").length,
    failed: allVideos.filter((v) => v.status === "failed").length,
  };

  const progressPercent =
    stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  // Download function
  const downloadVideo = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${filename}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      window.open(url, "_blank");
    }
  };

  // Selection
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedVideos);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedVideos(newSelection);
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0b0b0e]">
        <Sidebar episodes={episodes} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-crimson-500" />
        </main>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="flex h-screen bg-[#0b0b0e]">
        <Sidebar episodes={episodes} />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <XCircle className="h-16 w-16 text-red-500/50" />
          <p className="text-zinc-400">Épisode non trouvé</p>
          <Button variant="outline" onClick={() => router.push("/library")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la bibliothèque
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0b0b0e]">
      <Sidebar episodes={episodes} />

      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="relative p-6 border-b border-blood-900/30 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/15 via-[#0b0b0e] to-crimson-900/10" />
            <div className="absolute inset-0 opacity-15">
              <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-purple-700/50 via-crimson-600/30 to-transparent animate-pulse" />
            </div>

            <div className="relative">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
                <Link
                  href="/library"
                  className="hover:text-crimson-400 transition-colors"
                >
                  Bibliothèque
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-purple-400">
                  EP{episode.number} - Vidéos
                </span>
              </div>

              {/* Title */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-xs text-purple-400 uppercase tracking-widest font-medium">
                      Vidéos de l'Épisode
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold">
                    <span className="bg-gradient-to-r from-purple-400 via-crimson-500 to-purple-500 bg-clip-text text-transparent">
                      EP{episode.number}: {episode.title}
                    </span>
                  </h1>
                  <p className="text-zinc-500 mt-1">
                    {stats.completed} / {stats.total} vidéos générées
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                          onClick={() =>
                            router.push(`/library/episodes/${episodeId}/images`)
                          }
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Voir les images
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Accéder aux images de cet épisode
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="outline"
                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                    onClick={() => router.push(`/video`)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Générer des vidéos
                  </Button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-zinc-400">Progression</span>
                  <span className="text-purple-400">
                    {progressPercent.toFixed(0)}%
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>

              {/* Stats */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300 text-sm">
                    {stats.completed} complétées
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-300 text-sm">
                    {stats.ready} prêtes
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <Loader2 className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-300 text-sm">
                    {stats.generating} en cours
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-lg border border-red-500/30">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-300 text-sm">
                    {stats.failed} échouées
                  </span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="Rechercher par nom, angle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#14131a] border-blood-900/30 focus:border-purple-600"
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-[#14131a] border-blood-900/30">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="completed">Complétées</SelectItem>
                    <SelectItem value="ready">Prêtes à générer</SelectItem>
                    <SelectItem value="generating">En cours</SelectItem>
                    <SelectItem value="failed">Échouées</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterAct} onValueChange={setFilterAct}>
                  <SelectTrigger className="w-48 bg-[#14131a] border-blood-900/30">
                    <SelectValue placeholder="Acte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les actes</SelectItem>
                    {episode.acts?.map((act) => (
                      <SelectItem key={act.id} value={act.id}>
                        {act.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex border border-blood-900/30 rounded-md overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-purple-600" : ""}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-purple-600" : ""}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                <Video className="h-16 w-16 mb-4 opacity-50" />
                <p>Aucune vidéo trouvée</p>
                <p className="text-sm mt-2">
                  Générez d&apos;abord des images, puis convertissez-les en vidéos
                </p>
                <Button
                  variant="outline"
                  className="mt-4 border-purple-500/50 text-purple-400"
                  onClick={() => router.push("/video")}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Aller au générateur vidéo
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className={cn(
                      "group relative bg-[#14131a] rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                      selectedVideos.has(video.id)
                        ? "border-purple-500 ring-2 ring-purple-500/50"
                        : "border-blood-900/30 hover:border-purple-700/50"
                    )}
                    onClick={() => toggleSelection(video.id)}
                  >
                    {/* Selection indicator */}
                    <div
                      className={cn(
                        "absolute top-2 left-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        selectedVideos.has(video.id)
                          ? "bg-purple-500 border-purple-500"
                          : "bg-black/50 border-white/50 opacity-0 group-hover:opacity-100"
                      )}
                    >
                      {selectedVideos.has(video.id) && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-2 right-2 z-10">
                      <StatusBadge status={video.status} variant="video" />
                    </div>

                    {/* Video thumbnail / preview */}
                    <div className="aspect-video relative bg-black">
                      {video.thumbnailUrl ? (
                        <>
                          <img
                            src={video.thumbnailUrl}
                            alt={video.shotName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {/* Play overlay for completed videos */}
                          {video.status === "completed" && video.videoUrl && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-14 h-14 rounded-full bg-purple-500/90 flex items-center justify-center">
                                <Play className="h-7 w-7 text-white ml-1" />
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-8 w-8 text-zinc-700" />
                        </div>
                      )}

                      {/* Duration badge */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs text-white">
                          {formatDuration(video.duration)}
                        </div>
                      )}

                      {/* Hover actions */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 flex gap-2">
                          {video.status === "completed" && video.videoUrl && (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedVideo(video);
                                }}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadVideo(
                                    video.videoUrl!,
                                    `ep${episode.number}-shot${video.shotNumber}-${video.cameraAngle}`
                                  );
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/30"
                        >
                          Shot {video.shotNumber}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs bg-amber-500/10 text-amber-300 border-amber-500/30"
                        >
                          {getCameraAngleLabel(video.cameraAngle)}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-medium text-white truncate">
                        {video.shotName}
                      </h3>
                      <p className="text-xs text-zinc-500 truncate">
                        {video.actTitle}
                        {video.provider && ` • ${video.provider}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className={cn(
                      "flex items-center gap-4 p-3 bg-[#14131a] rounded-lg border-2 transition-all cursor-pointer",
                      selectedVideos.has(video.id)
                        ? "border-purple-500 ring-2 ring-purple-500/50"
                        : "border-blood-900/30 hover:border-purple-700/50"
                    )}
                    onClick={() => toggleSelection(video.id)}
                  >
                    {/* Selection */}
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        selectedVideos.has(video.id)
                          ? "bg-purple-500 border-purple-500"
                          : "bg-zinc-800 border-zinc-600"
                      )}
                    >
                      {selectedVideos.has(video.id) && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div className="w-32 h-18 rounded overflow-hidden flex-shrink-0 bg-black relative">
                      {video.thumbnailUrl ? (
                        <>
                          <img
                            src={video.thumbnailUrl}
                            alt={video.shotName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {video.status === "completed" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="h-6 w-6 text-white/80" />
                            </div>
                          )}
                          {video.duration && (
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white">
                              {formatDuration(video.duration)}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-6 w-6 text-zinc-700" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/30"
                        >
                          Shot {video.shotNumber}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs bg-amber-500/10 text-amber-300 border-amber-500/30"
                        >
                          {getCameraAngleLabel(video.cameraAngle)}
                        </Badge>
                        <StatusBadge status={video.status} variant="video" />
                      </div>
                      <h3 className="font-medium text-white truncate">
                        {video.shotName}
                      </h3>
                      <p className="text-sm text-zinc-400 truncate">
                        {video.actTitle}
                        {video.provider && ` • Provider: ${video.provider}`}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {video.status === "completed" && video.videoUrl && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVideo(video);
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadVideo(
                                video.videoUrl!,
                                `ep${episode.number}-shot${video.shotNumber}-${video.cameraAngle}`
                              );
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Video Player Dialog */}
      <Dialog
        open={!!selectedVideo}
        onOpenChange={() => {
          setSelectedVideo(null);
          setIsPlaying(false);
        }}
      >
        <DialogContent className="max-w-4xl bg-[#0b0b0e] border-purple-900/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-purple-500/10 text-purple-300 border-purple-500/30"
              >
                Shot {selectedVideo?.shotNumber}
              </Badge>
              <span className="text-white">{selectedVideo?.shotName}</span>
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-300 border-amber-500/30"
              >
                {getCameraAngleLabel(selectedVideo?.cameraAngle || "")}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Video player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {selectedVideo?.videoUrl ? (
                <video
                  src={selectedVideo.videoUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="h-16 w-16 text-zinc-700" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-1">
                  Durée
                </h4>
                <p className="text-white">
                  {formatDuration(selectedVideo?.duration)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-1">
                  Provider
                </h4>
                <p className="text-white">{selectedVideo?.provider || "N/A"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-1">
                  Généré le
                </h4>
                <p className="text-white">
                  {selectedVideo?.generatedAt
                    ? new Date(selectedVideo.generatedAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  window.open(selectedVideo?.videoUrl, "_blank")
                }
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Plein écran
              </Button>
              {selectedVideo?.videoUrl && (
                <Button
                  onClick={() =>
                    downloadVideo(
                      selectedVideo.videoUrl!,
                      `ep${episode.number}-shot${selectedVideo.shotNumber}-${selectedVideo.cameraAngle}`
                    )
                  }
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger MP4
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
