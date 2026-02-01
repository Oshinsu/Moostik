"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Bot,
  CheckCircle,
  ChevronDown,
  Copy,
  Download,
  Eye,
  EyeOff,
  FastForward,
  FileAudio,
  FileImage,
  FileVideo,
  Film,
  FolderOpen,
  GripVertical,
  Hand,
  Lightbulb,
  Loader2,
  Lock,
  Minus,
  MousePointer,
  Music,
  Pause,
  Play,
  Plus,
  Redo,
  Rewind,
  Scissors,
  SkipBack,
  SkipForward,
  Sparkles,
  SplitSquareHorizontal,
  Trash2,
  Type,
  Undo,
  Upload,
  Volume2,
  VolumeX,
  Wand2,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { PLATFORM_PRESETS } from "@/lib/editor/export";
import { Sidebar } from "@/components/Sidebar";
import type { Episode } from "@/types/moostik";
import type { EditingStyle, TimelineGap, ShotSuggestion, BloodDirectorOutput } from "@/lib/editor/blood-director";

// ============================================
// TYPES
// ============================================

type TrackType = "video" | "audio" | "subtitle";
type ToolType = "select" | "cut" | "hand" | "slip";

interface TrackItem {
  id: string;
  name: string;
  start: number;
  duration: number;
  color?: string;
  thumbnail?: string;
  src?: string;
  type: "clip" | "gap";
  shotId?: string;
}

interface Track {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  items: TrackItem[];
  muted: boolean;
  solo: boolean;
  locked: boolean;
  visible: boolean;
  volume: number;
}

interface MediaFile {
  id: string;
  name: string;
  type: "video" | "audio" | "image";
  src: string;
  duration?: number;
  thumbnail?: string;
}

// ============================================
// EDITING STYLES
// ============================================

const EDITING_STYLES: { id: EditingStyle; name: string; icon: React.ReactNode; desc: string }[] = [
  { id: "trailer", name: "Trailer", icon: <Film className="w-4 h-4" />, desc: "Tension crescendo, 60s max" },
  { id: "episode_standard", name: "Épisode", icon: <FileVideo className="w-4 h-4" />, desc: "Rythme narratif complet" },
  { id: "emotional_cut", name: "Émotionnel", icon: <Sparkles className="w-4 h-4" />, desc: "Focus moments intenses" },
  { id: "action_reel", name: "Action", icon: <Zap className="w-4 h-4" />, desc: "Compilation combats" },
  { id: "music_video", name: "Clip Musical", icon: <Music className="w-4 h-4" />, desc: "Sync musique" },
  { id: "tiktok_viral", name: "TikTok", icon: <Play className="w-4 h-4" />, desc: "Vertical, viral" },
];

// ============================================
// INITIAL STATE
// ============================================

const createInitialTracks = (): Track[] => [
  { id: "v1", name: "Vidéo 1", type: "video", color: "#8B0000", items: [], muted: false, solo: false, locked: false, visible: true, volume: 100 },
  { id: "a1", name: "Audio 1", type: "audio", color: "#006400", items: [], muted: false, solo: false, locked: false, visible: true, volume: 100 },
  { id: "m1", name: "Musique", type: "audio", color: "#DAA520", items: [], muted: false, solo: false, locked: false, visible: true, volume: 80 },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function EditorPage() {
  // ============================================
  // STATE
  // ============================================
  
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>(createInitialTracks());
  const [playhead, setPlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(50);
  const [scrollX, setScrollX] = useState(0);
  const [selectedTool, setSelectedTool] = useState<ToolType>("select");
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [showMediaBin, setShowMediaBin] = useState(true);
  const [exportPreset, setExportPreset] = useState<string>("youtube_4k");
  const [history, setHistory] = useState<Track[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // AI Features State
  const [showBloodDirector, setShowBloodDirector] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<EditingStyle>("episode_standard");
  const [isAutoEditing, setIsAutoEditing] = useState(false);
  const [bloodDirectorResult, setBloodDirectorResult] = useState<BloodDirectorOutput | null>(null);
  
  // Gap Detection State
  const [gaps, setGaps] = useState<TimelineGap[]>([]);
  const [suggestions, setSuggestions] = useState<ShotSuggestion[]>([]);
  const [showGapPanel, setShowGapPanel] = useState(false);
  const [isAnalyzingGaps, setIsAnalyzingGaps] = useState(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  
  // Export State
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Refs
  const timelineRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  const selectedEpisode = useMemo(() => 
    episodes.find(e => e.id === selectedEpisodeId), 
    [episodes, selectedEpisodeId]
  );
  
  const totalDuration = useMemo(() => {
    const maxFromTracks = Math.max(0, ...tracks.flatMap(t => t.items.map(i => i.start + i.duration)));
    return Math.max(30, maxFromTracks + 10);
  }, [tracks]);
  
  const pixelsPerSecond = useMemo(() => zoom * 2, [zoom]);
  
  const currentFrame = useMemo(() => {
    for (const track of tracks) {
      if (track.type === "video" && track.visible && !track.muted) {
        for (const item of track.items) {
          if (item.start <= playhead && playhead < item.start + item.duration) {
            return item;
          }
        }
      }
    }
    return null;
  }, [tracks, playhead]);
  
  // ============================================
  // FETCH DATA
  // ============================================
  
  useEffect(() => {
    fetch("/api/episodes")
      .then(res => res.json())
      .then(data => setEpisodes(Array.isArray(data) ? data : []))
      .catch(() => setEpisodes([]));
  }, []);
  
  // Load episode into timeline
  useEffect(() => {
    if (selectedEpisode) {
      const videoItems: TrackItem[] = [];
      const audioItems: TrackItem[] = [];
      let currentTime = 0;
      
      selectedEpisode.shots.forEach((shot) => {
        const completedVariation = shot.variations.find(v => v.status === "completed");
        if (completedVariation) {
          const duration = shot.durationSeconds || 5;
          videoItems.push({
            id: `${shot.id}-v`,
            name: `Shot ${shot.number}: ${shot.name}`,
            start: currentTime,
            duration,
            thumbnail: completedVariation.imageUrl,
            src: completedVariation.videoUrl,
            type: "clip",
            shotId: shot.id,
          });
          
          if (shot.dialogue && shot.dialogue.length > 0) {
            audioItems.push({
              id: `${shot.id}-a`,
              name: `Dialogue: ${shot.dialogue[0].speakerName}`,
              start: currentTime,
              duration,
              src: shot.dialogueAudioPath,
              type: "clip",
            });
          }
          currentTime += duration;
        }
      });
      
      setTracks(prev => prev.map(track => {
        if (track.id === "v1") return { ...track, items: videoItems };
        if (track.id === "a1") return { ...track, items: audioItems };
        return track;
      }));
      
      const episodeMedia: MediaFile[] = selectedEpisode.shots
        .filter(s => s.variations.some(v => v.status === "completed"))
        .map(shot => {
          const variation = shot.variations.find(v => v.status === "completed")!;
          return {
            id: shot.id,
            name: `Shot ${shot.number}: ${shot.name}`,
            type: variation.videoUrl ? "video" : "image" as const,
            src: variation.videoUrl || variation.imageUrl || "",
            thumbnail: variation.imageUrl,
            duration: shot.durationSeconds || 5,
          };
        });
      
      setMediaFiles(prev => [...episodeMedia, ...prev.filter(m => !episodeMedia.find(em => em.id === m.id))]);
      
      // Auto-analyze gaps when episode loads
      analyzeGaps();
    }
  }, [selectedEpisode]);
  
  // ============================================
  // PLAYBACK
  // ============================================
  
  const togglePlayPause = useCallback(() => setIsPlaying(prev => !prev), []);
  const skipToStart = useCallback(() => setPlayhead(0), []);
  const skipToEnd = useCallback(() => setPlayhead(totalDuration), [totalDuration]);
  const frameBack = useCallback(() => setPlayhead(prev => Math.max(0, prev - 1/24)), []);
  const frameForward = useCallback(() => setPlayhead(prev => Math.min(totalDuration, prev + 1/24)), [totalDuration]);
  const jumpBack = useCallback(() => setPlayhead(prev => Math.max(0, prev - 5)), []);
  const jumpForward = useCallback(() => setPlayhead(prev => Math.min(totalDuration, prev + 5)), [totalDuration]);
  
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setPlayhead(prev => {
          const next = prev + 1/24;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return next;
        });
      }, 1000/24);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [isPlaying, totalDuration]);
  
  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case " ": e.preventDefault(); togglePlayPause(); break;
        case "v": case "V": setSelectedTool("select"); break;
        case "c": case "C": if (!e.metaKey && !e.ctrlKey) setSelectedTool("cut"); break;
        case "h": case "H": setSelectedTool("hand"); break;
        case "s": case "S": if (!e.metaKey && !e.ctrlKey) setSelectedTool("slip"); break;
        case "Home": e.preventDefault(); skipToStart(); break;
        case "End": e.preventDefault(); skipToEnd(); break;
        case "ArrowLeft": e.preventDefault(); e.shiftKey ? jumpBack() : frameBack(); break;
        case "ArrowRight": e.preventDefault(); e.shiftKey ? jumpForward() : frameForward(); break;
        case "j": case "J": jumpBack(); break;
        case "k": case "K": togglePlayPause(); break;
        case "l": case "L": jumpForward(); break;
        case "Delete": case "Backspace": if (selectedItemId) deleteSelectedItems(); break;
        case "z": case "Z":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            e.shiftKey ? redo() : undo();
          }
          break;
        case "=": case "+": if (e.metaKey || e.ctrlKey) { e.preventDefault(); setZoom(prev => Math.min(200, prev + 10)); } break;
        case "-": if (e.metaKey || e.ctrlKey) { e.preventDefault(); setZoom(prev => Math.max(10, prev - 10)); } break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause, skipToStart, skipToEnd, frameBack, frameForward, jumpBack, jumpForward, selectedItemId]);
  
  // ============================================
  // HISTORY
  // ============================================
  
  const saveToHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), JSON.parse(JSON.stringify(tracks))]);
    setHistoryIndex(prev => prev + 1);
  }, [tracks, historyIndex]);
  
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setTracks(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);
  
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setTracks(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);
  
  // ============================================
  // TRACK MANAGEMENT
  // ============================================
  
  const addTrack = useCallback((type: TrackType) => {
    saveToHistory();
    const newTrack: Track = {
      id: `${type[0]}${Date.now()}`,
      name: `${type === "video" ? "Vidéo" : type === "audio" ? "Audio" : "Sous-titres"} ${tracks.filter(t => t.type === type).length + 1}`,
      type,
      color: type === "video" ? "#8B0000" : type === "audio" ? "#006400" : "#4169E1",
      items: [],
      muted: false, solo: false, locked: false, visible: true, volume: 100,
    };
    setTracks(prev => [...prev, newTrack]);
  }, [tracks, saveToHistory]);
  
  const deleteTrack = useCallback((trackId: string) => {
    if (tracks.length <= 1) return;
    saveToHistory();
    setTracks(prev => prev.filter(t => t.id !== trackId));
  }, [tracks, saveToHistory]);
  
  const toggleTrackMute = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  }, []);
  
  const toggleTrackLock = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, locked: !t.locked } : t));
  }, []);
  
  const toggleTrackVisibility = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, visible: !t.visible } : t));
  }, []);
  
  // ============================================
  // CLIP OPERATIONS
  // ============================================
  
  const deleteSelectedItems = useCallback(() => {
    if (selectedItems.size === 0 && !selectedItemId) return;
    saveToHistory();
    const itemsToDelete = selectedItems.size > 0 ? selectedItems : new Set([selectedItemId!]);
    setTracks(prev => prev.map(track => ({
      ...track,
      items: track.items.filter(item => !itemsToDelete.has(item.id))
    })));
    setSelectedItems(new Set());
    setSelectedItemId(null);
  }, [selectedItems, selectedItemId, saveToHistory]);
  
  const cutAtPlayhead = useCallback(() => {
    saveToHistory();
    setTracks(prev => prev.map(track => {
      if (track.locked) return track;
      const newItems: TrackItem[] = [];
      track.items.forEach(item => {
        const itemEnd = item.start + item.duration;
        if (item.start < playhead && playhead < itemEnd) {
          newItems.push({ ...item, id: `${item.id}-a`, duration: playhead - item.start });
          newItems.push({ ...item, id: `${item.id}-b`, start: playhead, duration: itemEnd - playhead });
        } else {
          newItems.push(item);
        }
      });
      return { ...track, items: newItems };
    }));
  }, [playhead, saveToHistory]);
  
  // ============================================
  // MEDIA IMPORT
  // ============================================
  
  const handleFileImport = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith("video/") ? "video" :
                   file.type.startsWith("audio/") ? "audio" :
                   file.type.startsWith("image/") ? "image" : null;
      if (!type) return;
      
      const media: MediaFile = { id: `media-${Date.now()}-${Math.random()}`, name: file.name, type: type as "video" | "audio" | "image", src: url };
      
      if (type === "video" || type === "audio") {
        const element = document.createElement(type);
        element.src = url;
        element.onloadedmetadata = () => {
          media.duration = element.duration;
          setMediaFiles(prev => [...prev, media]);
        };
      } else {
        media.duration = 5;
        setMediaFiles(prev => [...prev, media]);
      }
    });
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) handleFileImport(e.dataTransfer.files);
  }, [handleFileImport]);
  
  const addMediaToTimeline = useCallback((media: MediaFile) => {
    saveToHistory();
    const track = tracks.find(t => 
      (media.type === "video" && t.type === "video") ||
      (media.type === "audio" && t.type === "audio") ||
      (media.type === "image" && t.type === "video")
    );
    if (!track) return;
    
    const lastItemEnd = track.items.reduce((max, item) => Math.max(max, item.start + item.duration), 0);
    const newItem: TrackItem = {
      id: `item-${Date.now()}`,
      name: media.name,
      start: Math.max(playhead, lastItemEnd),
      duration: media.duration || 5,
      thumbnail: media.thumbnail,
      src: media.src,
      type: "clip",
    };
    setTracks(prev => prev.map(t => t.id === track.id ? { ...t, items: [...t.items, newItem] } : t));
  }, [tracks, playhead, saveToHistory]);
  
  // ============================================
  // AI FEATURES - BLOOD DIRECTOR
  // ============================================
  
  const runBloodDirector = useCallback(async () => {
    if (!selectedEpisodeId) return;
    setIsAutoEditing(true);
    
    try {
      const res = await fetch("/api/editor/blood-director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId: selectedEpisodeId,
          style: selectedStyle,
          pacePreference: "dynamic",
          transitionStyle: "dramatic",
          includeDialogue: true,
          respectNarrativeOrder: true,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setBloodDirectorResult(data.result);
        
        // Apply timeline from Blood Director
        if (data.result?.timeline) {
          applyBloodDirectorTimeline(data.result.timeline);
        }
        
        // Update gaps and suggestions
        if (data.result?.gaps) setGaps(data.result.gaps);
        if (data.result?.suggestions) setSuggestions(data.result.suggestions);
      }
    } catch (error) {
      console.error("Blood Director error:", error);
    } finally {
      setIsAutoEditing(false);
      setShowBloodDirector(false);
    }
  }, [selectedEpisodeId, selectedStyle]);
  
  const applyBloodDirectorTimeline = useCallback((timeline: BloodDirectorOutput["timeline"]) => {
    if (!selectedEpisode) return;
    saveToHistory();
    
    const videoItems: TrackItem[] = timeline.map((decision, index) => {
      const shot = selectedEpisode.shots.find(s => s.id === decision.shotId);
      const variation = shot?.variations.find(v => v.status === "completed");
      
      return {
        id: `bd-${decision.shotId}-${index}`,
        name: shot?.name || `Shot ${index + 1}`,
        start: decision.startTime,
        duration: decision.duration,
        thumbnail: variation?.imageUrl,
        src: variation?.videoUrl,
        type: "clip" as const,
        shotId: decision.shotId,
      };
    });
    
    setTracks(prev => prev.map(track => {
      if (track.id === "v1") return { ...track, items: videoItems };
      return track;
    }));
  }, [selectedEpisode, saveToHistory]);
  
  // ============================================
  // AI FEATURES - GAP DETECTION
  // ============================================
  
  const analyzeGaps = useCallback(async () => {
    if (!selectedEpisodeId) return;
    setIsAnalyzingGaps(true);
    
    try {
      const res = await fetch("/api/editor/gaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeId: selectedEpisodeId }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setGaps(data.gaps || []);
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Gap analysis error:", error);
    } finally {
      setIsAnalyzingGaps(false);
    }
  }, [selectedEpisodeId]);
  
  const generateFromSuggestion = useCallback(async (suggestion: ShotSuggestion) => {
    if (!selectedEpisodeId) return;
    setIsGeneratingSuggestion(true);
    
    try {
      const res = await fetch("/api/editor/generate-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId: selectedEpisodeId,
          suggestion,
          insertAfterShotId: suggestion.id.includes("gap-") 
            ? gaps.find(g => g.suggestions.includes(suggestion))?.beforeShot?.id 
            : undefined,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        // Refresh episode data
        const epRes = await fetch(`/api/episodes/${selectedEpisodeId}`);
        if (epRes.ok) {
          const epData = await epRes.json();
          setEpisodes(prev => prev.map(e => e.id === selectedEpisodeId ? epData : e));
        }
        
        // Remove used suggestion
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
        
        // Re-analyze gaps
        analyzeGaps();
      }
    } catch (error) {
      console.error("Generate suggestion error:", error);
    } finally {
      setIsGeneratingSuggestion(false);
    }
  }, [selectedEpisodeId, gaps, analyzeGaps]);
  
  // ============================================
  // TIMELINE HANDLERS
  // ============================================
  
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool === "hand") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollX;
    const newTime = x / pixelsPerSecond;
    
    if (selectedTool === "cut") {
      setPlayhead(Math.max(0, Math.min(totalDuration, newTime)));
      cutAtPlayhead();
    } else {
      setPlayhead(Math.max(0, Math.min(totalDuration, newTime)));
    }
  }, [selectedTool, scrollX, pixelsPerSecond, totalDuration, cutAtPlayhead]);
  
  const handleItemClick = useCallback((e: React.MouseEvent, trackId: string, itemId: string) => {
    e.stopPropagation();
    if (selectedTool === "select") {
      if (e.shiftKey) {
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.has(itemId) ? newSet.delete(itemId) : newSet.add(itemId);
          return newSet;
        });
      } else {
        setSelectedItemId(itemId);
        setSelectedItems(new Set([itemId]));
      }
      setSelectedTrackId(trackId);
    }
  }, [selectedTool]);
  
  // ============================================
  // FORMAT HELPERS
  // ============================================
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 24);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
  };
  
  const formatTimeShort = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <TooltipProvider>
      <div className="flex h-screen bg-[#0a0a0d] overflow-hidden">
        <Sidebar episodes={episodes} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex-shrink-0 border-b border-blood-900/30 bg-gradient-to-r from-[#0b0b0e] to-[#14131a]">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blood-600/30 to-crimson-600/20 border border-blood-600/30 flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-blood-400" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">
                      Bloodwing Studio
                    </h1>
                    <p className="text-xs text-zinc-500">
                      Montage AI-First • SOTA Février 2026
                    </p>
                  </div>
                  
                  <div className="w-px h-8 bg-zinc-800 mx-2" />
                  
                  <Select value={selectedEpisodeId || ""} onValueChange={setSelectedEpisodeId}>
                    <SelectTrigger className="w-[220px] h-9 text-sm bg-zinc-900/50 border-zinc-800">
                      <FileVideo className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Charger un épisode..." />
                    </SelectTrigger>
                    <SelectContent>
                      {episodes.map((ep) => (
                        <SelectItem key={ep.id} value={ep.id}>
                          EP{ep.number}: {ep.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Center - Tools */}
                <div className="flex items-center gap-1 bg-zinc-900/50 rounded-lg p-1 border border-zinc-800/50">
                  {[
                    { tool: "select" as const, icon: MousePointer, label: "Sélection (V)" },
                    { tool: "cut" as const, icon: Scissors, label: "Couper (C)" },
                    { tool: "hand" as const, icon: Hand, label: "Main (H)" },
                    { tool: "slip" as const, icon: SplitSquareHorizontal, label: "Slip (S)" },
                  ].map(({ tool, icon: Icon, label }) => (
                    <Tooltip key={tool}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("h-8 w-8 p-0", selectedTool === tool && "bg-blood-900/50 text-blood-400")}
                          onClick={() => setSelectedTool(tool)}
                        >
                          <Icon className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{label}</TooltipContent>
                    </Tooltip>
                  ))}
                  
                  <div className="w-px h-6 bg-zinc-800 mx-1" />
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={cutAtPlayhead}>
                        <SplitSquareHorizontal className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Couper au playhead</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={undo} disabled={historyIndex <= 0}>
                        <Undo className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Annuler (⌘Z)</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={redo} disabled={historyIndex >= history.length - 1}>
                        <Redo className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Rétablir (⌘⇧Z)</TooltipContent>
                  </Tooltip>
                </div>

                {/* Right - AI & Export */}
                <div className="flex items-center gap-2">
                  {/* Blood Director Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blood-900/20 border-blood-600/30 text-blood-400 hover:bg-blood-900/40 h-8"
                    onClick={() => setShowBloodDirector(true)}
                    disabled={!selectedEpisodeId}
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Blood Director
                  </Button>
                  
                  {/* Gap Analysis Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0",
                          gaps.length > 0 && "border-amber-600/50 text-amber-400"
                        )}
                        onClick={() => setShowGapPanel(!showGapPanel)}
                        disabled={!selectedEpisodeId}
                      >
                        {isAnalyzingGaps ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Lightbulb className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {gaps.length > 0 ? `${gaps.length} gaps détectés` : "Analyser les gaps"}
                    </TooltipContent>
                  </Tooltip>

                  <Select value={exportPreset} onValueChange={setExportPreset}>
                    <SelectTrigger className="w-[140px] h-8 text-xs bg-zinc-900/50 border-zinc-800">
                      <Download className="w-3 h-3 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORM_PRESETS.slice(0, 6).map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {preset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button size="sm" className="moostik-btn-blood text-white h-8" onClick={() => setShowExportDialog(true)}>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel: Media Bin */}
            <div className={cn(
              "flex-shrink-0 border-r border-zinc-800/50 bg-zinc-900/20 overflow-hidden flex flex-col transition-all",
              showMediaBin ? "w-56" : "w-12"
            )}>
              {showMediaBin ? (
                <>
                  <div className="p-3 border-b border-zinc-800/50 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Médias</span>
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Importer</TooltipContent>
                      </Tooltip>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowMediaBin(false)}>
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="video/*,audio/*,image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileImport(e.target.files)}
                  />
                  
                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1 min-h-[100px]" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                      {mediaFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-lg">
                          <FolderOpen className="w-6 h-6 mb-2" />
                          <p className="text-[10px] text-center">Glisser des fichiers</p>
                        </div>
                      ) : (
                        mediaFiles.map((media) => (
                          <div
                            key={media.id}
                            className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/30 hover:border-blood-600/30 cursor-pointer group"
                            onClick={() => addMediaToTimeline(media)}
                          >
                            <div className="w-10 h-7 rounded bg-zinc-800 overflow-hidden flex-shrink-0">
                              {media.thumbnail ? (
                                <img src={media.thumbnail} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  {media.type === "video" && <FileVideo className="w-3 h-3 text-zinc-600" />}
                                  {media.type === "audio" && <FileAudio className="w-3 h-3 text-zinc-600" />}
                                  {media.type === "image" && <FileImage className="w-3 h-3 text-zinc-600" />}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-zinc-300 truncate">{media.name}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <Button variant="ghost" className="h-full w-full rounded-none" onClick={() => setShowMediaBin(true)}>
                  <FolderOpen className="w-5 h-5 text-zinc-600" />
                </Button>
              )}
            </div>

            {/* Center: Preview & Timeline */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Preview */}
              <div className="flex-shrink-0 p-3 border-b border-zinc-800/50 bg-[#0b0b0e]">
                <div className="aspect-video max-h-[220px] mx-auto rounded-lg bg-black border border-zinc-800/30 flex items-center justify-center relative overflow-hidden">
                  {currentFrame?.thumbnail ? (
                    <img src={currentFrame.thumbnail} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center">
                      <FileVideo className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                      <p className="text-xs text-zinc-600">Aperçu</p>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 rounded font-mono text-xs text-white">
                    {formatTime(playhead)}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded font-mono text-xs text-zinc-400">
                    {formatTime(totalDuration)}
                  </div>
                </div>
              </div>

              {/* Transport Controls */}
              <div className="flex-shrink-0 px-4 py-2 border-b border-zinc-800/50 bg-[#0d0d10] flex items-center justify-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={skipToStart}>
                      <SkipBack className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Début</TooltipContent>
                </Tooltip>
                
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={jumpBack}>
                  <Rewind className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  className={cn(
                    "h-10 w-10 p-0 rounded-full",
                    isPlaying ? "bg-blood-600 hover:bg-blood-700" : "bg-zinc-800 hover:bg-zinc-700"
                  )}
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </Button>
                
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={jumpForward}>
                  <FastForward className="w-4 h-4" />
                </Button>
                
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={skipToEnd}>
                  <SkipForward className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-zinc-800 mx-2" />

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(prev => Math.max(10, prev - 10))}>
                    <ZoomOut className="w-3.5 h-3.5" />
                  </Button>
                  <div className="w-20">
                    <Slider value={[zoom]} min={10} max={200} step={5} onValueChange={([v]) => setZoom(v)} />
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(prev => Math.min(200, prev + 10))}>
                    <ZoomIn className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex-1 overflow-hidden flex flex-col bg-[#0a0a0d]">
                {/* Time ruler */}
                <div className="flex-shrink-0 h-6 bg-zinc-900/50 border-b border-zinc-800/50 flex">
                  <div className="w-36 flex-shrink-0 border-r border-zinc-800/50" />
                  <div className="flex-1 relative overflow-x-auto" ref={timelineRef} onScroll={(e) => setScrollX(e.currentTarget.scrollLeft)}>
                    <div
                      className="absolute top-0 left-0 h-full"
                      style={{ width: `${totalDuration * pixelsPerSecond}px` }}
                      onClick={handleTimelineClick}
                    >
                      {[...Array(Math.ceil(totalDuration))].map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 h-full border-l border-zinc-800/30 text-[8px] text-zinc-600 px-1"
                          style={{ left: `${i * pixelsPerSecond}px`, width: `${pixelsPerSecond}px` }}
                        >
                          {formatTimeShort(i)}
                        </div>
                      ))}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-blood-500 z-20 pointer-events-none"
                        style={{ left: `${playhead * pixelsPerSecond}px` }}
                      >
                        <div className="absolute -top-0 -left-1.5 w-3 h-3 bg-blood-500 rounded-sm transform rotate-45 -translate-y-1/2" />
                      </div>
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
                          "flex border-b border-zinc-800/30 group",
                          track.type === "video" ? "h-16" : "h-12",
                          selectedTrackId === track.id && "bg-zinc-900/40"
                        )}
                      >
                        <div className="w-36 flex-shrink-0 border-r border-zinc-800/50 p-1.5 flex items-center gap-1.5 bg-[#0d0d10]">
                          <GripVertical className="w-3 h-3 text-zinc-700 cursor-grab" />
                          <div className="w-1.5 h-full rounded-sm flex-shrink-0" style={{ backgroundColor: track.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium text-zinc-300 truncate">{track.name}</p>
                          </div>
                          <div className="flex gap-0.5 opacity-50 group-hover:opacity-100">
                            {track.type === "audio" && (
                              <Button variant="ghost" size="sm" className={cn("h-5 w-5 p-0", track.muted && "text-red-400")} onClick={() => toggleTrackMute(track.id)}>
                                {track.muted ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                              </Button>
                            )}
                            {track.type === "video" && (
                              <Button variant="ghost" size="sm" className={cn("h-5 w-5 p-0", !track.visible && "text-zinc-600")} onClick={() => toggleTrackVisibility(track.id)}>
                                {track.visible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className={cn("h-5 w-5 p-0", track.locked && "text-amber-400")} onClick={() => toggleTrackLock(track.id)}>
                              <Lock className="w-2.5 h-2.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex-1 relative overflow-x-auto" onScroll={(e) => setScrollX(e.currentTarget.scrollLeft)}>
                          <div
                            className="absolute top-1 bottom-1 left-0"
                            style={{ width: `${totalDuration * pixelsPerSecond}px` }}
                            onClick={handleTimelineClick}
                          >
                            {track.items.map((item) => (
                              <div
                                key={item.id}
                                className={cn(
                                  "absolute top-0 bottom-0 rounded cursor-pointer border-2 transition-all overflow-hidden group/item",
                                  selectedItems.has(item.id) || selectedItemId === item.id
                                    ? "border-white ring-1 ring-white/20"
                                    : "border-transparent hover:border-white/30",
                                  track.locked && "opacity-50 cursor-not-allowed"
                                )}
                                style={{
                                  left: `${item.start * pixelsPerSecond}px`,
                                  width: `${item.duration * pixelsPerSecond}px`,
                                  backgroundColor: track.color + "90",
                                }}
                                onClick={(e) => !track.locked && handleItemClick(e, track.id, item.id)}
                              >
                                {track.type === "video" && item.thumbnail && (
                                  <div className="absolute inset-0 flex">
                                    {[...Array(Math.max(1, Math.ceil(item.duration / 3)))].map((_, idx) => (
                                      <div key={idx} className="h-full flex-1 bg-cover bg-center opacity-70" style={{ backgroundImage: `url(${item.thumbnail})` }} />
                                    ))}
                                  </div>
                                )}
                                {track.type === "audio" && (
                                  <div className="absolute inset-0 flex items-center px-0.5 opacity-30">
                                    {[...Array(Math.floor(item.duration * 4))].map((_, i) => (
                                      <div key={i} className="flex-1 bg-white rounded-full mx-px" style={{ height: `${20 + Math.random() * 60}%` }} />
                                    ))}
                                  </div>
                                )}
                                <div className="relative h-full px-1.5 flex items-center">
                                  <span className="text-[9px] text-white truncate font-medium drop-shadow-sm">{item.name}</span>
                                </div>
                              </div>
                            ))}
                            <div className="absolute top-0 bottom-0 w-0.5 bg-blood-500/50 z-10 pointer-events-none" style={{ left: `${playhead * pixelsPerSecond}px` }} />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex border-b border-zinc-800/30 h-8 bg-[#0d0d10]/50">
                      <div className="w-36 flex-shrink-0 border-r border-zinc-800/50 p-1.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-5 text-[10px] text-zinc-500 hover:text-white">
                              <Plus className="w-2.5 h-2.5 mr-1" />
                              Piste
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="bg-[#14131a] border-zinc-800">
                            <DropdownMenuItem onClick={() => addTrack("video")}>
                              <FileVideo className="w-3 h-3 mr-2" />Vidéo
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addTrack("audio")}>
                              <Music className="w-3 h-3 mr-2" />Audio
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addTrack("subtitle")}>
                              <Type className="w-3 h-3 mr-2" />Sous-titres
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Right Panel: AI Suggestions */}
            {showGapPanel && (
              <div className="w-64 flex-shrink-0 border-l border-zinc-800/50 bg-zinc-900/20 overflow-hidden flex flex-col">
                <div className="p-3 border-b border-zinc-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Timeline IA</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowGapPanel(false)}>
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-3">
                  {/* Gaps */}
                  {gaps.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        Gaps détectés ({gaps.length})
                      </p>
                      <div className="space-y-2">
                        {gaps.slice(0, 5).map((gap) => (
                          <div key={gap.id} className={cn(
                            "p-2 rounded-lg border text-xs",
                            gap.severity === "critical" ? "bg-red-900/20 border-red-600/30" :
                            gap.severity === "important" ? "bg-amber-900/20 border-amber-600/30" :
                            "bg-zinc-900/50 border-zinc-800/30"
                          )}>
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className={cn(
                                "w-3 h-3",
                                gap.severity === "critical" ? "text-red-400" :
                                gap.severity === "important" ? "text-amber-400" :
                                "text-zinc-400"
                              )} />
                              <span className="font-medium text-zinc-300 capitalize">{gap.type}</span>
                            </div>
                            <p className="text-zinc-500 text-[10px]">{gap.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                        Suggestions ({suggestions.length})
                      </p>
                      <div className="space-y-2">
                        {suggestions.slice(0, 6).map((sug) => (
                          <div key={sug.id} className="p-2 rounded-lg bg-emerald-900/10 border border-emerald-600/20 hover:border-emerald-500/40 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase">{sug.type}</span>
                              <span className="text-[9px] text-zinc-500">{Math.round(sug.confidence * 100)}%</span>
                            </div>
                            <p className="text-xs text-zinc-300 font-medium mb-1">{sug.name}</p>
                            <p className="text-[10px] text-zinc-500 mb-2">{sug.description}</p>
                            <Button
                              size="sm"
                              className="w-full h-6 text-[10px] bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400"
                              onClick={() => generateFromSuggestion(sug)}
                              disabled={isGeneratingSuggestion}
                            >
                              {isGeneratingSuggestion ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <Sparkles className="w-3 h-3 mr-1" />
                              )}
                              Générer
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {gaps.length === 0 && suggestions.length === 0 && (
                    <div className="text-center py-8 text-zinc-600">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs">Timeline complète</p>
                    </div>
                  )}
                </ScrollArea>

                <div className="p-3 border-t border-zinc-800/50">
                  <Button
                    className="w-full h-8 text-xs bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800"
                    variant="outline"
                    onClick={analyzeGaps}
                    disabled={isAnalyzingGaps}
                  >
                    {isAnalyzingGaps ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Zap className="w-3 h-3 mr-2" />}
                    Ré-analyser
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Blood Director Dialog */}
        <Dialog open={showBloodDirector} onOpenChange={setShowBloodDirector}>
          <DialogContent className="max-w-lg bg-[#0b0b0e] border-blood-900/30 text-zinc-100">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Bot className="w-6 h-6 text-blood-500" />
                Blood Director
              </DialogTitle>
              <DialogDescription className="text-zinc-500">
                Agent autonome de montage narratif Bloodwing
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">
                  Style de montage
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {EDITING_STYLES.map((style) => (
                    <Button
                      key={style.id}
                      variant="outline"
                      className={cn(
                        "h-auto p-3 flex flex-col items-start gap-1 border-zinc-800",
                        selectedStyle === style.id && "border-blood-500 bg-blood-900/20"
                      )}
                      onClick={() => setSelectedStyle(style.id)}
                    >
                      <div className="flex items-center gap-2">
                        {style.icon}
                        <span className="font-bold">{style.name}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">{style.desc}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {bloodDirectorResult && (
                <div className="p-3 bg-emerald-900/20 border border-emerald-600/30 rounded-lg">
                  <p className="text-xs font-bold text-emerald-400 mb-2">Résultat</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-zinc-500">Shots:</span>
                      <span className="text-white ml-1">{bloodDirectorResult.stats.shotsUsed}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Durée:</span>
                      <span className="text-white ml-1">{Math.round(bloodDirectorResult.totalDuration)}s</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Pace:</span>
                      <span className="text-white ml-1">{Math.round(bloodDirectorResult.stats.paceScore * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowBloodDirector(false)}>
                Annuler
              </Button>
              <Button
                className="moostik-btn-blood text-white"
                onClick={runBloodDirector}
                disabled={isAutoEditing}
              >
                {isAutoEditing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Montage en cours...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Lancer Blood Director
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-md bg-[#0b0b0e] border-blood-900/30 text-zinc-100">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blood-500" />
                Exporter
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/30">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500 text-xs">Format</p>
                    <p className="font-medium">{PLATFORM_PRESETS.find(p => p.id === exportPreset)?.name}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Résolution</p>
                    <p className="font-medium">{PLATFORM_PRESETS.find(p => p.id === exportPreset)?.video.resolution}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Durée</p>
                    <p className="font-medium">{formatTime(totalDuration)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Clips</p>
                    <p className="font-medium">{tracks.reduce((sum, t) => sum + t.items.length, 0)}</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowExportDialog(false)}>Annuler</Button>
              <Button className="moostik-btn-blood text-white" disabled={isExporting}>
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Exporter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
