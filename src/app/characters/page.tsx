"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  X,
  Heart,
  Users,
  MapPin,
  Zap,
  AlertTriangle,
  Sparkles,
  Quote,
  ChevronRight,
  ZoomIn,
  ExternalLink,
} from "lucide-react";
import type { Character, Episode, Location, RelationshipType } from "@/types/moostik";

// Labels et icônes pour les types de relations
const RELATIONSHIP_LABELS: Record<RelationshipType, { label: string; icon: string; color: string }> = {
  family_parent: { label: "Parent", icon: "👨‍👩‍👧", color: "text-pink-400" },
  family_child: { label: "Enfant", icon: "👶", color: "text-pink-400" },
  family_sibling: { label: "Même personne", icon: "🔄", color: "text-blue-400" },
  romantic: { label: "Romance", icon: "💕", color: "text-red-400" },
  best_friend: { label: "Meilleur ami", icon: "🤝", color: "text-green-400" },
  ally: { label: "Allié", icon: "🛡️", color: "text-cyan-400" },
  rival: { label: "Rival", icon: "⚔️", color: "text-orange-400" },
  enemy: { label: "Ennemi", icon: "💀", color: "text-red-600" },
  mentor: { label: "Mentor", icon: "🎓", color: "text-purple-400" },
  student: { label: "Élève", icon: "📚", color: "text-purple-300" },
  colleague: { label: "Collègue", icon: "🤜🤛", color: "text-gray-400" },
  sidekick: { label: "Sidekick", icon: "🐾", color: "text-amber-400" },
};

const ROLE_COLORS: Record<string, string> = {
  protagonist: "bg-red-600 text-white",
  antagonist: "bg-purple-600 text-white",
  supporting: "bg-blue-600 text-white",
  background: "bg-gray-600 text-white",
};

const ROLE_LABELS: Record<string, string> = {
  protagonist: "Protagoniste",
  antagonist: "Antagoniste",
  supporting: "Secondaire",
  background: "Figurant",
};

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "moostik" | "human">("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [charsRes, locsRes, epsRes] = await Promise.all([
        fetch("/api/characters"),
        fetch("/api/locations"),
        fetch("/api/episodes"),
      ]);
      
      const [charsData, locsData, epsData] = await Promise.all([
        charsRes.json(),
        locsRes.json(),
        epsRes.json(),
      ]);
      
      setCharacters(Array.isArray(charsData) ? charsData : []);
      setLocations(Array.isArray(locsData) ? locsData : []);
      setEpisodes(Array.isArray(epsData) ? epsData : []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrage des personnages
  const filteredCharacters = characters.filter((char) => {
    const matchesSearch = 
      char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || char.type === filterType;
    return matchesSearch && matchesType;
  });

  // Grouper par rôle
  const groupedCharacters = {
    protagonist: filteredCharacters.filter((c) => c.role === "protagonist"),
    antagonist: filteredCharacters.filter((c) => c.role === "antagonist"),
    supporting: filteredCharacters.filter((c) => c.role === "supporting"),
    background: filteredCharacters.filter((c) => c.role === "background"),
  };

  // Trouver un personnage par ID
  const getCharacterById = (id: string) => characters.find((c) => c.id === id);
  
  // Trouver un lieu par ID
  const getLocationById = (id: string) => locations.find((l) => l.id === id);

  return (
    <div className="flex h-screen bg-[#0b0b0e] text-zinc-100">
      <Sidebar episodes={episodes} onCreateEpisode={() => {}} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header - MOOSTIK Bloodwings Style */}
        <header className="relative border-b border-blood-900/30 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blood-900/20 via-[#0b0b0e] to-crimson-900/10" />

          {/* Animated blood veins */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-blood-700/50 via-blood-600/30 to-transparent animate-pulse" />
            <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-blood-600/30 to-blood-700/50 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blood-500 animate-pulse" />
                <span className="text-xs text-blood-400 uppercase tracking-widest font-medium">
                  Les Bloodwings
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blood-900/50 text-blood-400 border-blood-700/50">
                  {characters.filter((c) => c.type === "moostik").length} Moostik
                </Badge>
                <Badge className="bg-purple-900/50 text-purple-400 border-purple-700/50">
                  {characters.filter((c) => c.type === "human").length} Humains
                </Badge>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight mb-2">
              <span className="bg-gradient-to-r from-blood-400 via-crimson-500 to-blood-500 bg-clip-text text-transparent">
                Personnages
              </span>
            </h1>
            <p className="text-zinc-500 max-w-xl">
              {characters.length} âmes qui portent notre vengeance. Chaque goutte de sang versée est une prière pour nos morts.
            </p>

            {/* Filtres */}
            <div className="flex items-center gap-4 mt-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Rechercher un personnage..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#14131a] border-blood-900/30 focus:border-blood-600"
                />
              </div>

              <div className="flex gap-2">
                {(["all", "moostik", "human"] as const).map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className={filterType === type ? "moostik-btn-blood text-white" : "border-blood-900/30 text-zinc-400 hover:text-white hover:border-blood-600"}
                  >
                    {type === "all" ? "Tous" : type === "moostik" ? "🦟 Moostik" : "👤 Humains"}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Grille de personnages */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-12 h-12 border-2 border-blood-900 border-t-blood-500 rounded-full animate-spin" />
              <p className="text-zinc-500 text-sm">Les esprits consultent les archives...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedCharacters).map(([role, chars]) => (
                chars.length > 0 && (
                  <section key={role}>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Badge className={ROLE_COLORS[role]}>{ROLE_LABELS[role]}</Badge>
                      <span className="text-zinc-500">({chars.length})</span>
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {chars.map((char) => (
                        <div
                          key={char.id}
                          onClick={() => setSelectedCharacter(char)}
                          className="group relative bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden cursor-pointer hover:border-red-600/50 hover:shadow-lg hover:shadow-red-900/20 transition-all"
                        >
                          {/* Image */}
                          <div className="aspect-square relative bg-zinc-800">
                            {char.referenceImages && char.referenceImages.length > 0 ? (
                              <img
                                src={char.referenceImages[0]}
                                alt={char.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                <Users className="h-16 w-16" />
                              </div>
                            )}
                            
                            {/* Overlay au hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-2 right-2">
                                <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                  <ZoomIn className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Badge type */}
                            <Badge 
                              className={`absolute top-2 left-2 ${
                                char.type === "moostik" ? "bg-red-900/80" : "bg-purple-900/80"
                              }`}
                            >
                              {char.type === "moostik" ? "🦟" : "👤"}
                            </Badge>
                          </div>
                          
                          {/* Info */}
                          <div className="p-3">
                            <h3 className="font-medium text-white truncate">{char.name}</h3>
                            {char.title && (
                              <p className="text-xs text-red-400 truncate">{char.title}</p>
                            )}
                            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                              {char.description}
                            </p>
                            
                            {/* Relations count */}
                            {char.relationships && char.relationships.length > 0 && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-zinc-400">
                                <Heart className="h-3 w-3" />
                                <span>{char.relationships.length} relations</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Fiche Personnage */}
      <Dialog open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-zinc-950 border-zinc-800 p-0 overflow-hidden">
          {selectedCharacter && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header avec image */}
              <div className="relative h-64 bg-zinc-900 flex-shrink-0">
                {selectedCharacter.referenceImages && selectedCharacter.referenceImages.length > 0 ? (
                  <>
                    <img
                      src={selectedCharacter.referenceImages[0]}
                      alt={selectedCharacter.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setZoomedImage(selectedCharacter.referenceImages![0])}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-4 right-4"
                      onClick={() => setZoomedImage(selectedCharacter.referenceImages![0])}
                    >
                      <ZoomIn className="h-4 w-4 mr-2" />
                      Agrandir
                    </Button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <Users className="h-24 w-24" />
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                
                {/* Info sur l'image */}
                <div className="absolute bottom-4 left-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={ROLE_COLORS[selectedCharacter.role]}>
                      {ROLE_LABELS[selectedCharacter.role]}
                    </Badge>
                    <Badge variant="outline" className={selectedCharacter.type === "moostik" ? "border-red-600" : "border-purple-600"}>
                      {selectedCharacter.type === "moostik" ? "🦟 Moostik" : "👤 Humain"}
                    </Badge>
                    {selectedCharacter.age && (
                      <Badge variant="outline" className="border-zinc-600">
                        {selectedCharacter.age}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-white">{selectedCharacter.name}</h2>
                  {selectedCharacter.title && (
                    <p className="text-red-400 text-lg">{selectedCharacter.title}</p>
                  )}
                </div>
                
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 text-zinc-400 hover:text-white"
                  onClick={() => setSelectedCharacter(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Contenu scrollable */}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-zinc-900 border-zinc-800">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-red-900">
                        Vue d&apos;ensemble
                      </TabsTrigger>
                      <TabsTrigger value="relations" className="data-[state=active]:bg-red-900">
                        Relations
                      </TabsTrigger>
                      <TabsTrigger value="details" className="data-[state=active]:bg-red-900">
                        Détails
                      </TabsTrigger>
                      <TabsTrigger value="visual" className="data-[state=active]:bg-red-900">
                        Visuel
                      </TabsTrigger>
                    </TabsList>

                    {/* Tab Overview */}
                    <TabsContent value="overview" className="space-y-6">
                      {/* Description */}
                      <div>
                        <h3 className="text-sm font-medium text-zinc-400 mb-2">Description</h3>
                        <p className="text-zinc-200">{selectedCharacter.description}</p>
                      </div>

                      {/* Backstory */}
                      <div>
                        <h3 className="text-sm font-medium text-zinc-400 mb-2">Histoire</h3>
                        <p className="text-zinc-300">{selectedCharacter.backstory}</p>
                      </div>

                      {/* Personnalité */}
                      <div>
                        <h3 className="text-sm font-medium text-zinc-400 mb-2">Personnalité</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedCharacter.personality.map((trait, i) => (
                            <Badge key={i} variant="outline" className="border-zinc-700">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Grille Forces/Faiblesses/Quirks */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Forces */}
                        {selectedCharacter.strengths && selectedCharacter.strengths.length > 0 && (
                          <div className="bg-green-950/30 border border-green-800/50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Forces
                            </h4>
                            <ul className="space-y-1 text-sm text-zinc-300">
                              {selectedCharacter.strengths.map((s, i) => (
                                <li key={i}>• {s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Faiblesses */}
                        {selectedCharacter.weaknesses && selectedCharacter.weaknesses.length > 0 && (
                          <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Faiblesses
                            </h4>
                            <ul className="space-y-1 text-sm text-zinc-300">
                              {selectedCharacter.weaknesses.map((w, i) => (
                                <li key={i}>• {w}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Quirks */}
                        {selectedCharacter.quirks && selectedCharacter.quirks.length > 0 && (
                          <div className="bg-purple-950/30 border border-purple-800/50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-purple-400 mb-2 flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Particularités
                            </h4>
                            <ul className="space-y-1 text-sm text-zinc-300">
                              {selectedCharacter.quirks.map((q, i) => (
                                <li key={i}>• {q}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Citations */}
                      {selectedCharacter.quotes && selectedCharacter.quotes.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                            <Quote className="h-4 w-4" />
                            Citations
                          </h3>
                          <div className="space-y-2">
                            {selectedCharacter.quotes.map((quote, i) => (
                              <blockquote
                                key={i}
                                className="border-l-2 border-red-600 pl-4 py-1 text-zinc-300 italic"
                              >
                                &quot;{quote}&quot;
                              </blockquote>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* Tab Relations */}
                    <TabsContent value="relations" className="space-y-6">
                      {selectedCharacter.relationships && selectedCharacter.relationships.length > 0 ? (
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Relations ({selectedCharacter.relationships.length})
                          </h3>
                          
                          {selectedCharacter.relationships.map((rel, i) => {
                            const targetChar = getCharacterById(rel.targetId);
                            const relInfo = RELATIONSHIP_LABELS[rel.type];
                            
                            return (
                              <div
                                key={i}
                                onClick={() => targetChar && setSelectedCharacter(targetChar)}
                                className="flex items-center gap-4 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-red-600/50 cursor-pointer transition-colors"
                              >
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                                  {targetChar?.referenceImages && targetChar.referenceImages.length > 0 ? (
                                    <img
                                      src={targetChar.referenceImages[0]}
                                      alt={targetChar.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                      <Users className="h-6 w-6" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{relInfo.icon}</span>
                                    <span className={`text-sm font-medium ${relInfo.color}`}>
                                      {relInfo.label}
                                    </span>
                                  </div>
                                  <p className="font-medium text-white truncate">
                                    {targetChar?.name || rel.targetId}
                                  </p>
                                  {rel.description && (
                                    <p className="text-xs text-zinc-500 truncate">{rel.description}</p>
                                  )}
                                </div>
                                
                                {/* Arrow */}
                                <ChevronRight className="h-5 w-5 text-zinc-600" />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-zinc-500">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Aucune relation définie</p>
                        </div>
                      )}

                      {/* Lieux préférés */}
                      {selectedCharacter.favoriteLocations && selectedCharacter.favoriteLocations.length > 0 && (
                        <div>
                          <Separator className="bg-zinc-800 my-6" />
                          <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Lieux préférés
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            {selectedCharacter.favoriteLocations.map((locId) => {
                              const location = getLocationById(locId);
                              return (
                                <div
                                  key={locId}
                                  className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800"
                                >
                                  <div className="w-10 h-10 rounded bg-zinc-800 overflow-hidden flex-shrink-0">
                                    {location?.referenceImages && location.referenceImages.length > 0 ? (
                                      <img
                                        src={location.referenceImages[0]}
                                        alt={location.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                        <MapPin className="h-4 w-4" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-white text-sm truncate">
                                      {location?.name || locId}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* Tab Détails */}
                    <TabsContent value="details" className="space-y-6">
                      {/* Traits visuels */}
                      <div>
                        <h3 className="text-sm font-medium text-zinc-400 mb-2">Traits visuels</h3>
                        <ul className="space-y-1 text-sm text-zinc-300">
                          {selectedCharacter.visualTraits.map((trait, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-500">•</span>
                              {trait}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Prompt de référence */}
                      <div>
                        <h3 className="text-sm font-medium text-zinc-400 mb-2">Prompt de référence</h3>
                        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-xs text-zinc-400 font-mono">
                          {selectedCharacter.referencePrompt}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab Visuel */}
                    <TabsContent value="visual" className="space-y-6">
                      {selectedCharacter.referenceImages && selectedCharacter.referenceImages.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {selectedCharacter.referenceImages.map((img, i) => (
                            <div
                              key={i}
                              onClick={() => setZoomedImage(img)}
                              className="relative aspect-square bg-zinc-900 rounded-lg overflow-hidden cursor-pointer group"
                            >
                              <img
                                src={img}
                                alt={`${selectedCharacter.name} ref ${i + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ZoomIn className="h-8 w-8 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-zinc-500">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Aucune image de référence</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Zoom Image */}
      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-7xl max-h-[95vh] bg-black/95 border-zinc-800 p-2">
          <DialogHeader className="sr-only">
            <DialogTitle>Image en grand</DialogTitle>
          </DialogHeader>
          {zoomedImage && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={zoomedImage}
                alt="Zoomed"
                className="max-w-full max-h-[90vh] object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-zinc-400 hover:text-white"
                onClick={() => setZoomedImage(null)}
              >
                <X className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-4 right-4"
                onClick={() => window.open(zoomedImage, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir dans un nouvel onglet
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
