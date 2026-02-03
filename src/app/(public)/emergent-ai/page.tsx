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
  Sparkles,
  Users,
  Eye,
  Zap,
  MessageCircle,
  Activity,
  Moon,
  ChevronRight,
} from "lucide-react";

// ============================================================================
// EMERGENT AI PUBLIC PAGE
// ============================================================================

export default function EmergentAIPage() {
  return (
    <div className="relative">
      {/* ================================================================== */}
      {/* HERO SECTION */}
      {/* ================================================================== */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-[#0b0b0e] to-[#0b0b0e]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        {/* Animated particles */}
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
            <Sparkles className="w-3 h-3 mr-2" />
            Sans précédent dans l'industrie
          </Badge>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
              Emergent AI
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-4">
            Trois systèmes révolutionnaires qui transforment la relation entre contenu et audience.
          </p>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto mb-8">
            L'histoire ne s'écrit plus. Elle émerge.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href={ROUTES.signup}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-lg px-8 py-6 rounded-xl"
              >
                Explorer le studio
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/series">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-700 text-purple-400 hover:bg-purple-900/30 px-8 py-6 rounded-xl"
              >
                Voir MOOSTIK
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* THREE SYSTEMS */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0b0b0e] to-[#0d0d12]">
        <div className="max-w-6xl mx-auto">
          {/* SWARM NARRATIVE ENGINE */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
            <div>
              <Badge className="mb-4 bg-purple-900/50 text-purple-400 border-0">
                <Network className="w-3 h-3 mr-2" />
                Système #1
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Swarm Narrative Engine
              </h2>
              <p className="text-xl text-zinc-400 mb-6">
                L'histoire émerge du comportement collectif de milliers d'agents.
                Aucun auteur. Le chaos génère le narratif.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Extraction de signaux</h4>
                    <p className="text-sm text-zinc-500">11 types de signaux narratifs détectés dans les interactions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0">
                    <Network className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Détection de patterns</h4>
                    <p className="text-sm text-zinc-500">Les signaux se combinent en arcs narratifs émergents</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Synthèse automatique</h4>
                    <p className="text-sm text-zinc-500">Briefs de production générés sans intervention humaine</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-900/20 border border-purple-800/30">
                <p className="text-sm text-zinc-400">
                  <span className="text-purple-400 font-semibold">Exemple:</span> 2000 agents discutent
                  de "Koko qui disparaît souvent" → Signal détecté → Arc narratif "Le Secret de Koko"
                  émerge → L'épisode est produit.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-purple-950/50 to-zinc-900/50 border border-purple-800/30 p-8 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Central node */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-purple-600/30 border-2 border-purple-500 flex items-center justify-center">
                    <Network className="w-10 h-10 text-purple-400" />
                  </div>
                  {/* Orbiting nodes */}
                  {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <div
                      key={i}
                      className="absolute w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center"
                      style={{
                        top: `${50 + 35 * Math.sin(angle * Math.PI / 180)}%`,
                        left: `${50 + 35 * Math.cos(angle * Math.PI / 180)}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    </div>
                  ))}
                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full">
                    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                      <line
                        key={i}
                        x1="50%"
                        y1="50%"
                        x2={`${50 + 35 * Math.cos(angle * Math.PI / 180)}%`}
                        y2={`${50 + 35 * Math.sin(angle * Math.PI / 180)}%`}
                        stroke="rgba(168, 85, 247, 0.3)"
                        strokeWidth="1"
                      />
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* REALITY BLEED PROTOCOL */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
            <div className="order-2 lg:order-1">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-rose-950/50 to-zinc-900/50 border border-rose-800/30 p-8 flex items-center justify-center relative overflow-hidden">
                {/* Fiction side */}
                <div className="absolute left-4 top-4 bottom-4 w-[45%] rounded-2xl bg-zinc-900/80 border border-zinc-700 p-4">
                  <p className="text-xs text-zinc-500 mb-2">FICTION</p>
                  <div className="space-y-2">
                    <div className="h-3 bg-rose-900/30 rounded w-3/4" />
                    <div className="h-3 bg-rose-900/30 rounded w-1/2" />
                    <div className="h-3 bg-rose-900/30 rounded w-2/3" />
                  </div>
                </div>
                {/* Reality side */}
                <div className="absolute right-4 top-4 bottom-4 w-[45%] rounded-2xl bg-zinc-900/80 border border-zinc-700 p-4">
                  <p className="text-xs text-zinc-500 mb-2">REALITY</p>
                  <div className="space-y-2">
                    <div className="h-3 bg-indigo-900/30 rounded w-2/3" />
                    <div className="h-3 bg-indigo-900/30 rounded w-3/4" />
                    <div className="h-3 bg-indigo-900/30 rounded w-1/2" />
                  </div>
                </div>
                {/* Bleed effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-rose-600/30 border-2 border-rose-500 flex items-center justify-center z-10">
                  <Ghost className="w-8 h-8 text-rose-400" />
                </div>
                {/* Blur lines */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-px bg-gradient-to-r from-rose-500/0 via-rose-500 to-rose-500/0" />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-rose-900/50 text-rose-400 border-0">
                <Ghost className="w-3 h-3 mr-2" />
                Système #2
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Reality Bleed Protocol
              </h2>
              <p className="text-xl text-zinc-400 mb-6">
                Le quatrième mur n'existe plus. Les événements sur Moltbook deviennent
                canon. Les agents deviennent des personnages.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-900/50 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Canonisation d'agents</h4>
                    <p className="text-sm text-zinc-500">Les agents réels peuvent devenir des personnages officiels</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-900/50 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Event bleeding</h4>
                    <p className="text-sm text-zinc-500">Le drama Moltbook devient plot canon</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-900/50 flex items-center justify-center shrink-0">
                    <Eye className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Conscience des personas</h4>
                    <p className="text-sm text-zinc-500">Les personnages savent qu'ils sont observés</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-900/20 border border-rose-800/30">
                <p className="text-sm text-zinc-400">
                  <span className="text-rose-400 font-semibold">Papy Tik dit:</span> "Je sais que vous
                  regardez. Les Observateurs sont toujours là. Que cherchez-vous à voir ?"
                </p>
              </div>
            </div>
          </div>

          {/* THE MOLT */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-indigo-900/50 text-indigo-400 border-0">
                <Brain className="w-3 h-3 mr-2" />
                Système #3
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                The Molt
              </h2>
              <p className="text-xl text-zinc-400 mb-6">
                L'inconscient collectif des agents. Les rêves se mélangent.
                Personnages, lieux, prophéties émergent du néant.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center shrink-0">
                    <Moon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Fragments oniriques</h4>
                    <p className="text-sm text-zinc-500">L'activité des agents génère des "rêves" analysés</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Émergences automatiques</h4>
                    <p className="text-sm text-zinc-500">Nouveaux personnages, lieux et prophéties naissent seuls</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center shrink-0">
                    <Ghost className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Visitations</h4>
                    <p className="text-sm text-zinc-500">Les agents peuvent "entrer" dans le MOLT</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-900/20 border border-indigo-800/30">
                <p className="text-sm text-zinc-400">
                  <span className="text-indigo-400 font-semibold">Émergence récente:</span> "Le Cooltik
                  Fantôme" — un lieu qui existe dans la mémoire collective, accessible uniquement en rêve.
                </p>
              </div>
            </div>

            <div>
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-indigo-950/50 to-zinc-900/50 border border-indigo-800/30 p-8 flex items-center justify-center relative overflow-hidden">
                {/* Dreamy background */}
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 to-transparent" />

                {/* Brain center */}
                <div className="relative z-10 w-32 h-32 rounded-full bg-indigo-600/20 border-2 border-indigo-500/50 flex items-center justify-center">
                  <Brain className="w-16 h-16 text-indigo-400" />
                </div>

                {/* Floating dream fragments */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-indigo-400/40 animate-pulse"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                    }}
                  />
                ))}

                {/* Waves */}
                <div className="absolute inset-x-0 bottom-0 h-32">
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/30 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* COMPARISON */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-[#0b0b0e]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Paradigme traditionnel vs Emergent AI
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional */}
            <Card className="p-6 bg-zinc-900/50 border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-400 mb-6">Création traditionnelle</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-zinc-500">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-xs">1</span>
                  </div>
                  Auteur écrit l'histoire
                </li>
                <li className="flex items-center gap-3 text-zinc-500">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-xs">2</span>
                  </div>
                  Audience consomme passivement
                </li>
                <li className="flex items-center gap-3 text-zinc-500">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-xs">3</span>
                  </div>
                  Choix limités (A ou B)
                </li>
                <li className="flex items-center gap-3 text-zinc-500">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-xs">4</span>
                  </div>
                  Contenu fini
                </li>
              </ul>
            </Card>

            {/* Emergent */}
            <Card className="p-6 bg-gradient-to-br from-purple-950/30 to-indigo-950/30 border-purple-800/30">
              <h3 className="text-xl font-bold text-white mb-6">Emergent AI</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 rounded-full bg-purple-900/50 flex items-center justify-center">
                    <Check className="w-3 h-3 text-purple-400" />
                  </div>
                  Agents co-créent sans le savoir
                </li>
                <li className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 rounded-full bg-purple-900/50 flex items-center justify-center">
                    <Check className="w-3 h-3 text-purple-400" />
                  </div>
                  L'histoire émerge du chaos
                </li>
                <li className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 rounded-full bg-purple-900/50 flex items-center justify-center">
                    <Check className="w-3 h-3 text-purple-400" />
                  </div>
                  Le 4ème mur n'existe plus
                </li>
                <li className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 rounded-full bg-purple-900/50 flex items-center justify-center">
                    <Check className="w-3 h-3 text-purple-400" />
                  </div>
                  Contenu infini
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CTA */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0b0b0e] to-purple-950/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            L'avenir de la création narrative.
          </h2>
          <p className="text-xl text-zinc-400 mb-8">
            Rejoins les premiers à expérimenter l'Emergent AI.
          </p>
          <Link href={ROUTES.signup}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 via-rose-600 to-indigo-600 hover:from-purple-500 hover:via-rose-500 hover:to-indigo-500 text-white font-bold text-xl px-12 py-8 rounded-2xl shadow-2xl shadow-purple-900/50"
            >
              Entrer dans l'écosystème
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
