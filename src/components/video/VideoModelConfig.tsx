"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  Film,
  Mic,
  Palette,
  Play,
  Settings,
  Target,
  Volume2,
  Camera,
  Layers,
} from "lucide-react";
import {
  type VideoProvider,
  type VideoGenerationInput,
  type CameraMotion,
  type AspectRatio,
  type VideoResolution,
  PROVIDER_CONFIGS,
} from "@/lib/video/types";

interface VideoModelConfigProps {
  provider: VideoProvider;
  config: Partial<VideoGenerationInput>;
  onChange: (config: Partial<VideoGenerationInput>) => void;
  sourceImageUrl?: string;
}

// Camera motion presets
const CAMERA_PRESETS: { label: string; value: CameraMotion }[] = [
  { label: "Statique", value: { type: "static", intensity: "subtle" } },
  { label: "Pan Gauche", value: { type: "pan", direction: "left", intensity: "moderate" } },
  { label: "Pan Droite", value: { type: "pan", direction: "right", intensity: "moderate" } },
  { label: "Tilt Haut", value: { type: "tilt", direction: "up", intensity: "moderate" } },
  { label: "Tilt Bas", value: { type: "tilt", direction: "down", intensity: "moderate" } },
  { label: "Zoom In", value: { type: "zoom", direction: "in", intensity: "moderate" } },
  { label: "Zoom Out", value: { type: "zoom", direction: "out", intensity: "moderate" } },
  { label: "Dolly", value: { type: "dolly", intensity: "moderate" } },
  { label: "Orbite", value: { type: "orbit", direction: "clockwise", intensity: "moderate" } },
  { label: "Crane", value: { type: "crane", intensity: "dramatic" } },
  { label: "Handheld", value: { type: "handheld", intensity: "subtle" } },
  { label: "Tracking", value: { type: "tracking", intensity: "moderate" } },
];

export function VideoModelConfig({
  provider,
  config,
  onChange,
  sourceImageUrl,
}: VideoModelConfigProps) {
  const providerConfig = PROVIDER_CONFIGS[provider];
  const caps = providerConfig.capabilities;

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [motionBrushOpen, setMotionBrushOpen] = useState(false);

  // Set defaults based on provider capabilities
  useEffect(() => {
    const defaults: Partial<VideoGenerationInput> = {
      durationSeconds: Math.min(5, caps.maxDurationSeconds),
      aspectRatio: caps.supportedAspectRatios[0],
      resolution: caps.supportedResolutions[caps.supportedResolutions.length - 1],
      fps: caps.fps[0],
      generateAudio: caps.supportsAudio,
      sourceType: sourceImageUrl ? "image" : "text",
    };

    onChange({ ...defaults, ...config });
  }, [provider]);

  const updateConfig = (key: keyof VideoGenerationInput, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Provider Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blood-900/20 to-transparent rounded-xl border border-blood-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blood-900/30 flex items-center justify-center">
            <Settings className="w-5 h-5 text-blood-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Configuration {provider}</h3>
            <p className="text-xs text-zinc-500">
              {caps.strengths[0]}
            </p>
          </div>
        </div>
        <Badge className={cn(
          "text-xs",
          providerConfig.tier === "premium" ? "bg-amber-900/20 text-amber-400" :
          providerConfig.tier === "standard" ? "bg-blue-900/20 text-blue-400" :
          "bg-emerald-900/20 text-emerald-400"
        )}>
          {providerConfig.tier.toUpperCase()}
        </Badge>
      </div>

      {/* Core Parameters */}
      <div className="grid grid-cols-2 gap-4">
        {/* Duration */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Durée
          </Label>
          <div className="flex items-center gap-3">
            <Slider
              value={[config.durationSeconds || 5]}
              min={caps.minDurationSeconds}
              max={caps.maxDurationSeconds}
              step={1}
              onValueChange={([val]) => updateConfig("durationSeconds", val)}
              className="flex-1"
            />
            <span className="text-sm font-mono text-white w-10 text-right">
              {config.durationSeconds || 5}s
            </span>
          </div>
          <p className="text-[10px] text-zinc-600">
            {caps.minDurationSeconds}s - {caps.maxDurationSeconds}s
          </p>
        </div>

        {/* Resolution */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Film className="w-3 h-3" />
            Résolution
          </Label>
          <Select
            value={config.resolution || caps.supportedResolutions[0]}
            onValueChange={(val) => updateConfig("resolution", val as VideoResolution)}
          >
            <SelectTrigger className="bg-[#14131a] border-blood-900/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#14131a] border-blood-900/30">
              {caps.supportedResolutions.map((res) => (
                <SelectItem key={res} value={res}>
                  {res}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Layers className="w-3 h-3" />
            Ratio
          </Label>
          <Select
            value={config.aspectRatio || "16:9"}
            onValueChange={(val) => updateConfig("aspectRatio", val as AspectRatio)}
          >
            <SelectTrigger className="bg-[#14131a] border-blood-900/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#14131a] border-blood-900/30">
              {caps.supportedAspectRatios.map((ratio) => (
                <SelectItem key={ratio} value={ratio}>
                  {ratio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* FPS */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Play className="w-3 h-3" />
            FPS
          </Label>
          <Select
            value={String(config.fps || caps.fps[0])}
            onValueChange={(val) => updateConfig("fps", Number(val))}
          >
            <SelectTrigger className="bg-[#14131a] border-blood-900/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#14131a] border-blood-900/30">
              {caps.fps.map((f) => (
                <SelectItem key={f} value={String(f)}>
                  {f} fps
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Camera Motion */}
      {caps.supportsCameraControl && (
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Camera className="w-3 h-3" />
            Mouvement de Caméra
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {CAMERA_PRESETS.map((preset) => {
              const isSelected = config.cameraMotion?.type === preset.value.type;
              return (
                <button
                  key={preset.label}
                  onClick={() => updateConfig("cameraMotion", preset.value)}
                  className={cn(
                    "p-2 rounded-lg border text-xs transition-all",
                    isSelected
                      ? "bg-blood-900/30 border-blood-600/50 text-white"
                      : "bg-[#14131a] border-blood-900/10 text-zinc-400 hover:border-blood-900/30"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Audio Section - Only for providers with audio */}
      {caps.supportsAudio && (
        <div className="space-y-4 p-4 bg-emerald-900/10 rounded-xl border border-emerald-900/20">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <Volume2 className="w-3 h-3" />
              Audio Natif
            </Label>
            <Switch
              checked={config.generateAudio}
              onCheckedChange={(val) => updateConfig("generateAudio", val)}
            />
          </div>
          {config.generateAudio && (
            <div className="space-y-2">
              <Label className="text-[10px] text-zinc-500">
                Prompt Audio (optionnel)
              </Label>
              <Textarea
                value={config.audioPrompt || ""}
                onChange={(e) => updateConfig("audioPrompt", e.target.value)}
                placeholder="Ex: ambient bar noise, soft jazz music, mosquito buzz..."
                className="bg-[#14131a] border-emerald-900/30 text-sm h-16"
              />
            </div>
          )}
        </div>
      )}

      {/* Lip Sync Section - Only for Wan 2.5+ */}
      {caps.supportsLipSync && (
        <div className="p-4 bg-purple-900/10 rounded-xl border border-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-purple-400" />
              <Label className="text-xs font-bold text-purple-400">
                Lip-Sync Natif
              </Label>
            </div>
            <Badge className="text-[10px] bg-purple-900/30 text-purple-300">
              Disponible
            </Badge>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">
            Le modèle génère automatiquement le mouvement des lèvres synchronisé avec l'audio.
          </p>
        </div>
      )}

      {/* Motion Brush - Only for Kling 2.6 */}
      {caps.supportsMotionBrush && (
        <Collapsible open={motionBrushOpen} onOpenChange={setMotionBrushOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full p-4 bg-amber-900/10 rounded-xl border border-amber-900/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <Label className="text-xs font-bold text-amber-400">
                  Motion Brush (6 régions)
                </Label>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-amber-400 transition-transform",
                motionBrushOpen && "rotate-180"
              )} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-4 bg-[#14131a] rounded-xl border border-amber-900/20">
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Dessinez jusqu'à 6 régions pour contrôler le mouvement individuellement.
                Chaque région peut être animée, maintenue statique, ou supprimée.
              </p>
              <div className="aspect-video bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center relative">
                {sourceImageUrl ? (
                  <Image src={sourceImageUrl} alt="Source" fill unoptimized className="object-contain" />
                ) : (
                  <p className="text-xs text-zinc-600">Chargez une image source pour utiliser Motion Brush</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((region) => (
                  <button
                    key={region}
                    className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-500 hover:border-amber-900/30"
                  >
                    Région {region}
                  </button>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Motion Transfer - For Kling 2.6, Luma Ray 3 */}
      {caps.supportsMotionTransfer && (
        <div className="p-4 bg-pink-900/10 rounded-xl border border-pink-900/20 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-pink-400" />
            <Label className="text-xs font-bold text-pink-400">
              Motion Transfer
            </Label>
          </div>
          <p className="text-[10px] text-zinc-500">
            Transférez le mouvement d'une vidéo de référence sur votre personnage.
          </p>
          <Input
            type="url"
            placeholder="URL de la vidéo de référence..."
            value={config.motionTransfer?.referenceVideoUrl || ""}
            onChange={(e) => updateConfig("motionTransfer", {
              ...config.motionTransfer,
              referenceVideoUrl: e.target.value,
              preserveAppearance: true,
              transferFace: true,
              transferBody: true,
              transferHands: true,
            })}
            className="bg-[#14131a] border-pink-900/30 text-sm"
          />
        </div>
      )}

      {/* Interpolation - For Luma Ray 2/3 */}
      {caps.supportsInterpolation && (
        <div className="p-4 bg-cyan-900/10 rounded-xl border border-cyan-900/20 space-y-3">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400" />
            <Label className="text-xs font-bold text-cyan-400">
              Interpolation (Start + End Frame)
            </Label>
          </div>
          <p className="text-[10px] text-zinc-500">
            Fournissez une image de début et de fin pour un morphing fluide.
          </p>
          <Input
            type="url"
            placeholder="URL de l'image de fin..."
            value={config.endImage || ""}
            onChange={(e) => updateConfig("endImage", e.target.value)}
            className="bg-[#14131a] border-cyan-900/30 text-sm"
          />
        </div>
      )}

      {/* Advanced Settings */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-3 bg-[#14131a] rounded-lg border border-blood-900/10 hover:border-blood-900/30 transition-colors">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Paramètres Avancés
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 text-zinc-500 transition-transform",
              advancedOpen && "rotate-180"
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-4 p-4 bg-[#14131a] rounded-lg border border-blood-900/10">
          {/* CFG Scale */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-500">CFG Scale</Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[config.cfgScale || 7]}
                min={1}
                max={20}
                step={0.5}
                onValueChange={([val]) => updateConfig("cfgScale", val)}
                className="flex-1"
              />
              <span className="text-sm font-mono text-white w-10 text-right">
                {config.cfgScale || 7}
              </span>
            </div>
          </div>

          {/* Seed */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-500">Seed (optionnel)</Label>
            <Input
              type="number"
              value={config.seed || ""}
              onChange={(e) => updateConfig("seed", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Aléatoire"
              className="bg-zinc-900 border-zinc-800 text-sm"
            />
          </div>

          {/* Motion Intensity */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-500">Intensité du Mouvement</Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[config.motionIntensity || 0.5]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={([val]) => updateConfig("motionIntensity", val)}
                className="flex-1"
              />
              <span className="text-sm font-mono text-white w-16 text-right">
                {Math.round((config.motionIntensity || 0.5) * 100)}%
              </span>
            </div>
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-500">Negative Prompt</Label>
            <Textarea
              value={config.negativePrompt || ""}
              onChange={(e) => updateConfig("negativePrompt", e.target.value)}
              placeholder="Ex: blurry, distorted, low quality..."
              className="bg-zinc-900 border-zinc-800 text-sm h-16"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Provider Warnings */}
      {provider === "sora-2" && (
        <div className="p-3 bg-red-900/10 border border-red-900/20 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-red-300">
            <strong>Restrictions Sora 2:</strong> Pas de personnages protégés par copyright,
            pas de visages humains réels, pas de célébrités. Non disponible en EU/UK/Suisse.
          </div>
        </div>
      )}

      {provider === "veo-3.1" && (
        <div className="p-3 bg-amber-900/10 border border-amber-900/20 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-300">
            <strong>Note Veo 3.1:</strong> Les vidéos ne sont stockées que 2 jours.
            Assurez-vous de télécharger rapidement.
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoModelConfig;
