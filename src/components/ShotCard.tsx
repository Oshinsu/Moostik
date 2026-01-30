"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ShotPlaceholder } from "@/components/shared/ShotPlaceholder";
import type { Shot } from "@/types";

interface ShotCardProps {
  shot: Shot;
  onEdit: (shot: Shot) => void;
  onGenerateAll: (shot: Shot) => void;
  onDelete: (shot: Shot) => void;
  onDuplicate: (shot: Shot) => void;
  onViewDetails: (shot: Shot) => void;
  isGenerating?: boolean;
}

export function ShotCard({
  shot,
  onEdit,
  onGenerateAll,
  onDelete,
  onDuplicate,
  onViewDetails,
  isGenerating,
}: ShotCardProps) {
  const completedVariations = shot.variations.filter((v) => v.status === "completed").length;
  const totalVariations = shot.variations.length;
  const progress = totalVariations > 0 ? (completedVariations / totalVariations) * 100 : 0;

  // Get the first completed variation for preview
  const previewVariation = shot.variations.find((v) => v.imageUrl);

  const statusConfig = {
    pending: { color: "bg-zinc-800 text-zinc-500 border-zinc-700/50", label: "En attente", textColor: "text-zinc-500" },
    in_progress: { color: "bg-amber-900/40 text-amber-400 border-amber-700/30", label: "En cours", textColor: "text-amber-400" },
    completed: { color: "bg-blood-900/40 text-blood-400 border-blood-700/30", label: "Terminé", textColor: "text-blood-400" },
  };

  const status = statusConfig[shot.status];

  return (
    <TooltipProvider>
      <div className="group relative rounded-2xl overflow-hidden bg-[#14131a] border border-blood-900/20 hover:border-blood-600/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blood-900/10 moostik-card-hover">
        {/* Image Grid Preview */}
        <div
          className="aspect-video relative bg-[#0b0b0e] cursor-pointer overflow-hidden"
          onClick={() => onViewDetails(shot)}
        >
          {previewVariation?.imageUrl ? (
            <>
              {/* Main Preview */}
              <Image
                src={previewVariation.imageUrl}
                alt={shot.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-transparent to-transparent opacity-60" />

              {/* Mini Grid Overlay */}
              <div className="absolute bottom-3 right-3 p-1.5 flex gap-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                {shot.variations.slice(0, 5).map((v, i) => (
                  <div
                    key={v.id}
                    className={cn(
                      "w-8 h-5 rounded-sm overflow-hidden border border-white/5 transition-all",
                      v.imageUrl ? "opacity-100" : "opacity-30"
                    )}
                  >
                    {v.imageUrl ? (
                      <Image
                        src={v.imageUrl}
                        alt=""
                        width={32}
                        height={20}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div
                        className={cn(
                          "w-full h-full",
                          v.status === "generating" ? "bg-amber-500/20 animate-pulse" : "bg-zinc-800"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <ShotPlaceholder status={shot.status === "in_progress" ? "generating" : "pending"} />
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-blood-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-blood-500 bg-blood-500/10 px-1.5 py-0.5 rounded border border-blood-500/20">
                  SHOT #{shot.number.toString().padStart(2, "0")}
                </span>
                <Badge variant="outline" className={cn("text-[9px] uppercase tracking-tighter px-1.5 py-0", status.color)}>
                  {status.label}
                </Badge>
              </div>
              <h3 className="font-bold text-zinc-100 truncate text-lg tracking-tight group-hover:text-amber-400 transition-colors">
                {shot.name}
              </h3>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-5 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider">
              <span className={status.textColor}>
                {completedVariations} / {totalVariations} RENDUS
              </span>
              <span className="text-zinc-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blood-600 to-crimson-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-[#1a1921] border-blood-900/30 hover:border-blood-600/50 hover:bg-blood-900/10 text-xs text-zinc-400 hover:text-white transition-all"
              onClick={() => onEdit(shot)}
            >
              Détails
            </Button>
            <Button
              size="sm"
              className={cn(
                "flex-1 text-xs font-bold transition-all",
                shot.status === "completed" 
                  ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-400" 
                  : "moostik-btn-blood text-white shadow-lg shadow-blood-900/20"
              )}
              onClick={() => onGenerateAll(shot)}
              disabled={isGenerating || (shot.status === "completed" && !confirm("Régénérer toutes les images ?"))}
            >
              {isGenerating
                ? "..."
                : completedVariations === totalVariations
                ? "Régénérer"
                : `Générer (${totalVariations - completedVariations})`}
            </Button>

            {/* More Actions */}
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-zinc-600 hover:text-white hover:bg-white/5"
                    onClick={() => onDuplicate(shot)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#0b0b0e] border-blood-900/30 text-white">Dupliquer</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-zinc-600 hover:text-red-500 hover:bg-red-500/5"
                    onClick={() => onDelete(shot)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#0b0b0e] border-blood-900/30 text-white">Supprimer</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
