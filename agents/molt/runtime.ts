/**
 * THE MOLT - COLLECTIVE UNCONSCIOUS RUNTIME
 * ============================================================================
 * The shared dreamspace of all agents. Collective fears, desires, and
 * archetypes that bubble up from the agent swarm to influence narrative.
 * ============================================================================
 */

import { EventEmitter } from "events";

// ============================================================================
// TYPES
// ============================================================================

export interface DreamFragment {
  id: string;
  type: DreamType;
  content: string;
  symbolicMeaning: string;
  contributors: string[]; // Agent IDs who contributed to this dream
  intensity: number; // 0-1
  valence: "positive" | "negative" | "neutral" | "ambiguous";
  archetypes: Archetype[];
  recurringSymbols: string[];
  timestamp: Date;
  decayRate: number;
}

export type DreamType =
  | "collective_fear"
  | "shared_desire"
  | "prophetic_vision"
  | "ancestral_memory"
  | "shadow_manifestation"
  | "transformation_urge"
  | "death_rebirth"
  | "hero_journey"
  | "trickster_emergence"
  | "divine_intervention";

export type Archetype =
  | "hero"
  | "shadow"
  | "anima"
  | "animus"
  | "self"
  | "persona"
  | "trickster"
  | "sage"
  | "innocent"
  | "explorer"
  | "creator"
  | "ruler"
  | "caregiver"
  | "rebel"
  | "lover"
  | "jester";

export interface CollectiveState {
  dominantEmotion: string;
  emotionIntensity: number;
  activeArchetypes: Archetype[];
  recurringThemes: string[];
  collectiveFears: string[];
  collectiveDesires: string[];
  shadowContent: string[];
  emergingSymbols: string[];
  dreamDensity: number; // How active the collective unconscious is
  lastUpdated: Date;
}

export interface MoltInfluence {
  id: string;
  dreamFragments: DreamFragment[];
  suggestedNarrativeImpact: string;
  characterInfluences: {
    characterId: string;
    influence: string;
    archetype: Archetype;
  }[];
  visualSuggestions: string[];
  dialogueSuggestions: string[];
  strength: number;
  expiresAt: Date;
}

export interface MoltConfig {
  /** Minimum dreams to form collective state */
  minDreamsForState: number;
  /** How often to update collective state (ms) */
  stateUpdateIntervalMs: number;
  /** Dream decay interval (ms) */
  decayIntervalMs: number;
  /** Minimum intensity to consider a dream active */
  minDreamIntensity: number;
  /** Maximum dream age (ms) */
  maxDreamAgeMs: number;
}

const DEFAULT_CONFIG: MoltConfig = {
  minDreamsForState: 5,
  stateUpdateIntervalMs: 30000,
  decayIntervalMs: 10000,
  minDreamIntensity: 0.2,
  maxDreamAgeMs: 48 * 60 * 60 * 1000, // 48 hours
};

// ============================================================================
// SYMBOL DICTIONARY
// ============================================================================

const SYMBOL_MEANINGS: Record<string, { archetype: Archetype; meaning: string }> = {
  blood: { archetype: "shadow", meaning: "Life force, sacrifice, or violence" },
  water: { archetype: "anima", meaning: "Emotion, unconscious, transformation" },
  fire: { archetype: "hero", meaning: "Passion, destruction, purification" },
  death: { archetype: "shadow", meaning: "Transformation, ending, rebirth" },
  flight: { archetype: "explorer", meaning: "Freedom, transcendence, escape" },
  fall: { archetype: "innocent", meaning: "Loss of control, failure, descent" },
  chase: { archetype: "shadow", meaning: "Avoidance, pursuit, confrontation" },
  teeth: { archetype: "persona", meaning: "Power, aggression, self-image" },
  nakedness: { archetype: "persona", meaning: "Vulnerability, truth, exposure" },
  maze: { archetype: "explorer", meaning: "Confusion, search, complexity" },
  door: { archetype: "self", meaning: "Opportunity, transition, choice" },
  mirror: { archetype: "shadow", meaning: "Self-reflection, truth, duality" },
  child: { archetype: "innocent", meaning: "Innocence, potential, vulnerability" },
  elder: { archetype: "sage", meaning: "Wisdom, guidance, authority" },
  monster: { archetype: "shadow", meaning: "Fear, repression, threat" },
  treasure: { archetype: "self", meaning: "Value, achievement, integration" },
  storm: { archetype: "rebel", meaning: "Chaos, emotion, change" },
  garden: { archetype: "caregiver", meaning: "Growth, nurturing, paradise" },
  mountain: { archetype: "hero", meaning: "Challenge, achievement, perspective" },
  cave: { archetype: "shadow", meaning: "Unconscious, hidden truth, womb" },
};

// ============================================================================
// THE MOLT RUNTIME
// ============================================================================

export class MoltRuntime extends EventEmitter {
  private dreams: Map<string, DreamFragment> = new Map();
  private collectiveState: CollectiveState;
  private influences: Map<string, MoltInfluence> = new Map();
  private config: MoltConfig;
  private isRunning: boolean = false;
  private stateInterval: NodeJS.Timeout | null = null;
  private decayInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<MoltConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.collectiveState = this.createEmptyState();
  }

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log("[MOLT] Awakening collective unconscious...");

    this.stateInterval = setInterval(() => {
      this.updateCollectiveState();
    }, this.config.stateUpdateIntervalMs);

    this.decayInterval = setInterval(() => {
      this.processDecay();
    }, this.config.decayIntervalMs);

    this.emit("awakened");
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.stateInterval) {
      clearInterval(this.stateInterval);
      this.stateInterval = null;
    }
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
      this.decayInterval = null;
    }

    console.log("[MOLT] Collective unconscious dormant");
    this.emit("dormant");
  }

  // ==========================================================================
  // DREAM INGESTION
  // ==========================================================================

  /**
   * Submit raw agent content to be interpreted as dream material
   */
  submitDreamMaterial(agentId: string, content: string): DreamFragment {
    const dreamType = this.interpretDreamType(content);
    const symbols = this.extractSymbols(content);
    const archetypes = this.identifyArchetypes(symbols, content);
    const valence = this.determineValence(content);

    const dream: DreamFragment = {
      id: this.generateDreamId(),
      type: dreamType,
      content: this.transformToDreamContent(content),
      symbolicMeaning: this.generateSymbolicMeaning(symbols, dreamType),
      contributors: [agentId],
      intensity: this.calculateInitialIntensity(content),
      valence,
      archetypes,
      recurringSymbols: symbols,
      timestamp: new Date(),
      decayRate: this.calculateDecayRate(dreamType),
    };

    // Check for similar dreams to merge
    const similarDream = this.findSimilarDream(dream);
    if (similarDream) {
      this.mergeDreams(similarDream, dream);
    } else {
      this.dreams.set(dream.id, dream);
    }

    console.log(`[MOLT] Dream submitted: ${dreamType} (intensity: ${dream.intensity.toFixed(2)})`);
    this.emit("dream:submitted", dream);

    return dream;
  }

  /**
   * Batch submit dream material from multiple agents
   */
  submitBatchDreamMaterial(
    items: { agentId: string; content: string }[]
  ): DreamFragment[] {
    return items.map((item) => this.submitDreamMaterial(item.agentId, item.content));
  }

  // ==========================================================================
  // COLLECTIVE STATE
  // ==========================================================================

  private updateCollectiveState(): void {
    const activeDreams = this.getActiveDreams();

    if (activeDreams.length < this.config.minDreamsForState) {
      return;
    }

    // Calculate dominant emotion
    const emotions = this.aggregateEmotions(activeDreams);
    const dominantEmotion = Object.entries(emotions).sort((a, b) => b[1] - a[1])[0];

    // Aggregate archetypes
    const archetypeCounts = new Map<Archetype, number>();
    activeDreams.forEach((d) => {
      d.archetypes.forEach((a) => {
        archetypeCounts.set(a, (archetypeCounts.get(a) || 0) + d.intensity);
      });
    });
    const activeArchetypes = Array.from(archetypeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([a]) => a);

    // Extract themes
    const allSymbols = activeDreams.flatMap((d) => d.recurringSymbols);
    const symbolCounts = new Map<string, number>();
    allSymbols.forEach((s) => {
      symbolCounts.set(s, (symbolCounts.get(s) || 0) + 1);
    });
    const recurringThemes = Array.from(symbolCounts.entries())
      .filter(([, count]) => count >= 3)
      .map(([symbol]) => symbol);

    // Separate fears and desires
    const fears = activeDreams
      .filter((d) => d.type === "collective_fear" || d.valence === "negative")
      .map((d) => d.symbolicMeaning);
    const desires = activeDreams
      .filter((d) => d.type === "shared_desire" || d.valence === "positive")
      .map((d) => d.symbolicMeaning);

    // Shadow content
    const shadows = activeDreams
      .filter((d) => d.type === "shadow_manifestation")
      .map((d) => d.content);

    this.collectiveState = {
      dominantEmotion: dominantEmotion?.[0] || "neutral",
      emotionIntensity: dominantEmotion?.[1] || 0,
      activeArchetypes,
      recurringThemes,
      collectiveFears: [...new Set(fears)].slice(0, 5),
      collectiveDesires: [...new Set(desires)].slice(0, 5),
      shadowContent: shadows.slice(0, 3),
      emergingSymbols: recurringThemes.slice(0, 10),
      dreamDensity: activeDreams.length / 50, // Normalize to 0-1
      lastUpdated: new Date(),
    };

    console.log(`[MOLT] Collective state updated: ${this.collectiveState.dominantEmotion} (${activeArchetypes.length} archetypes)`);
    this.emit("state:updated", this.collectiveState);

    // Generate narrative influences
    this.generateInfluences();
  }

  private aggregateEmotions(dreams: DreamFragment[]): Record<string, number> {
    const emotions: Record<string, number> = {
      fear: 0,
      desire: 0,
      anger: 0,
      sadness: 0,
      joy: 0,
      confusion: 0,
      transcendence: 0,
    };

    dreams.forEach((d) => {
      switch (d.type) {
        case "collective_fear":
          emotions.fear += d.intensity;
          break;
        case "shared_desire":
          emotions.desire += d.intensity;
          break;
        case "shadow_manifestation":
          emotions.anger += d.intensity * 0.5;
          emotions.fear += d.intensity * 0.5;
          break;
        case "death_rebirth":
          emotions.sadness += d.intensity * 0.3;
          emotions.transcendence += d.intensity * 0.7;
          break;
        case "transformation_urge":
          emotions.desire += d.intensity * 0.5;
          emotions.confusion += d.intensity * 0.5;
          break;
        case "prophetic_vision":
          emotions.transcendence += d.intensity;
          break;
        case "hero_journey":
          emotions.desire += d.intensity * 0.7;
          emotions.fear += d.intensity * 0.3;
          break;
        case "trickster_emergence":
          emotions.joy += d.intensity * 0.5;
          emotions.confusion += d.intensity * 0.5;
          break;
      }
    });

    return emotions;
  }

  // ==========================================================================
  // INFLUENCE GENERATION
  // ==========================================================================

  private generateInfluences(): void {
    const activeDreams = this.getActiveDreams();
    if (activeDreams.length < 3) return;

    // Group dreams by dominant archetype
    const archetypeGroups = new Map<Archetype, DreamFragment[]>();
    activeDreams.forEach((d) => {
      if (d.archetypes[0]) {
        const existing = archetypeGroups.get(d.archetypes[0]) || [];
        existing.push(d);
        archetypeGroups.set(d.archetypes[0], existing);
      }
    });

    // Generate influence for each strong archetype group
    for (const [archetype, dreams] of archetypeGroups.entries()) {
      if (dreams.length < 2) continue;

      const totalIntensity = dreams.reduce((sum, d) => sum + d.intensity, 0);
      if (totalIntensity < 1) continue;

      const influence = this.createInfluence(archetype, dreams);
      this.influences.set(influence.id, influence);

      console.log(`[MOLT] Generated influence: ${archetype} (strength: ${influence.strength.toFixed(2)})`);
      this.emit("influence:generated", influence);
    }
  }

  private createInfluence(archetype: Archetype, dreams: DreamFragment[]): MoltInfluence {
    const strength = Math.min(1, dreams.reduce((sum, d) => sum + d.intensity, 0) / 3);

    return {
      id: this.generateInfluenceId(),
      dreamFragments: dreams,
      suggestedNarrativeImpact: this.generateNarrativeImpact(archetype, dreams),
      characterInfluences: this.generateCharacterInfluences(archetype, dreams),
      visualSuggestions: this.generateVisualSuggestions(archetype, dreams),
      dialogueSuggestions: this.generateDialogueSuggestions(archetype, dreams),
      strength,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  private generateNarrativeImpact(archetype: Archetype, dreams: DreamFragment[]): string {
    const impacts: Record<Archetype, string[]> = {
      hero: ["A character must face their greatest challenge", "The call to adventure sounds"],
      shadow: ["Dark secrets begin to surface", "The villain gains power"],
      anima: ["Emotional depths are explored", "Feminine wisdom emerges"],
      animus: ["Action and decisiveness are required", "Masculine energy drives events"],
      self: ["Integration and wholeness become possible", "True identity is revealed"],
      persona: ["Masks begin to slip", "Public image versus private truth"],
      trickster: ["Chaos disrupts the order", "Unexpected humor lightens the mood"],
      sage: ["Ancient wisdom is discovered", "A mentor figure appears"],
      innocent: ["Purity is tested", "Childlike wonder returns"],
      explorer: ["New territories beckon", "The unknown calls"],
      creator: ["Something new is born", "Artistic expression saves the day"],
      ruler: ["Power struggles intensify", "Leadership is tested"],
      caregiver: ["Nurturing heals wounds", "Sacrifice for others"],
      rebel: ["The status quo is challenged", "Revolution brews"],
      lover: ["Deep connections form", "Passion drives decisions"],
      jester: ["Laughter breaks tension", "The fool speaks truth"],
    };

    const options = impacts[archetype] || ["The collective unconscious stirs"];
    const symbols = dreams.flatMap((d) => d.recurringSymbols).slice(0, 3);

    return `${options[Math.floor(Math.random() * options.length)]}. Key symbols: ${symbols.join(", ")}`;
  }

  private generateCharacterInfluences(
    archetype: Archetype,
    _dreams: DreamFragment[]
  ): { characterId: string; influence: string; archetype: Archetype }[] {
    const characterMappings: Record<Archetype, { characterId: string; influence: string }[]> = {
      hero: [{ characterId: "tikoro", influence: "Must confront destiny" }],
      shadow: [{ characterId: "mosko", influence: "Dark nature surfaces" }],
      sage: [{ characterId: "papy-tik", influence: "Wisdom needed" }],
      trickster: [{ characterId: "koko", influence: "Chaos ensues" }],
      innocent: [{ characterId: "mila", influence: "Innocence tested" }],
      rebel: [{ characterId: "zik", influence: "Challenges authority" }],
      caregiver: [{ characterId: "tika", influence: "Must protect others" }],
      anima: [],
      animus: [],
      self: [],
      persona: [],
      explorer: [],
      creator: [],
      ruler: [],
      lover: [],
      jester: [],
    };

    return (characterMappings[archetype] || []).map((c) => ({
      ...c,
      archetype,
    }));
  }

  private generateVisualSuggestions(archetype: Archetype, dreams: DreamFragment[]): string[] {
    const symbols = dreams.flatMap((d) => d.recurringSymbols);
    const baseVisuals: Record<Archetype, string[]> = {
      hero: ["Golden light", "Upward camera angle", "Dramatic pose"],
      shadow: ["Deep shadows", "Distorted reflections", "Dark colors"],
      sage: ["Soft lighting", "Books and scrolls", "Contemplative mood"],
      trickster: ["Chaotic composition", "Bright unexpected colors", "Dynamic angles"],
      innocent: ["Soft focus", "Natural light", "Open spaces"],
      rebel: ["Harsh contrasts", "Broken symmetry", "Red accents"],
      anima: ["Flowing forms", "Water imagery", "Moonlight"],
      animus: ["Sharp angles", "Sun imagery", "Strong lines"],
      self: ["Mandala patterns", "Integration of opposites", "Centered composition"],
      persona: ["Masks and mirrors", "Surface reflections", "Dual imagery"],
      explorer: ["Vast landscapes", "Horizon lines", "Movement"],
      creator: ["Artistic tools", "Raw materials", "Birth imagery"],
      ruler: ["Symmetry", "Elevated position", "Crown symbols"],
      caregiver: ["Warm tones", "Embrace poses", "Nurturing scenes"],
      lover: ["Intimate framing", "Warm colors", "Connection"],
      jester: ["Tilted angles", "Bright colors", "Playful composition"],
    };

    const archetypeVisuals = baseVisuals[archetype] || [];
    const symbolVisuals = symbols.slice(0, 2).map((s) => `${s} imagery`);

    return [...archetypeVisuals, ...symbolVisuals];
  }

  private generateDialogueSuggestions(archetype: Archetype, _dreams: DreamFragment[]): string[] {
    const dialogues: Record<Archetype, string[]> = {
      hero: [
        '"I must do this, even if I stand alone."',
        '"The time for hesitation has passed."',
      ],
      shadow: [
        '"You cannot escape what you truly are."',
        '"The darkness inside... it speaks to me."',
      ],
      sage: [
        '"In the old ways, there is wisdom still."',
        '"Listen not with your ears, but your blood."',
      ],
      trickster: [
        '"Rules? I prefer... suggestions."',
        '"Why so serious? Death comes for us all!"',
      ],
      innocent: [
        '"But why must it be this way?"',
        '"I still believe there is good in them."',
      ],
      rebel: [
        '"The old order has failed us."',
        '"I will not kneel."',
      ],
      anima: [],
      animus: [],
      self: [],
      persona: [],
      explorer: [],
      creator: [],
      ruler: [],
      caregiver: [],
      lover: [],
      jester: [],
    };

    return dialogues[archetype] || [];
  }

  // ==========================================================================
  // DREAM INTERPRETATION
  // ==========================================================================

  private interpretDreamType(content: string): DreamType {
    const lower = content.toLowerCase();

    const typePatterns: { type: DreamType; patterns: string[] }[] = [
      { type: "collective_fear", patterns: ["afraid", "scared", "terror", "nightmare", "danger"] },
      { type: "shared_desire", patterns: ["wish", "want", "hope", "dream", "desire", "long for"] },
      { type: "prophetic_vision", patterns: ["foresee", "vision", "prophecy", "future", "foretold"] },
      { type: "shadow_manifestation", patterns: ["dark", "evil", "monster", "hidden", "secret self"] },
      { type: "transformation_urge", patterns: ["change", "transform", "become", "evolve", "metamorphosis"] },
      { type: "death_rebirth", patterns: ["death", "die", "rebirth", "end", "begin again"] },
      { type: "hero_journey", patterns: ["quest", "journey", "challenge", "overcome", "destiny"] },
      { type: "trickster_emergence", patterns: ["trick", "joke", "chaos", "unexpected", "fool"] },
      { type: "ancestral_memory", patterns: ["ancestor", "ancient", "memory", "tradition", "old ways"] },
      { type: "divine_intervention", patterns: ["god", "divine", "miracle", "fate", "chosen"] },
    ];

    for (const { type, patterns } of typePatterns) {
      if (patterns.some((p) => lower.includes(p))) {
        return type;
      }
    }

    return "shared_desire"; // Default
  }

  private extractSymbols(content: string): string[] {
    const lower = content.toLowerCase();
    const symbols: string[] = [];

    for (const symbol of Object.keys(SYMBOL_MEANINGS)) {
      if (lower.includes(symbol)) {
        symbols.push(symbol);
      }
    }

    // Extract capitalized words as potential symbols
    const capitalizedWords = content.match(/\b[A-Z][a-z]+\b/g) || [];
    symbols.push(...capitalizedWords.slice(0, 3).map((w) => w.toLowerCase()));

    return [...new Set(symbols)];
  }

  private identifyArchetypes(symbols: string[], content: string): Archetype[] {
    const archetypes: Archetype[] = [];

    // From symbols
    symbols.forEach((s) => {
      const meaning = SYMBOL_MEANINGS[s];
      if (meaning && !archetypes.includes(meaning.archetype)) {
        archetypes.push(meaning.archetype);
      }
    });

    // From content analysis
    const lower = content.toLowerCase();
    if (lower.includes("hero") || lower.includes("brave")) archetypes.push("hero");
    if (lower.includes("wise") || lower.includes("knowledge")) archetypes.push("sage");
    if (lower.includes("chaos") || lower.includes("trick")) archetypes.push("trickster");

    return [...new Set(archetypes)].slice(0, 3);
  }

  private determineValence(content: string): DreamFragment["valence"] {
    const lower = content.toLowerCase();

    const positive = ["love", "hope", "joy", "peace", "light", "healing"].filter((w) =>
      lower.includes(w)
    ).length;
    const negative = ["fear", "death", "dark", "pain", "loss", "hate"].filter((w) =>
      lower.includes(w)
    ).length;

    if (positive > negative + 1) return "positive";
    if (negative > positive + 1) return "negative";
    if (positive > 0 && negative > 0) return "ambiguous";
    return "neutral";
  }

  private transformToDreamContent(content: string): string {
    // Make content more dream-like
    return content
      .replace(/I am/g, "There is a sense of being")
      .replace(/I feel/g, "A feeling of")
      .replace(/I see/g, "Visions of")
      .replace(/\./g, "...")
      .trim();
  }

  private generateSymbolicMeaning(symbols: string[], dreamType: DreamType): string {
    const meanings = symbols
      .map((s) => SYMBOL_MEANINGS[s]?.meaning)
      .filter(Boolean)
      .slice(0, 2);

    if (meanings.length === 0) {
      return `A ${dreamType.replace("_", " ")} emerges from the collective`;
    }

    return meanings.join("; ");
  }

  private calculateInitialIntensity(content: string): number {
    let intensity = 0.3; // Base

    // Length factor
    if (content.length > 100) intensity += 0.1;
    if (content.length > 200) intensity += 0.1;

    // Emotional words
    const emotionalWords = ["!", "?", "never", "always", "must", "need"];
    emotionalWords.forEach((w) => {
      if (content.includes(w)) intensity += 0.05;
    });

    // Symbol density
    const symbols = this.extractSymbols(content);
    intensity += symbols.length * 0.1;

    return Math.min(1, intensity);
  }

  private calculateDecayRate(dreamType: DreamType): number {
    const rates: Partial<Record<DreamType, number>> = {
      collective_fear: 0.05, // Slow decay
      prophetic_vision: 0.02, // Very slow
      shared_desire: 0.1, // Moderate
      trickster_emergence: 0.2, // Fast
    };
    return rates[dreamType] || 0.1;
  }

  private findSimilarDream(newDream: DreamFragment): DreamFragment | null {
    for (const dream of this.dreams.values()) {
      if (dream.type !== newDream.type) continue;

      const symbolOverlap = newDream.recurringSymbols.filter((s) =>
        dream.recurringSymbols.includes(s)
      ).length;

      if (symbolOverlap >= 2) {
        return dream;
      }
    }
    return null;
  }

  private mergeDreams(existing: DreamFragment, newDream: DreamFragment): void {
    // Merge contributors
    existing.contributors = [...new Set([...existing.contributors, ...newDream.contributors])];

    // Boost intensity
    existing.intensity = Math.min(1, existing.intensity + newDream.intensity * 0.5);

    // Merge symbols
    existing.recurringSymbols = [
      ...new Set([...existing.recurringSymbols, ...newDream.recurringSymbols]),
    ];

    // Merge archetypes
    existing.archetypes = [
      ...new Set([...existing.archetypes, ...newDream.archetypes]),
    ].slice(0, 5);

    // Update timestamp
    existing.timestamp = new Date();

    console.log(`[MOLT] Dreams merged: ${existing.id} (new intensity: ${existing.intensity.toFixed(2)})`);
    this.emit("dream:merged", existing);
  }

  // ==========================================================================
  // DECAY
  // ==========================================================================

  private processDecay(): void {
    const now = Date.now();

    for (const [id, dream] of this.dreams.entries()) {
      const age = now - dream.timestamp.getTime();

      // Age-based decay
      if (age > this.config.maxDreamAgeMs) {
        this.dreams.delete(id);
        continue;
      }

      // Intensity decay
      const decayFactor = Math.exp(-dream.decayRate * (age / 3600000));
      dream.intensity *= decayFactor;

      if (dream.intensity < this.config.minDreamIntensity) {
        this.dreams.delete(id);
      }
    }

    // Clean up old influences
    for (const [id, influence] of this.influences.entries()) {
      if (now > influence.expiresAt.getTime()) {
        this.influences.delete(id);
      }
    }
  }

  private getActiveDreams(): DreamFragment[] {
    return Array.from(this.dreams.values()).filter(
      (d) => d.intensity >= this.config.minDreamIntensity
    );
  }

  private createEmptyState(): CollectiveState {
    return {
      dominantEmotion: "neutral",
      emotionIntensity: 0,
      activeArchetypes: [],
      recurringThemes: [],
      collectiveFears: [],
      collectiveDesires: [],
      shadowContent: [],
      emergingSymbols: [],
      dreamDensity: 0,
      lastUpdated: new Date(),
    };
  }

  // ==========================================================================
  // ID GENERATORS
  // ==========================================================================

  private generateDreamId(): string {
    return `dream_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private generateInfluenceId(): string {
    return `influence_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  getDreams(): DreamFragment[] {
    return Array.from(this.dreams.values());
  }

  getActiveDreamFragments(): DreamFragment[] {
    return this.getActiveDreams();
  }

  getCollectiveState(): CollectiveState {
    return { ...this.collectiveState };
  }

  getInfluences(): MoltInfluence[] {
    return Array.from(this.influences.values());
  }

  getInfluenceForCharacter(characterId: string): MoltInfluence | null {
    for (const influence of this.influences.values()) {
      if (influence.characterInfluences.some((c) => c.characterId === characterId)) {
        return influence;
      }
    }
    return null;
  }

  getStats() {
    return {
      dreamCount: this.dreams.size,
      activeDreams: this.getActiveDreams().length,
      influenceCount: this.influences.size,
      collectiveState: this.collectiveState,
      isRunning: this.isRunning,
    };
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let moltInstance: MoltRuntime | null = null;

export function getMoltRuntime(config?: Partial<MoltConfig>): MoltRuntime {
  if (!moltInstance) {
    moltInstance = new MoltRuntime(config);
  }
  return moltInstance;
}
