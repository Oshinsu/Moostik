"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  Check,
  Download,
  Grid3X3,
  ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Star,
  Upload,
  Wand2,
  Zap,
} from "lucide-react";
import {
  type ShotResult,
  type ShotsStyle,
  SHOTS_GRID_CONFIG,
  getAngleConfig,
  getGridPreset,
} from "@/lib/shots/types";

// ============================================
// PAGE COMPONENT
// ============================================

export default function ShotsPage() {
  const [sourceImage, setSourceImage] = useState<string>("");
  const [basePrompt, setBasePrompt] = useState<string>("");
  const [stylePreset, setStylePreset] = useState<ShotsStyle>("pixar_dark");
  const [gridPreset, setGridPreset] = useState<"all" | "character" | "action" | "dialogue" | "emotional">("all");
  const [shots, setShots] = useState<ShotResult[]>([]);
  const [selectedShot, setSelectedShot] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("setup");

  // Get active angles based on preset
  const activeAngles = gridPreset === "all"
    ? SHOTS_GRID_CONFIG.map(c => c.angle)
    : getGridPreset(gridPreset);

  // Initialize shots when starting generation
  const initializeShots = useCallback(() => {
    const newShots: ShotResult[] = activeAngles.map((angle, idx) => {
      const config = getAngleConfig(angle);
      return {
        id: `shot-${idx}-${Date.now()}`,
        angle,
        angleConfig: config!,
        imageUrl: "",
        prompt: "",
        status: "pending",
      };
    });
    setShots(newShots);
    return newShots;
  }, [activeAngles]);

  // Handle generation
  const handleGenerate = async () => {
    if (!sourceImage || !basePrompt) return;

    setIsGenerating(true);
    setActiveTab("grid");
    const shotsToGenerate = initializeShots();

    // Simulate generation (replace with actual API call)
    for (let i = 0; i < shotsToGenerate.length; i++) {
      setShots(prev => prev.map((s, idx) =>
        idx === i ? { ...s, status: "generating" } : s
      ));

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setShots(prev => prev.map((s, idx) =>
        idx === i ? {
          ...s,
          status: "completed",
          imageUrl: sourceImage, // In real impl, this would be the generated image
          generatedAt: new Date().toISOString(),
        } : s
      ));
    }

    setIsGenerating(false);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSourceImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get shot by grid position
  const getShotForPosition = (position: number): ShotResult | undefined => {
    const config = SHOTS_GRID_CONFIG.find(c => c.gridPosition === position);
    if (!config) return undefined;
    return shots.find(s => s.angle === config.angle);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#0a0a0d]">
        {/* Header */}
        <header className="border-b border-blood-900/30 bg-gradient-to-r from-[#0b0b0e] to-[#14131a]">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blood-600/30 to-amber-600/20 border border-blood-600/30 flex items-center justify-center">
                  <Grid3X3 className="w-6 h-6 text-blood-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Shots x9
                  </h1>
                  <p className="text-sm text-zinc-500">
                    Générez 9 angles cinématiques à partir d&apos;une seule image
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-blood-900/30 text-blood-400 border-blood-900/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Inspiré par Higgsfield
                </Badge>
                <Badge variant="outline" className="text-zinc-500 border-zinc-800">
                  <Zap className="w-3 h-3 mr-1" />4 crédits / grille
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-zinc-900/50 border border-zinc-800/30 p-1">
              <TabsTrigger value="setup" className="data-[state=active]:bg-blood-900/30">
                <Upload className="w-4 h-4 mr-2" />
                Configuration
              </TabsTrigger>
              <TabsTrigger value="grid" className="data-[state=active]:bg-blood-900/30">
                <Grid3X3 className="w-4 h-4 mr-2" />
                Grille x9
              </TabsTrigger>
              <TabsTrigger value="export" className="data-[state=active]:bg-blood-900/30">
                <Download className="w-4 h-4 mr-2" />
                Export
              </TabsTrigger>
            </TabsList>

            {/* Setup Tab */}
            <TabsContent value="setup" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Image Upload */}
                <div className="space-y-4">
                  <Label className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                    Image Source
                  </Label>

                  <div
                    className={cn(
                      "relative aspect-video rounded-xl border-2 border-dashed transition-all overflow-hidden",
                      sourceImage
                        ? "border-blood-600/50 bg-blood-900/10"
                        : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                    )}
                  >
                    {sourceImage ? (
                      <>
                        <Image
                          src={sourceImage}
                          alt="Source"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSourceImage("")}
                          >
                            Changer l&apos;image
                          </Button>
                        </div>
                      </>
                    ) : (
                      <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                        <ImageIcon className="w-12 h-12 text-zinc-700 mb-3" />
                        <p className="text-sm text-zinc-500">
                          Cliquez pour uploader une image
                        </p>
                        <p className="text-xs text-zinc-600 mt-1">
                          PNG, JPG jusqu&apos;à 10MB
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>

                  {/* URL Input */}
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-500">Ou coller une URL</Label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={sourceImage.startsWith("http") ? sourceImage : ""}
                      onChange={(e) => setSourceImage(e.target.value)}
                      className="bg-zinc-900/50 border-zinc-800"
                    />
                  </div>
                </div>

                {/* Right: Configuration */}
                <div className="space-y-6">
                  {/* Prompt */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                      Description de Base
                    </Label>
                    <Textarea
                      placeholder="Décrivez le personnage/scène... Ex: Moustik guerrier avec armure de chitin, yeux ambrés lumineux, dans une cathédrale gothique organique..."
                      value={basePrompt}
                      onChange={(e) => setBasePrompt(e.target.value)}
                      className="bg-zinc-900/50 border-zinc-800 min-h-[120px]"
                    />
                  </div>

                  {/* Style Preset */}
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-500">Style Visuel</Label>
                    <Select value={stylePreset} onValueChange={(v) => setStylePreset(v as ShotsStyle)}>
                      <SelectTrigger className="bg-zinc-900/50 border-zinc-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pixar_dark">MOOSTIK (Pixar Dark)</SelectItem>
                        <SelectItem value="cinematic">Cinématique</SelectItem>
                        <SelectItem value="photorealistic">Photoréaliste</SelectItem>
                        <SelectItem value="stylized_3d">3D Stylisé</SelectItem>
                        <SelectItem value="noir">Film Noir</SelectItem>
                        <SelectItem value="fantasy">Fantasy</SelectItem>
                        <SelectItem value="horror">Horreur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Grid Preset */}
                  <div className="space-y-2">
                    <Label className="text-xs text-zinc-500">Preset de Grille</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "all", label: "Tous (9)", desc: "Angles complets" },
                        { value: "character", label: "Personnage", desc: "Introduction" },
                        { value: "action", label: "Action", desc: "Dynamique" },
                        { value: "dialogue", label: "Dialogue", desc: "Conversation" },
                        { value: "emotional", label: "Émotion", desc: "Expressions" },
                      ].map((preset) => (
                        <Button
                          key={preset.value}
                          variant="outline"
                          className={cn(
                            "h-auto py-3 px-3 flex-col items-start border-zinc-800",
                            gridPreset === preset.value
                              ? "bg-blood-900/30 border-blood-600/50"
                              : "bg-zinc-900/30 hover:bg-zinc-900/50"
                          )}
                          onClick={() => setGridPreset(preset.value as typeof gridPreset)}
                        >
                          <span className="text-xs font-medium">{preset.label}</span>
                          <span className="text-[10px] text-zinc-600">{preset.desc}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    className="w-full moostik-btn-blood text-white h-12"
                    disabled={!sourceImage || !basePrompt || isGenerating}
                    onClick={handleGenerate}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Générer x9 Shots
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Grid Tab */}
            <TabsContent value="grid" className="space-y-6">
              {shots.length === 0 ? (
                <div className="text-center py-20">
                  <Grid3X3 className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500">Aucun shot généré</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Configurez et lancez la génération pour voir la grille
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-blood-900/20 text-blood-400 border-blood-900/30">
                        {shots.filter(s => s.status === "completed").length}/{shots.length} générés
                      </Badge>
                      {isGenerating && (
                        <Badge className="bg-amber-900/20 text-amber-400 border-amber-900/30 animate-pulse">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          En cours...
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-800"
                      onClick={() => initializeShots()}
                      disabled={isGenerating}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Régénérer tout
                    </Button>
                  </div>

                  {/* 3x3 Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((position) => {
                      const config = SHOTS_GRID_CONFIG.find(c => c.gridPosition === position);
                      const shot = getShotForPosition(position);
                      const isSelected = shot?.id === selectedShot;
                      const isReference = shot?.id === referenceId;

                      if (!config) return null;

                      return (
                        <div
                          key={position}
                          className={cn(
                            "group relative rounded-xl overflow-hidden border transition-all cursor-pointer",
                            shot?.status === "completed"
                              ? "bg-blood-900/10 border-blood-600/30"
                              : shot?.status === "generating"
                              ? "bg-amber-900/10 border-amber-600/30 animate-pulse"
                              : "bg-zinc-900/30 border-zinc-800/30",
                            isSelected && "ring-2 ring-blood-500",
                            isReference && "ring-2 ring-amber-500"
                          )}
                          onClick={() => shot?.id && setSelectedShot(shot.id)}
                        >
                          <div className="aspect-video relative bg-[#0a0a0d]">
                            {shot?.imageUrl ? (
                              <Image
                                src={shot.imageUrl}
                                alt={config.labelFr}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                unoptimized
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                {shot?.status === "generating" ? (
                                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                                ) : (
                                  <>
                                    <Camera className="w-8 h-8 text-zinc-700" />
                                    <p className="text-[10px] text-zinc-700 mt-2">{config.labelFr}</p>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Hover overlay */}
                            {shot?.status === "completed" && (
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Télécharger</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className={cn(
                                        "h-8 w-8 p-0 rounded-full text-white",
                                        isReference ? "bg-amber-500/80" : "bg-white/10 hover:bg-white/20"
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReferenceId(shot.id);
                                      }}
                                    >
                                      <Star className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Définir comme référence</TooltipContent>
                                </Tooltip>
                              </div>
                            )}

                            {/* Status indicators */}
                            {shot?.status === "completed" && (
                              <div className="absolute top-2 right-2">
                                <Check className="w-4 h-4 text-emerald-400" />
                              </div>
                            )}
                            {isReference && (
                              <Badge className="absolute top-2 left-2 bg-amber-500 text-black text-[8px] px-1 py-0">
                                REF
                              </Badge>
                            )}
                          </div>

                          {/* Label */}
                          <div className="p-3 bg-gradient-to-b from-transparent to-black/40">
                            <p className="text-xs font-bold text-zinc-300 truncate">
                              {config.labelFr}
                            </p>
                            <p className="text-[10px] text-zinc-600">
                              {config.focalLength} • {config.aperture}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="space-y-6">
              <div className="text-center py-20">
                <Download className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-500">Export en cours de développement</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Téléchargez individuellement depuis la grille
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </TooltipProvider>
  );
}
