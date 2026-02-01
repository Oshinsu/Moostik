"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  Search,
  Grid3X3,
  LayoutList,
  Image as ImageIcon,
  ZoomIn,
  Check,
  Filter,
  CheckCircle,
  Loader2,
  ChevronRight,
  Video,
  FolderOpen,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadImage, downloadMultipleImages, formatFileSize } from "@/lib/download-utils";
import { getCameraAngleLabel } from "@/data/camera-angles";
import { ImageTypeBadge } from "@/components/shared";
import type { Episode, Shot, Variation, GeneratedImage } from "@/types";

export default function EpisodeImagesPage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImage, setSelectedImage] = useState<{
    shot?: Shot;
    variation?: Variation;
    generated?: GeneratedImage;
  } | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  // Load episode data
  useEffect(() => {
    loadData();
  }, [episodeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [episodeRes, episodesRes, generatedRes] = await Promise.all([
        fetch(`/api/episodes/${episodeId}`),
        fetch("/api/episodes"),
        fetch(`/api/episodes/${episodeId}/generated-images`),
      ]);
      if (episodeRes.ok) {
        const data = await episodeRes.json();
        setEpisode(data);
      }
      if (episodesRes.ok) {
        const data = await episodesRes.json();
        setEpisodes(Array.isArray(data) ? data : []);
      }
      if (generatedRes.ok) {
        const data = await generatedRes.json();
        setGeneratedImages(data.images || []);
      }
    } catch (error) {
      console.error("Erreur chargement épisode:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get all images (from episode data + generated files)
  const getAllImages = useCallback(() => {
    const images: { 
      shot?: Shot; 
      variation?: Variation; 
      generated?: GeneratedImage;
      actTitle: string;
      source: "episode" | "generated";
    }[] = [];

    // Ajouter les images générées localement (scan du dossier)
    for (const img of generatedImages) {
      images.push({
        generated: img,
        actTitle: img.type === "legacy" ? "Images Legacy" : "Variations",
        source: "generated",
      });
    }

    // Ajouter les images depuis les données de l'épisode (si elles ont une URL différente)
    if (episode) {
      for (const shot of episode.shots) {
        const act = episode.acts?.find((a) =>
          a.shotIds?.includes(`shot-${String(shot.number).padStart(3, "0")}`)
        );

        for (const variation of shot.variations) {
          // Vérifier si cette image n'est pas déjà dans les images générées
          const alreadyExists = generatedImages.some(
            (g) => g.shotId === shot.id && g.variationId === variation.id
          );
          
          if (!alreadyExists && (variation.imageUrl || variation.status === "completed")) {
            images.push({
              shot,
              variation,
              actTitle: act?.title || "Sans acte",
              source: "episode",
            });
          }
        }
      }
    }

    return images;
  }, [episode, generatedImages]);

  // Filter images
  const filteredImages = getAllImages().filter((img) => {
    // Filter by type (legacy/variation)
    if (filterType !== "all") {
      if (filterType === "legacy" && img.generated?.type !== "legacy") return false;
      if (filterType === "variation" && img.generated?.type !== "variation" && !img.variation) return false;
    }

    // Filter by status (pour les images de l'épisode)
    if (filterStatus !== "all" && img.variation) {
      if (img.variation.status !== filterStatus) return false;
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (img.generated) {
        return (
          img.generated.filename.toLowerCase().includes(query) ||
          (img.generated.cameraAngle?.toLowerCase().includes(query) ?? false) ||
          (img.generated.shotId?.toLowerCase().includes(query) ?? false)
        );
      }
      if (img.shot && img.variation) {
        return (
          img.shot.name.toLowerCase().includes(query) ||
          img.shot.description.toLowerCase().includes(query) ||
          img.variation.cameraAngle.toLowerCase().includes(query)
        );
      }
    }

    return true;
  });

  // Stats
  const allImages = getAllImages();
  const stats = {
    total: allImages.length,
    legacy: generatedImages.filter((i) => i.type === "legacy").length,
    variations: generatedImages.filter((i) => i.type === "variation").length,
    fromEpisode: allImages.filter((i) => i.source === "episode").length,
    totalSize: generatedImages.reduce((sum, i) => sum + i.size, 0),
  };

  // Download functions
  const downloadAll = async () => {
    const items = filteredImages
      .filter((img) => img.generated?.url || img.variation?.imageUrl)
      .map((img) => ({
        url: img.generated?.url || img.variation?.imageUrl || "",
        filename: img.generated
          ? img.generated.filename.replace(/\.png$/, "")
          : `ep${episode?.number}-shot${img.shot?.number}-${img.variation?.cameraAngle}`,
      }));
    await downloadMultipleImages(items);
  };

  // Selection
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedImages(newSelection);
  };


  if (loading) {
    return (
      <div className="flex h-screen bg-[#0b0b0e]">
        <Sidebar episodes={episodes} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-crimson-500" />
        </main>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="flex h-screen bg-[#0b0b0e]">
        <Sidebar episodes={episodes} />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <XCircle className="h-16 w-16 text-red-500/50" />
          <p className="text-zinc-400">Épisode non trouvé</p>
          <Button variant="outline" onClick={() => router.push("/library")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la bibliothèque
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0b0b0e]">
      <Sidebar episodes={episodes} />

      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="relative p-6 border-b border-blood-900/30 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-crimson-900/15 via-[#0b0b0e] to-blood-900/10" />
            <div className="absolute inset-0 opacity-15">
              <div className="absolute top-0 left-1/5 w-px h-full bg-gradient-to-b from-crimson-700/50 via-blood-600/30 to-transparent animate-pulse" />
            </div>

            <div className="relative">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
                <Link
                  href="/library"
                  className="hover:text-crimson-400 transition-colors"
                >
                  Bibliothèque
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-crimson-400">
                  EP{episode.number} - Images
                </span>
              </div>

              {/* Title */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-crimson-500 animate-pulse" />
                    <span className="text-xs text-crimson-400 uppercase tracking-widest font-medium">
                      Images de l'Épisode
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold">
                    <span className="bg-gradient-to-r from-crimson-400 via-blood-500 to-crimson-500 bg-clip-text text-transparent">
                      EP{episode.number}: {episode.title}
                    </span>
                  </h1>
                  <p className="text-zinc-500 mt-1">
                    {stats.total} images générées ({stats.variations} variations)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                          onClick={() =>
                            router.push(`/library/episodes/${episodeId}/videos`)
                          }
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Voir les vidéos
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Accéder aux vidéos de cet épisode
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="outline"
                    className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                    onClick={downloadAll}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tout télécharger ({filteredImages.length})
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300 text-sm">
                    {stats.total} images
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <FolderOpen className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-300 text-sm">
                    {stats.legacy} legacy
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <ImageIcon className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-300 text-sm">
                    {stats.variations} variations
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <Download className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-300 text-sm">
                    {formatFileSize(stats.totalSize)}
                  </span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="Rechercher par nom, fichier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#14131a] border-blood-900/30 focus:border-blood-600"
                  />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40 bg-[#14131a] border-blood-900/30">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="legacy">Legacy (shot-XXX)</SelectItem>
                    <SelectItem value="variation">Variations</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-blood-900/30 rounded-md overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-crimson-600" : ""}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-crimson-600" : ""}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  className="border-blood-900/30"
                >
                  <Loader2 className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
                <p>Aucune image trouvée</p>
                <p className="text-sm mt-2">
                  Les images apparaîtront ici une fois générées
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredImages.map((img) => {
                  const imageId = img.generated?.id || `${img.shot?.id}-${img.variation?.id}`;
                  const imageUrl = img.generated?.url || img.variation?.imageUrl;
                  const imageName = img.generated 
                    ? img.generated.filename 
                    : img.shot?.name || "Sans nom";
                  const cameraAngle = img.generated?.cameraAngle || img.variation?.cameraAngle;
                  
                  return (
                    <div
                      key={imageId}
                      className={cn(
                        "group relative bg-[#14131a] rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                        selectedImages.has(imageId)
                          ? "border-crimson-500 ring-2 ring-crimson-500/50"
                          : "border-blood-900/30 hover:border-blood-700/50"
                      )}
                      onClick={() => toggleSelection(imageId)}
                    >
                      {/* Selection indicator */}
                      <div
                        className={cn(
                          "absolute top-2 left-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          selectedImages.has(imageId)
                            ? "bg-crimson-500 border-crimson-500"
                            : "bg-black/50 border-white/50 opacity-0 group-hover:opacity-100"
                        )}
                      >
                        {selectedImages.has(imageId) && <Check className="h-4 w-4 text-white" />}
                      </div>

                      {/* Type badge */}
                      <div className="absolute top-2 right-2 z-10">
                        <ImageTypeBadge type={img.generated?.type || "variation"} />
                      </div>

                      {/* Image */}
                      <div className="aspect-video relative bg-black">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={imageName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-zinc-700" />
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 right-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(img.generated ? { generated: img.generated } : { shot: img.shot, variation: img.variation });
                              }}
                            >
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                            {imageUrl && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadImage(imageUrl, imageName.replace(/\.png$/, ""));
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          {img.generated?.shotId && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blood-500/10 text-blood-300 border-blood-500/30"
                            >
                              {img.generated.shotId}
                            </Badge>
                          )}
                          {img.shot && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blood-500/10 text-blood-300 border-blood-500/30"
                            >
                              Shot {img.shot.number}
                            </Badge>
                          )}
                          {cameraAngle && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-amber-500/10 text-amber-300 border-amber-500/30"
                            >
                              {getCameraAngleLabel(cameraAngle)}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-sm font-medium text-white truncate">
                          {imageName}
                        </h3>
                        <p className="text-xs text-zinc-500 truncate">
                          {img.actTitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredImages.map((img) => {
                  const imageId = img.generated?.id || `${img.shot?.id}-${img.variation?.id}`;
                  const imageUrl = img.generated?.url || img.variation?.imageUrl;
                  const imageName = img.generated 
                    ? img.generated.filename 
                    : img.shot?.name || "Sans nom";
                  const cameraAngle = img.generated?.cameraAngle || img.variation?.cameraAngle;

                  return (
                    <div
                      key={imageId}
                      className={cn(
                        "flex items-center gap-4 p-3 bg-[#14131a] rounded-lg border-2 transition-all cursor-pointer",
                        selectedImages.has(imageId)
                          ? "border-crimson-500 ring-2 ring-crimson-500/50"
                          : "border-blood-900/30 hover:border-blood-700/50"
                      )}
                      onClick={() => toggleSelection(imageId)}
                    >
                      {/* Selection */}
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          selectedImages.has(imageId)
                            ? "bg-crimson-500 border-crimson-500"
                            : "bg-zinc-800 border-zinc-600"
                        )}
                      >
                        {selectedImages.has(imageId) && <Check className="h-4 w-4 text-white" />}
                      </div>

                      {/* Thumbnail */}
                      <div className="w-24 h-14 rounded overflow-hidden flex-shrink-0 bg-black">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={imageName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-zinc-700" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <ImageTypeBadge type={img.generated?.type || "variation"} />
                          {cameraAngle && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-amber-500/10 text-amber-300 border-amber-500/30"
                            >
                              {getCameraAngleLabel(cameraAngle)}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-white truncate">
                          {imageName}
                        </h3>
                        <p className="text-sm text-zinc-400 truncate">
                          {img.actTitle} • {img.generated ? formatFileSize(img.generated.size) : ""}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(img.generated ? { generated: img.generated } : { shot: img.shot, variation: img.variation });
                          }}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        {imageUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(imageUrl, imageName.replace(/\.png$/, ""));
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl bg-[#0b0b0e] border-blood-900/30">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedImage.generated ? (
                    <>
                      <Badge
                        className={selectedImage.generated.type === "legacy" 
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        }
                      >
                        {selectedImage.generated.type === "legacy" ? "Legacy" : "Variation"}
                      </Badge>
                      <span className="text-white">{selectedImage.generated.filename}</span>
                      {selectedImage.generated.cameraAngle && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-300 border-amber-500/30"
                        >
                          {getCameraAngleLabel(selectedImage.generated.cameraAngle)}
                        </Badge>
                      )}
                    </>
                  ) : selectedImage.shot && selectedImage.variation ? (
                    <>
                      <Badge
                        variant="outline"
                        className="bg-blood-500/10 text-blood-300 border-blood-500/30"
                      >
                        Shot {selectedImage.shot.number}
                      </Badge>
                      <span className="text-white">{selectedImage.shot.name}</span>
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-300 border-amber-500/30"
                      >
                        {getCameraAngleLabel(selectedImage.variation.cameraAngle || "")}
                      </Badge>
                    </>
                  ) : null}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Full image */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {(selectedImage.generated?.url || selectedImage.variation?.imageUrl) ? (
                    <img
                      src={selectedImage.generated?.url || selectedImage.variation?.imageUrl}
                      alt={selectedImage.generated?.filename || selectedImage.shot?.name || "Image"}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-zinc-700" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedImage.generated ? (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-1">
                          Fichier
                        </h4>
                        <p className="text-white text-sm">
                          {selectedImage.generated.filename}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-1">
                          Taille
                        </h4>
                        <p className="text-white">{formatFileSize(selectedImage.generated.size)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-1">
                          Shot ID
                        </h4>
                        <p className="text-white">{selectedImage.generated.shotId || "N/A"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-1">
                          Créé le
                        </h4>
                        <p className="text-white">
                          {new Date(selectedImage.generated.createdAt).toLocaleString("fr-FR")}
                        </p>
                      </div>
                    </>
                  ) : selectedImage.shot ? (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-1">
                          Description
                        </h4>
                        <p className="text-white text-sm">
                          {selectedImage.shot.description}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-1">
                          Type de scène
                        </h4>
                        <p className="text-white">{selectedImage.shot.sceneType}</p>
                      </div>
                    </>
                  ) : null}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(selectedImage.generated?.url || selectedImage.variation?.imageUrl, "_blank")
                    }
                  >
                    Ouvrir en plein écran
                  </Button>
                  {(selectedImage.generated?.url || selectedImage.variation?.imageUrl) && (
                    <Button
                      onClick={() => {
                        const url = selectedImage.generated?.url || selectedImage.variation?.imageUrl;
                        const name = selectedImage.generated?.filename || 
                          `ep${episode?.number}-shot${selectedImage.shot?.number}-${selectedImage.variation?.cameraAngle}`;
                        if (url) downloadImage(url, name.replace(/\.png$/, ""));
                      }}
                      className="bg-crimson-600 hover:bg-crimson-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger PNG
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
