"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/Sidebar";
import type { Location, Episode } from "@/types/moostik";

// Labels pour les variations d'images
const VARIATION_LABELS: Record<string, { label: string; icon: string; description: string }> = {
  establishing: { label: "Plan d'ensemble", icon: "🏛️", description: "Vue complète de l'architecture" },
  detail: { label: "Détail", icon: "🔍", description: "Textures et ornements" },
  atmosphere: { label: "Atmosphérique", icon: "🌙", description: "Ambiance nocturne bioluminescente" },
  aerial: { label: "Vue aérienne", icon: "🦅", description: "Perspective en hauteur" },
  entrance: { label: "Point d'entrée", icon: "🚪", description: "Seuil et profondeur" },
};

export default function LocationsPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "moostik_city" | "human_space">("all");

  const fetchData = useCallback(async () => {
    try {
      const [episodesRes, locationsRes] = await Promise.all([
        fetch("/api/episodes"),
        fetch("/api/locations"),
      ]);
      
      const episodesData = await episodesRes.json();
      const locationsData = await locationsRes.json();
      
      setEpisodes(Array.isArray(episodesData) ? episodesData : []);
      setLocations(Array.isArray(locationsData) ? locationsData : []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter locations
  const filteredLocations = locations.filter((loc) => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || loc.type === filterType;
    return matchesSearch && matchesType;
  });

  const moostikLocations = filteredLocations.filter(l => l.type === "moostik_city");
  const humanLocations = filteredLocations.filter(l => l.type === "human_space");

  // Extract variation type from filename
  const getVariationType = (url: string): string => {
    for (const key of Object.keys(VARIATION_LABELS)) {
      if (url.includes(key)) return key;
    }
    return "establishing";
  };

  return (
    <div className="flex h-screen bg-[#0b0b0e] text-zinc-100">
      <Sidebar episodes={episodes} onCreateEpisode={() => {}} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-blood-900/30 bg-[#0b0b0e]/95 backdrop-blur-sm">
          <div className="px-8 py-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-crimson-500 animate-pulse" />
                  <span className="text-xs text-crimson-400 uppercase tracking-widest font-medium">
                    Territoires
                  </span>
                </div>
                <h1 className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-crimson-400 via-blood-500 to-crimson-500 bg-clip-text text-transparent">
                    Nos Terres Sacrées
                  </span>
                </h1>
                <p className="text-zinc-500 mt-1">
                  {locations.length} territoires • {locations.reduce((sum, l) => sum + (l.referenceImages?.length || 0), 0)} images de référence
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className="bg-blood-900/60 text-blood-300 border-blood-700/50">
                  🏛️ {moostikLocations.length} Cités Moostik
                </Badge>
                <Badge className="bg-amber-900/60 text-amber-300 border-amber-700/50">
                  🏠 {humanLocations.length} Territoires Ennemis
                </Badge>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  placeholder="Rechercher un territoire..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#14131a] border-blood-900/30 focus:border-blood-600"
                />
              </div>
              
              <div className="flex gap-2">
                {[
                  { value: "all", label: "Tous" },
                  { value: "moostik_city", label: "Cités Moostik" },
                  { value: "human_space", label: "Territoire Ennemi" },
                ].map((filter) => (
                  <Button
                    key={filter.value}
                    variant={filterType === filter.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(filter.value as typeof filterType)}
                    className={filterType === filter.value 
                      ? "moostik-btn-blood text-white" 
                      : "border-blood-900/30 text-zinc-400 hover:text-amber-400 hover:border-blood-600/50 hover:bg-blood-900/20"
                    }
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-2 border-blood-900 border-t-blood-500 rounded-full animate-spin" />
              <p className="text-zinc-500 text-sm">Les esprits explorent les territoires...</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Moostik Cities */}
              {moostikLocations.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blood-900/50 to-crimson-900/30 flex items-center justify-center text-xl">
                      🏛️
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-zinc-100">Cités Moostik</h2>
                      <p className="text-xs text-zinc-500">Architecture Renaissance bio-organique</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {moostikLocations.map((location) => (
                      <LocationCard
                        key={location.id}
                        location={location}
                        onClick={() => setSelectedLocation(location)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Human Spaces */}
              {humanLocations.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-900/50 to-orange-900/30 flex items-center justify-center text-xl">
                      ⚠️
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-zinc-100">Territoire Ennemi</h2>
                      <p className="text-xs text-zinc-500">Danger - Zone humaine hostile</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {humanLocations.map((location) => (
                      <LocationCard
                        key={location.id}
                        location={location}
                        onClick={() => setSelectedLocation(location)}
                        variant="enemy"
                      />
                    ))}
                  </div>
                </section>
              )}

              {filteredLocations.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4 opacity-30">🗺️</div>
                  <p className="text-zinc-500">Aucun territoire ne correspond à votre recherche</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Location Detail Modal */}
      <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <DialogContent className="max-w-6xl h-[90vh] bg-[#0b0b0e] border-blood-900/30 p-0 overflow-hidden flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedLocation?.name || "Détail du lieu"}</DialogTitle>
          </DialogHeader>
          {selectedLocation && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header with main image */}
              <div className="relative h-64 flex-shrink-0 overflow-hidden">
                {selectedLocation.referenceImages && selectedLocation.referenceImages.length > 0 ? (
                  <img
                    src={selectedLocation.referenceImages[0]}
                    alt={selectedLocation.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#14131a] flex items-center justify-center">
                    <span className="text-6xl opacity-30">🏛️</span>
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-[#0b0b0e]/60 to-transparent" />
                
                {/* Title */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={selectedLocation.type === "moostik_city" 
                      ? "bg-blood-900/80 text-blood-300 border-blood-700/50" 
                      : "bg-amber-900/80 text-amber-300 border-amber-700/50"
                    }>
                      {selectedLocation.type === "moostik_city" ? "🏛️ Cité Moostik" : "⚠️ Territoire Ennemi"}
                    </Badge>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                      {selectedLocation.scale === "micro" ? "Échelle Microscopique" : "Multi-échelle"}
                    </Badge>
                  </div>
                  <h2 className="text-3xl font-bold text-white">{selectedLocation.name}</h2>
                </div>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
                  onClick={() => setSelectedLocation(null)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-8">
                  {/* Description */}
                  <div>
                    <p className="text-zinc-300 text-lg leading-relaxed">{selectedLocation.description}</p>
                  </div>

                  {/* Image Gallery */}
                  {selectedLocation.referenceImages && selectedLocation.referenceImages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                        <span className="text-blood-400">🖼️</span>
                        Galerie d&apos;Images ({selectedLocation.referenceImages.length})
                      </h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedLocation.referenceImages.map((img, i) => {
                          const variationType = getVariationType(img);
                          const varInfo = VARIATION_LABELS[variationType] || VARIATION_LABELS.establishing;
                          
                          return (
                            <div
                              key={i}
                              onClick={() => setZoomedImage(img)}
                              className="group relative aspect-video rounded-xl overflow-hidden bg-[#14131a] cursor-pointer border border-blood-900/20 hover:border-blood-600/50 transition-all"
                            >
                              <img
                                src={img}
                                alt={`${selectedLocation.name} - ${varInfo.label}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              
                              {/* Overlay on hover */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{varInfo.icon}</span>
                                    <span className="text-sm font-medium text-white">{varInfo.label}</span>
                                  </div>
                                  <p className="text-xs text-zinc-400">{varInfo.description}</p>
                                </div>
                                
                                {/* Zoom button */}
                                <div className="absolute top-3 right-3">
                                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Type badge */}
                              <Badge className="absolute top-2 left-2 bg-black/60 text-white text-[10px] border-0">
                                {varInfo.icon} {varInfo.label}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Architectural Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#14131a]/50 rounded-xl p-5 border border-blood-900/20">
                      <h3 className="text-sm font-semibold text-blood-400 mb-3 flex items-center gap-2">
                        <span>🏗️</span> Architecture
                      </h3>
                      <ul className="space-y-2">
                        {selectedLocation.architecturalFeatures.map((feature, i) => (
                          <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                            <span className="text-blood-500 mt-1">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#14131a]/50 rounded-xl p-5 border border-blood-900/20">
                      <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                        <span>✨</span> Atmosphère
                      </h3>
                      <ul className="space-y-2">
                        {selectedLocation.atmosphericElements.map((element, i) => (
                          <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                            <span className="text-amber-500 mt-1">•</span>
                            <span>{element}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Reference Prompt (collapsed) */}
                  <details className="bg-[#14131a]/30 rounded-xl border border-blood-900/20">
                    <summary className="p-4 cursor-pointer text-sm font-medium text-zinc-400 hover:text-zinc-300">
                      📝 Voir le prompt de référence
                    </summary>
                    <div className="px-4 pb-4">
                      <pre className="text-xs text-zinc-500 font-mono whitespace-pre-wrap bg-[#0b0b0e] p-4 rounded-lg">
                        {selectedLocation.referencePrompt}
                      </pre>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Zoom Modal */}
      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] bg-black/95 border-blood-900/30 p-2">
          <DialogHeader className="sr-only">
            <DialogTitle>Image en grand</DialogTitle>
          </DialogHeader>
          {zoomedImage && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={zoomedImage}
                alt="Zoomed"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
                onClick={() => setZoomedImage(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
              
              {/* Open in new tab */}
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-4 right-4 bg-white/10 hover:bg-white/20 text-white"
                onClick={() => window.open(zoomedImage, "_blank")}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ouvrir en plein écran
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Location Card Component
function LocationCard({ 
  location, 
  onClick, 
  variant = "default" 
}: { 
  location: Location; 
  onClick: () => void;
  variant?: "default" | "enemy";
}) {
  const imageCount = location.referenceImages?.length || 0;
  const hasImages = imageCount > 0;
  
  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 moostik-card-hover ${
        variant === "enemy" 
          ? "border border-amber-900/30 hover:border-amber-600/50" 
          : "border border-blood-900/30 hover:border-blood-600/50"
      }`}
    >
      {/* Image */}
      <div className="aspect-video relative bg-[#14131a]">
        {hasImages ? (
          <img
            src={location.referenceImages![0]}
            alt={location.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-20">
              {variant === "enemy" ? "⚠️" : "🏛️"}
            </span>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-[#0b0b0e]/30 to-transparent" />
        
        {/* Image count badge */}
        {hasImages && (
          <Badge className="absolute top-3 right-3 bg-black/60 text-white border-0 text-xs">
            🖼️ {imageCount} {imageCount > 1 ? "images" : "image"}
          </Badge>
        )}
        
        {/* Type indicator */}
        <div className={`absolute top-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center ${
          variant === "enemy" 
            ? "bg-amber-900/60" 
            : "bg-blood-900/60"
        }`}>
          {variant === "enemy" ? "⚠️" : "🏛️"}
        </div>
      </div>
      
      {/* Content */}
      <div className={`p-4 ${
        variant === "enemy" 
          ? "bg-gradient-to-b from-amber-950/30 to-[#14131a]" 
          : "bg-gradient-to-b from-blood-950/30 to-[#14131a]"
      }`}>
        <h3 className="font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">
          {location.name}
        </h3>
        <p className="text-xs text-zinc-500 line-clamp-2">
          {location.description}
        </p>
        
        {/* Features preview */}
        <div className="flex flex-wrap gap-1 mt-3">
          {location.architecturalFeatures.slice(0, 2).map((feature, i) => (
            <Badge 
              key={i} 
              variant="outline" 
              className={`text-[10px] ${
                variant === "enemy"
                  ? "border-amber-900/30 text-amber-400/60"
                  : "border-blood-900/30 text-blood-400/60"
              }`}
            >
              {feature.split(" ").slice(0, 2).join(" ")}
            </Badge>
          ))}
          {location.architecturalFeatures.length > 2 && (
            <Badge variant="outline" className="text-[10px] border-zinc-800 text-zinc-600">
              +{location.architecturalFeatures.length - 2}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Hover effect border */}
      <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
        variant === "enemy"
          ? "ring-1 ring-amber-500/30"
          : "ring-1 ring-blood-500/30"
      }`} />
    </div>
  );
}
