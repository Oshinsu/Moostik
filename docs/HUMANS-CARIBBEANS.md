# MOOSTIK - Guide des Humains Caribéens

## Règle Fondamentale

```
TOUS les humains dans l'univers MOOSTIK sont 
ANTILLAIS / CARIBÉENS / MARTINIQUAIS.

Aucune exception.
```

---

## Contexte Narratif

L'histoire de MOOSTIK se déroule en **Martinique**, dans les Antilles françaises. Les humains représentés sont les habitants locaux - une population majoritairement d'origine africaine avec une culture créole riche.

---

## Caractéristiques Physiques OBLIGATOIRES

### Teint de Peau

```
Ebony / Dark skin
- Tons chauds sous la surface (subsurface scattering)
- PAS de peau claire, blanche, ou asiatique
- Reflets cuivrés en lumière chaude
- Ombres pourpres/bleutées
```

### Rendu Technique

```typescript
const SKIN_RENDERING = {
  base: "deep ebony with warm undertones",
  sss: "subsurface scattering showing warm red/orange under surface",
  highlights: "warm copper/amber reflections",
  shadows: "cool purple/teal shadows for contrast",
  texture: "natural skin texture, pores, micro-details"
};
```

---

## Style de Représentation

### Style Pixar (OBLIGATOIRE)

```
- Proportions stylisées (pas photoréalistes)
- Yeux expressifs légèrement agrandis
- Formes arrondies et accueillantes
- Expressions lisibles
- Qualité feature film
```

### Ce qui est INTERDIT

```
- Style photoréaliste
- Style anime/cartoon
- Proportions réalistes exactes
- Traits européens ou asiatiques
- Peau claire
```

---

## L'Enfant Tueur (Child Killer)

### Description Standard

```json
{
  "name": "L'Enfant au BYSS",
  "description": "5-year-old Caribbean child, ebony dark skin with warm subsurface scattering, soft rounded Pixar-style features, innocent playful demeanor, unaware of the genocide they cause",
  "details": [
    "Round cherubic face",
    "Large curious eyes",
    "Short curly black hair",
    "Chubby cheeks",
    "Innocent smile (when visible)",
    "Pixar-stylized proportions"
  ]
}
```

### Intention Narrative

L'enfant est **innocent**. Il ne sait pas qu'il commet un génocide. C'est cette innocence qui rend la scène tragique - le contraste entre le jeu d'un enfant et la destruction massive qu'il cause sans le savoir.

### Représentation Visuelle

```
FAIRE:
- Montrer des mains potelées d'enfant
- Montrer des silhouettes de jeu
- Suggérer l'innocence par le langage corporel

NE PAS FAIRE:
- Montrer l'enfant comme un méchant
- Donner des expressions malveillantes
- Montrer le visage complet dans les scènes Moostik
```

---

## Humains depuis le POV Moostik

### Règle du Terrain

Dans les scènes à l'échelle Moostik, les humains ne sont pas des personnages - ils sont des **éléments de terrain**, des **catastrophes naturelles**.

### Ce qu'on Montre

| Élément | Représentation |
|---------|----------------|
| **Mains** | Montagnes mobiles, murs de destruction |
| **Pieds** | Tremblements de terre |
| **Silhouettes** | Monolithes menaçants |
| **Parties du corps** | Paysages géologiques |

### Ce qu'on NE Montre PAS

```
- Visages complets dans les scènes Moostik
- Expressions lisibles à grande échelle
- Humains comme personnages interactifs
- Proportions réalistes
```

---

## Scènes Humaines (Échelle Normale)

Dans les rares scènes à échelle humaine (sans Moostiks), les humains peuvent être montrés normalement, mais toujours :

```
- Caribéens / Antillais / Martiniquais
- Style Pixar
- Peau ébène
- Contexte tropical/caribéen
```

---

## Exemples de Prompts

### Mains d'Enfant (Scène du Spray)

```json
{
  "subjects": [{
    "name": "L'Enfant au BYSS",
    "description": "Pixar-stylized 5-year-old Antillean Caribbean child hands ONLY on scene, ebony dark skin with warm subsurface scattering, soft rounded Pixar-style fingers with visible knuckle creases, holding BYSS aerosol can, cropped at wrist NO face visible, innocent playful grip, warm tropical lighting"
  }]
}
```

### Silhouette d'Enfant (Arrière-plan)

```json
{
  "subjects": [{
    "name": "Child Shadow",
    "description": "Massive silhouette of Caribbean child in background, COLOSSAL scale from Moostik POV, playful posture, casting long shadow over village, tropical afternoon light creating dark outline"
  }]
}
```

---

## Contraintes Techniques

### must_include (Humains)

```json
{
  "constraints": {
    "must_include": [
      "Antillean/Caribbean/Martiniquais humans ONLY",
      "ebony dark skin with warm subsurface scattering",
      "Pixar-stylized proportions"
    ]
  }
}
```

### must_not_include (Humains)

```json
{
  "constraints": {
    "must_not_include": [
      "white/caucasian humans",
      "asian humans",
      "light-skinned humans",
      "photorealistic humans",
      "human faces in Moostik-scale scenes"
    ]
  }
}
```

---

## Référence Culturelle

### Martinique

- Département français d'outre-mer
- Population majoritairement afro-caribéenne
- Culture créole
- Climat tropical
- Architecture coloniale colorée
- Végétation luxuriante

### Éléments Visuels Caribéens

```
- Couleurs vives des maisons
- Végétation tropicale (bananiers, palmiers)
- Humidité ambiante
- Lumière dorée tropicale
- Jalousies (persiennes) caractéristiques
```

---

## Checklist Humains

- [ ] Peau ébène (pas claire)
- [ ] Subsurface scattering chaud
- [ ] Style Pixar (pas photoréaliste)
- [ ] Traits caribéens
- [ ] Échelle COLOSSALE si scène Moostik
- [ ] Pas de visage si scène Moostik
- [ ] Innocence de l'enfant préservée

---

*Guide de référence - MOOSTIK SOTA Janvier 2026*
