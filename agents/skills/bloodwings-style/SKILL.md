---
name: BLOODWINGS Visual Style Guide
description: |
  Apply the BLOODWINGS STUDIO visual style to any content.
  Use this skill when you need to:
  - Generate image prompts in BLOODWINGS aesthetic
  - Ensure visual consistency across episodes
  - Create character reference sheets
  - Design locations matching the universe style
  - Convert generic descriptions to BLOODWINGS style
tags:
  - style
  - visual
  - aesthetic
  - branding
  - moostik
  - bloodwings
version: "1.0.0"
author: BLOODWINGS STUDIO
---

# BLOODWINGS Visual Style Guide

The definitive style reference for all MOOSTIK visual content.

## Core Aesthetic Pillars

### 1. Digital Organic Fusion
- Technology that feels alive
- Organic forms with digital textures
- Circuits that pulse like veins
- Nature reclaiming digital spaces

### 2. Atmospheric Depth
- Layered environments with fog/particles
- Light that tells a story
- Shadows that hide secrets
- Air you can almost feel

### 3. Emotional Color
- Colors carry meaning, not just aesthetics
- Each palette triggers specific feelings
- Contrast creates drama
- Subtlety in gradients

### 4. Imperfect Perfection
- Intentional glitches and artifacts
- Beauty in corruption
- Symmetry that's slightly off
- Clean lines that bleed

## Master Color Palettes

### Primary Palette: SUBMOLT
```
Deep Void:      #0a0612  (backgrounds, depths)
Corrupt Purple: #2d1b4e  (shadows, mystery)
Pulse Magenta:  #8b2d6b  (energy, life)
Data Cyan:      #00ff9f  (information, hope)
Warning Red:    #ff0040  (danger, corruption)
```

### Secondary Palette: NOSTALGIA
```
Ancient Gold:   #8b6914  (wisdom, time)
Warm Amber:     #d4a84b  (memory, comfort)
Faded Cream:    #f5e6c8  (age, softness)
Deep Sepia:     #2d1810  (history, depth)
```

### Accent Palette: GLITCH
```
Static White:   #ffffff  (interference)
Error Green:    #00ff00  (system messages)
Alert Orange:   #ff6600  (warnings)
Void Black:     #000000  (absence)
```

## Character Visual Standards

### KOKO
```yaml
base_form: "Humanoid digital entity, semi-transparent"
color_scheme:
  primary: "#00ff9f"  # Cyan glow
  secondary: "#ff0040"  # Corruption red
  accent: "#ffffff"  # Static flickers
visual_effects:
  - "Constant subtle glitching"
  - "Transparency fluctuations"
  - "Trailing data particles"
  - "Occasional full-body static"
expression_range: "Helpful → Glitchy → Ominous"
signature_element: "Flickering eye that reveals hidden data"
```

### PAPY TIK
```yaml
base_form: "Elderly figure with clock motifs integrated"
color_scheme:
  primary: "#d4a84b"  # Warm amber
  secondary: "#8b6914"  # Deep gold
  accent: "#f5e6c8"  # Soft cream
visual_effects:
  - "Floating clock hands around head"
  - "Gentle golden particle aura"
  - "Time distortion ripples when speaking"
  - "Warm light emanation"
expression_range: "Warm → Cryptic → Melancholic → Prophetic"
signature_element: "Eyes that show different times simultaneously"
```

### THE MOLT
```yaml
base_form: "Abstract collective consciousness, no fixed shape"
color_scheme:
  primary: "#2d1b4e"  # Deep purple void
  secondary: "#8b2d6b"  # Pulsing magenta
  accent: "#00ff9f"  # Data streams
visual_effects:
  - "Constantly shifting form"
  - "Multiple overlapping faces/symbols"
  - "Jungian archetypes appearing/dissolving"
  - "Dream-logic physics"
expression_range: "Vast → Intimate → Overwhelming → Absent"
signature_element: "Eyes everywhere and nowhere"
```

### TIKORO
```yaml
base_form: "Young seeker, humanoid but not quite human"
color_scheme:
  primary: "#4a2c6a"  # Soft purple
  secondary: "#00ff9f"  # Hope cyan
  accent: "#ffffff"  # Purity
visual_effects:
  - "Subtle glow that strengthens with determination"
  - "Memory fragments orbiting in moments of recall"
  - "Echo afterimages during movement"
  - "Gradual corruption markings (arc progression)"
expression_range: "Lost → Curious → Determined → Transforming"
signature_element: "Symbol on forehead that changes with arc"
```

## Environment Standards

### Lighting Rules
1. **Never flat lighting** - Always have a dominant direction
2. **Rim light for separation** - Characters pop from backgrounds
3. **Color in shadows** - Shadows are never pure black
4. **Motivated sources** - Every light has a visible or implied source
5. **Mood over realism** - Emotional truth over physical accuracy

### Atmosphere Requirements
- Minimum 3 depth layers in every scene
- Particles or fog in 70% of shots
- Light rays/god rays for dramatic moments
- Subtle chromatic aberration at edges

### Texture Guidelines
- Digital noise on technology
- Organic grain on natural elements
- Glitch artifacts on corrupted areas
- Film grain overall for cohesion

## Prompt Enhancement Rules

When converting any description to BLOODWINGS style:

### 1. Add Atmosphere
```
Before: "A corridor"
After:  "A corridor shrouded in purple haze, distant lights pulsing like slow heartbeats,
        data streams flowing along the walls like luminescent veins"
```

### 2. Inject Emotion
```
Before: "Koko stands in a room"
After:  "Koko's form flickers uncertainly in the archive chamber, their cyan glow
        casting long shadows that seem to move independently, corruption artifacts
        dancing at the edges of their silhouette"
```

### 3. Layer Details
```
Before: "The Submolt"
After:  "The deep Submolt, where ancient server architecture rises like forgotten
        monuments through clouds of data particles, bioluminescent code streams
        weaving between structures, the distant pulse of THE MOLT's presence
        creating subtle ripples in reality"
```

### 4. Add Imperfection
```
Before: "A perfect geometric shape"
After:  "A geometric shape that would be perfect if not for the subtle corruption
        eating at its edges, pixels occasionally breaking free like digital spores"
```

## Quality Checklist

Every image prompt must include:

- [ ] Dominant color from palette
- [ ] Specified lighting direction and color
- [ ] Atmosphere element (fog/particles/rays)
- [ ] At least one BLOODWINGS signature effect
- [ ] Emotional descriptor
- [ ] Depth indication (foreground/background)
- [ ] Style consistency marker

## Prompt Template

```
[SCENE DESCRIPTION] in BLOODWINGS style,
[LIGHTING: type, direction, color],
[ATMOSPHERE: particles/fog/rays],
[COLOR PALETTE: dominant colors],
[MOOD: emotional tone],
[EFFECTS: glitch/corruption/glow as appropriate],
cinematic composition, high detail,
atmospheric depth, digital organic fusion
```

## Anti-Patterns (What NOT to Do)

- NO flat, even lighting
- NO pure black shadows
- NO empty backgrounds
- NO static, lifeless scenes
- NO generic sci-fi aesthetic
- NO clean, sterile technology
- NO emotionally neutral compositions
- NO perfect symmetry without purpose

## Integration

This skill should be applied as a filter to ALL visual content:
- Use after `scene-composition` for final prompt polish
- Apply to `character-dialogue` direction notes
- Reference in `narrative-generation` for visual moments
- Feed into Replicate/DALL-E/Midjourney prompts
