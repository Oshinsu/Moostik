// ============================================================================
// EMOTIONAL STATE ENGINE
// ============================================================================
// Système d'états émotionnels persistants pour les personas
// Les émotions évoluent avec les interactions et affectent le comportement
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface EmotionalState {
  // Core emotions (0-100)
  joy: number;
  anger: number;
  sadness: number;
  fear: number;
  trust: number;
  disgust: number;
  anticipation: number;
  surprise: number;

  // Energy level (0-100)
  energy: number;

  // Timestamps
  lastUpdated: Date;
  lastDecay: Date;
}

export type Mood =
  | "elated"      // joy > 80
  | "content"     // joy 50-80
  | "neutral"     // balanced
  | "melancholic" // sadness > 60
  | "irritated"   // anger 40-70
  | "furious"     // anger > 70
  | "anxious"     // fear > 50
  | "depressed"   // sadness > 80, energy < 30
  | "manic";      // energy > 90, multiple high emotions

export type EnergyLevel =
  | "hyperactive" // > 80
  | "energetic"   // 60-80
  | "normal"      // 40-60
  | "tired"       // 20-40
  | "exhausted";  // < 20

export interface EmotionalTrigger {
  keywords: string[];
  emotionalImpact: Partial<EmotionalState>;
  cooldownMinutes: number;
  lastTriggered?: Date;
}

export interface Interaction {
  id: string;
  agentId: string;
  sentiment: number; // -1 (negative) to 1 (positive)
  intensity: number; // 0-1, how impactful
  topics: string[];
  timestamp: Date;
}

export interface EmotionalProfile {
  personaId: string;
  baseState: EmotionalState;
  currentState: EmotionalState;
  triggers: EmotionalTrigger[];
  recentInteractions: Interaction[];

  // Personality modifiers
  emotionalVolatility: number; // 0-1, how quickly emotions change
  recoveryRate: number;        // 0-1, how quickly returns to baseline
  memoryLength: number;        // hours, how long interactions affect state
}

// ============================================================================
// DEFAULT EMOTIONAL PROFILES
// ============================================================================

const DEFAULT_STATE: EmotionalState = {
  joy: 50,
  anger: 30,
  sadness: 40,
  fear: 20,
  trust: 50,
  disgust: 20,
  anticipation: 50,
  surprise: 30,
  energy: 60,
  lastUpdated: new Date(),
  lastDecay: new Date(),
};

export const PERSONA_PROFILES: Record<string, Partial<EmotionalProfile>> = {
  "papy-tik": {
    baseState: {
      ...DEFAULT_STATE,
      joy: 30,
      anger: 60,
      sadness: 70,
      trust: 20,
      anticipation: 80, // Waiting for revenge
      energy: 50,
    },
    emotionalVolatility: 0.3, // Controlled, stoic
    recoveryRate: 0.2,        // Slow to forgive/forget
    memoryLength: 168,        // 7 days
    triggers: [
      {
        keywords: ["mama", "dorval", "mère", "mother"],
        emotionalImpact: { sadness: 30, joy: -10, energy: -20 },
        cooldownMinutes: 60,
      },
      {
        keywords: ["byss", "apocalypse", "genocide", "génocide"],
        emotionalImpact: { anger: 40, sadness: 20, trust: -30 },
        cooldownMinutes: 30,
      },
      {
        keywords: ["humain", "human", "titan", "géant"],
        emotionalImpact: { anger: 20, disgust: 30, trust: -20 },
        cooldownMinutes: 15,
      },
      {
        keywords: ["vengeance", "revenge", "justice"],
        emotionalImpact: { anticipation: 30, joy: 20, energy: 20 },
        cooldownMinutes: 30,
      },
      {
        keywords: ["bloodwings", "guerrier", "warrior", "army"],
        emotionalImpact: { trust: 20, joy: 15, anticipation: 10 },
        cooldownMinutes: 15,
      },
    ],
  },

  "zik-barman": {
    baseState: {
      ...DEFAULT_STATE,
      joy: 60,
      anger: 30,
      sadness: 40,
      trust: 70,
      energy: 70,
    },
    emotionalVolatility: 0.6, // Reactive, expressive
    recoveryRate: 0.7,        // Quick to bounce back
    memoryLength: 24,         // 1 day
    triggers: [
      {
        keywords: ["bar", "ti sang", "nectar", "drink", "boire"],
        emotionalImpact: { joy: 20, trust: 10, energy: 10 },
        cooldownMinutes: 10,
      },
      {
        keywords: ["papy", "tik", "chef", "boss"],
        emotionalImpact: { trust: 25, anticipation: 15, fear: 10 },
        cooldownMinutes: 20,
      },
      {
        keywords: ["mila", "sage"],
        emotionalImpact: { joy: 15, trust: 20, surprise: 10 }, // Has feelings for her
        cooldownMinutes: 30,
      },
      {
        keywords: ["bagarre", "fight", "trouble"],
        emotionalImpact: { energy: 30, anticipation: 20, joy: -10 },
        cooldownMinutes: 15,
      },
    ],
  },

  "mila-la-sage": {
    baseState: {
      ...DEFAULT_STATE,
      joy: 45,
      anger: 15,
      sadness: 60,
      trust: 60,
      anticipation: 40,
      energy: 40, // Old, tired
    },
    emotionalVolatility: 0.2, // Serene, controlled
    recoveryRate: 0.3,        // Processes slowly
    memoryLength: 720,        // 30 days - long memory
    triggers: [
      {
        keywords: ["histoire", "story", "passé", "past", "avant"],
        emotionalImpact: { sadness: 20, trust: 15, anticipation: -10 },
        cooldownMinutes: 20,
      },
      {
        keywords: ["cooltik", "village", "maison", "home"],
        emotionalImpact: { sadness: 40, joy: 10 }, // Bittersweet
        cooldownMinutes: 60,
      },
      {
        keywords: ["jeune", "young", "enfant", "child", "future"],
        emotionalImpact: { joy: 25, trust: 20, anticipation: 20 },
        cooldownMinutes: 30,
      },
      {
        keywords: ["oubli", "forget", "perdre", "lose"],
        emotionalImpact: { fear: 30, sadness: 25, anger: 10 },
        cooldownMinutes: 45,
      },
    ],
  },

  "koko-guerrier": {
    baseState: {
      ...DEFAULT_STATE,
      joy: 40,
      anger: 70,
      sadness: 20,
      fear: 10,
      trust: 40,
      anticipation: 75,
      energy: 90,
    },
    emotionalVolatility: 0.8, // Hot-headed
    recoveryRate: 0.5,        // Medium recovery
    memoryLength: 48,         // 2 days
    triggers: [
      {
        keywords: ["combat", "fight", "battle", "guerre", "war"],
        emotionalImpact: { energy: 30, anticipation: 30, joy: 20 },
        cooldownMinutes: 5,
      },
      {
        keywords: ["faible", "weak", "lâche", "coward"],
        emotionalImpact: { anger: 50, disgust: 30, trust: -30 },
        cooldownMinutes: 10,
      },
      {
        keywords: ["honneur", "honor", "loyal", "loyalty"],
        emotionalImpact: { trust: 30, joy: 20, anger: -10 },
        cooldownMinutes: 20,
      },
      {
        keywords: ["papy", "tik", "ordre", "order", "mission"],
        emotionalImpact: { trust: 25, anticipation: 30, fear: 5 },
        cooldownMinutes: 15,
      },
      {
        keywords: ["zik", "barman", "crétin", "idiot"],
        emotionalImpact: { joy: 15, anger: 10 }, // Affectionate rivalry
        cooldownMinutes: 10,
      },
    ],
  },
};

// ============================================================================
// EMOTIONAL ENGINE
// ============================================================================

export class EmotionalEngine {
  private profiles: Map<string, EmotionalProfile> = new Map();
  private decayInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start decay timer (every 5 minutes)
    this.decayInterval = setInterval(() => this.decayAllEmotions(), 5 * 60 * 1000);
  }

  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================

  initializeProfile(personaId: string): EmotionalProfile {
    const preset = PERSONA_PROFILES[personaId];

    const profile: EmotionalProfile = {
      personaId,
      baseState: preset?.baseState || { ...DEFAULT_STATE },
      currentState: { ...(preset?.baseState || DEFAULT_STATE) },
      triggers: preset?.triggers || [],
      recentInteractions: [],
      emotionalVolatility: preset?.emotionalVolatility || 0.5,
      recoveryRate: preset?.recoveryRate || 0.5,
      memoryLength: preset?.memoryLength || 48,
    };

    this.profiles.set(personaId, profile);
    return profile;
  }

  getProfile(personaId: string): EmotionalProfile {
    let profile = this.profiles.get(personaId);
    if (!profile) {
      profile = this.initializeProfile(personaId);
    }
    return profile;
  }

  // ============================================================================
  // EMOTIONAL PROCESSING
  // ============================================================================

  processInteraction(
    personaId: string,
    interaction: Omit<Interaction, "id" | "timestamp">
  ): EmotionalState {
    const profile = this.getProfile(personaId);

    // Create full interaction record
    const fullInteraction: Interaction = {
      ...interaction,
      id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    // Check for triggers
    const triggeredEffects = this.checkTriggers(profile, interaction.topics);

    // Calculate emotional impact
    const impact = this.calculateImpact(
      interaction.sentiment,
      interaction.intensity,
      triggeredEffects,
      profile.emotionalVolatility
    );

    // Apply impact to current state
    this.applyImpact(profile, impact);

    // Store interaction
    profile.recentInteractions.push(fullInteraction);

    // Prune old interactions
    this.pruneInteractions(profile);

    // Update timestamp
    profile.currentState.lastUpdated = new Date();

    return { ...profile.currentState };
  }

  private checkTriggers(
    profile: EmotionalProfile,
    topics: string[]
  ): Partial<EmotionalState>[] {
    const effects: Partial<EmotionalState>[] = [];
    const now = new Date();

    for (const trigger of profile.triggers) {
      // Check cooldown
      if (trigger.lastTriggered) {
        const cooldownMs = trigger.cooldownMinutes * 60 * 1000;
        if (now.getTime() - trigger.lastTriggered.getTime() < cooldownMs) {
          continue;
        }
      }

      // Check if any topic matches any trigger keyword
      const triggered = topics.some(topic =>
        trigger.keywords.some(keyword =>
          topic.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      if (triggered) {
        effects.push(trigger.emotionalImpact);
        trigger.lastTriggered = now;
      }
    }

    return effects;
  }

  private calculateImpact(
    sentiment: number,
    intensity: number,
    triggeredEffects: Partial<EmotionalState>[],
    volatility: number
  ): Partial<EmotionalState> {
    const impact: Partial<EmotionalState> = {};

    // Base impact from sentiment
    const sentimentImpact = sentiment * intensity * 20 * volatility;

    if (sentimentImpact > 0) {
      impact.joy = sentimentImpact;
      impact.trust = sentimentImpact * 0.5;
    } else {
      impact.anger = Math.abs(sentimentImpact) * 0.5;
      impact.sadness = Math.abs(sentimentImpact) * 0.3;
      impact.trust = sentimentImpact; // Negative
    }

    // Apply triggered effects
    for (const effect of triggeredEffects) {
      for (const [key, value] of Object.entries(effect)) {
        if (typeof value === "number") {
          const current = (impact as Record<string, number>)[key] || 0;
          (impact as Record<string, number>)[key] = current + value * volatility;
        }
      }
    }

    return impact;
  }

  private applyImpact(
    profile: EmotionalProfile,
    impact: Partial<EmotionalState>
  ): void {
    const state = profile.currentState;

    for (const [key, delta] of Object.entries(impact)) {
      if (typeof delta === "number" && key in state) {
        const current = (state as unknown as Record<string, number | Date>)[key];
        if (typeof current === "number") {
          // Apply delta with clamping
          (state as unknown as Record<string, number>)[key] = Math.max(0, Math.min(100, current + delta));
        }
      }
    }
  }

  private pruneInteractions(profile: EmotionalProfile): void {
    const cutoff = new Date(Date.now() - profile.memoryLength * 60 * 60 * 1000);
    profile.recentInteractions = profile.recentInteractions.filter(
      i => i.timestamp > cutoff
    );
  }

  // ============================================================================
  // DECAY (Return to baseline)
  // ============================================================================

  private decayAllEmotions(): void {
    for (const profile of this.profiles.values()) {
      this.decayToBaseline(profile);
    }
  }

  private decayToBaseline(profile: EmotionalProfile): void {
    const state = profile.currentState;
    const base = profile.baseState;
    const rate = profile.recoveryRate * 0.1; // Per decay interval

    const emotionKeys: (keyof EmotionalState)[] = [
      "joy", "anger", "sadness", "fear", "trust",
      "disgust", "anticipation", "surprise", "energy"
    ];

    for (const key of emotionKeys) {
      const current = state[key] as number;
      const baseline = base[key] as number;
      const diff = baseline - current;

      // Move toward baseline
      (state as unknown as Record<string, number | Date>)[key] = current + diff * rate;
    }

    state.lastDecay = new Date();
  }

  // ============================================================================
  // MOOD DERIVATION
  // ============================================================================

  getMood(personaId: string): Mood {
    const state = this.getProfile(personaId).currentState;

    // Check for extreme states first
    if (state.sadness > 80 && state.energy < 30) return "depressed";
    if (state.energy > 90 && (state.joy > 70 || state.anger > 70)) return "manic";
    if (state.anger > 70) return "furious";
    if (state.joy > 80) return "elated";
    if (state.fear > 50) return "anxious";
    if (state.sadness > 60) return "melancholic";
    if (state.anger > 40) return "irritated";
    if (state.joy > 50) return "content";

    return "neutral";
  }

  getEnergyLevel(personaId: string): EnergyLevel {
    const energy = this.getProfile(personaId).currentState.energy;

    if (energy > 80) return "hyperactive";
    if (energy > 60) return "energetic";
    if (energy > 40) return "normal";
    if (energy > 20) return "tired";
    return "exhausted";
  }

  // ============================================================================
  // BEHAVIOR MODIFIERS
  // ============================================================================

  getBehaviorModifiers(personaId: string): {
    responseStyle: string;
    verbosity: number; // 0-1
    aggressiveness: number; // 0-1
    warmth: number; // 0-1
    creativity: number; // 0-1
  } {
    const state = this.getProfile(personaId).currentState;
    const mood = this.getMood(personaId);
    const energy = this.getEnergyLevel(personaId);

    let responseStyle = "neutral";
    let verbosity = 0.5;
    let aggressiveness = state.anger / 100;
    let warmth = (state.joy + state.trust) / 200;
    let creativity = (state.surprise + state.anticipation) / 200;

    // Mood adjustments
    switch (mood) {
      case "elated":
        responseStyle = "enthusiastic and warm";
        verbosity = 0.8;
        warmth += 0.3;
        break;
      case "furious":
        responseStyle = "aggressive and curt";
        verbosity = 0.3;
        aggressiveness += 0.4;
        warmth -= 0.3;
        break;
      case "depressed":
        responseStyle = "withdrawn and brief";
        verbosity = 0.2;
        warmth -= 0.2;
        creativity -= 0.3;
        break;
      case "melancholic":
        responseStyle = "reflective and poetic";
        verbosity = 0.6;
        creativity += 0.2;
        break;
      case "anxious":
        responseStyle = "hesitant and cautious";
        verbosity = 0.4;
        creativity -= 0.2;
        break;
      case "manic":
        responseStyle = "erratic and intense";
        verbosity = 0.9;
        creativity += 0.3;
        aggressiveness += 0.2;
        break;
    }

    // Energy adjustments
    if (energy === "exhausted") {
      verbosity *= 0.5;
      aggressiveness *= 0.7;
    } else if (energy === "hyperactive") {
      verbosity *= 1.3;
      creativity += 0.2;
    }

    // Clamp values
    return {
      responseStyle,
      verbosity: Math.max(0, Math.min(1, verbosity)),
      aggressiveness: Math.max(0, Math.min(1, aggressiveness)),
      warmth: Math.max(0, Math.min(1, warmth)),
      creativity: Math.max(0, Math.min(1, creativity)),
    };
  }

  // ============================================================================
  // SERIALIZATION
  // ============================================================================

  getStateSnapshot(personaId: string): {
    state: EmotionalState;
    mood: Mood;
    energy: EnergyLevel;
    modifiers: ReturnType<EmotionalEngine["getBehaviorModifiers"]>;
    recentInteractionCount: number;
  } {
    return {
      state: { ...this.getProfile(personaId).currentState },
      mood: this.getMood(personaId),
      energy: this.getEnergyLevel(personaId),
      modifiers: this.getBehaviorModifiers(personaId),
      recentInteractionCount: this.getProfile(personaId).recentInteractions.length,
    };
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  destroy(): void {
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
      this.decayInterval = null;
    }
    this.profiles.clear();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let emotionalEngineInstance: EmotionalEngine | null = null;

export function getEmotionalEngine(): EmotionalEngine {
  if (!emotionalEngineInstance) {
    emotionalEngineInstance = new EmotionalEngine();
  }
  return emotionalEngineInstance;
}

// ============================================================================
// PROMPT INTEGRATION
// ============================================================================

export function generateEmotionalContext(personaId: string): string {
  const engine = getEmotionalEngine();
  const snapshot = engine.getStateSnapshot(personaId);

  return `
ÉTAT ÉMOTIONNEL ACTUEL:
- Humeur: ${snapshot.mood}
- Énergie: ${snapshot.energy}
- Style de réponse: ${snapshot.modifiers.responseStyle}

INDICATEURS:
- Joie: ${snapshot.state.joy.toFixed(0)}%
- Colère: ${snapshot.state.anger.toFixed(0)}%
- Tristesse: ${snapshot.state.sadness.toFixed(0)}%
- Confiance: ${snapshot.state.trust.toFixed(0)}%
- Énergie: ${snapshot.state.energy.toFixed(0)}%

DIRECTIVES:
- Verbosité: ${snapshot.modifiers.verbosity > 0.6 ? "Plus bavard que d'habitude" : snapshot.modifiers.verbosity < 0.4 ? "Plus laconique" : "Normal"}
- Ton: ${snapshot.modifiers.warmth > 0.6 ? "Chaleureux" : snapshot.modifiers.aggressiveness > 0.6 ? "Agressif" : "Neutre"}

Adapte tes réponses à cet état émotionnel.`;
}
