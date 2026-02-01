"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ShotPlaceholder } from "@/components/shared/ShotPlaceholder";
import type { Variation } from "@/types";
import { CAMERA_ANGLES } from "@/data/camera-angles";

interface VariationGridProps {
  variations: Variation[];
  onGenerate: (variation: Variation) => void;
  onDownload: (variation: Variation) => void;
  onSetReference: (variation: Variation) => void;
  referenceId?: string;
  isGenerating?: boolean;
}

export function VariationGrid({
  variations,
  onGenerate,
  onDownload,
  onSetReference,
  referenceId,
  isGenerating,
}: VariationGridProps) {
  const getAngleInfo = (angle: string) => {
    return CAMERA_ANGLES.find((a) => a.angle === angle) || {
      angle,
      label: angle,
      description: angle,
    };
  };

  const statusColors = {
    pending: "bg-zinc-800 text-zinc-500 border-zinc-700/50",
    generating: "bg-amber-900/40 text-amber-400 border-amber-700/30 animate-pulse",
    completed: "bg-blood-900/40 text-blood-400 border-blood-700/30",
    failed: "bg-red-900/40 text-red-400 border-red-700/30",
  };

  const statusLabels = {
    pending: "En attente",
    generating: "Rendu...",
    completed: "Finalisé",
    failed: "Échec",
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-4">
        {variations.map((variation, index) => {
          const angleInfo = getAngleInfo(variation.cameraAngle);
          const isReference = variation.id === referenceId;

          return (
            <div
              key={`${variation.id}-${index}`}
              className={cn(
                "group relative rounded-2xl overflow-hidden bg-[#14131a] border transition-all duration-500",
                isReference
                  ? "border-blood-600 ring-2 ring-blood-600/20 shadow-2xl shadow-blood-900/20"
                  : "border-blood-900/20 hover:border-blood-600/50"
              )}
            >
              {/* Image Container */}
              <div className="aspect-video relative bg-[#0b0b0e] overflow-hidden">
                {variation.imageUrl ? (
                  <Image
                    src={variation.imageUrl}
                    alt={angleInfo.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                ) : (
                  <ShotPlaceholder status={variation.status === "generating" ? "generating" : variation.status === "failed" ? "failed" : "pending"} />
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                  {variation.status === "completed" ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-10 w-10 p-0 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                            onClick={() => onDownload(variation)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#0b0b0e] border-blood-900/30 text-white">Télécharger PNG</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-10 w-10 p-0 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                            onClick={() => onGenerate(variation)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#0b0b0e] border-blood-900/30 text-white">Régénérer</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant={isReference ? "default" : "secondary"}
                            className={cn(
                              "h-10 w-10 p-0 rounded-full border text-white",
                              isReference 
                                ? "bg-blood-600 border-blood-500 hover:bg-blood-700" 
                                : "bg-white/10 border-white/20 hover:bg-white/20"
                            )}
                            onClick={() => onSetReference(variation)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#0b0b0e] border-blood-900/30 text-white">Définir comme référence</TooltipContent>
                      </Tooltip>
                    </>
                  ) : variation.status !== "generating" ? (
                    <Button
                      size="sm"
                      className="moostik-btn-blood text-white px-6 rounded-full font-bold"
                      onClick={() => onGenerate(variation)}
                      disabled={isGenerating}
                    >
                      Lancer le Rendu
                    </Button>
                  ) : null}
                </div>

                {/* Reference Badge */}
                {isReference && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-blood-600 text-white text-[9px] uppercase tracking-widest border-0">
                      Master Reference
                    </Badge>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className={cn("text-[9px] uppercase tracking-tighter px-1.5 py-0.5", statusColors[variation.status])}>
                    {statusLabels[variation.status]}
                  </Badge>
                </div>
              </div>

              {/* Info Footer */}
              <div className="p-4 bg-gradient-to-b from-[#14131a] to-[#0b0b0e]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-100 uppercase tracking-wide">
                      {angleInfo.label}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tighter">
                      Optique: {variation.cameraAngle.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>

                {/* Error Message */}
                {variation.status === "failed" && (
                  <p className="text-[10px] text-red-500 mt-2 font-medium">ERREUR DE GÉNÉRATION API</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
