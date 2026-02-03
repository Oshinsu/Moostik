"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Play, Volume2, VolumeX } from "lucide-react";

// ============================================================================
// HOVER VIDEO PREVIEW - Netflix-style video preview on hover
// ============================================================================

interface HoverVideoPreviewProps {
  /** Static image to show before hover */
  imageUrl?: string;
  /** Video URL to play on hover */
  videoUrl?: string;
  /** Alt text for image */
  alt?: string;
  /** Delay before video starts playing (ms) */
  hoverDelay?: number;
  /** Whether to show mute toggle */
  showMuteToggle?: boolean;
  /** Aspect ratio */
  aspectRatio?: "video" | "square" | "portrait";
  /** Additional content to overlay */
  children?: ReactNode;
  /** ClassName for container */
  className?: string;
  /** Callback when preview starts playing */
  onPlayStart?: () => void;
  /** Callback when preview stops */
  onPlayStop?: () => void;
}

export function HoverVideoPreview({
  imageUrl,
  videoUrl,
  alt = "",
  hoverDelay = 800,
  showMuteToggle = false,
  aspectRatio = "video",
  children,
  className,
  onPlayStart,
  onPlayStop,
}: HoverVideoPreviewProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const aspectClass = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
  }[aspectRatio];

  // Handle hover start
  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoUrl) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsPlaying(true);
        onPlayStart?.();
      }, hoverDelay);
    }
  };

  // Handle hover end
  const handleMouseLeave = () => {
    setIsHovering(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsPlaying(false);
    setVideoLoaded(false);
    onPlayStop?.();

    // Reset video to beginning
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  };

  // Play/pause video based on isPlaying state
  useEffect(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked
        setIsPlaying(false);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // Update mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-zinc-900 group cursor-pointer",
        aspectClass,
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Static Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-500",
            isPlaying && videoLoaded ? "opacity-0 scale-105" : "opacity-100 scale-100",
            isHovering && !isPlaying && "scale-105"
          )}
        />
      )}

      {/* Fallback gradient if no image */}
      {!imageUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-blood-900/30 to-zinc-900" />
      )}

      {/* Video (hidden until playing) */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            isPlaying && videoLoaded ? "opacity-100" : "opacity-0"
          )}
          muted={isMuted}
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
        />
      )}

      {/* Play indicator (shows during hover delay) */}
      {isHovering && !isPlaying && videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
            <Play className="w-5 h-5 text-white ml-0.5" />
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isPlaying && !videoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-2 border-blood-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Mute toggle (Netflix-style bottom-right) */}
      {showMuteToggle && isPlaying && videoLoaded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted(!isMuted);
          }}
          className={cn(
            "absolute bottom-3 right-3 z-20",
            "w-8 h-8 rounded-full border border-white/50",
            "flex items-center justify-center",
            "bg-black/50 hover:bg-black/70 transition-colors",
            "opacity-0 group-hover:opacity-100"
          )}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-white" />
          ) : (
            <Volume2 className="w-4 h-4 text-white" />
          )}
        </button>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Hover scale effect border */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl border-2 transition-all duration-300 pointer-events-none",
          isHovering ? "border-blood-500/50 shadow-lg shadow-blood-900/30" : "border-transparent"
        )}
      />

      {/* Children content (info overlay) */}
      {children && (
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EPISODE PREVIEW CARD - Complete episode card with hover video
// ============================================================================

interface EpisodePreviewCardProps {
  title: string;
  episodeNumber?: number | string;
  duration?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  progress?: number; // 0-100
  isNew?: boolean;
  onClick?: () => void;
}

export function EpisodePreviewCard({
  title,
  episodeNumber,
  duration,
  description,
  imageUrl,
  videoUrl,
  progress,
  isNew,
  onClick,
}: EpisodePreviewCardProps) {
  return (
    <div onClick={onClick} className="group">
      <HoverVideoPreview
        imageUrl={imageUrl}
        videoUrl={videoUrl}
        alt={title}
        aspectRatio="video"
        showMuteToggle={!!videoUrl}
      >
        {/* Episode info overlay */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {episodeNumber && (
              <span className="text-xs font-bold text-blood-400">
                EP {episodeNumber}
              </span>
            )}
            {isNew && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-900/50 px-1.5 py-0.5 rounded">
                NEW
              </span>
            )}
            {duration && (
              <span className="text-xs text-zinc-500 ml-auto">
                {duration}
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-blood-300 transition-colors">
            {title}
          </h4>
          {description && (
            <p className="text-xs text-zinc-400 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {description}
            </p>
          )}
        </div>
      </HoverVideoPreview>

      {/* Progress bar (if partially watched) */}
      {progress !== undefined && progress > 0 && (
        <div className="h-1 bg-zinc-800 rounded-b-xl overflow-hidden -mt-1">
          <div
            className="h-full bg-blood-500 transition-all duration-300"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SHOT PREVIEW CARD - For individual shots/scenes
// ============================================================================

interface ShotPreviewCardProps {
  shotNumber: number;
  imageUrl?: string;
  videoUrl?: string;
  sceneType?: string;
  cameraAngle?: string;
  onClick?: () => void;
}

export function ShotPreviewCard({
  shotNumber,
  imageUrl,
  videoUrl,
  sceneType,
  cameraAngle,
  onClick,
}: ShotPreviewCardProps) {
  return (
    <div onClick={onClick}>
      <HoverVideoPreview
        imageUrl={imageUrl}
        videoUrl={videoUrl}
        alt={`Shot ${shotNumber}`}
        aspectRatio="video"
        hoverDelay={500}
      >
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-mono text-blood-400">
              SHOT {shotNumber.toString().padStart(3, "0")}
            </span>
            {sceneType && (
              <p className="text-xs text-zinc-500 capitalize">{sceneType}</p>
            )}
          </div>
          {cameraAngle && (
            <span className="text-xs text-zinc-600 font-mono uppercase">
              {cameraAngle}
            </span>
          )}
        </div>
      </HoverVideoPreview>
    </div>
  );
}
