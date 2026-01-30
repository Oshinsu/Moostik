"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Shot } from "@/types/moostik";

interface BatchGeneratorProps {
  shots: Shot[];
  episodeId: string;
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface GenerationStatus {
  shotId: string;
  status: "pending" | "generating" | "completed" | "failed";
  errorMsg?: string;
}

export function BatchGenerator({
  shots,
  episodeId,
  open,
  onClose,
  onComplete,
}: BatchGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [statuses, setStatuses] = useState<GenerationStatus[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pendingShots = shots.filter(
    (s) => s.status === "pending" || s.status === "in_progress"
  );

  const startGeneration = async () => {
    if (pendingShots.length === 0) return;

    setIsGenerating(true);
    setStatuses(
      pendingShots.map((s) => ({
        shotId: s.id,
        status: "pending" as const,
      }))
    );

    for (let i = 0; i < pendingShots.length; i++) {
      const shot = pendingShots[i];
      setCurrentIndex(i);

      // Update status to generating
      setStatuses((prev) =>
        prev.map((s) =>
          s.shotId === shot.id ? { ...s, status: "generating" } : s
        )
      );

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            episodeId,
            shotId: shot.id,
            prompt: shot.prompt,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Generation failed");
        }

        // Update status to completed
        setStatuses((prev) =>
          prev.map((s) =>
            s.shotId === shot.id ? { ...s, status: "completed" } : s
          )
        );
      } catch (error) {
        // Update status to error
        setStatuses((prev) =>
          prev.map((s) =>
            s.shotId === shot.id
              ? {
                  ...s,
                  status: "failed",
                  errorMsg: error instanceof Error ? error.message : "Unknown error",
                }
              : s
          )
        );
      }

      // Small delay between generations to avoid rate limiting
      if (i < pendingShots.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    setIsGenerating(false);
    onComplete();
  };

  const completedCount = statuses.filter((s) => s.status === "completed").length;
  const errorCount = statuses.filter((s) => s.status === "failed").length;
  const progress =
    statuses.length > 0 ? ((completedCount + errorCount) / statuses.length) * 100 : 0;

  const statusColors = {
    pending: "bg-gray-500",
    generating: "bg-yellow-500 animate-pulse",
    completed: "bg-green-500",
    failed: "bg-red-500",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Génération Batch</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">
              {pendingShots.length} shots à générer
            </span>
            {isGenerating && (
              <span className="text-yellow-500">
                Génération en cours... ({currentIndex + 1}/{pendingShots.length})
              </span>
            )}
          </div>

          {/* Progress */}
          {statuses.length > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2 bg-zinc-800" />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{completedCount} terminés</span>
                {errorCount > 0 && (
                  <span className="text-red-400">{errorCount} erreurs</span>
                )}
              </div>
            </div>
          )}

          {/* Shot List */}
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {pendingShots.map((shot, index) => {
                const status = statuses.find((s) => s.shotId === shot.id);
                return (
                  <div
                    key={shot.id}
                    className={`flex items-center justify-between p-3 rounded-lg bg-zinc-900 border ${
                      status?.status === "generating"
                        ? "border-yellow-800"
                        : "border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 text-sm w-8">
                        #{index + 1}
                      </span>
                      <span className="text-sm">{shot.name}</span>
                    </div>
                    {status && (
                      <Badge className={statusColors[status.status]}>
                        {status.status === "pending" && "En attente"}
                        {status.status === "generating" && "Génération..."}
                        {status.status === "completed" && "Terminé"}
                        {status.status === "failed" && "Erreur"}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Error Details */}
          {errorCount > 0 && (
            <div className="p-3 bg-red-950 border border-red-900 rounded-lg">
              <p className="text-sm text-red-400">
                {errorCount} shot(s) ont échoué. Tu peux les régénérer
                individuellement.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
            className="bg-zinc-900 border-zinc-800"
          >
            Fermer
          </Button>
          <Button
            onClick={startGeneration}
            disabled={isGenerating || pendingShots.length === 0}
            className="bg-red-900 hover:bg-red-800"
          >
            {isGenerating ? "Génération en cours..." : "Lancer la génération"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
