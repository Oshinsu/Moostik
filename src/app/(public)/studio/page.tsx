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
    title: "Persistance de référence",
    description: "Injection auto de 14 références max par shot. Personnages et lieux identiques sur 100+ variations.",
    badge: null,
  },
  {
    icon: Sparkles,
    title: "Routing intelligent",
    description: "Le système analyse chaque shot et route vers le provider optimal. Tu ne choisis plus, tu valides.",
    badge: null,
  },
  {
    icon: Music,
    title: "Beat detection native",
    description: "Analyse BPM, subdivision rythmique, calage auto sur le tempo. Montage musicalement cohérent sans effort.",
    badge: null,
  },
  {
    icon: Zap,
    title: "Batch & retry",
    description: "Génération parallèle. Retry exponentiel sur erreur. Queue persistante. Tu lances, tu reviens.",
    badge: null,
  },
  {
    icon: Layers,
    title: "First/last frame chain",
    description: "Image-to-video avec continuité inter-shots. Pas de prompt engineering, juste de la cohérence.",
    badge: null,
  },
  {
    icon: FileVideo,
    title: "Export EDL natif",
    description: "Timeline complète avec cuts, audio, métadonnées. Direct dans Premiere/DaVinci.",
    badge: null,
  },
];

const COMPARISONS = [
  { feature: "Persistance références inter-shots", us: true, competitors: false },
  { feature: "Routing multi-provider auto", us: true, competitors: false },
  { feature: "Beat sync & analyse BPM", us: true, competitors: false },
  { feature: "First/last frame chaining", us: true, competitors: false },
  { feature: "Batch processing parallèle", us: true, competitors: "Manuel" },
  { feature: "Export EDL natif", us: true, competitors: "Partiel" },
  { feature: "Queue persistante avec retry", us: true, competitors: false },
];

export default function StudioPage() {
  return (
    <div className="min-h-screen">
      {/* ================================================================== */}
      {/* HERO */}
      {/* ================================================================== */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-[#0b0b0e] to-[#0b0b0e]" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <Badge className="mb-6 bg-zinc-800 text-zinc-400 border-zinc-700">
            Architecture technique
          </Badge>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            <span className="text-white">Un pipeline.</span>
            <br />
            <span className="bg-gradient-to-r from-blood-500 to-crimson-500 bg-clip-text text-transparent">
              Pas une collection de SaaS.
            </span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-4">
            Orchestration complète : génération → composition → export.
          </p>
          <p className="text-lg text-zinc-600 max-w-xl mx-auto mb-8">
            Les autres te vendent des briques. On te vend le mur fini.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={ROUTES.signup}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blood-600 to-crimson-600 hover:from-blood-500 hover:to-crimson-500 text-white font-bold px-8 py-6"
              >
                Early access
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/series">
              <Button size="lg" variant="outline" className="border-zinc-700 px-8 py-6">
                Voir T0.5 en action
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* LE PROBLÈME */}
      {/* ================================================================== */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0b0b0e] to-[#0d0d12]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Le workflow classique, c&apos;est ça
            </h2>
            <p className="text-zinc-500">
              5 outils. 5 exports. 5 imports. Et toi au milieu qui fait le taxi.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Le problème */}
            <Card className="p-6 bg-zinc-900/50 border-zinc-800/50">
              <h3 className="text-lg font-bold text-zinc-500 mb-4">Le workflow fragmenté</h3>
              <div className="space-y-3">
                {[
                  { name: "Génération d'images", desc: "Provider A" },
                  { name: "Image-to-video", desc: "Provider B" },
                  { name: "Génération audio", desc: "Provider C" },
                  { name: "Montage", desc: "Logiciel D" },
                  { name: "Export", desc: "Manips manuelles" },
                ].map((step, i) => (
                  <div key={step.name} className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">{i + 1}</span>
                    <span className="text-zinc-400">{step.name}</span>
                    <span className="text-zinc-600 ml-auto">{step.desc}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-zinc-800">
                  <p className="text-zinc-500 text-sm">
                    Résultat : 4h de workflow pour 30s de contenu. Et la cohérence ? Bonne chance.
                  </p>
                </div>
              </div>
            </Card>

            {/* La solution */}
            <Card className="p-6 bg-blood-900/20 border-blood-700/30">
              <h3 className="text-lg font-bold text-blood-400 mb-4">Le pipeline unifié</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-blood-900/50 flex items-center justify-center text-xs text-blood-400">1</span>
                  <span className="text-zinc-300">Tu définis tes shots</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-blood-900/50 flex items-center justify-center text-xs text-blood-400">2</span>
                  <span className="text-zinc-300">Tu lances le pipeline</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-blood-900/50 flex items-center justify-center text-xs text-blood-400">3</span>
                  <span className="text-zinc-300">Tu récupères l&apos;épisode monté</span>
                </div>
                <div className="pt-3 border-t border-blood-800/50">
                  <p className="text-blood-400 text-sm font-medium">
                    Images, vidéos, audio, composition, export. Une passe.
                  </p>
                  <p className="text-zinc-600 text-xs mt-1">
                    Le routing provider, le retry sur erreur, le beat sync — c&apos;est notre problème, pas le tien.
                  </p>
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
      {/* TECH SPECS */}
      {/* ================================================================== */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0b0b0e] to-blood-950/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Sous le capot
            </h2>
            <p className="text-zinc-500">
              Pour ceux qui veulent savoir ce qui tourne vraiment
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Layers, title: "5 providers", desc: "Routing automatique par type de shot" },
              { icon: Shield, title: "Queue persistante", desc: "Retry exponentiel, pas de perte" },
              { icon: Clock, title: "Batch parallèle", desc: "50+ variations simultanées" },
              { icon: Code, title: "Export EDL", desc: "Timeline native Premiere/DaVinci" },
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
            Tu veux tester le pipeline ?
          </h2>
          <p className="text-xl text-zinc-500 mb-8">
            Early access. On prend pas tout le monde. Mais on prend ceux qui ont des projets.
          </p>
          <Link href={ROUTES.signup}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blood-600 to-crimson-600 hover:from-blood-500 hover:to-crimson-500 text-white font-bold text-xl px-12 py-8 rounded-2xl"
            >
              Demander l&apos;accès
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
