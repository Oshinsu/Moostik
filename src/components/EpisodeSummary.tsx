"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Episode, Shot, Character, Location } from "@/types";
import {
  Clock,
  Film,
  Image,
  Users,
  MapPin,
  Play,
  Video,
  Scissors,
  Bot,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  ExternalLink,
  Eye,
  Zap,
} from "lucide-react";

interface EpisodeSummaryProps {
  episode: Episode;
  characters?: Character[];
  locations?: Location[];
  onGenerateAll?: () => void;
  onOpenEditor?: () => void;
  onOpenVideoWorkflow?: () => void;
  isGenerating?: boolean;
}

export function EpisodeSummary({
  episode,
  characters = [],
  locations = [],
  onGenerateAll,
  onOpenEditor,
  onOpenVideoWorkflow,
  isGenerating = false,
}: EpisodeSummaryProps) {
  // Calculate stats
  const stats = useMemo(() => {
    const totalShots = episode.shots.length;
    const completedShots = episode.shots.filter(s => s.status === "completed").length;
    const totalVariations = episode.shots.reduce((sum, s) => sum + s.variations.length, 0);
    const completedVariations = episode.shots.reduce(
      (sum, s) => sum + s.variations.filter(v => v.status === "completed").length, 0
    );
    const pendingVariations = episode.shots.reduce(
      (sum, s) => sum + s.variations.filter(v => v.status === "pending" || v.status === "generating").length, 0
    );
    const failedVariations = episode.shots.reduce(
      (sum, s) => sum + s.variations.filter(v => v.status === "failed").length, 0
    );
    const shotsWithVideo = episode.shots.filter(
      s => s.variations.some(v => v.videoUrl)
    ).length;
    const totalVideos = episode.shots.reduce(
      (sum, s) => sum + s.variations.filter(v => v.videoUrl).length, 0
    );
    const estimatedDuration = episode.shots.reduce(
      (sum, s) => sum + (s.durationSeconds || 5), 0
    );
    
    // Get unique characters and locations used
    const usedCharacterIds = new Set(episode.shots.flatMap(s => s.characterIds || []));
    const usedLocationIds = new Set(episode.shots.flatMap(s => s.locationIds || []));
    
    return {
      totalShots,
      completedShots,
      totalVariations,
      completedVariations,
      pendingVariations,
      failedVariations,
      shotsWithVideo,
      totalVideos,
      estimatedDuration,
      usedCharacters: characters.filter(c => usedCharacterIds.has(c.id)),
      usedLocations: locations.filter(l => usedLocationIds.has(l.id)),
      progress: totalVariations > 0 ? (completedVariations / totalVariations) * 100 : 0,
      videoProgress: totalShots > 0 ? (shotsWithVideo / totalShots) * 100 : 0,
    };
  }, [episode, characters, locations]);

  // Scene types distribution
  const sceneTypes = useMemo(() => {
    const distribution: Record<string, number> = {};
    episode.shots.forEach(shot => {
      const type = shot.sceneType || "unknown";
      distribution[type] = (distribution[type] || 0) + 1;
    });
    return Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  }, [episode]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Main Header Card */}
        <div className="bg-gradient-to-br from-[#14131a] to-[#0b0b0e] border border-blood-900/30 rounded-2xl p-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blood-900/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-crimson-900/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-blood-900/60 text-blood-300 border-blood-700/50 font-mono text-sm px-3 py-1">
                    EP{episode.number}
                  </Badge>
                  {stats.completedVariations === stats.totalVariations && stats.totalVariations > 0 && (
                    <Badge className="bg-emerald-900/60 text-emerald-300 border-emerald-700/50 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Complet
                    </Badge>
                  )}
                  {stats.failedVariations > 0 && (
                    <Badge className="bg-red-900/60 text-red-300 border-red-700/50 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {stats.failedVariations} erreurs
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{episode.title}</h1>
                <p className="text-zinc-400 max-w-2xl">{episode.description}</p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                {stats.pendingVariations > 0 && onGenerateAll && (
                  <Button
                    onClick={onGenerateAll}
                    disabled={isGenerating}
                    className="moostik-btn-blood text-white"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Générer ({stats.pendingVariations})
                      </>
                    )}
                  </Button>
                )}
                {stats.completedVariations > 0 && onOpenVideoWorkflow && (
                  <Button
                    variant="outline"
                    onClick={onOpenVideoWorkflow}
                    className="bg-emerald-900/20 border-emerald-600/30 text-emerald-400 hover:bg-emerald-900/40"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Vidéos I2V
                  </Button>
                )}
                {onOpenEditor && (
                  <Button
                    variant="outline"
                    onClick={onOpenEditor}
                    className="bg-fuchsia-900/20 border-fuchsia-600/30 text-fuchsia-400 hover:bg-fuchsia-900/40"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Blood Director
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bars */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Images Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Images générées
                  </span>
                  <span className="text-white font-mono">
                    {stats.completedVariations}/{stats.totalVariations}
                  </span>
                </div>
                <Progress value={stats.progress} className="h-2" />
              </div>

              {/* Video Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Vidéos générées
                  </span>
                  <span className="text-white font-mono">
                    {stats.totalVideos}/{stats.completedVariations}
                  </span>
                </div>
                <Progress 
                  value={stats.completedVariations > 0 ? (stats.totalVideos / stats.completedVariations) * 100 : 0} 
                  className="h-2 [&>div]:bg-emerald-500" 
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { icon: Film, label: "Shots", value: stats.totalShots, color: "text-amber-400" },
                { icon: Image, label: "Images", value: stats.completedVariations, color: "text-blood-400" },
                { icon: Video, label: "Vidéos", value: stats.totalVideos, color: "text-emerald-400" },
                { icon: Clock, label: "Durée est.", value: formatDuration(stats.estimatedDuration), color: "text-zinc-400" },
                { icon: Users, label: "Personnages", value: stats.usedCharacters.length, color: "text-violet-400" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#0b0b0e]/50 rounded-xl p-4 border border-blood-900/20"
                >
                  <stat.icon className={cn("w-5 h-5 mb-2", stat.color)} />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-zinc-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Info */}
        <div className="grid grid-cols-3 gap-4">
          {/* Scene Types */}
          <Card className="bg-[#14131a]/80 border-blood-900/20 p-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
              <Zap className="w-3 h-3 text-amber-500" />
              Types de scènes
            </h3>
            <div className="space-y-2">
              {sceneTypes.slice(0, 5).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400 capitalize">{type.replace(/_/g, " ")}</span>
                  <Badge variant="outline" className="text-xs border-zinc-800 text-zinc-500">
                    {count}
                  </Badge>
                </div>
              ))}
              {sceneTypes.length === 0 && (
                <p className="text-xs text-zinc-600">Aucune scène</p>
              )}
            </div>
          </Card>

          {/* Characters Used */}
          <Card className="bg-[#14131a]/80 border-blood-900/20 p-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
              <Users className="w-3 h-3 text-blood-500" />
              Personnages
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.usedCharacters.slice(0, 6).map((char) => (
                <Tooltip key={char.id}>
                  <TooltipTrigger>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
                      {char.referenceImages?.[0] ? (
                        <img 
                          src={char.referenceImages[0]} 
                          alt={char.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                          {char.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{char.name}</p>
                    {char.title && <p className="text-xs text-zinc-500">{char.title}</p>}
                  </TooltipContent>
                </Tooltip>
              ))}
              {stats.usedCharacters.length > 6 && (
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-500">
                  +{stats.usedCharacters.length - 6}
                </div>
              )}
              {stats.usedCharacters.length === 0 && (
                <p className="text-xs text-zinc-600">Aucun personnage assigné</p>
              )}
            </div>
          </Card>

          {/* Locations Used */}
          <Card className="bg-[#14131a]/80 border-blood-900/20 p-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
              <MapPin className="w-3 h-3 text-crimson-500" />
              Lieux
            </h3>
            <div className="space-y-2">
              {stats.usedLocations.slice(0, 3).map((loc) => (
                <div key={loc.id} className="flex items-center gap-2">
                  <div className="w-10 h-6 rounded bg-zinc-800 overflow-hidden flex-shrink-0">
                    {loc.referenceImages?.[0] ? (
                      <img 
                        src={loc.referenceImages[0]} 
                        alt={loc.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-3 h-3 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400 truncate">{loc.name}</span>
                </div>
              ))}
              {stats.usedLocations.length > 3 && (
                <p className="text-xs text-zinc-600">+{stats.usedLocations.length - 3} autres</p>
              )}
              {stats.usedLocations.length === 0 && (
                <p className="text-xs text-zinc-600">Aucun lieu assigné</p>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Navigation */}
        <div className="flex items-center gap-2">
          <Link href={`/video?episode=${episode.id}`}>
            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-emerald-400 hover:bg-emerald-900/20">
              <Video className="w-4 h-4 mr-2" />
              Générer vidéos
            </Button>
          </Link>
          <Link href={`/editor?episode=${episode.id}`}>
            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-fuchsia-400 hover:bg-fuchsia-900/20">
              <Scissors className="w-4 h-4 mr-2" />
              Montage IA
            </Button>
          </Link>
          <Link href={`/library/episodes/${episode.id}/images`}>
            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-amber-400 hover:bg-amber-900/20">
              <Eye className="w-4 h-4 mr-2" />
              Voir les images
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50">
            <Download className="w-4 h-4 mr-2" />
            Exporter ZIP
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
