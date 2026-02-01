"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  Search,
  Grid3X3,
  LayoutList,
  Image as ImageIcon,
  User,
  MapPin,
  Film,
  ZoomIn,
  X,
  Check,
  Filter,
  Video,
  FileImage,
  FileVideo,
} from "lucide-react";

interface ImageItem {
  id: string;
  url: string;
  type: "character" | "location" | "shot";
  category: string;
  name: string;
  description?: string;
  createdAt?: string;
  episodeId?: string;
  shotId?: string;
  videoUrl?: string;
  videoStatus?: string;
}

export default function LibraryPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"name" | "type" | "date">("type");

  useEffect(() => {
    loadAllImages();
  }, []);

  const loadAllImages = async () => {
    setLoading(true);
    try {
      const allImages: ImageItem[] = [];

      // Charger les références (personnages et lieux)
      const refsResponse = await fetch("/api/references");
      const refsData = await refsResponse.json();

      // Ajouter les images de personnages
      for (const char of refsData.characters || []) {
        for (let i = 0; i < (char.referenceImages || []).length; i++) {
          allImages.push({
            id: `char-${char.id}-${i}`,
            url: char.referenceImages[i],
            type: "character",
            category: char.type === "human" ? "Humain" : "Moostik",
            name: char.name,
            description: char.description,
          });
        }
      }

      // Ajouter les images de lieux
      for (const loc of refsData.locations || []) {
        for (let i = 0; i < (loc.referenceImages || []).length; i++) {
          allImages.push({
            id: `loc-${loc.id}-${i}`,
            url: loc.referenceImages[i],
            type: "location",
            category: loc.type,
            name: loc.name,
            description: loc.description,
          });
        }
      }

      // Charger les images des épisodes (shots)
      const episodesResponse = await fetch("/api/episodes");
      const episodesData = await episodesResponse.json();

      for (const episode of episodesData || []) {
        const epResponse = await fetch(`/api/episodes/${episode.id}`);
        const epData = await epResponse.json();

        for (const shot of epData.shots || []) {
          for (const variation of shot.variations || []) {
            if (variation.imageUrl) {
              allImages.push({
                id: `shot-${episode.id}-${shot.id}-${variation.id}`,
                url: variation.imageUrl,
                type: "shot",
                category: `EP${episode.number} - ${shot.sceneType}`,
                name: `Shot ${shot.number}: ${shot.name}`,
                description: shot.description,
                episodeId: episode.id,
                shotId: shot.id,
                createdAt: variation.generatedAt,
                videoUrl: variation.videoUrl,
                videoStatus: variation.videoStatus,
              });
            }
          }
        }
      }

      setImages(allImages);
    } catch (error) {
      console.error("Erreur chargement images:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images
    .filter((img) => {
      // Filtre par type
      if (filterType !== "all" && img.type !== filterType) return false;

      // Filtre par recherche
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

  const downloadFile = async (url: string, filename: string, extension: string = "png") => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${filename}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      // Fallback: ouvrir dans un nouvel onglet
      window.open(url, "_blank");
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    await downloadFile(url, filename, "png");
  };

  const downloadVideo = async (url: string, filename: string) => {
    await downloadFile(url, filename, "mp4");
  };

  const downloadSelected = async () => {
    const selectedItems = images.filter((img) => selectedImages.has(img.id));
    for (const img of selectedItems) {
      await downloadImage(img.url, img.name.replace(/[^a-zA-Z0-9]/g, "_"));
      await new Promise((r) => setTimeout(r, 500)); // Délai entre chaque download
    }
  };

  const downloadAll = async () => {
    for (const img of filteredImages) {
      await downloadImage(img.url, img.name.replace(/[^a-zA-Z0-9]/g, "_"));
      await new Promise((r) => setTimeout(r, 500));
    }
  };

  const toggleImageSelection = (id: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedImages(newSelection);
  };

  const selectAll = () => {
    setSelectedImages(new Set(filteredImages.map((img) => img.id)));
  };

  const deselectAll = () => {
    setSelectedImages(new Set());
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "character":
        return <User className="h-4 w-4" />;
      case "location":
        return <MapPin className="h-4 w-4" />;
      case "shot":
        return <Film className="h-4 w-4" />;
      default:
        return <ImageIcon className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "character":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "location":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "shot":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const stats = {
    total: images.length,
    characters: images.filter((i) => i.type === "character").length,
    locations: images.filter((i) => i.type === "location").length,
    shots: images.filter((i) => i.type === "shot").length,
  };

  return (
    <div className="flex h-screen bg-[#0b0b0e]">
      <Sidebar episodes={[]} onCreateEpisode={() => {}} />

      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header - MOOSTIK Bloodwings Style */}
          <div className="relative p-6 border-b border-blood-900/30 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-crimson-900/15 via-[#0b0b0e] to-blood-900/10" />

            {/* Animated blood veins */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute top-0 left-1/5 w-px h-full bg-gradient-to-b from-crimson-700/50 via-blood-600/30 to-transparent animate-pulse" />
              <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blood-600/30 to-crimson-700/50 animate-pulse" style={{ animationDelay: '0.7s' }} />
            </div>

            <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-crimson-500 animate-pulse" />
                  <span className="text-xs text-crimson-400 uppercase tracking-widest font-medium">Archives</span>
                </div>
                <h1 className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-crimson-400 via-blood-500 to-crimson-500 bg-clip-text text-transparent">
                    Bibliothèque Bloodwings
                  </span>
                </h1>
                <p className="text-zinc-500 mt-1">
                  Toutes les images générées • {stats.total} images
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedImages.size > 0 && (
                  <>
                    <Badge variant="outline" className="border-red-500/50">
                      {selectedImages.size} sélectionnées
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadSelected}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger sélection
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deselectAll}
                      className="text-gray-400"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Désélectionner
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAll}
                  className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Tout télécharger ({filteredImages.length})
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <User className="h-4 w-4 text-purple-400" />
                <span className="text-purple-300 text-sm">
                  {stats.characters} personnages
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-blue-300 text-sm">
                  {stats.locations} lieux
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <Film className="h-4 w-4 text-amber-400" />
                <span className="text-amber-300 text-sm">
                  {stats.shots} shots
                </span>
              </div>
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Rechercher par nom, catégorie..."
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
                  <SelectItem value="character">Personnages</SelectItem>
                  <SelectItem value="location">Lieux</SelectItem>
                  <SelectItem value="shot">Shots</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v: "name" | "type" | "date") => setSortBy(v)}>
                <SelectTrigger className="w-40 bg-[#14131a] border-blood-900/30">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="type">Par type</SelectItem>
                  <SelectItem value="name">Par nom</SelectItem>
                  <SelectItem value="date">Par date</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border border-blood-900/30 rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "moostik-btn-blood" : ""}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "moostik-btn-blood" : ""}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
                className="text-zinc-400 hover:text-blood-400"
              >
                Sélectionner tout
              </Button>
            </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Chargement des images...</div>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
                <p>Aucune image trouvée</p>
                {searchQuery && (
                  <p className="text-sm mt-2">
                    Essayez de modifier votre recherche
                  </p>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredImages.map((img) => (
                  <div
                    key={img.id}
                    className={`group relative bg-gray-900 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImages.has(img.id)
                        ? "border-red-500 ring-2 ring-red-500/50"
                        : "border-gray-800 hover:border-gray-700"
                    }`}
                    onClick={() => toggleImageSelection(img.id)}
                  >
                    {/* Selection indicator */}
                    <div
                      className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedImages.has(img.id)
                          ? "bg-red-500 border-red-500"
                          : "bg-black/50 border-white/50 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {selectedImages.has(img.id) && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>

                    {/* Image */}
                    <div className="aspect-square relative">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Video indicator */}
                      {img.videoUrl && img.videoStatus === "completed" && (
                        <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 bg-emerald-500/90 rounded text-[10px] font-bold text-white flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          MP4
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
                              setSelectedImage(img);
                            }}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0"
                            title="Télécharger PNG"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(
                                img.url,
                                img.name.replace(/[^a-zA-Z0-9]/g, "_")
                              );
                            }}
                          >
                            <FileImage className="h-4 w-4" />
                          </Button>
                          {img.videoUrl && img.videoStatus === "completed" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700"
                              title="Télécharger MP4"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadVideo(
                                  img.videoUrl!,
                                  img.name.replace(/[^a-zA-Z0-9]/g, "_")
                                );
                              }}
                            >
                              <FileVideo className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getTypeBadgeColor(img.type)}`}
                        >
                          {getTypeIcon(img.type)}
                          <span className="ml-1">
                            {img.type === "character"
                              ? "Perso"
                              : img.type === "location"
                                ? "Lieu"
                                : "Shot"}
                          </span>
                        </Badge>
                      </div>
                      <h3 className="text-sm font-medium text-white truncate">
                        {img.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {img.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredImages.map((img) => (
                  <div
                    key={img.id}
                    className={`flex items-center gap-4 p-3 bg-gray-900 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedImages.has(img.id)
                        ? "border-red-500 ring-2 ring-red-500/50"
                        : "border-gray-800 hover:border-gray-700"
                    }`}
                    onClick={() => toggleImageSelection(img.id)}
                  >
                    {/* Selection */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedImages.has(img.id)
                          ? "bg-red-500 border-red-500"
                          : "bg-gray-800 border-gray-600"
                      }`}
                    >
                      {selectedImages.has(img.id) && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getTypeBadgeColor(img.type)}`}
                        >
                          {getTypeIcon(img.type)}
                          <span className="ml-1">
                            {img.type === "character"
                              ? "Personnage"
                              : img.type === "location"
                                ? "Lieu"
                                : "Shot"}
                          </span>
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {img.category}
                        </span>
                      </div>
                      <h3 className="font-medium text-white truncate">
                        {img.name}
                      </h3>
                      {img.description && (
                        <p className="text-sm text-gray-400 truncate">
                          {img.description}
                        </p>
                      )}
                    </div>

                    {/* Video indicator */}
                    {img.videoUrl && img.videoStatus === "completed" && (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex-shrink-0">
                        <Video className="h-3 w-3 mr-1" />
                        MP4
                      </Badge>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Aperçu"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(img);
                        }}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Télécharger PNG"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(
                            img.url,
                            img.name.replace(/[^a-zA-Z0-9]/g, "_")
                          );
                        }}
                      >
                        <FileImage className="h-4 w-4" />
                      </Button>
                      {img.videoUrl && img.videoStatus === "completed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-400 hover:text-emerald-300"
                          title="Télécharger MP4"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadVideo(
                              img.videoUrl!,
                              img.name.replace(/[^a-zA-Z0-9]/g, "_")
                            );
                          }}
                        >
                          <FileVideo className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
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
        <DialogContent className="max-w-4xl bg-gray-950 border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={getTypeBadgeColor(selectedImage?.type || "")}
              >
                {getTypeIcon(selectedImage?.type || "")}
                <span className="ml-1">
                  {selectedImage?.type === "character"
                    ? "Personnage"
                    : selectedImage?.type === "location"
                      ? "Lieu"
                      : "Shot"}
                </span>
              </Badge>
              <span>{selectedImage?.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Full image */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {selectedImage && (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">
                  Catégorie
                </h4>
                <p className="text-white">{selectedImage?.category}</p>
              </div>
              {selectedImage?.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Description
                  </h4>
                  <p className="text-white text-sm">
                    {selectedImage.description}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-800">
              {/* Format download section */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Formats disponibles:
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-crimson-500/10 text-crimson-300 border-crimson-500/30">
                    <FileImage className="h-3 w-3 mr-1" />
                    PNG
                  </Badge>
                  {selectedImage?.videoUrl && selectedImage?.videoStatus === "completed" && (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                      <FileVideo className="h-3 w-3 mr-1" />
                      MP4
                    </Badge>
                  )}
                </div>
              </div>

              {/* Download buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedImage?.url, "_blank")}
                >
                  Ouvrir en plein écran
                </Button>
                <Button
                  onClick={() =>
                    selectedImage &&
                    downloadImage(
                      selectedImage.url,
                      selectedImage.name.replace(/[^a-zA-Z0-9]/g, "_")
                    )
                  }
                  className="bg-crimson-600 hover:bg-crimson-700"
                >
                  <FileImage className="h-4 w-4 mr-2" />
                  Télécharger PNG
                </Button>
                {selectedImage?.videoUrl && selectedImage?.videoStatus === "completed" && (
                  <Button
                    onClick={() =>
                      selectedImage &&
                      downloadVideo(
                        selectedImage.videoUrl!,
                        selectedImage.name.replace(/[^a-zA-Z0-9]/g, "_")
                      )
                    }
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <FileVideo className="h-4 w-4 mr-2" />
                    Télécharger MP4
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
