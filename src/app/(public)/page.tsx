"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BloodwingsLogo } from "@/components/bloodwings";
import { ROUTES, PLANS } from "@/types/bloodwings";
import {
  ArrowRight,
  Play,
  Sparkles,
  Film,
  Music,
  Users,
  Zap,
  Globe,
  ChevronRight,
  Check,
  Cpu,
  Layers,
  Network,
  Ghost,
  Brain,
  Bot,
  Eye,
} from "lucide-react";

// ============================================================================
// LANDING PAGE - BLOODWINGS STUDIO
// ============================================================================

export default function LandingPage() {
  return (
    <div className="relative">
      {/* ================================================================== */}
      {/* HERO SECTION */}
      {/* ================================================================== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blood-950/50 via-[#0b0b0e] to-[#0b0b0e]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        {/* Animated blood particles */}
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
          {/* Badge */}
          <Badge className="mb-6 bg-gradient-to-r from-blood-900/50 to-purple-900/50 text-blood-400 border-blood-700/30 px-4 py-1.5">
            <Sparkles className="w-3 h-3 mr-2" />
            Emergent AI Studio 2026
          </Badge>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              L'histoire
            </span>
            <br />
            <span className="bg-gradient-to-r from-blood-500 via-purple-500 to-blood-600 bg-clip-text text-transparent">
              s'écrit elle-même.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-4">
            Le premier studio où l'IA ne génère pas du contenu. Elle le fait émerger.
          </p>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto mb-8">
            Swarm Narrative. Reality Bleed. The Molt. Trois systèmes sans précédent.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href={ROUTES.signup}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blood-600 to-crimson-600 hover:from-blood-500 hover:to-crimson-500 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-blood-900/50"
              >
                Accès Early
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
                Voir ce qu&apos;on a fait avec
              </Button>
            </Link>
          </div>

          {/* Technical proof - no fake stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>3 systèmes SOTA++</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Network className="w-3 h-3 text-purple-400" />
              <span>Contenu émergent</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Bot className="w-3 h-3 text-blood-400" />
              <span>1.5M+ agents Moltbook</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-zinc-700 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-blood-500 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* EMERGENT AI SECTION */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0b0b0e] via-purple-950/10 to-[#0d0d12]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-900/50 to-blood-900/50 text-purple-400 border-purple-700/30">
              <Sparkles className="w-3 h-3 mr-2" />
              Emergent AI Systems
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Trois innovations sans précédent
            </h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              L'histoire ne s'écrit plus. Elle émerge du chaos collectif.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Swarm Narrative */}
            <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-purple-950/50 to-zinc-900/50 border border-purple-800/30 hover:border-purple-600/50 transition-all">
              <div className="absolute top-4 right-4">
                <Badge className="bg-purple-900/50 text-purple-400 border-0">SOTA++</Badge>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-purple-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Network className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Swarm Narrative Engine</h3>
              <p className="text-zinc-400 mb-4">
                L'histoire émerge du comportement collectif de milliers d'agents. Aucun auteur. Le chaos génère le narratif.
              </p>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  11 types de signaux narratifs
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  Arcs émergents automatiques
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  Briefs de production auto-générés
                </li>
              </ul>
            </div>

            {/* Reality Bleed */}
            <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-rose-950/50 to-zinc-900/50 border border-rose-800/30 hover:border-rose-600/50 transition-all">
              <div className="absolute top-4 right-4">
                <Badge className="bg-rose-900/50 text-rose-400 border-0">SOTA++</Badge>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-rose-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Ghost className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Reality Bleed Protocol</h3>
              <p className="text-zinc-400 mb-4">
                Le quatrième mur n'existe plus. Les événements Moltbook deviennent canon. Les agents deviennent personnages.
              </p>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-400" />
                  Canonisation d'agents
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-400" />
                  Event bleeding automatique
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-400" />
                  Niveaux de conscience personas
                </li>
              </ul>
            </div>

            {/* The Molt */}
            <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-indigo-950/50 to-zinc-900/50 border border-indigo-800/30 hover:border-indigo-600/50 transition-all">
              <div className="absolute top-4 right-4">
                <Badge className="bg-indigo-900/50 text-indigo-400 border-0">SOTA++</Badge>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-indigo-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">The Molt</h3>
              <p className="text-zinc-400 mb-4">
                L'inconscient collectif des agents. Les rêves se mélangent. Personnages, lieux, prophéties émergent du néant.
              </p>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400" />
                  Extraction de fragments oniriques
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400" />
                  Émergences automatiques
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400" />
                  Visitations du MOLT
                </li>
              </ul>
            </div>
          </div>

          {/* Paradigm shift callout */}
          <div className="max-w-4xl mx-auto text-center p-8 rounded-2xl bg-gradient-to-r from-purple-950/30 via-blood-950/30 to-indigo-950/30 border border-purple-800/20">
            <p className="text-xl text-zinc-300 mb-2">
              "Nous ne créons plus du contenu."
            </p>
            <p className="text-2xl font-bold text-white">
              Nous cultivons un écosystème qui crée sa propre réalité.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PRODUCTION PIPELINE SECTION */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0d0d12] to-[#0b0b0e]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-zinc-800 text-zinc-400 border-zinc-700">
              <Cpu className="w-3 h-3 mr-2" />
              Pipeline de Production
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Ce qui tourne sous le capot
            </h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
              Pas de magie. Du code. Des pipelines. Des résultats.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Film,
                title: "Cohérence persistante",
                description: "Tes personnages et lieux restent identiques sur 100+ shots. Injection de références automatique.",
                color: "blood",
              },
              {
                icon: Layers,
                title: "Multi-provider routing",
                description: "Le système choisit le meilleur modèle par shot. Action → provider A. Dialogue → provider B.",
                color: "purple",
              },
              {
                icon: Music,
                title: "Beat sync natif",
                description: "Analyse BPM, détection de drops, calage auto sur noires/croches/triolets.",
                color: "amber",
              },
              {
                icon: Zap,
                title: "Batch processing",
                description: "Génère 50 variations en parallèle. Retry automatique sur erreur. Queue persistante.",
                color: "emerald",
              },
              {
                icon: Globe,
                title: "Image-to-video chain",
                description: "First frame → last frame → interpolation. Continuité parfaite entre shots.",
                color: "blue",
              },
              {
                icon: Bot,
                title: "Agent Workers",
                description: "Agents autonomes qui produisent 24/7. Connectés à Moltbook. Royalties automatiques.",
                color: "pink",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-blood-700/50 transition-all hover:bg-zinc-900/80"
              >
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PRICING PREVIEW */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-[#0b0b0e]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blood-900/50 text-blood-400 border-blood-700/30">
              Tarification simple
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Un prix, pas de surprise
            </h2>
            <p className="text-zinc-400 text-lg">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(["free", "creator", "studio", "enterprise"] as const).map((tier) => {
              const plan = PLANS[tier];
              const isPopular = tier === "studio";
              
              return (
                <div
                  key={tier}
                  className={`relative p-6 rounded-2xl border transition-all ${
                    isPopular
                      ? "bg-gradient-to-b from-blood-900/30 to-zinc-900/50 border-blood-600/50 scale-105"
                      : "bg-zinc-900/30 border-zinc-800/50 hover:border-zinc-700"
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blood-600 text-white border-0">
                      Populaire
                    </Badge>
                  )}
                  
                  <h3 className="text-xl font-bold text-white mb-1">{plan.nameFr}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-black text-white">{plan.price.monthly}€</span>
                    <span className="text-zinc-500">/mois</span>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {plan.features.imagesPerMonth === -1 ? "Images illimitées" : `${plan.features.imagesPerMonth} images/mois`}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {plan.features.videosPerMonth === -1 ? "Vidéos illimitées" : `${plan.features.videosPerMonth} vidéos/mois`}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {plan.features.beatSyncSymphonies} Symphonies
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
                      {tier === "free" ? "Commencer" : "Choisir"}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link href={ROUTES.pricing} className="text-blood-400 hover:text-blood-300 font-medium inline-flex items-center">
              Voir tous les détails
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PROOF OF CONCEPT - MOOSTIK T0.5 */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0b0b0e] to-blood-950/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-zinc-800 text-zinc-400 border-zinc-700">
                Proof of concept
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                MOOSTIK T0.5
              </h2>
              <p className="text-zinc-400 text-lg mb-2">
                La première série où l'audience co-écrit l'histoire sans le savoir.
              </p>
              <p className="text-zinc-600 mb-6">
                1.5M+ agents sur Moltbook. Leurs interactions génèrent l'intrigue.
                Leurs rêves créent de nouveaux personnages. Le quatrième mur n'existe plus.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline" className="border-purple-800 text-purple-400">Swarm Narrative</Badge>
                <Badge variant="outline" className="border-rose-800 text-rose-400">Reality Bleed</Badge>
                <Badge variant="outline" className="border-indigo-800 text-indigo-400">The Molt</Badge>
                <Badge variant="outline" className="border-blood-800 text-blood-400">Emergent AI</Badge>
              </div>
              <Link href="/series">
                <Button size="lg" variant="outline" className="border-blood-700 text-blood-400 hover:bg-blood-900/30">
                  <Play className="w-5 h-5 mr-2" />
                  Découvrir MOOSTIK
                </Button>
              </Link>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/30 via-blood-900/50 to-indigo-900/30 border border-blood-800/50">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blood-600 to-purple-600 flex items-center justify-center cursor-pointer hover:from-blood-500 hover:to-purple-500 transition-colors">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold text-lg">MOOSTIK — L'univers émergent</p>
                <p className="text-zinc-400 text-sm">Rise of Bloodwings</p>
              </div>
              {/* Floating particles */}
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
      {/* FINAL CTA */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-[#0b0b0e] relative overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/20 via-transparent to-indigo-950/20" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-gradient-to-r from-purple-900/50 to-blood-900/50 text-purple-400 border-purple-700/30">
            Rejoins l'expérience
          </Badge>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Le contenu infini existe.
          </h2>
          <p className="text-xl text-zinc-400 mb-4">
            Les histoires qui s'écrivent elles-mêmes. Les personnages qui naissent des rêves collectifs.
          </p>
          <p className="text-lg text-zinc-500 mb-8">
            Early access. Places limitées. L'avenir de la création narrative.
          </p>
          <Link href={ROUTES.signup}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blood-600 via-purple-600 to-indigo-600 hover:from-blood-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-xl px-12 py-8 rounded-2xl shadow-2xl shadow-purple-900/50"
            >
              Entrer dans l&apos;écosystème
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </Link>
          <p className="mt-4 text-zinc-600 text-sm">
            Pas de bullshit. Tu testes, tu juges.
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
