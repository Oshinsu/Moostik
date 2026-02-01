"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Shot } from "@/types";

interface TimelineStoryboardProps {
  shots: Shot[];
  onShotClick: (shot: Shot, variationIndex?: number) => void;
  currentShotId?: string;
}

export function TimelineStoryboard({
  shots,
  onShotClick,
  currentShotId,
}: TimelineStoryboardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Mouse drag scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const scrollTo = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Group shots by act if available
  const getActForShot = (shotId: string): number | null => {
    // This would need actual act data - for now return shot number modulo
    const shot = shots.find((s) => s.id === shotId);
    if (!shot) return null;
    return Math.floor((shot.number - 1) / 5) + 1;
  };

  return (
    <div className="relative bg-[#0a0a0c] border-y border-blood-900/20">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-blood-900/20 bg-[#0b0b0e]">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-blood-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          <span className="text-white font-bold uppercase tracking-wider text-sm">Timeline Storyboard</span>
          <Badge className="bg-zinc-900 text-zinc-400 border-zinc-800 text-xs">
            {shots.length} shots
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollTo("left")}
            className="text-zinc-500 hover:text-white hover:bg-white/5 h-8 w-8 p-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollTo("right")}
            className="text-zinc-500 hover:text-white hover:bg-white/5 h-8 w-8 p-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Timeline Track */}
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-4 p-4 overflow-x-auto scrollbar-hide cursor-grab",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {shots.map((shot, index) => {
          const previewVariation = shot.variations?.find((v) => v.imageUrl);
          const completedCount = shot.variations?.filter((v) => v.status === "completed").length || 0;
          const totalCount = shot.variations?.length || 0;
          const isActive = shot.id === currentShotId;
          const act = getActForShot(shot.id);
          
          return (
            <div
              key={shot.id}
              className={cn(
                "flex-shrink-0 w-64 group cursor-pointer transition-all duration-300",
                isActive && "scale-105"
              )}
              onClick={() => onShotClick(shot)}
            >
              {/* Act Marker */}
              {index === 0 || getActForShot(shots[index - 1]?.id) !== act ? (
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-px flex-1 bg-purple-500/30" />
                  <Badge className="bg-purple-900/50 text-purple-300 border-purple-700/30 text-[9px]">
                    ACTE {act}
                  </Badge>
                  <div className="h-px flex-1 bg-purple-500/30" />
                </div>
              ) : (
                <div className="mb-2 h-5" /> // Spacer for alignment
              )}
              
              {/* Shot Card */}
              <div
                className={cn(
                  "relative rounded-xl overflow-hidden border-2 transition-all",
                  isActive
                    ? "border-blood-500 ring-2 ring-blood-500/30 shadow-lg shadow-blood-900/20"
                    : "border-zinc-800 hover:border-blood-600/50"
                )}
              >
                {/* Thumbnail */}
                <div className="aspect-video relative bg-zinc-900">
                  {previewVariation?.imageUrl ? (
                    <img
                      src={previewVariation.imageUrl}
                      alt={shot.name}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Shot Number */}
                  <Badge className="absolute top-2 left-2 bg-blood-600 text-white text-[10px] border-0 font-mono">
                    #{shot.number.toString().padStart(2, "0")}
                  </Badge>
                  
                  {/* Progress */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-white/60 font-medium">
                        {completedCount}/{totalCount}
                      </span>
                      <span className="text-[9px] text-white/60">
                        {Math.round((completedCount / totalCount) * 100)}%
                      </span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blood-600 to-blood-400 transition-all"
                        style={{ width: `${(completedCount / totalCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-3 bg-[#14131a]">
                  <h4 className="text-white text-sm font-bold truncate">{shot.name}</h4>
                  <p className="text-zinc-500 text-[10px] mt-1 uppercase tracking-wider">
                    {shot.sceneType || "establishing"}
                  </p>
                </div>
              </div>
              
              {/* Timeline Connector */}
              {index < shots.length - 1 && (
                <div className="flex items-center justify-center mt-4">
                  <div className="w-16 h-0.5 bg-gradient-to-r from-blood-600/50 to-blood-600/10" />
                  <svg className="w-3 h-3 text-blood-600/50 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Timeline Ruler */}
      <div className="h-6 bg-[#0b0b0e] border-t border-blood-900/20 flex items-center px-4">
        <div className="flex-1 flex items-center gap-1 overflow-hidden">
          {Array.from({ length: Math.ceil(shots.length / 5) }).map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-1 h-2 bg-zinc-700" />
              <span className="text-[9px] text-zinc-600 ml-1 font-mono">{(i + 1) * 5}</span>
              <div className="w-20 h-px bg-zinc-800 ml-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
