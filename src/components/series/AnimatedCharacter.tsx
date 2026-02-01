"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

// ============================================================================
// TYPES
// ============================================================================

export interface AnimatedCharacterProps {
  id: string;
  name: string;
  type: "moostik" | "human";
  role?: string;
  description?: string;
  /** Static reference image */
  staticImage?: string;
  /** Animated portrait video (loops on hover) */
  animatedVideo?: string;
  /** Additional expression images */
  expressions?: {
    id: string;
    name: string;
    image: string;
  }[];
  /** Link to character page */
  href?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Show details on hover */
  showDetails?: boolean;
  /** Custom className */
  className?: string;
}

// ============================================================================
// SIZE CONFIGS
// ============================================================================

const sizeConfig = {
  sm: { card: "w-32", image: "h-32", title: "text-sm", desc: "text-xs" },
  md: { card: "w-48", image: "h-48", title: "text-base", desc: "text-xs" },
  lg: { card: "w-64", image: "h-64", title: "text-lg", desc: "text-sm" },
  xl: { card: "w-80", image: "h-80", title: "text-xl", desc: "text-sm" },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function AnimatedCharacter({
  id,
  name,
  type,
  role,
  description,
  staticImage,
  animatedVideo,
  expressions = [],
  href,
  size = "md",
  showDetails = true,
  className = "",
}: AnimatedCharacterProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentExpression, setCurrentExpression] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const config = sizeConfig[size];

  // Handle video playback
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isHovered && animatedVideo) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, animatedVideo]);

  // Cycle expressions when no video
  useEffect(() => {
    if (!isHovered || animatedVideo || expressions.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentExpression((prev) => (prev + 1) % expressions.length);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isHovered, animatedVideo, expressions]);

  // Get current display image
  const displayImage = isHovered && expressions.length > 0 && !animatedVideo
    ? expressions[currentExpression]?.image || staticImage
    : staticImage;

  const Wrapper = href ? Link : "div";
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className={`
          ${config.card}
          bg-zinc-900/30 border-zinc-800 overflow-hidden
          transition-all duration-300 group
          ${isHovered ? "border-blood-700/50 scale-105 shadow-lg shadow-blood-900/20" : ""}
        `}
      >
        {/* Image/Video Container */}
        <div className={`relative ${config.image} overflow-hidden`}>
          {/* Static Image */}
          {staticImage && (
            <img
              src={displayImage}
              alt={name}
              className={`
                w-full h-full object-cover transition-all duration-500
                ${isHovered && animatedVideo && isVideoLoaded ? "opacity-0" : "opacity-100"}
                ${isHovered ? "scale-110" : "scale-100"}
              `}
            />
          )}

          {/* Animated Video */}
          {animatedVideo && (
            <video
              ref={videoRef}
              loop
              muted
              playsInline
              onLoadedData={() => setIsVideoLoaded(true)}
              className={`
                absolute inset-0 w-full h-full object-cover transition-opacity duration-300
                ${isHovered && isVideoLoaded ? "opacity-100" : "opacity-0"}
              `}
            >
              <source src={animatedVideo} type="video/mp4" />
            </video>
          )}

          {/* Placeholder if no image */}
          {!staticImage && (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <span className="text-5xl opacity-30">
                {type === "moostik" ? "🦟" : "👤"}
              </span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Type badge */}
          <Badge
            className={`
              absolute top-2 right-2 text-[9px]
              ${type === "moostik"
                ? "bg-amber-900/80 text-amber-300 border-amber-700/50"
                : "bg-blue-900/80 text-blue-300 border-blue-700/50"
              }
            `}
          >
            {type === "moostik" ? "MOOSTIK" : "HUMAIN"}
          </Badge>

          {/* Hover glow effect */}
          <div
            className={`
              absolute inset-0 bg-blood-600/10 transition-opacity duration-300
              ${isHovered ? "opacity-100" : "opacity-0"}
            `}
          />
        </div>

        {/* Details */}
        {showDetails && (
          <div className="p-4">
            <h3 className={`font-bold text-white ${config.title} truncate`}>
              {name}
            </h3>
            {role && (
              <p className="text-blood-400 text-xs mb-1 truncate">{role}</p>
            )}
            {description && (
              <p className={`text-zinc-500 ${config.desc} line-clamp-2`}>
                {description.slice(0, 80)}...
              </p>
            )}
          </div>
        )}
      </Card>
    </Wrapper>
  );
}

// ============================================================================
// CHARACTER GRID COMPONENT
// ============================================================================

export interface CharacterGridProps {
  characters: AnimatedCharacterProps[];
  columns?: number;
  size?: AnimatedCharacterProps["size"];
  basePath?: string;
  className?: string;
}

export function CharacterGrid({
  characters,
  columns = 5,
  size = "md",
  basePath = "/series/characters",
  className = "",
}: CharacterGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-4 lg:grid-cols-6",
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[5]} gap-4 ${className}`}>
      {characters.map((char) => (
        <AnimatedCharacter
          key={char.id}
          {...char}
          size={size}
          href={`${basePath}/${char.id}`}
        />
      ))}
    </div>
  );
}

export default AnimatedCharacter;
