"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Camera,
  Check,
  Download,
  Grid3X3,
  Loader2,
  RefreshCw,
  Star,
  Wand2,
  Zap,
} from "lucide-react";
import {
  type CinematicAngle,
  type ShotResult,
  type ShotsStyle,
  SHOTS_GRID_CONFIG,
  getAngleConfig,
} from "@/lib/shots/types";

interface ShotsGridProps {
  /** Source image URL */
  sourceImage: string;

  /** Generated shots */
  shots: ShotResult[];

  /** Currently selected shot */
  selectedShot?: string;

  /** On shot selection */
  onSelectShot?: (shotId: string) => void;

  /** On regenerate shot */
  onRegenerateShot?: (angle: CinematicAngle) => void;

  /** On download shot */
  onDownloadShot?: (shot: ShotResult) => void;

  /** On set as reference */
  onSetReference?: (shot: ShotResult) => void;

  /** Reference shot ID */
  referenceId?: string;

  /** Is generating */
  isGenerating?: boolean;

  /** Show angle labels */
  showLabels?: boolean;

  /** Compact mode */
  compact?: boolean;

  /** Style preset being used */
  stylePreset?: ShotsStyle;
}

export function ShotsGrid({
  sourceImage,
  shots,
  selectedShot,
  onSelectShot,
  onRegenerateShot,
  onDownloadShot,
  onSetReference,
  referenceId,
  isGenerating = false,
  showLabels = true,
  compact = false,
  stylePreset = "pixar_dark",
}: ShotsGridProps) {
  const [hoveredShot, setHoveredShot] = useState<string | null>(null);

  // Get shot by grid position
  const getShotForPosition = useCallback(
    (position: number): ShotResult | undefined => {
      const config = SHOTS_GRID_CONFIG.find((c) => c.gridPosition === position);
      if (!config) return undefined;
      return shots.find((s) => s.angle === config.angle);
    },
    [shots]
  );

  // Status colors
  const statusColors = {
    pending: "bg-zinc-800/50 border-zinc-700/30",
    generating: "bg-amber-900/30 border-amber-600/30 animate-pulse",
    completed: "bg-blood-900/20 border-blood-600/30",
    failed: "bg-red-900/30 border-red-600/30",
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blood-900/20 border border-blood-600/30 flex items-center justify-center">
              <Grid3X3 className="w-5 h-5 text-blood-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-300">
                Grille x9 Cinématique
              </h3>
              <p className="text-xs text-zinc-600">
                9 angles • {stylePreset.replace(/_/g, " ")}
              </p>
            </div>
          </div>

          <Badge className="bg-blood-900/20 text-blood-400 border-blood-900/30 text-xs">
            {shots.filter((s) => s.status === "completed").length}/9 générés
          </Badge>
        </div>

        {/* Source Image Preview */}
        {sourceImage && (
          <div className="relative aspect-video w-full max-w-[200px] rounded-lg overflow-hidden border border-blood-900/20">
            <Image
              src={sourceImage}
              alt="Source"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                Image Source
              </p>
            </div>
          </div>
        )}

        {/* 3x3 Grid */}
        <div
          className={cn(
            "grid grid-cols-3 gap-2",
            compact ? "gap-1" : "gap-3"
          )}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((position) => {
            const config = SHOTS_GRID_CONFIG.find(
              (c) => c.gridPosition === position
            );
            const shot = getShotForPosition(position);
            const isSelected = shot?.id === selectedShot;
            const isReference = shot?.id === referenceId;
            const isHovered = shot?.id === hoveredShot;

            if (!config) return null;

            return (
              <div
                key={position}
                className={cn(
                  "group relative rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer",
                  shot?.status ? statusColors[shot.status] : "bg-zinc-900/30 border-zinc-800/30",
                  isSelected && "ring-2 ring-blood-500/50",
                  isReference && "ring-2 ring-amber-500/50"
                )}
                onClick={() => shot?.id && onSelectShot?.(shot.id)}
                onMouseEnter={() => shot?.id && setHoveredShot(shot.id)}
                onMouseLeave={() => setHoveredShot(null)}
              >
                {/* Image/Placeholder */}
                <div
                  className={cn(
                    "aspect-video relative bg-[#0a0a0d]",
                    compact ? "aspect-square" : "aspect-video"
                  )}
                >
                  {shot?.imageUrl ? (
                    <Image
                      src={shot.imageUrl}
                      alt={config.labelFr}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2">
                      <Camera className="w-6 h-6 text-zinc-700" />
                      {!compact && (
                        <p className="text-[10px] text-zinc-700 text-center">
                          {config.labelFr}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Generating Overlay */}
                  {shot?.status === "generating" && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    </div>
                  )}

                  {/* Hover Actions */}
                  {shot?.status === "completed" && (isHovered || isSelected) && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownloadShot?.(shot);
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Télécharger</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRegenerateShot?.(config.angle);
                            }}
                            disabled={isGenerating}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Régénérer</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={cn(
                              "h-8 w-8 p-0 rounded-full text-white",
                              isReference
                                ? "bg-amber-500/80 hover:bg-amber-500"
                                : "bg-white/10 hover:bg-white/20"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetReference?.(shot);
                            }}
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isReference ? "Référence active" : "Définir comme référence"}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}

                  {/* Reference Badge */}
                  {isReference && (
                    <div className="absolute top-1 left-1">
                      <Badge className="bg-amber-500 text-black text-[8px] px-1 py-0 border-0">
                        REF
                      </Badge>
                    </div>
                  )}

                  {/* Status Badge */}
                  {shot?.status === "completed" && !compact && (
                    <div className="absolute top-1 right-1">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                </div>

                {/* Label */}
                {showLabels && !compact && (
                  <div className="p-2 bg-gradient-to-b from-transparent to-black/40">
                    <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider truncate">
                      {config.labelFr}
                    </p>
                    <p className="text-[8px] text-zinc-600 truncate">
                      {config.focalLength} • {config.aperture}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Generation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] text-zinc-500 border-zinc-800">
              <Zap className="w-3 h-3 mr-1" />4 crédits / grille
            </Badge>
          </div>

          <Button
            size="sm"
            className="moostik-btn-blood text-white text-xs"
            disabled={isGenerating || shots.every((s) => s.status === "completed")}
          >
            <Wand2 className="w-3 h-3 mr-2" />
            {isGenerating ? "Génération..." : "Générer x9"}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ============================================
// SHOT DETAIL PANEL
// ============================================

interface ShotDetailProps {
  shot: ShotResult;
  onClose?: () => void;
}

export function ShotDetail({ shot, onClose: _onClose }: ShotDetailProps) {
  // Reserved for future close button
  void _onClose;
  const config = getAngleConfig(shot.angle);

  if (!config) return null;

  return (
    <div className="space-y-4">
      {/* Image */}
      <div className="relative aspect-video rounded-xl overflow-hidden border border-blood-900/20">
        {shot.imageUrl ? (
          <Image
            src={shot.imageUrl}
            alt={config.labelFr}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <Camera className="w-12 h-12 text-zinc-700" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-bold text-white">{config.labelFr}</h4>
          <p className="text-xs text-zinc-500">{config.label}</p>
        </div>

        <p className="text-xs text-zinc-400">{config.description}</p>

        {/* Technical Details */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/30">
            <p className="text-[10px] text-zinc-600 uppercase">Focale</p>
            <p className="text-xs font-mono text-zinc-300">{config.focalLength}</p>
          </div>
          <div className="p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/30">
            <p className="text-[10px] text-zinc-600 uppercase">Ouverture</p>
            <p className="text-xs font-mono text-zinc-300">{config.aperture}</p>
          </div>
        </div>

        {/* Use Cases */}
        <div>
          <p className="text-[10px] text-zinc-600 uppercase mb-1">Cas d&apos;usage</p>
          <div className="flex flex-wrap gap-1">
            {config.useCase.map((use) => (
              <Badge
                key={use}
                variant="outline"
                className="text-[9px] text-zinc-500 border-zinc-800"
              >
                {use.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </div>

        {/* Prompt Modifier */}
        <div className="p-2 rounded-lg bg-zinc-900/30 border border-zinc-800/30">
          <p className="text-[10px] text-zinc-600 uppercase mb-1">Modificateur</p>
          <p className="text-[10px] text-zinc-500 font-mono">{config.promptModifier}</p>
        </div>
      </div>
    </div>
  );
}

export default ShotsGrid;
