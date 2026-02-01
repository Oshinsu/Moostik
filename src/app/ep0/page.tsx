"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
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
import { ImmersiveLightbox } from "@/components/shared/ImmersiveLightbox";
import { TimelineStoryboard } from "@/components/shared/TimelineStoryboard";
import type { Episode, Variation, Shot } from "@/types";

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

// Filter types
type StatusFilter = "all" | "completed" | "pending" | "with_video";
type AngleFilter = "all" | "extreme_wide" | "wide" | "medium" | "close_up" | "low_angle";

export default function EP0CinemaPage() {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [angleFilter, setAngleFilter] = useState<AngleFilter>("all");

  const fetchData = useCallback(async () => {
    try {
      const epRes = await fetch("/api/episodes/ep0");
      if (!epRes.ok) throw new Error("Episode not found");
      const epData = await epRes.json();
      setEpisode(epData);

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
              seed: shot.prompt?.parameters?.seed,
              prompt: shot.prompt,
            });
          }
        }
      }
      setImages(allImages);

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
      // Search filter
      if (searchQuery && !img.shotName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Status filter
      if (statusFilter === "with_video" && !img.videoUrl) {
        return false;
      }
      // Angle filter
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const downloadAll = async () => {
    const res = await fetch("/api/episodes/ep0/download-all");
    if (res.ok) {
      const data = await res.json();
      // On pourrait ici déclencher un téléchargement groupé ou ZIP
      alert(`Prêt à télécharger ${data.totalImages} images.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blood-900 border-t-blood-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-zinc-100">
      {/* Immersive Lightbox */}
      <ImmersiveLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
      
      {/* Header SOTA */}
      <header className="relative border-b border-blood-900/30 p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blood-900/20 to-transparent opacity-50" />
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <Link href="/" className="text-blood-400 hover:text-blood-300 text-sm mb-4 inline-block">← Retour au QG</Link>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic">
              <span className="text-blood-500">EP0:</span> {episode?.title}
            </h1>
            <p className="text-zinc-500 mt-2 max-w-2xl font-medium">{episode?.description}</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={downloadAll} className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">
              📦 Télécharger le Pack
            </Button>
            <Button className="moostik-btn-blood text-white font-bold px-8">
              🎬 Lancer le Rendu
            </Button>
          </div>
        </div>

        {progress && (
          <div className="mt-8 max-w-md">
            <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-widest text-zinc-500">
              <span>Statut de Production</span>
              <span className="text-blood-500">{progress.completionPercent}%</span>
            </div>
            <Progress value={progress.completionPercent} className="h-1 bg-zinc-900" />
          </div>
        )}
      </header>
      
      {/* Filters Bar SOTA */}
      <div className="border-b border-blood-900/20 bg-[#0b0b0e]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="p-4 flex items-center gap-4">
          {/* Search */}
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
          
          {/* Status Filter */}
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
          
          {/* Angle Filter */}
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
          
          {/* Stats */}
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="text-zinc-500">
              <span className="text-white font-bold">{filteredImages.length}</span> images
            </span>
            <span className="text-zinc-500">
              <span className="text-amber-400 font-bold">{images.filter(i => i.videoUrl).length}</span> vidéos
            </span>
          </div>
        </div>
      </div>

      <main className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-transparent border-b border-zinc-800 w-full justify-start rounded-none h-auto p-0 gap-8">
            <TabsTrigger value="timeline" className="data-[state=active]:border-blood-500 data-[state=active]:text-white border-b-2 border-transparent rounded-none bg-transparent px-0 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-xl">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="cinema" className="data-[state=active]:border-blood-500 data-[state=active]:text-white border-b-2 border-transparent rounded-none bg-transparent px-0 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-xl">
              Cinéma
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:border-blood-500 data-[state=active]:text-white border-b-2 border-transparent rounded-none bg-transparent px-0 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-xl">
              Planches
            </TabsTrigger>
          </TabsList>
          
          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-0">
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

          <TabsContent value="cinema" className="space-y-12">
            {episode?.shots.map((shot) => {
              // Filter variations based on current filters
              const shotVariations = shot.variations?.filter((v) => {
                if (angleFilter !== "all" && v.cameraAngle !== angleFilter) return false;
                if (statusFilter === "with_video" && !v.videoUrl) return false;
                return true;
              }) || [];
              
              // Skip shot if no variations match filters
              if (shotVariations.length === 0 && (angleFilter !== "all" || statusFilter !== "all")) return null;
              
              // Search filter
              if (searchQuery && !shot.name.toLowerCase().includes(searchQuery.toLowerCase())) return null;
              
              return (
                <section key={shot.id} className="space-y-4">
                  <div className="flex items-center gap-4 border-l-4 border-blood-600 pl-4">
                    <span className="text-4xl font-black text-zinc-800">#{String(shot.number).padStart(2, '0')}</span>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold uppercase tracking-tight">{shot.name}</h3>
                      <p className="text-zinc-500 text-sm italic">{shot.description}</p>
                      {/* Scene Intent Preview */}
                      {(shot.prompt as any)?.meta?.scene_intent && (
                        <p className="text-blood-400/70 text-xs mt-1 line-clamp-1 italic">
                          {(shot.prompt as any).meta.scene_intent}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {(shot.prompt as any)?.parameters?.seed && (
                        <Badge className="bg-amber-900/30 text-amber-400 border-amber-700/30 font-mono text-[10px]">
                          SEED: {(shot.prompt as any).parameters.seed}
                        </Badge>
                      )}
                      <Badge className="bg-zinc-900 text-zinc-400 border-zinc-800">{shot.sceneType}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-4">
                    {(shotVariations.length > 0 ? shotVariations : shot.variations)?.map((v) => {
                      // Find index in filtered images for lightbox
                      const globalIndex = filteredImages.findIndex(
                        (img) => img.shotId === shot.id && img.variation.id === v.id
                      );
                      
                      return (
                        <Card 
                          key={v.id} 
                          className="bg-zinc-900/50 border-zinc-800 overflow-hidden group cursor-pointer hover:border-blood-500/50 transition-all"
                          onClick={() => {
                            if (globalIndex >= 0) {
                              openLightbox(globalIndex);
                            }
                          }}
                        >
                          <div className="aspect-[16/9] relative">
                            {v.imageUrl ? (
                              <img src={v.imageUrl} alt={v.cameraAngle} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                            ) : (
                              <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-800 font-black">PENDING</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* Hover hint */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <Badge className="absolute top-2 right-2 bg-black/60 text-[10px] uppercase font-bold">{v.cameraAngle.replace(/_/g, " ")}</Badge>
                            {v.videoStatus === "completed" && (
                              <Badge className="absolute bottom-2 left-2 bg-blood-600 text-white text-[9px] border-0">
                                🎬 VIDEO
                              </Badge>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </TabsContent>

          <TabsContent value="gallery">
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
                    
                    {/* Overlay Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-bold truncate">{img.shotName}</p>
                        <p className="text-white/60 text-[10px] uppercase">{img.cameraAngle.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    
                    {/* Video Badge */}
                    {img.videoUrl && (
                      <Badge className="absolute top-2 right-2 bg-blood-600 text-white text-[9px] border-0">
                        🎬 VIDEO
                      </Badge>
                    )}
                    
                    {/* Shot Number */}
                    <Badge className="absolute top-2 left-2 bg-black/60 text-white text-[9px] border-0">
                      #{img.shotNumber.toString().padStart(2, "0")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

    </div>
  );
}
