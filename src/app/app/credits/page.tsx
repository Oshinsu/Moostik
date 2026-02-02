"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLANS, CREDIT_COSTS, type PlanTier } from "@/types/bloodwings";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Clock,
  Check,
  X,
  Sparkles,
  Image,
  Video,
  FileOutput,
  CreditCard,
  History,
  Gift,
  ArrowUpRight,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface CreditBalance {
  available: number;
  used: number;
  bonus: number;
  rollover: number;
  total: number;
  monthlyAllowance: number;
}

interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

// ============================================================================
// CREDITS PAGE
// ============================================================================

export default function CreditsPage() {
  const { plan } = useAuth();
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [history, setHistory] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/credits?history=true&limit=50");
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
          setHistory(data.history || []);
        }
      } catch (error) {
        console.error("Failed to fetch credits:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const currentPlan = (plan?.tier as PlanTier) || "free";
  const planInfo = PLANS[currentPlan];
  const percentUsed = balance 
    ? Math.round((balance.used / balance.monthlyAllowance) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Crédits & Abonnement
        </h1>
        <p className="text-zinc-400 mt-1">
          Gérez vos crédits et votre plan
        </p>
      </div>

      {/* ================================================================== */}
      {/* BALANCE OVERVIEW */}
      {/* ================================================================== */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Balance */}
        <Card className="p-6 bg-gradient-to-br from-blood-900/30 to-zinc-900/50 border-blood-800/30 md:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Crédits disponibles</p>
              <p className="text-5xl font-black text-white">
                {balance?.total || 0}
              </p>
            </div>
            <Badge className="bg-blood-600 text-white border-0">
              Plan {planInfo.nameFr}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Utilisation ce mois</span>
                <span className="text-white">{balance?.used || 0} / {balance?.monthlyAllowance || 0}</span>
              </div>
              <Progress 
                value={percentUsed} 
                className="h-3 bg-zinc-800"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blood-900/30">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Mensuel</p>
                <p className="text-lg font-bold text-white">{balance?.available || 0}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Bonus</p>
                <p className="text-lg font-bold text-emerald-400">{balance?.bonus || 0}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Reportés</p>
                <p className="text-lg font-bold text-blue-400">{balance?.rollover || 0}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="p-4 bg-zinc-900/50 border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-900/30 flex items-center justify-center">
                <Image className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Coût image</p>
                <p className="text-white font-bold">1-2 crédits</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-zinc-900/50 border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center">
                <Video className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Coût vidéo</p>
                <p className="text-white font-bold">2-6 crédits/s</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-zinc-900/50 border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center">
                <FileOutput className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Coût export</p>
                <p className="text-white font-bold">5-15 crédits</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="bg-zinc-900/50 border border-zinc-800/50">
          <TabsTrigger value="plans" className="data-[state=active]:bg-blood-900/50">
            <CreditCard className="w-4 h-4 mr-2" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-blood-900/50">
            <History className="w-4 h-4 mr-2" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="costs" className="data-[state=active]:bg-blood-900/50">
            <Coins className="w-4 h-4 mr-2" />
            Grille tarifaire
          </TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* PLANS TAB */}
        {/* ============================================================== */}
        <TabsContent value="plans" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["creator", "studio", "production", "enterprise"] as PlanTier[]).map((tier) => {
              const p = PLANS[tier];
              const isCurrent = currentPlan === tier;
              const isUpgrade = ["creator", "studio", "production", "enterprise"].indexOf(tier) >
                ["free", "creator", "studio", "production", "enterprise"].indexOf(currentPlan);

              return (
                <Card
                  key={tier}
                  className={`p-6 transition-all ${
                    isCurrent
                      ? "bg-blood-900/30 border-blood-600/50 ring-2 ring-blood-600/30"
                      : "bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700"
                  }`}
                >
                  {isCurrent && (
                    <Badge className="mb-3 bg-blood-600 text-white border-0">
                      Plan actuel
                    </Badge>
                  )}
                  <h3 className="text-xl font-bold text-white mb-1">{p.nameFr}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-black text-white">{p.price.monthly}€</span>
                    <span className="text-zinc-500">/mois</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {p.features.imagesPerMonth === -1 ? "∞" : p.features.imagesPerMonth} images/mois
                    </li>
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {p.features.videosPerMonth === -1 ? "∞" : p.features.videosPerMonth} vidéos/mois
                    </li>
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {p.limits.maxCreditsPerMonth} crédits/mois
                    </li>
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      {p.features.multiProvider ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-600" />
                      )}
                      Multi-provider
                    </li>
                  </ul>

                  {isCurrent ? (
                    <Button disabled className="w-full bg-zinc-800 text-zinc-500">
                      Plan actuel
                    </Button>
                  ) : isUpgrade ? (
                    <Button className="w-full bg-blood-600 hover:bg-blood-500">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Passer à {p.nameFr}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full border-zinc-700">
                      Downgrade
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ============================================================== */}
        {/* HISTORY TAB */}
        {/* ============================================================== */}
        <TabsContent value="history" className="mt-6">
          <Card className="bg-zinc-900/50 border-zinc-800/50">
            {history.length > 0 ? (
              <div className="divide-y divide-zinc-800/50">
                {history.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.amount > 0 
                          ? "bg-emerald-900/30 text-emerald-400" 
                          : "bg-red-900/30 text-red-400"
                      }`}>
                        {tx.amount > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-white">{tx.description}</p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        tx.amount > 0 ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Solde: {tx.balanceAfter}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <History className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">Aucune transaction pour l&apos;instant</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* COSTS TAB */}
        {/* ============================================================== */}
        <TabsContent value="costs" className="mt-6">
          <Card className="p-6 bg-zinc-900/50 border-zinc-800/50">
            <h3 className="text-lg font-bold text-white mb-4">Coûts par opération</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(CREDIT_COSTS).map(([key, cost]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30"
                >
                  <span className="text-sm text-zinc-400">{cost.description}</span>
                  <Badge className="bg-blood-900/50 text-blood-400 border-0">
                    {cost.amount} crédit{cost.amount > 1 ? "s" : ""}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
