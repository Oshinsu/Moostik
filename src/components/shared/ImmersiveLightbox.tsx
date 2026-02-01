"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LightboxImage {
  id: string;
  url: string;
  shotName: string;
  shotNumber: number;
  cameraAngle: string;
  sceneType?: string;
  seed?: number;
  videoUrl?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prompt?: any;
}

interface ImmersiveLightboxProps {
  images: LightboxImage[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
  onGenerateVideo?: (image: LightboxImage) => void;
}

export function ImmersiveLightbox({
  images,
  initialIndex,
  open,
  onClose,
  onGenerateVideo,
}: ImmersiveLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIndex, setCompareIndex] = useState<number | null>(null);

  const currentImage = images[currentIndex];

  // Reset index when images change
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "+":
        case "=":
          e.preventDefault();
          setZoom((prev) => Math.min(prev + 0.25, 3));
          break;
        case "-":
          e.preventDefault();
          setZoom((prev) => Math.max(prev - 0.25, 0.5));
          break;
        case "0":
          e.preventDefault();
          setZoom(1);
          break;
        case "i":
          e.preventDefault();
          setShowInfo((prev) => !prev);
          break;
        case "c":
          e.preventDefault();
          setCompareMode((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, images.length, onClose]);

  // Prevent scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !currentImage) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const downloadImage = () => {
    if (currentImage.url) {
      window.open(currentImage.url, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Fermer
            </Button>
            <div className="h-6 w-px bg-white/20" />
            <div>
              <Badge className="bg-blood-600 text-white border-0 text-xs">
                SHOT #{currentImage.shotNumber.toString().padStart(2, "0")}
              </Badge>
              <span className="ml-3 text-white font-bold">{currentImage.shotName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm font-mono">
              {currentIndex + 1} / {images.length}
            </span>
            <div className="h-6 w-px bg-white/20 mx-2" />
            
            {/* Zoom Controls */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom((prev) => Math.max(prev - 0.25, 0.5))}
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </Button>
            <span className="text-white/70 text-sm font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom((prev) => Math.min(prev + 0.25, 3))}
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Button>

            <div className="h-6 w-px bg-white/20 mx-2" />

            {/* Toggle Info */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInfo(!showInfo)}
              className={cn(
                "h-8 w-8 p-0",
                showInfo ? "text-blood-400 bg-blood-500/20" : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>

            {/* Download */}
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadImage}
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Image Area */}
      <div className="absolute inset-0 flex items-center justify-center p-20">
        <div
          className="relative transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoom})` }}
        >
          {currentImage.videoUrl ? (
            <video
              src={currentImage.videoUrl}
              controls
              autoPlay
              loop
              className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-2xl"
            />
          ) : (
            <img
              src={currentImage.url}
              alt={currentImage.shotName}
              className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
            />
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-8 pt-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-4 gap-6">
              {/* Camera Angle */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <span className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">Angle</span>
                <span className="text-white font-bold uppercase">{currentImage.cameraAngle.replace(/_/g, " ")}</span>
              </div>

              {/* Scene Type */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <span className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">Type</span>
                <span className="text-white font-bold uppercase">{currentImage.sceneType || "cinematic"}</span>
              </div>

              {/* Seed */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <span className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">Seed</span>
                <span className="text-amber-400 font-mono text-sm">
                  {currentImage.prompt?.parameters?.seed || currentImage.seed || "N/A"}
                </span>
              </div>

              {/* Actions */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-center gap-2">
                {onGenerateVideo && !currentImage.videoUrl && (
                  <Button
                    size="sm"
                    className="moostik-btn-blood text-white text-xs"
                    onClick={() => onGenerateVideo(currentImage)}
                  >
                    🎬 Vidéo
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 text-xs"
                  onClick={downloadImage}
                >
                  ⬇ 4K
                </Button>
              </div>
            </div>

            {/* Scene Intent */}
            {currentImage.prompt?.meta?.scene_intent && (
              <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
                <span className="text-[10px] text-blood-400 uppercase tracking-widest block mb-2">Scene Intent</span>
                <p className="text-white/80 text-sm leading-relaxed italic">
                  {currentImage.prompt.meta.scene_intent}
                </p>
              </div>
            )}

            {/* Gigantism Cues */}
            {currentImage.prompt?.scene_graph?.environment?.gigantism_cues && (
              <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
                <span className="text-[10px] text-amber-400 uppercase tracking-widest block mb-2">Gigantism POV</span>
                <div className="flex flex-wrap gap-2">
                  {currentImage.prompt.scene_graph.environment.gigantism_cues.slice(0, 4).map((cue: string, i: number) => (
                    <Badge key={i} className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                      {cue}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thumbnail Strip */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-center gap-2 p-4 overflow-x-auto max-w-full">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 transition-all",
                index === currentIndex
                  ? "border-blood-500 ring-2 ring-blood-500/50 scale-110"
                  : "border-transparent opacity-50 hover:opacity-100"
              )}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard Hints */}
      <div className="absolute bottom-24 right-6 text-white/30 text-xs space-y-1">
        <div>← → Navigation</div>
        <div>+ - Zoom</div>
        <div>I Info</div>
        <div>ESC Fermer</div>
      </div>
    </div>
  );
}
