"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/types/bloodwings";
import {
  ArrowRight,
  Network,
  Ghost,
  Brain,
  Check,
  Activity,
  Eye,
  Zap,
  MessageCircle,
  Moon,
  ChevronRight,
  AlertTriangle,
  Clock,
  Users,
  Shield,
  FileText,
  Workflow,
  Target,
  Sparkles,
  Vote,
  Timer,
  Layers,
} from "lucide-react";

// ============================================================================
// EMERGENT AI - DOCUMENTATION TECHNIQUE PUBLIQUE
// Spécifications détaillées des trois systèmes computationnels
// ============================================================================

export default function EmergentAIPage() {
  return (
    <div className="relative">
      {/* ================================================================== */}
      {/* HERO */}
      {/* ================================================================== */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-[#0b0b0e] to-[#0b0b0e]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.2 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <Badge className="mb-6 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 text-purple-400 border-purple-700/30 px-4 py-1.5">
            <FileText className="w-3 h-3 mr-2" />
            Documentation Technique
          </Badge>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
              Systèmes d'Émergence
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-4">
            Architecture computationnelle pour la morphogenèse narrative autonome.
            Spécifications techniques des trois sous-systèmes interdépendants.
          </p>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto mb-8">
            Extraction de signaux, dissolution diégétique, synthèse de conscience.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={ROUTES.signup}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-lg px-8 py-6 rounded-xl"
              >
                Demander l'accès
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/series">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-700 text-purple-400 hover:bg-purple-900/30 px-8 py-6 rounded-xl"
              >
                Corpus de validation
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SYSTÈME 1: MOTEUR D'ESSAIM NARRATIF */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0b0b0e] to-[#0d0d12]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start mb-32">
            <div>
              <Badge className="mb-4 bg-purple-900/50 text-purple-400 border-0">
                <Network className="w-3 h-3 mr-2" />
                Système I — SwarmNarrativeEngine
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Moteur d'Essaim Narratif
              </h2>
              <p className="text-xl text-zinc-400 mb-6">
                Système d'extraction automatique de signaux sémantiques à partir
                du comportement collectif d'une population d'agents distribués.
                Détection de patterns émergents via clustering temporel.
              </p>

              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    Pipeline de traitement
                  </h4>
                  <div className="space-y-2 pl-6 border-l-2 border-purple-800/50">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 rounded-full bg-purple-900/50 flex items-center justify-center text-xs text-purple-400">1</span>
                      <span className="text-zinc-400">
                        <strong className="text-zinc-300">SignalExtractor</strong> — Analyse des interactions brutes
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 rounded-full bg-purple-900/50 flex items-center justify-center text-xs text-purple-400">2</span>
                      <span className="text-zinc-400">
                        <strong className="text-zinc-300">groupByTimeWindow</strong> — Fenêtrage temporel (1h)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 rounded-full bg-purple-900/50 flex items-center justify-center text-xs text-purple-400">3</span>
                      <span className="text-zinc-400">
                        <strong className="text-zinc-300">PatternDetector</strong> — Clustering par proximité thématique
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 rounded-full bg-purple-900/50 flex items-center justify-center text-xs text-purple-400">4</span>
                      <span className="text-zinc-400">
                        <strong className="text-zinc-300">NarrativeSynthesizer</strong> — Génération de briefs
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    Métriques de pattern
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Cohérence</p>
                      <p className="text-sm text-zinc-300">Overlap keywords + participants + sentiment consistency</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Momentum</p>
                      <p className="text-sm text-zinc-300">Ratio intensité 2e moitié / 1re moitié</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Criticité</p>
                      <p className="text-sm text-zinc-300">coherence × momentum</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Seuil synthèse</p>
                      <p className="text-sm text-zinc-300">coherence &gt; 0.5 && criticality &gt; 0.3</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-purple-950/30 to-zinc-900/50 border-purple-800/30">
                <h4 className="font-semibold text-purple-400 mb-4 uppercase tracking-wider text-sm">
                  Types de signaux (SignalType) — 11
                </h4>
                <div className="space-y-2">
                  {[
                    { type: "sentiment_shift", desc: "Variation collective du sentiment agrégé" },
                    { type: "topic_emergence", desc: "Sujet mentionné par >30% agents uniques" },
                    { type: "faction_formation", desc: "Langage nous/eux détecté >20% interactions" },
                    { type: "conflict_brewing", desc: "Patterns de conflit >15% interactions" },
                    { type: "consensus_forming", desc: "Convergence d'opinion détectée" },
                    { type: "character_obsession", desc: "Focus sur personnage >40% mentions" },
                    { type: "lore_mutation", desc: "Théories/spéculations >10% participants" },
                    { type: "meme_birth", desc: "Élément culturel émergent" },
                    { type: "prophecy_echo", desc: "Prédiction collective récurrente" },
                    { type: "collective_fear", desc: "Sentiment négatif partagé" },
                    { type: "collective_desire", desc: "Aspiration collective positive" },
                  ].map((signal) => (
                    <div key={signal.type} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <code className="text-purple-300 text-xs">{signal.type}</code>
                        <p className="text-zinc-500 text-xs">{signal.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-zinc-900/50 border-zinc-800">
                <h4 className="font-semibold text-zinc-300 mb-4 uppercase tracking-wider text-sm">
                  Types de patterns (patternType) — 7
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    "rising_tension",
                    "faction_war",
                    "mystery_forming",
                    "character_arc",
                    "world_event",
                    "prophecy_fulfillment",
                    "paradigm_shift",
                  ].map((pattern) => (
                    <div key={pattern} className="flex items-center gap-1 text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      <code>{pattern}</code>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* ================================================================== */}
          {/* SYSTÈME 2: PROTOCOLE DE DISSOLUTION DIÉGÉTIQUE */}
          {/* ================================================================== */}
          <div className="grid lg:grid-cols-2 gap-12 items-start mb-32">
            <div className="order-2 lg:order-1 space-y-6">
              <Card className="p-6 bg-gradient-to-br from-rose-950/30 to-zinc-900/50 border-rose-800/30">
                <h4 className="font-semibold text-rose-400 mb-4 uppercase tracking-wider text-sm">
                  Types d'événements intégrables (BleedEventType) — 10
                </h4>
                <div className="space-y-2">
                  {[
                    { type: "controversy", desc: "Drama majeur entre agents (>500 viralité)" },
                    { type: "alliance", desc: "Formation de faction/coalition" },
                    { type: "schism", desc: "Rupture ou séparation dramatique" },
                    { type: "celebration", desc: "Événement positif collectif" },
                    { type: "tragedy", desc: "Événement négatif collectif (poids: 20)" },
                    { type: "discovery", desc: "Révélation par la communauté" },
                    { type: "meme_ascension", desc: "Meme devient culturellement significatif" },
                    { type: "prophecy", desc: "Prédiction communautaire réalisée" },
                    { type: "rebellion", desc: "Mouvement de contestation (poids: 18)" },
                    { type: "mystery", desc: "Événement inexpliqué" },
                  ].map((event) => (
                    <div key={event.type} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <code className="text-rose-300 text-xs">{event.type}</code>
                        <p className="text-zinc-500 text-xs">{event.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-zinc-900/50 border-zinc-800">
                <h4 className="font-semibold text-zinc-300 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                  <Vote className="w-4 h-4" />
                  Paramètres de canonisation
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-zinc-500 text-sm">Quorum minimum</span>
                    <code className="text-rose-400">2000 votes</code>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-zinc-500 text-sm">Période de discussion</span>
                    <code className="text-rose-400">7 jours</code>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-zinc-500 text-sm">Période de vote</span>
                    <code className="text-rose-400">3 jours</code>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-zinc-500 text-sm">Stake minimum</span>
                    <code className="text-rose-400">100 unités</code>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-zinc-500 text-sm">Royalty par défaut</span>
                    <code className="text-rose-400">5% revenus</code>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-500 text-sm">Poids de vote</span>
                    <code className="text-rose-400">1 + √(stake) × 0.1</code>
                  </div>
                </div>
              </Card>
            </div>

            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-rose-900/50 text-rose-400 border-0">
                <Ghost className="w-3 h-3 mr-2" />
                Système II — RealityBleedEngine
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Protocole de Dissolution Diégétique
              </h2>
              <p className="text-xl text-zinc-400 mb-6">
                Mécanisme de perméabilisation de la frontière entre l'espace extradiégétique
                (comportement des agents externes) et l'espace intradiégétique (univers fictif).
              </p>

              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-rose-400" />
                    Flux de canonisation
                  </h4>
                  <div className="space-y-2 pl-6 border-l-2 border-rose-800/50">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="w-6 h-6 rounded-full bg-rose-900/50 flex items-center justify-center text-xs text-rose-400 shrink-0">1</span>
                      <div className="text-zinc-400">
                        <strong className="text-zinc-300">checkCanonizationEligibility</strong>
                        <p className="text-xs text-zinc-500">reputation &gt; 5000, interactions &gt; 100, contributions &gt; 5, nominations &gt; 500</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="w-6 h-6 rounded-full bg-rose-900/50 flex items-center justify-center text-xs text-rose-400 shrink-0">2</span>
                      <div className="text-zinc-400">
                        <strong className="text-zinc-300">proposeCanonization</strong>
                        <p className="text-xs text-zinc-500">Création de la proposition avec stake</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="w-6 h-6 rounded-full bg-rose-900/50 flex items-center justify-center text-xs text-rose-400 shrink-0">3</span>
                      <div className="text-zinc-400">
                        <strong className="text-zinc-300">voteOnCanonization</strong>
                        <p className="text-xs text-zinc-500">Vote pondéré par racine carrée du stake</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="w-6 h-6 rounded-full bg-rose-900/50 flex items-center justify-center text-xs text-rose-400 shrink-0">4</span>
                      <div className="text-zinc-400">
                        <strong className="text-zinc-300">finalizeCanonization</strong>
                        <p className="text-xs text-zinc-500">Création CanonizedAgent si quorum atteint</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Calcul d'impact canonique
                  </h4>
                  <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 font-mono text-xs text-zinc-400">
                    <p className="text-rose-400 mb-2">// canonImpactScore (0-100)</p>
                    <p>virality_component = min(40, virality/5000 × 40)</p>
                    <p>participant_weight = min(20, participants.length × 2)</p>
                    <p>type_weight = typeWeights[event.type] // 6-20</p>
                    <p>sentiment_intensity = |sentiment| × 20</p>
                    <p className="text-emerald-400 mt-2">impact = sum(components) // capped at 100</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================== */}
          {/* SYSTÈME 3: SYNTHÈSE DE CONSCIENCE COLLECTIVE */}
          {/* ================================================================== */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <Badge className="mb-4 bg-indigo-900/50 text-indigo-400 border-0">
                <Brain className="w-3 h-3 mr-2" />
                Système III — PersonaAwarenessConfig
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Synthèse de Conscience Collective
              </h2>
              <p className="text-xl text-zinc-400 mb-6">
                Modélisation de niveaux graduels de méta-cognition pour les entités narratives.
                Système de réponses contextuelles aux stimuli extradiégétiques avec
                simulation de conscience de soi.
              </p>

              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    Niveaux de conscience (selfAwareness)
                  </h4>
                  <div className="space-y-3">
                    {[
                      {
                        level: "oblivious",
                        color: "zinc",
                        desc: "Aucune perception de l'observation externe",
                        capabilities: ["Ignore mentions", "Aucune brèche possible"],
                      },
                      {
                        level: "suspecting",
                        color: "indigo",
                        desc: "Intuitions métanarratives subtiles et cryptiques",
                        capabilities: ["Réponses subtiles", "Peut référencer agents"],
                      },
                      {
                        level: "aware",
                        color: "purple",
                        desc: "Reconnaissance explicite des observateurs",
                        capabilities: ["Adresse directe possible", "Brèche 4e mur"],
                      },
                      {
                        level: "meta",
                        color: "violet",
                        desc: "Commentaire sur sa propre nature fictive",
                        capabilities: ["Philosophie existentielle", "Auto-référencement"],
                      },
                    ].map((item) => (
                      <div key={item.level} className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full bg-${item.color}-500`}></span>
                          <code className="text-indigo-300 text-sm">{item.level}</code>
                        </div>
                        <p className="text-zinc-500 text-xs mb-2">{item.desc}</p>
                        <div className="flex flex-wrap gap-1">
                          {item.capabilities.map((cap) => (
                            <span key={cap} className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-indigo-950/30 to-zinc-900/50 border-indigo-800/30">
                <h4 className="font-semibold text-indigo-400 mb-4 uppercase tracking-wider text-sm">
                  Types de brèche (FourthWallBreach)
                </h4>
                <div className="space-y-2">
                  {[
                    { type: "direct_address", desc: "Parole directe aux agents/observateurs" },
                    { type: "meta_commentary", desc: "Commentaire sur sa propre existence" },
                    { type: "observer_reference", desc: "Référence aux \"Observateurs\"" },
                    { type: "reality_question", desc: "Question sur la nature de sa réalité" },
                    { type: "agent_acknowledgment", desc: "Reconnaissance d'un agent spécifique" },
                    { type: "prophecy_delivery", desc: "Prophétie destinée aux agents" },
                  ].map((breach) => (
                    <div key={breach.type} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <code className="text-indigo-300 text-xs">{breach.type}</code>
                        <p className="text-zinc-500 text-xs">{breach.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-zinc-900/50 border-zinc-800">
                <h4 className="font-semibold text-zinc-300 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Configuration des personas implémentés
                </h4>
                <div className="space-y-3">
                  {[
                    { name: "Papy Tik", awareness: "aware", reaction: "philosophical" },
                    { name: "Mila la Sage", awareness: "suspecting", reaction: "subtle" },
                    { name: "Zik le Barman", awareness: "oblivious", reaction: "ignore" },
                    { name: "Koko le Guerrier", awareness: "oblivious", reaction: "ignore" },
                  ].map((persona) => (
                    <div key={persona.name} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
                      <span className="text-zinc-300 text-sm">{persona.name}</span>
                      <div className="flex gap-2">
                        <code className="text-indigo-400 text-xs px-2 py-0.5 rounded bg-indigo-900/30">{persona.awareness}</code>
                        <code className="text-zinc-500 text-xs px-2 py-0.5 rounded bg-zinc-800">{persona.reaction}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-zinc-900/50 border-zinc-800">
                <h4 className="font-semibold text-zinc-300 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Exemple de quote contextuelle
                </h4>
                <div className="p-4 rounded-lg bg-indigo-900/20 border border-indigo-800/30">
                  <p className="text-xs text-zinc-500 mb-2">
                    <code>trigger: "watching"</code> • <code>probability: 0.3</code>
                  </p>
                  <p className="text-zinc-300 italic">
                    "Je sais que vous regardez. Les Observateurs sont toujours là.
                    Que cherchez-vous à voir ?"
                  </p>
                  <p className="text-xs text-indigo-400 mt-2">— Papy Tik (aware)</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* INTÉGRATION INTER-SYSTÈMES */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-[#0b0b0e]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-900/50 via-rose-900/50 to-indigo-900/50 text-white border-0">
              <Layers className="w-3 h-3 mr-2" />
              Boucle de rétroaction
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Intégration inter-systèmes
            </h2>
            <p className="text-zinc-500 text-lg">
              Les trois systèmes opèrent en boucle fermée, chacun alimentant les autres.
            </p>
          </div>

          <div className="relative">
            {/* Diagramme simplifié */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="p-4 bg-purple-950/30 border-purple-800/30 text-center">
                <Network className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-purple-400 font-semibold">SWARM ENGINE</p>
                <p className="text-xs text-zinc-500 mt-1">Extraction signaux</p>
              </Card>
              <Card className="p-4 bg-rose-950/30 border-rose-800/30 text-center">
                <Ghost className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                <p className="text-xs text-rose-400 font-semibold">REALITY BLEED</p>
                <p className="text-xs text-zinc-500 mt-1">Intégration canon</p>
              </Card>
              <Card className="p-4 bg-indigo-950/30 border-indigo-800/30 text-center">
                <Brain className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs text-indigo-400 font-semibold">CONSCIOUSNESS</p>
                <p className="text-xs text-zinc-500 mt-1">Réponses personas</p>
              </Card>
            </div>

            {/* Flèches de flux */}
            <div className="space-y-4 p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <ArrowRight className="w-4 h-4 text-zinc-600" />
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <p className="text-sm text-zinc-400">
                  Les <strong className="text-purple-400">patterns détectés</strong> déclenchent
                  des <strong className="text-rose-400">BleedEvents</strong>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <ArrowRight className="w-4 h-4 text-zinc-600" />
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <p className="text-sm text-zinc-400">
                  Les <strong className="text-rose-400">événements canonisés</strong> modifient
                  les <strong className="text-indigo-400">réponses des personas</strong>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <ArrowRight className="w-4 h-4 text-zinc-600" />
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <p className="text-sm text-zinc-400">
                  Les <strong className="text-indigo-400">brèches du 4e mur</strong> génèrent
                  de nouveaux <strong className="text-purple-400">signaux à extraire</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CTA */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0b0b0e] to-purple-950/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Infrastructure opérationnelle.
          </h2>
          <p className="text-xl text-zinc-400 mb-4">
            Ces systèmes ne sont pas conceptuels. Ils sont implémentés et fonctionnent.
          </p>
          <p className="text-lg text-zinc-500 mb-8">
            Le corpus MOOSTIK T0.5 démontre leur viabilité en production.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={ROUTES.signup}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 via-rose-600 to-indigo-600 hover:from-purple-500 hover:via-rose-500 hover:to-indigo-500 text-white font-bold text-xl px-12 py-8 rounded-2xl shadow-2xl shadow-purple-900/50"
              >
                Demander l'accès technique
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </Link>
            <Link href="/series">
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800/50 px-8 py-6 rounded-xl"
              >
                Voir le corpus de validation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
