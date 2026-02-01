"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================================
// TYPES
// ============================================================================

export interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  shotNumber?: number;
  sceneType?: string;
  cameraAngle?: string;
  hasVideo?: boolean;
  videoUrl?: string;
  characters?: string[];
  locations?: string[];
  tags?: string[];
}

export interface CinematicGalleryProps {
  images: GalleryImage[];
  /** Layout style */
  layout?: "grid" | "masonry" | "filmstrip" | "storyboard";
  /** Columns for grid layout */
  columns?: 2 | 3 | 4 | 5 | 6;
  /** Show filters */
  showFilters?: boolean;
  /** Show info overlay */
  showInfo?: boolean;
  /** On image click */
  onImageClick?: (image: GalleryImage, index: number) => void;
  /** Custom className */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CinematicGallery({
  images,
  layout = "grid",
  columns = 4,
  showFilters = true,
  showInfo = true,
  onImageClick,
  className = "",
}: CinematicGalleryProps) {
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"number" | "type">("number");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Get unique scene types for filter
  const sceneTypes = useMemo(() => {
    const types = new Set(images.map((img) => img.sceneType).filter(Boolean));
    return ["all", ...Array.from(types)] as string[];
  }, [images]);

  // Filter and sort images
  const filteredImages = useMemo(() => {
    let result = [...images];
    
    // Filter
    if (filter !== "all") {
      result = result.filter((img) => img.sceneType === filter);
    }
    
    // Sort
    result.sort((a, b) => {
      if (sortBy === "number") {
        return (a.shotNumber || 0) - (b.shotNumber || 0);
      }
      return (a.sceneType || "").localeCompare(b.sceneType || "");
    });
    
    return result;
  }, [images, filter, sortBy]);

  // Grid columns class
  const gridColsClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
  };

  return (
    <div className={className}>
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Filtre:</span>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40 bg-zinc-900/50 border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sceneTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "all" ? "Tous" : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Tri:</span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-40 bg-zinc-900/50 border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number">Par numéro</SelectItem>
                <SelectItem value="type">Par type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">
            {filteredImages.length} images
          </Badge>
        </div>
      )}

      {/* Gallery */}
      {layout === "grid" && (
        <div className={`grid ${gridColsClass[columns]} gap-4`}>
          {filteredImages.map((image, index) => (
            <GalleryItem
              key={image.id}
              image={image}
              isHovered={hoveredId === image.id}
              showInfo={showInfo}
              onClick={() => onImageClick?.(image, index)}
              onMouseEnter={() => setHoveredId(image.id)}
              onMouseLeave={() => setHoveredId(null)}
            />
          ))}
        </div>
      )}

      {layout === "filmstrip" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {filteredImages.map((image, index) => (
              <div key={image.id} className="w-64 flex-shrink-0">
                <GalleryItem
                  image={image}
                  isHovered={hoveredId === image.id}
                  showInfo={showInfo}
                  aspectRatio="video"
                  onClick={() => onImageClick?.(image, index)}
                  onMouseEnter={() => setHoveredId(image.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {layout === "storyboard" && (
        <div className="space-y-8">
          {filteredImages.map((image, index) => (
            <div key={image.id} className="flex gap-6 items-start">
              <div className="w-1/3 flex-shrink-0">
                <GalleryItem
                  image={image}
                  isHovered={hoveredId === image.id}
                  showInfo={false}
                  aspectRatio="video"
                  onClick={() => onImageClick?.(image, index)}
                  onMouseEnter={() => setHoveredId(image.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-blood-900/50 text-blood-300 border-blood-700/50">
                    Shot {image.shotNumber}
                  </Badge>
                  {image.sceneType && (
                    <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">
                      {image.sceneType}
                    </Badge>
                  )}
                  {image.hasVideo && (
                    <Badge className="bg-emerald-900/50 text-emerald-300 border-emerald-700/50">
                      VIDEO
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{image.title}</h3>
                <p className="text-zinc-400 text-sm">{image.description}</p>
                {image.cameraAngle && (
                  <p className="text-zinc-500 text-xs mt-2">
                    Camera: {image.cameraAngle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {layout === "masonry" && (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {filteredImages.map((image, index) => (
            <div key={image.id} className="break-inside-avoid mb-4">
              <GalleryItem
                image={image}
                isHovered={hoveredId === image.id}
                showInfo={showInfo}
                aspectRatio="auto"
                onClick={() => onImageClick?.(image, index)}
                onMouseEnter={() => setHoveredId(image.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// GALLERY ITEM
// ============================================================================

interface GalleryItemProps {
  image: GalleryImage;
  isHovered: boolean;
  showInfo: boolean;
  aspectRatio?: "square" | "video" | "auto";
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function GalleryItem({
  image,
  isHovered,
  showInfo,
  aspectRatio = "video",
  onClick,
  onMouseEnter,
  onMouseLeave,
}: GalleryItemProps) {
  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  };

  return (
    <Card
      className={`
        bg-zinc-900/30 border-zinc-800 overflow-hidden cursor-pointer
        transition-all duration-300 group
        ${isHovered ? "border-blood-700/50 shadow-lg shadow-blood-900/20" : ""}
      `}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`relative ${aspectClass[aspectRatio]} overflow-hidden`}>
        <img
          src={image.thumbnailUrl || image.url}
          alt={image.title || "Shot"}
          className={`
            w-full h-full object-cover
            transition-transform duration-500
            ${isHovered ? "scale-110" : "scale-100"}
          `}
          loading="lazy"
        />

        {/* Video indicator */}
        {image.hasVideo && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-emerald-600/90 text-white text-[9px] border-0">
              VIDEO
            </Badge>
          </div>
        )}

        {/* Shot number */}
        {image.shotNumber !== undefined && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-black/60 text-white text-[10px] border-0 backdrop-blur-sm">
              #{image.shotNumber.toString().padStart(2, "0")}
            </Badge>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={`
            absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent
            transition-opacity duration-300
            ${isHovered ? "opacity-100" : "opacity-0"}
          `}
        />

        {/* Play button for video */}
        {image.hasVideo && isHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-blood-600/80 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      {showInfo && (
        <div className="p-3">
          <p className="text-sm font-medium text-white truncate">
            {image.title || `Shot ${image.shotNumber}`}
          </p>
          {image.sceneType && (
            <p className="text-xs text-zinc-500">{image.sceneType}</p>
          )}
        </div>
      )}
    </Card>
  );
}

export default CinematicGallery;
