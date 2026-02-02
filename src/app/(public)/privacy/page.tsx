import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { 
  Shield, 
  Database, 
  Lock, 
  Eye, 
  Clock, 
  Globe, 
  UserCheck, 
  Mail,
  Server,
  Trash2,
} from "lucide-react";

// ============================================================================
// POLITIQUE DE CONFIDENTIALITÉ - SOTA Janvier 2026 - RGPD Compliant
// ============================================================================

export const metadata = {
  title: "Politique de confidentialité | Bloodwings Studio",
  description: "Comment nous protégeons vos données personnelles - RGPD",
};

const SECTIONS = [
  {
    icon: Database,
    title: "1. Données collectées",
    content: `
**Données de compte :**
- Adresse email
- Nom d'affichage
- Avatar (optionnel)
- Préférences utilisateur

**Données d'utilisation :**
- Historique des générations (images, vidéos)
- Crédits consommés et transactions
- Logs de connexion

**Données techniques :**
- Adresse IP (anonymisée après 30 jours)
- Type de navigateur et appareil
- Pages visitées

**Contenu créé :**
- Projets et univers créés
- Images et vidéos générées
- Personnages et avatars Moostik
    `,
  },
  {
    icon: Eye,
    title: "2. Utilisation des données",
    content: `
Nous utilisons vos données pour :

- **Fournir le service** : Génération d'images/vidéos, sauvegarde de projets
- **Gérer votre compte** : Authentification, facturation, support
- **Améliorer le service** : Analyse anonymisée, détection de bugs
- **Communication** : Emails transactionnels, notifications (si activées)
- **Sécurité** : Prévention de la fraude, protection des comptes

Nous ne vendons **jamais** vos données personnelles à des tiers.
    `,
  },
  {
    icon: Lock,
    title: "3. Protection des données",
    content: `
**Mesures techniques :**
- Chiffrement TLS 1.3 pour toutes les communications
- Chiffrement au repos des données sensibles
- Authentification à deux facteurs disponible
- Audits de sécurité réguliers

**Mesures organisationnelles :**
- Accès aux données limité au personnel autorisé
- Formation obligatoire à la protection des données
- Procédures de réponse aux incidents

**Hébergement :**
- Serveurs hébergés en Europe (France)
- Conformité RGPD de nos sous-traitants
- Sauvegardes chiffrées quotidiennes
    `,
  },
  {
    icon: Clock,
    title: "4. Conservation des données",
    content: `
| Type de données | Durée de conservation |
|----------------|----------------------|
| Compte actif | Durée de l'inscription |
| Compte supprimé | 30 jours puis effacement |
| Logs de connexion | 1 an |
| Données de facturation | 10 ans (obligation légale) |
| Contenu généré | Supprimé avec le compte |
| Données analytiques | 26 mois (anonymisées) |

Vous pouvez demander la suppression anticipée à tout moment.
    `,
  },
  {
    icon: Globe,
    title: "5. Transferts internationaux",
    content: `
Vos données peuvent être transférées vers :

- **États-Unis** : Pour certains services (Vercel, Stripe)
  - Garanties : Clauses contractuelles types (SCC)
  
- **Union Européenne** : Hébergement principal
  - Conformité RGPD native

Nous sélectionnons uniquement des partenaires offrant des garanties 
de protection équivalentes au RGPD.
    `,
  },
  {
    icon: UserCheck,
    title: "6. Vos droits (RGPD)",
    content: `
Conformément au RGPD, vous disposez des droits suivants :

- **Accès** : Obtenir une copie de vos données
- **Rectification** : Corriger vos données inexactes
- **Effacement** : Demander la suppression de vos données
- **Portabilité** : Recevoir vos données dans un format standard
- **Opposition** : Vous opposer à certains traitements
- **Limitation** : Limiter l'utilisation de vos données

Pour exercer ces droits : **privacy@bloodwings.studio**

Délai de réponse : 30 jours maximum.
    `,
  },
  {
    icon: Server,
    title: "7. Cookies et traceurs",
    content: `
**Cookies essentiels :**
- Authentification de session
- Préférences utilisateur
- Sécurité (CSRF)

**Cookies analytiques (optionnels) :**
- Mesure d'audience anonymisée
- Amélioration du service

Vous pouvez gérer vos préférences cookies à tout moment 
via le bandeau ou dans vos paramètres de compte.

[Gérer mes cookies →](/cookies)
    `,
  },
];

export default function PrivacyPage() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-emerald-900/50 text-emerald-400 border-emerald-700/30">
            <Shield className="w-3 h-3 mr-1" />
            RGPD Compliant
          </Badge>
          <h1 className="text-4xl font-black text-white mb-4">
            Politique de confidentialité
          </h1>
          <p className="text-zinc-500">
            Dernière mise à jour : Janvier 2026
          </p>
        </div>

        {/* Intro */}
        <Card className="p-8 bg-zinc-900/50 border-zinc-800/50 mb-8">
          <p className="text-zinc-300 leading-relaxed">
            Chez <strong className="text-white">Moostik Inc.</strong> (Bloodwings Studio), 
            nous accordons une importance capitale à la protection de vos données personnelles. 
            Cette politique explique comment nous collectons, utilisons et protégeons vos 
            informations conformément au Règlement Général sur la Protection des Données (RGPD).
          </p>
          <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
            <p className="text-sm text-emerald-300">
              <strong>Responsable du traitement :</strong> Moostik Inc., Fort-de-France, Martinique
              <br />
              <strong>DPO Contact :</strong> privacy@bloodwings.studio
            </p>
          </div>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map((section, i) => (
            <Card key={i} className="p-8 bg-zinc-900/50 border-zinc-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blood-900/30 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-blood-400" />
                </div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
              </div>
              <div className="prose prose-invert prose-zinc max-w-none prose-p:text-zinc-400 prose-strong:text-white prose-li:text-zinc-400">
                <div className="whitespace-pre-wrap text-zinc-400 text-sm leading-relaxed">
                  {section.content.trim()}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Contact DPO */}
        <Card className="p-8 bg-gradient-to-br from-blood-900/20 to-zinc-900/50 border-blood-800/30 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blood-900/30 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blood-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Nous contacter</h2>
          </div>
          
          <p className="text-zinc-400 mb-4">
            Pour toute question relative à cette politique ou pour exercer vos droits :
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-zinc-800/50">
              <p className="text-sm text-zinc-500 mb-1">Email DPO</p>
              <a href="mailto:privacy@bloodwings.studio" className="text-blood-400 hover:text-blood-300">
                privacy@bloodwings.studio
              </a>
            </div>
            <div className="p-4 rounded-lg bg-zinc-800/50">
              <p className="text-sm text-zinc-500 mb-1">Réclamation CNIL</p>
              <a 
                href="https://www.cnil.fr/fr/plaintes" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blood-400 hover:text-blood-300"
              >
                www.cnil.fr →
              </a>
            </div>
          </div>
        </Card>

        {/* Other docs */}
        <div className="flex justify-center gap-4 mt-8 text-sm">
          <Link href="/legal" className="text-zinc-500 hover:text-blood-400">
            Mentions légales
          </Link>
          <span className="text-zinc-700">•</span>
          <Link href="/terms" className="text-zinc-500 hover:text-blood-400">
            CGU
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
