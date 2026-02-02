"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Cookie, Shield, BarChart3, Settings, CheckCircle2 } from "lucide-react";

// ============================================================================
// POLITIQUE COOKIES - SOTA Janvier 2026
// ============================================================================

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: true,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save preferences (in reality, set cookies and send to analytics)
    localStorage.setItem("cookie-preferences", JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAcceptAll = () => {
    setPreferences({ necessary: true, analytics: true, marketing: true });
    handleSave();
  };

  const handleRejectAll = () => {
    setPreferences({ necessary: true, analytics: false, marketing: false });
    handleSave();
  };

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-900/50 text-amber-400 border-amber-700/30">
            <Cookie className="w-3 h-3 mr-1" />
            Gestion des cookies
          </Badge>
          <h1 className="text-4xl font-black text-white mb-4">
            Politique des cookies
          </h1>
          <p className="text-zinc-500">
            Dernière mise à jour : Janvier 2026
          </p>
        </div>

        {/* Intro */}
        <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 mb-8">
          <p className="text-zinc-300 leading-relaxed">
            Bloodwings Studio utilise des cookies et technologies similaires pour 
            améliorer votre expérience. Cette page vous permet de comprendre leur 
            utilisation et de gérer vos préférences.
          </p>
        </Card>

        {/* Preference Manager */}
        <Card className="p-8 bg-gradient-to-br from-blood-900/20 to-zinc-900/50 border-blood-800/30 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blood-400" />
            Gérer mes préférences
          </h2>

          <div className="space-y-6">
            {/* Necessary */}
            <div className="flex items-start justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-900/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <Label className="text-white font-medium">Cookies essentiels</Label>
                  <p className="text-sm text-zinc-500 mt-1">
                    Nécessaires au fonctionnement du site. Ne peuvent pas être désactivés.
                  </p>
                  <p className="text-xs text-zinc-600 mt-2">
                    Authentification, sécurité, préférences de session
                  </p>
                </div>
              </div>
              <Switch checked={true} disabled className="data-[state=checked]:bg-emerald-600" />
            </div>

            {/* Analytics */}
            <div className="flex items-start justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <Label className="text-white font-medium">Cookies analytiques</Label>
                  <p className="text-sm text-zinc-500 mt-1">
                    Nous aident à comprendre comment vous utilisez le service.
                  </p>
                  <p className="text-xs text-zinc-600 mt-2">
                    Mesure d&apos;audience, amélioration UX (données anonymisées)
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Marketing */}
            <div className="flex items-start justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <Label className="text-white font-medium">Cookies marketing</Label>
                  <p className="text-sm text-zinc-500 mt-1">
                    Permettent d&apos;afficher des publicités pertinentes.
                  </p>
                  <p className="text-xs text-zinc-600 mt-2">
                    Actuellement non utilisés sur Bloodwings Studio
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) => setPreferences({ ...preferences, marketing: checked })}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button onClick={handleSave} className="flex-1 bg-blood-600 hover:bg-blood-500">
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Préférences sauvegardées
                </>
              ) : (
                "Sauvegarder mes préférences"
              )}
            </Button>
            <Button onClick={handleAcceptAll} variant="outline" className="border-zinc-700">
              Tout accepter
            </Button>
            <Button onClick={handleRejectAll} variant="outline" className="border-zinc-700">
              Tout refuser
            </Button>
          </div>
        </Card>

        {/* Cookie Details */}
        <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Détail des cookies utilisés</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Nom</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Catégorie</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Durée</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                <tr>
                  <td className="py-3 px-4 text-white font-mono text-xs">sb-access-token</td>
                  <td className="py-3 px-4 text-emerald-400">Essentiel</td>
                  <td className="py-3 px-4 text-zinc-400">Session</td>
                  <td className="py-3 px-4 text-zinc-500">Authentification Supabase</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white font-mono text-xs">sb-refresh-token</td>
                  <td className="py-3 px-4 text-emerald-400">Essentiel</td>
                  <td className="py-3 px-4 text-zinc-400">30 jours</td>
                  <td className="py-3 px-4 text-zinc-500">Renouvellement session</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white font-mono text-xs">cookie-preferences</td>
                  <td className="py-3 px-4 text-emerald-400">Essentiel</td>
                  <td className="py-3 px-4 text-zinc-400">1 an</td>
                  <td className="py-3 px-4 text-zinc-500">Vos choix de cookies</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white font-mono text-xs">_ga, _gid</td>
                  <td className="py-3 px-4 text-blue-400">Analytique</td>
                  <td className="py-3 px-4 text-zinc-400">2 ans</td>
                  <td className="py-3 px-4 text-zinc-500">Google Analytics (si activé)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* More Info */}
        <Card className="p-8 bg-zinc-900/50 border-zinc-800/50">
          <h2 className="text-xl font-bold text-white mb-4">En savoir plus</h2>
          <div className="text-zinc-400 space-y-4">
            <p>
              Les cookies sont de petits fichiers texte stockés sur votre appareil. 
              Ils permettent de mémoriser vos préférences et d&apos;améliorer votre 
              expérience utilisateur.
            </p>
            <p>
              Vous pouvez également gérer les cookies via les paramètres de votre 
              navigateur. Notez que la désactivation de certains cookies peut 
              affecter le fonctionnement du service.
            </p>
            <p>
              Pour plus d&apos;informations sur la gestion de vos données, consultez 
              notre <Link href="/privacy" className="text-blood-400 hover:underline">politique de confidentialité</Link>.
            </p>
          </div>
        </Card>

        {/* Other docs */}
        <div className="flex justify-center gap-4 mt-8 text-sm">
          <Link href="/legal" className="text-zinc-500 hover:text-blood-400">
            Mentions légales
          </Link>
          <span className="text-zinc-700">•</span>
          <Link href="/privacy" className="text-zinc-500 hover:text-blood-400">
            Confidentialité
          </Link>
          <span className="text-zinc-700">•</span>
          <Link href="/terms" className="text-zinc-500 hover:text-blood-400">
            CGU
          </Link>
        </div>
      </div>
    </div>
  );
}
