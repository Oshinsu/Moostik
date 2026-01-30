"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export default function Home() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
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
      
      setEpisodes(Array.isArray(epData) ? epData : []);
      setCharacters(Array.isArray(charData) ? charData : []);
      setLocations(Array.isArray(locData) ? locData : []);
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

  // Calculate stats
  const stats = {
    totalImages: episodes.reduce(
      (sum, ep) => sum + ep.shots.reduce((s, shot) => s + shot.variations.filter(v => v.status === "completed").length, 0),
      0
    ),
    totalCharacters: characters.length,
    totalLocations: locations.length,
    totalEpisodes: episodes.length,
  };

  // Get recent character with images
  const featuredCharacters = characters.filter(c => c.referenceImages && c.referenceImages.length > 0).slice(0, 4);
  const featuredLocations = locations.filter(l => l.referenceImages && l.referenceImages.length > 0).slice(0, 3);

  return (
    <div className="flex h-screen bg-[#0b0b0e] text-zinc-100">
      <Sidebar
        episodes={episodes}
        onCreateEpisode={() => setShowCreateDialog(true)}
      />

      <main className="flex-1 overflow-auto">
        {/* Hero Header */}
        <header className="relative border-b border-blood-900/30 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blood-900/20 via-[#0b0b0e] to-crimson-900/10" />
          
          {/* Animated blood veins */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-blood-700/50 via-blood-600/30 to-transparent animate-vein-pulse" />
            <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-blood-600/30 to-blood-700/50 animate-vein-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative px-8 py-10">
            {/* Main title */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blood-500 animate-pulse" />
                  <span className="text-xs text-blood-400 uppercase tracking-widest font-medium">
                    Centre de Commandement
                  </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-blood-400 via-crimson-500 to-blood-500 bg-clip-text text-transparent">
                    Quartier Général
                  </span>
                </h1>
                <p className="text-zinc-500 mt-2 max-w-xl">
                  Bienvenue dans le sanctuaire des Bloodwings. Ici, chaque image est une goutte de sang versée pour la vengeance.
                </p>
              </div>

              {/* Quick action */}
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="moostik-btn-blood text-white font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouvelle Chronique
              </Button>
            </div>

            {/* Stats bar */}
            <div className="flex gap-6 mt-8">
              {[
                { label: "Images Générées", value: stats.totalImages, icon: "🖼️", color: "text-amber-400" },
                { label: "Bloodwings", value: stats.totalCharacters, icon: "🦟", color: "text-blood-400" },
                { label: "Territoires", value: stats.totalLocations, icon: "🏛️", color: "text-crimson-400" },
                { label: "Chroniques", value: stats.totalEpisodes, icon: "📜", color: "text-copper-400" },
              ].map((stat) => (
                <div 
                  key={stat.label}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#14131a]/50 border border-blood-900/20"
                >
                  <span className="text-2xl">{stat.icon}</span>
                  <div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-zinc-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-2 border-blood-900 border-t-blood-500 rounded-full animate-spin" />
              <p className="text-zinc-500 text-sm">Les esprits consultent les archives...</p>
            </div>
          ) : (
            <>
              {/* Featured Characters */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
                      <span className="text-blood-400">🦟</span>
                      Les Bloodwings
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">Les âmes qui portent notre vengeance</p>
                  </div>
                  <Link href="/characters">
                    <Button variant="ghost" className="text-blood-400 hover:text-amber-400 hover:bg-blood-900/20">
                      Voir tous les personnages →
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {featuredCharacters.map((char) => (
                    <Link key={char.id} href="/characters">
                      <Card className="bg-[#14131a]/80 border-blood-900/20 hover:border-blood-600/40 transition-all group cursor-pointer moostik-card-hover overflow-hidden">
                        <div className="aspect-square relative bg-[#0b0b0e]">
                          {char.referenceImages && char.referenceImages[0] ? (
                            <img 
                              src={char.referenceImages[0]} 
                              alt={char.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🦟</div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="font-medium text-white text-sm truncate">{char.name}</h3>
                            {char.title && (
                              <p className="text-[10px] text-blood-400 truncate">{char.title}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Featured Locations */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
                      <span className="text-crimson-400">🏛️</span>
                      Territoires Sacrés
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">Nos terres, notre sang, notre histoire</p>
                  </div>
                  <Link href="/locations">
                    <Button variant="ghost" className="text-blood-400 hover:text-amber-400 hover:bg-blood-900/20">
                      Explorer les territoires →
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {featuredLocations.map((loc) => (
                    <Link key={loc.id} href="/locations">
                      <Card className="bg-[#14131a]/80 border-blood-900/20 hover:border-blood-600/40 transition-all group cursor-pointer moostik-card-hover overflow-hidden">
                        <div className="aspect-video relative bg-[#0b0b0e]">
                          {loc.referenceImages && loc.referenceImages[0] ? (
                            <img 
                              src={loc.referenceImages[0]} 
                              alt={loc.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🏛️</div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3">
                            <Badge className="bg-blood-900/60 text-blood-300 border-blood-700/50 text-[10px] mb-1">
                              {loc.type === "moostik_city" ? "Cité Moostik" : "Espace Humain"}
                            </Badge>
                            <h3 className="font-medium text-white text-sm truncate">{loc.name}</h3>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Quick Links */}
              <section>
                <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2 mb-4">
                  <span className="text-amber-400">⚡</span>
                  Actions Rapides
                </h2>
                
                <div className="grid grid-cols-3 gap-4">
                  <Link href="/library">
                    <Card className="bg-gradient-to-br from-blood-900/30 to-[#14131a] border-blood-800/30 hover:border-blood-600/50 transition-all cursor-pointer moostik-card-hover p-6">
                      <div className="text-3xl mb-3">📚</div>
                      <h3 className="font-semibold text-white">Archives Visuelles</h3>
                      <p className="text-xs text-zinc-500 mt-1">Parcourir toutes les images générées</p>
                    </Card>
                  </Link>
                  
                  <Link href="/lore">
                    <Card className="bg-gradient-to-br from-crimson-900/30 to-[#14131a] border-crimson-800/30 hover:border-crimson-600/50 transition-all cursor-pointer moostik-card-hover p-6">
                      <div className="text-3xl mb-3">📖</div>
                      <h3 className="font-semibold text-white">Bible Sacrée</h3>
                      <p className="text-xs text-zinc-500 mt-1">Le savoir ancestral des Bloodwings</p>
                    </Card>
                  </Link>
                  
                  <Link href="/references">
                    <Card className="bg-gradient-to-br from-amber-900/30 to-[#14131a] border-amber-800/30 hover:border-amber-600/50 transition-all cursor-pointer moostik-card-hover p-6">
                      <div className="text-3xl mb-3">🎨</div>
                      <h3 className="font-semibold text-white">Galerie des Âmes</h3>
                      <p className="text-xs text-zinc-500 mt-1">Références visuelles des personnages</p>
                    </Card>
                  </Link>
                </div>
              </section>

              {/* Lore Quote */}
              <section className="mt-8">
                <div className="relative p-8 rounded-xl bg-gradient-to-r from-blood-900/20 via-[#14131a] to-crimson-900/20 border border-blood-900/30">
                  <div className="absolute top-4 left-6 text-5xl text-blood-700/30">"</div>
                  <blockquote className="relative z-10 text-lg text-zinc-300 italic pl-8">
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
              <span className="text-blood-400">📜</span>
              Nouvelle Chronique
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Numéro d'épisode</Label>
              <Input
                type="number"
                value={newEpisode.number}
                onChange={(e) => setNewEpisode({ ...newEpisode, number: parseInt(e.target.value) || 0 })}
                className="bg-[#0b0b0e] border-blood-900/30 focus:border-blood-600"
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-zinc-400">Titre de la chronique</Label>
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
                placeholder="Décrivez cette chronique de sang..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setShowCreateDialog(false)}
              className="text-zinc-400 hover:text-zinc-100"
            >
              Abandonner
            </Button>
            <Button 
              onClick={createEpisode}
              className="moostik-btn-blood text-white"
            >
              Sceller la Chronique
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
