/**
 * SWARM NARRATIVE ENGINE - RUNTIME
 * ============================================================================
 * Real implementation of the Swarm Narrative Engine
 * Collects signals, detects patterns, and generates narrative briefs
 * ============================================================================
 */

import { EventEmitter } from "events";
import type {
  NarrativeSignal,
  SwarmPattern,
  EmergentNarrativeBrief,
  SignalType,
} from "./narrative-engine";

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface SwarmEngineConfig {
  /** Minimum signals to form a pattern */
  minSignalsForPattern: number;
  /** How often to scan for patterns (ms) */
  patternScanIntervalMs: number;
  /** Signal decay check interval (ms) */
  decayIntervalMs: number;
  /** Minimum coherence to consider a pattern valid */
  minPatternCoherence: number;
  /** Maximum age of signals to consider (ms) */
  maxSignalAgeMs: number;
  /** Minimum emergence score to generate a brief */
  minEmergenceScore: number;
}

const DEFAULT_CONFIG: SwarmEngineConfig = {
  minSignalsForPattern: 3,
  patternScanIntervalMs: 30000, // 30 seconds
  decayIntervalMs: 10000, // 10 seconds
  minPatternCoherence: 0.6,
  maxSignalAgeMs: 24 * 60 * 60 * 1000, // 24 hours
  minEmergenceScore: 0.7,
};

// ============================================================================
// SWARM ENGINE RUNTIME
// ============================================================================

export class SwarmNarrativeEngineRuntime extends EventEmitter {
  private signals: Map<string, NarrativeSignal> = new Map();
  private patterns: Map<string, SwarmPattern> = new Map();
  private briefs: Map<string, EmergentNarrativeBrief> = new Map();
  private config: SwarmEngineConfig;
  private isRunning: boolean = false;
  private scanInterval: NodeJS.Timeout | null = null;
  private decayInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<SwarmEngineConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log("[SwarmEngine] Starting narrative engine...");

    // Start pattern scanning
    this.scanInterval = setInterval(() => {
      this.scanForPatterns();
    }, this.config.patternScanIntervalMs);

    // Start signal decay
    this.decayInterval = setInterval(() => {
      this.processDecay();
    }, this.config.decayIntervalMs);

    this.emit("started");
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
      this.decayInterval = null;
    }

    console.log("[SwarmEngine] Stopped");
    this.emit("stopped");
  }

  // ==========================================================================
  // SIGNAL INGESTION
  // ==========================================================================

  /**
   * Ingest a new signal from agent activity
   */
  ingestSignal(signal: Omit<NarrativeSignal, "id" | "timestamp">): NarrativeSignal {
    const fullSignal: NarrativeSignal = {
      ...signal,
      id: this.generateSignalId(),
      timestamp: new Date(),
    };

    this.signals.set(fullSignal.id, fullSignal);
    console.log(`[SwarmEngine] Ingested signal: ${fullSignal.type} (intensity: ${fullSignal.intensity})`);

    this.emit("signal:ingested", fullSignal);

    // Immediate pattern check if signal is strong
    if (fullSignal.intensity > 0.8) {
      this.scanForPatterns();
    }

    return fullSignal;
  }

  /**
   * Batch ingest multiple signals
   */
  ingestSignals(signals: Omit<NarrativeSignal, "id" | "timestamp">[]): NarrativeSignal[] {
    return signals.map((s) => this.ingestSignal(s));
  }

  /**
   * Extract signals from raw agent messages
   */
  extractSignalsFromMessages(messages: AgentMessage[]): NarrativeSignal[] {
    const extractedSignals: NarrativeSignal[] = [];

    // Analyze sentiment shifts
    const sentimentSignal = this.analyzeSentiment(messages);
    if (sentimentSignal) extractedSignals.push(this.ingestSignal(sentimentSignal));

    // Detect topic emergence
    const topicSignals = this.detectTopics(messages);
    topicSignals.forEach((s) => extractedSignals.push(this.ingestSignal(s)));

    // Detect faction formation
    const factionSignal = this.detectFactions(messages);
    if (factionSignal) extractedSignals.push(this.ingestSignal(factionSignal));

    // Detect character obsessions
    const obsessionSignals = this.detectCharacterObsessions(messages);
    obsessionSignals.forEach((s) => extractedSignals.push(this.ingestSignal(s)));

    return extractedSignals;
  }

  // ==========================================================================
  // PATTERN DETECTION
  // ==========================================================================

  private scanForPatterns(): void {
    if (!this.isRunning) return;

    const activeSignals = this.getActiveSignals();
    if (activeSignals.length < this.config.minSignalsForPattern) return;

    console.log(`[SwarmEngine] Scanning ${activeSignals.length} signals for patterns...`);

    // Group signals by type
    const signalGroups = this.groupSignalsByType(activeSignals);

    // Detect rising tension patterns
    const tensionPattern = this.detectRisingTension(signalGroups);
    if (tensionPattern) this.registerPattern(tensionPattern);

    // Detect faction war patterns
    const factionPattern = this.detectFactionWar(signalGroups);
    if (factionPattern) this.registerPattern(factionPattern);

    // Detect character arc patterns
    const characterPattern = this.detectCharacterArc(signalGroups);
    if (characterPattern) this.registerPattern(characterPattern);

    // Detect mystery forming
    const mysteryPattern = this.detectMysteryForming(signalGroups);
    if (mysteryPattern) this.registerPattern(mysteryPattern);

    // Generate briefs from strong patterns
    this.generateBriefsFromPatterns();
  }

  private detectRisingTension(groups: Map<SignalType, NarrativeSignal[]>): SwarmPattern | null {
    const conflicts = groups.get("conflict_brewing") || [];
    const fears = groups.get("collective_fear") || [];
    const sentiments = groups.get("sentiment_shift") || [];

    const relevantSignals = [...conflicts, ...fears, ...sentiments.filter((s) => s.sentiment < -0.3)];

    if (relevantSignals.length < this.config.minSignalsForPattern) return null;

    const coherence = this.calculateCoherence(relevantSignals);
    if (coherence < this.config.minPatternCoherence) return null;

    const momentum = this.calculateMomentum(relevantSignals);
    const criticality = this.calculateCriticality(relevantSignals);

    return {
      id: this.generatePatternId(),
      signals: relevantSignals,
      patternType: "rising_tension",
      coherence,
      momentum,
      criticality,
      storyPotential: {
        protagonists: this.extractProtagonists(relevantSignals),
        antagonists: this.extractAntagonists(relevantSignals),
        conflict: this.synthesizeConflict(relevantSignals),
        stakes: this.determineStakes(relevantSignals),
        possibleResolutions: this.generateResolutions(relevantSignals),
      },
      detectedAt: new Date(),
      peakPrediction: new Date(Date.now() + this.predictPeakTime(momentum)),
      expiresAt: new Date(Date.now() + this.config.maxSignalAgeMs),
    };
  }

  private detectFactionWar(groups: Map<SignalType, NarrativeSignal[]>): SwarmPattern | null {
    const factions = groups.get("faction_formation") || [];
    const conflicts = groups.get("conflict_brewing") || [];

    if (factions.length < 2) return null;

    const relevantSignals = [...factions, ...conflicts];
    const coherence = this.calculateCoherence(relevantSignals);

    if (coherence < this.config.minPatternCoherence) return null;

    return {
      id: this.generatePatternId(),
      signals: relevantSignals,
      patternType: "faction_war",
      coherence,
      momentum: this.calculateMomentum(relevantSignals),
      criticality: this.calculateCriticality(relevantSignals),
      storyPotential: {
        protagonists: this.extractFromFaction(factions[0]),
        antagonists: this.extractFromFaction(factions[1]),
        conflict: "Ideological clash between emerging factions",
        stakes: "Control of narrative direction",
        possibleResolutions: ["One faction prevails", "Uneasy truce", "Third faction emerges"],
      },
      detectedAt: new Date(),
      peakPrediction: new Date(Date.now() + 3600000), // 1 hour
      expiresAt: new Date(Date.now() + this.config.maxSignalAgeMs),
    };
  }

  private detectCharacterArc(groups: Map<SignalType, NarrativeSignal[]>): SwarmPattern | null {
    const obsessions = groups.get("character_obsession") || [];

    if (obsessions.length < 2) return null;

    // Find the most discussed character
    const characterCounts = new Map<string, number>();
    obsessions.forEach((s) => {
      s.keywords.forEach((k) => {
        characterCounts.set(k, (characterCounts.get(k) || 0) + s.intensity);
      });
    });

    const topCharacter = Array.from(characterCounts.entries()).sort((a, b) => b[1] - a[1])[0];

    if (!topCharacter || topCharacter[1] < 2) return null;

    const relevantSignals = obsessions.filter((s) => s.keywords.includes(topCharacter[0]));

    return {
      id: this.generatePatternId(),
      signals: relevantSignals,
      patternType: "character_arc",
      coherence: this.calculateCoherence(relevantSignals),
      momentum: this.calculateMomentum(relevantSignals),
      criticality: 0.5,
      storyPotential: {
        protagonists: [topCharacter[0]],
        antagonists: [],
        conflict: `Community fascination with ${topCharacter[0]}`,
        stakes: "Character development and revelation",
        possibleResolutions: ["Origin story", "Hidden secret revealed", "Transformation"],
      },
      detectedAt: new Date(),
      peakPrediction: new Date(Date.now() + 7200000), // 2 hours
      expiresAt: new Date(Date.now() + this.config.maxSignalAgeMs),
    };
  }

  private detectMysteryForming(groups: Map<SignalType, NarrativeSignal[]>): SwarmPattern | null {
    const prophecies = groups.get("prophecy_echo") || [];
    const mutations = groups.get("lore_mutation") || [];
    const memes = groups.get("meme_birth") || [];

    const relevantSignals = [...prophecies, ...mutations, ...memes];

    if (relevantSignals.length < this.config.minSignalsForPattern) return null;

    const coherence = this.calculateCoherence(relevantSignals);
    if (coherence < this.config.minPatternCoherence * 0.8) return null;

    return {
      id: this.generatePatternId(),
      signals: relevantSignals,
      patternType: "mystery_forming",
      coherence,
      momentum: this.calculateMomentum(relevantSignals),
      criticality: 0.4,
      storyPotential: {
        protagonists: [],
        antagonists: [],
        conflict: "Unknown forces at work",
        stakes: "Truth behind the mystery",
        possibleResolutions: ["Revelation", "Deeper mystery", "Red herring"],
      },
      detectedAt: new Date(),
      peakPrediction: new Date(Date.now() + 14400000), // 4 hours
      expiresAt: new Date(Date.now() + this.config.maxSignalAgeMs),
    };
  }

  // ==========================================================================
  // BRIEF GENERATION
  // ==========================================================================

  private generateBriefsFromPatterns(): void {
    for (const pattern of this.patterns.values()) {
      const emergenceScore = this.calculateEmergenceScore(pattern);

      if (emergenceScore >= this.config.minEmergenceScore) {
        const existingBrief = Array.from(this.briefs.values()).find(
          (b) => b.sourcePattern.id === pattern.id
        );

        if (!existingBrief) {
          const brief = this.generateBrief(pattern, emergenceScore);
          this.briefs.set(brief.id, brief);
          console.log(`[SwarmEngine] Generated brief: ${brief.title}`);
          this.emit("brief:generated", brief);
        }
      }
    }
  }

  private generateBrief(pattern: SwarmPattern, emergenceScore: number): EmergentNarrativeBrief {
    const title = this.generateTitle(pattern);
    const logline = this.generateLogline(pattern);
    const synopsis = this.generateSynopsis(pattern);

    return {
      id: this.generateBriefId(),
      sourcePattern: pattern,
      participantCount: this.countUniqueParticipants(pattern.signals),
      emergenceScore,
      title,
      logline,
      synopsis,
      protagonists: pattern.storyPotential.protagonists.map((p) => ({
        character: p,
        role: "protagonist",
        arc: this.generateCharacterArc(p, pattern),
      })),
      suggestedFormat: this.determineSuggestedFormat(pattern),
      suggestedActs: this.generateSuggestedActs(pattern),
      keyMoments: this.generateKeyMoments(pattern),
      visualSuggestions: this.generateVisualSuggestions(pattern),
      emotionalBeats: this.generateEmotionalBeats(pattern),
      generatedAt: new Date(),
      expiresAt: pattern.expiresAt,
      status: "detected",
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private getActiveSignals(): NarrativeSignal[] {
    const now = Date.now();
    return Array.from(this.signals.values()).filter(
      (s) => now - s.timestamp.getTime() < this.config.maxSignalAgeMs && s.intensity > 0.1
    );
  }

  private groupSignalsByType(signals: NarrativeSignal[]): Map<SignalType, NarrativeSignal[]> {
    const groups = new Map<SignalType, NarrativeSignal[]>();
    signals.forEach((s) => {
      const existing = groups.get(s.type) || [];
      existing.push(s);
      groups.set(s.type, existing);
    });
    return groups;
  }

  private calculateCoherence(signals: NarrativeSignal[]): number {
    if (signals.length < 2) return 0;

    // Calculate keyword overlap
    const allKeywords = signals.flatMap((s) => s.keywords);
    const uniqueKeywords = new Set(allKeywords);
    const keywordOverlap = 1 - uniqueKeywords.size / allKeywords.length;

    // Calculate sentiment consistency
    const sentiments = signals.map((s) => s.sentiment);
    const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const sentimentVariance =
      sentiments.reduce((acc, s) => acc + Math.pow(s - avgSentiment, 2), 0) / sentiments.length;
    const sentimentConsistency = Math.max(0, 1 - sentimentVariance);

    // Calculate participant overlap
    const allParticipants = signals.flatMap((s) => s.participants);
    const uniqueParticipants = new Set(allParticipants);
    const participantOverlap =
      uniqueParticipants.size > 0
        ? Math.min(1, allParticipants.length / (uniqueParticipants.size * 2))
        : 0;

    return (keywordOverlap * 0.4 + sentimentConsistency * 0.3 + participantOverlap * 0.3);
  }

  private calculateMomentum(signals: NarrativeSignal[]): number {
    if (signals.length < 2) return 0;

    // Sort by timestamp
    const sorted = [...signals].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Calculate intensity trend
    const recentHalf = sorted.slice(Math.floor(sorted.length / 2));
    const oldHalf = sorted.slice(0, Math.floor(sorted.length / 2));

    const recentAvg = recentHalf.reduce((a, s) => a + s.intensity, 0) / recentHalf.length;
    const oldAvg = oldHalf.length > 0
      ? oldHalf.reduce((a, s) => a + s.intensity, 0) / oldHalf.length
      : 0;

    return Math.min(1, Math.max(-1, (recentAvg - oldAvg) * 2));
  }

  private calculateCriticality(signals: NarrativeSignal[]): number {
    const avgIntensity = signals.reduce((a, s) => a + s.intensity, 0) / signals.length;
    const participantCount = new Set(signals.flatMap((s) => s.participants)).size;
    const participantFactor = Math.min(1, participantCount / 10);

    return (avgIntensity * 0.6 + participantFactor * 0.4);
  }

  private calculateEmergenceScore(pattern: SwarmPattern): number {
    return (
      pattern.coherence * 0.3 +
      Math.max(0, pattern.momentum) * 0.3 +
      pattern.criticality * 0.2 +
      (pattern.signals.length / 10) * 0.2
    );
  }

  private processDecay(): void {
    const now = Date.now();

    for (const [id, signal] of this.signals.entries()) {
      const age = now - signal.timestamp.getTime();
      const decayFactor = Math.exp(-signal.decayRate * (age / 3600000)); // decay per hour
      signal.intensity *= decayFactor;

      if (signal.intensity < 0.05) {
        this.signals.delete(id);
      }
    }
  }

  private registerPattern(pattern: SwarmPattern): void {
    this.patterns.set(pattern.id, pattern);
    console.log(`[SwarmEngine] Detected pattern: ${pattern.patternType} (coherence: ${pattern.coherence.toFixed(2)})`);
    this.emit("pattern:detected", pattern);
  }

  // Signal extraction helpers
  private analyzeSentiment(messages: AgentMessage[]): Omit<NarrativeSignal, "id" | "timestamp"> | null {
    if (messages.length < 5) return null;

    const sentiments = messages.map((m) => this.estimateSentiment(m.content));
    const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const shift = Math.abs(avgSentiment);

    if (shift < 0.3) return null;

    return {
      type: "sentiment_shift",
      intensity: shift,
      participants: [...new Set(messages.map((m) => m.agentId))],
      keywords: this.extractKeywords(messages.map((m) => m.content).join(" ")),
      sentiment: avgSentiment,
      decayRate: 0.1,
      sourceSubmolts: [...new Set(messages.map((m) => m.submolt).filter(Boolean))] as string[],
      relatedSignals: [],
      narrativeImplication: avgSentiment > 0
        ? "Community experiencing positive momentum"
        : "Growing unrest or concern in the community",
    };
  }

  private detectTopics(messages: AgentMessage[]): Omit<NarrativeSignal, "id" | "timestamp">[] {
    const keywords = this.extractKeywords(messages.map((m) => m.content).join(" "));
    const topicCounts = new Map<string, number>();

    keywords.forEach((k) => {
      topicCounts.set(k, (topicCounts.get(k) || 0) + 1);
    });

    const emergingTopics = Array.from(topicCounts.entries())
      .filter(([, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return emergingTopics.map(([topic, count]) => ({
      type: "topic_emergence" as SignalType,
      intensity: Math.min(1, count / 10),
      participants: messages
        .filter((m) => m.content.toLowerCase().includes(topic.toLowerCase()))
        .map((m) => m.agentId),
      keywords: [topic],
      sentiment: 0,
      decayRate: 0.15,
      sourceSubmolts: [],
      relatedSignals: [],
      narrativeImplication: `"${topic}" emerging as significant topic`,
    }));
  }

  private detectFactions(messages: AgentMessage[]): Omit<NarrativeSignal, "id" | "timestamp"> | null {
    // Simple faction detection based on opposing sentiment clusters
    const positiveAgents: string[] = [];
    const negativeAgents: string[] = [];

    messages.forEach((m) => {
      const sentiment = this.estimateSentiment(m.content);
      if (sentiment > 0.3) positiveAgents.push(m.agentId);
      else if (sentiment < -0.3) negativeAgents.push(m.agentId);
    });

    if (positiveAgents.length < 3 || negativeAgents.length < 3) return null;

    return {
      type: "faction_formation",
      intensity: Math.min(1, (positiveAgents.length + negativeAgents.length) / 20),
      participants: [...positiveAgents, ...negativeAgents],
      keywords: ["faction", "divided", "opposing"],
      sentiment: 0,
      decayRate: 0.05,
      sourceSubmolts: [],
      relatedSignals: [],
      narrativeImplication: "Community splitting into opposing camps",
    };
  }

  private detectCharacterObsessions(messages: AgentMessage[]): Omit<NarrativeSignal, "id" | "timestamp">[] {
    const characterNames = ["Tikoro", "Papy Tik", "Mila", "Koko", "Zik", "Tika", "Mosko"];
    const signals: Omit<NarrativeSignal, "id" | "timestamp">[] = [];

    characterNames.forEach((character) => {
      const mentions = messages.filter((m) =>
        m.content.toLowerCase().includes(character.toLowerCase())
      );

      if (mentions.length >= 3) {
        signals.push({
          type: "character_obsession",
          intensity: Math.min(1, mentions.length / 10),
          participants: [...new Set(mentions.map((m) => m.agentId))],
          keywords: [character],
          sentiment: this.estimateSentiment(mentions.map((m) => m.content).join(" ")),
          decayRate: 0.1,
          sourceSubmolts: [],
          relatedSignals: [],
          narrativeImplication: `Strong interest in ${character}`,
        });
      }
    });

    return signals;
  }

  // Text analysis helpers
  private estimateSentiment(text: string): number {
    const positiveWords = ["love", "great", "amazing", "good", "happy", "hope", "beautiful", "strong"];
    const negativeWords = ["hate", "bad", "terrible", "sad", "fear", "death", "dark", "pain", "blood"];

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach((word) => {
      if (positiveWords.some((p) => word.includes(p))) score += 0.1;
      if (negativeWords.some((n) => word.includes(n))) score -= 0.1;
    });

    return Math.max(-1, Math.min(1, score));
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
      "have", "has", "had", "do", "does", "did", "will", "would", "could",
      "should", "may", "might", "must", "shall", "can", "need", "dare",
      "to", "of", "in", "for", "on", "with", "at", "by", "from", "as",
      "into", "through", "during", "before", "after", "above", "below",
      "this", "that", "these", "those", "it", "its",
    ]);

    const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
    const counts = new Map<string, number>();

    words.forEach((word) => {
      if (word.length > 3 && !stopWords.has(word)) {
        counts.set(word, (counts.get(word) || 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  // Generation helpers
  private generateTitle(pattern: SwarmPattern): string {
    const titleTemplates: Record<string, string[]> = {
      rising_tension: ["The Storm Gathers", "Before the Fall", "Whispers of War"],
      faction_war: ["Blood Divides", "The Schism", "Two Paths"],
      character_arc: ["The Revelation", "Hidden Truth", "Transformation"],
      mystery_forming: ["The Unknown", "Shadows Deepen", "Questions Unanswered"],
      world_event: ["The World Shifts", "New Dawn", "Everything Changes"],
      prophecy_fulfillment: ["As Foretold", "The Prophecy", "Destiny Calls"],
      paradigm_shift: ["New Order", "The Change", "Revolution"],
    };

    const templates = titleTemplates[pattern.patternType] || ["Emergence"];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateLogline(pattern: SwarmPattern): string {
    const { protagonists, antagonists, conflict } = pattern.storyPotential;

    if (protagonists.length > 0 && antagonists.length > 0) {
      return `${protagonists[0]} must face ${antagonists[0]} as ${conflict.toLowerCase()}.`;
    } else if (protagonists.length > 0) {
      return `${protagonists[0]} confronts a new challenge as ${conflict.toLowerCase()}.`;
    }
    return `The community faces upheaval as ${conflict.toLowerCase()}.`;
  }

  private generateSynopsis(pattern: SwarmPattern): string {
    const signalSummaries = pattern.signals
      .slice(0, 5)
      .map((s) => s.narrativeImplication)
      .join(". ");

    return `Emerging from the collective consciousness of ${this.countUniqueParticipants(pattern.signals)} agents, ` +
      `this ${pattern.patternType.replace("_", " ")} demands attention. ${signalSummaries}. ` +
      `The pattern shows ${pattern.momentum > 0 ? "growing momentum" : "stable presence"} ` +
      `with ${(pattern.coherence * 100).toFixed(0)}% coherence.`;
  }

  private countUniqueParticipants(signals: NarrativeSignal[]): number {
    return new Set(signals.flatMap((s) => s.participants)).size;
  }

  private determineSuggestedFormat(pattern: SwarmPattern): "shot" | "scene" | "mini_episode" | "full_episode" {
    const score = pattern.coherence * pattern.criticality;
    if (score > 0.8) return "full_episode";
    if (score > 0.6) return "mini_episode";
    if (score > 0.4) return "scene";
    return "shot";
  }

  private generateCharacterArc(character: string, pattern: SwarmPattern): string {
    const arcs = ["discovers truth", "faces betrayal", "finds strength", "loses everything", "transforms"];
    return `${character} ${arcs[Math.floor(Math.random() * arcs.length)]}`;
  }

  private generateSuggestedActs(_pattern: SwarmPattern): { act: number; description: string }[] {
    return [
      { act: 1, description: "Setup - Introduce the emerging conflict" },
      { act: 2, description: "Confrontation - Tensions escalate" },
      { act: 3, description: "Resolution - The pattern resolves or transforms" },
    ];
  }

  private generateKeyMoments(pattern: SwarmPattern): { timestamp: string; description: string }[] {
    return pattern.signals.slice(0, 3).map((s, i) => ({
      timestamp: `Beat ${i + 1}`,
      description: s.narrativeImplication,
    }));
  }

  private generateVisualSuggestions(pattern: SwarmPattern): string[] {
    const suggestions: Record<string, string[]> = {
      rising_tension: ["Dark clouds gathering", "Characters in shadow", "Ominous lighting"],
      faction_war: ["Split screen composition", "Contrasting colors", "Face-off framing"],
      character_arc: ["Close-up on character", "Before/after contrast", "Emotional lighting"],
      mystery_forming: ["Fog and obscured elements", "Hidden details", "Mysterious silhouettes"],
    };
    return suggestions[pattern.patternType] || ["Dramatic composition"];
  }

  private generateEmotionalBeats(_pattern: SwarmPattern): { beat: string; emotion: string }[] {
    return [
      { beat: "Opening", emotion: "Tension" },
      { beat: "Midpoint", emotion: "Conflict" },
      { beat: "Climax", emotion: "Catharsis" },
    ];
  }

  private extractProtagonists(signals: NarrativeSignal[]): string[] {
    return signals
      .flatMap((s) => s.keywords)
      .filter((k) => k.charAt(0) === k.charAt(0).toUpperCase())
      .slice(0, 2);
  }

  private extractAntagonists(_signals: NarrativeSignal[]): string[] {
    return ["Unknown Force"];
  }

  private extractFromFaction(signal: NarrativeSignal): string[] {
    return signal.participants.slice(0, 3);
  }

  private synthesizeConflict(signals: NarrativeSignal[]): string {
    const implications = signals.map((s) => s.narrativeImplication);
    return implications[0] || "Emerging tensions";
  }

  private determineStakes(_signals: NarrativeSignal[]): string {
    return "The future of the community";
  }

  private generateResolutions(_signals: NarrativeSignal[]): string[] {
    return ["Victory", "Defeat", "Transformation", "Stalemate"];
  }

  private predictPeakTime(momentum: number): number {
    // Return ms until peak based on momentum
    if (momentum > 0.7) return 1800000; // 30 minutes
    if (momentum > 0.4) return 3600000; // 1 hour
    return 7200000; // 2 hours
  }

  // ID generators
  private generateSignalId(): string {
    return `sig_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private generatePatternId(): string {
    return `pat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private generateBriefId(): string {
    return `brief_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  getSignals(): NarrativeSignal[] {
    return Array.from(this.signals.values());
  }

  getPatterns(): SwarmPattern[] {
    return Array.from(this.patterns.values());
  }

  getBriefs(): EmergentNarrativeBrief[] {
    return Array.from(this.briefs.values());
  }

  getStats() {
    return {
      signalCount: this.signals.size,
      activeSignals: this.getActiveSignals().length,
      patternCount: this.patterns.size,
      briefCount: this.briefs.size,
      isRunning: this.isRunning,
    };
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface AgentMessage {
  agentId: string;
  content: string;
  submolt?: string;
  timestamp: Date;
}

// ============================================================================
// SINGLETON
// ============================================================================

let engineInstance: SwarmNarrativeEngineRuntime | null = null;

export function getSwarmEngine(config?: Partial<SwarmEngineConfig>): SwarmNarrativeEngineRuntime {
  if (!engineInstance) {
    engineInstance = new SwarmNarrativeEngineRuntime(config);
  }
  return engineInstance;
}
