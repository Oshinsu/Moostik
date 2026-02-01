"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MoostikLogo } from "@/components/MoostikLogo";
import type { Episode } from "@/types/moostik";
import {
  Home,
  Users,
  MapPin,
  Book,
  Image,
  FolderOpen,
  Video,
  Scissors,
  Sparkles,
  Grid3X3,
  Clapperboard,
  ChevronRight,
  Plus,
  Play,
  FileVideo,
  Zap,
  Bot,
  Settings,
  HelpCircle,
  ExternalLink,
  User,
  Shield,
  CreditCard,
  Crown,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

interface SidebarProps {
  episodes?: Episode[];
  onCreateEpisode?: () => void;
}

// Navigation sections
const NAV_SECTIONS = [
  {
    title: "Principal",
    items: [
      { 
        href: "/", 
        icon: Home, 
        label: "Quartier Général", 
        sublabel: "Dashboard",
        color: "text-amber-400",
      },
    ],
  },
  {
    title: "Création",
    items: [
      { 
        href: "/shots", 
        icon: Grid3X3, 
        label: "Shots x9", 
        sublabel: "Grille cinématique",
        badge: "SOTA",
        color: "text-violet-400",
      },
      { 
        href: "/cinema", 
        icon: Clapperboard, 
        label: "Cinema Studio", 
        sublabel: "Contrôle caméra",
        badge: "PRO",
        color: "text-indigo-400",
      },
      { 
        href: "/video", 
        icon: Video, 
        label: "Vidéo I2V", 
        sublabel: "12 modèles",
        color: "text-emerald-400",
      },
      { 
        href: "/editor", 
        icon: Scissors, 
        label: "Montage IA", 
        sublabel: "Blood Director",
        badge: "AI",
        color: "text-fuchsia-400",
      },
    ],
  },
  {
    title: "Univers",
    items: [
      { 
        href: "/characters", 
        icon: Users, 
        label: "Bloodwings", 
        sublabel: "19 personnages",
        color: "text-blood-400",
      },
      { 
        href: "/locations", 
        icon: MapPin, 
        label: "Territoires", 
        sublabel: "12 lieux",
        color: "text-crimson-400",
      },
      { 
        href: "/lore", 
        icon: Book, 
        label: "Bible Sacrée", 
        sublabel: "Le lore",
        color: "text-copper-400",
      },
    ],
  },
  {
    title: "Archives",
    items: [
      { 
        href: "/references", 
        icon: Image, 
        label: "Galerie des Âmes", 
        sublabel: "Références",
        color: "text-amber-400",
      },
      { 
        href: "/library", 
        icon: FolderOpen, 
        label: "Médiathèque", 
        sublabel: "Tous les assets",
        color: "text-zinc-400",
      },
    ],
  },
];

export function Sidebar({ episodes = [], onCreateEpisode = () => {} }: SidebarProps) {
  const pathname = usePathname();
  const [expandedEpisodes, setExpandedEpisodes] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isAuthenticated, isAdmin, profile } = useAuth();

  // Auto-expand current episode
  useEffect(() => {
    const match = pathname.match(/\/episode\/([^/]+)/);
    if (match && !expandedEpisodes.includes(match[1])) {
      setExpandedEpisodes(prev => [...prev, match[1]]);
    }
  }, [pathname, expandedEpisodes]);

  const toggleEpisode = (id: string) => {
    setExpandedEpisodes(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  // Calculate global stats
  const globalStats = {
    totalShots: episodes.reduce((sum, ep) => sum + ep.shots.length, 0),
    completedVariations: episodes.reduce(
      (sum, ep) => sum + ep.shots.reduce(
        (s, shot) => s + shot.variations.filter(v => v.status === "completed").length, 0
      ), 0
    ),
    totalVariations: episodes.reduce(
      (sum, ep) => sum + ep.shots.reduce((s, shot) => s + shot.variations.length, 0), 0
    ),
  };

  const globalProgress = globalStats.totalVariations > 0 
    ? (globalStats.completedVariations / globalStats.totalVariations) * 100 
    : 0;

  return (
    <TooltipProvider>
      <aside className={cn(
        "flex-shrink-0 border-r border-blood-900/30 bg-gradient-to-b from-[#0b0b0e] via-[#0f0e12] to-[#14131a] flex flex-col h-screen transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className={cn(
          "flex-shrink-0 border-b border-blood-900/30 transition-all",
          isCollapsed ? "p-2" : "p-4"
        )}>
          <Link href="/" className="block group">
            {isCollapsed ? (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blood-600/30 to-crimson-600/20 border border-blood-600/30 flex items-center justify-center mx-auto">
                <span className="text-xl">🦟</span>
              </div>
            ) : (
              <MoostikLogo size="sm" />
            )}
          </Link>
        </div>

        {/* Blood vein */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-blood-700/50 to-transparent" />

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <div className={cn("py-3", isCollapsed ? "px-2" : "px-3")}>
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="mb-4">
                {!isCollapsed && (
                  <div className="px-3 py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                      {section.title}
                    </span>
                  </div>
                )}
                
                <nav className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || 
                      (item.href !== "/" && pathname.startsWith(item.href));
                    
                    const linkContent = (
                      <div
                        className={cn(
                          "group flex items-center gap-3 rounded-lg transition-all duration-200",
                          isCollapsed ? "p-2.5 justify-center" : "px-3 py-2",
                          isActive
                            ? "bg-gradient-to-r from-blood-900/50 to-blood-800/30 border-l-2 border-blood-500"
                            : "hover:bg-blood-900/20 border-l-2 border-transparent"
                        )}
                      >
                        <Icon className={cn(
                          "w-4 h-4 transition-colors flex-shrink-0",
                          isActive ? item.color : "text-zinc-500 group-hover:text-zinc-300"
                        )} />
                        
                        {!isCollapsed && (
                          <>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-sm font-medium truncate transition-colors",
                                  isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                                )}>
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <Badge className={cn(
                                    "text-[8px] px-1 py-0 h-4 border-0",
                                    item.badge === "SOTA" && "bg-violet-600/80 text-white",
                                    item.badge === "PRO" && "bg-indigo-600/80 text-white",
                                    item.badge === "AI" && "bg-fuchsia-600/80 text-white",
                                    item.badge === "NEW" && "bg-blood-600/80 text-white",
                                  )}>
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-600 truncate block">
                                {item.sublabel}
                              </span>
                            </div>
                            
                            {isActive && (
                              <div className="w-1.5 h-1.5 rounded-full bg-blood-500 animate-pulse flex-shrink-0" />
                            )}
                          </>
                        )}
                      </div>
                    );
                    
                    return isCollapsed ? (
                      <Tooltip key={item.href} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Link href={item.href}>{linkContent}</Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-[#14131a] border-blood-900/30">
                          <p className="font-medium">{item.label}</p>
                          <p className="text-[10px] text-zinc-500">{item.sublabel}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link key={item.href} href={item.href}>{linkContent}</Link>
                    );
                  })}
                </nav>
              </div>
            ))}

            {/* Separator */}
            {!isCollapsed && (
              <div className="py-3 px-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blood-800/50 to-transparent" />
                  <div className="w-1.5 h-2.5 rounded-full bg-blood-700/30" />
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blood-800/50 to-transparent" />
                </div>
              </div>
            )}

            {/* Episodes Section */}
            <div className="mb-4">
              {!isCollapsed && (
                <div className="flex items-center justify-between px-3 py-1.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blood-500">
                      Épisodes
                    </span>
                    {globalStats.totalVariations > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={globalProgress} className="h-1 w-16" />
                        <span className="text-[9px] text-zinc-600">
                          {globalStats.completedVariations}/{globalStats.totalVariations}
                        </span>
                      </div>
                    )}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCreateEpisode}
                        className="h-6 w-6 p-0 text-blood-400 hover:text-amber-400 hover:bg-blood-900/30 rounded-full"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Nouvel épisode</TooltipContent>
                  </Tooltip>
                </div>
              )}

              {isCollapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCreateEpisode}
                      className="w-full p-2.5 text-blood-400 hover:bg-blood-900/30"
                    >
                      <FileVideo className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-medium">Épisodes ({episodes.length})</p>
                    <p className="text-[10px] text-zinc-500">Cliquer pour créer</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div className="space-y-0.5">
                  {episodes.length === 0 ? (
                    <div className="text-center py-4 px-3">
                      <div className="text-xl mb-1 opacity-40">📜</div>
                      <p className="text-[10px] text-zinc-600">Aucun épisode</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCreateEpisode}
                        className="mt-2 h-7 text-[10px] text-blood-400 hover:text-amber-400"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Créer le premier
                      </Button>
                    </div>
                  ) : (
                    episodes.map((episode) => {
                      const isExpanded = expandedEpisodes.includes(episode.id);
                      const isActive = pathname.includes(`/episode/${episode.id}`);
                      const totalVariations = episode.shots.reduce((sum, s) => sum + s.variations.length, 0);
                      const completedVariations = episode.shots.reduce(
                        (sum, s) => sum + s.variations.filter(v => v.status === "completed").length, 0
                      );
                      const progress = totalVariations > 0 ? (completedVariations / totalVariations) * 100 : 0;
                      const hasVideo = episode.shots.some(s => s.variations.some(v => v.videoUrl));

                      return (
                        <Collapsible
                          key={episode.id}
                          open={isExpanded}
                          onOpenChange={() => toggleEpisode(episode.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <div
                              className={cn(
                                "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all",
                                isActive 
                                  ? "bg-blood-900/40 border-l-2 border-blood-500" 
                                  : "hover:bg-blood-900/20 border-l-2 border-transparent"
                              )}
                            >
                              <ChevronRight className={cn(
                                "w-3 h-3 text-zinc-600 transition-transform flex-shrink-0",
                                isExpanded && "rotate-90"
                              )} />
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "text-sm font-bold",
                                    isActive ? "text-amber-400" : "text-zinc-300"
                                  )}>
                                    EP{episode.number}
                                  </span>
                                  {hasVideo && (
                                    <Play className="w-3 h-3 text-emerald-500" />
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-500 truncate">
                                  {episode.title}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <div className="w-10 h-1 rounded-full bg-zinc-800 overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blood-600 to-amber-500 transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <Badge variant="outline" className={cn(
                                  "text-[8px] px-1 py-0 h-4 border-0 font-mono",
                                  completedVariations === totalVariations && totalVariations > 0
                                    ? "text-amber-400 bg-amber-900/30"
                                    : completedVariations > 0
                                    ? "text-blood-400 bg-blood-900/30"
                                    : "text-zinc-600 bg-zinc-900/30"
                                )}>
                                  {completedVariations}/{totalVariations}
                                </Badge>
                              </div>
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent className="pl-6 space-y-0.5 mt-0.5">
                            {/* Episode summary link */}
                            <Link href={`/episode/${episode.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "w-full justify-start text-xs h-7 px-2",
                                  pathname === `/episode/${episode.id}` 
                                    ? "text-amber-400 bg-blood-900/30" 
                                    : "text-zinc-500 hover:text-amber-400 hover:bg-blood-900/20"
                                )}
                              >
                                <Zap className="w-3 h-3 mr-2" />
                                Vue d'ensemble
                              </Button>
                            </Link>

                            {/* Direct video generation */}
                            <Link href={`/video?episode=${episode.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-xs h-7 px-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-900/20"
                              >
                                <Video className="w-3 h-3 mr-2" />
                                Générer vidéos
                              </Button>
                            </Link>

                            {/* Editor link */}
                            <Link href={`/editor?episode=${episode.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-xs h-7 px-2 text-zinc-500 hover:text-fuchsia-400 hover:bg-fuchsia-900/20"
                              >
                                <Bot className="w-3 h-3 mr-2" />
                                Blood Director
                              </Button>
                            </Link>

                            {/* Shots list (first 4) */}
                            {episode.shots.slice(0, 4).map((shot) => {
                              const shotCompleted = shot.variations.some(v => v.status === "completed");
                              const shotHasVideo = shot.variations.some(v => v.videoUrl);
                              return (
                                <Link key={shot.id} href={`/episode/${episode.id}#shot-${shot.id}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                      "w-full justify-start text-[11px] h-6 px-2 font-normal",
                                      "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/30"
                                    )}
                                  >
                                    <span className={cn(
                                      "w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0",
                                      shotHasVideo ? "bg-emerald-500" : shotCompleted ? "bg-blood-500" : "bg-zinc-700"
                                    )} />
                                    <span className="truncate">#{shot.number} {shot.name}</span>
                                  </Button>
                                </Link>
                              );
                            })}

                            {episode.shots.length > 4 && (
                              <span className="text-[10px] text-zinc-700 px-2 block py-1">
                                +{episode.shots.length - 4} autres shots...
                              </span>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* User Section */}
        {!isCollapsed && (
          <div className="flex-shrink-0 border-t border-blood-900/30 p-3 bg-[#0d0d10]">
            {isAuthenticated && profile ? (
              <div className="space-y-2">
                <Link href="/profile">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blood-900/20 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-zinc-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {profile.displayName || profile.email.split("@")[0]}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-400 flex items-center">
                          <Crown className="w-3 h-3 mr-0.5" />
                          {profile.creditsBalance}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="flex gap-1">
                  <Link href="/pricing" className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full h-7 text-[10px] text-zinc-500 hover:text-amber-400">
                      <CreditCard className="w-3 h-3 mr-1" />
                      Plans
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-500 hover:text-blood-400">
                        <Shield className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="w-full h-8 text-xs border-blood-700/50 text-blood-400 hover:bg-blood-900/20">
                  <LogIn className="w-3 h-3 mr-2" />
                  Se connecter
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Footer */}
        <div className={cn(
          "flex-shrink-0 border-t border-blood-900/30 bg-[#0a0a0c]",
          isCollapsed ? "p-2" : "p-3"
        )}>
          {isCollapsed ? (
            <div className="flex flex-col gap-1">
              {isAuthenticated ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="w-full p-2 text-zinc-600 hover:text-zinc-300">
                        <User className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Profil</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm" className="w-full p-2 text-blood-400 hover:text-blood-300">
                        <LogIn className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Se connecter</TooltipContent>
                </Tooltip>
              )}
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(false)}
                    className="w-full p-2 text-zinc-600 hover:text-zinc-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Agrandir</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-zinc-500">En ligne</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-zinc-600 hover:text-zinc-300">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Aide</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-zinc-600 hover:text-zinc-300"
                        onClick={() => setIsCollapsed(true)}
                      >
                        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Réduire</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-zinc-600">Bloodwing Studio</span>
                <span className="text-blood-600/60 font-mono">v2.1 • 2026</span>
              </div>
              <div className="mt-2 h-[1px] bg-gradient-to-r from-blood-900/50 via-blood-700/30 to-blood-900/50" />
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
