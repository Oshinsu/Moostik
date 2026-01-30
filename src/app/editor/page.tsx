"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  FastForward,
  FileVideo,
  Music,
  Pause,
  Play,
  Plus,
  Rewind,
  Scissors,
  SkipBack,
  SkipForward,
  Sparkles,
  Type,
  Volume2,
  Wand2,
  Zap,
} from "lucide-react";
import {
  type AutoEditMode,
  EDIT_PRESETS,
} from "@/lib/editor/ai-editing";
import {
  PLATFORM_PRESETS,
} from "@/lib/editor/export";

// ============================================
// MOCK DATA
// ============================================

interface MockTrack {
  id: string;
  name: string;
  type: "video" | "audio" | "subtitle";
  color: string;
  items: MockTrackItem[];
  muted?: boolean;
  locked?: boolean;
}

interface MockTrackItem {
  id: string;
  name: string;
  start: number; // seconds
  duration: number; // seconds
  color?: string;
}

const MOCK_TRACKS: MockTrack[] = [
  {
    id: "v1",
    name: "Vidéo principale",
    type: "video",
    color: "#8B0000",
    items: [
      { id: "v1-1", name: "Intro - EP01", start: 0, duration: 5 },
      { id: "v1-2", name: "Scène dialogue", start: 5, duration: 8 },
      { id: "v1-3", name: "Action combat", start: 13, duration: 6 },
      { id: "v1-4", name: "Conclusion", start: 19, duration: 4 },
    ],
  },
  {
    id: "v2",
    name: "Overlay effets",
    type: "video",
    color: "#4B0082",
    items: [
      { id: "v2-1", name: "Effet sang", start: 15, duration: 3 },
    ],
  },
  {
    id: "a1",
    name: "Musique",
    type: "audio",
    color: "#006400",
    items: [
      { id: "a1-1", name: "Dark Ambience", start: 0, duration: 23 },
    ],
  },
  {
    id: "a2",
    name: "Dialogues",
    type: "audio",
    color: "#DAA520",
    items: [
      { id: "a2-1", name: "Réplique Moustik", start: 5, duration: 3 },
      { id: "a2-2", name: "Réplique Viktor", start: 9, duration: 2 },
    ],
  },
  {
    id: "s1",
    name: "Sous-titres",
    type: "subtitle",
    color: "#4169E1",
    items: [
      { id: "s1-1", name: "\"La guerre commence...\"", start: 5, duration: 3 },
      { id: "s1-2", name: "\"Préparez-vous.\"", start: 9, duration: 2 },
    ],
  },
];

// ============================================
// PAGE COMPONENT
// ============================================

export default function EditorPage() {
  const [tracks, setTracks] = useState<MockTrack[]>(MOCK_TRACKS);
  const [playhead, setPlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // setPlayhead will be used for playback functionality
  void setPlayhead;
  const [zoom, setZoom] = useState(50);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [autoEditMode, setAutoEditMode] = useState<AutoEditMode>("beat_sync");
  const [exportPreset, setExportPreset] = useState<string>("youtube_4k");

  const totalDuration = 23; // seconds
  const pixelsPerSecond = zoom * 2;

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 24);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
  };

  // Toggle track mute
  const toggleMute = (trackId: string) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, muted: !t.muted } : t
    ));
  };

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-[#0a0a0d] overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 border-b border-blood-900/30 bg-gradient-to-r from-[#0b0b0e] to-[#14131a]">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600/30 to-blood-600/20 border border-emerald-600/30 flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">
                    Montage IA
                  </h1>
                  <p className="text-xs text-zinc-500">
                    Timeline • Beat Sync • Export SOTA
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-900/30 text-emerald-400 border-emerald-900/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  IA Activée
                </Badge>

                {/* Export Dropdown */}
                <Select value={exportPreset} onValueChange={setExportPreset}>
                  <SelectTrigger className="w-[180px] h-8 text-xs bg-zinc-900/50 border-zinc-800">
                    <Download className="w-3 h-3 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORM_PRESETS.slice(0, 8).map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button size="sm" className="moostik-btn-blood text-white h-8">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: AI Tools */}
          <div className="w-64 flex-shrink-0 border-r border-zinc-800/50 bg-zinc-900/20 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* AI Auto-Edit */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Montage IA
                </label>

                <Select value={autoEditMode} onValueChange={(v) => setAutoEditMode(v as AutoEditMode)}>
                  <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beat_sync">Beat Sync</SelectItem>
                    <SelectItem value="energy_match">Energy Match</SelectItem>
                    <SelectItem value="highlight_reel">Highlights</SelectItem>
                    <SelectItem value="montage">Montage</SelectItem>
                    <SelectItem value="music_video">Music Video</SelectItem>
                    <SelectItem value="trailer">Trailer</SelectItem>
                    <SelectItem value="social_short">Social Short</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="w-full bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-900/30">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Auto-Monter
                </Button>
              </div>

              {/* Edit Presets */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Presets Rapides
                </label>
                <div className="space-y-1">
                  {EDIT_PRESETS.slice(0, 5).map((preset) => (
                    <Button
                      key={preset.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    >
                      <Zap className="w-3 h-3 mr-2 text-amber-400" />
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tools */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Outils
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 border-zinc-800 bg-zinc-900/30">
                        <Music className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Analyse audio</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 border-zinc-800 bg-zinc-900/30">
                        <Scissors className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Couper</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 border-zinc-800 bg-zinc-900/30">
                        <Type className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Sous-titres</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 border-zinc-800 bg-zinc-900/30">
                        <Sparkles className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Effets IA</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Preview & Timeline */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Preview */}
            <div className="flex-shrink-0 p-4 border-b border-zinc-800/50">
              <div className="aspect-video max-h-[300px] mx-auto rounded-lg bg-zinc-900/50 border border-zinc-800/30 flex items-center justify-center relative">
                <div className="text-center">
                  <FileVideo className="w-16 h-16 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">Aperçu vidéo</p>
                  <p className="text-xs text-zinc-600">EP01 - MOOSTIK</p>
                </div>

                {/* Timecode overlay */}
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 rounded font-mono text-sm text-white">
                  {formatTime(playhead)} / {formatTime(totalDuration)}
                </div>
              </div>
            </div>

            {/* Transport Controls */}
            <div className="flex-shrink-0 px-4 py-2 border-b border-zinc-800/50 flex items-center justify-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                <Rewind className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                className={cn(
                  "h-10 w-10 p-0 rounded-full",
                  isPlaying ? "bg-blood-600 hover:bg-blood-700" : "bg-zinc-800 hover:bg-zinc-700"
                )}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                <FastForward className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                <SkipForward className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-zinc-800 mx-2" />

              {/* Zoom */}
              <div className="flex items-center gap-2 w-32">
                <span className="text-[10px] text-zinc-500">Zoom</span>
                <Slider
                  value={[zoom]}
                  min={20}
                  max={100}
                  step={5}
                  onValueChange={([v]) => setZoom(v)}
                  className="w-20"
                />
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Time ruler */}
              <div className="flex-shrink-0 h-6 bg-zinc-900/50 border-b border-zinc-800/50 flex">
                <div className="w-40 flex-shrink-0 border-r border-zinc-800/50" />
                <div className="flex-1 relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full flex"
                    style={{ width: `${totalDuration * pixelsPerSecond}px` }}
                  >
                    {[...Array(Math.ceil(totalDuration))].map((_, i) => (
                      <div
                        key={i}
                        className="h-full border-l border-zinc-800/30 text-[9px] text-zinc-600 px-1"
                        style={{ width: `${pixelsPerSecond}px` }}
                      >
                        {i}s
                      </div>
                    ))}
                  </div>

                  {/* Playhead */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-blood-500 z-10"
                    style={{ left: `${playhead * pixelsPerSecond}px` }}
                  >
                    <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-blood-500 rounded-sm" />
                  </div>
                </div>
              </div>

              {/* Tracks */}
              <ScrollArea className="flex-1">
                <div className="min-h-full">
                  {tracks.map((track) => (
                    <div
                      key={track.id}
                      className={cn(
                        "flex border-b border-zinc-800/30 h-16",
                        selectedTrack === track.id && "bg-zinc-900/30"
                      )}
                    >
                      {/* Track header */}
                      <div
                        className="w-40 flex-shrink-0 border-r border-zinc-800/50 p-2 flex items-center gap-2 cursor-pointer hover:bg-zinc-800/30"
                        onClick={() => setSelectedTrack(track.id)}
                      >
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: track.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-zinc-300 truncate">
                            {track.name}
                          </p>
                          <p className="text-[10px] text-zinc-600">
                            {track.type === "video" ? "Vidéo" : track.type === "audio" ? "Audio" : "Sous-titres"}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {track.type === "audio" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-6 w-6 p-0",
                                track.muted ? "text-red-400" : "text-zinc-500"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMute(track.id);
                              }}
                            >
                              <Volume2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Track items */}
                      <div className="flex-1 relative overflow-hidden">
                        <div
                          className="absolute top-2 bottom-2 left-0"
                          style={{ width: `${totalDuration * pixelsPerSecond}px` }}
                        >
                          {track.items.map((item) => (
                            <div
                              key={item.id}
                              className={cn(
                                "absolute top-0 bottom-0 rounded cursor-pointer border transition-all",
                                selectedItem === item.id
                                  ? "border-white ring-1 ring-white/30"
                                  : "border-transparent hover:border-white/30"
                              )}
                              style={{
                                left: `${item.start * pixelsPerSecond}px`,
                                width: `${item.duration * pixelsPerSecond}px`,
                                backgroundColor: track.color + "80",
                              }}
                              onClick={() => setSelectedItem(item.id)}
                            >
                              <div className="h-full px-2 flex items-center overflow-hidden">
                                <span className="text-[10px] text-white truncate font-medium">
                                  {item.name}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Playhead line */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-blood-500/50 z-10"
                          style={{ left: `${playhead * pixelsPerSecond}px` }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Add track button */}
                  <div className="flex border-b border-zinc-800/30 h-10">
                    <div className="w-40 flex-shrink-0 border-r border-zinc-800/50 p-2">
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-zinc-500 hover:text-white">
                        <Plus className="w-3 h-3 mr-1" />
                        Ajouter piste
                      </Button>
                    </div>
                    <div className="flex-1" />
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Right Panel: Properties */}
          <div className="w-64 flex-shrink-0 border-l border-zinc-800/50 bg-zinc-900/20 overflow-y-auto">
            <div className="p-4 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Propriétés
                </label>

                {selectedItem ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/30">
                      <p className="text-xs font-medium text-white mb-1">
                        {tracks.flatMap(t => t.items).find(i => i.id === selectedItem)?.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Durée: {tracks.flatMap(t => t.items).find(i => i.id === selectedItem)?.duration}s
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500">Position</label>
                      <Slider
                        defaultValue={[0]}
                        max={totalDuration}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500">Vitesse</label>
                      <Slider
                        defaultValue={[100]}
                        min={25}
                        max={400}
                        step={25}
                        className="w-full"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-600">
                    Sélectionnez un élément pour voir ses propriétés
                  </p>
                )}
              </div>

              {/* Export Info */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Export
                </label>
                <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/30 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-zinc-500">Format</span>
                    <span className="text-[10px] text-zinc-300">
                      {PLATFORM_PRESETS.find(p => p.id === exportPreset)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-zinc-500">Codec</span>
                    <span className="text-[10px] text-zinc-300">
                      {PLATFORM_PRESETS.find(p => p.id === exportPreset)?.video.codec?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-zinc-500">Résolution</span>
                    <span className="text-[10px] text-zinc-300">
                      {PLATFORM_PRESETS.find(p => p.id === exportPreset)?.video.resolution}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-zinc-500">Durée</span>
                    <span className="text-[10px] text-zinc-300">{formatTime(totalDuration)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
