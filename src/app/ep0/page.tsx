"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Episode, Variation } from "@/types";

interface ImageData {
  shotId: string;
  shotName: string;
  shotNumber: number;
  sceneType: string;
  variation: Variation;
  url: string;
  videoUrl?: string;
  videoStatus?: string;
}

interface GenerationProgress {
  totalShots: number;
  totalVariations: number;
  pendingVariations: number;
  completedVariations: number;
  completionPercent: number;
}

export default function EP0CinemaPage() {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [activeTab, setActiveTab] = useState("cinema");

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
              shotId: shot.id,
              shotName: shot.name,
              shotNumber: shot.number,
              sceneType: shot.sceneType || "establishing",
              variation,
              url: variation.imageUrl,
              videoUrl: variation.videoUrl,
              videoStatus: variation.videoStatus,
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

      <main className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-transparent border-b border-zinc-800 w-full justify-start rounded-none h-auto p-0 gap-8">
            <TabsTrigger value="cinema" className="data-[state=active]:border-blood-500 data-[state=active]:text-white border-b-2 border-transparent rounded-none bg-transparent px-0 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-xl">
              Cinéma
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:border-blood-500 data-[state=active]:text-white border-b-2 border-transparent rounded-none bg-transparent px-0 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-xl">
              Planches
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cinema" className="space-y-12">
            {episode?.shots.map((shot) => (
              <section key={shot.id} className="space-y-4">
                <div className="flex items-center gap-4 border-l-4 border-blood-600 pl-4">
                  <span className="text-4xl font-black text-zinc-800">#{String(shot.number).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-2xl font-bold uppercase tracking-tight">{shot.name}</h3>
                    <p className="text-zinc-500 text-sm italic">{shot.description}</p>
                  </div>
                  <Badge className="ml-auto bg-zinc-900 text-zinc-400 border-zinc-800">{shot.sceneType}</Badge>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  {shot.variations?.map((v) => (
                    <Card 
                      key={v.id} 
                      className="bg-zinc-900/50 border-zinc-800 overflow-hidden group cursor-pointer hover:border-blood-500/50 transition-all"
                      onClick={() => setSelectedImage({
                        shotId: shot.id,
                        shotName: shot.name,
                        shotNumber: shot.number,
                        sceneType: shot.sceneType || "establishing",
                        variation: v,
                        url: v.imageUrl || "",
                        videoUrl: v.videoUrl,
                        videoStatus: v.videoStatus
                      })}
                    >
                      <div className="aspect-[16/9] relative">
                        {v.imageUrl ? (
                          <img src={v.imageUrl} alt={v.cameraAngle} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        ) : (
                          <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-800 font-black">MISSING</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Badge className="absolute top-2 right-2 bg-black/60 text-[10px] uppercase font-bold">{v.cameraAngle}</Badge>
                        {v.videoStatus === "completed" && (
                          <div className="absolute bottom-2 left-2 text-blood-500 text-xs font-black uppercase">VIDEO READY</div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </TabsContent>

          <TabsContent value="gallery">
            <div className="grid grid-cols-6 gap-2">
              {images.map((img) => (
                <div 
                  key={`${img.shotId}-${img.variation.id}`}
                  className="aspect-square relative cursor-pointer hover:ring-2 ring-blood-500 transition-all overflow-hidden"
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="bg-[#0b0b0e] border-zinc-800 max-w-6xl p-0 overflow-hidden">
          <div className="grid grid-cols-3 h-[80vh]">
            <div className="col-span-2 bg-black flex items-center justify-center relative">
              {selectedImage?.videoUrl ? (
                <video src={selectedImage.videoUrl} controls autoPlay loop className="max-h-full max-w-full" />
              ) : (
                <img src={selectedImage?.url} alt="" className="max-h-full max-w-full object-contain" />
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-blood-600">{selectedImage?.variation.cameraAngle}</Badge>
                <Badge className="bg-zinc-800">{selectedImage?.sceneType}</Badge>
              </div>
            </div>
            <div className="p-8 border-l border-zinc-800 space-y-6">
              <DialogHeader>
                <span className="text-blood-500 font-black text-sm uppercase tracking-widest">Shot #{selectedImage?.shotNumber}</span>
                <DialogTitle className="text-3xl font-bold uppercase">{selectedImage?.shotName}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Prompt Vidéo Optimisé</span>
                  <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-4 rounded border border-zinc-800 italic">
                    {selectedImage?.variation.videoPrompt || "En attente d'optimisation..."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase font-black block mb-1">Durée</span>
                    <span className="font-bold">{selectedImage?.variation.videoDuration || 10}s</span>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase font-black block mb-1">Mouvement</span>
                    <span className="font-bold uppercase">{selectedImage?.variation.videoCameraMotion || "Static"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-3">
                <Button className="w-full moostik-btn-blood text-white font-bold h-12">
                  Générer Vidéo Kling 2.6
                </Button>
                <Button variant="outline" className="w-full border-zinc-800 text-zinc-400 hover:bg-zinc-900 h-12">
                  Télécharger Master 4K
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
