# Pipeline de Génération Vidéo MOOSTIK - SOTA Février 2026

## Vue d'ensemble

Ce document définit les standards et bonnes pratiques pour la génération vidéo dans l'univers MOOSTIK, mis à jour au **1er février 2026**.

## Modèles Vidéo Disponibles sur Replicate

### Tier Premium (Haute Qualité)

| Modèle | Identifiant Replicate | Audio | Durée Max | Résolution | Coût/5s |
|--------|----------------------|-------|-----------|------------|---------|
| **Kling 2.6** | `kwaivgi/kling-v2.6` | ✅ Natif | 10s | 1080p | ~$0.65 |
| **Veo 3.1** | `google/veo-3.1` | ✅ Natif | 8s | 1080p | ~$0.75 |
| **Seedance 1.5 Pro** | `bytedance/seedance-1.5-pro` | ✅ Natif | 10s | 1080p | ~$0.50 |
| **Hailuo 2.3** | `minimax/hailuo-2.3` | ❌ | 10s | 1080p | ~$0.40 |

### Tier Standard (Rapport Qualité/Prix)

| Modèle | Identifiant Replicate | Audio | Durée Max | Résolution | Coût/5s |
|--------|----------------------|-------|-----------|------------|---------|
| **Veo 3.1 Fast** | `google/veo-3.1-fast` | ✅ Natif | 8s | 720p | ~$0.75 |
| **Hailuo 2.3 Fast** | `minimax/hailuo-2.3` | ❌ | 10s | 768p | ~$0.25 |
| **Luma Ray 3** | `luma/ray-3` | ✅ | 10s | 1080p | ~$0.40 |

### Tier Budget (Rapide & Économique)

| Modèle | Identifiant Replicate | Audio | Durée Max | Résolution | Coût/5s |
|--------|----------------------|-------|-----------|------------|---------|
| **Wan 2.6** | `wan-video/wan-2.2-i2v-a14b` | ❌ | 5s | 720p | ~$0.09 |
| **LTX-2** | `lightricks/ltx-video-2` | ✅ | 20s | 4K | ~$0.09 |

## Schémas d'Entrée par Modèle

### Kling 2.6 (`kwaivgi/kling-v2.6`)

```typescript
{
  prompt: string;           // Description texte (requis)
  start_image: string;      // URL image de départ (requis pour I2V)
  duration: number;         // 5 ou 10 secondes
  aspect_ratio: string;     // "16:9", "9:16", "1:1"
  generate_audio: boolean;  // Active l'audio natif
  negative_prompt?: string; // Ce qu'il faut éviter
}
```

**Forces :** Motion brush (6 régions), audio natif sync, excellent pour personnages
**Faiblesses :** Coût élevé, temps de génération ~2-3min

### Veo 3.1 / Veo 3.1 Fast (`google/veo-3.1-fast`)

```typescript
{
  prompt: string;           // Description texte (requis)
  image: string;            // URL image de départ (optionnel)
  duration: number;         // 4, 6 ou 8 secondes
  aspect_ratio: string;     // "16:9", "9:16"
  resolution: string;       // "720p" ou "1080p"
  generate_audio: boolean;  // Audio contextuel automatique
  last_frame?: string;      // Image de fin pour interpolation
  seed?: number;            // Reproductibilité
}
```

**Forces :** Meilleure physique, audio contextuel, first/last frame
**Faiblesses :** Coût élevé, parfois censuré

### Seedance 1.5 Pro (`bytedance/seedance-1.5-pro`)

```typescript
{
  prompt: string;           // Description texte (requis)
  image: string;            // URL image de départ (requis)
  duration: number;         // Jusqu'à 10 secondes
  aspect_ratio: string;     // "16:9", "9:16", "1:1"
  generate_audio: boolean;  // Audio + lip-sync natif
  fps: number;              // 24 ou 30
  camera_fixed?: boolean;   // Caméra fixe ou mobile
  last_frame_image?: string; // Image de fin
}
```

**Forces :** Lip-sync milliseconde, multi-langues (FR inclus), contrôle caméra
**Faiblesses :** Peut être censuré sur contenu violent

### Hailuo 2.3 (`minimax/hailuo-2.3`)

```typescript
{
  prompt: string;              // Description texte (requis)
  first_frame_image: string;   // URL image de départ (requis pour I2V)
  duration: number;            // 6 ou 10 secondes
  resolution: string;          // "768p" ou "1080p" (1080p = 6s max)
  prompt_optimizer: boolean;   // Optimisation auto du prompt
}
```

**Forces :** Excellent pour danse/mouvements complexes, micro-expressions
**Faiblesses :** Pas d'audio, 25fps seulement

## Recommandations par Type de Scène MOOSTIK

### Scènes d'Action/Combat

```typescript
{
  recommended: "hailuo-2.3",
  reason: "Mouvements fluides, expressions faciales",
  alternatives: ["kling-2.6", "seedance-1.5-pro"]
}
```

### Scènes avec Dialogue

```typescript
{
  recommended: "seedance-1.5-pro",
  reason: "Lip-sync natif précis, multi-langues",
  alternatives: ["kling-2.6"]
}
```

### Scènes Cinématiques/Establishing

```typescript
{
  recommended: "veo-3.1",
  reason: "Meilleure qualité visuelle, audio ambient",
  alternatives: ["kling-2.6"]
}
```

### Scènes d'Apocalypse/Effets Spéciaux

```typescript
{
  recommended: "hailuo-2.3-fast",
  reason: "VFX expressifs, flammes/explosions",
  alternatives: ["veo-3.1-fast"]
}
```

## Structure des Prompts Vidéo SOTA

### Format Recommandé

```
[STYLE] [SUJET] [ACTION] [CAMERA] [AUDIO] [AMBIANCE]
```

### Exemple MOOSTIK

```
Pixar-dark 3D animated film, ILM-grade VFX.
SUBJECT: Dorval the mosquito warrior, obsidian exoskeleton, crimson eyes.
ACTION: Draws blood-katana from scabbard, battle stance, intense focus.
CAMERA: Slow dolly zoom on face, rack focus to blade.
AUDIO: Metallic sword draw, wind howling, distant thunder.
ATMOSPHERE: Night, apocalyptic storm, green toxic clouds, volumetric rain.
```

## Intégration avec le Pipeline Image

### Workflow Image → Vidéo

1. **Génération Image** (Nano Banana Pro)
   - Prompt JSON MOOSTIK standard
   - Résolution 4K, aspect 21:9

2. **Validation Image**
   - Score qualité > 70%
   - Conformité DA Bible

3. **Adaptation Prompt Vidéo**
   - Ajout directives mouvement
   - Ajout directives audio
   - Ajout directives caméra

4. **Génération Vidéo**
   - Image source = image générée
   - Provider selon type de scène

5. **Post-traitement**
   - Upload Supabase
   - Mise à jour variation.videoUrl

## API Endpoints

### Génération Batch

```http
POST /api/video/generate-batch
Content-Type: application/json

{
  "episodeId": "t05",
  "maxConcurrent": 5,
  "dryRun": false
}
```

### Réponse

```json
{
  "success": true,
  "processed": 172,
  "successful": 150,
  "failed": 22,
  "actualCost": 65.40,
  "byProvider": {
    "hailuo-2.3-fast": { "count": 76, "cost": 19 },
    "veo-3.1-fast": { "count": 36, "cost": 27 },
    "kling-2.6": { "count": 44, "cost": 28.60 },
    "seedance-1.5-pro": { "count": 16, "cost": 8 }
  }
}
```

## Gestion des Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `first_frame_image required` | Hailuo I2V sans image | Fournir `first_frame_image` |
| `resolution must be 768p/1080p` | Mauvaise casse | Utiliser minuscules |
| `sensitive content` | Contenu flagué | Modifier prompt, éviter violence explicite |
| `rate limited` | Trop de requêtes | Réduire `maxConcurrent`, ajouter délai |
| `model not found` | Mauvais identifiant | Vérifier schéma Replicate |

## Coûts Estimés par Épisode

| Épisode | Shots | Variations | Vidéos | Coût Estimé |
|---------|-------|------------|--------|-------------|
| T0.5 | 43 | 172 | 172 | ~$82.60 |
| EP1 (prévu) | ~60 | ~240 | ~240 | ~$120 |

## Changelog

- **2026-02-02** : Création documentation SOTA
- Ajout Seedance 1.5 Pro (corrigé de 1-lite)
- Schémas d'entrée vérifiés via API Replicate
- Recommandations par type de scène
