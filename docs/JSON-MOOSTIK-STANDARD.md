# JSON MOOSTIK - Standard Constitutionnel

## Introduction

Le **JSON MOOSTIK** est le format de prompt officiel pour toute génération d'image dans l'univers Moostik. C'est la **référence constitutionnelle** que tout prompt doit suivre.

## Structure complète

```typescript
interface JsonMoostik {
  task: "generate_image";
  deliverable: {
    type: "cinematic_still" | "character_sheet" | "location_establishing" | "action_shot";
    aspect_ratio: "16:9" | "21:9" | "4:3" | "1:1";
    resolution: "2K" | "4K" | "8K";
  };
  goal: string;                    // Objectif narratif du shot
  invariants: string[];            // Règles stylistiques globales
  subjects: JsonMoostikSubject[];  // Personnages/éléments principaux
  scene: {
    location: string;
    time: string;
    atmosphere: string[];
    materials: string[];
  };
  composition: {
    framing: "extreme_wide" | "wide" | "medium" | "close" | "extreme_close" | "macro";
    layout: string;
    depth: string;
  };
  camera: {
    format: string;
    lens_mm: number;
    aperture: string;
    angle: string;
  };
  lighting: {
    key: string;
    fill: string;
    rim: string;
    notes: string;
  };
  text: {
    strings: string[];
    font_style: string;
    rules: string;
  };
  negative: string[];              // Éléments à éviter
}
```

## Subject avec référence

```typescript
interface JsonMoostikSubject {
  id: string;                      // ID du personnage
  name?: string;                   // Nom du personnage
  priority: number;                // Ordre d'importance (1 = principal)
  description: string;             // Description visuelle détaillée
  importance?: "primary" | "secondary" | "background";
  action?: string;                 // Action en cours
  reference_image?: string;        // URL de l'image de référence
}
```

## Invariants MOOSTIK

Ces règles stylistiques sont **toujours** incluses dans chaque prompt :

```typescript
const MOOSTIK_INVARIANTS = [
  "Pixar-dark aesthetic with dramatic lighting",
  "Mosquitoes with exaggerated long proboscis as defining feature",
  "Renaissance-inspired architecture at micro scale",
  "Medieval technology level (candles, parchment, chitin weapons)",
  "Color palette: deep crimsons, warm ambers, midnight blues",
  "Humans are always Black/Ebony/Antillean appearance",
  "Mosquitoes are minuscule compared to humans (1/1000 scale)",
  "Bioluminescent elements for lighting",
  "Intricate chitin textures on all mosquito structures"
];
```

## Prompt négatif standard

```typescript
const MOOSTIK_NEGATIVE_PROMPT = [
  "cartoon style",
  "anime style", 
  "2D illustration",
  "flat colors",
  "simple background",
  "white mosquitoes",
  "realistic mosquitoes",
  "modern technology",
  "electric lights",
  "white/asian humans",
  "oversized mosquitoes",
  "cute mosquitoes",
  "friendly appearance"
];
```

## Exemple complet

```json
{
  "task": "generate_image",
  "deliverable": {
    "type": "cinematic_still",
    "aspect_ratio": "16:9",
    "resolution": "4K"
  },
  "goal": "Capturer l'héroïsme tragique de la mère protégeant son enfant",
  "invariants": [
    "Pixar-dark aesthetic with dramatic lighting",
    "Mosquitoes with exaggerated long proboscis as defining feature",
    "Renaissance-inspired architecture at micro scale",
    "Color palette: deep crimsons, warm ambers, midnight blues"
  ],
  "subjects": [
    {
      "id": "mama-dorval",
      "name": "Mama Dorval",
      "priority": 1,
      "description": "Female mosquito, aged appearance, protective stance, worn wings spread wide, deep amber eyes filled with determination",
      "importance": "primary",
      "action": "Shielding baby with her wings",
      "reference_image": "https://example.com/mama-dorval-ref.png"
    },
    {
      "id": "baby-dorval",
      "name": "Baby Dorval",
      "priority": 2,
      "description": "Infant mosquito, small fragile body, oversized eyes showing fear, translucent wing buds",
      "importance": "primary",
      "action": "Cowering under mother's protection",
      "reference_image": "https://example.com/baby-dorval-ref.png"
    }
  ],
  "scene": {
    "location": "Tire City - Village central",
    "time": "Daylight filtered through tropical leaves",
    "atmosphere": [
      "Toxic chemical haze approaching",
      "Volumetric lighting",
      "Dust particles in air"
    ],
    "materials": ["Chitin", "Silk", "Resin", "Dried leaves"]
  },
  "composition": {
    "framing": "close",
    "layout": "Golden ratio",
    "depth": "Layered foreground and background"
  },
  "camera": {
    "format": "Anamorphic",
    "lens_mm": 50,
    "aperture": "f/2.8",
    "angle": "close up"
  },
  "lighting": {
    "key": "Harsh tropical sun filtering through leaves",
    "fill": "Greenish bounce from foliage",
    "rim": "High contrast white rim",
    "notes": "Dramatic shadows emphasizing the threat"
  },
  "text": {
    "strings": [],
    "font_style": "none",
    "rules": "No visible text"
  },
  "negative": [
    "cartoon style",
    "anime style",
    "cute mosquitoes",
    "friendly appearance"
  ]
}
```

## Conversion en prompt texte

La fonction `jsonMoostikToPrompt()` convertit le JSON en prompt textuel optimisé pour Nano Banana Pro :

```typescript
function jsonMoostikToPrompt(json: JsonMoostik): string {
  // Construit un prompt cinématique structuré
  // Format: "Brief de DoP" (Directeur de la Photographie)
  
  const sections = [
    `CINEMATIC FRAME: ${json.deliverable.type}`,
    `GOAL: ${json.goal}`,
    `SUBJECTS: ${json.subjects.map(s => s.description).join("; ")}`,
    `SCENE: ${json.scene.location}, ${json.scene.time}`,
    `ATMOSPHERE: ${json.scene.atmosphere.join(", ")}`,
    `CAMERA: ${json.camera.lens_mm}mm ${json.camera.format}, ${json.camera.aperture}`,
    `COMPOSITION: ${json.composition.framing} shot, ${json.composition.layout}`,
    `LIGHTING: Key: ${json.lighting.key}, Fill: ${json.lighting.fill}, Rim: ${json.lighting.rim}`,
    `STYLE: ${json.invariants.join(". ")}`,
  ];
  
  return sections.join(". ");
}
```

## Bonnes pratiques

### 1. Toujours spécifier le `goal`
Le goal donne le contexte narratif et émotionnel du shot.

### 2. Prioriser les subjects
Utiliser `priority: 1` pour le sujet principal, `2` pour les secondaires.

### 3. Inclure les `reference_image`
Le système injecte automatiquement les URLs des références validées.

### 4. Adapter le `framing` à l'angle
| CameraAngle | Framing |
|-------------|---------|
| extreme_wide | extreme_wide |
| wide | wide |
| medium | medium |
| close_up | close |
| extreme_close_up | extreme_close |
| macro | macro |

### 5. Ne pas oublier le `negative`
Le prompt négatif évite les dérives stylistiques.

## Création d'un prompt vide

```typescript
import { createEmptyJsonMoostik } from "@/lib/json-moostik-standard";

const json = createEmptyJsonMoostik();
// Retourne un objet JsonMoostik avec toutes les valeurs par défaut
```

## Validation

Avant la génération, le système vérifie :
- Que tous les champs requis sont présents
- Que les `reference_image` des subjects sont valides (si fournis)
- Que l'`aspect_ratio` est supporté
- Que les `invariants` incluent les règles MOOSTIK de base
