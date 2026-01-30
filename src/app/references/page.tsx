"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/Sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Character, Location, Episode } from "@/types/moostik";

interface ReferenceStats {
  totalCharacters: number;
  charactersWithRefs: number;
  validatedCharacters: number;
  totalLocations: number;
  locationsWithRefs: number;
  validatedLocations: number;
}

export default function ReferencesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [stats, setStats] = useState<ReferenceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "character" | "location";
    id: string;
    imageIndex: number;
  } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [episodesRes, refsRes] = await Promise.all([
        fetch("/api/episodes"),
        fetch("/api/references"),
      ]);

      const episodesData = await episodesRes.json();
      const refsData = await refsRes.json();

      setEpisodes(Array.isArray(episodesData) ? episodesData : []);
      setCharacters(refsData.characters || []);
      setLocations(refsData.locations || []);
      setStats(refsData.stats || null);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateReference = async (type: "character" | "location", id: string) => {
    setGenerating(id);
    try {
      const res = await fetch("/api/references/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });

      if (res.ok) {
        await fetchData();
        // Update the selected item if it's open
        if (type === "character" && selectedCharacter?.id === id) {
          const updated = characters.find((c) => c.id === id);
          if (updated) setSelectedCharacter(updated);
        }
        if (type === "location" && selectedLocation?.id === id) {
          const updated = locations.find((l) => l.id === id);
          if (updated) setSelectedLocation(updated);
        }
      }
    } catch (error) {
      console.error("Failed to generate reference:", error);
    } finally {
      setGenerating(null);
    }
  };

  const toggleValidation = async (type: "character" | "location", id: string, validated: boolean) => {
    try {
      await fetch("/api/references", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validate", type, id, validated }),
      });
      await fetchData();
    } catch (error) {
      console.error("Failed to toggle validation:", error);
    }
  };

  const deleteImage = async () => {
    if (!deleteConfirm) return;

    try {
      await fetch("/api/references", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_image",
          type: deleteConfirm.type,
          id: deleteConfirm.id,
          imageIndex: deleteConfirm.imageIndex,
        }),
      });
      await fetchData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  const moostikCharacters = characters.filter((c) => c.type === "moostik");
  const humanCharacters = characters.filter((c) => c.type === "human");
  const moostikLocations = locations.filter((l) => l.type === "moostik_city");
  const humanLocations = locations.filter((l) => l.type === "human_space" || l.type === "natural" || l.type === "hybrid");

  return (
    <div className="flex h-screen bg-[#0b0b0e] text-zinc-100">
      <Sidebar episodes={episodes} onCreateEpisode={() => {}} />

      <main className="flex-1 overflow-auto">
        {/* Header - MOOSTIK Bloodwings Style */}
        <header className="sticky top-0 z-40 relative border-b border-blood-900/30 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/15 via-[#0b0b0e] to-blood-900/10" />

          {/* Animated blood veins */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-0 left-1/5 w-px h-full bg-gradient-to-b from-amber-700/50 via-blood-600/30 to-transparent animate-pulse" />
            <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blood-600/30 to-amber-700/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          <div className="relative px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs text-amber-400 uppercase tracking-widest font-medium">Galerie des Âmes</span>
                </div>
                <h1 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-amber-400 via-blood-500 to-amber-500 bg-clip-text text-transparent">
                    Images de Référence
                  </span>
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                  Générez et validez les images de référence pour garantir la cohérence visuelle
                </p>
              </div>
              {stats && (
                <div className="flex items-center gap-4">
                  <div className="text-center px-3 py-2 bg-blood-900/20 rounded-lg border border-blood-800/30">
                    <p className="text-2xl font-bold text-blood-400">
                      {stats.charactersWithRefs}/{stats.totalCharacters}
                    </p>
                    <p className="text-xs text-zinc-500">Personnages</p>
                  </div>
                  <div className="text-center px-3 py-2 bg-amber-900/20 rounded-lg border border-amber-800/30">
                    <p className="text-2xl font-bold text-amber-400">
                      {stats.locationsWithRefs}/{stats.totalLocations}
                    </p>
                    <p className="text-xs text-zinc-500">Lieux</p>
                  </div>
                  <div className="text-center px-3 py-2 bg-emerald-900/20 rounded-lg border border-emerald-800/30">
                    <p className="text-2xl font-bold text-emerald-400">
                      {stats.validatedCharacters + stats.validatedLocations}
                    </p>
                    <p className="text-xs text-zinc-500">Validées</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Info Banner */}
        <div className="mx-6 mt-4 p-4 bg-blood-900/15 border border-blood-800/30 rounded-lg">
          <p className="text-sm text-blood-300">
            <strong>Comment utiliser:</strong> Générez des images de référence pour chaque personnage et lieu.
            Ces références seront automatiquement injectées lors de la génération des shots pour maintenir
            la cohérence visuelle. Nano Banana Pro supporte jusqu&apos;à 14 images de référence simultanées.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-2 border-blood-900 border-t-blood-500 rounded-full animate-spin" />
              <p className="text-zinc-500 text-sm">Les esprits consultent les archives...</p>
            </div>
          ) : (
            <Tabs defaultValue="characters" className="space-y-6">
              <TabsList className="bg-[#14131a] border-blood-900/30">
                <TabsTrigger value="characters" className="data-[state=active]:bg-blood-900/50 data-[state=active]:text-blood-300">
                  🦟 Personnages ({characters.length})
                </TabsTrigger>
                <TabsTrigger value="locations" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-300">
                  🏛️ Lieux ({locations.length})
                </TabsTrigger>
              </TabsList>

              {/* Characters Tab */}
              <TabsContent value="characters" className="space-y-6">
                {/* Moostik Characters */}
                <div>
                  <h3 className="text-lg font-medium text-zinc-300 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🦟</span> Personnages Moostik
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {moostikCharacters.map((character) => (
                      <ReferenceCard
                        key={character.id}
                        type="character"
                        item={character}
                        referenceImages={character.referenceImages}
                        validated={character.validated}
                        isGenerating={generating === character.id}
                        onGenerate={() => generateReference("character", character.id)}
                        onViewDetails={() => setSelectedCharacter(character)}
                        onToggleValidation={(v) => toggleValidation("character", character.id, v)}
                      />
                    ))}
                  </div>
                </div>

                {/* Human Characters */}
                <div>
                  <h3 className="text-lg font-medium text-zinc-300 mb-4 flex items-center gap-2">
                    <span className="text-2xl">👶🏿</span> Personnages Humains
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {humanCharacters.map((character) => (
                      <ReferenceCard
                        key={character.id}
                        type="character"
                        item={character}
                        referenceImages={character.referenceImages}
                        validated={character.validated}
                        isGenerating={generating === character.id}
                        onGenerate={() => generateReference("character", character.id)}
                        onViewDetails={() => setSelectedCharacter(character)}
                        onToggleValidation={(v) => toggleValidation("character", character.id, v)}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Locations Tab */}
              <TabsContent value="locations" className="space-y-6">
                {/* Moostik Locations */}
                <div>
                  <h3 className="text-lg font-medium text-zinc-300 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🏛️</span> Cites Moostik
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {moostikLocations.map((location) => (
                      <ReferenceCard
                        key={location.id}
                        type="location"
                        item={location}
                        referenceImages={location.referenceImages}
                        validated={location.validated}
                        isGenerating={generating === location.id}
                        onGenerate={() => generateReference("location", location.id)}
                        onViewDetails={() => setSelectedLocation(location)}
                        onToggleValidation={(v) => toggleValidation("location", location.id, v)}
                      />
                    ))}
                  </div>
                </div>

                {/* Human Locations */}
                <div>
                  <h3 className="text-lg font-medium text-zinc-300 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🏠</span> Espaces Humains
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {humanLocations.map((location) => (
                      <ReferenceCard
                        key={location.id}
                        type="location"
                        item={location}
                        referenceImages={location.referenceImages}
                        validated={location.validated}
                        isGenerating={generating === location.id}
                        onGenerate={() => generateReference("location", location.id)}
                        onViewDetails={() => setSelectedLocation(location)}
                        onToggleValidation={(v) => toggleValidation("location", location.id, v)}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      {/* Character Detail Sheet */}
      <Sheet open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
        <SheetContent side="right" className="w-[600px] bg-zinc-950 border-zinc-800 p-0">
          {selectedCharacter && (
            <>
              <SheetHeader className="p-6 border-b border-zinc-800">
                <SheetTitle className="text-xl text-zinc-100">
                  {selectedCharacter.name}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2 mt-2">
                  <Badge className={selectedCharacter.validated ? "bg-green-900 text-green-300" : "bg-zinc-800 text-zinc-400"}>
                    {selectedCharacter.validated ? "Valide" : "Non valide"}
                  </Badge>
                  <Badge variant="outline" className="border-zinc-700">
                    {selectedCharacter.referenceImages?.length || 0} reference(s)
                  </Badge>
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1" style={{ height: "calc(100vh - 180px)" }}>
                <div className="p-6 space-y-6">
                  {/* Reference Images Grid */}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-300 mb-3">Images de Reference</h3>
                    {selectedCharacter.referenceImages && selectedCharacter.referenceImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedCharacter.referenceImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <Image
                              src={img}
                              alt={`Reference ${idx + 1}`}
                              width={200}
                              height={200}
                              className="w-full aspect-square object-cover rounded-lg border border-zinc-800"
                              unoptimized
                            />
                            <button
                              onClick={() => setDeleteConfirm({ type: "character", id: selectedCharacter.id, imageIndex: idx })}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-900/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="text-white text-xs">✕</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800">
                        <p className="text-zinc-500">Aucune reference generee</p>
                      </div>
                    )}
                  </div>

                  {/* Reference Prompt */}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-300 mb-2">Prompt de Reference</h3>
                    <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                      <p className="text-xs text-zinc-400 font-mono whitespace-pre-wrap">
                        {selectedCharacter.referencePrompt}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => generateReference("character", selectedCharacter.id)}
                      disabled={generating === selectedCharacter.id}
                      className="flex-1 bg-red-900 hover:bg-red-800"
                    >
                      {generating === selectedCharacter.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Generation...
                        </>
                      ) : (
                        "Generer Reference"
                      )}
                    </Button>
                    <Button
                      onClick={() => toggleValidation("character", selectedCharacter.id, !selectedCharacter.validated)}
                      variant={selectedCharacter.validated ? "destructive" : "default"}
                      className={selectedCharacter.validated ? "" : "bg-green-900 hover:bg-green-800"}
                    >
                      {selectedCharacter.validated ? "Invalider" : "Valider"}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Location Detail Sheet */}
      <Sheet open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <SheetContent side="right" className="w-[600px] bg-zinc-950 border-zinc-800 p-0">
          {selectedLocation && (
            <>
              <SheetHeader className="p-6 border-b border-zinc-800">
                <SheetTitle className="text-xl text-zinc-100">
                  {selectedLocation.name}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2 mt-2">
                  <Badge className={selectedLocation.validated ? "bg-green-900 text-green-300" : "bg-zinc-800 text-zinc-400"}>
                    {selectedLocation.validated ? "Valide" : "Non valide"}
                  </Badge>
                  <Badge variant="outline" className="border-zinc-700">
                    {selectedLocation.referenceImages?.length || 0} reference(s)
                  </Badge>
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1" style={{ height: "calc(100vh - 180px)" }}>
                <div className="p-6 space-y-6">
                  {/* Reference Images */}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-300 mb-3">Images de Reference</h3>
                    {selectedLocation.referenceImages && selectedLocation.referenceImages.length > 0 ? (
                      <div className="space-y-3">
                        {selectedLocation.referenceImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <Image
                              src={img}
                              alt={`Reference ${idx + 1}`}
                              width={500}
                              height={281}
                              className="w-full aspect-video object-cover rounded-lg border border-zinc-800"
                              unoptimized
                            />
                            <button
                              onClick={() => setDeleteConfirm({ type: "location", id: selectedLocation.id, imageIndex: idx })}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-900/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="text-white text-xs">✕</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800">
                        <p className="text-zinc-500">Aucune reference generee</p>
                      </div>
                    )}
                  </div>

                  {/* Reference Prompt */}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-300 mb-2">Prompt de Reference</h3>
                    <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                      <p className="text-xs text-zinc-400 font-mono whitespace-pre-wrap">
                        {selectedLocation.referencePrompt}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => generateReference("location", selectedLocation.id)}
                      disabled={generating === selectedLocation.id}
                      className="flex-1 bg-amber-900 hover:bg-amber-800"
                    >
                      {generating === selectedLocation.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Generation...
                        </>
                      ) : (
                        "Generer Reference"
                      )}
                    </Button>
                    <Button
                      onClick={() => toggleValidation("location", selectedLocation.id, !selectedLocation.validated)}
                      variant={selectedLocation.validated ? "destructive" : "default"}
                      className={selectedLocation.validated ? "" : "bg-green-900 hover:bg-green-800"}
                    >
                      {selectedLocation.validated ? "Invalider" : "Valider"}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette reference?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. L&apos;image de reference sera supprimee definitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteImage} className="bg-red-900 hover:bg-red-800">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Reference Card Component
interface ReferenceCardProps {
  type: "character" | "location";
  item: Character | Location;
  referenceImages?: string[];
  validated?: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  onViewDetails: () => void;
  onToggleValidation: (validated: boolean) => void;
}

function ReferenceCard({
  type,
  item,
  referenceImages,
  validated,
  isGenerating,
  onGenerate,
  onViewDetails,
  onToggleValidation,
}: ReferenceCardProps) {
  const hasReferences = referenceImages && referenceImages.length > 0;
  const accentColor = type === "character" ? "red" : "amber";

  return (
    <Card
      className={`bg-zinc-900/50 border-zinc-800 hover:border-${accentColor}-900/50 transition-all cursor-pointer group`}
      onClick={onViewDetails}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={`text-lg group-hover:text-${accentColor}-400 transition-colors`}>
              {item.name}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              {validated ? (
                <Badge className="bg-green-900 text-green-300 text-xs">Validee</Badge>
              ) : (
                <Badge className="bg-zinc-800 text-zinc-400 text-xs">Non validee</Badge>
              )}
              <Badge variant="outline" className="text-xs border-zinc-700">
                {referenceImages?.length || 0} ref
              </Badge>
            </div>
          </div>
          <div className="w-16 h-16 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
            {hasReferences ? (
              <Image
                src={referenceImages[0]}
                alt={item.name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <span className="text-2xl">
                {type === "character" ? "👤" : "🏙️"}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
          {item.description}
        </p>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            onClick={onGenerate}
            disabled={isGenerating}
            className={`flex-1 bg-${accentColor}-900 hover:bg-${accentColor}-800`}
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Generer"
            )}
          </Button>
          {hasReferences && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggleValidation(!validated)}
              className={validated ? "border-green-800 text-green-400" : "border-zinc-700"}
            >
              {validated ? "✓" : "○"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
