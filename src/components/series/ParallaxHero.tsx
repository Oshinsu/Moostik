"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ============================================================================
// TYPES
// ============================================================================

export interface ParallaxLayer {
  id: string;
  src: string;
  alt?: string;
  speed: number;    // Parallax speed multiplier (0 = fixed, 1 = scroll speed)
  opacity?: number;
  blur?: number;    // Optional blur effect
  scale?: number;   // Initial scale
  zIndex?: number;
}

export interface ParallaxHeroProps {
  /** Parallax background layers (back to front) */
  layers?: ParallaxLayer[];
  /** Main background image (fallback if no layers) */
  backgroundImage?: string;
  /** Video background URL */
  backgroundVideo?: string;
  /** Title text */
  title: string;
  /** Subtitle text */
  subtitle?: string;
  /** Tagline */
  tagline?: string;
  /** Description paragraph */
  description?: string;
  /** Badge text above title */
  badge?: string;
  /** Primary CTA */
  primaryCta?: {
    label: string;
    href: string;
  };
  /** Secondary CTA */
  secondaryCta?: {
    label: string;
    href: string;
  };
  /** Height (default: 100vh) */
  height?: string;
  /** Overlay color/gradient */
  overlay?: string;
  /** Content alignment */
  alignment?: "left" | "center" | "right";
  /** Custom className */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ParallaxHero({
  layers = [],
  backgroundImage,
  backgroundVideo,
  title,
  subtitle,
  tagline,
  description,
  badge,
  primaryCta,
  secondaryCta,
  height = "100vh",
  overlay = "linear-gradient(to bottom, rgba(11,11,14,0.3), rgba(11,11,14,0.7), rgba(11,11,14,1))",
  alignment = "center",
  className = "",
}: ParallaxHeroProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate opacity based on scroll
  const contentOpacity = Math.max(0, 1 - scrollY / 500);
  const parallaxOffset = scrollY * 0.3;

  // Alignment classes
  const alignmentClasses = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  };

  return (
    <section
      ref={heroRef}
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* === BACKGROUND LAYERS === */}
      <div className="absolute inset-0">
        {/* Video background */}
        {backgroundVideo && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: `translateY(${parallaxOffset}px) scale(1.1)`,
            }}
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        )}

        {/* Image background (fallback) */}
        {!backgroundVideo && backgroundImage && layers.length === 0 && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              transform: `translateY(${parallaxOffset}px) scale(1.1)`,
            }}
          />
        )}

        {/* Parallax layers */}
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className="absolute inset-0"
            style={{
              transform: `translateY(${scrollY * layer.speed}px) scale(${layer.scale || 1})`,
              opacity: layer.opacity ?? 1,
              filter: layer.blur ? `blur(${layer.blur}px)` : undefined,
              zIndex: layer.zIndex ?? index,
            }}
          >
            <img
              src={layer.src}
              alt={layer.alt || ""}
              className="w-full h-full object-cover"
              loading={index > 2 ? "lazy" : "eager"}
            />
          </div>
        ))}

        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{ background: overlay }}
        />

        {/* Animated blood veins effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 w-px h-full bg-gradient-to-b from-blood-600/30 via-blood-800/20 to-transparent animate-pulse"
              style={{
                left: `${15 + i * 20}%`,
                animationDelay: `${i * 0.3}s`,
                transform: `translateY(${scrollY * (0.1 + i * 0.05)}px)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* === CONTENT === */}
      <div
        className={`
          relative z-10 h-full flex flex-col justify-center px-4 md:px-8 lg:px-16
          transition-opacity duration-1000
          ${alignmentClasses[alignment]}
          ${isVisible ? "opacity-100" : "opacity-0"}
        `}
        style={{
          transform: `translateY(${scrollY * -0.2}px)`,
          opacity: contentOpacity,
        }}
      >
        <div className="max-w-4xl">
          {/* Badge */}
          {badge && (
            <Badge className="bg-blood-900/60 text-blood-300 border-blood-700/50 mb-6 text-sm backdrop-blur-sm animate-fade-in-up">
              {badge}
            </Badge>
          )}

          {/* Title */}
          <h1
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase mb-4 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="block text-blood-500 moostik-text-glow">{title}</span>
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p
              className="text-2xl md:text-3xl text-zinc-400 font-light tracking-wide mb-2 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              {subtitle}
            </p>
          )}

          {/* Tagline */}
          {tagline && (
            <p
              className="text-lg text-blood-400 italic mb-8 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              "{tagline}"
            </p>
          )}

          {/* Description */}
          {description && (
            <p
              className="text-zinc-500 max-w-2xl mb-10 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              {description}
            </p>
          )}

          {/* CTAs */}
          {(primaryCta || secondaryCta) && (
            <div
              className="flex flex-wrap gap-4 animate-fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              {primaryCta && (
                <a href={primaryCta.href}>
                  <Button
                    size="lg"
                    className="moostik-btn-blood text-white font-bold px-8 py-6 text-lg"
                  >
                    {primaryCta.label}
                  </Button>
                </a>
              )}
              {secondaryCta && (
                <a href={secondaryCta.href}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blood-700/50 text-blood-400 hover:bg-blood-900/20 px-8 py-6 text-lg"
                  >
                    {secondaryCta.label}
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* === SCROLL INDICATOR === */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
        style={{ opacity: Math.max(0, 1 - scrollY / 200) }}
      >
        <svg
          className="w-8 h-8 text-blood-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>

      {/* === CUSTOM CSS === */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .moostik-text-glow {
          text-shadow: 
            0 0 40px rgba(220, 38, 38, 0.5),
            0 0 80px rgba(220, 38, 38, 0.3),
            0 0 120px rgba(220, 38, 38, 0.1);
        }
        .moostik-btn-blood {
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
          box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);
          transition: all 0.3s ease;
        }
        .moostik-btn-blood:hover {
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          box-shadow: 0 6px 30px rgba(220, 38, 38, 0.6);
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}

export default ParallaxHero;
