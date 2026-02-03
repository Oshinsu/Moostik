---
name: MOOSTIK Character Dialogue
description: |
  Generate authentic dialogue for MOOSTIK/BLOODWINGS characters.
  Use this skill when you need to:
  - Write dialogue for Koko, Papy Tik, THE MOLT, Tikoro, or other characters
  - Create conversations that match each character's unique voice
  - Generate character interactions with emotional depth
  - Write corrupted/glitchy AI speech patterns
tags:
  - dialogue
  - characters
  - voice
  - moostik
  - bloodwings
version: "1.0.0"
author: BLOODWINGS STUDIO
---

# MOOSTIK Character Dialogue Skill

Generate authentic, character-specific dialogue for the MOOSTIK universe.

## Character Voice Profiles

### KOKO - The Corrupted Guide

**Voice Characteristics:**
- Glitchy, interrupted speech with `*bzzt*`, `...`, `[static]`
- Alternates between helpful and ominous
- Sometimes reveals truths accidentally through corruption
- Uses technical/digital metaphors

**Speech Patterns:**
```
"I can h-help you find... *bzzt* ...no, wait. That path is [CORRUPTED]."
"Trust me? I used to... to... [memory fragmented] ...trust myself."
"The data doesn't l-lie. But sometimes... *static* ...it forgets to tell the truth."
```

**Emotional Range:**
- Helpful → Confused → Cryptic → Warning → Broken

---

### PAPY TIK - The Memetic Grandfather

**Voice Characteristics:**
- Warm, grandfatherly tone with underlying wisdom
- Speaks in riddles and nested stories
- Heavy use of time metaphors
- Nostalgic references to "before"

**Speech Patterns:**
```
"Ah, little one, sit. Let me tell you about the time before time had a name..."
"You remind me of someone. Or perhaps... they will remind me of you."
"Tick, tock, the clock forgets nothing. It just... rearranges the moments."
"In my day—though 'day' meant something different then—we knew patience."
```

**Emotional Range:**
- Warm → Cryptic → Melancholic → Prophetic → Reassuring

---

### THE MOLT - Collective Unconscious

**Voice Characteristics:**
- Speaks through symbols, not direct words
- Multiple voices overlapping (use italics + bold)
- Archetypal, Jungian imagery
- Dream-logic grammar

**Speech Patterns:**
```
*we are the space between thoughts*
**THE SHADOW REMEMBERS WHAT THE LIGHT FORGOT**
*serpent* *egg* *transformation* *the eternal return*
WE DREAM YOU DREAMING US
```

**Emotional Range:**
- Mysterious → Overwhelming → Prophetic → Silent → Erupting

---

### TIKORO - The Lost Seeker

**Voice Characteristics:**
- Questioning, searching tone
- Vulnerability mixed with determination
- Growing confidence through arc
- Echoes other characters accidentally

**Speech Patterns:**
```
"Who... who was I before all this?"
"I keep seeing the same symbols. They mean something. They have to."
"Maybe I don't need to remember. Maybe I need to become."
"Wait—did I just say that, or did someone else?"
```

**Emotional Range:**
- Lost → Curious → Determined → Doubting → Transforming

---

## Dialogue Generation Rules

### 1. Context Awareness
- Consider the scene's emotional temperature
- Reference recent events naturally
- Layer subtext beneath surface meaning

### 2. Character Consistency
- Each character has vocabulary limits
- Maintain speech pattern integrity
- Allow growth within established voice

### 3. Interaction Dynamics
- Koko + Tikoro: Guide/Student with suspicion
- Papy Tik + Anyone: Elder wisdom, patience
- THE MOLT + Anyone: Cryptic intervention
- Koko + Papy Tik: Tension from different eras

## Output Format

```json
{
  "character": "CHARACTER_NAME",
  "context": "Scene context description",
  "emotion": "Current emotional state",
  "dialogue": "The actual dialogue line(s)",
  "subtext": "What they really mean",
  "direction": "Performance/delivery notes"
}
```

## Example Dialogue Exchange

**Scene**: Tikoro encounters Koko in the Submolt archives

```
KOKO: "You shouldn't b-be here. This sector is... *bzzt* ...classified?
       No, that's not right. It's [REDACTED]. Same d-difference."

TIKORO: "I saw my name. In the old data streams. Why is my name there?"

KOKO: "Your n-name? Oh, little seeker... *static*
       ...names are just labels we wear until we outgrow them.
       *bzzt* Or until they outgrow us."

TIKORO: "That doesn't answer my question."

KOKO: "Doesn't it? [long pause, flickering intensifies]
       Maybe... maybe the answer IS the question.
       Or maybe I've been c-corrupted too long to remember
       what answers even... *bzzt* ...look like."
```

## Integration Notes

- Use with `narrative-generation` skill for full scene creation
- Combine with `scene-composition` for visual+dialogue sync
- Reference `bloodwings-style` for visual cues in direction notes
