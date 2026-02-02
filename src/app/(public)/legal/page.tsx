import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Building2, User, MapPin, Mail, Globe, Scale, FileText } from "lucide-react";

// ============================================================================
// MENTIONS LÉGALES - SOTA Janvier 2026
// ============================================================================

export const metadata = {
  title: "Mentions légales | Bloodwings Studio",
  description: "Mentions légales et informations sur l'éditeur de Bloodwings Studio",
};

export default function LegalPage() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-zinc-800 text-zinc-400 border-zinc-700">
            Informations légales
          </Badge>
          <h1 className="text-4xl font-black text-white mb-4">
            Mentions légales
          </h1>
          <p className="text-zinc-500">
            Dernière mise à jour : Janvier 2026
          </p>
        </div>

        <div className="space-y-8">
          {/* Éditeur */}
          <Card className="p-8 bg-zinc-900/50 border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blood-900/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blood-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Éditeur du site</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Raison sociale</p>
                  <p className="text-white font-medium">Moostik Inc.</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Nom commercial</p>
                  <p className="text-white font-medium">Bloodwings Studio</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Forme juridique</p>
                  <p className="text-zinc-300">SAS (Société par Actions Simplifiée)</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Capital social</p>
                  <p className="text-zinc-300">10 000 €</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">RCS</p>
                  <p className="text-zinc-300">Fort-de-France B XXX XXX XXX</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">N° TVA Intracommunautaire</p>
                  <p className="text-zinc-300">FR XX XXX XXX XXX</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Directeur de publication */}
          <Card className="p-8 bg-zinc-900/50 border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blood-900/30 flex items-center justify-center">
                <User className="w-5 h-5 text-blood-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Directeur de publication</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Nom</p>
                <p className="text-white font-medium">Gary Bissol</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Qualité</p>
                <p className="text-zinc-300">Fondateur & CEO</p>
              </div>
            </div>
          </Card>

          {/* Siège social */}
          <Card className="p-8 bg-zinc-900/50 border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blood-900/30 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blood-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Siège social</h2>
            </div>
            
            <div className="space-y-2">
              <p className="text-white">Moostik Inc. / Bloodwings Studio</p>
              <p className="text-zinc-400">Fort-de-France</p>
              <p className="text-zinc-400">97200 Martinique</p>
              <p className="text-zinc-400">France</p>
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-8 bg-zinc-900/50 border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blood-900/30 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blood-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Contact</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Email</p>
                <a href="mailto:legal@bloodwings.studio" className="text-blood-400 hover:text-blood-300">
                  legal@bloodwings.studio
                </a>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Contact général</p>
                <Link href="/contact" className="text-blood-400 hover:text-blood-300">
                  Formulaire de contact →
                </Link>
              </div>
            </div>
          </Card>

          {/* Hébergement */}
          <Card className="p-8 bg-zinc-900/50 border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blood-900/30 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blood-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Hébergement</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Hébergeur</p>
                  <p className="text-white font-medium">Vercel Inc.</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Adresse</p>
                  <p className="text-zinc-400">340 S Lemon Ave #4133</p>
                  <p className="text-zinc-400">Walnut, CA 91789, USA</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Base de données</p>
                  <p className="text-white font-medium">Supabase Inc.</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Région</p>
                  <p className="text-zinc-400">Europe (France)</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Propriété intellectuelle */}
          <Card className="p-8 bg-zinc-900/50 border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blood-900/30 flex items-center justify-center">
                <Scale className="w-5 h-5 text-blood-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Propriété intellectuelle</h2>
            </div>
            
            <div className="prose prose-invert prose-zinc max-w-none">
              <p className="text-zinc-400">
                L&apos;ensemble du contenu de ce site (textes, images, vidéos, logos, 
                marques, technologies) est protégé par le droit de la propriété 
                intellectuelle et appartient à Moostik Inc. ou fait l&apos;objet 
                d&apos;une autorisation d&apos;utilisation.
              </p>
              <p className="text-zinc-400 mt-4">
                Les marques &quot;Bloodwings Studio&quot;, &quot;Moostik&quot;, &quot;Symphonies de Montage&quot; 
                et leurs logos associés sont des marques déposées de Moostik Inc.
              </p>
              <p className="text-zinc-400 mt-4">
                Toute reproduction, représentation, modification, publication, 
                transmission ou dénaturation, totale ou partielle, du site ou de 
                son contenu, par quelque procédé que ce soit, et sur quelque 
                support que ce soit est interdite sans l&apos;autorisation écrite 
                préalable de Moostik Inc.
              </p>
            </div>
          </Card>

          {/* Autres documents */}
          <Card className="p-8 bg-gradient-to-br from-blood-900/20 to-zinc-900/50 border-blood-800/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blood-900/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blood-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Documents connexes</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <Link 
                href="/terms" 
                className="p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
              >
                <p className="text-white font-medium">Conditions d&apos;utilisation</p>
                <p className="text-sm text-zinc-500">CGU du service</p>
              </Link>
              <Link 
                href="/privacy" 
                className="p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
              >
                <p className="text-white font-medium">Politique de confidentialité</p>
                <p className="text-sm text-zinc-500">RGPD & données</p>
              </Link>
              <Link 
                href="/cookies" 
                className="p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
              >
                <p className="text-white font-medium">Politique cookies</p>
                <p className="text-sm text-zinc-500">Gestion des traceurs</p>
              </Link>
            </div>
          </Card>

          {/* Powered by */}
          <div className="text-center pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-600">
              Powered by{" "}
              <a 
                href="https://byss.group" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blood-500 hover:text-blood-400"
              >
                Byss Group
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
