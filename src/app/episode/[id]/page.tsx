"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/Sidebar";
import { ShotCard } from "@/components/ShotCard";
import { ShotEditor } from "@/components/ShotEditor";
import { VariationGrid } from "@/components/VariationGrid";
import { GenerationProgress, StatsBar } from "@/components/GenerationProgress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/LoadingState";
import { useMoostik } from "@/contexts/MoostikContext";
import type { Episode, Shot, Variation, ShotStatus, VariationStatus, SceneCluster, GenerationReadinessCheck, Act } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function EpisodePage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;

  const { episodes, refreshEpisodes } = useMoostik();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [viewingShot, setViewingShot] = useState<Shot | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newShotName, setNewShotName] = useState("");
  const [newShotDescription, setNewShotDescription] = useState("");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    currentShot: "",
    currentVariation: "",
    completed: 0,
    total: 0,
    errors: 0,
  });

  // Cluster and readiness state
  const [clusters, setClusters] = useState<SceneCluster[]>([]);
  const [readiness, setReadiness] = useState<GenerationReadinessCheck | null>(null);
  const [showClusters, setShowClusters] = useState(false);

  const fetchEpisode = useCallback(async () => {
    try {
      const res = await fetch(`/api/episodes/${episodeId}`);
      if (res.ok) {
        const data = await res.json();
        setEpisode(data);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to fetch episode:", error);
    } finally {
      setLoading(false);
    }
  }, [episodeId, router]);

  useEffect(() => {
    fetchEpisode();
  }, [fetchEpisode]);

  // Fetch clusters and readiness when episode changes
  useEffect(() => {
    if (episode && episode.shots.length > 0) {
      fetchClustersAndReadiness();
    }
  }, [episode?.id, episode?.shots.length]);

  const fetchClustersAndReadiness = async () => {
    if (!episode) return;
    
    try {
      // Fetch readiness check
      const readinessRes = await fetch(`/api/generate/check-readiness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          episodeId,
          shotIds: episode.shots.map(s => s.id)
        }),
      });
      
      if (readinessRes.ok) {
        const readinessData = await readinessRes.json();
        setReadiness(readinessData);
      }

      // Fetch clusters
      const clustersRes = await fetch(`/api/episodes/${episodeId}/clusters`);
      if (clustersRes.ok) {
        const clustersData = await clustersRes.json();
        setClusters(clustersData.clusters || []);
      }
    } catch (error) {
      console.error("Failed to fetch clusters/readiness:", error);
    }
  };

  const addShot = async () => {
    if (!newShotName.trim()) return;

    try {
      const res = await fetch(`/api/episodes/${episodeId}/shots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newShotName,
          description: newShotDescription 
        }),
      });

      if (res.ok) {
        setShowAddDialog(false);
        setNewShotName("");
        setNewShotDescription("");
        fetchEpisode();
      }
    } catch (error) {
      console.error("Failed to add shot:", error);
    }
  };

  const saveShot = async (shot: Shot) => {
    try {
      await fetch(`/api/episodes/${episodeId}/shots/${shot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: shot.name,
          description: shot.description,
          prompt: shot.prompt,
          sceneType: shot.sceneType,
        }),
      });
      setEditingShot(null);
      fetchEpisode();
    } catch (error) {
      console.error("Failed to save shot:", error);
    }
  };

  const deleteShot = async (shot: Shot) => {
    if (!confirm(`Supprimer le shot "${shot.name}" et toutes ses variations ?`)) return;

    try {
      await fetch(`/api/episodes/${episodeId}/shots/${shot.id}`, {
        method: "DELETE",
      });
      fetchEpisode();
    } catch (error) {
      console.error("Failed to delete shot:", error);
    }
  };

  const duplicateShot = async (shot: Shot) => {
    try {
      await fetch(`/api/episodes/${episodeId}/shots/${shot.id}/duplicate`, {
        method: "POST",
      });
      fetchEpisode();
    } catch (error) {
      console.error("Failed to duplicate shot:", error);
    }
  };

  // Generate all variations for a single shot
  const generateShotVariations = async (shot: Shot) => {
    setIsGenerating(true);
    const pendingCount = shot.variations.filter(
      (v) => v.status === "pending" || v.status === "failed"
    ).length;

    setGenerationProgress({
      currentShot: shot.name,
      currentVariation: "",
      completed: 0,
      total: pendingCount,
      errors: 0,
    });

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId,
          shotId: shot.id,
          prompt: shot.prompt,
          mode: "all_variations",
        }),
      });

      const data = await res.json();

      setGenerationProgress((prev) => ({
        ...prev,
        completed: data.generated || 0,
        errors: data.errors || 0,
      }));

      fetchEpisode();
    } catch (error) {
      console.error("Failed to generate variations:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate single variation
  const generateSingleVariation = async (shot: Shot, variation: Variation) => {
    try {
      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId,
          shotId: shot.id,
          prompt: shot.prompt,
          variationId: variation.id,
          angle: variation.cameraAngle,
          mode: "variation",
        }),
      });
      fetchEpisode();
    } catch (error) {
      console.error("Failed to generate variation:", error);
    }
  };

  // Generate ALL pending variations for entire episode
  const generateAllPending = async () => {
    if (!episode) return;

    const pendingShots = episode.shots.filter(
      (s) => s.variations.some((v) => v.status === "pending" || v.status === "failed")
    );

    const totalPending = pendingShots.reduce(
      (sum, s) => sum + s.variations.filter((v) => v.status === "pending" || v.status === "failed").length,
      0
    );

    if (totalPending === 0) return;

    setIsGenerating(true);
    setGenerationProgress({
      currentShot: "",
      currentVariation: "",
      completed: 0,
      total: totalPending,
      errors: 0,
    });

    try {
      const res = await fetch("/api/generate/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId,
          maxParallelShots: 3,
        }),
      });

      const data = await res.json();

      setGenerationProgress((prev) => ({
        ...prev,
        completed: data.generated || 0,
        errors: data.errors || 0,
      }));

      fetchEpisode();
    } catch (error) {
      console.error("Failed to generate batch:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download variation
  const downloadVariation = (variation: Variation) => {
    if (variation.imageUrl) {
      window.open(variation.imageUrl, "_blank");
    }
  };

  // Set reference variation
  const setReferenceVariation = async (shot: Shot, variation: Variation) => {
    try {
      await fetch(`/api/episodes/${episodeId}/shots/${shot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceVariation: variation.id,
        }),
      });
      fetchEpisode();
    } catch (error) {
      console.error("Failed to set reference:", error);
    }
  };

  // Download episode ZIP
  const downloadEpisode = () => {
    window.open(`/api/download?episodeId=${episodeId}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0b0b0e]">
        <Sidebar episodes={episodes} onCreateEpisode={() => {}} />
        <main className="flex-1 flex items-center justify-center">
          <LoadingState message="Chargement de l'épisode..." />
        </main>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="flex h-screen bg-[#0b0b0e]">
        <Sidebar episodes={episodes} onCreateEpisode={() => {}} />
        <main className="flex-1 flex items-center justify-center text-zinc-100">
          <div className="text-center">
            <div className="text-5xl mb-4 opacity-30">🎬</div>
            <p className="text-zinc-500">Épisode non trouvé</p>
            <Link href="/">
              <Button variant="link" className="text-blood-500 mt-4">Retour au Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const stats = {
    totalShots: episode.shots.length,
    completedShots: episode.shots.filter((s) => s.status === "completed").length,
    totalVariations: episode.shots.reduce((sum, s) => sum + s.variations.length, 0),
    completedVariations: episode.shots.reduce(
      (sum, s) => sum + s.variations.filter((v) => v.status === "completed").length,
      0
    ),
    pendingVariations: episode.shots.reduce(
      (sum, s) => sum + s.variations.filter((v) => v.status === "pending" || v.status === "generating").length,
      0
    ),
  };

  return (
    <div className="flex h-screen bg-[#0b0b0e] text-zinc-100">
      {/* Sidebar */}
      <Sidebar episodes={episodes} onCreateEpisode={() => {}} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-blood-900/30 bg-[#0b0b0e]/95 backdrop-blur-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-blood-900/20">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour
                  </Button>
                </Link>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Badge className="bg-blood-900/60 text-blood-300 border-blood-700/50 font-mono">EP{episode.number}</Badge>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{episode.title}</h1>
                  </div>
                  <p className="text-sm text-zinc-500 max-w-2xl">{episode.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <StatsBar {...stats} />

                {/* Readiness Status */}
                {readiness && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                          readiness.ready 
                            ? "bg-emerald-900/20 border-emerald-600/30 text-emerald-400" 
                            : readiness.canProceedWithWarnings
                              ? "bg-amber-900/20 border-amber-600/30 text-amber-400"
                              : "bg-red-900/20 border-red-600/30 text-red-400"
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            readiness.ready ? "bg-emerald-500" : readiness.canProceedWithWarnings ? "bg-amber-500" : "bg-red-500"
                          }`} />
                          <span className="text-xs font-medium">
                            {readiness.ready ? "Prêt" : readiness.canProceedWithWarnings ? "Warnings" : "Non prêt"}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-[#14131a] border-blood-900/30 max-w-sm">
                        <div className="space-y-2 p-2">
                          <p className="text-xs text-zinc-300">
                            {readiness.stats.charactersWithRefs}/{readiness.stats.totalCharacters} personnages avec refs
                          </p>
                          <p className="text-xs text-zinc-300">
                            {readiness.stats.locationsWithRefs}/{readiness.stats.totalLocations} lieux avec refs
                          </p>
                          {readiness.warnings.length > 0 && (
                            <div className="pt-2 border-t border-blood-900/30">
                              <p className="text-xs text-amber-400 font-medium mb-1">Warnings:</p>
                              <ul className="text-xs text-zinc-500 space-y-0.5">
                                {readiness.warnings.slice(0, 3).map((w, i) => (
                                  <li key={i}>• {w}</li>
                                ))}
                                {readiness.warnings.length > 3 && (
                                  <li className="text-zinc-600">... et {readiness.warnings.length - 3} autres</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(true)}
                    className="bg-[#14131a] border-blood-900/30 text-zinc-400 hover:text-white hover:border-blood-600/50"
                  >
                    + Ajouter Shot
                  </Button>
                  <Button
                    onClick={generateAllPending}
                    disabled={isGenerating || stats.pendingVariations === 0}
                    className="moostik-btn-blood text-white"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Génération...
                      </>
                    ) : (
                      <>Générer Tout ({stats.pendingVariations})</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={downloadEpisode}
                    disabled={stats.completedVariations === 0}
                    className="bg-[#14131a] border-blood-900/30 text-zinc-400 hover:text-white hover:border-blood-600/50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    ZIP
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Clusters Section */}
        {clusters.length > 0 && (
          <div className="px-8 pt-6">
            <Collapsible open={showClusters} onOpenChange={setShowClusters}>
              <CollapsibleTrigger className="flex items-center gap-3 w-full text-left group">
                <div className="flex items-center gap-2">
                  <svg 
                    className={`w-4 h-4 text-zinc-500 transition-transform ${showClusters ? "rotate-90" : ""}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm font-semibold text-zinc-400 group-hover:text-zinc-300">
                    Clusters de Scènes
                  </span>
                </div>
                <Badge variant="outline" className="border-blood-900/30 text-blood-400 text-xs">
                  {clusters.length} clusters
                </Badge>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {clusters.map((cluster) => (
                    <div
                      key={cluster.id}
                      className="bg-[#14131a] border border-blood-900/20 rounded-xl p-4 hover:border-blood-600/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Badge className={`text-xs ${
                            cluster.type === "act" ? "bg-purple-900/50 text-purple-300 border-purple-700/50" :
                            cluster.type === "location" ? "bg-emerald-900/50 text-emerald-300 border-emerald-700/50" :
                            "bg-blue-900/50 text-blue-300 border-blue-700/50"
                          }`}>
                            {cluster.type === "act" ? "Acte" : cluster.type === "location" ? "Lieu" : "Personnages"}
                          </Badge>
                        </div>
                        <span className="text-xs text-zinc-600">{cluster.shotIds.length} shots</span>
                      </div>
                      <h4 className="text-sm font-medium text-zinc-200 mb-2 line-clamp-1">{cluster.name}</h4>
                      {cluster.sharedCharacterIds.length > 0 && (
                        <p className="text-xs text-zinc-500">
                          {cluster.sharedCharacterIds.length} personnage(s) partagé(s)
                        </p>
                      )}
                      {cluster.coherenceRules.sequentialGeneration && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-amber-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Génération séquentielle
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Acts Section (if available) */}
        {episode.acts && episode.acts.length > 0 && (
          <div className="px-8 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Structure Narrative</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {episode.acts.map((act) => (
                <div
                  key={act.id}
                  className="flex-shrink-0 bg-[#14131a] border border-blood-900/20 rounded-lg px-4 py-3 min-w-[200px]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-purple-900/50 text-purple-300 border-purple-700/50 text-xs">
                      Acte {act.number}
                    </Badge>
                    <span className="text-xs text-zinc-600">{act.shotIds.length} shots</span>
                  </div>
                  <h4 className="text-sm font-medium text-zinc-200">{act.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shots Grid */}
        <div className="p-8">
          {episode.shots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-zinc-500">
              <div className="w-20 h-20 rounded-3xl bg-blood-900/20 border border-blood-900/30 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-blood-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-300 mb-2">Aucun shot dans cet épisode</h3>
              <p className="text-zinc-500 mb-8 max-w-sm text-center">Commencez par ajouter le premier shot pour lancer la production cinématique.</p>
              <Button onClick={() => setShowAddDialog(true)} className="moostik-btn-blood text-white px-8">
                + Ajouter le premier shot
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {episode.shots.map((shot) => (
                <ShotCard
                  key={shot.id}
                  shot={shot}
                  onEdit={setEditingShot}
                  onGenerateAll={generateShotVariations}
                  onDelete={deleteShot}
                  onDuplicate={duplicateShot}
                  onViewDetails={setViewingShot}
                  isGenerating={isGenerating}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Shot Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#0b0b0e] border-blood-900/30 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Nouveau Shot</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Nom du shot</Label>
              <Input
                value={newShotName}
                onChange={(e) => setNewShotName(e.target.value)}
                placeholder="Le premier spray BYSS..."
                className="bg-[#14131a] border-blood-900/30 focus:border-blood-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Description (optionnelle)</Label>
              <Textarea
                value={newShotDescription}
                onChange={(e) => setNewShotDescription(e.target.value)}
                placeholder="Description de la scène..."
                className="bg-[#14131a] border-blood-900/30 focus:border-blood-600 min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)} className="text-zinc-500 hover:text-white">
              Annuler
            </Button>
            <Button onClick={addShot} disabled={!newShotName.trim()} className="moostik-btn-blood text-white px-6">
              Créer le Shot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shot Editor */}
      {editingShot && (
        <ShotEditor
          shot={editingShot}
          open={!!editingShot}
          onClose={() => setEditingShot(null)}
          onSave={saveShot}
        />
      )}

      {/* Shot Details Sheet (Drawer) */}
      <Sheet open={!!viewingShot} onOpenChange={() => setViewingShot(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[800px] bg-[#0b0b0e] border-l border-blood-900/30 p-0 overflow-hidden flex flex-col">
          {viewingShot && (
            <>
              <SheetHeader className="p-8 border-b border-blood-900/30 bg-[#0b0b0e]/95 backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-blood-900/50 text-blood-400 font-mono">
                        SHOT #{viewingShot.number.toString().padStart(2, "0")}
                      </Badge>
                      <Badge className="bg-zinc-900 text-zinc-400 border-zinc-800">{viewingShot.sceneType}</Badge>
                    </div>
                    <SheetTitle className="text-2xl font-bold text-white">{viewingShot.name}</SheetTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setViewingShot(null);
                        setEditingShot(viewingShot);
                      }}
                      className="bg-[#14131a] border-blood-900/30 text-zinc-400 hover:text-white hover:border-blood-600/50"
                    >
                      Éditer le prompt
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => generateShotVariations(viewingShot)}
                      disabled={isGenerating}
                      className="moostik-btn-blood text-white"
                    >
                      Générer les variations
                    </Button>
                  </div>
                </div>
                <p className="mt-4 text-zinc-400 text-sm leading-relaxed">{viewingShot.description || "Aucune description fournie."}</p>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-8">
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blood-500" />
                    Variations Cinématiques
                  </h3>
                  <VariationGrid
                    variations={viewingShot.variations}
                    onGenerate={(v) => generateSingleVariation(viewingShot, v)}
                    onDownload={downloadVariation}
                    onSetReference={(v) => setReferenceVariation(viewingShot, v)}
                    referenceId={undefined}
                    isGenerating={isGenerating}
                  />
                </div>

                {/* Prompt Details (SOTA) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Standard JSON MOOSTIK
                  </h3>
                  <div className="bg-[#14131a] border border-blood-900/20 rounded-xl p-6">
                    <pre className="text-xs text-zinc-500 font-mono whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(viewingShot.prompt, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Generation Progress */}
      <GenerationProgress
        isGenerating={isGenerating}
        currentShot={generationProgress.currentShot}
        currentVariation={generationProgress.currentVariation}
        completed={generationProgress.completed}
        total={generationProgress.total}
        errors={generationProgress.errors}
      />
    </div>
  );
}
