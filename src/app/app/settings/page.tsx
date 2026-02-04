"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PLANS, type PlanTier } from "@/types/bloodwings";
import {
  User,
  Mail,
  Key,
  Bell,
  Shield,
  Palette,
  Save,
  Camera,
  AlertTriangle,
  Check,
  Trash2,
  LogOut,
} from "lucide-react";

// ============================================================================
// SETTINGS PAGE
// ============================================================================

export default function SettingsPage() {
  const { user, profile, plan, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState(profile?.displayName || "");

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [creditAlerts, setCreditAlerts] = useState(true);

  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
    }
  }, [profile]);

  const currentPlan = (plan?.tier as PlanTier) || "free";
  const planInfo = PLANS[currentPlan];

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Paramètres
          </h1>
          <p className="text-zinc-400 mt-1">
            Gérez votre compte et vos préférences
          </p>
        </div>
        <Badge className="bg-blood-900/50 text-blood-400 border-blood-700/30">
          Plan {planInfo.nameFr}
        </Badge>
      </div>

      {/* ================================================================== */}
      {/* SETTINGS TABS */}
      {/* ================================================================== */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-zinc-900/50 border border-zinc-800/50">
          <TabsTrigger value="profile" className="data-[state=active]:bg-blood-900/50">
            <User className="w-4 h-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-blood-900/50">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-blood-900/50">
            <Shield className="w-4 h-4 mr-2" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-blood-900/50">
            <Palette className="w-4 h-4 mr-2" />
            Apparence
          </TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* PROFILE TAB */}
        {/* ============================================================== */}
        <TabsContent value="profile" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Avatar Section */}
            <Card className="p-6 bg-zinc-900/50 border-zinc-800/50">
              <h3 className="text-lg font-bold text-white mb-4">Photo de profil</h3>
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 border-2 border-blood-600/50 mb-4">
                  <AvatarImage src={profile?.avatarUrl || undefined} />
                  <AvatarFallback className="bg-blood-900/50 text-blood-400 text-2xl">
                    {displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="border-zinc-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Changer la photo
                </Button>
                <p className="text-xs text-zinc-500 mt-2 text-center">
                  JPG, PNG ou GIF. Max 2MB.
                </p>
              </div>
            </Card>

            {/* Profile Info */}
            <Card className="p-6 bg-zinc-900/50 border-zinc-800/50 md:col-span-2">
              <h3 className="text-lg font-bold text-white mb-4">Informations du profil</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-zinc-400">
                    Nom d&apos;affichage
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700 focus:border-blood-600"
                    placeholder="Votre nom"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-400">
                    Email
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-zinc-800/30 border-zinc-700/50 text-zinc-500"
                    />
                    <Button variant="outline" size="sm" className="border-zinc-700 whitespace-nowrap">
                      <Mail className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    {isSaved && (
                      <Badge className="bg-emerald-900/50 text-emerald-400 border-0">
                        <Check className="w-3 h-3 mr-1" />
                        Sauvegardé
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="bg-blood-600 hover:bg-blood-500"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ============================================================== */}
        {/* NOTIFICATIONS TAB */}
        {/* ============================================================== */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="p-6 bg-zinc-900/50 border-zinc-800/50">
            <h3 className="text-lg font-bold text-white mb-6">Préférences de notification</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Notifications par email</p>
                  <p className="text-sm text-zinc-500">Recevez des mises à jour sur vos projets</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Emails marketing</p>
                  <p className="text-sm text-zinc-500">Nouvelles fonctionnalités et offres spéciales</p>
                </div>
                <Switch
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Digest hebdomadaire</p>
                  <p className="text-sm text-zinc-500">Résumé de votre activité chaque semaine</p>
                </div>
                <Switch
                  checked={weeklyDigest}
                  onCheckedChange={setWeeklyDigest}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Alertes crédits</p>
                  <p className="text-sm text-zinc-500">Notification quand vos crédits sont bas</p>
                </div>
                <Switch
                  checked={creditAlerts}
                  onCheckedChange={setCreditAlerts}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* SECURITY TAB */}
        {/* ============================================================== */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="p-6 bg-zinc-900/50 border-zinc-800/50">
            <h3 className="text-lg font-bold text-white mb-6">Mot de passe</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Mot de passe actuel</Label>
                <Input
                  type="password"
                  className="bg-zinc-800/50 border-zinc-700 focus:border-blood-600"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Nouveau mot de passe</Label>
                <Input
                  type="password"
                  className="bg-zinc-800/50 border-zinc-700 focus:border-blood-600"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Confirmer le mot de passe</Label>
                <Input
                  type="password"
                  className="bg-zinc-800/50 border-zinc-700 focus:border-blood-600"
                  placeholder="••••••••"
                />
              </div>
              <Button variant="outline" className="border-zinc-700">
                <Key className="w-4 h-4 mr-2" />
                Changer le mot de passe
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-zinc-900/50 border-zinc-800/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Authentification à deux facteurs</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Ajoutez une couche de sécurité supplémentaire à votre compte
                </p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>
          </Card>

          <Card className="p-6 bg-red-900/10 border-red-900/30">
            <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zone de danger
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              Ces actions sont irréversibles. Procédez avec prudence.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-red-900/50 text-red-400 hover:bg-red-900/20"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
              <Button
                variant="outline"
                className="border-red-900/50 text-red-400 hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer le compte
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* APPEARANCE TAB */}
        {/* ============================================================== */}
        <TabsContent value="appearance" className="mt-6">
          <Card className="p-6 bg-zinc-900/50 border-zinc-800/50">
            <h3 className="text-lg font-bold text-white mb-6">Apparence</h3>
            <div className="space-y-6">
              <div>
                <Label className="text-zinc-400 mb-3 block">Thème</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button className="p-4 rounded-lg border-2 border-blood-600 bg-zinc-900/50 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#0b0b0e] border border-zinc-700" />
                    <span className="text-sm text-white">Sombre</span>
                  </button>
                  <button className="p-4 rounded-lg border border-zinc-700 bg-zinc-900/50 flex flex-col items-center gap-2 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-white border border-zinc-300" />
                    <span className="text-sm text-zinc-500">Clair</span>
                    <Badge className="text-[10px] bg-zinc-800 text-zinc-500 border-0">Bientôt</Badge>
                  </button>
                  <button className="p-4 rounded-lg border border-zinc-700 bg-zinc-900/50 flex flex-col items-center gap-2 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-900 to-white border border-zinc-500" />
                    <span className="text-sm text-zinc-500">Système</span>
                    <Badge className="text-[10px] bg-zinc-800 text-zinc-500 border-0">Bientôt</Badge>
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-zinc-400 mb-3 block">Accent de couleur</Label>
                <div className="flex gap-3">
                  <button className="w-10 h-10 rounded-full bg-blood-600 ring-2 ring-blood-400 ring-offset-2 ring-offset-zinc-900" />
                  <button className="w-10 h-10 rounded-full bg-purple-600 opacity-50" />
                  <button className="w-10 h-10 rounded-full bg-blue-600 opacity-50" />
                  <button className="w-10 h-10 rounded-full bg-emerald-600 opacity-50" />
                  <button className="w-10 h-10 rounded-full bg-amber-600 opacity-50" />
                </div>
                <p className="text-xs text-zinc-500 mt-2">Plus de couleurs bientôt disponibles</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
