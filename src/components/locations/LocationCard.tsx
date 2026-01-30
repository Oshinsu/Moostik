"use client";

import { Badge } from "@/components/ui/badge";
import type { Location } from "@/types";

interface LocationCardProps {
  location: Location;
  onClick: () => void;
  variant?: "default" | "enemy";
}

export function LocationCard({ location, onClick, variant = "default" }: LocationCardProps) {
  const imageCount = location.referenceImages?.length || 0;
  const hasImages = imageCount > 0;
  
  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 moostik-card-hover ${
        variant === "enemy" 
          ? "border border-amber-900/30 hover:border-amber-600/50" 
          : "border border-blood-900/30 hover:border-blood-600/50"
      }`}
    >
      {/* Image */}
      <div className="aspect-video relative bg-[#14131a]">
        {hasImages ? (
          <img
            src={location.referenceImages![0]}
            alt={location.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-20">
              {variant === "enemy" ? "⚠️" : "🏛️"}
            </span>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-[#0b0b0e]/30 to-transparent" />
        
        {/* Image count badge */}
        {hasImages && (
          <Badge className="absolute top-3 right-3 bg-black/60 text-white border-0 text-xs">
            🖼️ {imageCount} {imageCount > 1 ? "images" : "image"}
          </Badge>
        )}
        
        {/* Type indicator */}
        <div className={`absolute top-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center ${
          variant === "enemy" 
            ? "bg-amber-900/60" 
            : "bg-blood-900/60"
        }`}>
          {variant === "enemy" ? "⚠️" : "🏛️"}
        </div>
      </div>
      
      {/* Content */}
      <div className={`p-4 ${
        variant === "enemy" 
          ? "bg-gradient-to-b from-amber-950/30 to-[#14131a]" 
          : "bg-gradient-to-b from-blood-950/30 to-[#14131a]"
      }`}>
        <h3 className="font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">
          {location.name}
        </h3>
        <p className="text-xs text-zinc-500 line-clamp-2">
          {location.description}
        </p>
        
        {/* Features preview */}
        <div className="flex flex-wrap gap-1 mt-3">
          {location.architecturalFeatures.slice(0, 2).map((feature, i) => (
            <Badge 
              key={i} 
              variant="outline" 
              className={`text-[10px] ${
                variant === "enemy"
                  ? "border-amber-900/30 text-amber-400/60"
                  : "border-blood-900/30 text-blood-400/60"
              }`}
            >
              {feature.split(" ").slice(0, 2).join(" ")}
            </Badge>
          ))}
          {location.architecturalFeatures.length > 2 && (
            <Badge variant="outline" className="text-[10px] border-zinc-800 text-zinc-600">
              +{location.architecturalFeatures.length - 2}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Hover effect border */}
      <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
        variant === "enemy"
          ? "ring-1 ring-amber-500/30"
          : "ring-1 ring-blood-500/30"
      }`} />
    </div>
  );
}
