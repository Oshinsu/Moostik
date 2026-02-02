import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  CreditCard,
  Shield,
  Scale,
  Users,
  Zap,
} from "lucide-react";

// ============================================================================
// CONDITIONS GÉNÉRALES D'UTILISATION - SOTA Janvier 2026
// ============================================================================

export const metadata = {
  title: "Conditions Générales d'Utilisation | Bloodwings Studio",
  description: "CGU de Bloodwings Studio - Conditions d'utilisation du service",
};

export default function TermsPage() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-zinc-800 text-zinc-400 border-zinc-700">
            <FileText className="w-3 h-3 mr-1" />
            Document légal
          </Badge>
          <h1 className="text-4xl font-black text-white mb-4">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="text-zinc-500">
            Dernière mise à jour : Janvier 2026 • Version 2.0
          </p>
        </div>

        {/* Intro */}
        <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 mb-8">
          <p className="text-zinc-300 leading-relaxed">
            Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent 
            l&apos;accès et l&apos;utilisation de la plateforme Bloodwings Studio, 
            éditée par <strong className="text-white">Moostik Inc.</strong>
          </p>
          <div className="mt-6 p-4 bg-amber-900/20 border border-amber-700/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300">
              En utilisant Bloodwings Studio, vous acceptez les présentes CGU. 
              Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser le service.
            </p>
          </div>
        </Card>

        {/* Article 1 */}
        <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-blood-400">Article 1.</span> Objet
          </h2>
          <div className="text-zinc-400 space-y-4">
            <p>
              Bloodwings Studio est une plateforme de création de contenus animés 
              utilisant l&apos;intelligence artificielle. Le service permet de :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Générer des images et vidéos par IA</li>
              <li>Créer et gérer des univers narratifs (personnages, lieux, etc.)</li>
              <li>Utiliser des outils de montage automatique (Beat Sync, Symphonies de Montage™)</li>
              <li>Exporter des contenus pour diffusion</li>
              <li>Participer à la communauté et soumettre des créations</li>
            </ul>
          </div>
        </Card>

        {/* Article 2 */}
        <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-blood-400">Article 2.</span> Inscription et compte
          </h2>
          <div className="text-zinc-400 space-y-4">
            <p>
              L&apos;utilisation du service nécessite la création d&apos;un compte. Vous devez :
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">Vous devez</span>
                </div>
                <ul className="text-sm space-y-1 text-emerald-400/80">
                  <li>• Avoir 18 ans ou plus</li>
                  <li>• Fournir des informations exactes</li>
                  <li>• Protéger vos identifiants</li>
                  <li>• Signaler tout accès non autorisé</li>
                </ul>
              </div>
              <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-300 font-medium">Interdit</span>
                </div>
                <ul className="text-sm space-y-1 text-red-400/80">
                  <li>• Créer plusieurs comptes</li>
                  <li>• Partager votre compte</li>
                  <li>• Usurper une identité</li>
                  <li>• Revendre l&apos;accès au service</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Article 3 */}
        <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blood-400" />
            <span className="text-blood-400">Article 3.</span> Tarification et paiement
          </h2>
          <div className="text-zinc-400 space-y-4">
            <p>
              Bloodwings Studio propose plusieurs formules d&apos;abonnement. Les tarifs 
              sont indiqués en euros TTC sur la page <Link href="/pricing" className="text-blood-400 hover:underline">Tarifs</Link>.
            </p>
            <ul className="space-y-2">
              <li><strong className="text-white">3.1</strong> Les abonnements sont facturés mensuellement ou annuellement selon votre choix.</li>
              <li><strong className="text-white">3.2</strong> Les crédits inclus sont valables pour le mois en cours. Le report est possible selon le plan.</li>
              <li><strong className="text-white">3.3</strong> Aucun remboursement n&apos;est accordé pour les crédits consommés.</li>
              <li><strong className="text-white">3.4</strong> Vous pouvez annuler votre abonnement à tout moment. L&apos;accès reste actif jusqu&apos;à la fin de la période payée.</li>
            </ul>
          </div>
        </Card>

        {/* Article 4 */}
        <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blood-400" />
            <span className="text-blood-400">Article 4.</span> Propriété intellectuelle
          </h2>
          <div className="text-zinc-400 space-y-4">
            <p><strong className="text-white">4.1 Votre contenu :</strong></p>
            <p>
              Vous conservez tous les droits sur le contenu que vous créez avec Bloodwings Studio 
              (images, vidéos, scripts). Vous nous accordez une licence limitée pour afficher 
              et traiter ce contenu dans le cadre du service.
            </p>
            <p className="mt-4"><strong className="text-white">4.2 Notre contenu :</strong></p>
            <p>
              La plateforme, son code, son design, les marques &quot;Bloodwings Studio&quot;, &quot;Moostik&quot;, 
              &quot;Symphonies de Montage&quot; et l&apos;univers Moostik restent la propriété exclusive de Moostik Inc.
            </p>
            <p className="mt-4"><strong className="text-white">4.3 Contenu communautaire :</strong></p>
            <p>
              En soumettant du contenu à la communauté, vous accordez à Moostik Inc. une licence 
              non-exclusive pour diffuser ce contenu, avec attribution et selon les termes du 
              contrat de partage de revenus (15% créateur).
            </p>
          </div>
        </Card>

        {/* Article 5 */}
        <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blood-400" />
            <span className="text-blood-400">Article 5.</span> Règles de conduite
          </h2>
          <div className="text-zinc-400 space-y-4">
            <p>Il est strictement interdit d&apos;utiliser le service pour :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Générer du contenu illégal, haineux, violent ou pornographique</li>
              <li>Créer des deepfakes ou contenus trompeurs</li>
              <li>Violer les droits de tiers (copyright, vie privée, etc.)</li>
              <li>Automatiser l&apos;accès au service sans autorisation</li>
              <li>Tenter de contourner les limites techniques</li>
              <li>Harceler d&apos;autres utilisateurs</li>
            </ul>
            <p className="mt-4">
              Toute violation peut entraîner la suspension immédiate du compte sans remboursement.
            </p>
          </div>
        </Card>

        {/* Article 6 */}
        <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blood-400" />
            <span className="text-blood-400">Article 6.</span> Disponibilité et limitations
          </h2>
          <div className="text-zinc-400 space-y-4">
            <p><strong className="text-white">6.1</strong> Nous nous efforçons d&apos;assurer une disponibilité de 99.9% du service.</p>
            <p><strong className="text-white">6.2</strong> Des interruptions peuvent survenir pour maintenance, mises à jour ou cas de force majeure.</p>
            <p><strong className="text-white">6.3</strong> Les résultats de génération AI peuvent varier et ne sont pas garantis.</p>
            <p><strong className="text-white">6.4</strong> Le service est fourni &quot;en l&apos;état&quot; sans garantie de résultat spécifique.</p>
          </div>
        </Card>

        {/* Article 7 */}
        <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blood-400" />
            <span className="text-blood-400">Article 7.</span> Responsabilité
          </h2>
          <div className="text-zinc-400 space-y-4">
            <p>
              Dans les limites permises par la loi, Moostik Inc. ne peut être tenue responsable 
              des dommages indirects, pertes de données, manque à gagner ou préjudices résultant 
              de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser le service.
            </p>
            <p>
              Vous êtes seul responsable du contenu que vous créez et de son utilisation.
            </p>
          </div>
        </Card>

        {/* Article 8 */}
        <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            <span className="text-blood-400">Article 8.</span> Modifications des CGU
          </h2>
          <div className="text-zinc-400 space-y-4">
            <p>
              Nous pouvons modifier ces CGU à tout moment. Les modifications significatives 
              seront notifiées par email au moins 30 jours avant leur entrée en vigueur.
            </p>
            <p>
              La continuation de l&apos;utilisation du service après modification vaut acceptation 
              des nouvelles conditions.
            </p>
          </div>
        </Card>

        {/* Article 9 */}
        <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            <span className="text-blood-400">Article 9.</span> Droit applicable et litiges
          </h2>
          <div className="text-zinc-400 space-y-4">
            <p>
              Les présentes CGU sont régies par le droit français. En cas de litige, 
              une solution amiable sera recherchée avant toute action judiciaire.
            </p>
            <p>
              À défaut d&apos;accord amiable, les tribunaux de Fort-de-France (Martinique) 
              seront seuls compétents.
            </p>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-8 bg-gradient-to-br from-blood-900/20 to-zinc-900/50 border-blood-800/30">
          <h2 className="text-xl font-bold text-white mb-4">Contact</h2>
          <p className="text-zinc-400 mb-4">
            Pour toute question relative aux présentes CGU :
          </p>
          <div className="space-y-2 text-sm">
            <p className="text-zinc-300">Moostik Inc. / Bloodwings Studio</p>
            <p className="text-zinc-400">Fort-de-France, 97200 Martinique</p>
            <p>
              <a href="mailto:legal@bloodwings.studio" className="text-blood-400 hover:text-blood-300">
                legal@bloodwings.studio
              </a>
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
          <Link href="/cookies" className="text-zinc-500 hover:text-blood-400">
            Cookies
          </Link>
        </div>
      </div>
    </div>
  );
}
