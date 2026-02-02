"use client";

import { cn } from "@/lib/utils";

interface BloodwingsLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "text";
  className?: string;
}

export function BloodwingsLogo({ 
  size = "md", 
  variant = "full",
  className 
}: BloodwingsLogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
    xl: "h-16",
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  const Icon = () => (
    <div className={cn(
      "relative flex items-center justify-center",
      iconSizes[size]
    )}>
      {/* Wing silhouette with blood drip effect */}
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        className="w-full h-full"
      >
        {/* Left Wing */}
        <path 
          d="M50 50 L20 20 Q10 35 15 50 Q20 65 35 70 L50 50" 
          fill="url(#bloodGradient)"
          className="drop-shadow-lg"
        />
        {/* Right Wing */}
        <path 
          d="M50 50 L80 20 Q90 35 85 50 Q80 65 65 70 L50 50" 
          fill="url(#bloodGradient)"
          className="drop-shadow-lg"
        />
        {/* Center Eye */}
        <circle cx="50" cy="50" r="8" fill="#0b0b0e" />
        <circle cx="50" cy="50" r="5" fill="#8B0000" className="animate-pulse" />
        <circle cx="48" cy="48" r="1.5" fill="#fff" opacity="0.8" />
        
        {/* Blood drips */}
        <path 
          d="M35 70 Q33 80 35 85 Q37 90 35 95" 
          stroke="#8B0000" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path 
          d="M65 70 Q67 78 65 82" 
          stroke="#8B0000" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
        
        <defs>
          <linearGradient id="bloodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC143C" />
            <stop offset="50%" stopColor="#8B0000" />
            <stop offset="100%" stopColor="#4a0000" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  if (variant === "icon") {
    return <Icon />;
  }

  if (variant === "text") {
    return (
      <span className={cn(
        "font-black tracking-tight",
        textSizes[size],
        className
      )}>
        <span className="bg-gradient-to-r from-blood-500 via-crimson-500 to-blood-600 bg-clip-text text-transparent">
          BLOODWINGS
        </span>
        <span className="text-zinc-400 font-light ml-1">STUDIO</span>
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", sizeClasses[size], className)}>
      <Icon />
      <div className="flex flex-col">
        <span className={cn(
          "font-black tracking-tight leading-none",
          size === "sm" ? "text-sm" : size === "md" ? "text-lg" : size === "lg" ? "text-2xl" : "text-3xl"
        )}>
          <span className="bg-gradient-to-r from-blood-500 via-crimson-500 to-blood-600 bg-clip-text text-transparent">
            BLOODWINGS
          </span>
        </span>
        <span className={cn(
          "text-zinc-500 font-medium tracking-widest uppercase",
          size === "sm" ? "text-[8px]" : size === "md" ? "text-[10px]" : size === "lg" ? "text-xs" : "text-sm"
        )}>
          Studio
        </span>
      </div>
    </div>
  );
}
