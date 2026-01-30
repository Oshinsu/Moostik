"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Aperture,
  Camera,
  Clapperboard,
  ImageIcon,
  Loader2,
  Play,
  Sparkles,
  Video,
  Wand2,
} from "lucide-react";
import { CinemaStudio } from "@/components/cinema";
import {
  type CameraConfig,
  type StackedMovements,
  type LightingConfig,
  type DepthOfField,
  type CinemaPreset,
  CINEMA_PRESETS,
  buildCinemaStudioPrompt,
} from "@/lib/cinema/types";

// ============================================
// DEFAULT CONFIGURATIONS
// ============================================

const DEFAULT_CAMERA: CameraConfig = {
  sensor: "full_frame",
  lens: "cinema_prime",
  focalLength: 50,
  aperture: 2.0,
  filmStock: "digital_arri",
};

const DEFAULT_MOVEMENTS: StackedMovements = {
  primary: { type: "static", intensity: 0, easing: "ease_in_out" },
};

const DEFAULT_LIGHTING: LightingConfig = {
  setup: "bioluminescent",
  keyIntensity: 70,
  fillRatio: "3:1",
  rimLight: true,
  colorTemperature: 4500,
};

const DEFAULT_DOF: DepthOfField = {
  mode: "auto",
  backgroundBlur: "moderate",
  foregroundBlur: "none",
};

// ============================================
// PAGE COMPONENT
// ============================================

export default function CinemaPage() {
  // State
  const [mode, setMode] = useState<"photography" | "videography">("videography");
  const [camera, setCamera] = useState<CameraConfig>(DEFAULT_CAMERA);
  const [movements, setMovements] = useState<StackedMovements>(DEFAULT_MOVEMENTS);
  const [lighting, setLighting] = useState<LightingConfig>(DEFAULT_LIGHTING);
  const [depthOfField, setDepthOfField] = useState<DepthOfField>(DEFAULT_DOF);

  const [sourceImage, setSourceImage] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);

  // Handle preset selection
  const handlePresetSelect = (preset: CinemaPreset) => {
    if (preset.camera) {
      setCamera({ ...DEFAULT_CAMERA, ...preset.camera });
    }
    if (preset.movements) {
      setMovements({ ...DEFAULT_MOVEMENTS, ...preset.movements } as StackedMovements);
    }
    if (preset.lighting) {
      setLighting({ ...DEFAULT_LIGHTING, ...preset.lighting });
    }
    if (preset.depthOfField) {
      setDepthOfField({ ...DEFAULT_DOF, ...preset.depthOfField });
    }
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

  // Handle generation
  const handleGenerate = async () => {
    if (!sourceImage || !prompt) return;

    setIsGenerating(true);

    // Build the full prompt with cinema settings
    const session = {
      id: "temp",
      name: "Session",
      mode,
      camera,
      movements,
      depthOfField,
      lighting,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const fullPrompt = buildCinemaStudioPrompt(prompt, session);
    console.log("Generated prompt:", fullPrompt);

    // Simulate generation (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 3000));

    setGeneratedResult(sourceImage); // In real impl, this would be the generated image/video
    setIsGenerating(false);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#0a0a0d]">
        {/* Header */}
        <header className="border-b border-blood-900/30 bg-gradient-to-r from-[#0b0b0e] to-[#14131a]">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-blood-600/20 border border-purple-600/30 flex items-center justify-center">
                  <Clapperboard className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Cinema Studio
                  </h1>
                  <p className="text-sm text-zinc-500">
                    Contrôle caméra professionnel avec physique optique réelle
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-purple-900/30 text-purple-400 border-purple-900/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Inspiré par Higgsfield
                </Badge>
                <Badge variant="outline" className="text-zinc-500 border-zinc-800">
                  <Aperture className="w-3 h-3 mr-1" />
                  {camera.focalLength}mm f/{camera.aperture}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel: Cinema Controls */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/30">
                <CinemaStudio
                  camera={camera}
                  onCameraChange={setCamera}
                  movements={movements}
                  onMovementsChange={setMovements}
                  lighting={lighting}
                  onLightingChange={setLighting}
                  depthOfField={depthOfField}
                  onDepthOfFieldChange={setDepthOfField}
                  mode={mode}
                  onModeChange={setMode}
                  onPresetSelect={handlePresetSelect}
                />
              </div>
            </div>

            {/* Right Panel: Preview & Generation */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="input" className="space-y-6">
                <TabsList className="bg-zinc-900/50 border border-zinc-800/30 p-1">
                  <TabsTrigger value="input" className="data-[state=active]:bg-blood-900/30">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Source
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="data-[state=active]:bg-blood-900/30">
                    <Camera className="w-4 h-4 mr-2" />
                    Aperçu
                  </TabsTrigger>
                  <TabsTrigger value="result" className="data-[state=active]:bg-blood-900/30">
                    {mode === "videography" ? (
                      <Video className="w-4 h-4 mr-2" />
                    ) : (
                      <ImageIcon className="w-4 h-4 mr-2" />
                    )}
                    Résultat
                  </TabsTrigger>
                </TabsList>

                {/* Input Tab */}
                <TabsContent value="input" className="space-y-6">
                  {/* Image Upload */}
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

                        {/* Camera info overlay */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/60 backdrop-blur-sm">
                            <Camera className="w-4 h-4 text-zinc-400" />
                            <span className="text-xs text-zinc-300 font-mono">
                              {camera.sensor.replace(/_/g, " ")} • {camera.lens.replace(/_/g, " ")} • {camera.focalLength}mm • f/{camera.aperture}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                        <ImageIcon className="w-16 h-16 text-zinc-700 mb-3" />
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

                  {/* Prompt */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                      Description de la Scène
                    </label>
                    <Textarea
                      placeholder="Décrivez l'action, l'émotion, le mouvement souhaité..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="bg-zinc-900/50 border-zinc-800 min-h-[100px]"
                    />
                  </div>

                  {/* URL Input */}
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500">Ou coller une URL</label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={sourceImage.startsWith("http") ? sourceImage : ""}
                      onChange={(e) => setSourceImage(e.target.value)}
                      className="bg-zinc-900/50 border-zinc-800"
                    />
                  </div>

                  {/* Generate Button */}
                  <Button
                    className="w-full moostik-btn-blood text-white h-12"
                    disabled={!sourceImage || !prompt || isGenerating}
                    onClick={handleGenerate}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {mode === "videography" ? "Génération vidéo..." : "Génération image..."}
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        {mode === "videography" ? "Générer la Vidéo" : "Générer l'Image"}
                      </>
                    )}
                  </Button>
                </TabsContent>

                {/* Preview Tab */}
                <TabsContent value="preview" className="space-y-4">
                  <div className="aspect-video rounded-xl bg-zinc-900/30 border border-zinc-800/30 flex items-center justify-center">
                    {sourceImage ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={sourceImage}
                          alt="Preview"
                          fill
                          className="object-cover rounded-xl"
                          unoptimized
                        />
                        {/* Overlay with camera settings visualization */}
                        <div className="absolute inset-0 pointer-events-none">
                          {/* Rule of thirds grid */}
                          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                            {[...Array(9)].map((_, i) => (
                              <div key={i} className="border border-white/10" />
                            ))}
                          </div>

                          {/* Focus point */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="w-16 h-16 border-2 border-blood-500/50 rounded-full" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blood-500 rounded-full" />
                          </div>

                          {/* Camera info */}
                          <div className="absolute top-4 left-4 space-y-1">
                            <Badge className="bg-black/60 text-white border-0 text-[10px]">
                              {camera.sensor.replace(/_/g, " ").toUpperCase()}
                            </Badge>
                            <Badge className="bg-black/60 text-white border-0 text-[10px] block">
                              {camera.filmStock?.replace(/_/g, " ") || "Digital"}
                            </Badge>
                          </div>

                          <div className="absolute top-4 right-4 space-y-1 text-right">
                            <Badge className="bg-black/60 text-white border-0 text-[10px]">
                              {camera.focalLength}mm
                            </Badge>
                            <Badge className="bg-black/60 text-white border-0 text-[10px] block">
                              f/{camera.aperture}
                            </Badge>
                          </div>

                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-black/60">
                              <span className="text-[10px] text-zinc-400">
                                {movements.primary.type !== "static" ? movements.primary.type.replace(/_/g, " ").toUpperCase() : "STATIC"}
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                {lighting.setup.replace(/_/g, " ").toUpperCase()}
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                {lighting.colorTemperature}K
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500">Uploadez une image pour voir l&apos;aperçu</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Result Tab */}
                <TabsContent value="result" className="space-y-4">
                  <div className="aspect-video rounded-xl bg-zinc-900/30 border border-zinc-800/30 flex items-center justify-center overflow-hidden">
                    {generatedResult ? (
                      <div className="relative w-full h-full">
                        {mode === "videography" ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Image
                              src={generatedResult}
                              alt="Result"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <Button
                              size="lg"
                              className="absolute z-10 rounded-full w-16 h-16 bg-blood-600 hover:bg-blood-700"
                            >
                              <Play className="w-8 h-8 text-white" />
                            </Button>
                          </div>
                        ) : (
                          <Image
                            src={generatedResult}
                            alt="Result"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        {mode === "videography" ? (
                          <Video className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        ) : (
                          <ImageIcon className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        )}
                        <p className="text-zinc-500">Aucun résultat généré</p>
                        <p className="text-xs text-zinc-600 mt-1">
                          Lancez la génération pour voir le résultat
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Quick Presets */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Presets Rapides
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {CINEMA_PRESETS.slice(0, 6).map((preset) => (
                    <Tooltip key={preset.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-auto py-2 justify-start border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50",
                            preset.category === "moostik" && "border-blood-900/30 bg-blood-900/10"
                          )}
                          onClick={() => handlePresetSelect(preset)}
                        >
                          <div className="text-left">
                            <p className="text-xs font-medium">{preset.name}</p>
                            <p className="text-[10px] text-zinc-600 truncate">{preset.description}</p>
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{preset.description}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
