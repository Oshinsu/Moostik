# MOOSTIK - Guide du Gigantisme (POV Moostik)

## Concept Fondamental

Les Moostiks sont **MICROSCOPIQUES**. Depuis leur point de vue, le monde humain est un univers de titans et de paysages colossaux. Ce guide définit comment représenter cette échelle dans chaque image.

---

## Principe du POV Moostik

### Règle d'Or

```
Tout élément du monde humain doit apparaître COLOSSAL 
depuis la perspective d'un moustique.
```

### Ratio d'Échelle

- Un Moostik = taille d'une poussière
- Un humain = taille d'une montagne
- Une main humaine = taille d'un continent
- Un doigt = taille d'un gratte-ciel

---

## Gigantism Cues par Type de Scène

### Scènes Intérieures (Maisons, Bars)

```typescript
const INTERIOR_GIGANTISM = [
  "furniture legs appear as towering architectural columns",
  "table surface stretches like an infinite plain",
  "carpet fibers form a dense, shaggy tundra landscape",
  "lamp light appears as a distant sun or moon",
  "electrical outlets gape like cave entrances",
  "baseboards tower like fortress walls",
  "dust bunnies tumble like slow-moving boulders",
  "a single crumb appears as a weathered rock formation",
  "book spines form canyon walls on shelves",
  "glass surfaces reflect like frozen lakes",
];
```

### Scènes Extérieures (Jardins, Nature)

```typescript
const EXTERIOR_GIGANTISM = [
  "grass blades tower like green skyscrapers",
  "raindrops fall like massive meteors",
  "puddles spread like vast inland seas",
  "pebbles rise like mountain peaks",
  "flower petals serve as landing platforms",
  "tree bark forms cliff face terrain",
  "dew drops cling like spherical lakes",
  "fallen leaves are vast canopies",
  "ant trails are highways",
  "spider webs are architectural wonders",
];
```

### Scènes avec Humains (Le Danger)

```typescript
const HUMAN_AS_TERRAIN = [
  "human ear looms as a canyon cliff face",
  "human hand approaches as a slow-moving wall of doom",
  "human fingers rise as colossal pillars",
  "skin pores appear as tiny craters",
  "hair strands hang like massive cables",
  "eyelashes curve like fallen tree trunks",
  "human breath creates hurricane winds",
  "human voice thunders like earthquakes",
  "fingerprints form terrain ridges",
  "skin texture shows continental patterns",
];
```

---

## Les Humains comme Terrain

### Règle Fondamentale

```
Les humains ne sont JAMAIS des personnages dans les scènes Moostik.
Ils sont des ÉLÉMENTS DE TERRAIN - des catastrophes naturelles ambulantes.
```

### Comment Représenter les Humains

| Partie du Corps | Représentation |
|-----------------|----------------|
| **Oreille** | Falaise canyon, paysage rocheux |
| **Main** | Mur mobile, menace écrasante |
| **Doigts** | Piliers, colonnes |
| **Peau** | Terrain avec cratères (pores) |
| **Cheveux** | Câbles, lianes |
| **Souffle** | Ouragan, tempête |
| **Voix** | Tonnerre, séisme |

### Ce qu'il NE FAUT PAS faire

```
- Montrer des visages humains complets dans les scènes Moostik
- Donner aux humains des expressions lisibles
- Faire interagir humains et Moostiks comme égaux
- Montrer les humains à une échelle réaliste
```

---

## Indices Visuels d'Échelle

### Textures Révélatrices

1. **Tissu** → Fils visibles comme des troncs d'arbres
2. **Bois** → Grain visible comme des canyons
3. **Métal** → Rayures comme des routes
4. **Verre** → Imperfections comme des paysages lunaires
5. **Papier** → Fibres comme des branchages

### Particules Atmosphériques

```
- Poussières : Dérivent comme des astéroïdes
- Pollen : Flotte comme des méduses géantes
- Vapeur : Nuages à l'échelle d'un orage
- Fumée : Formations nuageuses massives
```

### Profondeur de Champ

```
- Utiliser une profondeur de champ courte
- Premier plan : Textures micro ultra-détaillées
- Arrière-plan : Flou atmosphérique suggérant distance immense
```

---

## Exemples Pratiques

### Scène : Village Moostik dans un Pneu

```json
{
  "gigantism_cues": [
    "tire tread patterns form deep canyon valleys",
    "rubber texture shows micro-craters and ridges",
    "trapped rainwater pools like small lakes",
    "lint caught in treads forms vegetation",
    "steel belts visible like buried infrastructure"
  ]
}
```

### Scène : Bar Ti Sang (dans une cannette)

```json
{
  "gigantism_cues": [
    "aluminum ridges form architectural features",
    "condensation droplets cling like decorative spheres",
    "label ink patterns become wall murals",
    "pull tab opening gapes like a grand entrance",
    "remaining liquid pools as a central pond"
  ]
}
```

### Scène : Attaque BYSS

```json
{
  "gigantism_cues": [
    "spray droplets fall like toxic rain",
    "aerosol nozzle looms as a volcano",
    "mist cloud spreads as apocalyptic fog",
    "can surface reflects like a metal sky",
    "child's fingers grip like continental plates"
  ]
}
```

---

## Intégration dans les Prompts

### Structure JSON

```json
{
  "scene_graph": {
    "environment": {
      "space": "Description of the location",
      "gigantism_cues": [
        "cue 1",
        "cue 2",
        "cue 3"
      ],
      "mood": "atmospheric description"
    }
  }
}
```

### Injection Automatique

Le système `moostik-context.ts` injecte automatiquement les gigantism cues appropriés selon le type de scène :

```typescript
const cues = getGigantismCues(context, "interior"); // ou "exterior", "human_interaction"
```

---

## Checklist Gigantisme

Avant de valider une image, vérifier :

- [ ] Au moins 3 indices d'échelle visibles
- [ ] Textures micro-détaillées au premier plan
- [ ] Humains traités comme terrain (si présents)
- [ ] Profondeur atmosphérique suggérant grande distance
- [ ] Particules (poussière, pollen) à l'échelle appropriée
- [ ] Pas de proportions réalistes humain/Moostik

---

## Erreurs Courantes à Éviter

1. **Moostiks trop grands** → Doivent sembler microscopiques
2. **Humains à échelle normale** → Doivent sembler COLOSSAUX
3. **Pas d'indices de texture** → Ajouter fibres, grains, cratères
4. **Proportions réalistes** → Tout doit être exagéré
5. **Humains avec expressions** → Garder comme terrain anonyme

---

*Guide de référence - MOOSTIK SOTA Janvier 2026*
