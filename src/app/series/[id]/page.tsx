"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ImmersiveLightbox } from "@/components/shared/ImmersiveLightbox";
import type { Episode, Shot, Act } from "@/types/episode";

// ============================================================================
// SERIES EPISODE PAGE - Cinematic Presentation
// ============================================================================

export default function SeriesEpisodePage() {
  const params = useParams();
  const episodeId = params.id as string;
  
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [scrollY, setScrollY] = useState(0);
  
  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Active section
  const [activeSection, setActiveSection] = useState<"story" | "gallery" | "cast" | "locations">("story");

  // Load data
  useEffect(() => {
    if (!episodeId) return;
    
    setLoading(true);
    Promise.all([
      fetch(`/api/episodes/${episodeId}`).then(r => r.json()),
      fetch("/api/characters").then(r => r.json()),
      fetch("/api/locations").then(r => r.json()),
    ]).then(([ep, chars, locs]) => {
      setEpisode(ep);
      setCharacters(chars || []);
      setLocations(locs || []);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, [episodeId]);

  // Parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blood-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Chargement de l'épisode...</p>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Épisode introuvable</p>
          <Link href="/series">
            <Button variant="outline">Retour à la série</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get all images for lightbox
  const allImages = (episode.shots || [])
    .flatMap(shot => 
      (shot.variations || [])
        .filter(v => v.status === "completed" && v.imageUrl)
        .map(v => ({
          id: `${shot.id}-${v.id}`,
          url: v.imageUrl!,
          shotName: shot.name,
          shotNumber: shot.number,
          cameraAngle: v.cameraAngle,
          sceneType: shot.sceneType,
          videoUrl: v.videoUrl,
        }))
    );

  // Get episode characters and locations
  const episodeCharacters = characters.filter(c => 
    episode.characters?.includes(c.id) || 
    episode.shots?.some(s => s.characterIds?.includes(c.id))
  );
  
  const episodeLocations = locations.filter(l => 
    episode.locations?.includes(l.id) ||
    episode.shots?.some(s => s.locationIds?.includes(l.id))
  );

  // Stats
  const completedShots = episode.shots?.filter(s => 
    s.variations?.some(v => v.status === "completed")
  ).length || 0;
  const totalShots = episode.shots?.length || 0;
  const completedVideos = episode.shots?.filter(s =>
    s.variations?.some(v => v.videoStatus === "completed")
  ).length || 0;

  // Get poster image (first completed shot)
  const posterImage = episode.shots?.[0]?.variations?.find(v => v.status === "completed")?.imageUrl;

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white">
      {/* Lightbox */}
      <ImmersiveLightbox
        images={allImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* ================================================================ */}
      {/* HERO SECTION */}
      {/* ================================================================ */}
      <section className="relative h-[80vh] overflow-hidden">
        {/* Background Image */}
        {posterImage && (
          <div 
            className="absolute inset-0"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          >
            <img 
              src={posterImage} 
              alt={episode.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-[#0b0b0e]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0e]/80 via-transparent to-[#0b0b0e]/80" />
          </div>
        )}

        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-20 p-6 flex items-center justify-between">
          <Link href="/series" className="flex items-center gap-2 text-zinc-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à la série
          </Link>
          <Badge className="bg-blood-900/80 text-blood-300 border-blood-700/50">
            ÉPISODE {episode.number.toString().padStart(2, "0")}
          </Badge>
        </nav>

        {/* Hero Content */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-8 md:p-16"
          style={{ transform: `translateY(${scrollY * -0.2}px)` }}
        >
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
              <span className="text-blood-500">{episode.title}</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mb-6">
              {episode.description}
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Badge className="bg-zinc-800/80 text-zinc-300 border-zinc-700/50">
                {totalShots} Shots
              </Badge>
              <Badge className="bg-emerald-900/80 text-emerald-300 border-emerald-700/50">
                {completedShots}/{totalShots} Images
              </Badge>
              <Badge className="bg-purple-900/80 text-purple-300 border-purple-700/50">
                {completedVideos} Vidéos
              </Badge>
              <Badge className="bg-amber-900/80 text-amber-300 border-amber-700/50">
                {episodeCharacters.length} Personnages
              </Badge>
            </div>

            {/* Progress */}
            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Progression</span>
                <span>{Math.round((completedShots / totalShots) * 100)}%</span>
              </div>
              <Progress value={(completedShots / totalShots) * 100} className="h-2 bg-zinc-800" />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* NAVIGATION TABS */}
      {/* ================================================================ */}
      <div className="sticky top-0 z-30 bg-[#0b0b0e]/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { id: "story", label: "Histoire", icon: "📖" },
              { id: "gallery", label: "Galerie", icon: "🖼️" },
              { id: "cast", label: "Casting", icon: "👥" },
              { id: "locations", label: "Décors", icon: "📍" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeSection === tab.id
                    ? "border-blood-500 text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ================================================================ */}
      {/* CONTENT SECTIONS */}
      {/* ================================================================ */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* STORY SECTION */}
        {activeSection === "story" && (
          <div className="space-y-12">
            {/* Synopsis */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Synopsis</h2>
              <div className="prose prose-invert max-w-3xl">
                <p className="text-lg text-zinc-400 leading-relaxed">
                  {episode.description}
                </p>
              </div>
            </section>

            {/* Acts */}
            {episode.acts && episode.acts.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold mb-6">Structure narrative</h2>
                <div className="space-y-4">
                  {episode.acts.map((act: Act, index: number) => (
                    <Collapsible key={act.id} defaultOpen={index === 0}>
                      <Card className="bg-zinc-900/30 border-zinc-800 overflow-hidden">
                        <CollapsibleTrigger className="w-full">
                          <div className="p-6 flex items-center gap-4 hover:bg-zinc-900/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-blood-900/30 flex items-center justify-center text-xl font-bold text-blood-400">
                              {act.number}
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="text-xl font-bold text-white">{act.title}</h3>
                              <p className="text-zinc-500 text-sm">{act.shotIds?.length || 0} shots</p>
                            </div>
                            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-6 pb-6 border-t border-zinc-800 pt-4">
                            <p className="text-zinc-400 mb-4">{act.description}</p>
                            
                            {/* Act shots preview */}
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                              {act.shotIds?.slice(0, 6).map((shotId: string) => {
                                const shot = episode.shots.find(s => s.id === shotId);
                                const image = shot?.variations?.find(v => v.status === "completed")?.imageUrl;
                                return (
                                  <div 
                                    key={shotId} 
                                    className="aspect-video bg-zinc-800 rounded overflow-hidden cursor-pointer"
                                    onClick={() => {
                                      const idx = allImages.findIndex(img => img.id.startsWith(shotId));
                                      if (idx >= 0) {
                                        setLightboxIndex(idx);
                                        setLightboxOpen(true);
                                      }
                                    }}
                                  >
                                    {image ? (
                                      <img src={image} alt={shot?.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                                        {shot?.number}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* GALLERY SECTION */}
        {activeSection === "gallery" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Galerie ({allImages.length} images)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allImages.map((img, index) => (
                <Card 
                  key={img.id}
                  className="bg-zinc-900/30 border-zinc-800 overflow-hidden cursor-pointer group"
                  onClick={() => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                >
                  <div className="aspect-video relative">
                    <img 
                      src={img.url} 
                      alt={img.shotName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {img.videoUrl && (
                      <Badge className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] border-0">
                        VIDEO
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-white truncate">{img.shotName}</p>
                    <p className="text-xs text-zinc-500">{img.cameraAngle}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CAST SECTION */}
        {activeSection === "cast" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Casting ({episodeCharacters.length} personnages)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {episodeCharacters.map((char) => (
                <Link key={char.id} href={`/series/characters/${char.id}`}>
                  <Card className="bg-zinc-900/30 border-zinc-800 overflow-hidden hover:border-blood-700/50 transition-all group">
                    <div className="aspect-square relative">
                      {char.referenceImages?.[0] ? (
                        <img 
                          src={char.referenceImages[0]} 
                          alt={char.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-4xl opacity-30">
                          {char.type === "moostik" ? "🦟" : "👤"}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <Badge className={`absolute top-2 right-2 text-[9px] ${
                        char.type === "moostik" ? "bg-amber-900/80 text-amber-300" : "bg-blue-900/80 text-blue-300"
                      }`}>
                        {char.type === "moostik" ? "MOOSTIK" : "HUMAIN"}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white">{char.name}</h3>
                      <p className="text-xs text-zinc-500 line-clamp-2">{char.description?.slice(0, 80)}...</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* LOCATIONS SECTION */}
        {activeSection === "locations" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Décors ({episodeLocations.length} lieux)</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {episodeLocations.map((loc) => (
                <Link key={loc.id} href={`/series/locations/${loc.id}`}>
                  <Card className="bg-zinc-900/30 border-zinc-800 overflow-hidden hover:border-emerald-700/50 transition-all group h-72">
                    <div className="relative h-full">
                      {loc.referenceImages?.[0] ? (
                        <img 
                          src={loc.referenceImages[0]} 
                          alt={loc.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-900/20 to-zinc-900 flex items-center justify-center">
                          <span className="text-6xl opacity-20">📍</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <Badge className="bg-emerald-900/80 text-emerald-300 border-emerald-700/50 mb-2 text-[9px]">
                          {loc.type}
                        </Badge>
                        <h3 className="text-xl font-bold text-white mb-1">{loc.name}</h3>
                        <p className="text-zinc-400 text-sm line-clamp-2">{loc.description}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ================================================================ */}
      {/* EPISODE NAVIGATION */}
      {/* ================================================================ */}
      <footer className="border-t border-zinc-800 py-12 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            {episode.number > 0 && (
              <Link href={`/series/ep${episode.number - 1}`}>
                <Button variant="ghost" className="text-zinc-400 hover:text-white">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Épisode précédent
                </Button>
              </Link>
            )}
          </div>
          
          <Link href="/series">
            <Button variant="outline" className="border-zinc-700 text-zinc-400">
              Tous les épisodes
            </Button>
          </Link>
          
          <div>
            <Link href={`/series/ep${episode.number + 1}`}>
              <Button variant="ghost" className="text-zinc-400 hover:text-white">
                Épisode suivant
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
