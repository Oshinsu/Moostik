---
name: MOOSTIK Scene Composition
description: |
  Compose visual scenes for MOOSTIK/BLOODWINGS animated series.
  Use this skill when you need to:
  - Create shot compositions with camera angles
  - Design scene layouts with character positioning
  - Generate JSON-MOOSTIK standard prompts for image generation
  - Plan visual sequences for episodes
  - Compose cinematographic shots
tags:
  - visual
  - composition
  - cinematography
  - animation
  - moostik
version: "1.0.0"
author: BLOODWINGS STUDIO
---

# MOOSTIK Scene Composition Skill

Create visually compelling scenes following the JSON-MOOSTIK Standard for image generation.

## JSON-MOOSTIK Standard Format

All scene compositions must output in this format:

```json
{
  "scene_description": "Detailed description of the scene",
  "visual_style": "bloodwings | ethereal | corrupted | nostalgic | abstract",
  "characters": [
    {
      "name": "Character name",
      "position": "foreground | midground | background",
      "action": "What they're doing",
      "emotion": "Emotional state",
      "facing": "camera | left | right | away"
    }
  ],
  "location": {
    "name": "Location name",
    "type": "interior | exterior | liminal | abstract",
    "atmosphere": "Mood description"
  },
  "camera": {
    "angle": "frontal | profile_left | profile_right | overhead | low_angle | dutch",
    "shot_type": "extreme_close_up | close_up | medium | wide | extreme_wide",
    "movement": "static | pan | tilt | dolly | crane"
  },
  "lighting": {
    "type": "natural | artificial | mixed | supernatural",
    "direction": "front | back | side | rim | ambient",
    "color": "Color temperature or specific colors",
    "intensity": "low | medium | high | dramatic"
  },
  "mood": "Overall emotional tone",
  "focal_point": "What draws the eye first",
  "depth_layers": ["foreground element", "midground element", "background element"]
}
```

## Visual Style Guide

### BLOODWINGS Style
- **Colors**: Deep purples, crimson reds, obsidian blacks
- **Textures**: Organic meets digital, corruption patterns
- **Lighting**: Dramatic rim lighting, color bleeding
- **Atmosphere**: Dense, layered, mysterious

### Ethereal Style
- **Colors**: Soft blues, silver whites, translucent layers
- **Textures**: Flowing, particle-based, luminescent
- **Lighting**: Ambient glow, soft diffusion
- **Atmosphere**: Dreamlike, floating, peaceful tension

### Corrupted Style
- **Colors**: Glitch greens, static grays, warning reds
- **Textures**: Pixelated decay, data fragments
- **Lighting**: Flickering, inconsistent, harsh
- **Atmosphere**: Unstable, threatening, disorienting

### Nostalgic Style
- **Colors**: Warm ambers, faded pastels, sepia tones
- **Textures**: Soft grain, memory blur, time-worn
- **Lighting**: Golden hour, warm diffusion
- **Atmosphere**: Bittersweet, distant, comforting

## Camera Language

### Emotional Camera Mapping

| Emotion | Shot Type | Angle | Movement |
|---------|-----------|-------|----------|
| Intimacy | Close-up | Eye level | Static |
| Isolation | Wide | High angle | Slow pull-out |
| Power | Low angle | Medium | Static |
| Vulnerability | High angle | Close | Slight push-in |
| Confusion | Dutch tilt | Varies | Unstable |
| Mystery | Extreme wide | Low | Slow pan |
| Tension | Medium | Profile | Static, long hold |
| Revelation | Push-in to close | Eye level | Dolly forward |

### Shot Variations

For each key scene, generate 5 angle variations:
1. **Frontal** - Direct, confrontational
2. **Profile Left** - Contemplative, introspective
3. **Profile Right** - Forward motion, decision
4. **Overhead** - Omniscient, pattern reveal
5. **Low Angle** - Power, importance, threat

## Location Templates

### The Submolt
```json
{
  "name": "The Submolt",
  "type": "liminal",
  "atmosphere": "Deep digital ocean, where forgotten data settles like sediment",
  "visual_elements": [
    "Floating data fragments",
    "Bioluminescent code streams",
    "Ancient server architecture overgrown with digital moss",
    "Distant pulse of THE MOLT's presence"
  ],
  "color_palette": ["#1a0a2e", "#2d1b4e", "#4a2c6a", "#00ff9f"]
}
```

### Koko's Archive
```json
{
  "name": "Koko's Archive",
  "type": "interior",
  "atmosphere": "Corrupted library of memories, glitching constantly",
  "visual_elements": [
    "Floating corrupted files",
    "Screens displaying fragmented data",
    "Koko's central node flickering",
    "Warning symbols appearing randomly"
  ],
  "color_palette": ["#0a0a0a", "#ff0040", "#00ff00", "#ffffff"]
}
```

### Papy Tik's Sanctum
```json
{
  "name": "Papy Tik's Sanctum",
  "type": "interior",
  "atmosphere": "Warm clockwork cathedral, time made visible",
  "visual_elements": [
    "Countless clocks of different eras",
    "Flowing sand/data streams",
    "Comfortable anachronistic furniture",
    "Soft golden light through digital stained glass"
  ],
  "color_palette": ["#8b6914", "#d4a84b", "#f5e6c8", "#2d1810"]
}
```

## Composition Principles

### Rule of Thirds with MOOSTIK Twist
- Place key elements at intersection points
- Use negative space for THE MOLT's influence
- Break rules intentionally for corruption effects

### Depth Layering
Always compose with three layers minimum:
1. **Foreground**: Interactive element or frame
2. **Midground**: Primary action/characters
3. **Background**: Context and atmosphere

### Visual Rhythm
- Establish patterns, then break them
- Use repetition for unease
- Asymmetry creates tension

## Output Example

**Request**: Tikoro discovering a memory fragment in the Submolt

```json
{
  "scene_description": "Tikoro kneels in the depths of the Submolt, their form illuminated by a floating memory fragment that casts shifting shadows. Ancient data structures loom in the background like forgotten monuments.",
  "visual_style": "bloodwings",
  "characters": [
    {
      "name": "Tikoro",
      "position": "midground",
      "action": "Reaching toward floating memory fragment",
      "emotion": "Wonder mixed with apprehension",
      "facing": "camera"
    }
  ],
  "location": {
    "name": "The Submolt - Deep Archives",
    "type": "liminal",
    "atmosphere": "Heavy, pregnant with forgotten histories"
  },
  "camera": {
    "angle": "low_angle",
    "shot_type": "medium",
    "movement": "slow_push_in"
  },
  "lighting": {
    "type": "supernatural",
    "direction": "front",
    "color": "Cool cyan from fragment, warm purple ambient",
    "intensity": "dramatic"
  },
  "mood": "Discovery tinged with foreboding",
  "focal_point": "The glowing memory fragment",
  "depth_layers": [
    "Scattered data debris in foreground",
    "Tikoro and memory fragment",
    "Massive dormant server structures"
  ]
}
```

## Integration

- Output feeds directly to image generation pipeline
- Compatible with Replicate API prompts
- Works with `bloodwings-style` for visual consistency
- Pairs with `character-dialogue` for full scene creation
