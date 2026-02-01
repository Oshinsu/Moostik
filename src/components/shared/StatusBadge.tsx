"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Loader2, XCircle, Sparkles, AlertCircle } from "lucide-react";

export type StatusType = 
  | "completed" 
  | "pending" 
  | "generating" 
  | "failed" 
  | "ready" 
  | "processing"
  | "queued";

interface StatusBadgeProps {
  status: string;
  /** Variante pour les vidéos (légèrement différent) */
  variant?: "image" | "video";
  /** Taille du badge */
  size?: "sm" | "md";
}

/**
 * Badge de statut réutilisable pour images et vidéos
 */
export function StatusBadge({ status, variant = "image", size = "sm" }: StatusBadgeProps) {
  const iconClass = size === "sm" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1";

  switch (status) {
    case "completed":
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          <CheckCircle className={iconClass} />
          Complété
        </Badge>
      );

    case "pending":
      return (
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
          <Clock className={iconClass} />
          En attente
        </Badge>
      );

    case "generating":
      return (
        <Badge className={variant === "video" 
          ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
          : "bg-blue-500/20 text-blue-400 border-blue-500/30"
        }>
          <Loader2 className={`${iconClass} animate-spin`} />
          En cours
        </Badge>
      );

    case "processing":
      return (
        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
          <Loader2 className={`${iconClass} animate-spin`} />
          Traitement
        </Badge>
      );

    case "ready":
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <Sparkles className={iconClass} />
          Prêt
        </Badge>
      );

    case "queued":
      return (
        <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
          <Clock className={iconClass} />
          En file
        </Badge>
      );

    case "failed":
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          <XCircle className={iconClass} />
          Échoué
        </Badge>
      );

    default:
      return (
        <Badge variant="outline" className="text-zinc-400 border-zinc-600">
          <AlertCircle className={iconClass} />
          {status}
        </Badge>
      );
  }
}

/**
 * Badge de type d'image (legacy/variation)
 */
export function ImageTypeBadge({ type }: { type: "legacy" | "variation" }) {
  if (type === "legacy") {
    return (
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
        Legacy
      </Badge>
    );
  }
  return (
    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
      <CheckCircle className="h-3 w-3 mr-1" />
      Généré
    </Badge>
  );
}
