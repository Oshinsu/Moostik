"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// ============================================================================
// TYPES
// ============================================================================

export interface MapLocation {
  id: string;
  name: string;
  type: string;
  description?: string;
  /** Position on map (percentage) */
  x: number;
  y: number;
  /** Preview image */
  image?: string;
  /** Icon or emoji */
  icon?: string;
  /** Link to location page */
  href?: string;
  /** Importance level (affects size) */
  importance?: "minor" | "major" | "key";
  /** Is currently active/highlighted */
  isActive?: boolean;
}

export interface InteractiveMapProps {
  /** Background map image */
  mapImage: string;
  /** Locations to display */
  locations: MapLocation[];
  /** Currently selected location ID */
  selectedId?: string;
  /** On location click */
  onLocationClick?: (location: MapLocation) => void;
  /** Show location names */
  showNames?: boolean;
  /** Enable zoom/pan */
  enableZoom?: boolean;
  /** Custom className */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function InteractiveMap({
  mapImage,
  locations,
  selectedId,
  onLocationClick,
  showNames = true,
  enableZoom = true,
  className = "",
}: InteractiveMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (!enableZoom) return;
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.max(1, Math.min(3, prev + delta)));
  };

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enableZoom || scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset position when scale goes to 1
  useEffect(() => {
    if (scale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  // Get marker size based on importance
  const getMarkerSize = (importance?: string) => {
    switch (importance) {
      case "key":
        return "w-8 h-8";
      case "major":
        return "w-6 h-6";
      default:
        return "w-4 h-4";
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl bg-zinc-900 ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? "grabbing" : scale > 1 ? "grab" : "default" }}
    >
      {/* Map Image */}
      <div
        className="relative transition-transform duration-200"
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transformOrigin: "center center",
        }}
      >
        <img
          src={mapImage}
          alt="Map"
          className="w-full h-auto"
          draggable={false}
        />

        {/* Location Markers */}
        {locations.map((location) => {
          const isHovered = hoveredId === location.id;
          const isSelected = selectedId === location.id;
          const markerSize = getMarkerSize(location.importance);

          return (
            <div
              key={location.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
              onMouseEnter={() => setHoveredId(location.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Pulse effect for key locations */}
              {location.importance === "key" && (
                <div className="absolute inset-0 animate-ping">
                  <div className={`${markerSize} rounded-full bg-blood-500/30`} />
                </div>
              )}

              {/* Marker */}
              <button
                onClick={() => onLocationClick?.(location)}
                className={`
                  relative ${markerSize} rounded-full 
                  flex items-center justify-center
                  transition-all duration-300
                  ${isSelected || isHovered
                    ? "bg-blood-600 scale-125 shadow-lg shadow-blood-900/50"
                    : location.importance === "key"
                    ? "bg-blood-700"
                    : location.importance === "major"
                    ? "bg-amber-700"
                    : "bg-zinc-600"
                  }
                `}
              >
                {location.icon && (
                  <span className="text-xs">{location.icon}</span>
                )}
              </button>

              {/* Name label */}
              {showNames && (isHovered || isSelected || location.importance === "key") && (
                <div
                  className={`
                    absolute top-full mt-2 left-1/2 -translate-x-1/2
                    whitespace-nowrap px-2 py-1 rounded
                    text-xs font-medium
                    transition-all duration-200
                    ${isSelected || isHovered
                      ? "bg-blood-900/90 text-white"
                      : "bg-zinc-900/80 text-zinc-300"
                    }
                  `}
                >
                  {location.name}
                </div>
              )}

              {/* Hover popup */}
              {isHovered && location.description && (
                <Card
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                    w-64 p-3 bg-zinc-900/95 border-blood-700/50
                    backdrop-blur-sm z-50"
                >
                  {location.image && (
                    <img
                      src={location.image}
                      alt={location.name}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                  )}
                  <h4 className="font-bold text-white text-sm">{location.name}</h4>
                  <Badge className="bg-zinc-800 text-zinc-400 text-[9px] mb-1">
                    {location.type}
                  </Badge>
                  <p className="text-zinc-400 text-xs line-clamp-2">
                    {location.description}
                  </p>
                  {location.href && (
                    <Link
                      href={location.href}
                      className="text-blood-400 text-xs mt-2 inline-block hover:underline"
                    >
                      Explorer →
                    </Link>
                  )}
                </Card>
              )}
            </div>
          );
        })}
      </div>

      {/* Zoom controls */}
      {enableZoom && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={() => setScale((prev) => Math.min(3, prev + 0.5))}
            className="w-8 h-8 rounded bg-zinc-800/80 text-white flex items-center justify-center hover:bg-zinc-700 backdrop-blur-sm"
          >
            +
          </button>
          <button
            onClick={() => setScale((prev) => Math.max(1, prev - 0.5))}
            className="w-8 h-8 rounded bg-zinc-800/80 text-white flex items-center justify-center hover:bg-zinc-700 backdrop-blur-sm"
          >
            -
          </button>
          {scale > 1 && (
            <button
              onClick={() => {
                setScale(1);
                setPosition({ x: 0, y: 0 });
              }}
              className="px-3 h-8 rounded bg-zinc-800/80 text-white text-xs flex items-center justify-center hover:bg-zinc-700 backdrop-blur-sm"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur-sm rounded-lg p-3">
        <h5 className="text-xs font-bold text-white mb-2">Légende</h5>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blood-700" />
            <span className="text-xs text-zinc-400">Lieu clé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-700" />
            <span className="text-xs text-zinc-400">Lieu majeur</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-600" />
            <span className="text-xs text-zinc-400">Lieu secondaire</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveMap;
