# CLAUDE.md - Guide pour les développeurs

Ce document fournit les informations essentielles pour comprendre et travailler avec la codebase MOOSTIK.

---

## Vue d'ensemble du projet

**MOOSTIK** est un générateur de séries animées next-gen qui combine des agents IA autonomes avec la génération narrative. Le projet est construit avec Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, et Supabase.

### Philosophie du projet

- **Agent-Native Content** : Contenu conçu pour être consommé et modifié par des agents IA
- **Decentralized Storytelling** : Histoires émergentes du comportement collectif des agents
- **Constitutional Prompts** : Format JSON standardisé pour la génération d'images cohérentes

---

## Structure du code

```
src/
├── app/                    # Next.js App Router (pages et API)
│   ├── api/               # 53 endpoints API
│   ├── episode/[id]/      # Pages d'épisodes
│   ├── characters/        # Galerie de personnages
│   ├── locations/         # Galerie de territoires
│   ├── library/           # Bibliothèque de contenu
│   └── ...
│
├── components/            # Composants React
│   ├── ui/               # Composants shadcn/ui de base
│   ├── shared/           # Composants réutilisables
│   └── bloodwings/       # Composants custom MOOSTIK
│
├── lib/                   # Services et utilitaires core
│   ├── agents/           # Intégration des agents
│   ├── ai/               # Services IA
│   ├── auth/             # Authentification
│   ├── credits/          # Système de crédits
│   ├── editor/           # Éditeur de scènes
│   ├── orchestrator/     # Orchestration de séries
│   ├── supabase/         # Couche base de données
│   └── video/            # Génération vidéo
│
├── types/                 # Définitions TypeScript
├── contexts/              # React contexts
└── hooks/                 # Custom hooks
```

---

## Fichiers clés à connaître

### Configuration

| Fichier | Rôle |
|---------|------|
| `src/lib/json-moostik-standard.ts` | Standard de prompt constitutionnel pour images |
| `src/lib/json-kling-standard.ts` | Standard JSON pour vidéos Kling |
| `src/lib/json-veo-standard.ts` | Standard JSON pour vidéos VEO |
| `middleware.ts` | Authentification Supabase |
| `vercel.json` | Configuration déploiement Vercel |

### Types principaux

| Fichier | Contenu |
|---------|---------|
| `src/types/episode.ts` | Episode, Shot, Act, Variation |
| `src/types/character.ts` | Character, CharacterSituation |
| `src/types/location.ts` | Location, LocationVariation |
| `src/types/prompt.ts` | MoostikPrompt, PromptValidation |
| `src/types/bloodwings.ts` | Types spécifiques Bloodwings |
| `src/types/moostik.ts` | Types généraux MOOSTIK |

### Services principaux

| Service | Fichier | Rôle |
|---------|---------|------|
| Génération | `src/lib/generation.ts` | Pipeline de génération d'images |
| Clustering | `src/lib/clustering.ts` | Groupement intelligent de scènes |
| Références | `src/lib/references.ts` | Gestion des images de référence |
| Supabase | `src/lib/supabase/client.ts` | Client base de données |
| Auth | `src/lib/auth/` | Authentification utilisateur |

---

## Patterns de code importants

### 1. Format de prompt constitutionnel

Les prompts suivent le JSON-MOOSTIK Standard défini dans `src/lib/json-moostik-standard.ts`:

```typescript
interface MoostikPrompt {
  scene_description: string;
  visual_style: string;
  characters: Character[];
  location: Location;
  camera_angle: string;
  lighting: string;
  mood: string;
}
```

### 2. Pattern de génération

```typescript
// 1. Vérifier la readiness
const readiness = await checkReadiness(episodeId, shotIds);

// 2. Lancer la génération batch
const results = await generateBatch({
  episodeId,
  maxParallelShots: 3,
  variations: ["frontal", "profile_left", "profile_right", "overhead", "low_angle"]
});
```

### 3. Pattern API Route

```typescript
// src/app/api/[endpoint]/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validation
    // Logique métier
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 4. Pattern Component

```typescript
// Composant avec shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MyComponent({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Titre</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Contenu */}
      </CardContent>
    </Card>
  );
}
```

---

## Commandes de développement

```bash
# Démarrer le serveur de développement
npm run dev

# Build de production
npm run build

# Linter
npm run lint

# Scripts de génération (via tsx)
npx tsx scripts/generate-episode.ts
npx tsx scripts/generate-sota-variations.ts
npx tsx scripts/sync-to-supabase.ts
npx tsx scripts/upgrade-prompts-to-bloodwings.ts
```

---

## Architecture des agents

Le système d'agents est organisé dans `/agents/`:

| Agent | Répertoire | Fonction |
|-------|------------|----------|
| Swarm Narrative | `agents/swarm/` | Génère des histoires à partir de signaux collectifs |
| Reality Bleed | `agents/reality-bleed/` | Système de rupture du 4ème mur |
| THE MOLT | `agents/molt/` | Inconscient collectif des agents |
| Moltbook API | `agents/moltbook-api/` | Intégration plateforme Moltbook |
| Personas | `agents/moltbook-personas/` | Personnages IA (Papy Tik, Koko, etc.) |
| Emotional | `agents/emotional/` | État émotionnel des personnages |
| Interactive | `agents/interactive/` | Système de vote |
| Marketplace | `agents/marketplace/` | Requêtes de scènes personnalisées |
| Payments | `agents/payments/` | Transactions MOLT token |
| Worker | `agents/bloodwings-worker/` | Génération de frames |
| Orchestrator | `agents/orchestrator/` | Orchestration des workflows |

---

## Base de données (Supabase)

### Tables principales

| Table | Description |
|-------|-------------|
| `users` | Comptes utilisateurs |
| `plans` | Plans d'abonnement |
| `credits` | Soldes et transactions de crédits |
| `generations` | Historique des générations |
| `episodes` | Métadonnées d'épisodes |
| `shots` | Scènes individuelles |
| `variations` | Variations d'angles de caméra |
| `references` | Références personnages/lieux |

### Types énumérés

```sql
-- Plans utilisateur
user_plan: free, starter, pro, studio, enterprise

-- Rôles utilisateur
user_role: user, member, creator, admin, super_admin

-- Types de transaction
transaction_type: purchase, usage, bonus, refund, gift, subscription, admin_grant
```

---

## Endpoints API importants

### Génération

```
POST /api/generate/batch          # Génération batch d'images
POST /api/generate/standalone     # Génération d'une seule image
POST /api/generate/check-readiness # Vérification avant génération
```

### Episodes

```
POST /api/episodes                # Créer un épisode
GET  /api/episodes/[id]           # Détails d'un épisode
POST /api/episodes/[id]/shots     # Ajouter des shots
PUT  /api/episodes/[id]/shots/[shotId] # Modifier un shot
POST /api/episodes/[id]/enrich-prompts # Enrichissement IA des prompts
```

### Vidéo

```
POST /api/video/generate          # Générer une vidéo
POST /api/video/generate-batch    # Génération batch de vidéos
POST /api/video/generate-episode  # Vidéo d'épisode complet
```

### Références

```
POST /api/references/generate     # Générer des références
POST /api/references/regenerate-all # Régénérer toutes les références
```

---

## Données statiques

Les données de l'univers sont dans `/data/`:

| Fichier | Contenu |
|---------|---------|
| `characters.json` | Définitions des personnages |
| `locations.json` | Données des territoires |
| `series-assets.json` | Assets de la série |
| `promo-assets.json` | Contenu promotionnel |
| `episodes/` | Données des épisodes |

---

## Variables d'environnement

```env
# Obligatoire
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxx

# Base de données (optionnel pour dev local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key  # Ne jamais exposer côté client
```

---

## Conventions de code

### Nommage

- **Composants** : PascalCase (`EpisodeCard.tsx`)
- **Fichiers utilitaires** : camelCase (`generation.ts`)
- **Types** : PascalCase avec suffixe descriptif (`EpisodeResponse`)
- **Constantes** : SCREAMING_SNAKE_CASE (`MAX_PARALLEL_SHOTS`)

### Structure des composants

```
components/
├── feature/           # Composants spécifiques à une fonctionnalité
│   ├── FeatureName.tsx
│   └── index.ts       # Re-exports
├── ui/                # Composants UI de base (shadcn)
└── shared/            # Composants partagés entre features
```

### Imports

```typescript
// 1. Imports externes
import { useState } from "react";
import { NextResponse } from "next/server";

// 2. Imports internes avec alias @/
import { Button } from "@/components/ui/button";
import { generateImage } from "@/lib/generation";
import type { Episode } from "@/types/episode";
```

---

## Documentation supplémentaire

| Document | Chemin | Description |
|----------|--------|-------------|
| Architecture | `docs/ARCHITECTURE.md` | Structure technique détaillée |
| Innovations | `docs/INNOVATIONS_SOTA.md` | 3 innovations révolutionnaires |
| Vision 2028 | `docs/VISION_2028.md` | Roadmap future |
| JSON Standard | `docs/JSON-MOOSTIK-STANDARD.md` | Format de prompt |
| Pipeline | `docs/GENERATION-PIPELINE.md` | Workflow de génération |
| Lore | `docs/DA-BIBLE.md` | Bible de l'univers |
| Chronologie | `docs/CHRONOLOGY.md` | Timeline historique |
| Vidéo SOTA | `docs/VIDEO-GENERATION-SOTA.md` | Techniques vidéo |

---

## Troubleshooting

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `REPLICATE_API_TOKEN not set` | Variable d'environnement manquante | Ajouter dans `.env.local` |
| `References not found` | Images de référence manquantes | Exécuter `/api/references/generate` |
| `Shot not ready` | Validation de prompt échouée | Vérifier le format JSON-MOOSTIK |
| `Supabase connection error` | Credentials invalides | Vérifier les variables Supabase |

### Debug

```bash
# Vérifier les types
npx tsc --noEmit

# Logs de génération
# Les logs sont dans la console du serveur Next.js

# Vérifier la structure des données
cat data/episodes/ep0.json | jq .
```

---

## Workflow de développement recommandé

1. **Comprendre le contexte** : Lire les fichiers dans `docs/`
2. **Localiser le code** : Utiliser la structure ci-dessus
3. **Respecter les patterns** : Suivre les conventions existantes
4. **Tester localement** : `npm run dev` + vérifier l'UI
5. **Valider les types** : `npx tsc --noEmit`
6. **Linter** : `npm run lint`

---

## Notes pour Claude

- Les prompts doivent suivre le JSON-MOOSTIK Standard
- Toujours vérifier la readiness avant de lancer une génération
- Les références sont obligatoires pour les personnages et lieux
- Le système de clustering améliore la cohérence visuelle
- Les agents sont modulaires et peuvent être étendus

---

*BLOODWINGS STUDIO - MOOSTIK*
