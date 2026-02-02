"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  ArrowLeft,
  Share2,
  Heart,
  ChevronRight,
  Info,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  shots: Shot[];
}

interface Shot {
  id: string;
  name: string;
  number: number;
  variations: Variation[];
}

interface Variation {
  id: string;
  imageUrl?: string;
  videoUrl?: string;
  cameraAngle: string;
  status: string;
}

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  shotName: string;
  shotNumber: number;
  duration: number; // seconds
}

// ============================================================================
// CONSTANTS
// ============================================================================

const IMAGE_DISPLAY_DURATION = 4; // seconds per image
const TRANSITION_DURATION = 0.8; // fade transition

// ============================================================================
// COMPONENT
// ============================================================================

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  useEffect(() => {
    async function fetchEpisode() {
      try {
        const res = await fetch(`/api/episodes/${episodeId}`);
        if (!res.ok) throw new Error("Episode not found");

        const data = await res.json();
        setEpisode(data);

        // Build media playlist from completed variations
        const playlist: MediaItem[] = [];
        let accumulatedDuration = 0;

        for (const shot of data.shots || []) {
          // Find best variation (prefer video, then image)
          const videoVariation = shot.variations?.find(
            (v: Variation) => v.videoUrl && v.status === "completed"
          );
          const imageVariation = shot.variations?.find(
            (v: Variation) => v.imageUrl && v.status === "completed"
          );

          if (videoVariation?.videoUrl) {
            playlist.push({
              id: `${shot.id}-${videoVariation.id}`,
              type: "video",
              url: videoVariation.videoUrl,
              shotName: shot.name,
              shotNumber: shot.number,
              duration: 5, // Will be updated when video loads
            });
            accumulatedDuration += 5;
          } else if (imageVariation?.imageUrl) {
            playlist.push({
              id: `${shot.id}-${imageVariation.id}`,
              type: "image",
              url: imageVariation.imageUrl,
              shotName: shot.name,
              shotNumber: shot.number,
              duration: IMAGE_DISPLAY_DURATION,
            });
            accumulatedDuration += IMAGE_DISPLAY_DURATION;
          }
        }

        setMediaItems(playlist);
        setTotalDuration(accumulatedDuration);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load episode");
      } finally {
        setLoading(false);
      }
    }

    if (episodeId) {
      fetchEpisode();
    }
  }, [episodeId]);

  // ========================================================================
  // PLAYBACK LOGIC
  // ========================================================================

  const currentMedia = mediaItems[currentIndex];

  // Calculate progress based on current position in playlist
  const calculateTotalProgress = useCallback(() => {
    if (mediaItems.length === 0) return 0;

    let elapsed = 0;
    for (let i = 0; i < currentIndex; i++) {
      elapsed += mediaItems[i].duration;
    }
    elapsed += currentTime;

    return totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;
  }, [currentIndex, currentTime, mediaItems, totalDuration]);

  // Move to next media item
  const goToNext = useCallback(() => {
    if (currentIndex < mediaItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentTime(0);
    } else {
      // End of episode
      setIsPlaying(false);
      setCurrentIndex(0);
      setCurrentTime(0);
    }
  }, [currentIndex, mediaItems.length]);

  // Move to previous media item
  const goToPrevious = useCallback(() => {
    if (currentTime > 2) {
      // If more than 2s into current, restart it
      setCurrentTime(0);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    } else if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentTime(0);
    }
  }, [currentIndex, currentTime]);

  // Handle image slideshow
  useEffect(() => {
    if (!isPlaying || !currentMedia || currentMedia.type !== "image") {
      if (imageTimerRef.current) {
        clearInterval(imageTimerRef.current);
        imageTimerRef.current = null;
      }
      return;
    }

    imageTimerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= IMAGE_DISPLAY_DURATION) {
          goToNext();
          return 0;
        }
        return prev + 0.1;
      });
    }, 100);

    return () => {
      if (imageTimerRef.current) {
        clearInterval(imageTimerRef.current);
      }
    };
  }, [isPlaying, currentMedia, goToNext]);

  // Handle video playback
  useEffect(() => {
    if (!videoRef.current || !currentMedia || currentMedia.type !== "video") return;

    if (isPlaying) {
      videoRef.current.play().catch(console.error);
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, currentMedia]);

  // Update progress
  useEffect(() => {
    setProgress(calculateTotalProgress());
  }, [calculateTotalProgress]);

  // ========================================================================
  // CONTROLS
  // ========================================================================

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
  }, [isPlaying, resetControlsTimeout]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "Escape":
          if (isFullscreen) toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, isFullscreen]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate elapsed time
  const getElapsedTime = () => {
    let elapsed = 0;
    for (let i = 0; i < currentIndex; i++) {
      elapsed += mediaItems[i].duration;
    }
    return elapsed + currentTime;
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blood-900 border-t-blood-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm uppercase tracking-widest">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error || "Episode non trouvé"}</p>
          <Link href="/series">
            <Button variant="outline" className="border-zinc-700 text-white">
              ← Retour à la série
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🎬</div>
          <h1 className="text-2xl font-bold text-white mb-2">Épisode en production</h1>
          <p className="text-zinc-500 mb-6">
            L'épisode {episode.number} n'est pas encore prêt. Revenez bientôt !
          </p>
          <Link href={`/ep0`}>
            <Button className="moostik-btn-blood text-white">
              Voir les images générées →
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-black text-white overflow-hidden"
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
    >
      {/* ================================================================ */}
      {/* MEDIA DISPLAY */}
      {/* ================================================================ */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        {currentMedia?.type === "video" ? (
          <video
            ref={videoRef}
            src={currentMedia.url}
            className="max-w-full max-h-full object-contain"
            muted={isMuted}
            onEnded={goToNext}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => {
              // Update duration for this video
              const videoDuration = e.currentTarget.duration;
              setMediaItems((prev) =>
                prev.map((item, i) =>
                  i === currentIndex ? { ...item, duration: videoDuration } : item
                )
              );
            }}
          />
        ) : currentMedia?.type === "image" ? (
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              backgroundImage: `url(${currentMedia.url})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        ) : null}

        {/* Ken Burns effect overlay for images */}
        {currentMedia?.type === "image" && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 pointer-events-none" />
        )}
      </div>

      {/* ================================================================ */}
      {/* TOP BAR */}
      {/* ================================================================ */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Back button */}
            <Link href="/series">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Button>
            </Link>

            {/* Episode info */}
            <div className="flex-1 text-center">
              <Badge className="bg-blood-600/80 text-white border-0 mb-1">
                ÉPISODE {episode.number}
              </Badge>
              <h1 className="text-lg font-bold text-white">{episode.title}</h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => setShowInfo(!showInfo)}
              >
                <Info className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`hover:bg-white/10 ${isLiked ? "text-blood-500" : "text-white/80 hover:text-white"}`}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* CENTER PLAY BUTTON (when paused) */}
      {/* ================================================================ */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 transition-opacity hover:bg-black/50"
        >
          <div className="w-24 h-24 rounded-full bg-blood-600/90 flex items-center justify-center hover:bg-blood-500 transition-colors shadow-2xl">
            <Play className="w-12 h-12 text-white ml-1" />
          </div>
        </button>
      )}

      {/* ================================================================ */}
      {/* SHOT INFO OVERLAY */}
      {/* ================================================================ */}
      <div
        className={`absolute left-6 bottom-32 z-20 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <Badge className="bg-black/60 text-white/80 border-0 text-xs mb-2">
          Shot #{currentMedia?.shotNumber.toString().padStart(2, "0")}
        </Badge>
        <p className="text-white/60 text-sm max-w-xs">{currentMedia?.shotName}</p>
      </div>

      {/* ================================================================ */}
      {/* BOTTOM CONTROLS */}
      {/* ================================================================ */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
          {/* Progress bar */}
          <div className="max-w-7xl mx-auto mb-4">
            <div className="relative h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer group">
              <div
                className="absolute h-full bg-blood-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
              {/* Hover preview dots for each shot */}
              <div className="absolute inset-0 flex">
                {mediaItems.map((_, i) => {
                  const startPercent =
                    (mediaItems.slice(0, i).reduce((a, b) => a + b.duration, 0) / totalDuration) *
                    100;
                  return (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white/40 rounded-full top-0 -translate-y-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `${startPercent}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Time display */}
            <div className="flex justify-between text-xs text-white/60 mt-2">
              <span>{formatTime(getElapsedTime())}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={goToPrevious}
              >
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 w-12 h-12"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={goToNext}
              >
                <SkipForward className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 ml-2"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>

            {/* Center - Shot counter */}
            <div className="text-sm text-white/60">
              <span className="text-white font-bold">{currentIndex + 1}</span>
              <span> / {mediaItems.length} shots</span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Settings className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* INFO PANEL (slide in from right) */}
      {/* ================================================================ */}
      <div
        className={`absolute top-0 right-0 bottom-0 w-96 bg-black/95 border-l border-white/10 z-30 transform transition-transform duration-300 ${
          showInfo ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">À propos</h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white"
              onClick={() => setShowInfo(false)}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Episode info */}
            <div>
              <Badge className="bg-blood-900/50 text-blood-400 border-blood-700/30 mb-2">
                ÉPISODE {episode.number}
              </Badge>
              <h3 className="text-2xl font-bold mb-2">{episode.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{episode.description}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-zinc-500 uppercase">Durée</p>
                <p className="text-xl font-bold">{formatTime(totalDuration)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-zinc-500 uppercase">Shots</p>
                <p className="text-xl font-bold">{mediaItems.length}</p>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-2">
              <Link href={`/ep0`}>
                <Button
                  variant="outline"
                  className="w-full border-zinc-700 text-white hover:bg-zinc-800 justify-start"
                >
                  🖼 Voir la galerie complète
                </Button>
              </Link>
              <Link href="/series/characters">
                <Button
                  variant="outline"
                  className="w-full border-zinc-700 text-white hover:bg-zinc-800 justify-start"
                >
                  👥 Découvrir les personnages
                </Button>
              </Link>
              <Link href="/lore">
                <Button
                  variant="outline"
                  className="w-full border-zinc-700 text-white hover:bg-zinc-800 justify-start"
                >
                  📖 Explorer le lore
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* KEYBOARD SHORTCUTS HINT */}
      {/* ================================================================ */}
      <div
        className={`absolute bottom-32 right-6 z-20 transition-opacity duration-300 ${
          showControls && !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-black/60 rounded-lg p-3 text-xs text-white/60 space-y-1">
          <p>
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded mr-2">Espace</kbd> Play/Pause
          </p>
          <p>
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded mr-2">← →</kbd> Prev/Next
          </p>
          <p>
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded mr-2">F</kbd> Fullscreen
          </p>
          <p>
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded mr-2">M</kbd> Mute
          </p>
        </div>
      </div>
    </div>
  );
}
