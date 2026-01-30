"use client";

import { cn } from "@/lib/utils";

interface MoostikLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  variant?: "full" | "icon";
}

export function MoostikLogo({ 
  size = "md", 
  className,
  showText = true,
  variant = "full"
}: MoostikLogoProps) {
  const sizes = {
    sm: { icon: "w-6 h-6", text: "text-lg" },
    md: { icon: "w-8 h-8", text: "text-xl" },
    lg: { icon: "w-10 h-10", text: "text-2xl" },
    xl: { icon: "w-14 h-14", text: "text-3xl" },
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo Icon - Goutte-Œil (Blood Drop Eye) */}
      <div className={cn(
        "relative flex items-center justify-center",
        sizes[size].icon
      )}>
        {/* Blood drop shape */}
        <svg 
          viewBox="0 0 100 120" 
          className="w-full h-full"
          fill="none"
        >
          {/* Main blood drop */}
          <defs>
            <linearGradient id="bloodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B0002A" />
              <stop offset="50%" stopColor="#8B0015" />
              <stop offset="100%" stopColor="#6B0012" />
            </linearGradient>
            <linearGradient id="amberGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFB25A" />
              <stop offset="100%" stopColor="#D4A017" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Drop body */}
          <path 
            d="M50 5 C50 5, 15 45, 15 70 C15 95, 30 115, 50 115 C70 115, 85 95, 85 70 C85 45, 50 5, 50 5Z"
            fill="url(#bloodGradient)"
            stroke="#B0002A"
            strokeWidth="2"
          />
          
          {/* Eye socket */}
          <ellipse 
            cx="50" 
            cy="70" 
            rx="22" 
            ry="18"
            fill="#0B0B0E"
          />
          
          {/* Eye iris */}
          <ellipse 
            cx="50" 
            cy="70" 
            rx="14" 
            ry="12"
            fill="url(#amberGlow)"
            filter="url(#glow)"
          />
          
          {/* Eye pupil */}
          <ellipse 
            cx="50" 
            cy="70" 
            rx="6" 
            ry="8"
            fill="#0B0B0E"
          />
          
          {/* Eye highlight */}
          <circle 
            cx="45" 
            cy="66" 
            r="3"
            fill="white"
            opacity="0.8"
          />
        </svg>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-blood-600/20 blur-md -z-10" />
      </div>

      {/* Logo Text */}
      {showText && variant === "full" && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold tracking-tight bg-gradient-to-r from-blood-500 via-crimson-500 to-blood-600 bg-clip-text text-transparent",
            sizes[size].text
          )}>
            MOOSTIK
          </span>
          <span className="text-[10px] tracking-[0.2em] text-amber-500/70 -mt-1">
            BLOODWINGS STUDIO
          </span>
        </div>
      )}
    </div>
  );
}

// Variante animée du logo
export function MoostikLogoAnimated(props: MoostikLogoProps) {
  return (
    <div className="group">
      <div className="transition-transform duration-300 group-hover:scale-105">
        <MoostikLogo {...props} />
      </div>
    </div>
  );
}
