"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music,
  Wand2,
  Settings,
  Download,
  Grid3X3,
  Zap,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  type MusicalGrid,
  type CutPoint,
  type AutoEditConfig,
  type VideoSegment,
  type EditTimeline,
  type NoteValue,
  type MontageSymhonyId,
  type MontageSymhony,
  NOTE_NAMES_FR,
  NOTE_SYMBOLS,
  NOTE_MULTIPLIERS,
  DEFAULT_AUTO_EDIT_CONFIG,
  MONTAGE_SYMPHONIES,
  generateMusicalGrid,
  generateCutPoints,
  createAutoEditTimeline,
  exportToEDL,
  applySymphonyToGrid,
  getMontageSymhoniesByCategory,
} from "@/lib/audio/beat-sync";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ============================================================================
// TYPES
// ============================================================================

interface VideoSource {
  shotId: string;
  variationId: string;
  url: string;
  thumbnailUrl?: string;
  duration: number;
  shotName: string;
  sceneType?: string;
}

interface BeatSyncEditorProps {
  videos: VideoSource[];
  audioUrl?: string;
  initialBpm?: number;
  duration?: number;
  onTimelineGenerated?: (timeline: EditTimeline) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BeatSyncEditor({
  videos,
  audioUrl,
  initialBpm = 120,
  duration = 180,
  onTimelineGenerated,
}: BeatSyncEditorProps) {
  // State
  const [bpm, setBpm] = useState(initialBpm);
  const [timeSignature, setTimeSignature] = useState({ numerator: 4, denominator: 4 });
  const [grid, setGrid] = useState<MusicalGrid | null>(null);
  const [cutPoints, setCutPoints] = useState<CutPoint[]>([]);
  const [timeline, setTimeline] = useState<EditTimeline | null>(null);
  const [config, setConfig] = useState<AutoEditConfig>(DEFAULT_AUTO_EDIT_CONFIG);
  
  // Symphony state
  const [selectedSymphony, setSelectedSymphony] = useState<MontageSymhonyId | null>(null);
  const [symphonyCategory, setSymphonyCategory] = useState<"director" | "genre" | "musical" | "social" | "structure">("director");
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // UI state
  const [zoom, setZoom] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showSymphonies, setShowSymphonies] = useState(true);
  const [selectedCutType, setSelectedCutType] = useState<NoteValue>("quarter");
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // ========================================================================
  // EFFECTS
  // ========================================================================
  
  // Générer la grille quand BPM, signature ou symphonie change
  useEffect(() => {
    const newGrid = generateMusicalGrid(bpm, duration, timeSignature);
    setGrid(newGrid);
    
    // Si une symphonie est sélectionnée, utiliser son pattern
    if (selectedSymphony) {
      const symphony = MONTAGE_SYMPHONIES[selectedSymphony];
      const symphonyCuts = applySymphonyToGrid(symphony, newGrid, duration);
      setCutPoints(symphonyCuts);
      setConfig(symphony.config);
    } else {
      const newCutPoints = generateCutPoints(newGrid, config);
      setCutPoints(newCutPoints);
    }
  }, [bpm, duration, timeSignature, config, selectedSymphony]);
  
  // Appliquer le BPM recommandé quand on sélectionne une symphonie
  useEffect(() => {
    if (selectedSymphony) {
      const symphony = MONTAGE_SYMPHONIES[selectedSymphony];
      if (bpm < symphony.recommendedBpm.min || bpm > symphony.recommendedBpm.max) {
        setBpm(symphony.recommendedBpm.ideal);
      }
    }
  }, [selectedSymphony]);
  
  // Mettre à jour le temps de lecture
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }
    
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      } else {
        setCurrentTime((prev) => {
          const next = prev + 1/60; // ~60fps
          if (next >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }
      animationRef.current = requestAnimationFrame(updateTime);
    };
    
    animationRef.current = requestAnimationFrame(updateTime);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, duration]);
  
  // Scroll timeline to follow playhead
  useEffect(() => {
    if (timelineRef.current && isPlaying) {
      const scrollPosition = (currentTime / duration) * timelineRef.current.scrollWidth - 200;
      timelineRef.current.scrollLeft = Math.max(0, scrollPosition);
    }
  }, [currentTime, duration, isPlaying]);
  
  // ========================================================================
  // HANDLERS
  // ========================================================================
  
  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);
  
  const seekTo = useCallback((time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);
  
  const generateAutoEdit = useCallback(() => {
    if (!grid || videos.length === 0) return;
    
    const videoSources = videos.map((v) => ({
      shotId: v.shotId,
      variationId: v.variationId,
      url: v.url,
      duration: v.duration,
      sceneType: v.sceneType,
      narrativeWeight: 0.5,
    }));
    
    const newTimeline = createAutoEditTimeline(videoSources, grid, config);
    setTimeline(newTimeline);
    onTimelineGenerated?.(newTimeline);
  }, [grid, videos, config, onTimelineGenerated]);
  
  const exportEDL = useCallback(() => {
    if (!timeline) return;
    
    const edlContent = exportToEDL(timeline, "MOOSTIK_BEAT_SYNC");
    const blob = new Blob([edlContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `moostik-edit-${bpm}bpm.edl`;
    a.click();
    
    URL.revokeObjectURL(url);
  }, [timeline, bpm]);
  
  // ========================================================================
  // COMPUTED
  // ========================================================================
  
  const pixelsPerSecond = useMemo(() => 50 * zoom, [zoom]);
  
  const currentBeat = useMemo(() => {
    if (!grid) return null;
    const beatIndex = Math.floor(currentTime / grid.beatDuration);
    const measureIndex = Math.floor(currentTime / grid.measureDuration);
    const beatInMeasure = (beatIndex % timeSignature.numerator) + 1;
    return { beatIndex, measureIndex: measureIndex + 1, beatInMeasure };
  }, [currentTime, grid, timeSignature]);
  
  // ========================================================================
  // RENDER
  // ========================================================================
  
  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-[#0b0b0e] text-white">
        {/* Audio element (hidden) */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            muted={isMuted}
            onEnded={() => setIsPlaying(false)}
          />
        )}
        
        {/* ================================================================ */}
        {/* HEADER - Controls */}
        {/* ================================================================ */}
        <div className="flex items-center justify-between p-4 border-b border-blood-900/30 bg-[#14131a]">
          <div className="flex items-center gap-4">
            {/* BPM Input */}
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-blood-400" />
              <Input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                className="w-20 h-8 bg-[#0b0b0e] border-blood-900/30 text-center font-mono"
                min={40}
                max={200}
              />
              <span className="text-xs text-zinc-500">BPM</span>
            </div>
            
            {/* Time Signature */}
            <Select
              value={`${timeSignature.numerator}/${timeSignature.denominator}`}
              onValueChange={(v) => {
                const [num, den] = v.split("/").map(Number);
                setTimeSignature({ numerator: num, denominator: den });
              }}
            >
              <SelectTrigger className="w-20 h-8 bg-[#0b0b0e] border-blood-900/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#14131a] border-blood-900/30">
                <SelectItem value="4/4">4/4</SelectItem>
                <SelectItem value="3/4">3/4</SelectItem>
                <SelectItem value="6/8">6/8</SelectItem>
                <SelectItem value="2/4">2/4</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Current position display */}
            <div className="px-3 py-1 rounded bg-[#0b0b0e] border border-blood-900/30">
              <span className="font-mono text-sm">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(1).padStart(4, "0")}
              </span>
              {currentBeat && (
                <span className="text-xs text-blood-400 ml-2">
                  M{currentBeat.measureIndex} B{currentBeat.beatInMeasure}
                </span>
              )}
            </div>
          </div>
          
          {/* Transport Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => seekTo(0)}
              className="text-zinc-400 hover:text-white"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={togglePlay}
              className={`w-10 h-10 rounded-full ${
                isPlaying ? "bg-blood-600 hover:bg-blood-500" : "bg-emerald-600 hover:bg-emerald-500"
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="text-zinc-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={generateAutoEdit}
              disabled={videos.length === 0}
              className="moostik-btn-blood"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Auto-Edit
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="border-zinc-700"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            {timeline && (
              <Button
                variant="outline"
                onClick={exportEDL}
                className="border-emerald-700 text-emerald-400"
              >
                <Download className="w-4 h-4 mr-2" />
                Export EDL
              </Button>
            )}
          </div>
        </div>
        
        {/* ================================================================ */}
        {/* SYMPHONIES DE MONTAGE */}
        {/* ================================================================ */}
        {showSettings && (
          <div className="border-b border-blood-900/30 bg-[#14131a]/80">
            <Tabs defaultValue="symphonies" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-blood-900/20 rounded-none h-10 p-0">
                <TabsTrigger 
                  value="symphonies" 
                  className="data-[state=active]:bg-blood-900/30 data-[state=active]:text-blood-400 rounded-none border-b-2 border-transparent data-[state=active]:border-blood-500"
                >
                  🎬 Symphonies de Montage
                </TabsTrigger>
                <TabsTrigger 
                  value="manual" 
                  className="data-[state=active]:bg-zinc-800/50 rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-500"
                >
                  ⚙️ Manuel
                </TabsTrigger>
                <TabsTrigger 
                  value="notes" 
                  className="data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-400 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500"
                >
                  🎵 Notes
                </TabsTrigger>
              </TabsList>
              
              {/* SYMPHONIES TAB */}
              <TabsContent value="symphonies" className="p-4 m-0">
                <div className="flex gap-2 mb-4">
                  {(["director", "genre", "musical", "structure", "social"] as const).map((cat) => (
                    <Button
                      key={cat}
                      variant={symphonyCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSymphonyCategory(cat)}
                      className={symphonyCategory === cat 
                        ? "bg-blood-600 text-white" 
                        : "border-zinc-700 text-zinc-400 hover:text-white"
                      }
                    >
                      {cat === "director" && "🎬 Réalisateurs"}
                      {cat === "genre" && "🎭 Genres"}
                      {cat === "musical" && "🎵 Musical"}
                      {cat === "structure" && "📐 Structure"}
                      {cat === "social" && "📱 Social"}
                    </Button>
                  ))}
                </div>
                
                <ScrollArea className="h-[180px]">
                  <div className="grid grid-cols-3 gap-2">
                    {getMontageSymhoniesByCategory(symphonyCategory).map((symphony) => (
                      <div
                        key={symphony.id}
                        onClick={() => setSelectedSymphony(selectedSymphony === symphony.id ? null : symphony.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedSymphony === symphony.id
                            ? "bg-blood-900/40 border-blood-500 ring-1 ring-blood-500/50"
                            : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{symphony.icon}</span>
                          <span className="font-bold text-sm text-white">{symphony.nameFr}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mb-2 line-clamp-2">{symphony.descriptionFr}</p>
                        <div className="flex items-center gap-2 text-[9px]">
                          <Badge className="bg-zinc-800 text-zinc-400 border-0">
                            ASL {symphony.reference.avgShotLength}s
                          </Badge>
                          <Badge className="bg-zinc-800 text-zinc-400 border-0">
                            {symphony.reference.cutsPerMinute} CPM
                          </Badge>
                          <Badge className="bg-blood-900/50 text-blood-400 border-0">
                            {symphony.recommendedBpm.ideal} BPM
                          </Badge>
                        </div>
                        {symphony.reference.source && (
                          <p className="text-[8px] text-zinc-600 mt-1 italic truncate">
                            {symphony.reference.source}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {selectedSymphony && (
                  <div className="mt-3 p-3 bg-blood-900/20 border border-blood-700/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{MONTAGE_SYMPHONIES[selectedSymphony].icon}</span>
                        <div>
                          <p className="font-bold text-white">{MONTAGE_SYMPHONIES[selectedSymphony].nameFr}</p>
                          <p className="text-xs text-zinc-400">
                            Pattern: {MONTAGE_SYMPHONIES[selectedSymphony].pattern.type}
                            {MONTAGE_SYMPHONIES[selectedSymphony].pattern.phases && 
                              ` • ${MONTAGE_SYMPHONIES[selectedSymphony].pattern.phases.length} phases`
                            }
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSymphony(null)}
                        className="border-zinc-700 text-zinc-400"
                      >
                        Désactiver
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* MANUAL TAB */}
              <TabsContent value="manual" className="p-4 m-0">
                <div className="grid grid-cols-4 gap-4">
                  {/* Cut Resolution */}
                  <div>
                    <Label className="text-xs text-zinc-500 mb-2 block">Résolution</Label>
                    <Select
                      value={config.preferredCuts[0]}
                      onValueChange={(v) => {
                        setSelectedSymphony(null);
                        setConfig({ ...config, preferredCuts: [v as NoteValue] });
                      }}
                    >
                      <SelectTrigger className="bg-[#0b0b0e] border-blood-900/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#14131a] border-blood-900/30">
                        {(["whole", "half", "dotted_half", "quarter", "dotted_quarter", "eighth", "sixteenth", "thirtysecond"] as NoteValue[]).map((note) => (
                          <SelectItem key={note} value={note}>
                            {NOTE_SYMBOLS[note]} {NOTE_NAMES_FR[note]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Min Duration */}
                  <div>
                    <Label className="text-xs text-zinc-500 mb-2 block">
                      Min: {config.minCutDuration.toFixed(1)}s
                    </Label>
                    <Slider
                      value={[config.minCutDuration]}
                      onValueChange={([v]) => {
                        setSelectedSymphony(null);
                        setConfig({ ...config, minCutDuration: v });
                      }}
                      min={0.25}
                      max={10}
                      step={0.25}
                    />
                  </div>
                  
                  {/* Max Duration */}
                  <div>
                    <Label className="text-xs text-zinc-500 mb-2 block">
                      Max: {config.maxCutDuration.toFixed(1)}s
                    </Label>
                    <Slider
                      value={[config.maxCutDuration]}
                      onValueChange={([v]) => {
                        setSelectedSymphony(null);
                        setConfig({ ...config, maxCutDuration: v });
                      }}
                      min={1}
                      max={30}
                      step={1}
                    />
                  </div>
                  
                  {/* Strong Beats */}
                  <div>
                    <Label className="text-xs text-zinc-500 mb-2 block">Temps forts</Label>
                    <Button
                      variant={config.preferStrongBeats ? "default" : "outline"}
                      size="sm"
                      className={config.preferStrongBeats ? "bg-blood-600" : "border-zinc-700"}
                      onClick={() => {
                        setSelectedSymphony(null);
                        setConfig({ ...config, preferStrongBeats: !config.preferStrongBeats });
                      }}
                    >
                      {config.preferStrongBeats ? "Oui" : "Non"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* NOTES TAB */}
              <TabsContent value="notes" className="p-4 m-0">
                <div className="grid grid-cols-5 gap-2">
                  {([
                    { note: "whole" as const, desc: "4 temps" },
                    { note: "half" as const, desc: "2 temps" },
                    { note: "dotted_half" as const, desc: "3 temps" },
                    { note: "quarter" as const, desc: "1 temps" },
                    { note: "dotted_quarter" as const, desc: "1.5 temps" },
                    { note: "eighth" as const, desc: "½ temps" },
                    { note: "dotted_eighth" as const, desc: "¾ temps" },
                    { note: "triplet_quarter" as const, desc: "⅔ temps" },
                    { note: "sixteenth" as const, desc: "¼ temps" },
                    { note: "triplet_eighth" as const, desc: "⅓ temps" },
                    { note: "thirtysecond" as const, desc: "⅛ temps" },
                    { note: "sixtyfourth" as const, desc: "1/16 temps" },
                    { note: "hundredtwentyeighth" as const, desc: "1/32 temps" },
                  ]).map(({ note, desc }) => (
                    <div
                      key={note}
                      className={`p-2 rounded border text-center cursor-pointer transition-all ${
                        config.preferredCuts.includes(note)
                          ? "bg-emerald-900/40 border-emerald-500"
                          : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600"
                      }`}
                      onClick={() => {
                        setSelectedSymphony(null);
                        const isSelected = config.preferredCuts.includes(note);
                        setConfig({
                          ...config,
                          preferredCuts: isSelected
                            ? config.preferredCuts.filter(n => n !== note)
                            : [...config.preferredCuts, note],
                        });
                      }}
                    >
                      <span className="text-2xl block">{NOTE_SYMBOLS[note]}</span>
                      <span className="text-xs font-bold text-white">{NOTE_NAMES_FR[note]}</span>
                      <span className="text-[9px] text-zinc-500 block">{desc}</span>
                      <span className="text-[9px] text-emerald-400 block">
                        {grid ? `${(grid.beatDuration * NOTE_MULTIPLIERS[note] * 1000).toFixed(0)}ms` : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {/* ================================================================ */}
        {/* TIMELINE */}
        {/* ================================================================ */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Zoom controls */}
          <div className="flex items-center gap-4 p-2 border-b border-blood-900/20 bg-[#0b0b0e]">
            <span className="text-xs text-zinc-500">Zoom:</span>
            <Slider
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              min={0.25}
              max={4}
              step={0.25}
              className="w-32"
            />
            <span className="text-xs text-zinc-400">{zoom}x</span>
            
            {grid && (
              <div className="ml-auto flex items-center gap-4 text-xs text-zinc-500">
                <span>{grid.beats.length} beats</span>
                <span>{grid.measures.length} mesures</span>
                <span>{cutPoints.length} cuts suggérés</span>
              </div>
            )}
          </div>
          
          {/* Timeline scrollable area */}
          <div 
            ref={timelineRef}
            className="flex-1 overflow-x-auto overflow-y-hidden"
            onClick={(e) => {
              if (timelineRef.current) {
                const rect = timelineRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
                const time = x / pixelsPerSecond;
                seekTo(Math.max(0, Math.min(duration, time)));
              }
            }}
          >
            <div
              className="relative h-full min-h-[300px]"
              style={{ width: `${duration * pixelsPerSecond}px` }}
            >
              {/* Ruler */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-[#14131a] border-b border-blood-900/30">
                {grid?.measures.map((time, i) => (
                  <div
                    key={`m-${i}`}
                    className="absolute top-0 h-full border-l border-blood-600/50 flex items-center"
                    style={{ left: `${time * pixelsPerSecond}px` }}
                  >
                    <span className="text-[10px] text-blood-400 ml-1">{i + 1}</span>
                  </div>
                ))}
                {grid?.beats.map((time, i) => (
                  <div
                    key={`b-${i}`}
                    className="absolute top-4 w-px h-4 bg-zinc-700"
                    style={{ left: `${time * pixelsPerSecond}px` }}
                  />
                ))}
              </div>
              
              {/* Beat grid background */}
              <div className="absolute top-8 left-0 right-0 bottom-0">
                {grid?.measures.map((time, i) => (
                  <div
                    key={`mg-${i}`}
                    className="absolute top-0 bottom-0 border-l border-blood-900/30"
                    style={{ left: `${time * pixelsPerSecond}px` }}
                  />
                ))}
                {grid?.beats.map((time, i) => (
                  <div
                    key={`bg-${i}`}
                    className="absolute top-0 bottom-0 border-l border-zinc-800/50"
                    style={{ left: `${time * pixelsPerSecond}px` }}
                  />
                ))}
              </div>
              
              {/* Cut points markers */}
              <div className="absolute top-8 left-0 right-0 h-6 bg-[#0b0b0e]/50">
                {cutPoints.map((cut, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute top-0 w-1 h-full cursor-pointer transition-all ${
                          cut.strength >= 0.8 ? "bg-blood-500" :
                          cut.strength >= 0.5 ? "bg-amber-500" :
                          "bg-zinc-500"
                        } hover:w-2 hover:opacity-100 opacity-70`}
                        style={{ left: `${cut.time * pixelsPerSecond}px` }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#14131a] border-blood-900/30">
                      <p className="font-mono text-xs">{cut.time.toFixed(2)}s</p>
                      <p className="text-xs text-zinc-400">{NOTE_NAMES_FR[cut.type]}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              
              {/* Video segments */}
              <div className="absolute top-16 left-0 right-0 h-24">
                {timeline?.videoSegments.map((segment, i) => {
                  const video = videos.find(
                    (v) => v.shotId === segment.shotId && v.variationId === segment.variationId
                  );
                  return (
                    <div
                      key={i}
                      className="absolute top-2 h-20 bg-gradient-to-b from-blood-900/40 to-blood-900/20 border border-blood-700/50 rounded overflow-hidden group"
                      style={{
                        left: `${segment.startTime * pixelsPerSecond}px`,
                        width: `${(segment.endTime - segment.startTime) * pixelsPerSecond}px`,
                      }}
                    >
                      {video?.thumbnailUrl && (
                        <img
                          src={video.thumbnailUrl}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                        />
                      )}
                      <div className="absolute bottom-1 left-1 right-1">
                        <p className="text-[9px] text-white truncate font-medium">
                          {video?.shotName || segment.shotId}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-20 pointer-events-none"
                style={{ left: `${currentTime * pixelsPerSecond}px` }}
              >
                <div className="absolute -top-1 -left-2 w-4 h-4 bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        
        {/* ================================================================ */}
        {/* FOOTER - Stats */}
        {/* ================================================================ */}
        <div className="p-3 border-t border-blood-900/30 bg-[#14131a] flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-zinc-500">
            <span>
              <strong className="text-white">{bpm}</strong> BPM
            </span>
            <span>|</span>
            <span>
              Beat = <strong className="text-amber-400">{grid ? (grid.beatDuration * 1000).toFixed(0) : 0}ms</strong>
            </span>
            <span>|</span>
            <span>
              Mesure = <strong className="text-blood-400">{grid ? grid.measureDuration.toFixed(2) : 0}s</strong>
            </span>
          </div>
          
          {timeline && (
            <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-700/30">
              {timeline.videoSegments.length} segments • {timeline.duration.toFixed(1)}s
            </Badge>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
