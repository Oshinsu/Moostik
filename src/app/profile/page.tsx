"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useCredits } from "@/lib/auth/use-credits";
import { usePlan } from "@/lib/auth/use-plan";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  CreditCard,
  Crown,
  Coins,
  Image,
  Video,
  Film,
  Calendar,
  Settings,
  Shield,
  LogOut,
  Edit,
  Save,
  ArrowRight,
  History,
  Sparkles,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import type { CreditTransaction } from "@/types/auth";
import { getRoleDisplayName } from "@/lib/auth/auth-utils";

export default function ProfilePage() {
  const { user, profile, isLoading, isAuthenticated, signOut, updateProfile } = useAuth();
  const { balance, creditsUsedTotal, getTransactions } = useCredits();
  const { currentPlan, currentTier, isPro } = usePlan();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: "", avatarUrl: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditForm({
        displayName: profile.displayName || "",
        avatarUrl: profile.avatarUrl || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (isAuthenticated) {
      getTransactions(20).then(setTransactions);
    }
  }, [isAuthenticated, getTransactions]);

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({
      displayName: editForm.displayName,
      avatarUrl: editForm.avatarUrl,
    });
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#0b0b0e]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-blood-900 border-t-blood-500 rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="flex h-screen bg-[#0b0b0e]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="bg-[#14131a] border-blood-900/30 p-8 text-center max-w-md">
            <User className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Non connecté</h2>
            <p className="text-zinc-500 mb-6">Connectez-vous pour accéder à votre profil</p>
            <Link href="/auth/login">
              <Button className="moostik-btn-blood text-white">
                Se connecter
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  const usageProgress = currentPlan?.creditsMonthly 
    ? (creditsUsedTotal / currentPlan.creditsMonthly) * 100 
    : 0;

  return (
    <div className="flex h-screen bg-[#0b0b0e] text-zinc-100">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b border-blood-900/30 bg-gradient-to-r from-[#0b0b0e] to-[#14131a]">
          <div className="px-8 py-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blood-600/30 to-crimson-600/20 border-2 border-blood-600/50 flex items-center justify-center overflow-hidden">
                    {profile.avatarUrl ? (
                      <img 
                        src={profile.avatarUrl} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-blood-400" />
                    )}
                  </div>
                  <Badge className={`absolute -bottom-2 -right-2 ${
                    isPro ? "bg-amber-600" : "bg-zinc-700"
                  } text-white border-0 text-[10px] px-2`}>
                    {currentTier.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {profile.displayName || profile.email.split("@")[0]}
                  </h1>
                  <p className="text-zinc-500 text-sm flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="border-blood-700/50 text-blood-400 text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      {getRoleDisplayName(profile.role)}
                    </Badge>
                    <Badge variant="outline" className="border-zinc-700/50 text-zinc-400 text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      Membre depuis {new Date(profile.createdAt).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                  className="border-zinc-700 text-zinc-400 hover:text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowSignOutDialog(true)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-zinc-900/50 border border-zinc-800/50">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="credits">Crédits</TabsTrigger>
              <TabsTrigger value="subscription">Abonnement</TabsTrigger>
              <TabsTrigger value="activity">Activité</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-[#14131a] border-blood-900/20 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Coins className="w-8 h-8 text-amber-400" />
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{balance.toLocaleString()}</div>
                  <p className="text-xs text-zinc-500">Crédits disponibles</p>
                </Card>

                <Card className="bg-[#14131a] border-blood-900/20 p-5">
                  <Image className="w-8 h-8 text-blood-400 mb-3" />
                  <div className="text-3xl font-bold text-white">{profile.imagesGenerated}</div>
                  <p className="text-xs text-zinc-500">Images générées</p>
                </Card>

                <Card className="bg-[#14131a] border-blood-900/20 p-5">
                  <Video className="w-8 h-8 text-emerald-400 mb-3" />
                  <div className="text-3xl font-bold text-white">{profile.videosGenerated}</div>
                  <p className="text-xs text-zinc-500">Vidéos générées</p>
                </Card>

                <Card className="bg-[#14131a] border-blood-900/20 p-5">
                  <Film className="w-8 h-8 text-violet-400 mb-3" />
                  <div className="text-3xl font-bold text-white">{profile.episodesCreated}</div>
                  <p className="text-xs text-zinc-500">Épisodes créés</p>
                </Card>
              </div>

              {/* Plan Card */}
              <Card className="bg-gradient-to-br from-[#14131a] to-blood-900/10 border-blood-900/30 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-5 h-5 text-amber-400" />
                      <h3 className="text-lg font-bold text-white">Plan {currentPlan?.name}</h3>
                    </div>
                    <p className="text-sm text-zinc-500">{currentPlan?.description}</p>
                  </div>
                  <Link href="/pricing">
                    <Button variant="outline" className="border-amber-600/50 text-amber-400 hover:bg-amber-900/20">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isPro ? "Gérer" : "Améliorer"}
                    </Button>
                  </Link>
                </div>

                {currentPlan && currentPlan.creditsMonthly > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Crédits utilisés ce mois</span>
                      <span className="text-white font-mono">{creditsUsedTotal} / {currentPlan.creditsMonthly}</span>
                    </div>
                    <Progress value={Math.min(usageProgress, 100)} className="h-2" />
                  </div>
                )}

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-blood-900/30">
                  {[
                    { name: "Vidéo I2V", has: currentPlan?.hasVideoGeneration },
                    { name: "Blood Director", has: currentPlan?.hasBloodDirector },
                    { name: "Export 4K", has: currentPlan?.has4kExport },
                    { name: "File prioritaire", has: currentPlan?.hasPriorityQueue },
                    { name: "Accès API", has: currentPlan?.hasApiAccess },
                    { name: "Modèles custom", has: currentPlan?.hasCustomModels },
                  ].map((feature) => (
                    <div key={feature.name} className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${feature.has ? "text-emerald-400" : "text-zinc-700"}`} />
                      <span className={`text-sm ${feature.has ? "text-white" : "text-zinc-600"}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Credits Tab */}
            <TabsContent value="credits" className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-[#14131a] border-blood-900/20 p-5">
                  <Coins className="w-8 h-8 text-amber-400 mb-3" />
                  <div className="text-3xl font-bold text-white">{balance.toLocaleString()}</div>
                  <p className="text-xs text-zinc-500">Solde actuel</p>
                </Card>
                <Card className="bg-[#14131a] border-blood-900/20 p-5">
                  <TrendingUp className="w-8 h-8 text-emerald-400 mb-3" />
                  <div className="text-3xl font-bold text-white">{creditsUsedTotal.toLocaleString()}</div>
                  <p className="text-xs text-zinc-500">Total utilisé</p>
                </Card>
                <Card className="bg-[#14131a] border-blood-900/20 p-5">
                  <Clock className="w-8 h-8 text-violet-400 mb-3" />
                  <div className="text-3xl font-bold text-white">{currentPlan?.creditsMonthly || 0}</div>
                  <p className="text-xs text-zinc-500">Crédits mensuels</p>
                </Card>
              </div>

              {/* Transactions */}
              <Card className="bg-[#14131a] border-blood-900/20">
                <div className="p-4 border-b border-blood-900/20 flex items-center justify-between">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-zinc-500" />
                    Historique des transactions
                  </h3>
                </div>
                <div className="divide-y divide-blood-900/20">
                  {transactions.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                      <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>Aucune transaction</p>
                    </div>
                  ) : (
                    transactions.map((tx) => (
                      <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/30">
                        <div>
                          <p className="text-sm text-white">{tx.description || tx.type}</p>
                          <p className="text-xs text-zinc-500">
                            {new Date(tx.createdAt).toLocaleString("fr-FR")}
                          </p>
                        </div>
                        <div className={`text-lg font-bold ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {tx.amount > 0 ? "+" : ""}{tx.amount}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription">
              <Card className="bg-[#14131a] border-blood-900/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-blood-400" />
                      Abonnement {currentPlan?.name}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      {currentTier === "free" 
                        ? "Passez à un plan payant pour débloquer plus de fonctionnalités"
                        : `${currentPlan?.priceMonthly}€/mois`
                      }
                    </p>
                  </div>
                  <Link href="/pricing">
                    <Button className="moostik-btn-blood text-white">
                      {currentTier === "free" ? "Choisir un plan" : "Changer de plan"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Plan Details */}
                {currentPlan && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">
                        Limites
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Épisodes max</span>
                          <span className="text-white">{currentPlan.maxEpisodes || "∞"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Shots/épisode</span>
                          <span className="text-white">{currentPlan.maxShotsPerEpisode || "∞"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Générations parallèles</span>
                          <span className="text-white">{currentPlan.maxParallelGenerations}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Durée vidéo max</span>
                          <span className="text-white">{currentPlan.maxVideoDurationSeconds}s</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">
                        Fonctionnalités
                      </h4>
                      <div className="space-y-2">
                        {[
                          { name: "Génération vidéo", has: currentPlan.hasVideoGeneration },
                          { name: "Blood Director", has: currentPlan.hasBloodDirector },
                          { name: "Export HD", has: currentPlan.hasHdExport },
                          { name: "Export 4K", has: currentPlan.has4kExport },
                        ].map((f) => (
                          <div key={f.name} className="flex justify-between text-sm">
                            <span className="text-zinc-500">{f.name}</span>
                            <span className={f.has ? "text-emerald-400" : "text-zinc-600"}>
                              {f.has ? "✓" : "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card className="bg-[#14131a] border-blood-900/20 p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-zinc-500" />
                  Activité récente
                </h3>
                <div className="space-y-4">
                  <div className="text-center py-8 text-zinc-500">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Historique d'activité à venir...</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="bg-[#14131a] border-blood-900/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blood-400" />
              Modifier le profil
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Nom d'affichage</Label>
              <Input
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                className="bg-[#0b0b0e] border-blood-900/30"
                placeholder="Votre nom"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">URL Avatar</Label>
              <Input
                value={editForm.avatarUrl}
                onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                className="bg-[#0b0b0e] border-blood-900/30"
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="moostik-btn-blood text-white">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign Out Dialog */}
      <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <DialogContent className="bg-[#14131a] border-blood-900/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <LogOut className="w-5 h-5" />
              Déconnexion
            </DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400 py-4">
            Êtes-vous sûr de vouloir vous déconnecter ?
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSignOutDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSignOut}
              className="bg-red-900/50 text-red-400 hover:bg-red-900/70"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnecter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
