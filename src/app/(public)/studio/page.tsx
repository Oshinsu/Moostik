"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ROUTES, PLANS } from "@/types/bloodwings";
import {
  ArrowRight,
  Check,
  Film,
  Sparkles,
  Music,
  Zap,
  Users,
  Globe,
  Layers,
  FileVideo,
  Palette,
  Clock,
  Shield,
  HeadphonesIcon,
  Code,
} from "lucide-react";

// ============================================================================
// PAGE STUDIO - PRÉSENTATION DU SAAS
// ============================================================================

const FEATURES = [
  {
    icon: Film,
    title: "Bible d'Univers Intégrée",
    description: "Personnages, lieux, lore - tout reste cohérent automatiquement entre vos shots",
    badge: "Exclusif",
  },
  {
    icon: Sparkles,
    title: "Multi-Provider AI",
    description: "Runway Gen-4, Kling 2.6, Flux Pro - choisissez le meilleur modèle pour chaque shot",
    badge: null,
  },
  {
    icon: Music,
    title: "Symphonies de Montage™",
    description: "20 presets cinématographiques uniques : Eisenstein, Tarantino, EDM Drop, et plus",
    badge: "Brevet en cours",
  },
  {
    icon: Zap,
    title: "Beat Sync Automatique",
    description: "Montage calé sur le tempo : noires, blanches, croches, triolets...",
    badge: null,
  },
  {
    icon: Layers,
    title: "Pipeline End-to-End",
    description: "Script → Storyboard → Images → Vidéos → Montage → Export en un seul outil",
    badge: null,
  },
  {
    icon: FileVideo,
    title: "Export Pro",
    description: "EDL pour Premiere/DaVinci, 4K HDR, formats optimisés par plateforme",
    badge: null,
  },
];

const COMPARISONS = [
  { feature: "Bible d'univers", us: true, competitors: false },
  { feature: "Pipeline complet", us: true, competitors: false },
  { feature: "Beat Sync automatique", us: true, competitors: false },
  { feature: "Symphonies de Montage™", us: true, competitors: false },
  { feature: "Multi-provider AI", us: true, competitors: false },
  { feature: "Export EDL", us: true, competitors: "Partiel" },
  { feature: "Communauté intégrée", us: true, competitors: false },
  { feature: "Revenue sharing créateurs", us: "15%", competitors: false },
];

const TESTIMONIALS = [
  {
    name: "Marie L.",
    role: "Créatrice YouTube",
    avatar: "🎬",
    content: "J'ai créé ma première mini-série en 2 jours. Avant, ça m'aurait pris 3 mois.",
  },
  {
    name: "Thomas D.",
    role: "Studio Indé",
    avatar: "🎥",
    content: "Le Beat Sync change tout. Mon montage est enfin professionnel sans y passer des heures.",
  },
  {
    name: "Studio Néon",
    role: "Agence Créative",
    avatar: "✨",
    content: "On économise 200€/mois et on a plus de fonctionnalités qu'avec 5 outils séparés.",
  },
];

export default function StudioPage() {
  return (
    <div className="min-h-screen">
      {/* ================================================================== */}
      {/* HERO */}
      {/* ================================================================== */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/30 via-[#0b0b0e] to-[#0b0b0e]" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <Badge className="mb-6 bg-emerald-900/50 text-emerald-400 border-emerald-700/30">
            Le Studio
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            <span className="text-white">Le prix d&apos;un freelance.</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              La puissance d&apos;un studio.
            </span>
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
            Un seul outil pour créer des séries animées professionnelles.
            Sans équipe, sans compétences techniques, sans budget Hollywood.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={ROUTES.signup}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-8 py-6"
              >
                Essayer gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href={ROUTES.pricing}>
              <Button size="lg" variant="outline" className="border-zinc-700 px-8 py-6">
                Voir les tarifs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* ÉCONOMIES */}
      {/* ================================================================== */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0b0b0e] to-[#0d0d12]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Économisez sur votre stack créatif
            </h2>
            <p className="text-zinc-400">
              Un seul abonnement au lieu de 5+ outils séparés
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Avant */}
            <Card className="p-6 bg-zinc-900/50 border-zinc-800/50">
              <h3 className="text-lg font-bold text-zinc-400 mb-4">❌ Sans Bloodwings</h3>
              <div className="space-y-3">
                {[
                  { name: "Runway Pro", price: 28 },
                  { name: "Kling Premier", price: 65 },
                  { name: "Midjourney Pro", price: 60 },
                  { name: "Descript Business", price: 65 },
                  { name: "Adobe Premiere", price: 22 },
                ].map((tool) => (
                  <div key={tool.name} className="flex justify-between text-sm">
                    <span className="text-zinc-500">{tool.name}</span>
                    <span className="text-zinc-400">{tool.price}€/mois</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-zinc-800">
                  <div className="flex justify-between font-bold">
                    <span className="text-zinc-400">Total</span>
                    <span className="text-red-400">240€/mois</span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">+ workflow manuel entre outils</p>
                </div>
              </div>
            </Card>
            
            {/* Après */}
            <Card className="p-6 bg-emerald-900/20 border-emerald-700/30">
              <h3 className="text-lg font-bold text-emerald-400 mb-4">✓ Avec Bloodwings Studio</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">Tout inclus</span>
                  <span className="text-emerald-400 font-bold">À partir de 129€/mois</span>
                </div>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Multi-provider AI intégré
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Montage automatique
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Bible d&apos;univers
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Beat Sync & Symphonies
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Export pro (EDL, 4K)
                  </li>
                </ul>
                <div className="pt-3 border-t border-emerald-800/50">
                  <p className="text-emerald-400 font-bold text-lg">
                    Économie: jusqu&apos;à 111€/mois
                  </p>
                  <p className="text-xs text-emerald-600">+ gain de temps x10</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FEATURES */}
      {/* ================================================================== */}
      <section className="py-20 px-4 bg-[#0b0b0e]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blood-900/50 text-blood-400 border-blood-700/30">
              Fonctionnalités
            </Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              Tout ce qu&apos;un studio a besoin
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <Card
                key={i}
                className="p-6 bg-zinc-900/50 border-zinc-800/50 hover:border-blood-700/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blood-900/30 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-blood-400" />
                  </div>
                  {feature.badge && (
                    <Badge className="bg-amber-900/50 text-amber-400 border-amber-700/30 text-xs">
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* COMPARAISON */}
      {/* ================================================================== */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0b0b0e] to-[#0d0d12]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pourquoi Bloodwings ?
            </h2>
            <p className="text-zinc-400">Comparé aux alternatives du marché</p>
          </div>
          
          <Card className="p-6 bg-zinc-900/50 border-zinc-800/50 overflow-hidden">
            <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-zinc-800">
              <div className="text-sm text-zinc-500">Fonctionnalité</div>
              <div className="text-sm font-bold text-blood-400 text-center">Bloodwings</div>
              <div className="text-sm text-zinc-500 text-center">Concurrents</div>
            </div>
            
            {COMPARISONS.map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 py-3 border-b border-zinc-800/50 last:border-0">
                <div className="text-sm text-zinc-300">{row.feature}</div>
                <div className="text-center">
                  {row.us === true ? (
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  ) : (
                    <span className="text-emerald-400 font-bold">{row.us}</span>
                  )}
                </div>
                <div className="text-center">
                  {row.competitors === false ? (
                    <span className="text-red-400">✕</span>
                  ) : (
                    <span className="text-zinc-500">{row.competitors}</span>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </section>

      {/* ================================================================== */}
      {/* TÉMOIGNAGES */}
      {/* ================================================================== */}
      <section className="py-20 px-4 bg-[#0b0b0e]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ce qu&apos;ils en disent
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <Card key={i} className="p-6 bg-zinc-900/50 border-zinc-800/50">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{testimonial.avatar}</span>
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-xs text-zinc-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-zinc-400 italic">&quot;{testimonial.content}&quot;</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SUPPORT */}
      {/* ================================================================== */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0b0b0e] to-blood-950/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Support & Sécurité
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: HeadphonesIcon, title: "Support FR", desc: "Équipe francophone réactive" },
              { icon: Shield, title: "RGPD", desc: "Données hébergées en Europe" },
              { icon: Clock, title: "SLA 99.9%", desc: "Disponibilité garantie" },
              { icon: Code, title: "API", desc: "Intégration sur mesure" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blood-900/30 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-blood-400" />
                </div>
                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CTA FINAL */}
      {/* ================================================================== */}
      <section className="py-24 px-4 bg-[#0b0b0e]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Prêt à révolutionner votre création ?
          </h2>
          <p className="text-xl text-zinc-400 mb-8">
            20 images gratuites pour tester. Pas de carte bancaire.
          </p>
          <Link href={ROUTES.signup}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blood-600 to-crimson-600 hover:from-blood-500 hover:to-crimson-500 text-white font-bold text-xl px-12 py-8 rounded-2xl"
            >
              Créer mon compte gratuit
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
