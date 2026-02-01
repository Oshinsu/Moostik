"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SkeletonImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  showMetadata?: boolean;
  metadata?: {
    seed?: number;
    resolution?: string;
    prompt?: string;
    category?: string;
  };
  onClick?: () => void;
}

export function SkeletonImage({
  src,
  alt,
  className,
  aspectRatio = "video",
  showMetadata = false,
  metadata,
  onClick,
}: SkeletonImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset loaded state when src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[2/3]",
    auto: "",
  };

  if (!src) {
    return (
      <div
        className={cn(
          "relative bg-gradient-to-br from-zinc-900 to-zinc-950 overflow-hidden",
          aspectClasses[aspectRatio],
          className
        )}
      >
        {/* Empty state skeleton */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-2">
              <svg
                className="w-6 h-6 text-zinc-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-zinc-600 text-[10px] uppercase tracking-wider">
              Pending
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden group",
        aspectClasses[aspectRatio],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Skeleton loader (shown while loading) */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-zinc-900 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-shimmer" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blood-900 border-t-blood-500 rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-red-900/20 flex items-center justify-center">
          <div className="text-center">
            <svg
              className="w-8 h-8 text-red-500 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-red-400 text-xs">Load Error</span>
          </div>
        </div>
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
          "group-hover:scale-105"
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />

      {/* Hover overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Metadata tooltip (SOTA hover preview) */}
      {showMetadata && metadata && showTooltip && loaded && (
        <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-0 opacity-100 transition-all duration-300">
          <div className="bg-black/90 backdrop-blur-sm rounded-lg p-3 border border-zinc-800">
            {metadata.category && (
              <span className="text-blood-400 text-[9px] uppercase tracking-wider block mb-1">
                {metadata.category}
              </span>
            )}
            {metadata.seed && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                <span className="text-amber-400 font-mono">SEED: {metadata.seed}</span>
              </div>
            )}
            {metadata.resolution && (
              <div className="text-[10px] text-zinc-500">{metadata.resolution}</div>
            )}
            {metadata.prompt && (
              <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 italic">
                {metadata.prompt}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// CSS for shimmer animation (add to globals.css)
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// }
// .animate-shimmer {
//   animation: shimmer 1.5s infinite;
// }
