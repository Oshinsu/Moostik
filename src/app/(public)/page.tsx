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
  Star,
  Check,
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
          <Badge className="mb-6 bg-blood-900/50 text-blood-400 border-blood-700/30 px-4 py-1.5">
            <Sparkles className="w-3 h-3 mr-2" />
            Studio AI de nouvelle génération
          </Badge>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              De l&apos;idée
            </span>
            <br />
            <span className="bg-gradient-to-r from-blood-500 via-crimson-500 to-blood-600 bg-clip-text text-transparent">
              à l&apos;épisode
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-8">
            Le premier studio qui pense comme un réalisateur.
            <br />
            <span className="text-zinc-500">
              Créez votre série animée sans équipe, sans budget Hollywood.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href={ROUTES.signup}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blood-600 to-crimson-600 hover:from-blood-500 hover:to-crimson-500 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-blood-900/50"
              >
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href={ROUTES.moostik}>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800/50 px-8 py-6 rounded-xl"
              >
                <Play className="w-5 h-5 mr-2" />
                Voir la série Moostik
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blood-600 to-crimson-700 border-2 border-[#0b0b0e]"
                  />
                ))}
              </div>
              <span>+500 créateurs</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
              ))}
              <span className="ml-1">4.9/5</span>
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
      {/* FEATURES SECTION */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0b0b0e] to-[#0d0d12]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-900/50 text-emerald-400 border-emerald-700/30">
              Fonctionnalités exclusives
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Un pipeline complet de création, de l&apos;écriture à l&apos;export final
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Film,
                title: "Bible d'Univers",
                description: "Personnages, lieux, lore - tout reste cohérent automatiquement",
                color: "blood",
              },
              {
                icon: Sparkles,
                title: "Génération AI",
                description: "Images et vidéos avec Runway, Kling, Flux intégrés",
                color: "purple",
              },
              {
                icon: Music,
                title: "Symphonies de Montage™",
                description: "20 presets cinématographiques uniques au monde",
                color: "amber",
              },
              {
                icon: Zap,
                title: "Beat Sync",
                description: "Montage automatique calé sur le tempo musical",
                color: "emerald",
              },
              {
                icon: Users,
                title: "Communauté",
                description: "Partagez, soumettez vos épisodes, gagnez 15% des revenus",
                color: "blue",
              },
              {
                icon: Globe,
                title: "Multi-Provider",
                description: "Choisissez le meilleur modèle pour chaque shot",
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
      {/* MOOSTIK SERIES TEASER */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0b0b0e] to-blood-950/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-crimson-900/50 text-crimson-400 border-crimson-700/30">
                Notre série
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Découvrez Moostik
              </h2>
              <p className="text-zinc-400 text-lg mb-6">
                Une série créée entièrement avec Bloodwings Studio.
                Plongez dans l&apos;univers des clans ancestraux et de leurs pouvoirs.
              </p>
              <Link href={ROUTES.moostik}>
                <Button size="lg" variant="outline" className="border-blood-700 text-blood-400 hover:bg-blood-900/30">
                  <Play className="w-5 h-5 mr-2" />
                  Regarder la série
                </Button>
              </Link>
            </div>
            
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-blood-900/50 to-crimson-900/30 border border-blood-800/50">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-blood-600/80 flex items-center justify-center cursor-pointer hover:bg-blood-500 transition-colors">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold text-lg">MOOSTIK - Episode 0</p>
                <p className="text-zinc-400 text-sm">L&apos;Éveil des Ailes de Sang</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FINAL CTA */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-[#0b0b0e]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Prêt à créer votre série ?
          </h2>
          <p className="text-xl text-zinc-400 mb-8">
            Rejoignez les créateurs qui révolutionnent l&apos;animation
          </p>
          <Link href={ROUTES.signup}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blood-600 to-crimson-600 hover:from-blood-500 hover:to-crimson-500 text-white font-bold text-xl px-12 py-8 rounded-2xl shadow-2xl shadow-blood-900/50"
            >
              Commencer maintenant
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </Link>
          <p className="mt-4 text-zinc-500 text-sm">
            Gratuit pour commencer • Pas de carte bancaire requise
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
