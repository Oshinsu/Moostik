# Architecture MOOSTIK - SOTA Janvier 2026

## Vue d'ensemble

MOOSTIK est un générateur d'images automatisé pour la série animée éponyme, utilisant l'API Replicate avec le modèle `google/nano-banana-pro`.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MOOSTIK ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│   │   UI     │───▶│   API    │───▶│ Services │───▶│ Replicate│     │
│   │ (Next.js)│    │ (Routes) │    │  (Lib)   │    │   API    │     │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘     │
│        │               │               │                            │
│        ▼               ▼               ▼                            │
│   ┌──────────────────────────────────────────────────────────┐     │
│   │                    DATA LAYER                             │     │
│   │  characters.json  │  locations.json  │  episodes/*.json  │     │
│   └──────────────────────────────────────────────────────────┘     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Structure des dossiers

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── characters/    # CRUD personnages
│   │   ├── episodes/      # CRUD épisodes + clusters
│   │   ├── generate/      # Génération d'images
│   │   │   ├── batch/     # Génération par lots
│   │   │   └── check-readiness/  # Validation pré-génération
│   │   ├── locations/     # CRUD lieux
│   │   └── references/    # Gestion des références
│   ├── characters/        # Page personnages
│   ├── episode/[id]/      # Page épisode détaillé
│   ├── library/           # Bibliothèque d'images
│   ├── locations/         # Page territoires
│   ├── lore/              # Bible du lore
│   └── references/        # Gestion des références
│
├── components/            # Composants React
│   ├── ui/               # shadcn/ui components
│   ├── shared/           # Composants partagés
│   └── [feature]/        # Composants par feature
│
├── contexts/             # React Contexts
│   └── MoostikContext.tsx
│
├── data/                 # Données statiques
│   ├── characters.data.ts
│   ├── locations.data.ts
│   ├── invariants.ts     # Règles stylistiques globales
│   ├── camera-angles.ts
│   └── prompt-helpers.ts
│
├── hooks/                # Custom React hooks
│   ├── useCharacters.ts
│   ├── useEpisodes.ts
│   └── useLocations.ts
│
├── lib/                  # Services et utilitaires
│   ├── api/              # Client API
│   ├── ep0-generator.ts  # Générateur EP0
│   ├── json-moostik-standard.ts  # Standard constitutionnel
│   ├── reference-resolver.ts     # Résolution des références
│   ├── replicate.ts      # Client Replicate API
│   ├── scene-cluster-manager.ts  # Gestionnaire de clusters
│   └── storage.ts        # Opérations fichiers
│
├── styles/               # Styles et thème
│   └── moostik-theme.ts
│
└── types/                # Types TypeScript
    ├── index.ts          # Export centralisé
    ├── episode.ts        # Episode, Shot, Variation, Act
    ├── character.ts      # Character, relationships
    ├── location.ts       # Location
    ├── prompt.ts         # MoostikPrompt, CameraAngle
    ├── scene-cluster.ts  # SceneCluster, références
    └── moostik.ts        # Fichier de compatibilité
```

## Types principaux

### Episode & Shot

```typescript
interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  shots: Shot[];
  acts?: Act[];           // Actes narratifs
  createdAt: string;
  updatedAt: string;
}

interface Shot {
  id: string;
  number: number;
  name: string;
  description: string;
  sceneType: SceneType;
  prompt: MoostikPrompt;  // ou JsonMoostik
  variations: Variation[];
  status: ShotStatus;
  characterIds: string[];
  locationIds: string[];
}

interface Variation {
  id: string;
  cameraAngle: CameraAngle;
  status: VariationStatus;
  imageUrl?: string;
  localPath?: string;
}
```

### Scene Clusters

```typescript
interface SceneCluster {
  id: string;
  name: string;
  type: "location" | "characters" | "act" | "sequence";
  shotIds: string[];
  sharedCharacterIds: string[];
  sharedLocationIds: string[];
  referenceImages: ClusterReferenceMap;
  coherenceRules: CoherenceRules;
}

interface ClusterReferences {
  characters: CharacterReference[];
  locations: LocationReference[];
  allImageUrls: string[];  // Max 14 pour Nano Banana Pro
  totalCount: number;
  validatedCount: number;
  warnings: string[];
}
```

## Services clés

### 1. ReferenceResolver (`src/lib/reference-resolver.ts`)

Responsable de la résolution et priorisation des images de référence.

```typescript
// Résout les références pour un shot
const refs = await resolveReferencesForShot(characterIds, locationIds);

// Vérifie si prêt pour la génération
const readiness = await checkGenerationReadiness(shots);

// Enrichit un prompt avec les références
const { prompt, references } = await enrichPromptWithReferences(prompt, charIds, locIds);
```

**Priorisation des références :**
1. Références validées (personnages puis lieux)
2. Références non-validées (si fallback activé)
3. Images secondaires (après les primaires)
4. Maximum 14 images (limite Nano Banana Pro)

### 2. SceneClusterManager (`src/lib/scene-cluster-manager.ts`)

Analyse les épisodes et crée des clusters cohérents.

```typescript
// Analyse complète d'un épisode
const analysis = await analyzeEpisode(episode);
// Returns: { clusters, actClusters, locationClusters, characterClusters }

// Résout les références pour un cluster entier
const clusterRefs = await resolveClusterReferences(cluster, shots);

// Prépare les shots pour génération groupée
const prepared = await prepareShotsForClusterGeneration(cluster, shots);
```

**Types de clusters :**
- `act` : Basé sur les actes narratifs
- `location` : Shots consécutifs au même lieu
- `characters` : Shots partageant les mêmes personnages
- `sequence` : Séquence continue (génération séquentielle)

### 3. Replicate Client (`src/lib/replicate.ts`)

Interface avec l'API Replicate pour la génération d'images.

```typescript
// Génération unique
const result = await generateVariation(prompt, angle, episodeId, shotId, variationId, referenceImages);

// Génération par lots
const results = await generateShotVariations(prompt, variations, episodeId, shotId, onProgress, referenceImages);

// Génération multi-shots parallèle
const allResults = await generateMultipleShotsParallel(shots, episodeId, maxParallel, onProgress);
```

## Flux de données

### Génération d'images

```
1. UI déclenche génération
        │
        ▼
2. POST /api/generate/batch
        │
        ▼
3. checkGenerationReadiness(shots)
        │ ─── Warnings? ───▶ Log warnings
        ▼
4. Pour chaque shot:
   │
   ├─▶ resolveReferencesForShot(charIds, locIds)
   │
   ├─▶ enrichPromptWithReferences(prompt, refs)
   │
   └─▶ Construire ParallelShotGeneration {
         shotId, prompt, variations, referenceImages
       }
        │
        ▼
5. generateMultipleShotsParallel(shots, episodeId)
        │
        ├─▶ Batches de maxParallelShots (défaut: 3)
        │
        └─▶ Pour chaque shot: generateShotVariations()
                │
                └─▶ Pour chaque variation: generateVariation()
                        │
                        └─▶ Replicate API
        │
        ▼
6. Sauvegarder les résultats + mettre à jour statuts
        │
        ▼
7. Retourner stats de génération
```

## API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/episodes` | GET/POST | Liste/Création d'épisodes |
| `/api/episodes/[id]` | GET/PUT/DELETE | CRUD épisode |
| `/api/episodes/[id]/clusters` | GET | Analyse des clusters |
| `/api/episodes/[id]/shots` | GET/POST | CRUD shots |
| `/api/generate` | POST | Génération single |
| `/api/generate/batch` | POST | Génération par lots |
| `/api/generate/check-readiness` | POST | Validation pré-génération |
| `/api/characters` | GET/PUT | CRUD personnages |
| `/api/locations` | GET/PUT | CRUD lieux |
| `/api/references` | GET/POST | Gestion références |

## Bonnes pratiques

1. **Toujours valider avant génération** - Utiliser `check-readiness` pour identifier les références manquantes

2. **Utiliser les clusters** - Grouper les shots par lieu/personnages pour une cohérence visuelle

3. **Respecter le standard JSON MOOSTIK** - Voir `docs/JSON-MOOSTIK-STANDARD.md`

4. **Valider les références** - Marquer les références comme `validated: true` une fois approuvées

5. **Limiter les références** - Maximum 14 images par génération (limite Nano Banana Pro)
