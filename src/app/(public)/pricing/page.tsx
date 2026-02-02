"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ROUTES, PLANS, type PlanTier } from "@/types/bloodwings";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  Building2,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============================================================================
// PAGE PRICING
// ============================================================================

const PLAN_ICONS: Record<PlanTier, React.ReactNode> = {
  free: <Sparkles className="w-6 h-6" />,
  creator: <Zap className="w-6 h-6" />,
  studio: <Crown className="w-6 h-6" />,
  production: <Crown className="w-6 h-6" />,
  enterprise: <Building2 className="w-6 h-6" />,
};

interface FeatureRow {
  name: string;
  key: string;
  suffix?: string;
  boolean?: boolean;
}

interface FeatureCategory {
  category: string;
  features: FeatureRow[];
}

const FEATURE_ROWS: FeatureCategory[] = [
  { category: "Génération", features: [
    { name: "Images/mois", key: "imagesPerMonth" },
    { name: "Vidéos/mois", key: "videosPerMonth" },
    { name: "Durée vidéo max", key: "videoSeconds", suffix: "s" },
  ]},
  { category: "Création", features: [
    { name: "Univers (bibles)", key: "universes" },
    { name: "Épisodes/mois", key: "episodesPerMonth" },
    { name: "Qualité export", key: "exportQuality" },
  ]},
  { category: "Montage", features: [
    { name: "Symphonies de Montage™", key: "beatSyncSymphonies" },
    { name: "Multi-provider", key: "multiProvider", boolean: true },
    { name: "Export EDL", key: "edlExport", boolean: true },
  ]},
  { category: "Avancé", features: [
    { name: "API access", key: "apiAccess", boolean: true },
    { name: "White-label", key: "whiteLabel", boolean: true },
    { name: "Support", key: "support" },
  ]},
];

const FAQ = [
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, vous pouvez upgrader ou downgrader à tout moment. Le changement est effectif immédiatement avec un prorata.",
  },
  {
    q: "Que se passe-t-il si je dépasse mes limites ?",
    a: "Vous recevez une notification avant d'atteindre la limite. Vous pouvez acheter des crédits supplémentaires ou passer au plan supérieur.",
  },
  {
    q: "Les crédits non utilisés sont-ils reportés ?",
    a: "Pour les plans Studio et supérieurs, oui. Les crédits non utilisés sont reportés au mois suivant (max 2 mois d'accumulation).",
  },
  {
    q: "Y a-t-il un engagement ?",
    a: "Non, tous les plans sont sans engagement. L'abonnement annuel offre 17% de réduction mais peut être annulé avec remboursement au prorata.",
  },
  {
    q: "Comment fonctionne le revenue sharing communauté ?",
    a: "Si votre épisode est sélectionné et publié sur la chaîne officielle Moostik, vous recevez 15% des revenus générés (pub, sponsors, etc.).",
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const plans: PlanTier[] = ["free", "creator", "studio", "production", "enterprise"];

  return (
    <TooltipProvider>
      <div className="min-h-screen py-12">
        {/* ================================================================ */}
        {/* HEADER */}
        {/* ================================================================ */}
        <section className="max-w-6xl mx-auto px-4 text-center mb-16">
          <Badge className="mb-4 bg-blood-900/50 text-blood-400 border-blood-700/30">
            Tarification
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            Un prix simple, pas de surprise
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Commencez gratuitement, évoluez selon vos besoins
          </p>
          
          {/* Toggle Annuel/Mensuel */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isYearly ? "text-white" : "text-zinc-500"}`}>
              Mensuel
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-blood-600"
            />
            <span className={`text-sm ${isYearly ? "text-white" : "text-zinc-500"}`}>
              Annuel
            </span>
            {isYearly && (
              <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-700/30">
                -17%
              </Badge>
            )}
          </div>
        </section>

        {/* ================================================================ */}
        {/* PLANS CARDS */}
        {/* ================================================================ */}
        <section className="max-w-7xl mx-auto px-4 mb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {plans.map((tier) => {
              const plan = PLANS[tier];
              const price = isYearly 
                ? Math.round(plan.price.yearly / 12) 
                : plan.price.monthly;
              const isPopular = tier === "studio";
              
              return (
                <Card
                  key={tier}
                  className={`relative p-6 flex flex-col ${
                    isPopular
                      ? "bg-gradient-to-b from-blood-900/40 to-zinc-900/50 border-blood-600/50 scale-105 z-10"
                      : "bg-zinc-900/30 border-zinc-800/50"
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blood-600 text-white border-0">
                      Populaire
                    </Badge>
                  )}
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isPopular ? "bg-blood-600" : "bg-zinc-800"
                    }`}>
                      {PLAN_ICONS[tier]}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{plan.nameFr}</h3>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-black text-white">{price}€</span>
                    <span className="text-zinc-500">/mois</span>
                    {isYearly && tier !== "free" && (
                      <p className="text-xs text-zinc-500 mt-1">
                        Facturé {plan.price.yearly}€/an
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-2 mb-6 flex-1">
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {plan.features.imagesPerMonth === -1 
                        ? "Images illimitées" 
                        : `${plan.features.imagesPerMonth} images`}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {plan.features.videosPerMonth === -1 
                        ? "Vidéos illimitées" 
                        : `${plan.features.videosPerMonth} vidéos`}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {plan.features.beatSyncSymphonies} Symphonies
                    </li>
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      {plan.features.multiProvider ? (
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                      )}
                      Multi-provider
                    </li>
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <span className="capitalize">{plan.features.support}</span>
                    </li>
                  </ul>
                  
                  <Link href={tier === "enterprise" ? "/contact" : ROUTES.signup}>
                    <Button 
                      className={`w-full ${
                        isPopular 
                          ? "bg-blood-600 hover:bg-blood-500" 
                          : "bg-zinc-800 hover:bg-zinc-700"
                      }`}
                    >
                      {tier === "free" ? "Commencer" : tier === "enterprise" ? "Nous contacter" : "Choisir"}
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ================================================================ */}
        {/* COMPARISON TABLE */}
        {/* ================================================================ */}
        <section className="max-w-7xl mx-auto px-4 mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Comparaison détaillée
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4 px-4 text-zinc-500 font-normal">Fonctionnalité</th>
                  {plans.map((tier) => (
                    <th key={tier} className="text-center py-4 px-4">
                      <span className={`font-bold ${tier === "studio" ? "text-blood-400" : "text-white"}`}>
                        {PLANS[tier].nameFr}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((category) => (
                  <>
                    <tr key={category.category} className="bg-zinc-900/30">
                      <td colSpan={6} className="py-2 px-4 text-sm font-bold text-zinc-400">
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature) => (
                      <tr key={feature.key} className="border-b border-zinc-800/50">
                        <td className="py-3 px-4 text-sm text-zinc-400 flex items-center gap-2">
                          {feature.name}
                          {feature.key === "beatSyncSymphonies" && (
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-3 h-3 text-zinc-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Presets de montage cinématographiques exclusifs
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </td>
                        {plans.map((tier) => {
                          const plan = PLANS[tier];
                          const value = plan.features[feature.key as keyof typeof plan.features];
                          
                          return (
                            <td key={tier} className="py-3 px-4 text-center">
                              {feature.boolean ? (
                                value ? (
                                  <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                                ) : (
                                  <X className="w-5 h-5 text-zinc-600 mx-auto" />
                                )
                              ) : (
                                <span className="text-sm text-zinc-300">
                                  {value === -1 ? "∞" : `${value}${feature.suffix || ""}`}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FAQ */}
        {/* ================================================================ */}
        <section className="max-w-4xl mx-auto px-4 mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Questions fréquentes
          </h2>
          
          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <Card key={i} className="p-6 bg-zinc-900/50 border-zinc-800/50">
                <h3 className="font-bold text-white mb-2">{item.q}</h3>
                <p className="text-zinc-400">{item.a}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ================================================================ */}
        {/* CTA */}
        {/* ================================================================ */}
        <section className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Encore des questions ?
          </h2>
          <p className="text-zinc-400 mb-6">
            Notre équipe est là pour vous aider
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/contact">
              <Button variant="outline" className="border-zinc-700">
                Nous contacter
              </Button>
            </Link>
            <Link href={ROUTES.signup}>
              <Button className="bg-blood-600 hover:bg-blood-500">
                Essayer gratuitement
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}
