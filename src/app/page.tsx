"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import type { Episode, Character, Location } from "@/types/moostik";
import type { GeneratedImageWithEpisode } from "@/types";
import {
  Film,
  Users,
  MapPin,
  Image as ImageIcon,
  Video,
  Scissors,
  Bot,
  Grid3X3,
  Clapperboard,
  Book,
  FolderOpen,
  Plus,
  ArrowRight,
  Play,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react";

export default function Home() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [recentImages, setRecentImages] = useState<GeneratedImageWithEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEpisode, setNewEpisode] = useState({
    number: 0,
    title: "",
    description: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const [epRes, charRes, locRes] = await Promise.all([
        fetch("/api/episodes"),
        fetch("/api/characters"),
        fetch("/api/locations"),
      ]);
      
      const [epData, charData, locData] = await Promise.all([
        epRes.json(),
        charRes.json(),
        locRes.json(),
      ]);
      
      const episodesList = Array.isArray(epData) ? epData : [];
      setEpisodes(episodesList);
      setCharacters(Array.isArray(charData) ? charData : []);
      setLocations(Array.isArray(locData) ? locData : []);

      // Load recent images
      const allImages: GeneratedImageWithEpisode[] = [];
      for (const ep of episodesList.slice(0, 3)) {
        try {
          const imgRes = await fetch(`/api/episodes/${ep.id}/generated-images`);
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            for (const img of imgData.images || []) {
              allImages.push({ ...img, episodeId: ep.id });
            }
          }
        } catch {}
      }
      
      allImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentImages(allImages.slice(0, 8));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createEpisode = async () => {
    try {
      const res = await fetch("/api/episodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEpisode),
      });

      if (res.ok) {
        setShowCreateDialog(false);
        setNewEpisode({ number: 0, title: "", description: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to create episode:", error);
    }
  };

  // Global stats
  const stats = {
    totalImages: episodes.reduce(
      (sum, ep) => sum + ep.shots.reduce((s, shot) => s + shot.variations.filter(v => v.status === "completed").length, 0), 0
    ),
    totalVideos: episodes.reduce(
      (sum, ep) => sum + ep.shots.reduce((s, shot) => s + shot.variations.filter(v => v.videoUrl).length, 0), 0
    ),
    totalCharacters: characters.length,
    totalLocations: locations.length,
    totalEpisodes: episodes.length,
    totalShots: episodes.reduce((sum, ep) => sum + ep.shots.length, 0),
  };

  // Featured content
  const featuredCharacters = characters.filter(c => c.referenceImages?.length).slice(0, 4);
  const featuredLocations = locations.filter(l => l.referenceImages?.length).slice(0, 3);
  const latestEpisode = episodes[episodes.length - 1];

  // Quick tools
  const quickTools = [
    {
      href: "/shots",
      icon: Grid3X3,
      title: "Shots x9",
      desc: "Grille 9 angles",
      badge: "SOTA",
      color: "from-violet-900/40 to-violet-900/20",
      borderColor: "border-violet-800/40 hover:border-violet-600/60",
      iconColor: "text-violet-400",
    },
    {
      href: "/cinema",
      icon: Clapperboard,
      title: "Cinema Studio",
      desc: "Contrôle caméra pro",
      badge: "PRO",
      color: "from-indigo-900/40 to-indigo-900/20",
      borderColor: "border-indigo-800/40 hover:border-indigo-600/60",
      iconColor: "text-indigo-400",
    },
    {
      href: "/video",
      icon: Video,
      title: "Vidéo I2V",
      desc: "12 modèles",
      color: "from-emerald-900/40 to-emerald-900/20",
      borderColor: "border-emerald-800/40 hover:border-emerald-600/60",
      iconColor: "text-emerald-400",
    },
    {
      href: "/editor",
      icon: Bot,
      title: "Blood Director",
      desc: "Montage AI autonome",
      badge: "AI",
      color: "from-fuchsia-900/40 to-fuchsia-900/20",
      borderColor: "border-fuchsia-800/40 hover:border-fuchsia-600/60",
      iconColor: "text-fuchsia-400",
    },
  ];

  return (
    <div className="flex h-screen bg-[#0b0b0e] text-zinc-100">
      <Sidebar episodes={episodes} onCreateEpisode={() => setShowCreateDialog(true)} />

      <main className="flex-1 overflow-auto">
        {/* Hero */}
        <header className="relative border-b border-blood-900/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blood-900/20 via-[#0b0b0e] to-crimson-900/10" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-blood-700/50 via-blood-600/30 to-transparent" />
            <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-blood-600/30 to-blood-700/50" />
          </div>

          <div className="relative px-8 py-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-blood-400 uppercase tracking-widest font-medium">
                    Bloodwing Studio v2.1
                  </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-blood-400 via-crimson-500 to-blood-500 bg-clip-text text-transparent">
                    Quartier Général
                  </span>
                </h1>
                <p className="text-zinc-500 mt-2 max-w-xl">
                  Production SOTA d'épisodes cinématiques. Images, vidéos I2V, montage AI.
                </p>
              </div>

              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="moostik-btn-blood text-white font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvel Épisode
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mt-8">
              {[
                { icon: Film, label: "Shots", value: stats.totalShots, color: "text-amber-400" },
                { icon: ImageIcon, label: "Images", value: stats.totalImages, color: "text-blood-400" },
                { icon: Video, label: "Vidéos", value: stats.totalVideos, color: "text-emerald-400" },
                { icon: Users, label: "Personnages", value: stats.totalCharacters, color: "text-violet-400" },
                { icon: MapPin, label: "Lieux", value: stats.totalLocations, color: "text-crimson-400" },
              ].map((stat) => (
                <div 
                  key={stat.label}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#14131a]/60 border border-blood-900/20"
                >
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <div>
                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] text-zinc-600">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-2 border-blood-900 border-t-blood-500 rounded-full animate-spin" />
              <p className="text-zinc-500 text-sm">Chargement...</p>
            </div>
          ) : (
            <>
              {/* Quick Tools Grid */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">Outils de Production</h2>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {quickTools.map((tool) => (
                    <Link key={tool.href} href={tool.href}>
                      <Card className={`bg-gradient-to-br ${tool.color} ${tool.borderColor} border transition-all cursor-pointer group p-5 h-full`}>
                        <div className="flex items-start justify-between mb-3">
                          <tool.icon className={`w-8 h-8 ${tool.iconColor}`} />
                          {tool.badge && (
                            <Badge className={`text-[9px] px-1.5 py-0 border-0 ${
                              tool.badge === "SOTA" ? "bg-violet-600/80" :
                              tool.badge === "PRO" ? "bg-indigo-600/80" :
                              tool.badge === "AI" ? "bg-fuchsia-600/80" : "bg-blood-600/80"
                            } text-white`}>
                              {tool.badge}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-bold text-white text-lg">{tool.title}</h3>
                        <p className="text-xs text-zinc-500 mt-1">{tool.desc}</p>
                        <ArrowRight className="w-4 h-4 text-zinc-600 mt-3 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Latest Episode + Recent Images */}
              <div className="grid grid-cols-5 gap-6">
                {/* Latest Episode */}
                {latestEpisode && (
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Film className="w-5 h-5 text-blood-400" />
                        Dernier Épisode
                      </h2>
                      <Link href={`/episode/${latestEpisode.id}`}>
                        <Button variant="ghost" size="sm" className="text-blood-400 hover:text-amber-400 text-xs">
                          Ouvrir <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    <Link href={`/episode/${latestEpisode.id}`}>
                      <Card className="bg-gradient-to-br from-blood-900/30 to-[#14131a] border-blood-800/30 hover:border-blood-600/50 transition-all cursor-pointer p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className="bg-blood-900/60 text-blood-300 border-blood-700/50 font-mono">
                            EP{latestEpisode.number}
                          </Badge>
                          <span className="text-xs text-zinc-600">
                            {latestEpisode.shots.length} shots
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{latestEpisode.title}</h3>
                        <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{latestEpisode.description}</p>
                        
                        {/* Progress */}
                        {(() => {
                          const total = latestEpisode.shots.reduce((s, shot) => s + shot.variations.length, 0);
                          const completed = latestEpisode.shots.reduce(
                            (s, shot) => s + shot.variations.filter(v => v.status === "completed").length, 0
                          );
                          const progress = total > 0 ? (completed / total) * 100 : 0;
                          return (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-zinc-500">Progression</span>
                                <span className="text-blood-400 font-mono">{completed}/{total}</span>
                              </div>
                              <Progress value={progress} className="h-1.5" />
                            </div>
                          );
                        })()}

                        {/* Quick actions */}
                        <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-7 bg-emerald-900/20 border-emerald-700/30 text-emerald-400 hover:bg-emerald-900/40"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.location.href = `/video?episode=${latestEpisode.id}`;
                            }}
                          >
                            <Video className="w-3 h-3 mr-1" />
                            Vidéos
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-7 bg-fuchsia-900/20 border-fuchsia-700/30 text-fuchsia-400 hover:bg-fuchsia-900/40"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.location.href = `/editor?episode=${latestEpisode.id}`;
                            }}
                          >
                            <Scissors className="w-3 h-3 mr-1" />
                            Montage
                          </Button>
                        </div>
                      </Card>
                    </Link>
                  </div>
                )}

                {/* Recent Images */}
                <div className={latestEpisode ? "col-span-3" : "col-span-5"}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-amber-400" />
                      Images Récentes
                    </h2>
                    <Link href="/library">
                      <Button variant="ghost" size="sm" className="text-blood-400 hover:text-amber-400 text-xs">
                        Médiathèque <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  {recentImages.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {recentImages.map((img) => (
                        <Link key={img.id} href={`/library/episodes/${img.episodeId}/images`}>
                          <Card className="bg-[#14131a]/80 border-blood-900/20 hover:border-blood-600/40 transition-all cursor-pointer overflow-hidden group">
                            <div className="aspect-square relative">
                              <img 
                                src={img.url} 
                                alt={img.filename}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <Badge className="absolute top-2 right-2 text-[8px] bg-black/60 border-0">
                                {img.cameraAngle?.substring(0, 6) || "Var"}
                              </Badge>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-[#14131a]/50 border-blood-900/20 p-8 text-center">
                      <ImageIcon className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-500 text-sm">Aucune image générée</p>
                      <Link href="/shots">
                        <Button size="sm" className="mt-4 moostik-btn-blood text-white">
                          <Sparkles className="w-3 h-3 mr-2" />
                          Commencer
                        </Button>
                      </Link>
                    </Card>
                  )}
                </div>
              </div>

              {/* Characters & Locations */}
              <div className="grid grid-cols-2 gap-6">
                {/* Characters */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-blood-400" />
                      Bloodwings
                    </h2>
                    <Link href="/characters">
                      <Button variant="ghost" size="sm" className="text-blood-400 hover:text-amber-400 text-xs">
                        Tous <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {featuredCharacters.map((char) => (
                      <Link key={char.id} href="/characters">
                        <Card className="bg-[#14131a]/80 border-blood-900/20 hover:border-blood-600/40 transition-all cursor-pointer overflow-hidden group">
                          <div className="aspect-square relative">
                            {char.referenceImages?.[0] ? (
                              <img 
                                src={char.referenceImages[0]} 
                                alt={char.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                <Users className="w-8 h-8 text-zinc-700" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-xs font-medium text-white truncate">{char.name}</p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* Locations */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-crimson-400" />
                      Territoires
                    </h2>
                    <Link href="/locations">
                      <Button variant="ghost" size="sm" className="text-blood-400 hover:text-amber-400 text-xs">
                        Tous <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {featuredLocations.map((loc) => (
                      <Link key={loc.id} href="/locations">
                        <Card className="bg-[#14131a]/80 border-blood-900/20 hover:border-blood-600/40 transition-all cursor-pointer overflow-hidden group flex h-20">
                          <div className="w-32 flex-shrink-0 relative">
                            {loc.referenceImages?.[0] ? (
                              <Image 
                                src={loc.referenceImages[0]} 
                                alt={loc.name}
                                fill
                                unoptimized
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                <MapPin className="w-6 h-6 text-zinc-700" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-3 flex flex-col justify-center">
                            <Badge className="w-fit mb-1 text-[9px] bg-blood-900/60 text-blood-300 border-blood-700/50">
                              {loc.type === "moostik_city" ? "Moostik" : "Humain"}
                            </Badge>
                            <h3 className="text-sm font-medium text-white truncate">{loc.name}</h3>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              </div>

              {/* More Tools */}
              <section>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <FolderOpen className="w-5 h-5 text-zinc-400" />
                  Plus d'Outils
                </h2>
                <div className="grid grid-cols-4 gap-4">
                  <Link href="/library">
                    <Card className="bg-[#14131a]/80 border-zinc-800/50 hover:border-zinc-700/60 transition-all cursor-pointer p-4">
                      <FolderOpen className="w-6 h-6 text-zinc-500 mb-2" />
                      <h3 className="font-medium text-white">Médiathèque</h3>
                      <p className="text-[10px] text-zinc-600 mt-1">Tous les assets</p>
                    </Card>
                  </Link>
                  <Link href="/lore">
                    <Card className="bg-[#14131a]/80 border-copper-800/30 hover:border-copper-700/50 transition-all cursor-pointer p-4">
                      <Book className="w-6 h-6 text-copper-500 mb-2" />
                      <h3 className="font-medium text-white">Bible Sacrée</h3>
                      <p className="text-[10px] text-zinc-600 mt-1">Le lore Bloodwing</p>
                    </Card>
                  </Link>
                  <Link href="/references">
                    <Card className="bg-[#14131a]/80 border-amber-800/30 hover:border-amber-700/50 transition-all cursor-pointer p-4">
                      <ImageIcon className="w-6 h-6 text-amber-500 mb-2" />
                      <h3 className="font-medium text-white">Galerie des Âmes</h3>
                      <p className="text-[10px] text-zinc-600 mt-1">Références visuelles</p>
                    </Card>
                  </Link>
                  <Link href="/ep0">
                    <Card className="bg-[#14131a]/80 border-blood-800/30 hover:border-blood-700/50 transition-all cursor-pointer p-4">
                      <Play className="w-6 h-6 text-blood-500 mb-2" />
                      <h3 className="font-medium text-white">EP0 Generator</h3>
                      <p className="text-[10px] text-zinc-600 mt-1">Génération complète</p>
                    </Card>
                  </Link>
                </div>
              </section>

              {/* Quote */}
              <section>
                <div className="relative p-8 rounded-2xl bg-gradient-to-r from-blood-900/20 via-[#14131a] to-crimson-900/20 border border-blood-900/30">
                  <div className="absolute top-4 left-6 text-5xl text-blood-700/30">"</div>
                  <blockquote className="relative z-10 text-lg text-zinc-300 italic pl-8 max-w-3xl">
                    Nous sommes les vrais vampires. Pas ces imposteurs de Transylvanie. 
                    Chaque goutte de sang humain est une prière pour nos morts.
                  </blockquote>
                  <div className="mt-4 pl-8 text-sm text-blood-400">
                    — Papy Tik, Fondateur des Bloodwings
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* Create Episode Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#14131a] border-blood-900/30">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Film className="w-5 h-5 text-blood-400" />
              Nouvel Épisode
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Numéro</Label>
              <Input
                type="number"
                value={newEpisode.number}
                onChange={(e) => setNewEpisode({ ...newEpisode, number: parseInt(e.target.value) || 0 })}
                className="bg-[#0b0b0e] border-blood-900/30 focus:border-blood-600"
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-zinc-400">Titre</Label>
              <Input
                value={newEpisode.title}
                onChange={(e) => setNewEpisode({ ...newEpisode, title: e.target.value })}
                className="bg-[#0b0b0e] border-blood-900/30 focus:border-blood-600"
                placeholder="Le Génocide..."
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-zinc-400">Description</Label>
              <Textarea
                value={newEpisode.description}
                onChange={(e) => setNewEpisode({ ...newEpisode, description: e.target.value })}
                className="bg-[#0b0b0e] border-blood-900/30 focus:border-blood-600 min-h-[100px]"
                placeholder="Synopsis de l'épisode..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateDialog(false)} className="text-zinc-400">
              Annuler
            </Button>
            <Button onClick={createEpisode} className="moostik-btn-blood text-white">
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
