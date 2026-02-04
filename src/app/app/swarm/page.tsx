"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Network,
  Activity,
  TrendingUp,
  Users,
  MessageCircle,
  Flame,
  AlertTriangle,
  Heart,
  Zap,
  Eye,
  BookOpen,
  Play,
  Pause,
  RefreshCw,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface Signal {
  id: string;
  type: string;
  target: string;
  intensity: number;
  participants: number;
  keywords: string[];
  trend: string;
  narrativeImplication: string;
}

interface Arc {
  id: string;
  type: string;
  title: string;
  confidence: number;
  signals: number;
  suggestedFormat: string;
  description: string;
}

interface Brief {
  id: string;
  title: string;
  format: string;
  status: string;
  generatedAt: string;
  synopsis: string;
}

interface SwarmData {
  signals: Signal[];
  arcs: Arc[];
  briefs: Brief[];
  stats: {
    totalSignals: number;
    totalParticipants: number;
    activeArcs: number;
  };
}

// ============================================================================
// SIGNAL TYPE CONFIG
// ============================================================================

const SIGNAL_TYPES = {
  character_obsession: { icon: Users, color: "purple", label: "Focus Personnage" },
  faction_formation: { icon: Network, color: "blue", label: "Formation Faction" },
  conflict_brewing: { icon: AlertTriangle, color: "amber", label: "Conflit Émergent" },
  prophecy_echo: { icon: Eye, color: "emerald", label: "Écho Prophétique" },
  sentiment_shift: { icon: Heart, color: "pink", label: "Shift Émotionnel" },
  topic_emergence: { icon: TrendingUp, color: "cyan", label: "Sujet Émergent" },
  consensus_forming: { icon: Users, color: "green", label: "Consensus" },
  lore_mutation: { icon: BookOpen, color: "orange", label: "Mutation Lore" },
  meme_birth: { icon: Zap, color: "yellow", label: "Naissance Meme" },
  collective_fear: { icon: AlertTriangle, color: "red", label: "Peur Collective" },
  collective_desire: { icon: Heart, color: "rose", label: "Désir Collectif" },
};

// ============================================================================
// SWARM NARRATIVE PAGE
// ============================================================================

export default function SwarmNarrativePage() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SwarmData>({
    signals: [],
    arcs: [],
    briefs: [],
    stats: { totalSignals: 0, totalParticipants: 0, activeArcs: 0 },
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_briefs" }),
      });

      if (!response.ok) {
        if (response.status === 503) {
          // Swarm engine not available - use empty data
          setData({
            signals: [],
            arcs: [],
            briefs: [],
            stats: { totalSignals: 0, totalParticipants: 0, activeArcs: 0 },
          });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Transform API response to UI format
      setData({
        signals: result.patterns?.signals || [],
        arcs: result.patterns?.arcs || [],
        briefs: result.briefs || [],
        stats: result.stats || { totalSignals: 0, totalParticipants: 0, activeArcs: 0 },
      });
    } catch (err) {
      console.error("[SwarmPage] Failed to fetch data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch swarm data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds while monitoring
    const interval = isMonitoring ? setInterval(fetchData, 30000) : undefined;
    return () => interval && clearInterval(interval);
  }, [fetchData, isMonitoring]);

  const handleForceAnalysis = async () => {
    await fetchData();
  };

  // Use data from API or empty arrays
  const ACTIVE_SIGNALS = data.signals;
  const EMERGING_ARCS = data.arcs;
  const RECENT_BRIEFS = data.briefs;

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-900/50 to-blood-900/50 border border-purple-700/30">
              <Network className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl font-black text-white">Swarm Narrative Engine</h1>
            <Badge className="bg-emerald-900/50 text-emerald-400 border-0">LIVE</Badge>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            L'histoire émerge du comportement collectif. Aucun auteur. Le chaos génère le narratif.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-zinc-700"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isMonitoring ? "Pause" : "Reprendre"}
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-500"
            onClick={handleForceAnalysis}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Analyse..." : "Forcer Analyse"}
          </Button>
        </div>
      </div>

      {/* ================================================================== */}
      {/* ERROR BANNER */}
      {/* ================================================================== */}
      {error && (
        <div className="p-4 rounded-xl bg-red-900/30 border border-red-800/50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-400">Erreur</p>
              <p className="text-xs text-red-400/70">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceAnalysis}
              className="ml-auto border-red-700/50 text-red-400 hover:bg-red-900/30"
            >
              Réessayer
            </Button>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* STATS OVERVIEW */}
      {/* ================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-zinc-900/50 border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-900/30">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{ACTIVE_SIGNALS.length || data.stats.totalSignals}</p>
              <p className="text-xs text-zinc-500">Signaux Actifs</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-zinc-900/50 border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-900/30">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{EMERGING_ARCS.length || data.stats.activeArcs}</p>
              <p className="text-xs text-zinc-500">Arcs Émergents</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-zinc-900/50 border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-900/30">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {data.stats.totalParticipants > 0
                  ? data.stats.totalParticipants.toLocaleString()
                  : ACTIVE_SIGNALS.reduce((sum, s) => sum + s.participants, 0).toLocaleString() || "0"}
              </p>
              <p className="text-xs text-zinc-500">Agents Participants</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-zinc-900/50 border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-900/30">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{RECENT_BRIEFS.length}</p>
              <p className="text-xs text-zinc-500">Briefs Générés</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ================================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================================== */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* SIGNALS PANEL */}
        <div className="lg:col-span-2">
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Signaux Narratifs Actifs
              </h2>
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                Mise à jour: il y a 12s
              </Badge>
            </div>

            <div className="divide-y divide-zinc-800">
              {ACTIVE_SIGNALS.map((signal) => {
                const config = SIGNAL_TYPES[signal.type as keyof typeof SIGNAL_TYPES];
                const Icon = config?.icon || Activity;

                return (
                  <div
                    key={signal.id}
                    className="p-4 hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedSignal(signal.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg bg-${config?.color || "zinc"}-900/30 shrink-0`}>
                        <Icon className={`w-5 h-5 text-${config?.color || "zinc"}-400`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">{signal.target}</span>
                          <Badge className={`text-[10px] px-1.5 py-0 bg-${config?.color || "zinc"}-900/50 text-${config?.color || "zinc"}-400 border-0`}>
                            {config?.label || signal.type}
                          </Badge>
                          {signal.trend === "rising" && (
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                          )}
                          {signal.trend === "emerging" && (
                            <Sparkles className="w-3 h-3 text-amber-400" />
                          )}
                        </div>

                        <p className="text-sm text-zinc-400 mb-2">
                          {signal.narrativeImplication}
                        </p>

                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-zinc-500">Intensité</span>
                              <span className="text-white font-medium">{Math.round(signal.intensity * 100)}%</span>
                            </div>
                            <Progress
                              value={signal.intensity * 100}
                              className="h-1.5 bg-zinc-800"
                            />
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium text-white">{signal.participants.toLocaleString()}</p>
                            <p className="text-xs text-zinc-500">participants</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {signal.keywords.map((kw) => (
                            <span
                              key={kw}
                              className="px-2 py-0.5 text-xs rounded-full bg-zinc-800 text-zinc-400"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-zinc-600 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-6">
          {/* EMERGING ARCS */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Arcs Émergents
              </h2>
            </div>

            <div className="p-4 space-y-4">
              {EMERGING_ARCS.map((arc) => (
                <div
                  key={arc.id}
                  className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{arc.title}</h3>
                    <Badge className="bg-blue-900/50 text-blue-400 border-0 text-xs">
                      {Math.round(arc.confidence * 100)}% conf.
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400 mb-2">{arc.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">{arc.signals} signaux liés</span>
                    <Badge variant="outline" className="border-zinc-600 text-zinc-400">
                      {arc.suggestedFormat}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* GENERATED BRIEFS */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                Briefs Générés
              </h2>
            </div>

            <div className="p-4 space-y-3">
              {RECENT_BRIEFS.map((brief) => (
                <div
                  key={brief.id}
                  className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-blood-700/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white text-sm">{brief.title}</h3>
                    <Badge
                      className={
                        brief.status === "ready"
                          ? "bg-emerald-900/50 text-emerald-400 border-0 text-xs"
                          : "bg-zinc-800 text-zinc-400 border-0 text-xs"
                      }
                    >
                      {brief.status === "ready" ? "Prêt" : "Brouillon"}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 mb-1">{brief.synopsis}</p>
                  <div className="flex items-center justify-between text-xs text-zinc-600">
                    <span>{brief.format}</span>
                    <span>{brief.generatedAt}</span>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full border-zinc-700 text-zinc-400">
                Voir tous les briefs
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ================================================================== */}
      {/* HOW IT WORKS */}
      {/* ================================================================== */}
      <Card className="bg-gradient-to-br from-purple-950/30 to-zinc-900/50 border-purple-800/30 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Comment ça marche ?
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-900/50 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">1. Collecte</h3>
            <p className="text-sm text-zinc-400">
              Les interactions des agents sur Moltbook sont analysées en continu
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-900/50 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">2. Extraction</h3>
            <p className="text-sm text-zinc-400">
              11 types de signaux narratifs sont détectés et quantifiés
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-900/50 flex items-center justify-center">
              <Network className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">3. Patterns</h3>
            <p className="text-sm text-zinc-400">
              Les signaux se combinent en arcs narratifs émergents
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-900/50 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">4. Synthèse</h3>
            <p className="text-sm text-zinc-400">
              Des briefs de production sont générés automatiquement
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
