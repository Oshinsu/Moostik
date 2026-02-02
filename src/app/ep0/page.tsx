"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ImmersiveLightbox } from "@/components/shared/ImmersiveLightbox";
import { TimelineStoryboard } from "@/components/shared/TimelineStoryboard";
import type { Episode, Variation, Shot, Character, Location } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

interface ImageData {
  id: string;
  shotId: string;
  shotName: string;
  shotNumber: number;
  sceneType: string;
  variation: Variation;
  url: string;
  videoUrl?: string;
  videoStatus?: string;
  cameraAngle: string;
  seed?: number;
  prompt?: Shot["prompt"];
}

interface GenerationProgress {
  totalShots: number;
  totalVariations: number;
  pendingVariations: number;
  completedVariations: number;
  completionPercent: number;
}

interface Act {
  id: string;
  number: number;
  title: string;
  description: string;
  shotIds: string[];
  characters: string[];
  locations: string[];
}

type StatusFilter = "all" | "completed" | "pending" | "with_video";
type AngleFilter = "all" | "extreme_wide" | "wide" | "medium" | "close_up" | "low_angle";

// ============================================================================
// EPISODE METADATA - T0.5 GENÈSE DES BLOODWINGS
// ============================================================================

const EP0_METADATA = {
  tagline: "43 shots. 5 parties. 100% pipeline génératif.",
  synopsis: `T0.5 — Genèse des Bloodwings.

Proof of concept du pipeline Bloodwings Studio.
43 shots générés. 5 parties narratives. Cohérence personnages maintenue sur l'ensemble.
Image-to-video chain avec first/last frame. Beat sync sur Requiem for Attack on Titan.

Le contenu : des moustiques anthropomorphes. Un génocide. Une reconstruction.
L'intérêt : prouver que le pipeline fonctionne de bout en bout.`,
  themes: ["Pipeline", "Cohérence", "Beat Sync", "I2V Chain"],
  music: {
    title: "Requiem for Attack on Titan OST",
    artist: "Hiroyuki Sawano",
    mood: "Track de référence pour beat sync"
  },
  inspiration: "Esthétique Pixar-démoniaque. Moustiques anthropomorphes parce que personne n'avait osé.",
  duration: "~8 minutes",
  structure: "APOCALYPSE → ÉVASION → RECONSTRUCTION → BLOODWINGS → 20 ANS PLUS TARD"
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function EP0CinemaPage() {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("synopsis");
  
  // Section collapse states
  const [openActs, setOpenActs] = useState<string[]>(["seq-1", "seq-5"]);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [angleFilter, setAngleFilter] = useState<AngleFilter>("all");

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [epRes, charsRes, locsRes] = await Promise.all([
        fetch("/api/episodes/ep0"),
        fetch("/api/characters"),
        fetch("/api/locations")
      ]);
      
      if (!epRes.ok) throw new Error("Episode not found");
      
      const epData = await epRes.json();
      const charsData = charsRes.ok ? await charsRes.json() : [];
      const locsData = locsRes.ok ? await locsRes.json() : [];
      
      setEpisode(epData);
      setCharacters(charsData);
      setLocations(locsData);

      // Build images list
      const allImages: ImageData[] = [];
      for (const shot of epData.shots || []) {
        for (const variation of shot.variations || []) {
          if (variation.status === "completed" && variation.imageUrl) {
            allImages.push({
              id: `${shot.id}-${variation.id}`,
              shotId: shot.id,
              shotName: shot.name,
              shotNumber: shot.number,
              sceneType: shot.sceneType || "establishing",
              variation,
              url: variation.imageUrl,
              videoUrl: variation.videoUrl,
              videoStatus: variation.videoStatus,
              cameraAngle: variation.cameraAngle,
              seed: (shot.prompt as any)?.parameters?.seed,
              prompt: shot.prompt,
            });
          }
        }
      }
      setImages(allImages);

      // Get progress
      const progressRes = await fetch("/api/episodes/ep0/complete");
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(progressData.progress);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Filtered images
  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      if (searchQuery && !img.shotName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter === "with_video" && !img.videoUrl) {
        return false;
      }
      if (angleFilter !== "all" && img.cameraAngle !== angleFilter) {
        return false;
      }
      return true;
    });
  }, [images, searchQuery, statusFilter, angleFilter]);
  
  // Lightbox images format
  const lightboxImages = useMemo(() => {
    return filteredImages.map((img) => ({
      id: img.id,
      url: img.url,
      shotName: img.shotName,
      shotNumber: img.shotNumber,
      cameraAngle: img.cameraAngle,
      sceneType: img.sceneType,
      seed: img.seed,
      videoUrl: img.videoUrl,
      prompt: img.prompt,
    }));
  }, [filteredImages]);
  
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Get character by ID
  const getCharacter = (id: string) => characters.find(c => c.id === id);
  const getLocation = (id: string) => locations.find(l => l.id === id);
  
  // Get shots for an act
  const getShotsForAct = (act: Act) => {
    return episode?.shots.filter(s => act.shotIds.includes(s.id)) || [];
  };
  
  // Toggle act
  const toggleAct = (actId: string) => {
    setOpenActs(prev => 
      prev.includes(actId) 
        ? prev.filter(id => id !== actId)
        : [...prev, actId]
    );
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const downloadAll = async () => {
    const res = await fetch("/api/episodes/ep0/download-all");
    if (res.ok) {
      const data = await res.json();
      alert(`Prêt à télécharger ${data.totalImages} images.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blood-900 border-t-blood-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm uppercase tracking-widest">Chargement de l'épisode...</p>
        </div>
      </div>
    );
  }

  const acts = (episode?.acts || []) as Act[];
  const episodeCharacterIds = [...new Set(acts.flatMap(a => a.characters || []))].filter(Boolean) as string[];
  const episodeLocationIds = [...new Set(acts.flatMap(a => a.locations || []))].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-zinc-100">
      {/* Immersive Lightbox */}
      <ImmersiveLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* ================================================================== */}
      {/* HERO HEADER */}
      {/* ================================================================== */}
      <header className="relative border-b border-blood-900/30 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blood-900/30 via-[#0b0b0e] to-[#0b0b0e]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
        
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between p-4 border-b border-blood-900/20">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blood-400 hover:text-blood-300 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              QG Moostik
            </Link>
            <span className="text-zinc-700">|</span>
            <Link href="/characters" className="text-zinc-500 hover:text-white text-sm">Personnages</Link>
            <Link href="/locations" className="text-zinc-500 hover:text-white text-sm">Lieux</Link>
            <Link href="/lore" className="text-zinc-500 hover:text-white text-sm">Lore</Link>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blood-900/50 text-blood-400 border-blood-700/30">PILOTE</Badge>
            <Badge className="bg-zinc-900 text-zinc-400 border-zinc-800">S01 E00</Badge>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-8 py-12 md:py-20 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-blood-600 text-white border-0 px-3 py-1">ÉPISODE 0</Badge>
                <span className="text-zinc-500 text-sm font-mono">{EP0_METADATA.duration}</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4">
                <span className="text-blood-500">Le</span> Génocide
              </h1>
              
              <p className="text-2xl text-blood-400/80 font-light italic mb-6">
                "{EP0_METADATA.tagline}"
              </p>
              
              <p className="text-zinc-400 max-w-xl leading-relaxed mb-8">
                {episode?.description?.split('\n')[0]}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2">
                  <span className="text-[10px] text-zinc-500 uppercase block">Actes</span>
                  <span className="text-white font-bold">{acts.length}</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2">
                  <span className="text-[10px] text-zinc-500 uppercase block">Shots</span>
                  <span className="text-white font-bold">{episode?.shots.length || 0}</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2">
                  <span className="text-[10px] text-zinc-500 uppercase block">Images</span>
                  <span className="text-white font-bold">{images.length}</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2">
                  <span className="text-[10px] text-zinc-500 uppercase block">Vidéos</span>
                  <span className="text-amber-400 font-bold">{images.filter(i => i.videoUrl).length}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button className="moostik-btn-blood text-white font-bold px-8 h-12">
                  🎬 Regarder l'Épisode
                </Button>
                <Button onClick={downloadAll} variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 h-12">
                  📦 Pack Production
                </Button>
              </div>
            </div>

            {/* Hero Image / Poster */}
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="aspect-[2/3] bg-gradient-to-br from-blood-900/50 to-zinc-900 rounded-2xl border border-blood-800/30 overflow-hidden relative">
                {images[0]?.url ? (
                  <img src={images[0].url} alt="EP0 Poster" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl">🩸</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-black text-xl uppercase">Rise of Bloodwings</p>
                  <p className="text-blood-400 text-sm">L'Épisode Pilote</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {progress && (
            <div className="mt-8 max-w-md">
              <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-widest text-zinc-500">
                <span>Production</span>
                <span className="text-blood-500">{progress.completionPercent}%</span>
              </div>
              <Progress value={progress.completionPercent} className="h-2 bg-zinc-900" />
            </div>
          )}
        </div>
      </header>

      {/* ================================================================== */}
      {/* MAIN TABS */}
      {/* ================================================================== */}
      <main className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab Navigation */}
          <div className="border-b border-blood-900/20 bg-[#0b0b0e]/95 backdrop-blur-sm sticky top-0 z-40">
            <div className="px-8">
              <TabsList className="bg-transparent w-full justify-start rounded-none h-auto p-0 gap-1">
                {[
                  { id: "synopsis", label: "Synopsis", icon: "📖" },
                  { id: "cast", label: "Cast", icon: "👥" },
                  { id: "decors", label: "Décors", icon: "📍" },
                  { id: "actes", label: "Actes", icon: "🎬" },
                  { id: "timeline", label: "Timeline", icon: "⏱" },
                  { id: "gallery", label: "Galerie", icon: "🖼" },
                  { id: "credits", label: "Crédits", icon: "✨" },
                ].map(tab => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="data-[state=active]:border-blood-500 data-[state=active]:text-white data-[state=active]:bg-blood-900/20 border-b-2 border-transparent rounded-none rounded-t-lg bg-transparent px-4 py-3 text-zinc-500 font-bold uppercase tracking-tight text-sm transition-all"
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* ============================================================ */}
          {/* TAB: SYNOPSIS */}
          {/* ============================================================ */}
          <TabsContent value="synopsis" className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Synopsis */}
              <div className="lg:col-span-2 space-y-8">
                <section>
                  <h2 className="text-3xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                    <span className="text-blood-500">📖</span> Synopsis
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    {EP0_METADATA.synopsis.split('\n\n').map((para, i) => (
                      <p key={i} className="text-zinc-300 leading-relaxed text-lg mb-4">
                        {para}
                      </p>
                    ))}
                  </div>
                </section>

                {/* Structure */}
                <section className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-4 text-blood-400">
                    Structure Narrative
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {EP0_METADATA.structure.split(' → ').map((step, i, arr) => (
                      <div key={i} className="flex items-center gap-2">
                        <Badge className="bg-zinc-800 text-white border-zinc-700 px-3 py-1">
                          {step}
                        </Badge>
                        {i < arr.length - 1 && (
                          <svg className="w-4 h-4 text-blood-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Themes */}
                <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Thèmes</h3>
                  <div className="flex flex-wrap gap-2">
                    {EP0_METADATA.themes.map(theme => (
                      <Badge key={theme} className="bg-blood-900/30 text-blood-400 border-blood-700/30">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Music */}
                <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">🎵 Musique</h3>
                  <p className="text-white font-bold">{EP0_METADATA.music.title}</p>
                  <p className="text-zinc-400 text-sm">{EP0_METADATA.music.artist}</p>
                  <Badge className="mt-2 bg-amber-900/30 text-amber-400 border-amber-700/30">
                    {EP0_METADATA.music.mood}
                  </Badge>
                </Card>

                {/* Inspiration */}
                <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">💡 Inspiration</h3>
                  <p className="text-zinc-300 text-sm italic">
                    "{EP0_METADATA.inspiration}"
                  </p>
                </Card>

                {/* Quick Links */}
                <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">🔗 Liens</h3>
                  <div className="space-y-2">
                    <Link href="/lore#genocide" className="block text-blood-400 hover:text-blood-300 text-sm">
                      → Chronologie du Génocide
                    </Link>
                    <Link href="/characters?role=survivor" className="block text-blood-400 hover:text-blood-300 text-sm">
                      → Les Survivants
                    </Link>
                    <Link href="/locations?type=moostik_city" className="block text-blood-400 hover:text-blood-300 text-sm">
                      → Cités Moostik
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB: CAST */}
          {/* ============================================================ */}
          <TabsContent value="cast" className="p-8">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
              <span className="text-blood-500">👥</span> Personnages de l'Épisode
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {episodeCharacterIds.map(charId => {
                const char = getCharacter(charId);
                if (!char) return null;
                
                const imageUrl = char.referenceImages?.[0] || (char as any).referenceImageUrl;
                
                return (
                  <Link 
                    key={char.id} 
                    href={`/characters#${char.id}`}
                    className="group"
                  >
                    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden hover:border-blood-500/50 transition-all">
                      {/* Image */}
                      <div className="aspect-square relative bg-gradient-to-br from-blood-900/30 to-zinc-900">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={char.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">
                            {char.type === "human" ? "👤" : "🦟"}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        
                        {/* Role Badge */}
                        <Badge className={`absolute top-2 right-2 text-[9px] border-0 ${
                          char.role === "protagonist" ? "bg-blood-600 text-white" :
                          char.role === "antagonist" ? "bg-purple-600 text-white" :
                          "bg-zinc-800 text-zinc-300"
                        }`}>
                          {char.role === "protagonist" ? "HÉROS" : 
                           char.role === "antagonist" ? "ANTAGONISTE" : "SUPPORT"}
                        </Badge>
                      </div>
                      
                      {/* Info */}
                      <div className="p-4">
                        <h3 className="text-white font-bold truncate">{char.name}</h3>
                        {char.title && (
                          <p className="text-blood-400 text-xs truncate">{char.title}</p>
                        )}
                        <p className="text-zinc-500 text-xs mt-2 line-clamp-2">{char.description}</p>
                        
                        {/* Type */}
                        <div className="mt-3 flex items-center gap-2">
                          <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[9px]">
                            {char.type === "human" ? "HUMAIN" : "MOOSTIK"}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
            
            {/* Link to full cast */}
            <div className="mt-8 text-center">
              <Link href="/characters">
                <Button variant="outline" className="border-blood-700/50 text-blood-400 hover:bg-blood-900/20">
                  Voir tous les personnages →
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB: DÉCORS */}
          {/* ============================================================ */}
          <TabsContent value="decors" className="p-8">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
              <span className="text-blood-500">📍</span> Décors de l'Épisode
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {episodeLocationIds.map(locId => {
                const loc = getLocation(locId);
                if (!loc) return null;
                
                const imageUrl = loc.referenceImages?.[0];
                
                return (
                  <Link 
                    key={loc.id} 
                    href={`/locations#${loc.id}`}
                    className="group"
                  >
                    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden hover:border-blood-500/50 transition-all">
                      {/* Image */}
                      <div className="aspect-video relative bg-gradient-to-br from-blood-900/30 to-zinc-900">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={loc.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">
                            {loc.type === "human_space" ? "🏠" : 
                             loc.type === "moostik_city" ? "🏰" : "🚪"}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        
                        {/* Type Badge */}
                        <Badge className={`absolute top-2 right-2 text-[9px] border-0 ${
                          loc.type === "human_space" ? "bg-red-600 text-white" :
                          loc.type === "moostik_city" ? "bg-blood-600 text-white" :
                          "bg-purple-600 text-white"
                        }`}>
                          {loc.type === "human_space" ? "TERRITOIRE ENNEMI" : 
                           loc.type === "moostik_city" ? "CITÉ MOOSTIK" : "TRANSITION"}
                        </Badge>
                      </div>
                      
                      {/* Info */}
                      <div className="p-4">
                        <h3 className="text-white font-bold">{loc.name}</h3>
                        <p className="text-zinc-500 text-sm mt-2 line-clamp-3">{loc.description}</p>
                        
                        {/* Atmosphere */}
                        {loc.atmosphericElements && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {loc.atmosphericElements.slice(0, 2).map((elem: string, i: number) => (
                              <Badge key={i} className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[9px]">
                                {elem.split(' ').slice(0, 3).join(' ')}...
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
            
            {/* Link to all locations */}
            <div className="mt-8 text-center">
              <Link href="/locations">
                <Button variant="outline" className="border-blood-700/50 text-blood-400 hover:bg-blood-900/20">
                  Voir tous les lieux →
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB: ACTES */}
          {/* ============================================================ */}
          <TabsContent value="actes" className="p-8">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
              <span className="text-blood-500">🎬</span> Actes & Séquences
            </h2>
            
            <div className="space-y-4">
              {acts.map((act) => {
                const actShots = getShotsForAct(act);
                const isOpen = openActs.includes(act.id);
                const completedShots = actShots.filter(s => 
                  s.variations?.some(v => v.status === "completed")
                ).length;
                
                return (
                  <Collapsible 
                    key={act.id} 
                    open={isOpen}
                    onOpenChange={() => toggleAct(act.id)}
                  >
                    <Card className="bg-zinc-900/30 border-zinc-800 overflow-hidden">
                      <CollapsibleTrigger className="w-full">
                        <div className="p-6 flex items-center gap-4 hover:bg-zinc-900/50 transition-colors cursor-pointer">
                          {/* Number */}
                          <div className="w-12 h-12 rounded-full bg-blood-900/50 border border-blood-700/50 flex items-center justify-center flex-shrink-0">
                            <span className="text-blood-400 font-black">{act.number}</span>
                          </div>
                          
                          {/* Title */}
                          <div className="flex-1 text-left">
                            <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                              {act.title}
                            </h3>
                            <p className="text-zinc-500 text-sm">{act.description}</p>
                          </div>
                          
                          {/* Stats */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[10px] text-zinc-500 uppercase block">Shots</span>
                              <span className="text-white font-bold">{completedShots}/{actShots.length}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-zinc-500 uppercase block">Persos</span>
                              <span className="text-white font-bold">{act.characters.length}</span>
                            </div>
                            
                            {/* Chevron */}
                            <svg 
                              className={`w-5 h-5 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="px-6 pb-6 border-t border-zinc-800 pt-4">
                          {/* Characters & Locations */}
                          <div className="flex flex-wrap gap-4 mb-6">
                            {/* Characters */}
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 text-xs uppercase">Personnages:</span>
                              <div className="flex gap-1">
                                {act.characters.slice(0, 4).map(charId => {
                                  const char = getCharacter(charId);
                                  return char ? (
                                    <Link 
                                      key={charId} 
                                      href={`/characters#${charId}`}
                                      className="group"
                                    >
                                      <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] hover:bg-blood-900/30 hover:text-blood-400 transition-colors">
                                        {char.name.split(' ')[0]}
                                      </Badge>
                                    </Link>
                                  ) : null;
                                })}
                                {act.characters.length > 4 && (
                                  <Badge className="bg-zinc-800 text-zinc-500 border-zinc-700 text-[10px]">
                                    +{act.characters.length - 4}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Locations */}
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 text-xs uppercase">Lieux:</span>
                              <div className="flex gap-1">
                                {act.locations.map(locId => {
                                  const loc = getLocation(locId);
                                  return loc ? (
                                    <Link 
                                      key={locId} 
                                      href={`/locations#${locId}`}
                                    >
                                      <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] hover:bg-blood-900/30 hover:text-blood-400 transition-colors">
                                        {loc.name.split(' - ')[0]}
                                      </Badge>
                                    </Link>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          </div>
                          
                          {/* Shots Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {actShots.map(shot => {
                              const previewVariation = shot.variations?.find(v => v.imageUrl);
                              return (
                                <div 
                                  key={shot.id}
                                  className="group cursor-pointer"
                                  onClick={() => {
                                    if (previewVariation) {
                                      const idx = filteredImages.findIndex(
                                        img => img.shotId === shot.id && img.variation.id === previewVariation.id
                                      );
                                      if (idx >= 0) openLightbox(idx);
                                    }
                                  }}
                                >
                                  <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 group-hover:border-blood-500/50 transition-all">
                                    {previewVariation?.imageUrl ? (
                                      <img 
                                        src={previewVariation.imageUrl} 
                                        alt={shot.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                        <span className="text-xs uppercase">Pending</span>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs text-zinc-500 mt-1 truncate group-hover:text-white transition-colors">
                                    {shot.name}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB: TIMELINE */}
          {/* ============================================================ */}
          <TabsContent value="timeline" className="p-0">
            {/* Filters */}
            <div className="p-4 border-b border-blood-900/20 bg-zinc-900/30">
              <div className="flex items-center gap-4 max-w-7xl mx-auto">
                <div className="relative flex-1 max-w-sm">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <Input
                    placeholder="Rechercher un shot..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-blood-500 text-white"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <SelectTrigger className="w-40 bg-zinc-900/50 border-zinc-800 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#14131a] border-zinc-800">
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="completed">Complétés</SelectItem>
                    <SelectItem value="with_video">Avec vidéo</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={angleFilter} onValueChange={(v) => setAngleFilter(v as AngleFilter)}>
                  <SelectTrigger className="w-40 bg-zinc-900/50 border-zinc-800 text-white">
                    <SelectValue placeholder="Angle" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#14131a] border-zinc-800">
                    <SelectItem value="all">Tous les angles</SelectItem>
                    <SelectItem value="extreme_wide">Extreme Wide</SelectItem>
                    <SelectItem value="wide">Wide</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="close_up">Close Up</SelectItem>
                    <SelectItem value="low_angle">Low Angle</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="ml-auto flex items-center gap-4 text-sm">
                  <span className="text-zinc-500">
                    <span className="text-white font-bold">{filteredImages.length}</span> images
                  </span>
                </div>
              </div>
            </div>
            
            {/* Timeline Component */}
            {episode && (
              <TimelineStoryboard
                shots={episode.shots.filter((shot) => {
                  if (searchQuery && !shot.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  return true;
                })}
                onShotClick={(shot) => {
                  const firstCompletedVariation = shot.variations?.find((v) => v.imageUrl);
                  if (firstCompletedVariation) {
                    const globalIndex = filteredImages.findIndex(
                      (img) => img.shotId === shot.id && img.variation.id === firstCompletedVariation.id
                    );
                    if (globalIndex >= 0) {
                      openLightbox(globalIndex);
                    }
                  }
                }}
              />
            )}
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB: GALLERY */}
          {/* ============================================================ */}
          <TabsContent value="gallery" className="p-8">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
              <span className="text-blood-500">🖼</span> Galerie d'Images
            </h2>
            
            {filteredImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Aucune image ne correspond aux filtres</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredImages.map((img, index) => (
                  <div 
                    key={img.id}
                    className="group aspect-[16/9] relative cursor-pointer rounded-lg overflow-hidden bg-zinc-900 hover:ring-2 ring-blood-500 transition-all"
                    onClick={() => openLightbox(index)}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-bold truncate">{img.shotName}</p>
                        <p className="text-white/60 text-[10px] uppercase">{img.cameraAngle.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    
                    {img.videoUrl && (
                      <Badge className="absolute top-2 right-2 bg-blood-600 text-white text-[9px] border-0">
                        🎬 VIDEO
                      </Badge>
                    )}
                    
                    <Badge className="absolute top-2 left-2 bg-black/60 text-white text-[9px] border-0">
                      #{img.shotNumber.toString().padStart(2, "0")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB: CREDITS */}
          {/* ============================================================ */}
          <TabsContent value="credits" className="p-8">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
              <span className="text-blood-500">✨</span> Crédits & Inspirations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              {/* Inspiration */}
              <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                <h3 className="text-xl font-bold uppercase tracking-tight mb-4 text-blood-400">
                  💡 Inspirations
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-white font-bold">Attack on Titan</p>
                    <p className="text-zinc-500 text-sm">Structure narrative, intensité émotionnelle, trauma collectif</p>
                  </div>
                  <div>
                    <p className="text-white font-bold">Pixar Studios</p>
                    <p className="text-zinc-500 text-sm">Style visuel, worldbuilding, character design</p>
                  </div>
                  <div>
                    <p className="text-white font-bold">Culture Martiniquaise</p>
                    <p className="text-zinc-500 text-sm">Architecture créole, persiennes, atmosphère caribéenne</p>
                  </div>
                </div>
              </Card>

              {/* Music */}
              <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                <h3 className="text-xl font-bold uppercase tracking-tight mb-4 text-blood-400">
                  🎵 Bande Sonore
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-white font-bold">{EP0_METADATA.music.title}</p>
                    <p className="text-zinc-500 text-sm">Compositeur: {EP0_METADATA.music.artist}</p>
                    <Badge className="mt-2 bg-amber-900/30 text-amber-400 border-amber-700/30">
                      {EP0_METADATA.music.mood}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Tech Stack */}
              <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                <h3 className="text-xl font-bold uppercase tracking-tight mb-4 text-blood-400">
                  🔧 Technologies
                </h3>
                <div className="space-y-2">
                  <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 mr-2">Nano Banana 2 Pro</Badge>
                  <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 mr-2">Kling 2.6</Badge>
                  <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 mr-2">Next.js 16</Badge>
                  <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 mr-2">Supabase</Badge>
                  <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700">TypeScript</Badge>
                </div>
              </Card>

              {/* DA Links */}
              <Card className="bg-zinc-900/50 border-zinc-800 p-6">
                <h3 className="text-xl font-bold uppercase tracking-tight mb-4 text-blood-400">
                  📚 Documentation
                </h3>
                <div className="space-y-2">
                  <Link href="/lore" className="block text-blood-400 hover:text-blood-300 text-sm">
                    → Bible de la Direction Artistique
                  </Link>
                  <Link href="/lore#chronology" className="block text-blood-400 hover:text-blood-300 text-sm">
                    → Chronologie Moostik
                  </Link>
                  <Link href="/lore#gigantism" className="block text-blood-400 hover:text-blood-300 text-sm">
                    → Guide du Gigantisme
                  </Link>
                  <a href="https://github.com/Oshinsu/Moostik" target="_blank" rel="noopener" className="block text-zinc-500 hover:text-white text-sm">
                    → Code Source (GitHub)
                  </a>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ================================================================== */}
      {/* FOOTER NAVIGATION */}
      {/* ================================================================== */}
      <footer className="border-t border-blood-900/30 mt-16 p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-zinc-500 text-sm">
            © 2026 MOOSTIK — Rise of Bloodwings
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-zinc-700">|</span>
            <Link href="/ep0" className="text-blood-400 font-bold">EP0</Link>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-500">EP1 — Coming Soon</span>
            <span className="text-zinc-700">|</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled className="text-zinc-700">
              ← Précédent
            </Button>
            <Button variant="ghost" size="sm" disabled className="text-zinc-700">
              Suivant →
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
