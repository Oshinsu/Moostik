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
  NOTE_NAMES_FR,
  DEFAULT_AUTO_EDIT_CONFIG,
  generateMusicalGrid,
  generateCutPoints,
  createAutoEditTimeline,
  exportToEDL,
} from "@/lib/audio/beat-sync";

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
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // UI state
  const [zoom, setZoom] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCutType, setSelectedCutType] = useState<NoteValue>("quarter");
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // ========================================================================
  // EFFECTS
  // ========================================================================
  
  // Générer la grille quand BPM ou signature change
  useEffect(() => {
    const newGrid = generateMusicalGrid(bpm, duration, timeSignature);
    setGrid(newGrid);
    
    const newCutPoints = generateCutPoints(newGrid, config);
    setCutPoints(newCutPoints);
  }, [bpm, duration, timeSignature, config]);
  
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
        {/* SETTINGS PANEL */}
        {/* ================================================================ */}
        {showSettings && (
          <div className="p-4 border-b border-blood-900/30 bg-[#14131a]/80">
            <div className="grid grid-cols-4 gap-4 max-w-3xl">
              {/* Cut Resolution */}
              <div>
                <Label className="text-xs text-zinc-500 mb-2 block">Résolution des cuts</Label>
                <Select
                  value={config.preferredCuts[0]}
                  onValueChange={(v) => setConfig({ ...config, preferredCuts: [v as NoteValue] })}
                >
                  <SelectTrigger className="bg-[#0b0b0e] border-blood-900/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#14131a] border-blood-900/30">
                    {(["quarter", "eighth", "half", "sixteenth"] as NoteValue[]).map((note) => (
                      <SelectItem key={note} value={note}>
                        {NOTE_NAMES_FR[note]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Min Duration */}
              <div>
                <Label className="text-xs text-zinc-500 mb-2 block">
                  Durée min: {config.minCutDuration.toFixed(1)}s
                </Label>
                <Slider
                  value={[config.minCutDuration]}
                  onValueChange={([v]) => setConfig({ ...config, minCutDuration: v })}
                  min={0.5}
                  max={4}
                  step={0.5}
                  className="w-full"
                />
              </div>
              
              {/* Max Duration */}
              <div>
                <Label className="text-xs text-zinc-500 mb-2 block">
                  Durée max: {config.maxCutDuration.toFixed(1)}s
                </Label>
                <Slider
                  value={[config.maxCutDuration]}
                  onValueChange={([v]) => setConfig({ ...config, maxCutDuration: v })}
                  min={2}
                  max={15}
                  step={1}
                  className="w-full"
                />
              </div>
              
              {/* Strong Beats */}
              <div>
                <Label className="text-xs text-zinc-500 mb-2 block">Temps forts</Label>
                <Button
                  variant={config.preferStrongBeats ? "default" : "outline"}
                  size="sm"
                  className={config.preferStrongBeats ? "bg-blood-600" : "border-zinc-700"}
                  onClick={() => setConfig({ ...config, preferStrongBeats: !config.preferStrongBeats })}
                >
                  {config.preferStrongBeats ? "Oui" : "Non"}
                </Button>
              </div>
            </div>
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
