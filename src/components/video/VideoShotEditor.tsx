"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Film,
  Camera,
  Volume2,
  Mic,
  Settings,
  Sparkles,
  Check,
  ChevronDown,
  AlertCircle,
  Wand2,
} from "lucide-react";

import { VideoModelSelector } from "./VideoModelSelector";
import { VideoModelConfig } from "./VideoModelConfig";
import { VideoCostEstimator } from "./VideoCostEstimator";

import type { Shot, Variation } from "@/types/episode";
import {
  type VideoProvider,
  type VideoGenerationInput,
  type AnimationType,
  PROVIDER_CONFIGS,
  MOOSTIK_ANIMATION_PROVIDERS,
  MOOSTIK_SCENE_PROVIDERS,
  getOptimalProvider,
} from "@/lib/video/types";

interface VideoShotEditorProps {
  shot: Shot;
  variation?: Variation;
  open: boolean;
  onClose: () => void;
  onSave: (shotId: string, variationId: string | undefined, config: ShotVideoConfig) => void;
}

export interface ShotVideoConfig {
  provider: VideoProvider;
  config: Partial<VideoGenerationInput>;
  animationType: AnimationType;
  useAutoProvider: boolean;
}

const ANIMATION_TYPES: { value: AnimationType; label: string; icon: string; description: string }[] = [
  { value: "subtle", label: "Subtil", icon: "🌊", description: "Mouvement léger, respirations, ambiance" },
  { value: "dialogue", label: "Dialogue", icon: "💬", description: "Personnage qui parle, lip-sync" },
  { value: "action", label: "Action", icon: "⚡", description: "Mouvements rapides, combat léger" },
  { value: "transition", label: "Transition", icon: "🔄", description: "Changement de scène, fondu" },
  { value: "establishing", label: "Establishing", icon: "🏔️", description: "Plan large, introduction de lieu" },
  { value: "emotional", label: "Émotionnel", icon: "💔", description: "Expressions faciales, émotions intenses" },
  { value: "combat", label: "Combat", icon: "⚔️", description: "Bataille, mouvements complexes" },
  { value: "death", label: "Mort", icon: "💀", description: "Scène de mort, ralenti dramatique" },
  { value: "flashback", label: "Flashback", icon: "⏪", description: "Souvenir, effet onirique" },
  { value: "dance", label: "Danse", icon: "💃", description: "Chorégraphie, mouvements fluides" },
  { value: "walking", label: "Marche", icon: "🚶", description: "Personnage en mouvement simple" },
  { value: "flying", label: "Vol", icon: "🦟", description: "Mosquito en vol, ailes animées" },
];

export function VideoShotEditor({
  shot,
  variation,
  open,
  onClose,
  onSave,
}: VideoShotEditorProps) {
  const [animationType, setAnimationType] = useState<AnimationType>("subtle");
  const [useAutoProvider, setUseAutoProvider] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<VideoProvider>("wan-2.5");
  const [videoConfig, setVideoConfig] = useState<Partial<VideoGenerationInput>>({
    durationSeconds: 5,
    aspectRatio: "16:9",
    resolution: "1080p",
    generateAudio: true,
  });
  const [prompt, setPrompt] = useState("");

  // Initialize from shot data
  useEffect(() => {
    if (shot) {
      // Determine animation type from scene type
      const sceneToAnimation: Record<string, AnimationType> = {
        genocide: "death",
        survival: "action",
        training: "combat",
        planning: "dialogue",
        bar_scene: "dialogue",
        battle: "combat",
        emotional: "emotional",
        establishing: "establishing",
        flashback: "flashback",
        montage: "transition",
        revelation: "emotional",
      };
      const inferredAnimation = sceneToAnimation[shot.sceneType] || "subtle";
      setAnimationType(inferredAnimation);

      // Set prompt from shot description
      setPrompt(shot.narrativeDescription || shot.description || shot.name);

      // Auto-select provider based on scene type
      if (useAutoProvider) {
        const sceneProvider = MOOSTIK_SCENE_PROVIDERS[shot.sceneType];
        if (sceneProvider) {
          setSelectedProvider(sceneProvider);
        }
      }
    }
  }, [shot, useAutoProvider]);

  // Update provider when animation type changes (if auto mode)
  useEffect(() => {
    if (useAutoProvider) {
      const optimalProvider = getOptimalProvider(animationType, "standard");
      setSelectedProvider(optimalProvider);
    }
  }, [animationType, useAutoProvider]);

  const handleSave = () => {
    onSave(shot.id, variation?.id, {
      provider: selectedProvider,
      config: {
        ...videoConfig,
        prompt,
        sourceImage: variation?.imageUrl,
        sourceType: "image",
      },
      animationType,
      useAutoProvider,
    });
    onClose();
  };

  const recommendedProviders = MOOSTIK_ANIMATION_PROVIDERS[animationType] || [];
  const providerConfig = PROVIDER_CONFIGS[selectedProvider];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] bg-[#0b0b0e] border-blood-900/30 text-zinc-100 p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 border-b border-blood-900/30">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-blood-900/50 text-blood-400 font-mono">
              SHOT #{shot.number.toString().padStart(2, "0")}
            </Badge>
            <DialogTitle className="text-xl font-bold tracking-tight">
              Configuration Vidéo : {shot.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Preview + Animation Type */}
          <div className="w-80 border-r border-blood-900/30 flex flex-col">
            {/* Image Preview */}
            <div className="p-4 border-b border-blood-900/30">
              <div className="aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
                {variation?.imageUrl ? (
                  <img
                    src={variation.imageUrl}
                    alt={shot.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <Film className="w-8 h-8" />
                  </div>
                )}
              </div>
              {variation && (
                <p className="text-xs text-zinc-500 mt-2 text-center">
                  Angle: {variation.cameraAngle}
                </p>
              )}
            </div>

            {/* Animation Type Selection */}
            <div className="p-4 flex-1 overflow-hidden flex flex-col">
              <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Type d'Animation
              </Label>
              <ScrollArea className="flex-1">
                <div className="space-y-2 pr-2">
                  {ANIMATION_TYPES.map((type) => {
                    const isSelected = animationType === type.value;
                    const isRecommended = recommendedProviders.some(
                      (p) => MOOSTIK_ANIMATION_PROVIDERS[type.value]?.includes(p)
                    );

                    return (
                      <button
                        key={type.value}
                        onClick={() => setAnimationType(type.value)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-all",
                          isSelected
                            ? "bg-blood-900/20 border-blood-600/50"
                            : "bg-[#14131a] border-blood-900/10 hover:border-blood-900/30"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{type.icon}</span>
                          <span className="font-medium text-sm">{type.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-blood-400 ml-auto" />}
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1 ml-7">
                          {type.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Recommended Providers */}
            <div className="p-4 border-t border-blood-900/30 bg-[#14131a]/50">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2 block">
                Modèles recommandés pour "{animationType}"
              </Label>
              <div className="flex flex-wrap gap-1">
                {recommendedProviders.slice(0, 3).map((p) => (
                  <Badge
                    key={p}
                    variant="outline"
                    className={cn(
                      "text-[9px] cursor-pointer transition-colors",
                      p === selectedProvider
                        ? "bg-blood-900/30 border-blood-600/50 text-blood-400"
                        : "border-zinc-700 text-zinc-500 hover:border-blood-900/30"
                    )}
                    onClick={() => {
                      setUseAutoProvider(false);
                      setSelectedProvider(p);
                    }}
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Configuration */}
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="model" className="h-full flex flex-col">
              <div className="px-6 pt-4 bg-[#0b0b0e]/50 border-b border-blood-900/30">
                <TabsList className="bg-[#14131a] border border-blood-900/20 p-1">
                  <TabsTrigger
                    value="model"
                    className="data-[state=active]:bg-blood-900/40 data-[state=active]:text-blood-100"
                  >
                    <Film className="w-3 h-3 mr-1.5" />
                    Modèle
                  </TabsTrigger>
                  <TabsTrigger
                    value="config"
                    className="data-[state=active]:bg-blood-900/40 data-[state=active]:text-blood-100"
                  >
                    <Settings className="w-3 h-3 mr-1.5" />
                    Paramètres
                  </TabsTrigger>
                  <TabsTrigger
                    value="prompt"
                    className="data-[state=active]:bg-blood-900/40 data-[state=active]:text-blood-100"
                  >
                    <Wand2 className="w-3 h-3 mr-1.5" />
                    Prompt
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                {/* Model Tab */}
                <TabsContent value="model" className="mt-0 space-y-6">
                  {/* Auto Provider Toggle */}
                  <div className="flex items-center justify-between p-4 bg-[#14131a] rounded-xl border border-blood-900/10">
                    <div>
                      <Label className="text-sm font-medium text-white">
                        Sélection automatique
                      </Label>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Choisit le meilleur modèle selon le type d'animation
                      </p>
                    </div>
                    <Switch
                      checked={useAutoProvider}
                      onCheckedChange={setUseAutoProvider}
                    />
                  </div>

                  {useAutoProvider ? (
                    <div className="p-4 bg-emerald-900/10 border border-emerald-900/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-900/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-emerald-400">
                            Modèle auto-sélectionné: {selectedProvider}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Optimal pour "{animationType}" • ${providerConfig.pricing.costPer5sVideo.toFixed(2)}/5s
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <VideoModelSelector
                      selectedProvider={selectedProvider}
                      onSelect={setSelectedProvider}
                      showPricing
                      showCapabilities
                    />
                  )}
                </TabsContent>

                {/* Config Tab */}
                <TabsContent value="config" className="mt-0">
                  <VideoModelConfig
                    provider={selectedProvider}
                    config={videoConfig}
                    onChange={setVideoConfig}
                    sourceImageUrl={variation?.imageUrl}
                  />
                </TabsContent>

                {/* Prompt Tab */}
                <TabsContent value="prompt" className="mt-0 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                      Prompt de Mouvement
                    </Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Décrivez le mouvement souhaité..."
                      className="bg-[#14131a] border-blood-900/30 min-h-[200px] text-sm"
                    />
                    <p className="text-[10px] text-zinc-600">
                      Décrivez le mouvement, les actions des personnages, les effets visuels...
                    </p>
                  </div>

                  {/* Prompt Suggestions */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                      Suggestions MOOSTIK
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {getPromptSuggestions(animationType).map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPrompt((prev) => prev + (prev ? " " : "") + suggestion)}
                          className="px-2 py-1 text-[10px] bg-[#14131a] border border-blood-900/10 rounded-lg text-zinc-400 hover:text-white hover:border-blood-900/30 transition-colors"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shot Context */}
                  <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2 block">
                      Contexte du Shot
                    </Label>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Type de scène:</span>
                        <Badge variant="outline" className="text-[9px]">{shot.sceneType}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Personnages:</span>
                        <span className="text-white">{shot.characterIds?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Lieu:</span>
                        <span className="text-white">{shot.locationIds?.[0] || "Non défini"}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 border-t border-blood-900/30 bg-[#0b0b0e]/95">
          <div className="flex items-center justify-between w-full">
            <VideoCostEstimator
              provider={selectedProvider}
              shotCount={1}
              durationPerShot={videoConfig.durationSeconds || 5}
              showComparison={false}
              className="text-left"
            />

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-zinc-500 hover:text-white"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                className="moostik-btn-blood text-white px-8 font-bold"
              >
                <Check className="w-4 h-4 mr-2" />
                Appliquer
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function for prompt suggestions
function getPromptSuggestions(animationType: AnimationType): string[] {
  const suggestions: Record<AnimationType, string[]> = {
    subtle: [
      "gentle breathing",
      "slight wind movement",
      "ambient light flicker",
      "mosquito wings flutter",
    ],
    dialogue: [
      "speaking with emotion",
      "lip sync animation",
      "expressive gestures",
      "eye contact",
    ],
    action: [
      "quick movement",
      "dynamic camera",
      "impact moment",
      "fast transition",
    ],
    transition: [
      "smooth fade",
      "camera sweep",
      "scene morph",
      "time passage",
    ],
    establishing: [
      "slow pan",
      "wide reveal",
      "atmospheric lighting",
      "environmental detail",
    ],
    emotional: [
      "tear falling",
      "emotional expression",
      "subtle tremble",
      "intense gaze",
    ],
    combat: [
      "attack motion",
      "defensive stance",
      "impact effect",
      "blood splatter",
    ],
    death: [
      "slow motion fall",
      "dramatic collapse",
      "fade to darkness",
      "final breath",
    ],
    flashback: [
      "dream-like blur",
      "sepia tone",
      "memory fragments",
      "time distortion",
    ],
    dance: [
      "fluid choreography",
      "rhythmic motion",
      "graceful spin",
      "synchronized movement",
    ],
    walking: [
      "natural gait",
      "purposeful stride",
      "casual stroll",
      "determined march",
    ],
    flying: [
      "wing beat cycle",
      "aerial maneuver",
      "hovering motion",
      "flight path",
    ],
  };

  return suggestions[animationType] || [];
}

export default VideoShotEditor;
