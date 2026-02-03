"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// HORIZONTAL CAROUSEL - Netflix-style infinite scroll rows
// ============================================================================

interface HorizontalCarouselProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  itemClassName?: string;
  showArrows?: boolean;
  showGradients?: boolean;
  gap?: "sm" | "md" | "lg";
}

export function HorizontalCarousel({
  children,
  title,
  subtitle,
  className,
  showArrows = true,
  showGradients = true,
  gap = "md",
}: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const gapClass = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  }[gap];

  // Check scroll position
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (ref) ref.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [children]);

  // Scroll by one viewport width
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={cn("relative group", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-4 px-4 md:px-0">
          {title && (
            <h3 className="text-xl md:text-2xl font-bold text-white">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
          )}
        </div>
      )}

      {/* Scroll container */}
      <div className="relative">
        {/* Left gradient + arrow */}
        {showGradients && canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-[#0b0b0e] to-transparent z-10 pointer-events-none" />
        )}
        {showArrows && canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-20",
              "w-10 h-10 md:w-12 md:h-12 rounded-full",
              "bg-black/80 hover:bg-blood-900/80 border border-zinc-700/50",
              "flex items-center justify-center",
              "transition-all duration-200",
              "opacity-0 group-hover:opacity-100",
              "hover:scale-110 active:scale-95"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className={cn(
            "flex overflow-x-auto scrollbar-hide",
            "scroll-smooth snap-x snap-mandatory",
            "px-4 md:px-0",
            gapClass
          )}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {children}
        </div>

        {/* Right gradient + arrow */}
        {showGradients && canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-[#0b0b0e] to-transparent z-10 pointer-events-none" />
        )}
        {showArrows && canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-20",
              "w-10 h-10 md:w-12 md:h-12 rounded-full",
              "bg-black/80 hover:bg-blood-900/80 border border-zinc-700/50",
              "flex items-center justify-center",
              "transition-all duration-200",
              "opacity-0 group-hover:opacity-100",
              "hover:scale-110 active:scale-95"
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CAROUSEL ITEM - Consistent card wrapper for carousel items
// ============================================================================

interface CarouselItemProps {
  children: ReactNode;
  className?: string;
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  width?: "sm" | "md" | "lg" | "xl";
}

export function CarouselItem({
  children,
  className,
  aspectRatio = "video",
  width = "md",
}: CarouselItemProps) {
  const widthClass = {
    sm: "w-40 md:w-48",
    md: "w-56 md:w-64",
    lg: "w-72 md:w-80",
    xl: "w-80 md:w-96",
  }[width];

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: "",
  }[aspectRatio];

  return (
    <div
      className={cn(
        "flex-shrink-0 snap-start",
        widthClass,
        className
      )}
    >
      <div className={cn("relative overflow-hidden rounded-xl", aspectClass)}>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// CHARACTER CARD - Netflix-style character display
// ============================================================================

interface CharacterCardProps {
  name: string;
  role?: string;
  imageUrl?: string;
  color?: string;
  onClick?: () => void;
}

export function CharacterCard({
  name,
  role,
  imageUrl,
  color = "blood",
  onClick,
}: CharacterCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer",
        "transition-all duration-300",
        "hover:scale-105 hover:z-10"
      )}
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-900">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-b from-${color}-900/50 to-zinc-900 flex items-center justify-center`}>
            <span className="text-6xl opacity-50">🦟</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

        {/* Hover overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-blood-900/60 to-transparent",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        )} />

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h4 className="text-lg font-bold text-white truncate">{name}</h4>
          {role && (
            <p className="text-sm text-zinc-400 truncate group-hover:text-blood-300 transition-colors">
              {role}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LOCATION CARD - Netflix-style location/backdrop display
// ============================================================================

interface LocationCardProps {
  name: string;
  description?: string;
  imageUrl?: string;
  onClick?: () => void;
}

export function LocationCard({
  name,
  description,
  imageUrl,
  onClick,
}: LocationCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer",
        "transition-all duration-300",
        "hover:scale-[1.02] hover:z-10"
      )}
    >
      {/* Image container */}
      <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <span className="text-4xl opacity-30">🏛️</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Hover border glow */}
        <div className={cn(
          "absolute inset-0 rounded-xl border-2 border-blood-500/0",
          "group-hover:border-blood-500/50 transition-all duration-300"
        )} />

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h4 className="text-lg font-bold text-white">{name}</h4>
          {description && (
            <p className="text-sm text-zinc-400 line-clamp-2 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
