"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { MoostikLogo } from "@/components/MoostikLogo";
import type { Episode } from "@/types/moostik";

interface SidebarProps {
  episodes?: Episode[];
  onCreateEpisode?: () => void;
}

// Icônes personnalisées Moostik
const MoostikIcons = {
  dashboard: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M12 3L4 9v10a2 2 0 002 2h12a2 2 0 002-2V9l-8-6z"
      />
      <path 
        strokeLinecap="round" 
        strokeWidth={1.5} 
        d="M12 12v-2m0 2a2 2 0 100 4 2 2 0 000-4z"
      />
    </svg>
  ),
  characters: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      {/* Proboscis silhouette */}
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M12 4c-1 0-2 .5-2.5 1.5l-.5 2c-.5 2-2 3.5-2 5.5 0 3 2.5 5.5 5 7"
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M12 4c1 0 2 .5 2.5 1.5l.5 2c.5 2 2 3.5 2 5.5 0 3-2.5 5.5-5 7"
      />
      <circle cx="12" cy="10" r="2" strokeWidth={1.5} />
    </svg>
  ),
  locations: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      {/* Gothic arch */}
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M4 20V10c0-4 4-7 8-7s8 3 8 7v10"
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M8 20v-6c0-2 2-4 4-4s4 2 4 4v6"
      />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </svg>
  ),
  lore: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      {/* Ancient book with blood drop */}
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M4 4h3a3 3 0 013 3v13H4V4z"
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M20 4h-3a3 3 0 00-3 3v13h6V4z"
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M12 7v3"
      />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  references: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      {/* Wing pattern frame */}
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} />
      <path 
        strokeLinecap="round" 
        strokeWidth={1.5} 
        d="M7 12c2-3 4-4 5-4s3 1 5 4"
      />
      <path 
        strokeLinecap="round" 
        strokeWidth={1.5} 
        d="M7 15c2-2 4-3 5-3s3 1 5 3"
      />
    </svg>
  ),
  library: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      {/* Scrolls with seal */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 6h16M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6M4 6l2-2h12l2 2"
      />
      <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
      <path strokeLinecap="round" strokeWidth={1.5} d="M12 10v4M10 12h4" />
    </svg>
  ),
  video: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      {/* Film reel with play */}
      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={1.5} />
      <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
      <circle cx="6" cy="5" r="1.5" fill="currentColor" />
      <circle cx="18" cy="5" r="1.5" fill="currentColor" />
      <circle cx="6" cy="19" r="1.5" fill="currentColor" />
      <circle cx="18" cy="19" r="1.5" fill="currentColor" />
    </svg>
  ),
  episode: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M7 4v16l5-4 5 4V4H7z"
      />
    </svg>
  ),
  add: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
      <path strokeLinecap="round" strokeWidth={2} d="M12 8v8M8 12h8" />
    </svg>
  ),
  arrow: (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

export function Sidebar({ episodes = [], onCreateEpisode = () => {} }: SidebarProps) {
  const pathname = usePathname();
  const [expandedEpisodes, setExpandedEpisodes] = useState<string[]>([]);

  const toggleEpisode = (id: string) => {
    setExpandedEpisodes((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const navItems = [
    { href: "/", icon: MoostikIcons.dashboard, label: "Quartier Général", sublabel: "Centre de commandement" },
    { href: "/characters", icon: MoostikIcons.characters, label: "Les Bloodwings", sublabel: "16 âmes" },
    { href: "/locations", icon: MoostikIcons.locations, label: "Territoires", sublabel: "8 lieux sacrés" },
    { href: "/video", icon: MoostikIcons.video, label: "Vidéo I2V", sublabel: "12 modèles SOTA", badge: "NEW" },
    { href: "/lore", icon: MoostikIcons.lore, label: "Bible Sacrée", sublabel: "Le savoir ancestral" },
    { href: "/references", icon: MoostikIcons.references, label: "Galerie des Âmes", sublabel: "Références visuelles" },
    { href: "/library", icon: MoostikIcons.library, label: "Archives", sublabel: "Toutes les images" },
  ];

  return (
    <aside className="w-72 border-r border-blood-900/30 bg-gradient-to-b from-[#0b0b0e] via-[#0f0e12] to-[#14131a] flex flex-col h-screen">
      {/* Header with Logo */}
      <div className="p-4 border-b border-blood-900/30">
        <Link href="/" className="block group">
          <div className="transition-transform duration-300 group-hover:scale-[1.02]">
            <MoostikLogo size="md" />
          </div>
        </Link>
      </div>

      {/* Blood vein decoration */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-blood-700/50 to-transparent" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blood-900/40 to-blood-800/20 border-l-2 border-blood-500 text-amber-400"
                      : "text-zinc-400 hover:text-amber-400 hover:bg-blood-900/20"
                  )}
                >
                  <div className={cn(
                    "transition-colors duration-200",
                    isActive ? "text-blood-400" : "text-zinc-500 group-hover:text-blood-400"
                  )}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "text-sm font-medium truncate flex items-center gap-2",
                      isActive ? "text-amber-400" : "text-zinc-300 group-hover:text-amber-400"
                    )}>
                      {item.label}
                      {"badge" in item && item.badge && (
                        <Badge className="text-[8px] px-1 py-0 bg-blood-600 text-white border-0">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-600 truncate">
                      {item.sublabel}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blood-500 animate-pulse" />
                  )}
                </div>
              </Link>
            );
          })}

          {/* Separator with blood drop motif */}
          <div className="py-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blood-800/50 to-transparent" />
              <div className="w-2 h-3 rounded-full bg-blood-700/30" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blood-800/50 to-transparent" />
            </div>
          </div>

          {/* Episodes Header */}
          <div className="flex items-center justify-between px-3 py-2">
            <div>
              <span className="text-xs font-semibold text-blood-400 uppercase tracking-wider">
                Chroniques
              </span>
              <p className="text-[10px] text-zinc-600">Épisodes de la saga</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateEpisode}
              className="h-7 w-7 p-0 text-blood-400 hover:text-amber-400 hover:bg-blood-900/30 rounded-full"
            >
              {MoostikIcons.add}
            </Button>
          </div>

          {/* Episodes List */}
          {episodes.map((episode) => {
            const isExpanded = expandedEpisodes.includes(episode.id);
            const totalVariations = episode.shots.reduce((sum, s) => sum + s.variations.length, 0);
            const completedVariations = episode.shots.reduce(
              (sum, s) => sum + s.variations.filter((v) => v.status === "completed").length,
              0
            );
            const progress = totalVariations > 0 ? (completedVariations / totalVariations) * 100 : 0;

            return (
              <Collapsible
                key={episode.id}
                open={isExpanded}
                onOpenChange={() => toggleEpisode(episode.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between text-zinc-400 hover:text-amber-400 hover:bg-blood-900/20 group px-3",
                      pathname.includes(`/episode/${episode.id}`) && "bg-blood-900/30 text-amber-400"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "transition-transform duration-200",
                        isExpanded && "rotate-90"
                      )}>
                        {MoostikIcons.arrow}
                      </div>
                      <div className="text-blood-400">{MoostikIcons.episode}</div>
                      <div className="text-left">
                        <span className="text-sm font-medium">EP{episode.number}</span>
                        <span className="text-[10px] text-zinc-500 block truncate max-w-[100px]">
                          {episode.title}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Progress bar */}
                      <div className="w-12 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blood-600 to-amber-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] px-1.5 py-0 border-0 font-mono",
                          completedVariations === totalVariations
                            ? "text-amber-400 bg-amber-900/30"
                            : completedVariations > 0
                            ? "text-blood-400 bg-blood-900/30"
                            : "text-zinc-500 bg-zinc-900/30"
                        )}
                      >
                        {completedVariations}/{totalVariations}
                      </Badge>
                    </div>
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="pl-8 space-y-0.5 mt-1">
                  <Link href={`/episode/${episode.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-xs text-zinc-500 hover:text-amber-400 hover:bg-blood-900/20",
                        pathname === `/episode/${episode.id}` && "text-amber-400 bg-blood-900/30"
                      )}
                    >
                      ⚔️ Tous les plans ({episode.shots.length})
                    </Button>
                  </Link>
                  {episode.shots.slice(0, 5).map((shot) => (
                    <Link key={shot.id} href={`/episode/${episode.id}/shot/${shot.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-xs text-zinc-500 hover:text-amber-400 hover:bg-blood-900/20 truncate",
                          pathname === `/episode/${episode.id}/shot/${shot.id}` &&
                            "text-amber-400 bg-blood-900/30"
                        )}
                      >
                        <span className="truncate">🩸 #{shot.number} {shot.name}</span>
                      </Button>
                    </Link>
                  ))}
                  {episode.shots.length > 5 && (
                    <span className="text-[10px] text-blood-600/60 px-3 italic">
                      +{episode.shots.length - 5} autres scènes...
                    </span>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}

          {episodes.length === 0 && (
            <div className="text-center py-6 px-3">
              <div className="text-2xl mb-2 opacity-50">📜</div>
              <p className="text-xs text-zinc-600">
                Aucune chronique écrite.
              </p>
              <p className="text-[10px] text-blood-600/60 mt-1">
                Clique + pour commencer la saga.
              </p>
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-blood-900/30 bg-[#0a0a0c]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blood-500 animate-pulse" />
            <span className="text-[10px] text-zinc-500">Connecté aux esprits</span>
          </div>
          <span className="text-[10px] text-blood-600/60 font-mono">v2.0 • 2026</span>
        </div>
        {/* Blood vein decoration */}
        <div className="mt-2 h-[1px] bg-gradient-to-r from-blood-900/50 via-blood-700/30 to-blood-900/50" />
      </div>
    </aside>
  );
}
