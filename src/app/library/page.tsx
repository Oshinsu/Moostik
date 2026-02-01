"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { SkeletonImage } from "@/components/shared/SkeletonImage";
import { downloadImage } from "@/lib/download-utils";
import { getCameraAngleLabel } from "@/data/camera-angles";

// ============================================================================
// TYPES
// ============================================================================

interface ImageItem {
  id: string;
  url: string;
  type: "character" | "location" | "shot" | "promo";
  category: string;
  name: string;
  description?: string;
  createdAt?: string;
  episodeId?: string;
  shotId?: string;
  videoUrl?: string;
  videoStatus?: string;
  metadata?: {
    seed?: number;
    resolution?: string;
    prompt?: string;
  };
}

interface CategoryData {
  id: string;
  title: string;
  icon: string;
  color: string;
  images: ImageItem[];
}

// ============================================================================
// CATEGORY CONFIGURATION - SOTA DAM Structure
// ============================================================================

const CATEGORY_CONFIG = {
  character: {
    title: "👤 Personnages",
    icon: "👤",
    color: "purple",
    folder: "01-personnages",
  },
  location: {
    title: "📍 Lieux",
    icon: "📍",
    color: "blue",
    folder: "02-lieux",
  },
  shot: {
    title: "🎬 Shots Générés",
    icon: "🎬",
    color: "amber",
    folder: "03-shots",
  },
  promo: {
    title: "🩸 Assets Promo",
    icon: "🩸",
    color: "blood",
    folder: "04-promo",
  },
};

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  blood: {
    bg: "bg-blood-500/10",
    text: "text-blood-400",
    border: "border-blood-500/30",
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function LibraryPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "type" | "date">("type");
  const [openCategories, setOpenCategories] = useState<string[]>(["character", "shot"]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [downloadingZip, setDownloadingZip] = useState<string | null>(null);
  
  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxCategory, setLightboxCategory] = useState<string | null>(null);

  // ========================================================================
  // DATA LOADING
  // ========================================================================
  
  const loadAllImages = useCallback(async () => {
    setLoading(true);
    try {
      const allImages: ImageItem[] = [];

      // Load references (characters and locations)
      const refsResponse = await fetch("/api/references");
      const refsData = await refsResponse.json();

      // Add character images
      for (const char of refsData.characters || []) {
        for (let i = 0; i < (char.referenceImages || []).length; i++) {
          allImages.push({
            id: `char-${char.id}-${i}`,
            url: char.referenceImages[i],
            type: "character",
            category: char.type === "human" ? "Humain" : "Moostik",
            name: char.name,
            description: char.description,
            metadata: {
              prompt: char.referencePrompt?.slice(0, 200),
            },
          });
        }
      }

      // Add location images
      for (const loc of refsData.locations || []) {
        for (let i = 0; i < (loc.referenceImages || []).length; i++) {
          allImages.push({
            id: `loc-${loc.id}-${i}`,
            url: loc.referenceImages[i],
            type: "location",
            category: loc.type,
            name: loc.name,
            description: loc.description,
            metadata: {
              prompt: loc.referencePrompt?.slice(0, 200),
            },
          });
        }
      }

      // Load generated images from episodes
      const episodesResponse = await fetch("/api/episodes");
      const episodesData = await episodesResponse.json();

      for (const episode of episodesData || []) {
        const generatedRes = await fetch(`/api/episodes/${episode.id}/generated-images`);
        if (generatedRes.ok) {
          const generatedData = await generatedRes.json();
          
          for (const img of generatedData.images || []) {
            const shotNum = img.shotId?.match(/shot-(\d+)/)?.[1] || img.shotId;
            const angleLabel = getCameraAngleLabel(img.cameraAngle || "");

            allImages.push({
              id: img.id,
              url: img.url,
              type: "shot",
              category: `EP${episode.number} - ${angleLabel}`,
              name: `Shot ${shotNum} - ${angleLabel}`,
              description: `Fichier: ${img.filename}`,
              episodeId: episode.id,
              shotId: img.shotId,
              createdAt: img.createdAt,
              videoUrl: img.videoUrl,
              videoStatus: img.videoStatus,
              metadata: {
                seed: img.seed,
                resolution: img.resolution,
              },
            });
          }
        }
      }

      // Load promo assets
      try {
        const promoRes = await fetch("/api/promo");
        if (promoRes.ok) {
          const promoData = await promoRes.json();
          for (const category of promoData.categories || []) {
            for (const shot of category.shots || []) {
              for (const variation of shot.variations || []) {
                if (variation.status === "completed" && variation.imageUrl) {
                  allImages.push({
                    id: `promo-${shot.id}-${variation.id}`,
                    url: variation.imageUrl,
                    type: "promo",
                    category: category.title,
                    name: shot.name,
                    description: shot.description,
                    metadata: {
                      seed: shot.prompt?.parameters?.seed,
                      resolution: shot.prompt?.parameters?.render_resolution,
                      prompt: shot.prompt?.meta?.scene_intent?.slice(0, 200),
                    },
                  });
                }
              }
            }
          }
        }
      } catch (e) {
        console.log("No promo assets yet");
      }

      setImages(allImages);
    } catch (error) {
      console.error("Error loading images:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllImages();
  }, [loadAllImages]);

  // ========================================================================
  // FILTERING & SORTING
  // ========================================================================

  const filteredImages = useMemo(() => {
    return images
      .filter((img) => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            img.name.toLowerCase().includes(query) ||
            img.category.toLowerCase().includes(query) ||
            img.description?.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "type") return a.type.localeCompare(b.type);
        if (sortBy === "date") {
          return (b.createdAt || "").localeCompare(a.createdAt || "");
        }
        return 0;
      });
  }, [images, searchQuery, sortBy]);

  // Group by category
  const categories = useMemo((): CategoryData[] => {
    const grouped: Record<string, ImageItem[]> = {
      character: [],
      location: [],
      shot: [],
      promo: [],
    };

    for (const img of filteredImages) {
      if (grouped[img.type]) {
        grouped[img.type].push(img);
      }
    }

    return Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
      id: key,
      title: config.title,
      icon: config.icon,
      color: config.color,
      images: grouped[key] || [],
    }));
  }, [filteredImages]);

  // ========================================================================
  // ACTIONS
  // ========================================================================

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleImageSelection = (id: string) => {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllInCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setSelectedImages((prev) => {
        const next = new Set(prev);
        category.images.forEach((img) => next.add(img.id));
        return next;
      });
    }
  };

  const openLightboxForCategory = (categoryId: string, index: number) => {
    setLightboxCategory(categoryId);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Download ZIP for category
  const downloadCategoryZip = async (categoryType: string) => {
    setDownloadingZip(categoryType);
    try {
      const response = await fetch(`/api/library/download-zip?type=${categoryType}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bloodwings-${categoryType}-${new Date().toISOString().split("T")[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("ZIP download failed:", error);
    } finally {
      setDownloadingZip(null);
    }
  };

  // Download ALL as ZIP
  const downloadAllZip = async () => {
    setDownloadingZip("all");
    try {
      const response = await fetch("/api/library/download-zip");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bloodwings-library-${new Date().toISOString().split("T")[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("ZIP download failed:", error);
    } finally {
      setDownloadingZip(null);
    }
  };

  // Lightbox images for current category
  const lightboxImages = useMemo(() => {
    if (!lightboxCategory) return [];
    const category = categories.find((c) => c.id === lightboxCategory);
    return (category?.images || []).map((img) => ({
      id: img.id,
      url: img.url,
      shotName: img.name,
      shotNumber: 0,
      cameraAngle: img.category,
      sceneType: img.type,
      seed: img.metadata?.seed,
      videoUrl: img.videoUrl,
      prompt: img.metadata?.prompt ? { meta: { scene_intent: img.metadata.prompt } } : undefined,
    }));
  }, [lightboxCategory, categories]);

  // Stats
  const stats = useMemo(() => ({
    total: images.length,
    characters: images.filter((i) => i.type === "character").length,
    locations: images.filter((i) => i.type === "location").length,
    shots: images.filter((i) => i.type === "shot").length,
    promo: images.filter((i) => i.type === "promo").length,
  }), [images]);

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-zinc-100">
      {/* Lightbox */}
      <ImmersiveLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}
      <header className="relative border-b border-blood-900/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blood-900/20 via-[#0b0b0e] to-purple-900/10" />
        
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
            <Link href="/ep0" className="text-zinc-500 hover:text-white text-sm">EP0</Link>
            <Link href="/promo" className="text-zinc-500 hover:text-white text-sm">Promo</Link>
          </div>
          <Badge className="bg-blood-900/50 text-blood-400 border-blood-700/30">
            BIBLIOTHÈQUE SOTA
          </Badge>
        </nav>

        {/* Hero */}
        <div className="relative z-10 px-8 py-12 max-w-7xl mx-auto">
          <div className="flex items-end justify-between">
            <div>
              <Badge className="bg-blood-600 text-white border-0 mb-4">BLOODWINGS STUDIO</Badge>
              <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">
                <span className="text-blood-500">Bibliothèque</span> d'Assets
              </h1>
              <p className="text-zinc-500 max-w-xl">
                Tous vos assets générés, organisés par catégorie. Téléchargez en ZIP ou individuellement.
              </p>
            </div>
            
            {/* Global Download */}
            <Button
              onClick={downloadAllZip}
              disabled={downloadingZip !== null}
              className="moostik-btn-blood text-white font-bold h-12 px-6"
            >
              {downloadingZip === "all" ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Préparation...
                </>
              ) : (
                <>
                  📦 Télécharger TOUT ({stats.total})
                </>
              )}
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-8">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const count = stats[key as keyof typeof stats] || 0;
              const colors = COLOR_CLASSES[config.color];
              return (
                <div
                  key={key}
                  className={`flex items-center gap-2 px-4 py-2 ${colors.bg} rounded-xl border ${colors.border}`}
                >
                  <span>{config.icon}</span>
                  <span className={`${colors.text} font-bold`}>{count}</span>
                  <span className="text-zinc-500 text-sm">{config.title.split(" ")[1]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* ================================================================ */}
      {/* FILTERS */}
      {/* ================================================================ */}
      <div className="border-b border-blood-900/20 bg-[#0b0b0e]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto p-4 flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              placeholder="Rechercher par nom, catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-blood-500 text-white"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v: "name" | "type" | "date") => setSortBy(v)}>
            <SelectTrigger className="w-40 bg-zinc-900/50 border-zinc-800 text-white">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent className="bg-[#14131a] border-zinc-800">
              <SelectItem value="type">Par type</SelectItem>
              <SelectItem value="name">Par nom</SelectItem>
              <SelectItem value="date">Par date</SelectItem>
            </SelectContent>
          </Select>

          {/* Expand/Collapse All */}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setOpenCategories((prev) =>
                prev.length === Object.keys(CATEGORY_CONFIG).length
                  ? []
                  : Object.keys(CATEGORY_CONFIG)
              )
            }
            className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
          >
            {openCategories.length === Object.keys(CATEGORY_CONFIG).length
              ? "Replier tout"
              : "Déplier tout"}
          </Button>

          {/* Selection info */}
          {selectedImages.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge className="bg-blood-600 text-white border-0">
                {selectedImages.size} sélectionnés
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImages(new Set())}
                className="text-zinc-400"
              >
                ✕ Désélectionner
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* CONTENT - ACCORDIONS */}
      {/* ================================================================ */}
      <main className="max-w-7xl mx-auto p-8 space-y-6">
        {loading ? (
          // Loading skeletons
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-zinc-900/30 border-zinc-800 p-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-zinc-800 rounded w-1/4 mb-4" />
                  <div className="grid grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <div key={j} className="aspect-video bg-zinc-800 rounded-lg" />
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          categories.map((category) => {
            const isOpen = openCategories.includes(category.id);
            const colors = COLOR_CLASSES[category.color];
            const hasImages = category.images.length > 0;

            return (
              <Collapsible
                key={category.id}
                open={isOpen}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <Card className="bg-zinc-900/30 border-zinc-800 overflow-hidden">
                  {/* Accordion Header */}
                  <div className="p-6 flex items-center gap-4 hover:bg-zinc-900/50 transition-colors">
                    {/* Clickable area for collapse trigger */}
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-4 flex-1 cursor-pointer">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center text-2xl`}>
                          {category.icon}
                        </div>

                        {/* Title & Stats */}
                        <div className="flex-1 text-left">
                          <h2 className="text-xl font-bold text-white">{category.title}</h2>
                          <p className="text-zinc-500 text-sm">
                            {category.images.length} assets • {hasImages ? "Prêts à télécharger" : "Aucun asset"}
                          </p>
                        </div>

                        {/* Progress */}
                        {hasImages && (
                          <div className="w-32">
                            <Progress value={100} className="h-1.5 bg-zinc-800" />
                          </div>
                        )}

                        {/* Chevron */}
                        <svg
                          className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </CollapsibleTrigger>

                    {/* Actions - Outside the trigger to avoid nested buttons */}
                    {hasImages && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectAllInCategory(category.id)}
                          className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-xs"
                        >
                          Tout sélectionner
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadCategoryZip(category.id)}
                          disabled={downloadingZip !== null}
                          className={`${colors.border} ${colors.text} hover:bg-zinc-800 text-xs`}
                        >
                          {downloadingZip === category.id ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <>📦 ZIP ({category.images.length})</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Accordion Content */}
                  <CollapsibleContent id={`content-${category.id}`}>
                    <div className="px-6 pb-6 border-t border-zinc-800 pt-4">
                      {!hasImages ? (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
                          <span className="text-4xl mb-3 opacity-30">{category.icon}</span>
                          <p>Aucun asset dans cette catégorie</p>
                          {category.id === "promo" && (
                            <Link href="/promo">
                              <Button variant="outline" size="sm" className="mt-4 border-blood-700/50 text-blood-400">
                                Générer des assets promo →
                              </Button>
                            </Link>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                          {category.images.map((img, index) => (
                            <div
                              key={img.id}
                              className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                selectedImages.has(img.id)
                                  ? "border-blood-500 ring-2 ring-blood-500/30"
                                  : "border-zinc-800 hover:border-zinc-700"
                              }`}
                              onClick={() => toggleImageSelection(img.id)}
                            >
                              {/* Selection indicator */}
                              <div
                                className={`absolute top-2 left-2 z-20 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  selectedImages.has(img.id)
                                    ? "bg-blood-500 border-blood-500"
                                    : "bg-black/50 border-white/50 opacity-0 group-hover:opacity-100"
                                }`}
                              >
                                {selectedImages.has(img.id) && (
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>

                              {/* Video badge */}
                              {img.videoUrl && img.videoStatus === "completed" && (
                                <Badge className="absolute top-2 right-2 z-20 bg-emerald-600 text-white text-[9px] border-0">
                                  🎬 MP4
                                </Badge>
                              )}

                              {/* Image with skeleton */}
                              <SkeletonImage
                                src={img.url}
                                alt={img.name}
                                aspectRatio="square"
                                showMetadata
                                metadata={img.metadata}
                              />

                              {/* Hover actions */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <div className="absolute bottom-2 right-2 flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 w-8 p-0 bg-white/10 backdrop-blur-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openLightboxForCategory(category.id, index);
                                    }}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 w-8 p-0 bg-white/10 backdrop-blur-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadImage(img.url, img.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase());
                                    }}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                  </Button>
                                </div>
                              </div>

                              {/* Info */}
                              <div className="p-3 bg-zinc-900">
                                <h3 className="text-sm font-medium text-white truncate">{img.name}</h3>
                                <p className="text-[10px] text-zinc-500 truncate">{img.category}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })
        )}
      </main>

      {/* ================================================================ */}
      {/* FOOTER */}
      {/* ================================================================ */}
      <footer className="border-t border-blood-900/30 p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-zinc-500 text-sm">
            © 2026 BLOODWINGS STUDIO — Bibliothèque SOTA Janvier 2026
          </div>
          <div className="flex items-center gap-4">
            <span className="text-zinc-600 text-xs">
              Naming: projet-type-nom-version-seed-resolution.ext
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
