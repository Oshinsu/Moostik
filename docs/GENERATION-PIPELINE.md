# Pipeline de Génération MOOSTIK - SOTA Janvier 2026

## Vue d'ensemble

Le pipeline de génération MOOSTIK est conçu pour produire des images cohérentes et cinématiques pour la série animée. Il intègre un système de clustering, de résolution de références, et de validation pré-génération.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PIPELINE DE GÉNÉRATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐│
│  │ Readiness│───▶│ Cluster  │───▶│ Resolve  │───▶│ Enrich   │───▶│Generate││
│  │  Check   │    │ Analysis │    │   Refs   │    │ Prompts  │    │ Images ││
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └────────┘│
│       │              │               │               │               │      │
│       ▼              ▼               ▼               ▼               ▼      │
│   Warnings?     Clusters[]     References[]    JsonMoostik[]    Images[]   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Étape 1 : Validation Readiness

**Endpoint** : `POST /api/generate/check-readiness`

Avant toute génération, le système vérifie que les shots sont prêts.

```typescript
interface GenerationReadinessCheck {
  ready: boolean;                    // Prêt à générer?
  canProceedWithWarnings: boolean;   // Peut continuer malgré warnings?
  warnings: string[];                // Avertissements
  errors: string[];                  // Erreurs bloquantes
  missingCharacterRefs: MissingReference[];
  missingLocationRefs: MissingReference[];
  unvalidatedRefs: MissingReference[];
  stats: {
    totalShots: number;
    totalCharacters: number;
    totalLocations: number;
    charactersWithRefs: number;
    locationsWithRefs: number;
    validatedCharacters: number;
    validatedLocations: number;
  };
}
```

### Critères de validation

| Critère | Type | Description |
|---------|------|-------------|
| Personnage introuvable | ERROR | L'ID du personnage n'existe pas |
| Lieu introuvable | ERROR | L'ID du lieu n'existe pas |
| Pas d'images de référence | WARNING | Personnage/lieu sans images |
| Référence non validée | WARNING | Images présentes mais pas validées |

### Exemple d'utilisation

```typescript
const response = await fetch('/api/generate/check-readiness', {
  method: 'POST',
  body: JSON.stringify({ episodeId: 'ep0', shotIds: ['shot-001', 'shot-002'] })
});

const readiness = await response.json();

if (!readiness.ready && !readiness.canProceedWithWarnings) {
  console.error('Cannot generate:', readiness.errors);
  return;
}

if (readiness.warnings.length > 0) {
  console.warn('Warnings:', readiness.warnings);
}
```

## Étape 2 : Analyse des Clusters

**Endpoint** : `GET /api/episodes/[id]/clusters`

Le système analyse l'épisode et groupe les shots en clusters cohérents.

### Types de clusters

```typescript
type ClusterType = "location" | "characters" | "act" | "sequence";
```

| Type | Description | Règle de cohérence |
|------|-------------|-------------------|
| `act` | Basé sur les actes narratifs | Atmosphère partagée |
| `location` | Shots consécutifs au même lieu | Lighting + atmosphère |
| `characters` | Shots avec mêmes personnages | Cohérence personnages |
| `sequence` | Séquence continue | Génération séquentielle |

### Algorithme de clustering

```
Pour chaque épisode:
  1. Si acts[] définis:
     └─ Créer un cluster par acte (shotIds de l'acte)
     
  2. Scanner les shots séquentiellement:
     └─ Si shot[n].locationId === shot[n-1].locationId:
        └─ Ajouter au cluster location courant
     └─ Sinon:
        └─ Fermer le cluster précédent (si > 1 shot)
        └─ Commencer nouveau cluster location
        
  3. Analyser les personnages partagés:
     └─ Grouper les shots par intersection de characterIds
```

### Structure d'un cluster

```typescript
interface SceneCluster {
  id: string;                      // "act-1", "loc-tire-city-shot-001"
  name: string;                    // "Acte 1: La Paix Avant La Tempête"
  type: ClusterType;
  shotIds: string[];               // Shots dans ce cluster
  sharedCharacterIds: string[];    // Personnages partagés
  sharedLocationIds: string[];     // Lieux partagés
  coherenceRules: {
    mustShareLighting: boolean;    // Même lighting requis
    mustShareAtmosphere: boolean;  // Même atmosphère requise
    sequentialGeneration: boolean; // Génération dans l'ordre
  };
}
```

## Étape 3 : Résolution des Références

**Service** : `src/lib/reference-resolver.ts`

Pour chaque shot, le système résout les images de référence.

### Priorisation

```
1. Personnages validés (image primaire)
2. Lieux validés (image primaire)
3. Personnages non-validés (image primaire) - si fallback activé
4. Lieux non-validés (image primaire) - si fallback activé
5. Images secondaires des personnages
6. Images secondaires des lieux

MAXIMUM: 14 images (limite Nano Banana Pro)
```

### Résultat de résolution

```typescript
interface ClusterReferences {
  characters: CharacterReference[];
  locations: LocationReference[];
  allImageUrls: string[];        // URLs combinées (max 14)
  totalCount: number;
  validatedCount: number;
  warnings: string[];
}
```

## Étape 4 : Enrichissement des Prompts

**Fonction** : `enrichPromptWithReferences()`

Le prompt est enrichi avec les références d'images.

### Avant enrichissement

```json
{
  "subjects": [
    {
      "id": "mama-dorval",
      "name": "Mama Dorval",
      "description": "Female mosquito, aged appearance..."
    }
  ]
}
```

### Après enrichissement

```json
{
  "subjects": [
    {
      "id": "mama-dorval",
      "name": "Mama Dorval",
      "description": "Female mosquito, aged appearance...",
      "reference_image": "https://replicate.delivery/.../mama-dorval.png"
    }
  ]
}
```

## Étape 5 : Génération d'Images

**Endpoint** : `POST /api/generate/batch`

### Flux de génération

```
1. Recevoir { episodeId, shotIds?, maxParallelShots }

2. Filtrer les shots pending/failed

3. Pour chaque shot:
   a. resolveReferencesForShot(characterIds, locationIds)
   b. enrichPromptWithReferences(prompt, refs)
   c. Construire ParallelShotGeneration

4. generateMultipleShotsParallel(shots, episodeId, maxParallel)
   │
   ├─ Batch 1 (3 shots max)
   │   ├─ Shot 1: generateShotVariations() [5 angles]
   │   ├─ Shot 2: generateShotVariations() [5 angles]
   │   └─ Shot 3: generateShotVariations() [5 angles]
   │
   ├─ Batch 2 (3 shots max)
   │   └─ ...
   │
   └─ ...

5. Pour chaque variation:
   - Appeler Replicate API
   - Sauvegarder l'image localement
   - Mettre à jour le statut

6. Retourner stats
```

### Configuration

```typescript
const MAX_PARALLEL_SHOTS = 3;        // Shots en parallèle
const MAX_PARALLEL_GENERATIONS = 5;  // Variations par shot
const GENERATION_DELAY_MS = 500;     // Délai anti rate-limiting
```

### Paramètres Replicate

```typescript
const input = {
  prompt: promptText,
  aspect_ratio: "16:9",
  output_format: "png",
  safety_tolerance: 6,
  prompt_upsampling: true,
  image_input: referenceImages,     // URLs des références (max 14)
};
```

## Monitoring en temps réel

### Callback de progression

```typescript
const onProgress = (
  shotId: string,
  variationId: string,
  status: "generating" | "completed" | "error",
  result?: GenerateImageResult,
  error?: string
) => {
  // Mettre à jour l'UI en temps réel
  updateVariationStatus(shotId, variationId, status);
};
```

### Statuts des variations

```
pending ──▶ generating ──▶ completed
                │
                └──▶ failed
```

## Stockage des images

### Structure des fichiers

```
output/
└── episodes/
    └── ep0/
        ├── shot-001/
        │   ├── wide.png
        │   ├── medium.png
        │   ├── close_up.png
        │   ├── low_angle.png
        │   └── extreme_wide.png
        ├── shot-002/
        │   └── ...
        └── ...
```

### Métadonnées sauvegardées

```typescript
interface Variation {
  id: string;
  cameraAngle: CameraAngle;
  status: VariationStatus;
  imageUrl: string;           // URL Replicate (temporaire)
  localPath: string;          // Chemin local permanent
  generatedAt: string;
  seed?: number;              // Pour reproduction
}
```

## Gestion des erreurs

### Types d'erreurs

| Erreur | Action |
|--------|--------|
| Rate limit Replicate | Retry avec backoff exponentiel |
| Référence introuvable | Warning + continuer sans |
| Erreur réseau | Retry 3x puis fail |
| Prompt trop long | Tronquer automatiquement |

### Retry policy

```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = [1000, 2000, 4000]; // Backoff exponentiel

for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
  try {
    return await generateImage(options);
  } catch (error) {
    if (attempt === MAX_RETRIES - 1) throw error;
    await sleep(RETRY_DELAY_MS[attempt]);
  }
}
```

## Métriques de performance

### Temps moyens

| Opération | Durée |
|-----------|-------|
| Check readiness | ~100ms |
| Analyse clusters | ~50ms |
| Résolution refs | ~200ms |
| Génération image | ~10-30s |
| Sauvegarde locale | ~100ms |

### Optimisations

1. **Parallélisation** : 3 shots × 5 variations = 15 images simultanées max
2. **Cache références** : Références résolues une fois par cluster
3. **Batch updates** : Mises à jour DB groupées
4. **Streaming** : Progression en temps réel via callbacks
