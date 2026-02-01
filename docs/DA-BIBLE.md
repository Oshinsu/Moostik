# MOOSTIK - Bible de Direction Artistique

## Introduction

Ce document définit les règles visuelles et stylistiques **constitutionnelles** de l'univers MOOSTIK. Toute génération d'image ou de vidéo DOIT respecter ces règles.

---

## Style Global

### Look Signature

```
"Pixar-dark" + "Démoniaque Mignon" + "Feature Film Quality"
```

- **Pixar-dark** : L'esthétique Pixar (formes rondes, expressivité, textures riches) mais avec une ambiance sombre et dramatique
- **Démoniaque Mignon** : Les Moostiks sont à la fois adorables et menaçants - yeux expressifs mais corps de prédateurs
- **Feature Film Quality** : Niveau ILM/Weta - PAS une illustration, PAS un concept art, c'est un FRAME FINAL de film $200M

### Qualité Technique

```
- ILM/Weta-grade VFX
- 8K textures
- Subsurface scattering sur matériaux organiques
- Film grain cinématique
- Caractéristiques de lentille anamorphique
- Color grading théâtral (noirs écrasés, hautes lumières chaudes)
```

---

## Palette de Couleurs

### Couleurs Principales

| Couleur | Hex | Usage |
|---------|-----|-------|
| **Obsidian Black** | `#0B0B0E` | Corps des Moostiks, ombres profondes |
| **Blood Red** | `#8B0015` | Accent dramatique, danger |
| **Deep Crimson** | `#B0002A` | Veines des ailes, éclairage clé |
| **Copper** | `#9B6A3A` | Accents métalliques, vieillissement |
| **Warm Amber** | `#FFB25A` | Yeux des Moostiks, lumière bioluminescente |

### Couleurs Secondaires

| Couleur | Hex | Usage |
|---------|-----|-------|
| **Teal Shadow** | `#1A3A3A` | Ombres de contraste |
| **Deep Purple** | `#14131A` | Nuits, zones sombres |
| **Bone White** | `#F5F0E6` | Poussière, particules |

### Règle de Contraste

- **Hautes lumières** : Toujours chaudes (amber, crimson)
- **Ombres** : Toujours froides (teal, purple)
- **Ratio** : 70% tons sombres / 30% accents lumineux

---

## Anatomie Moostik

### Caractéristiques OBLIGATOIRES

1. **Proboscis visible** 
   - Longue trompe acérée comme une aiguille
   - C'est leur SEULE arme
   - DOIT être visible dans chaque image

2. **Yeux expressifs**
   - Grands yeux ambre/orange
   - Expressivité Pixar
   - Reflets chauds

3. **Ailes translucides**
   - Veines crimson visibles
   - Texture délicate
   - Reflets irisés

4. **Corps chitineux**
   - Noir obsidian mat
   - Highlights satin subtils
   - Texture micro-écailles

### Proportions

```
- Tête : 25% du corps (yeux dominants)
- Thorax : 35% (muscles de vol)
- Abdomen : 40% (forme allongée)
- Proboscis : Aussi long que le corps
- Ailes : 150% de la longueur du corps
```

### Échelle

**MICROSCOPIQUE** - Les Moostiks sont de la taille d'une poussière comparés aux humains.

---

## Architecture Moostik

### Style : Renaissance Bio-Organique Gothic

```
- NO architecture humaine dans les scènes Moostik
- Courbes organiques inspirées de l'Art Nouveau
- Structures en chitin et résine
- Voûtes en membrane d'aile
- Colonnes torsadées comme des proboscis
```

### Matériaux Autorisés

| Matériau | Description |
|----------|-------------|
| **Chitin** | Structure principale, noir brillant |
| **Résine** | Transparence ambrée, joints |
| **Membrane d'aile** | Fenêtres, voiles |
| **Fils de soie** | Cordages, tissages |
| **Cire de nectar** | Bougies, joints étanches |
| **Blood-ruby** | Vitraux, gemmes décoratives |

### Matériaux INTERDITS

```
- Métal manufacturé
- Plastique
- Verre moderne
- Béton
- Brique humaine
```

---

## Éclairage

### Sources Autorisées

1. **Lanternes bioluminescentes**
   - Lueur ambre/crimson
   - Pulsation subtile
   - Ombres douces

2. **Bougies de cire de nectar**
   - Flamme chaude
   - Fumée légère
   - Ambiance intime

3. **Vitraux blood-ruby**
   - Rayons colorés
   - Motifs de gouttes de sang

4. **Lumière naturelle filtrée**
   - À travers feuillage (vert)
   - À travers tissu (diffuse)

### Sources INTERDITES

```
- Lumière électrique
- Néons
- Écrans
- LED
- Toute technologie moderne
```

### Presets d'Éclairage

#### Character Sheet
```json
{
  "key": "soft top-front beauty light (#FFB25A)",
  "fill": "low fill from below (#1A0F10)",
  "rim": "strong crimson rim (#B0002A)",
  "notes": "clean studio lighting, no harsh shadows"
}
```

#### Bar/Cantina
```json
{
  "key": "warm amber practicals from lanterns (#FFB25A)",
  "fill": "deep shadow areas (#0B0B0E)",
  "rim": "subtle crimson accent (#8B0015)",
  "notes": "intimate cantina atmosphere, volumetric haze"
}
```

#### Génocide
```json
{
  "key": "violent crimson glow from BYSS spray (#B0002A)",
  "fill": "cool moonlight bounce (#1A1A3A)",
  "rim": "ember sparks and soot particles",
  "notes": "apocalyptic, heavy volumetrics, god-rays through toxic fog"
}
```

---

## Technologie

### Niveau : Médiéval Fantaisie UNIQUEMENT

```
- Bougies et lanternes
- Parchemin et encre
- Armes en proboscis uniquement
- Transport : vol naturel
- Communication : voix et signaux d'ailes
```

### Éléments INTERDITS

```
- Armes à feu
- Véhicules
- Électricité
- Électronique
- Écrans
- Ordinateurs
- Machines
```

---

## Symboles et Motifs

### Clan Sigil : Droplet-Eye

```
- Goutte de sang stylisée
- Œil au centre
- Présent sur sceaux de cire
- Présent sur insignes
```

### Motifs Récurrents

- Formes de gouttes de sang
- Patterns d'ailes
- Ornements de proboscis
- Spirales de vol

### Motifs INTERDITS

```
- Symboles humains
- Texte lisible (sauf spécifié)
- Logos modernes
- Marques commerciales
```

---

## Atmosphère et Particules

### Éléments Atmosphériques par Scène

| Type de Scène | Atmosphère |
|---------------|------------|
| **Paisible** | Humidité chaude, pollen doux, brume de rosée |
| **Tendue** | Brouillard épais, poussière, flou de vibration d'ailes |
| **Apocalyptique** | Brouillard BYSS toxique, particules de braise, suie |
| **Sacrée** | Fumée d'encens, rayons divins, brume éthérée |
| **Bar** | Brume chaude, vapeur de nectar, ombres intimes |

---

## Checklist de Validation

Avant de valider une image, vérifier :

- [ ] Proboscis visible sur tous les Moostiks
- [ ] Palette de couleurs respectée
- [ ] Pas d'architecture humaine dans scènes Moostik
- [ ] Pas de technologie moderne
- [ ] Éclairage bioluminescent/naturel uniquement
- [ ] Humains = Antillais/Caribéens uniquement
- [ ] Qualité feature film (pas illustration)
- [ ] Gigantisme cohérent (échelle micro)

---

## Références Visuelles

### Films de Référence

- **Pixar** : Ratatouille (textures), Coco (éclairage), Soul (ambiance)
- **Laika** : Coraline (atmosphère sombre), Kubo (artisanat)
- **Guillermo del Toro** : Pan's Labyrinth (bio-organique), Crimson Peak (Gothic)

### Artistes de Référence

- **Concept Art** : Aaron Sims, Carlos Huante
- **Éclairage** : Roger Deakins, Emmanuel Lubezki
- **Architecture** : Gaudi, Art Nouveau

---

*Document de référence constitutionnel - MOOSTIK SOTA Janvier 2026*
