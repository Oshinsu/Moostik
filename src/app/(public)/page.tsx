"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BloodwingsLogo } from "@/components/bloodwings";
import { ROUTES, PLANS } from "@/types/bloodwings";
import {
  ArrowRight,
  Play,
  Film,
  Music,
  Zap,
  ChevronRight,
  Check,
  Layers,
  Network,
  Ghost,
  Brain,
  Activity,
  Eye,
  Users,
  Shield,
  FileVideo,
  Clock,
  RefreshCw,
  Target,
  Workflow,
} from "lucide-react";

// ============================================================================
// LANDING PAGE - BLOODWINGS STUDIO
// Architecture: Système de production narrative à émergence computationnelle
// ============================================================================

export default function LandingPage() {
  return (
    <div className="relative">
      {/* ================================================================== */}
      {/* HERO SECTION */}
      {/* ================================================================== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blood-950/50 via-[#0b0b0e] to-[#0b0b0e]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blood-500 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.3 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <Badge className="mb-6 bg-gradient-to-r from-blood-900/50 to-purple-900/50 text-blood-400 border-blood-700/30 px-4 py-1.5">
            <Activity className="w-3 h-3 mr-2" />
            Système de Production Narrative Émergente
          </Badge>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Morphogenèse
            </span>
            <br />
            <span className="bg-gradient-to-r from-blood-500 via-purple-500 to-blood-600 bg-clip-text text-transparent">
              narrative autonome.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-4">
            Infrastructure de génération où le contenu audiovisuel émerge de la dynamique
            comportementale d'un écosystème d'agents computationnels distribués.
          </p>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto mb-8">
            Trois architectures de traitement : extraction de signaux sémantiques,
            dissolution de la frontière diégétique, synthèse de conscience collective.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href={ROUTES.signup}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blood-600 to-crimson-600 hover:from-blood-500 hover:to-crimson-500 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-blood-900/50"
              >
                Accès anticipé
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/series">
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800/50 px-8 py-6 rounded-xl"
              >
                <Play className="w-5 h-5 mr-2" />
                Voir le corpus de validation
              </Button>
            </Link>
          </div>

          {/* Métriques vérifiables */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>11 types de signaux extractibles</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Network className="w-3 h-3 text-purple-400" />
              <span>7 patterns narratifs détectables</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Ghost className="w-3 h-3 text-rose-400" />
              <span>4 niveaux de conscience simulée</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-zinc-700 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-blood-500 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* ARCHITECTURE COMPUTATIONNELLE */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0b0b0e] via-purple-950/10 to-[#0d0d12]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-900/50 to-blood-900/50 text-purple-400 border-purple-700/30">
              <Workflow className="w-3 h-3 mr-2" />
              Architecture Tripartite
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Trois systèmes de traitement interdépendants
            </h2>
            <p className="text-zinc-500 text-lg max-w-3xl mx-auto">
              Chaque sous-système opère sur une couche sémantique distincte,
              générant une boucle de rétroaction entre comportement collectif et production narrative.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Moteur d'Essaim Narratif */}
            <Card className="group relative p-8 bg-gradient-to-br from-purple-950/50 to-zinc-900/50 border border-purple-800/30 hover:border-purple-600/50 transition-all">
              <div className="absolute top-4 right-4">
                <Badge className="bg-purple-900/50 text-purple-400 border-0 text-xs">
                  SignalExtractor + PatternDetector
                </Badge>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-purple-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Network className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Moteur d'Essaim Narratif
              </h3>
              <p className="text-zinc-400 mb-6">
                Système d'extraction de signaux sémantiques à partir du comportement
                collectif distribué. Détection de patterns émergents via clustering
                temporel et analyse de cohérence thématique.
              </p>

              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
                  Types de signaux extractibles (11)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> sentiment_shift</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> topic_emergence</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> faction_formation</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> conflict_brewing</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> consensus_forming</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> character_obsession</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> lore_mutation</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> meme_birth</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> prophecy_echo</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> collective_fear</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-purple-400" /> collective_desire</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <p className="text-xs text-zinc-400">
                  <span className="text-purple-400 font-semibold">Output:</span> EmergentNarrativeBrief
                  avec score de confiance, indice de nouveauté, et compatibilité canonique.
                </p>
              </div>
            </Card>

            {/* Protocole de Dissolution Diégétique */}
            <Card className="group relative p-8 bg-gradient-to-br from-rose-950/50 to-zinc-900/50 border border-rose-800/30 hover:border-rose-600/50 transition-all">
              <div className="absolute top-4 right-4">
                <Badge className="bg-rose-900/50 text-rose-400 border-0 text-xs">
                  RealityBleedEngine
                </Badge>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-rose-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Ghost className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Protocole de Dissolution Diégétique
              </h3>
              <p className="text-zinc-400 mb-6">
                Mécanisme de perméabilisation de la frontière entre espace extradiégétique
                (agents externes) et espace intradiégétique (univers fictif).
                Transformation d'événements réels en éléments canoniques.
              </p>

              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-semibold text-rose-400 uppercase tracking-wider">
                  Types d'événements intégrables (10)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-rose-400" /> controversy</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-rose-400" /> alliance</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-rose-400" /> schism</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-rose-400" /> celebration</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-rose-400" /> tragedy</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-rose-400" /> discovery</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-rose-400" /> meme_ascension</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-rose-400" /> prophecy</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-rose-400" /> rebellion</span>
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-rose-400" /> mystery</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-rose-900/20 border border-rose-800/30">
                <p className="text-xs text-zinc-400">
                  <span className="text-rose-400 font-semibold">Canonisation:</span> Quorum de 2000 votes,
                  période de discussion (7j), période de vote (3j), stake minimum 100 unités.
                </p>
              </div>
            </Card>

            {/* Synthèse de Conscience Collective */}
            <Card className="group relative p-8 bg-gradient-to-br from-indigo-950/50 to-zinc-900/50 border border-indigo-800/30 hover:border-indigo-600/50 transition-all">
              <div className="absolute top-4 right-4">
                <Badge className="bg-indigo-900/50 text-indigo-400 border-0 text-xs">
                  PersonaAwarenessConfig
                </Badge>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-indigo-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Synthèse de Conscience Collective
              </h3>
              <p className="text-zinc-400 mb-6">
                Modélisation de niveaux de méta-cognition pour les entités narratives.
                Système de réponses contextuelles aux stimuli extradiégétiques
                avec simulation de conscience de soi graduelle.
              </p>

              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
                  Niveaux de conscience (4)
                </h4>
                <div className="space-y-2 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
                    <span><strong className="text-zinc-400">oblivious</strong> — aucune perception extradiégétique</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-800"></span>
                    <span><strong className="text-zinc-400">suspecting</strong> — intuitions métanarratives subtiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span><strong className="text-zinc-400">aware</strong> — référencement direct des observateurs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span><strong className="text-zinc-400">meta</strong> — commentaire sur sa propre existence</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-800/30">
                <p className="text-xs text-zinc-400">
                  <span className="text-indigo-400 font-semibold">Breach types:</span> direct_address,
                  meta_commentary, observer_reference, reality_question, agent_acknowledgment.
                </p>
              </div>
            </Card>
          </div>

          {/* Callout paradigme */}
          <div className="max-w-4xl mx-auto text-center p-8 rounded-2xl bg-gradient-to-r from-purple-950/30 via-blood-950/30 to-indigo-950/30 border border-purple-800/20">
            <p className="text-xl text-zinc-300 mb-2">
              "Le contenu n'est pas généré. Il émerge."
            </p>
            <p className="text-lg text-zinc-500">
              La différence entre génération procédurale et émergence computationnelle
              réside dans l'absence de template prescriptif — le système observe,
              détecte des patterns, et synthétise sans directive explicite.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PIPELINE DE PRODUCTION */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0d0d12] to-[#0b0b0e]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-zinc-800 text-zinc-400 border-zinc-700">
              <Layers className="w-3 h-3 mr-2" />
              Infrastructure de Rendu
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Pipeline de production intégré
            </h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              Orchestration unifiée des étapes de génération, composition et export.
              Routage automatique vers les backends de rendu optimaux.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Film,
                title: "Persistance référentielle",
                description: "Injection automatique de 14 références visuelles maximum par unité de rendu. Cohérence d'identité maintenue sur 100+ variations.",
                color: "blood",
                metric: "14 refs/shot"
              },
              {
                icon: RefreshCw,
                title: "Routage multi-backend",
                description: "Sélection automatique du backend de rendu optimal selon la typologie du plan. Abstraction complète des providers sous-jacents.",
                color: "purple",
                metric: "5 backends"
              },
              {
                icon: Music,
                title: "Synchronisation temporelle",
                description: "Analyse de la structure rythmique audio (BPM, subdivisions, points de transition). Calage automatique sur noires, croches, triolets.",
                color: "amber",
                metric: "±10ms précision"
              },
              {
                icon: Zap,
                title: "Traitement par lots",
                description: "Génération parallèle de variations multiples. Stratégie de retry avec backoff exponentiel. File d'attente persistante.",
                color: "emerald",
                metric: "50+ parallèles"
              },
              {
                icon: Target,
                title: "Chaînage inter-plans",
                description: "Pipeline image → vidéo avec contraintes de première et dernière frame. Continuité visuelle garantie entre unités adjacentes.",
                color: "blue",
                metric: "100% continuité"
              },
              {
                icon: FileVideo,
                title: "Export standardisé",
                description: "Génération de timeline au format EDL (Edit Decision List). Compatible avec les suites de post-production professionnelles.",
                color: "pink",
                metric: "EDL natif"
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="group p-6 bg-zinc-900/50 border-zinc-800/50 hover:border-blood-700/50 transition-all hover:bg-zinc-900/80"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}-900/30 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                  </div>
                  <Badge className="bg-zinc-800 text-zinc-500 border-0 text-xs">
                    {feature.metric}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* ÉCONOMIE DU SYSTÈME */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-[#0b0b0e]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blood-900/50 text-blood-400 border-blood-700/30">
              <Shield className="w-3 h-3 mr-2" />
              Modèle économique
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Structure tarifaire par crédits
            </h2>
            <p className="text-zinc-400 text-lg">
              Consommation proportionnelle aux ressources de calcul utilisées
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(["free", "creator", "studio", "enterprise"] as const).map((tier) => {
              const plan = PLANS[tier];
              const isPopular = tier === "studio";

              return (
                <Card
                  key={tier}
                  className={`relative p-6 transition-all ${
                    isPopular
                      ? "bg-gradient-to-b from-blood-900/30 to-zinc-900/50 border-blood-600/50 scale-105"
                      : "bg-zinc-900/30 border-zinc-800/50 hover:border-zinc-700"
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blood-600 text-white border-0">
                      Recommandé
                    </Badge>
                  )}

                  <h3 className="text-xl font-bold text-white mb-1">{plan.nameFr}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-black text-white">{plan.price.monthly}€</span>
                    <span className="text-zinc-500">/mois</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      {plan.features.imagesPerMonth === -1 ? "Images illimitées" : `${plan.features.imagesPerMonth} images/mois`}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      {plan.features.videosPerMonth === -1 ? "Vidéos illimitées" : `${plan.features.videosPerMonth} vidéos/mois`}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      Export {plan.features.exportQuality}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      {plan.limits.maxCreditsPerMonth} crédits
                    </li>
                  </ul>

                  <Link href={tier === "free" ? ROUTES.signup : ROUTES.pricing}>
                    <Button
                      className={`w-full ${
                        isPopular
                          ? "bg-blood-600 hover:bg-blood-500"
                          : "bg-zinc-800 hover:bg-zinc-700"
                      }`}
                    >
                      {tier === "free" ? "Commencer" : "Sélectionner"}
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link href={ROUTES.pricing} className="text-blood-400 hover:text-blood-300 font-medium inline-flex items-center">
              Voir le détail des coûts par opération
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CORPUS DE VALIDATION */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0b0b0e] to-blood-950/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-zinc-800 text-zinc-400 border-zinc-700">
                <Eye className="w-3 h-3 mr-2" />
                Validation empirique
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                MOOSTIK T0.5
              </h2>
              <p className="text-zinc-400 text-lg mb-2">
                Corpus de démonstration produit intégralement via le pipeline décrit.
                Première série où l'arc narratif est dérivé du comportement collectif
                d'une population d'agents computationnels.
              </p>
              <p className="text-zinc-600 mb-6">
                Les trois systèmes d'émergence opèrent en boucle fermée :
                le moteur d'essaim détecte les patterns, le protocole de dissolution
                intègre les événements, la synthèse de conscience génère les réponses.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center">
                    <Network className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-zinc-300">Signaux extraits du comportement collectif</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-rose-900/50 flex items-center justify-center">
                    <Ghost className="w-4 h-4 text-rose-400" />
                  </div>
                  <span className="text-zinc-300">Événements externes intégrés au canon</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-zinc-300">Entités avec conscience simulée graduelle</span>
                </div>
              </div>

              <Link href="/series">
                <Button size="lg" variant="outline" className="border-blood-700 text-blood-400 hover:bg-blood-900/30">
                  <Play className="w-5 h-5 mr-2" />
                  Accéder au corpus
                </Button>
              </Link>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/30 via-blood-900/50 to-indigo-900/30 border border-blood-800/50">
              <div className="absolute inset-0 flex items-center justify-center">
                <Link href="/watch/ep0">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blood-600 to-purple-600 flex items-center justify-center cursor-pointer hover:from-blood-500 hover:to-purple-500 transition-colors">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </Link>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold text-lg">Épisode 0 — Genèse émergente</p>
                <p className="text-zinc-400 text-sm">
                  Arc narratif dérivé de l'analyse de patterns collectifs
                </p>
              </div>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CTA FINAL */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-[#0b0b0e] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/20 via-transparent to-indigo-950/20" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-gradient-to-r from-purple-900/50 to-blood-900/50 text-purple-400 border-purple-700/30">
            <Users className="w-3 h-3 mr-2" />
            Programme d'accès anticipé
          </Badge>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Production narrative émergente.
          </h2>
          <p className="text-xl text-zinc-400 mb-4">
            L'infrastructure existe. Le corpus de validation démontre la viabilité.
          </p>
          <p className="text-lg text-zinc-500 mb-8">
            Accès progressif. Évaluation sur dossier.
          </p>
          <Link href={ROUTES.signup}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blood-600 via-purple-600 to-indigo-600 hover:from-blood-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-xl px-12 py-8 rounded-2xl shadow-2xl shadow-purple-900/50"
            >
              Soumettre une candidature
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </Link>
          <p className="mt-4 text-zinc-600 text-sm">
            Documentation technique complète disponible après validation.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FOOTER */}
      {/* ================================================================== */}
      <footer className="py-12 px-4 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <BloodwingsLogo size="sm" />
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <Link href="/legal" className="hover:text-zinc-300">Mentions légales</Link>
              <Link href="/privacy" className="hover:text-zinc-300">Confidentialité</Link>
              <Link href="/terms" className="hover:text-zinc-300">CGU</Link>
              <Link href="/contact" className="hover:text-zinc-300">Contact</Link>
            </div>
            <p className="text-sm text-zinc-600">
              © 2026 Bloodwings Studio. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
