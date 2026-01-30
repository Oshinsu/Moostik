# MOOSTIK - Générateur d'Images pour Série Animée

Générateur automatique d'images cinématiques pour la série animée **MOOSTIK**, utilisant l'API Replicate avec le modèle `google/nano-banana-pro`.

## L'Univers MOOSTIK

MOOSTIK est une série animée sombre style Pixar, suivant un clan de moustiques anthropomorphiques dans les Caraïbes. Le style visuel combine :
- Esthétique Pixar-dark avec éclairage dramatique
- Architecture Renaissance à échelle microscopique
- Palette : cramoisis profonds, ambres chauds, bleus nuit
- Technologie médiévale (bougies, parchemin, armes en chitine)

## Fonctionnalités

- **Génération par épisode** : Organisation en shots avec 5 variations d'angles chacun
- **Système de clustering** : Groupement intelligent des scènes pour cohérence visuelle
- **Références validées** : Injection automatique des images de référence
- **Standard JSON MOOSTIK** : Format de prompt constitutionnel
- **UI SOTA** : Interface moderne avec suivi temps réel

## Stack Technique

- **Frontend** : Next.js 16 (App Router), React, Tailwind CSS, shadcn/ui
- **Backend** : API Routes Next.js, TypeScript
- **IA** : Replicate API (Nano Banana Pro)
- **Stockage** : Fichiers JSON locaux

## Installation

```bash
# Cloner le repo
git clone <repo-url>
cd Moostik

# Installer les dépendances
npm install
# ou
bun install

# Configurer les variables d'environnement
cp .env.example .env.local
# Ajouter REPLICATE_API_TOKEN dans .env.local

# Lancer le serveur de développement
npm run dev
```

## Configuration

Créer `.env.local` :

```env
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxx
```

## Structure du projet

```
src/
├── app/          # Pages et API routes
├── components/   # Composants React
├── contexts/     # React Contexts
├── data/         # Données statiques (personnages, lieux)
├── hooks/        # Custom hooks
├── lib/          # Services (génération, clustering, références)
└── types/        # Types TypeScript

data/
├── characters.json    # Données personnages
├── locations.json     # Données lieux
└── episodes/          # Données épisodes
    └── ep0.json

docs/
├── ARCHITECTURE.md           # Architecture technique
├── JSON-MOOSTIK-STANDARD.md  # Standard de prompts
└── GENERATION-PIPELINE.md    # Pipeline de génération
```

## Utilisation

### 1. Créer un épisode

Via l'interface ou l'API :

```bash
POST /api/episodes
{
  "number": 0,
  "title": "Le Génocide",
  "description": "L'épisode pilote de MOOSTIK"
}
```

### 2. Ajouter des shots

Chaque shot représente un plan cinématique avec :
- Nom et description
- Type de scène (genocide, survival, training, etc.)
- Personnages impliqués
- Lieu de l'action
- Prompt JSON MOOSTIK

### 3. Vérifier la readiness

Avant de générer, vérifier que les références sont en place :

```bash
POST /api/generate/check-readiness
{
  "episodeId": "ep0",
  "shotIds": ["shot-001", "shot-002"]
}
```

### 4. Lancer la génération

```bash
POST /api/generate/batch
{
  "episodeId": "ep0",
  "maxParallelShots": 3
}
```

## Pages principales

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/` | Vue d'ensemble |
| Épisode | `/episode/[id]` | Détail d'un épisode |
| Personnages | `/characters` | Galerie personnages |
| Territoires | `/locations` | Galerie lieux |
| Bibliothèque | `/library` | Toutes les images |
| Références | `/references` | Gestion des références |
| Lore | `/lore` | Bible de l'univers |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - Structure technique du projet
- [JSON MOOSTIK Standard](docs/JSON-MOOSTIK-STANDARD.md) - Format de prompt officiel
- [Pipeline de Génération](docs/GENERATION-PIPELINE.md) - Workflow de génération

## Scripts utiles

```bash
# Build production
npm run build

# Linter
npm run lint

# Type check
npx tsc --noEmit
```

## Licence

Projet privé - Tous droits réservés.

---

*"Du génocide à la vengeance, le sang appelle le sang."* - Moostik Lore
