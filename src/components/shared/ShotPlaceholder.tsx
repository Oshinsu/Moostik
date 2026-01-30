"use client";

import { cn } from "@/lib/utils";

interface ShotPlaceholderProps {
  status: "pending" | "generating" | "failed";
  className?: string;
}

export function ShotPlaceholder({ status, className }: ShotPlaceholderProps) {
  return (
    <div className={cn(
      "relative w-full h-full flex items-center justify-center bg-[#0b0b0e] overflow-hidden",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 moostik-bg-veins" />
      
      {/* Animated Glow */}
      {status === "generating" && (
        <div className="absolute inset-0 bg-gradient-to-br from-blood-900/10 via-transparent to-amber-900/10 animate-pulse" />
      )}

      <div className="relative text-center z-10 p-6">
        <div className={cn(
          "w-16 h-16 mx-auto mb-4 rounded-3xl flex items-center justify-center border transition-all duration-700",
          status === "generating" 
            ? "bg-amber-900/10 border-amber-500/30 animate-bounce" 
            : status === "failed"
            ? "bg-red-900/10 border-red-500/30"
            : "bg-blood-900/5 border-blood-900/20"
        )}>
          {status === "generating" ? (
            <svg className="w-8 h-8 text-amber-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          ) : status === "failed" ? (
            <svg className="w-8 h-8 text-red-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-blood-900/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        
        <h4 className={cn(
          "text-[10px] font-bold uppercase tracking-[0.2em] mb-1",
          status === "generating" ? "text-amber-500" : "text-zinc-600"
        )}>
          {status === "generating" ? "Rendu IA en cours" : status === "failed" ? "Erreur de rendu" : "Prêt pour production"}
        </h4>
        <p className="text-[9px] text-zinc-700 font-medium uppercase tracking-widest">
          {status === "generating" ? "Standard JSON MOOSTIK v2.0" : "En attente de lancement"}
        </p>
      </div>

      {/* Progress Line (Animated) */}
      {status === "generating" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900">
          <div className="h-full bg-amber-500 animate-shimmer" style={{ width: "30%" }} />
        </div>
      )}
    </div>
  );
}
