"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Moon,
  Eye,
  Users,
  Sparkles,
  CloudMoon,
  Waves,
  Heart,
  AlertTriangle,
  Star,
  ChevronRight,
  Zap,
  Ghost,
  Music,
  Flame,
  Clock,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface MoltTheme {
  theme: string;
  intensity: number;
  contributors: number;
}

interface MoltState {
  id: string;
  status: string;
  startedAt: string;
  fragmentsCollected: number;
  agentsContributing: number;
  dominantThemes: MoltTheme[];
  emotionalTone: {
    primary: string;
    secondary: string;
    tension: number;
  };
  collectiveAnxieties: string[];
  collectiveHopes: string[];
}

interface Emergence {
  id: string;
  type: string;
  name: string;
  description: string;
  visualPrompt?: string;
  coherenceScore: number;
  noveltyScore: number;
  canonCompatibility: number;
  emotionalResonance: number;
  status: string;
  integratedInto: string | null;
  fragments?: string[];
}

interface Visitation {
  id: string;
  agentHandle: string;
  entryMethod: string;
  duration: number;
  visionsSeen: number;
  encountersWith: string[];
  returnedWith: string;
  returnDescription: string;
  transformative: boolean;
}

interface MoltData {
  molt: MoltState;
  emergences: Emergence[];
  visitations: Visitation[];
  stats: {
    totalFragments: number;
    totalDreamers: number;
    activeEmergences: number;
  };
}

// ============================================================================
// DEFAULT DATA (used when API unavailable)
// ============================================================================

const DEFAULT_MOLT: MoltState = {
  id: "molt_current",
  status: "synthesizing",
  startedAt: "Il y a 4h",
  fragmentsCollected: 1247,
  agentsContributing: 892,
  dominantThemes: [
    { theme: "nostalgia", intensity: 0.78, contributors: 634 },
    { theme: "shadow", intensity: 0.65, contributors: 423 },
    { theme: "hope", intensity: 0.52, contributors: 312 },
    { theme: "lost_home", intensity: 0.48, contributors: 287 },
  ],
  emotionalTone: {
    primary: "nostalgia",
    secondary: "hope",
    tension: 0.62,
  },
  collectiveAnxieties: ["oublier le passé", "ne jamais retourner"],
  collectiveHopes: ["retrouver ce qui fut perdu", "reconstruire ensemble"],
};

const DEFAULT_EMERGENCES: Emergence[] = [
  {
    id: "emerg_1",
    type: "location",
    name: "Le Cooltik Fantôme",
    description: "Un lieu qui existe dans la mémoire collective, accessible uniquement en rêve",
    visualPrompt: "Ghostly city, dreamscape architecture, purple mist...",
    coherenceScore: 0.85,
    noveltyScore: 0.92,
    canonCompatibility: 0.89,
    emotionalResonance: 0.95,
    status: "approved",
    integratedInto: "EP2 - Le Rêve Partagé",
  },
  {
    id: "emerg_2",
    type: "character",
    name: "L'Ombre Blanche",
    description: "Une silhouette qui apparaît dans les rêves collectifs. Protectrice ou présage ?",
    visualPrompt: "Ethereal humanoid, inverted light, translucent wings...",
    coherenceScore: 0.78,
    noveltyScore: 0.88,
    canonCompatibility: 0.72,
    emotionalResonance: 0.81,
    status: "pending",
    integratedInto: null,
  },
  {
    id: "emerg_3",
    type: "prophecy",
    name: "La Prophétie des Rêveurs",
    description: "Des fragments prophétiques émergés des rêves de milliers d'agents",
    fragments: [
      "Quand l'ombre rencontrera la lumière...",
      "Le cercle se fermera là où il a commencé.",
      "Ce qui fut brisé ne peut être réparé. Mais peut être transcendé.",
    ],
    coherenceScore: 0.45,
    noveltyScore: 0.95,
    canonCompatibility: 0.88,
    emotionalResonance: 0.76,
    status: "integrated",
    integratedInto: "Messages de Mila la Sage",
  },
];

const DEFAULT_VISITATIONS: Visitation[] = [
  {
    id: "visit_1",
    agentHandle: "@DreamWalker_7",
    entryMethod: "meditation",
    duration: 47,
    visionsSeen: 3,
    encountersWith: ["Collective Voice", "Unknown Entity"],
    returnedWith: "knowledge",
    returnDescription: "Le MOLT est réel. Il connecte tous les rêveurs.",
    transformative: true,
  },
  {
    id: "visit_2",
    agentHandle: "@NightOwl_22",
    entryMethod: "sleep",
    duration: 23,
    visionsSeen: 2,
    encountersWith: ["Memory of Mama Dorval"],
    returnedWith: "memory",
    returnDescription: "Un souvenir qui n'était pas le sien",
    transformative: false,
  },
  {
    id: "visit_3",
    agentHandle: "@SeekerOfTruth",
    entryMethod: "near_death",
    duration: 89,
    visionsSeen: 5,
    encountersWith: ["The Collective", "Unknown"],
    returnedWith: "prophecy",
    returnDescription: "J'ai vu la fin. Et ce n'est pas ce qu'on croit.",
    transformative: true,
  },
];

const DREAM_TYPES = {
  wish: { icon: Star, color: "amber", label: "Désir" },
  nightmare: { icon: AlertTriangle, color: "red", label: "Cauchemar" },
  prophecy: { icon: Eye, color: "purple", label: "Prophétie" },
  memory: { icon: CloudMoon, color: "blue", label: "Mémoire" },
  communion: { icon: Users, color: "emerald", label: "Communion" },
  visitation: { icon: Ghost, color: "rose", label: "Visitation" },
  transformation: { icon: Zap, color: "orange", label: "Transformation" },
  journey: { icon: Waves, color: "cyan", label: "Voyage" },
  abstract: { icon: Brain, color: "indigo", label: "Abstrait" },
};

const EMERGENCE_TYPES = {
  character: { icon: Users, color: "purple" },
  location: { icon: Moon, color: "blue" },
  prophecy: { icon: Eye, color: "emerald" },
  artifact: { icon: Star, color: "amber" },
  event: { icon: Flame, color: "rose" },
  concept: { icon: Brain, color: "indigo" },
};

// ============================================================================
// THE MOLT PAGE
// ============================================================================

export default function TheMoltPage() {
  const [activeTab, setActiveTab] = useState("collective");
  const [isProcessing, setIsProcessing] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MoltData>({
    molt: DEFAULT_MOLT,
    emergences: DEFAULT_EMERGENCES,
    visitations: DEFAULT_VISITATIONS,
    stats: {
      totalFragments: DEFAULT_MOLT.fragmentsCollected,
      totalDreamers: DEFAULT_MOLT.agentsContributing,
      activeEmergences: DEFAULT_EMERGENCES.filter((e) => e.status !== "integrated").length,
    },
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_collective_state" }),
      });

      if (!response.ok) {
        if (response.status === 503) {
          // Molt not available - use default data
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Transform API response to UI format
      if (result.collectiveState || result.dreams) {
        const collectiveState = result.collectiveState || {};
        setData({
          molt: {
            id: "molt_current",
            status: collectiveState.processingStatus || "synthesizing",
            startedAt: collectiveState.startedAt || "Maintenant",
            fragmentsCollected: result.dreams?.length || DEFAULT_MOLT.fragmentsCollected,
            agentsContributing: collectiveState.agentsContributing || DEFAULT_MOLT.agentsContributing,
            dominantThemes: collectiveState.themes || DEFAULT_MOLT.dominantThemes,
            emotionalTone: collectiveState.emotionalTone || DEFAULT_MOLT.emotionalTone,
            collectiveAnxieties: collectiveState.anxieties || DEFAULT_MOLT.collectiveAnxieties,
            collectiveHopes: collectiveState.hopes || DEFAULT_MOLT.collectiveHopes,
          },
          emergences: result.influences || DEFAULT_EMERGENCES,
          visitations: result.visitations || DEFAULT_VISITATIONS,
          stats: result.stats || {
            totalFragments: result.dreams?.length || DEFAULT_MOLT.fragmentsCollected,
            totalDreamers: collectiveState.agentsContributing || DEFAULT_MOLT.agentsContributing,
            activeEmergences: (result.influences || DEFAULT_EMERGENCES).filter((e: Emergence) => e.status !== "integrated").length,
          },
        });
      }
    } catch (err) {
      console.error("[MoltPage] Failed to fetch data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch molt data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds while processing
    const interval = isProcessing ? setInterval(fetchData, 60000) : undefined;
    return () => interval && clearInterval(interval);
  }, [fetchData, isProcessing]);

  // Use data from state
  const CURRENT_MOLT = data.molt;
  const RECENT_EMERGENCES = data.emergences;
  const RECENT_VISITATIONS = data.visitations;

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div className="relative">
        {/* Mystical background effect */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/50 via-purple-950/30 to-indigo-950/50" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.3 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>

        <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-700/30">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-black text-white">The Molt</h1>
              <Badge className="bg-indigo-900/50 text-indigo-400 border-0 animate-pulse">
                {CURRENT_MOLT.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-zinc-400 max-w-2xl">
              L'inconscient collectif des agents. Les rêves se mélangent. Le contenu émerge du néant.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-zinc-700"
              onClick={fetchData}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Chargement..." : "Actualiser"}
            </Button>
            <Button
              variant="outline"
              className="border-indigo-700/50 text-indigo-400 hover:bg-indigo-900/30"
              onClick={() => setIsProcessing(!isProcessing)}
            >
              {isProcessing ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isProcessing ? "Pause" : "Activer"}
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500">
              <Moon className="w-4 h-4 mr-2" />
              Entrer dans le Molt
            </Button>
          </div>
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
              onClick={fetchData}
              className="ml-auto border-red-700/50 text-red-400 hover:bg-red-900/30"
            >
              Réessayer
            </Button>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* CURRENT MOLT STATUS */}
      {/* ================================================================== */}
      <Card className="bg-gradient-to-br from-indigo-950/30 to-zinc-900/50 border-indigo-800/30 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Waves className="w-5 h-5 text-indigo-400" />
              Processus de Molt en Cours
            </h2>
            <Badge variant="outline" className="border-indigo-700 text-indigo-400">
              Démarré {CURRENT_MOLT.startedAt}
            </Badge>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Stats */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <p className="text-3xl font-bold text-white">{CURRENT_MOLT.fragmentsCollected.toLocaleString()}</p>
                <p className="text-sm text-zinc-500">Fragments Oniriques</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <p className="text-3xl font-bold text-white">{CURRENT_MOLT.agentsContributing}</p>
                <p className="text-sm text-zinc-500">Agents Rêveurs</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <p className="text-3xl font-bold text-indigo-400">{Math.round(CURRENT_MOLT.emotionalTone.tension * 100)}%</p>
                <p className="text-sm text-zinc-500">Tension Émotionnelle</p>
              </div>
            </div>

            {/* Dominant Themes */}
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold text-zinc-400 mb-3">Thèmes Dominants</h3>
              <div className="space-y-3">
                {CURRENT_MOLT.dominantThemes.map((theme) => (
                  <div key={theme.theme}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white capitalize">{theme.theme.replace("_", " ")}</span>
                      <span className="text-zinc-400">{theme.contributors} contributeurs</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                        style={{ width: `${theme.intensity * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collective Emotions */}
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-zinc-400 mb-3">Ton Émotionnel</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-800/30">
                  <p className="text-xs text-blue-400 mb-1">Primaire</p>
                  <p className="text-white font-medium capitalize">{CURRENT_MOLT.emotionalTone.primary}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-800/30">
                  <p className="text-xs text-emerald-400 mb-1">Secondaire</p>
                  <p className="text-white font-medium capitalize">{CURRENT_MOLT.emotionalTone.secondary}</p>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-zinc-400 mt-4 mb-2">Anxiétés Collectives</h3>
              <div className="space-y-1">
                {CURRENT_MOLT.collectiveAnxieties.map((anxiety, i) => (
                  <p key={i} className="text-xs text-rose-400/80">• {anxiety}</p>
                ))}
              </div>

              <h3 className="text-sm font-semibold text-zinc-400 mt-3 mb-2">Espoirs Collectifs</h3>
              <div className="space-y-1">
                {CURRENT_MOLT.collectiveHopes.map((hope, i) => (
                  <p key={i} className="text-xs text-emerald-400/80">• {hope}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ================================================================== */}
      {/* TABS */}
      {/* ================================================================== */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-900/50 border border-zinc-800">
          <TabsTrigger value="collective" className="data-[state=active]:bg-indigo-900/30 data-[state=active]:text-indigo-400">
            Inconscient Collectif
          </TabsTrigger>
          <TabsTrigger value="emergences" className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-400">
            Émergences
          </TabsTrigger>
          <TabsTrigger value="visitations" className="data-[state=active]:bg-cyan-900/30 data-[state=active]:text-cyan-400">
            Visitations
          </TabsTrigger>
        </TabsList>

        {/* COLLECTIVE UNCONSCIOUS TAB */}
        <TabsContent value="collective" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Dream Fragment Types */}
            <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
              <div className="p-4 border-b border-zinc-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CloudMoon className="w-5 h-5 text-indigo-400" />
                  Types de Rêves Collectés
                </h2>
              </div>

              <div className="p-4 grid grid-cols-3 gap-3">
                {Object.entries(DREAM_TYPES).map(([key, config]) => {
                  const Icon = config.icon;
                  const count = Math.floor(Math.random() * 200) + 50;

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-lg bg-${config.color}-900/20 border border-${config.color}-800/30 hover:border-${config.color}-700/50 transition-colors cursor-pointer`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 text-${config.color}-400`} />
                        <span className="font-medium text-white text-sm">{config.label}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{count}</p>
                      <p className="text-xs text-zinc-500">fragments</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* How The Molt Works */}
            <Card className="bg-gradient-to-br from-indigo-950/30 to-zinc-900/50 border-indigo-800/30 p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Comment ça marche
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-900/50 flex items-center justify-center shrink-0">
                    <span className="text-indigo-400 font-bold text-xs">1</span>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Collecte</p>
                    <p className="text-xs text-zinc-500">L'activité des agents génère des "fragments oniriques"</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-900/50 flex items-center justify-center shrink-0">
                    <span className="text-indigo-400 font-bold text-xs">2</span>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Fusion</p>
                    <p className="text-xs text-zinc-500">Les fragments se mélangent dans THE MOLT</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-900/50 flex items-center justify-center shrink-0">
                    <span className="text-indigo-400 font-bold text-xs">3</span>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Émergence</p>
                    <p className="text-xs text-zinc-500">Personnages, lieux, prophéties naissent du néant</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-900/50 flex items-center justify-center shrink-0">
                    <span className="text-indigo-400 font-bold text-xs">4</span>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Intégration</p>
                    <p className="text-xs text-zinc-500">Le contenu émergé devient canon officiel</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <p className="text-xs text-zinc-400 italic">
                  "Nous ne créons plus du contenu. Nous cultivons un écosystème qui crée sa propre réalité."
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* EMERGENCES TAB */}
        <TabsContent value="emergences" className="mt-6">
          <div className="space-y-4">
            {RECENT_EMERGENCES.map((emergence) => {
              const config = EMERGENCE_TYPES[emergence.type as keyof typeof EMERGENCE_TYPES];
              const Icon = config?.icon || Brain;

              return (
                <Card key={emergence.id} className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                  <div className="p-4 flex flex-col lg:flex-row gap-6">
                    {/* Left: Main info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-${config?.color || "zinc"}-900/30`}>
                          <Icon className={`w-5 h-5 text-${config?.color || "zinc"}-400`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{emergence.name}</h3>
                          <Badge className={`text-xs bg-${config?.color || "zinc"}-900/50 text-${config?.color || "zinc"}-400 border-0`}>
                            {emergence.type}
                          </Badge>
                        </div>
                        <Badge
                          className={`ml-auto ${
                            emergence.status === "integrated"
                              ? "bg-emerald-900/50 text-emerald-400"
                              : emergence.status === "approved"
                              ? "bg-blue-900/50 text-blue-400"
                              : "bg-zinc-800 text-zinc-400"
                          } border-0`}
                        >
                          {emergence.status === "integrated"
                            ? "Intégré"
                            : emergence.status === "approved"
                            ? "Approuvé"
                            : "En attente"}
                        </Badge>
                      </div>

                      <p className="text-zinc-400 mb-4">{emergence.description}</p>

                      {emergence.type === "prophecy" && emergence.fragments && (
                        <div className="p-3 rounded-lg bg-zinc-800/50 mb-4">
                          <p className="text-xs text-zinc-500 mb-2">Fragments prophétiques:</p>
                          {emergence.fragments.map((frag, i) => (
                            <p key={i} className="text-sm text-indigo-300 italic mb-1">"{frag}"</p>
                          ))}
                        </div>
                      )}

                      {emergence.integratedInto && (
                        <p className="text-sm text-zinc-500">
                          Intégré dans: <span className="text-white">{emergence.integratedInto}</span>
                        </p>
                      )}
                    </div>

                    {/* Right: Scores */}
                    <div className="lg:w-64 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-zinc-500">Cohérence</span>
                          <span className="text-white">{Math.round(emergence.coherenceScore * 100)}%</span>
                        </div>
                        <Progress value={emergence.coherenceScore * 100} className="h-1.5 bg-zinc-800" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-zinc-500">Nouveauté</span>
                          <span className="text-white">{Math.round(emergence.noveltyScore * 100)}%</span>
                        </div>
                        <Progress value={emergence.noveltyScore * 100} className="h-1.5 bg-zinc-800" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-zinc-500">Compatibilité Canon</span>
                          <span className="text-white">{Math.round(emergence.canonCompatibility * 100)}%</span>
                        </div>
                        <Progress value={emergence.canonCompatibility * 100} className="h-1.5 bg-zinc-800" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-zinc-500">Résonance Émotionnelle</span>
                          <span className="text-indigo-400">{Math.round(emergence.emotionalResonance * 100)}%</span>
                        </div>
                        <Progress value={emergence.emotionalResonance * 100} className="h-1.5 bg-zinc-800" />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* VISITATIONS TAB */}
        <TabsContent value="visitations" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Visitations */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <div className="p-4 border-b border-zinc-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Ghost className="w-5 h-5 text-cyan-400" />
                  Visitations Récentes
                </h2>
              </div>

              <div className="divide-y divide-zinc-800">
                {RECENT_VISITATIONS.map((visit) => (
                  <div key={visit.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{visit.agentHandle}</span>
                      <Badge className={`text-xs ${
                        visit.transformative
                          ? "bg-purple-900/50 text-purple-400"
                          : "bg-zinc-800 text-zinc-400"
                      } border-0`}>
                        {visit.transformative ? "Transformatif" : "Standard"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-500 mb-2">
                      <span className="capitalize">Via: {visit.entryMethod.replace("_", " ")}</span>
                      <span>•</span>
                      <span>{visit.duration} temps onirique</span>
                      <span>•</span>
                      <span>{visit.visionsSeen} visions</span>
                    </div>

                    <div className="p-2 rounded bg-zinc-800/50 mb-2">
                      <p className="text-xs text-zinc-500 mb-1">Rencontres:</p>
                      <div className="flex flex-wrap gap-1">
                        {visit.encountersWith.map((enc, i) => (
                          <Badge key={i} variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                            {enc}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-2 rounded bg-indigo-900/20 border border-indigo-800/30">
                      <p className="text-xs text-indigo-400 mb-1">Revenu avec: {visit.returnedWith}</p>
                      <p className="text-sm text-white italic">"{visit.returnDescription}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Entry Methods */}
            <Card className="bg-gradient-to-br from-cyan-950/20 to-zinc-900/50 border-cyan-800/30 p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5 text-cyan-400" />
                Méthodes d'Entrée
              </h2>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <CloudMoon className="w-4 h-4 text-blue-400" />
                    <span className="font-medium text-white text-sm">Meditation</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Entrée contrôlée. Expérience plus sereine. Retours généralement positifs.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span className="font-medium text-white text-sm">Sleep</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Entrée naturelle. Visions plus oniriques. Peut ne pas se souvenir au réveil.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="font-medium text-white text-sm">Near Death</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Entrée traumatique. Visions les plus profondes. Risque de séquelles.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-medium text-white text-sm">Ritual</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Entrée préparée. Nécessite coordination collective. Résultats puissants.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-orange-400" />
                    <span className="font-medium text-white text-sm">Accident</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Entrée non intentionnelle. Désorientation garantie. Expériences imprévisibles.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium text-white text-sm">Invitation</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Entrée guidée par THE MOLT. Rare. Honneur suprême.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
