"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { usePlan } from "@/lib/auth/use-plan";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  Building2,
  ArrowRight,
  Star,
  Shield,
  Video,
  Image,
  Bot,
  Download,
  Infinity,
  Users,
} from "lucide-react";
import type { Plan } from "@/types/auth";
import { cn } from "@/lib/utils";

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Sparkles className="w-6 h-6" />,
  starter: <Zap className="w-6 h-6" />,
  pro: <Crown className="w-6 h-6" />,
  studio: <Star className="w-6 h-6" />,
  enterprise: <Building2 className="w-6 h-6" />,
};

const PLAN_COLORS: Record<string, string> = {
  free: "from-zinc-600 to-zinc-700",
  starter: "from-blue-600 to-blue-700",
  pro: "from-amber-600 to-amber-700",
  studio: "from-violet-600 to-violet-700",
  enterprise: "from-emerald-600 to-emerald-700",
};

export default function PricingPage() {
  const { isAuthenticated, profile } = useAuth();
  const { allPlans, currentTier, upgradePlan, isLoading } = usePlan();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (!isAuthenticated) {
      window.location.href = `/auth/signup?plan=${planId}`;
      return;
    }

    setSelectedPlan(planId);
    const { url, error } = await upgradePlan(planId, billingPeriod);
    
    if (url) {
      window.location.href = url;
    } else if (error) {
      alert(error);
    }
    
    setSelectedPlan(null);
  };

  const displayPlans = allPlans.filter(p => p.tier !== "enterprise");

  return (
    <div className="flex h-screen bg-[#0b0b0e] text-zinc-100">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="relative border-b border-blood-900/30 bg-gradient-to-br from-blood-900/20 via-[#0b0b0e] to-crimson-900/10">
          <div className="px-8 py-16 text-center">
            <Badge className="bg-blood-900/60 text-blood-300 border-blood-700/50 mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Tarification
            </Badge>
            <h1 className="text-4xl font-bold text-white mb-4">
              Choisissez votre plan
            </h1>
            <p className="text-zinc-500 max-w-xl mx-auto mb-8">
              De la découverte gratuite à la production studio. 
              Chaque plan débloque de nouvelles possibilités créatives.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={cn("text-sm", billingPeriod === "monthly" ? "text-white" : "text-zinc-500")}>
                Mensuel
              </span>
              <Switch
                checked={billingPeriod === "yearly"}
                onCheckedChange={(checked) => setBillingPeriod(checked ? "yearly" : "monthly")}
              />
              <span className={cn("text-sm", billingPeriod === "yearly" ? "text-white" : "text-zinc-500")}>
                Annuel
                <Badge className="ml-2 bg-emerald-900/60 text-emerald-400 border-0 text-[10px]">
                  -17%
                </Badge>
              </span>
            </div>
          </div>
        </header>

        {/* Plans Grid */}
        <div className="p-8">
          <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
            {displayPlans.map((plan) => {
              const isCurrent = plan.tier === currentTier;
              const isPopular = plan.isPopular;
              const price = billingPeriod === "monthly" 
                ? plan.priceMonthly 
                : Math.round(plan.priceYearly / 12);

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative bg-[#14131a] border-2 transition-all overflow-hidden",
                    isPopular 
                      ? "border-amber-600/50 scale-105 shadow-xl shadow-amber-900/20" 
                      : "border-blood-900/20 hover:border-blood-600/40",
                    isCurrent && "ring-2 ring-emerald-500/50"
                  )}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs font-bold rounded-bl-lg">
                      Populaire
                    </div>
                  )}

                  {/* Current Badge */}
                  {isCurrent && (
                    <div className="absolute top-0 left-0 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-br-lg">
                      Actuel
                    </div>
                  )}

                  <div className="p-6">
                    {/* Plan Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br",
                        PLAN_COLORS[plan.tier]
                      )}>
                        {PLAN_ICONS[plan.tier]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                        <p className="text-xs text-zinc-500">{plan.tier}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      {plan.priceMonthly === 0 ? (
                        <div className="text-4xl font-bold text-white">Gratuit</div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-white">{price}€</span>
                          <span className="text-zinc-500">/mois</span>
                        </div>
                      )}
                      {billingPeriod === "yearly" && plan.priceYearly > 0 && (
                        <p className="text-xs text-zinc-500 mt-1">
                          Facturé {plan.priceYearly}€/an
                        </p>
                      )}
                    </div>

                    {/* Credits */}
                    <div className="mb-6 p-3 bg-zinc-900/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-400">Crédits/mois</span>
                        <span className="text-lg font-bold text-amber-400">
                          {plan.creditsMonthly.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      <Feature 
                        name="Épisodes"
                        value={plan.maxEpisodes}
                        included={true}
                      />
                      <Feature 
                        name="Shots/épisode"
                        value={plan.maxShotsPerEpisode}
                        included={true}
                      />
                      <Feature 
                        name="Génération vidéo"
                        included={plan.hasVideoGeneration}
                        icon={<Video className="w-4 h-4" />}
                      />
                      <Feature 
                        name="Blood Director"
                        included={plan.hasBloodDirector}
                        icon={<Bot className="w-4 h-4" />}
                      />
                      <Feature 
                        name="Export HD"
                        included={plan.hasHdExport}
                        icon={<Download className="w-4 h-4" />}
                      />
                      <Feature 
                        name="Export 4K"
                        included={plan.has4kExport}
                        icon={<Download className="w-4 h-4" />}
                      />
                      <Feature 
                        name="File prioritaire"
                        included={plan.hasPriorityQueue}
                        icon={<Zap className="w-4 h-4" />}
                      />
                      <Feature 
                        name="Accès API"
                        included={plan.hasApiAccess}
                        icon={<Shield className="w-4 h-4" />}
                      />
                    </div>

                    {/* CTA */}
                    <Button
                      className={cn(
                        "w-full",
                        isPopular 
                          ? "moostik-btn-blood text-white" 
                          : "bg-zinc-800 hover:bg-zinc-700 text-white"
                      )}
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={isCurrent || isLoading || selectedPlan === plan.id}
                    >
                      {selectedPlan === plan.id ? (
                        "Chargement..."
                      ) : isCurrent ? (
                        "Plan actuel"
                      ) : plan.priceMonthly === 0 ? (
                        "Commencer gratuitement"
                      ) : (
                        <>
                          Choisir ce plan
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Enterprise Plan */}
          <div className="max-w-6xl mx-auto mt-8">
            <Card className="bg-gradient-to-r from-[#14131a] to-emerald-900/10 border-emerald-800/30 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      Enterprise
                      <Badge className="bg-emerald-900/60 text-emerald-400 border-0">
                        Sur mesure
                      </Badge>
                    </h3>
                    <p className="text-zinc-400 mt-1">
                      Pour les studios de production et les grandes équipes. 
                      Crédits illimités, support dédié, intégration personnalisée.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="border-emerald-600/50 text-emerald-400 hover:bg-emerald-900/20">
                  <Users className="w-4 h-4 mr-2" />
                  Contacter l'équipe
                </Button>
              </div>
            </Card>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto mt-16">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "Comment fonctionnent les crédits ?",
                  a: "Chaque génération (image ou vidéo) consomme des crédits. Les images coûtent 1 crédit, les vidéos entre 5-8 crédits selon le modèle."
                },
                {
                  q: "Puis-je changer de plan à tout moment ?",
                  a: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet immédiatement."
                },
                {
                  q: "Les crédits non utilisés sont-ils reportés ?",
                  a: "Non, les crédits sont réinitialisés chaque mois. Utilisez-les avant la fin de votre période de facturation."
                },
                {
                  q: "Y a-t-il un engagement ?",
                  a: "Non, tous les plans sont sans engagement. Vous pouvez annuler à tout moment."
                },
              ].map((faq, i) => (
                <Card key={i} className="bg-[#14131a] border-blood-900/20 p-5">
                  <h4 className="font-bold text-white mb-2">{faq.q}</h4>
                  <p className="text-sm text-zinc-400">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Feature({ 
  name, 
  value, 
  included, 
  icon 
}: { 
  name: string; 
  value?: number | null; 
  included: boolean; 
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        {icon || (included ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <X className="w-4 h-4 text-zinc-600" />
        ))}
        <span className={included ? "text-zinc-300" : "text-zinc-600"}>
          {name}
        </span>
      </div>
      {value !== undefined && (
        <span className="text-zinc-400 font-mono">
          {value === null ? "∞" : value}
        </span>
      )}
      {value === undefined && included && (
        <Check className="w-4 h-4 text-emerald-400" />
      )}
      {value === undefined && !included && (
        <X className="w-4 h-4 text-zinc-700" />
      )}
    </div>
  );
}
