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

// ============================================================================
// GRADE BADGE COMPONENT
// ============================================================================

type GradeLetter = "S" | "A" | "B" | "C" | "D" | "F";

interface GradeInfo {
  grade: GradeLetter;
  score: number;
  breakdown?: {
    characterFidelity?: { score: number };
    environmentFidelity?: { score: number };
    bibleCompliance?: { score: number };
    narrativeCoherence?: { score: number };
  };
  violations?: string[];
  suggestions?: string[];
  regenerateRecommended?: boolean;
}

const GRADE_CONFIG: Record<GradeLetter, { color: string; bg: string; border: string; label: string }> = {
  S: { color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/40", label: "Exceptionnel" },
  A: { color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/40", label: "Excellent" },
  B: { color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/40", label: "Bon" },
  C: { color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/40", label: "Passable" },
  D: { color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/40", label: "Insuffisant" },
  F: { color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/40", label: "Échec" },
};

function GradeBadge({ gradeInfo, onGrade }: { gradeInfo?: GradeInfo; onGrade?: () => void }) {
  if (!gradeInfo) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={(e) => { e.stopPropagation(); onGrade?.(); }}
            className="absolute top-2 left-2 z-10 w-7 h-7 rounded-lg bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50 flex items-center justify-center text-[10px] font-bold text-zinc-500 hover:bg-zinc-700/80 hover:text-zinc-300 transition-all cursor-pointer"
          >
            ?
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-[#0b0b0e] border-zinc-700/50 text-white max-w-xs">
          <p className="text-xs">Cliquez pour noter cette image</p>
          <p className="text-[10px] text-zinc-500 mt-1">Agent IA de notation Moostik</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  const config = GRADE_CONFIG[gradeInfo.grade];
  const breakdown = gradeInfo.breakdown;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={(e) => { e.stopPropagation(); onGrade?.(); }}
          className={cn(
            "absolute top-2 left-2 z-10 w-7 h-7 rounded-lg backdrop-blur-sm border flex items-center justify-center text-sm font-black transition-all cursor-pointer hover:scale-110",
            config.bg, config.border, config.color
          )}
        >
          {gradeInfo.grade}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-[#0b0b0e] border-zinc-700/50 text-white max-w-xs p-3">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className={cn("text-lg font-black", config.color)}>{gradeInfo.grade}</span>
            <span className="text-xs text-zinc-400">{gradeInfo.score}/100</span>
          </div>
          <p className="text-xs text-zinc-300">{config.label}</p>
          
          {/* Breakdown */}
          {breakdown && (
            <div className="space-y-1 pt-2 border-t border-zinc-800">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-500">Personnage</span>
                <span className="text-zinc-300">{breakdown.characterFidelity?.score ?? "N/A"}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-500">Environnement</span>
                <span className="text-zinc-300">{breakdown.environmentFidelity?.score ?? "N/A"}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-500">Bible DA</span>
                <span className="text-zinc-300">{breakdown.bibleCompliance?.score ?? "N/A"}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-500">Narration</span>
                <span className="text-zinc-300">{breakdown.narrativeCoherence?.score ?? "N/A"}</span>
              </div>
            </div>
          )}

          {/* Violations */}
          {gradeInfo.violations && gradeInfo.violations.length > 0 && (
            <div className="pt-2 border-t border-zinc-800">
              <p className="text-[10px] text-red-400 font-medium mb-1">Violations:</p>
              <ul className="text-[10px] text-zinc-400 space-y-0.5">
                {gradeInfo.violations.slice(0, 3).map((v, i) => (
                  <li key={i} className="truncate">• {v}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {gradeInfo.suggestions && gradeInfo.suggestions.length > 0 && (
            <div className="pt-2 border-t border-zinc-800">
              <p className="text-[10px] text-amber-400 font-medium mb-1">Suggestions:</p>
              <ul className="text-[10px] text-zinc-400 space-y-0.5">
                {gradeInfo.suggestions.slice(0, 2).map((s, i) => (
                  <li key={i} className="truncate">• {s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Regenerate recommendation */}
          {gradeInfo.regenerateRecommended && (
            <div className="pt-2 border-t border-zinc-800">
              <p className="text-[10px] text-red-400 font-medium">⚠️ Régénération recommandée</p>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// ============================================================================
// SHOT CARD PROPS
// ============================================================================

interface ShotCardProps {
  shot: Shot;
  onEdit: (shot: Shot) => void;
  onGenerateAll: (shot: Shot) => void;
  onDelete: (shot: Shot) => void;
  onDuplicate: (shot: Shot) => void;
  onViewDetails: (shot: Shot) => void;
  isGenerating?: boolean;
  onGradeImage?: (shot: Shot, variationId?: string) => void;
}

export function ShotCard({
  shot,
  onEdit,
  onGenerateAll,
  onDelete,
  onDuplicate,
  onViewDetails,
  isGenerating,
  onGradeImage,
}: ShotCardProps) {
  const completedVariations = shot.variations.filter((v) => v.status === "completed").length;
  const totalVariations = shot.variations.length;
  const progress = totalVariations > 0 ? (completedVariations / totalVariations) * 100 : 0;

  // Get the first completed variation for preview
  const previewVariation = shot.variations.find((v) => v.imageUrl);

  // Get grade info from variation if available
  const getGradeInfo = (variation?: typeof shot.variations[0]): GradeInfo | undefined => {
    if (!variation?.qualityScore) return undefined;
    
    // Determine grade letter from score
    const score = variation.qualityScore;
    let grade: GradeLetter = "F";
    if (score >= 95) grade = "S";
    else if (score >= 85) grade = "A";
    else if (score >= 70) grade = "B";
    else if (score >= 55) grade = "C";
    else if (score >= 40) grade = "D";
    
    return {
      grade,
      score,
      regenerateRecommended: score < 60,
    };
  };

  const previewGrade = getGradeInfo(previewVariation);

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

              {/* Grade Badge */}
              <GradeBadge 
                gradeInfo={previewGrade} 
                onGrade={() => onGradeImage?.(shot, previewVariation.id)}
              />

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
              onClick={() => {
                if (shot.status === "completed") {
                  if (!confirm("Régénérer toutes les images ?")) return;
                }
                onGenerateAll(shot);
              }}
              disabled={isGenerating}
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
