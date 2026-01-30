"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Aperture,
  Move,
  Sun,
  Layers,
  Video,
  Clapperboard,
} from "lucide-react";
import {
  type CameraConfig,
  type SensorType,
  type LensType,
  type FilmStock,
  type StackedMovements,
  type MovementType,
  type LightingSetup,
  type LightingConfig,
  type DepthOfField,
  type CinemaPreset,
  CINEMA_PRESETS,
  buildCameraPrompt,
} from "@/lib/cinema/types";

// ============================================
// CINEMA STUDIO COMPONENT
// ============================================

interface CinemaStudioProps {
  /** Current camera config */
  camera: CameraConfig;

  /** On camera change */
  onCameraChange: (config: CameraConfig) => void;

  /** Current movements */
  movements?: StackedMovements;

  /** On movements change */
  onMovementsChange?: (movements: StackedMovements) => void;

  /** Current lighting */
  lighting?: LightingConfig;

  /** On lighting change */
  onLightingChange?: (lighting: LightingConfig) => void;

  /** Current depth of field */
  depthOfField?: DepthOfField;

  /** On depth of field change */
  onDepthOfFieldChange?: (dof: DepthOfField) => void;

  /** Mode: photography or videography */
  mode: "photography" | "videography";

  /** On mode change */
  onModeChange?: (mode: "photography" | "videography") => void;

  /** On preset select */
  onPresetSelect?: (preset: CinemaPreset) => void;

  /** Compact mode */
  compact?: boolean;
}

export function CinemaStudio({
  camera,
  onCameraChange,
  movements,
  onMovementsChange,
  lighting,
  onLightingChange,
  depthOfField: _depthOfField, // Reserved for future DOF controls
  onDepthOfFieldChange: _onDepthOfFieldChange, // Reserved for future DOF controls
  mode,
  onModeChange,
  onPresetSelect,
  compact = false,
}: CinemaStudioProps) {
  // Suppress unused variable warnings for reserved props
  void _depthOfField;
  void _onDepthOfFieldChange;

  const [activeTab, setActiveTab] = useState<string>("camera");

  // Update camera property
  const updateCamera = <K extends keyof CameraConfig>(
    key: K,
    value: CameraConfig[K]
  ) => {
    onCameraChange({ ...camera, [key]: value });
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", compact && "space-y-2")}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blood-600/20 to-purple-600/20 border border-blood-600/30 flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-blood-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-300">
                Cinema Studio
              </h3>
              <p className="text-xs text-zinc-600">
                Contrôle caméra professionnel
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2 p-1 bg-zinc-900/50 rounded-lg border border-zinc-800/30">
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 px-3 text-xs rounded-md",
                mode === "photography"
                  ? "bg-blood-900/30 text-blood-400"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
              onClick={() => onModeChange?.("photography")}
            >
              <Camera className="w-3 h-3 mr-1" />
              Photo
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 px-3 text-xs rounded-md",
                mode === "videography"
                  ? "bg-blood-900/30 text-blood-400"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
              onClick={() => onModeChange?.("videography")}
            >
              <Video className="w-3 h-3 mr-1" />
              Vidéo
            </Button>
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Presets Cinématiques
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CINEMA_PRESETS.filter((p) =>
              p.category === "moostik" || p.category === "blockbuster" || p.category === "cinematic"
            ).map((preset) => (
              <Button
                key={preset.id}
                size="sm"
                variant="outline"
                className={cn(
                  "h-8 px-3 text-xs whitespace-nowrap border-zinc-800 hover:border-blood-600/50",
                  "bg-zinc-900/30 hover:bg-blood-900/20"
                )}
                onClick={() => onPresetSelect?.(preset)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-zinc-900/50 border border-zinc-800/30 p-1 h-auto">
            <TabsTrigger
              value="camera"
              className="flex-1 text-xs data-[state=active]:bg-blood-900/30"
            >
              <Camera className="w-3 h-3 mr-1" />
              Caméra
            </TabsTrigger>
            <TabsTrigger
              value="lens"
              className="flex-1 text-xs data-[state=active]:bg-blood-900/30"
            >
              <Aperture className="w-3 h-3 mr-1" />
              Optique
            </TabsTrigger>
            {mode === "videography" && (
              <TabsTrigger
                value="motion"
                className="flex-1 text-xs data-[state=active]:bg-blood-900/30"
              >
                <Move className="w-3 h-3 mr-1" />
                Mouvement
              </TabsTrigger>
            )}
            <TabsTrigger
              value="lighting"
              className="flex-1 text-xs data-[state=active]:bg-blood-900/30"
            >
              <Sun className="w-3 h-3 mr-1" />
              Lumière
            </TabsTrigger>
          </TabsList>

          {/* Camera Tab */}
          <TabsContent value="camera" className="mt-4 space-y-4">
            <CameraSensorControl
              sensor={camera.sensor}
              onSensorChange={(sensor) => updateCamera("sensor", sensor)}
            />

            <FilmStockControl
              filmStock={camera.filmStock}
              onFilmStockChange={(stock) => updateCamera("filmStock", stock)}
            />
          </TabsContent>

          {/* Lens Tab */}
          <TabsContent value="lens" className="mt-4 space-y-4">
            <LensTypeControl
              lensType={camera.lens}
              onLensTypeChange={(lens) => updateCamera("lens", lens)}
            />

            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase text-zinc-500">
                    Focale
                  </Label>
                  <span className="text-xs font-mono text-zinc-400">
                    {camera.focalLength}mm
                  </span>
                </div>
                <Slider
                  value={[camera.focalLength]}
                  min={14}
                  max={200}
                  step={1}
                  onValueChange={([value]) => updateCamera("focalLength", value)}
                  className="w-full"
                />
                <div className="flex justify-between text-[9px] text-zinc-600">
                  <span>14mm (Ultra-wide)</span>
                  <span>200mm (Telephoto)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase text-zinc-500">
                    Ouverture
                  </Label>
                  <span className="text-xs font-mono text-zinc-400">
                    f/{camera.aperture}
                  </span>
                </div>
                <Slider
                  value={[camera.aperture]}
                  min={1.2}
                  max={16}
                  step={0.1}
                  onValueChange={([value]) => updateCamera("aperture", value)}
                  className="w-full"
                />
                <div className="flex justify-between text-[9px] text-zinc-600">
                  <span>f/1.2 (Shallow DOF)</span>
                  <span>f/16 (Deep DOF)</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Motion Tab (Video only) */}
          {mode === "videography" && (
            <TabsContent value="motion" className="mt-4 space-y-4">
              <CameraMovementControl
                movements={movements}
                onMovementsChange={onMovementsChange}
              />
            </TabsContent>
          )}

          {/* Lighting Tab */}
          <TabsContent value="lighting" className="mt-4 space-y-4">
            {lighting && (
              <LightingControl
                lighting={lighting}
                onLightingChange={onLightingChange}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Camera Prompt Preview */}
        <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/30">
          <p className="text-[10px] text-zinc-600 uppercase mb-2">
            Prompt Caméra Généré
          </p>
          <p className="text-xs text-zinc-400 font-mono leading-relaxed">
            {buildCameraPrompt(camera)}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface CameraSensorControlProps {
  sensor: SensorType;
  onSensorChange: (sensor: SensorType) => void;
}

function CameraSensorControl({ sensor, onSensorChange }: CameraSensorControlProps) {
  const sensors: { value: SensorType; label: string; description: string }[] = [
    { value: "full_frame", label: "Full Frame", description: "35mm - Standard" },
    { value: "super35", label: "Super 35", description: "Cinema standard" },
    { value: "aps_c", label: "APS-C", description: "1.5x crop" },
    { value: "16mm", label: "16mm", description: "Vintage film" },
    { value: "imax", label: "IMAX", description: "Large format" },
    { value: "65mm", label: "65mm", description: "Premium cinema" },
  ];

  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase text-zinc-500">Capteur</Label>
      <Select value={sensor} onValueChange={onSensorChange}>
        <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-800">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sensors.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              <div className="flex items-center gap-2">
                <span>{s.label}</span>
                <span className="text-xs text-zinc-500">({s.description})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface FilmStockControlProps {
  filmStock?: FilmStock;
  onFilmStockChange: (stock: FilmStock) => void;
}

function FilmStockControl({ filmStock, onFilmStockChange }: FilmStockControlProps) {
  const stocks: { value: FilmStock; label: string; style: string }[] = [
    { value: "kodak_vision3_500t", label: "Kodak Vision3 500T", style: "Warm tungsten" },
    { value: "kodak_vision3_250d", label: "Kodak Vision3 250D", style: "Daylight neutral" },
    { value: "fuji_eterna", label: "Fuji Eterna", style: "Neutral, fine grain" },
    { value: "cinestill_800t", label: "CineStill 800T", style: "Halation glow" },
    { value: "tri_x_400", label: "Tri-X 400", style: "B&W classic" },
    { value: "digital_arri", label: "ARRI LogC", style: "Digital cinema" },
    { value: "digital_red", label: "RED IPP2", style: "High dynamic range" },
  ];

  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase text-zinc-500">Film Stock</Label>
      <div className="grid grid-cols-2 gap-2">
        {stocks.slice(0, 6).map((stock) => (
          <Button
            key={stock.value}
            size="sm"
            variant="outline"
            className={cn(
              "h-auto py-2 px-3 text-left justify-start border-zinc-800",
              filmStock === stock.value
                ? "bg-blood-900/30 border-blood-600/50"
                : "bg-zinc-900/30 hover:bg-zinc-900/50"
            )}
            onClick={() => onFilmStockChange(stock.value)}
          >
            <div>
              <p className="text-xs font-medium">{stock.label}</p>
              <p className="text-[10px] text-zinc-500">{stock.style}</p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

interface LensTypeControlProps {
  lensType: LensType;
  onLensTypeChange: (lens: LensType) => void;
}

function LensTypeControl({ lensType, onLensTypeChange }: LensTypeControlProps) {
  const lenses: { value: LensType; label: string; icon: string }[] = [
    { value: "spherical", label: "Spherical", icon: "○" },
    { value: "anamorphic", label: "Anamorphic", icon: "⬭" },
    { value: "vintage", label: "Vintage", icon: "◐" },
    { value: "cinema_prime", label: "Cinema Prime", icon: "◉" },
    { value: "macro", label: "Macro", icon: "⊙" },
  ];

  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase text-zinc-500">Type d&apos;Objectif</Label>
      <div className="flex gap-2">
        {lenses.map((lens) => (
          <Tooltip key={lens.value}>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "flex-1 h-10 border-zinc-800",
                  lensType === lens.value
                    ? "bg-blood-900/30 border-blood-600/50"
                    : "bg-zinc-900/30 hover:bg-zinc-900/50"
                )}
                onClick={() => onLensTypeChange(lens.value)}
              >
                <span className="text-lg mr-1">{lens.icon}</span>
                <span className="text-[10px]">{lens.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{lens.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

interface CameraMovementControlProps {
  movements?: StackedMovements;
  onMovementsChange?: (movements: StackedMovements) => void;
}

function CameraMovementControl({
  movements,
  onMovementsChange,
}: CameraMovementControlProps) {
  const movementTypes: { value: MovementType; label: string }[] = [
    { value: "static", label: "Statique" },
    { value: "pan", label: "Pan" },
    { value: "tilt", label: "Tilt" },
    { value: "dolly", label: "Dolly" },
    { value: "tracking", label: "Tracking" },
    { value: "orbit", label: "Orbit" },
    { value: "crane", label: "Crane" },
    { value: "handheld", label: "Handheld" },
    { value: "push_in", label: "Push In" },
    { value: "pull_out", label: "Pull Out" },
  ];

  const updatePrimary = (type: MovementType) => {
    onMovementsChange?.({
      primary: {
        type,
        intensity: movements?.primary?.intensity || 50,
        easing: movements?.primary?.easing || "ease_in_out",
      },
      secondary: movements?.secondary,
      tertiary: movements?.tertiary,
    });
  };

  return (
    <div className="space-y-4">
      {/* Primary Movement */}
      <div className="space-y-2">
        <Label className="text-[10px] uppercase text-zinc-500">
          Mouvement Principal
        </Label>
        <Select
          value={movements?.primary?.type || "static"}
          onValueChange={(value) => updatePrimary(value as MovementType)}
        >
          <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {movementTypes.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {movements?.primary?.type !== "static" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] uppercase text-zinc-500">
                Intensité
              </Label>
              <span className="text-xs font-mono text-zinc-400">
                {movements?.primary?.intensity || 50}%
              </span>
            </div>
            <Slider
              value={[movements?.primary?.intensity || 50]}
              min={0}
              max={100}
              step={5}
              onValueChange={([value]) => {
                if (movements?.primary) {
                  onMovementsChange?.({
                    ...movements,
                    primary: { ...movements.primary, intensity: value },
                  });
                }
              }}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Stack info */}
      <div className="p-2 rounded-lg bg-zinc-900/30 border border-zinc-800/30">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Layers className="w-3 h-3" />
          <span>Jusqu&apos;à 3 mouvements simultanés</span>
        </div>
      </div>
    </div>
  );
}

interface LightingControlProps {
  lighting: LightingConfig;
  onLightingChange?: (lighting: LightingConfig) => void;
}

function LightingControl({ lighting, onLightingChange }: LightingControlProps) {
  const setups: { value: LightingSetup; label: string; icon: string }[] = [
    { value: "natural_daylight", label: "Daylight", icon: "☀️" },
    { value: "golden_hour", label: "Golden Hour", icon: "🌅" },
    { value: "blue_hour", label: "Blue Hour", icon: "🌆" },
    { value: "night_moonlight", label: "Moonlight", icon: "🌙" },
    { value: "studio_rembrandt", label: "Rembrandt", icon: "🎨" },
    { value: "neon_noir", label: "Neon Noir", icon: "🌃" },
    { value: "bioluminescent", label: "Bioluminescent", icon: "✨" },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-[10px] uppercase text-zinc-500">Setup Lumière</Label>
        <div className="grid grid-cols-2 gap-2">
          {setups.map((setup) => (
            <Button
              key={setup.value}
              size="sm"
              variant="outline"
              className={cn(
                "h-10 justify-start border-zinc-800",
                lighting.setup === setup.value
                  ? "bg-blood-900/30 border-blood-600/50"
                  : "bg-zinc-900/30 hover:bg-zinc-900/50"
              )}
              onClick={() => onLightingChange?.({ ...lighting, setup: setup.value })}
            >
              <span className="mr-2">{setup.icon}</span>
              <span className="text-xs">{setup.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Color Temperature */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] uppercase text-zinc-500">
            Température Couleur
          </Label>
          <span className="text-xs font-mono text-zinc-400">
            {lighting.colorTemperature}K
          </span>
        </div>
        <Slider
          value={[lighting.colorTemperature]}
          min={2000}
          max={10000}
          step={100}
          onValueChange={([value]) =>
            onLightingChange?.({ ...lighting, colorTemperature: value })
          }
          className="w-full"
        />
        <div className="flex justify-between text-[9px] text-zinc-600">
          <span>2000K (Chaud)</span>
          <span>10000K (Froid)</span>
        </div>
      </div>

      {/* Rim Light Toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-xs text-zinc-400">Rim Light</Label>
        <Switch
          checked={lighting.rimLight}
          onCheckedChange={(checked) =>
            onLightingChange?.({ ...lighting, rimLight: checked })
          }
        />
      </div>

      {/* Atmosphere */}
      <div className="space-y-2">
        <Label className="text-[10px] uppercase text-zinc-500">Atmosphère</Label>
        <Select
          value={lighting.atmosphere || "none"}
          onValueChange={(value) =>
            onLightingChange?.({
              ...lighting,
              atmosphere: value as LightingConfig["atmosphere"],
            })
          }
        >
          <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucune</SelectItem>
            <SelectItem value="haze">Brume</SelectItem>
            <SelectItem value="fog">Brouillard</SelectItem>
            <SelectItem value="smoke">Fumée</SelectItem>
            <SelectItem value="dust">Poussière</SelectItem>
            <SelectItem value="particles">Particules</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default CinemaStudio;
