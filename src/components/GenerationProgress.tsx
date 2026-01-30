"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GenerationProgressProps {
  isGenerating: boolean;
  currentShot?: string;
  currentVariation?: string;
  completed: number;
  total: number;
  errors: number;
  onCancel?: () => void;
}

export function GenerationProgress({
  isGenerating,
  currentShot,
  currentVariation,
  completed,
  total,
  errors,
  onCancel,
}: GenerationProgressProps) {
  if (!isGenerating && completed === 0) return null;

  const progress = total > 0 ? (completed / total) * 100 : 0;
  const remaining = total - completed - errors;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-72 right-0 z-50 border-t border-blood-900/30 bg-[#0b0b0e]/95 backdrop-blur-md transition-transform duration-500",
        isGenerating ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="px-8 py-5">
        <div className="flex items-center gap-8">
          {/* Spinner */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full border-2 border-blood-900/20">
              <div
                className="absolute inset-0 rounded-full border-2 border-blood-500 border-t-transparent animate-spin"
                style={{ animationDuration: "0.8s" }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-blood-400">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-bold text-zinc-100 uppercase tracking-widest text-xs">Production en cours</h4>
              <Badge className="bg-amber-900/40 text-amber-400 border-amber-700/30 text-[10px] font-bold uppercase">
                {remaining} RESTANTS
              </Badge>
              {errors > 0 && (
                <Badge className="bg-red-900/40 text-red-400 border-red-700/30 text-[10px] font-bold uppercase">
                  {errors} ERREURS
                </Badge>
              )}
            </div>

            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-blood-600 via-crimson-500 to-blood-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center gap-6 text-[10px] font-medium uppercase tracking-tighter text-zinc-500">
              {currentShot && (
                <span className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-zinc-700" />
                  SHOT: <span className="text-zinc-300">{currentShot}</span>
                </span>
              )}
              {currentVariation && (
                <span className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-zinc-700" />
                  ANGLE: <span className="text-zinc-300">{currentVariation}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                RENDUS: <span className="text-blood-400">{completed} / {total}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="bg-[#14131a] border-blood-900/30 text-zinc-400 hover:text-white hover:border-blood-600/50 text-[10px] font-bold uppercase"
              >
                Interrompre
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats bar component
interface StatsBarProps {
  totalShots: number;
  completedShots: number;
  totalVariations: number;
  completedVariations: number;
  pendingVariations: number;
}

export function StatsBar({
  totalShots,
  completedShots,
  totalVariations,
  completedVariations,
  pendingVariations,
}: StatsBarProps) {
  return (
    <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
        <span className="text-zinc-500">
          <span className="text-zinc-200">{totalShots}</span> SHOTS
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blood-500 shadow-sm shadow-blood-500/50" />
        <span className="text-zinc-500">
          <span className="text-blood-400">{completedVariations}</span> / {totalVariations} IMAGES
        </span>
      </div>
      {pendingVariations > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-zinc-500">
            <span className="text-amber-400">{pendingVariations}</span> EN ATTENTE
          </span>
        </div>
      )}
    </div>
  );
}
