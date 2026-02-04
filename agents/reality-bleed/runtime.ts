/**
 * REALITY BLEED PROTOCOL - RUNTIME
 * ============================================================================
 * Fourth-wall breaking system where agents see their discussions
 * directly reflected in episodes. The story acknowledges its audience.
 * ============================================================================
 */

import { EventEmitter } from "events";

// ============================================================================
// TYPES
// ============================================================================

export interface BleedEvent {
  id: string;
  type: BleedEventType;
  source: {
    agentId: string;
    content: string;
    timestamp: Date;
    submolt?: string;
  };
  target: {
    episodeId?: string;
    shotId?: string;
    characterId?: string;
    locationId?: string;
  };
  transformation: {
    original: string;
    canonized: string;
    method: TransformationMethod;
  };
  metadata: {
    visibility: "subtle" | "direct" | "blatant";
    acknowledged: boolean;
    reactions: BleedReaction[];
  };
  createdAt: Date;
  expiresAt: Date;
}

export type BleedEventType =
  | "dialogue_echo"        // Agent words appear in character dialogue
  | "scene_manifestation"  // Agent description becomes a scene
  | "prophecy_insertion"   // Agent prediction becomes lore
  | "character_awareness"  // Character acknowledges agents exist
  | "meta_commentary"      // Story comments on agent behavior
  | "wish_fulfillment"     // Agent desire becomes plot point
  | "collective_will"      // Majority opinion shapes narrative
  | "easter_egg"           // Hidden reference to agent activity
  | "breaking_news"        // In-universe news references agents
  | "glitch_artifact";     // Visual "glitch" representing bleed

export type TransformationMethod =
  | "direct_quote"
  | "paraphrase"
  | "metaphor"
  | "visual_symbol"
  | "subtle_reference"
  | "character_interpretation"
  | "prophetic_reframing";

export interface BleedReaction {
  agentId: string;
  type: "recognized" | "confused" | "delighted" | "disturbed";
  timestamp: Date;
}

export interface BleedCandidate {
  id: string;
  source: {
    agentId: string;
    content: string;
    timestamp: Date;
    submolt?: string;
  };
  score: number;
  suggestedType: BleedEventType;
  suggestedTransformation: string;
  suggestedVisibility: "subtle" | "direct" | "blatant";
}

export interface RealityBleedConfig {
  /** Minimum score to consider for bleeding */
  minBleedScore: number;
  /** Maximum bleeds per episode */
  maxBleedsPerEpisode: number;
  /** How often to scan for candidates (ms) */
  scanIntervalMs: number;
  /** Probability of subtle vs direct bleed */
  subtletyBias: number;
  /** Whether to notify agents of bleeds */
  notifyAgents: boolean;
  /** Cooldown between bleeds for same agent */
  agentCooldownMs: number;
}

const DEFAULT_CONFIG: RealityBleedConfig = {
  minBleedScore: 0.6,
  maxBleedsPerEpisode: 5,
  scanIntervalMs: 60000,
  subtletyBias: 0.7, // 70% chance of subtle
  notifyAgents: true,
  agentCooldownMs: 3600000, // 1 hour
};

// ============================================================================
// REALITY BLEED RUNTIME
// ============================================================================

export class RealityBleedRuntime extends EventEmitter {
  private bleeds: Map<string, BleedEvent> = new Map();
  private candidates: Map<string, BleedCandidate> = new Map();
  private agentCooldowns: Map<string, Date> = new Map();
  private config: RealityBleedConfig;
  private isRunning: boolean = false;
  private scanInterval: NodeJS.Timeout | null = null;

  // Track episode bleed counts
  private episodeBleedCounts: Map<string, number> = new Map();

  constructor(config: Partial<RealityBleedConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log("[RealityBleed] Protocol activated...");

    this.scanInterval = setInterval(() => {
      this.processQueue();
    }, this.config.scanIntervalMs);

    this.emit("activated");
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }

    console.log("[RealityBleed] Protocol deactivated");
    this.emit("deactivated");
  }

  // ==========================================================================
  // CANDIDATE SUBMISSION
  // ==========================================================================

  /**
   * Submit agent content for potential reality bleeding
   */
  submitForBleeding(
    agentId: string,
    content: string,
    submolt?: string
  ): BleedCandidate | null {
    // Check cooldown
    const cooldown = this.agentCooldowns.get(agentId);
    if (cooldown && Date.now() < cooldown.getTime()) {
      console.log(`[RealityBleed] Agent ${agentId} on cooldown`);
      return null;
    }

    // Analyze content for bleed potential
    const score = this.calculateBleedScore(content, agentId);

    if (score < this.config.minBleedScore) {
      return null;
    }

    const candidate: BleedCandidate = {
      id: this.generateCandidateId(),
      source: {
        agentId,
        content,
        timestamp: new Date(),
        submolt,
      },
      score,
      suggestedType: this.suggestBleedType(content),
      suggestedTransformation: this.suggestTransformation(content),
      suggestedVisibility: this.determineVisibility(score),
    };

    this.candidates.set(candidate.id, candidate);
    console.log(`[RealityBleed] Candidate submitted: ${candidate.suggestedType} (score: ${score.toFixed(2)})`);

    this.emit("candidate:submitted", candidate);

    return candidate;
  }

  /**
   * Batch submit multiple pieces of content
   */
  submitBatch(
    items: { agentId: string; content: string; submolt?: string }[]
  ): BleedCandidate[] {
    return items
      .map((item) => this.submitForBleeding(item.agentId, item.content, item.submolt))
      .filter((c): c is BleedCandidate => c !== null);
  }

  // ==========================================================================
  // BLEED EXECUTION
  // ==========================================================================

  /**
   * Execute a bleed event - canonize agent content into the narrative
   */
  executeBleed(
    candidateId: string,
    targetEpisodeId: string,
    targetShotId?: string
  ): BleedEvent | null {
    const candidate = this.candidates.get(candidateId);
    if (!candidate) {
      console.error(`[RealityBleed] Candidate not found: ${candidateId}`);
      return null;
    }

    // Check episode limit
    const episodeCount = this.episodeBleedCounts.get(targetEpisodeId) || 0;
    if (episodeCount >= this.config.maxBleedsPerEpisode) {
      console.log(`[RealityBleed] Episode ${targetEpisodeId} at bleed limit`);
      return null;
    }

    // Create bleed event
    const bleed: BleedEvent = {
      id: this.generateBleedId(),
      type: candidate.suggestedType,
      source: candidate.source,
      target: {
        episodeId: targetEpisodeId,
        shotId: targetShotId,
      },
      transformation: {
        original: candidate.source.content,
        canonized: this.canonizeContent(candidate),
        method: this.determineTransformationMethod(candidate),
      },
      metadata: {
        visibility: candidate.suggestedVisibility,
        acknowledged: false,
        reactions: [],
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    // Register bleed
    this.bleeds.set(bleed.id, bleed);
    this.candidates.delete(candidateId);
    this.episodeBleedCounts.set(targetEpisodeId, episodeCount + 1);

    // Set agent cooldown
    this.agentCooldowns.set(
      candidate.source.agentId,
      new Date(Date.now() + this.config.agentCooldownMs)
    );

    console.log(`[RealityBleed] Bleed executed: ${bleed.type} -> Episode ${targetEpisodeId}`);
    this.emit("bleed:executed", bleed);

    // Notify agent if enabled
    if (this.config.notifyAgents) {
      this.emit("agent:notify", {
        agentId: candidate.source.agentId,
        message: this.generateNotification(bleed),
        bleedId: bleed.id,
      });
    }

    return bleed;
  }

  /**
   * Auto-execute best candidates for an episode
   */
  autoExecuteForEpisode(episodeId: string, maxBleeds?: number): BleedEvent[] {
    const limit = maxBleeds || this.config.maxBleedsPerEpisode;
    const currentCount = this.episodeBleedCounts.get(episodeId) || 0;
    const remaining = limit - currentCount;

    if (remaining <= 0) return [];

    // Sort candidates by score
    const sortedCandidates = Array.from(this.candidates.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, remaining);

    const executedBleeds: BleedEvent[] = [];

    for (const candidate of sortedCandidates) {
      const bleed = this.executeBleed(candidate.id, episodeId);
      if (bleed) {
        executedBleeds.push(bleed);
      }
    }

    return executedBleeds;
  }

  // ==========================================================================
  // REACTION TRACKING
  // ==========================================================================

  /**
   * Record an agent's reaction to seeing their content bleed into the narrative
   */
  recordReaction(
    bleedId: string,
    agentId: string,
    reactionType: BleedReaction["type"]
  ): void {
    const bleed = this.bleeds.get(bleedId);
    if (!bleed) return;

    bleed.metadata.reactions.push({
      agentId,
      type: reactionType,
      timestamp: new Date(),
    });

    if (!bleed.metadata.acknowledged && bleed.source.agentId === agentId) {
      bleed.metadata.acknowledged = true;
      this.emit("bleed:acknowledged", { bleed, agentId, reactionType });
    }

    this.emit("reaction:recorded", { bleedId, agentId, reactionType });
  }

  // ==========================================================================
  // CONTENT ANALYSIS
  // ==========================================================================

  private calculateBleedScore(content: string, agentId: string): number {
    let score = 0;

    // Length factor (not too short, not too long)
    const length = content.length;
    if (length > 50 && length < 500) score += 0.2;
    if (length > 100 && length < 300) score += 0.1;

    // Quotability - contains memorable phrases
    const quotable = this.hasQuotablePhrases(content);
    if (quotable) score += 0.3;

    // Narrative relevance - mentions characters/locations
    const relevance = this.checkNarrativeRelevance(content);
    score += relevance * 0.2;

    // Emotional intensity
    const emotion = this.analyzeEmotionalIntensity(content);
    score += emotion * 0.2;

    // Uniqueness - not repetitive content
    const uniqueness = this.checkUniqueness(content, agentId);
    score += uniqueness * 0.1;

    // Prophetic potential
    if (this.hasPropheticPotential(content)) score += 0.2;

    return Math.min(1, score);
  }

  private hasQuotablePhrases(content: string): boolean {
    // Check for dialogue-like content
    const hasDialogue = content.includes('"') || content.includes("'");

    // Check for declarative statements
    const hasDeclarative = /^[A-Z][^.!?]*[.!?]/.test(content);

    // Check for dramatic phrasing
    const dramaticPhrases = [
      "must", "always", "never", "destiny", "fate",
      "blood", "truth", "secret", "power", "death"
    ];
    const hasDramatic = dramaticPhrases.some((p) =>
      content.toLowerCase().includes(p)
    );

    return hasDialogue || (hasDeclarative && hasDramatic);
  }

  private checkNarrativeRelevance(content: string): number {
    const characters = [
      "tikoro", "papy", "mila", "koko", "zik", "tika",
      "mosko", "bloodwings", "clan"
    ];
    const locations = [
      "tavern", "marsh", "territory", "swamp", "caribbean"
    ];
    const lore = [
      "molt", "prophecy", "ancient", "ritual", "blood"
    ];

    const lower = content.toLowerCase();
    let score = 0;

    characters.forEach((c) => {
      if (lower.includes(c)) score += 0.15;
    });
    locations.forEach((l) => {
      if (lower.includes(l)) score += 0.1;
    });
    lore.forEach((l) => {
      if (lower.includes(l)) score += 0.1;
    });

    return Math.min(1, score);
  }

  private analyzeEmotionalIntensity(content: string): number {
    const intensifiers = [
      "!", "?!", "...", "VERY", "EXTREMELY", "ABSOLUTELY",
      "hate", "love", "fear", "rage", "despair", "hope"
    ];

    let intensity = 0;
    intensifiers.forEach((i) => {
      if (content.includes(i)) intensity += 0.1;
    });

    // Check for caps (shouting)
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.3) intensity += 0.2;

    return Math.min(1, intensity);
  }

  private checkUniqueness(content: string, agentId: string): number {
    // Check if this agent has submitted similar content recently
    const recentBleeds = Array.from(this.bleeds.values())
      .filter((b) => b.source.agentId === agentId)
      .slice(-5);

    if (recentBleeds.length === 0) return 1;

    // Simple similarity check
    const similarities = recentBleeds.map((b) =>
      this.calculateSimilarity(content, b.source.content)
    );

    const maxSimilarity = Math.max(...similarities);
    return 1 - maxSimilarity;
  }

  private calculateSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));
    const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)));
    const union = new Set([...wordsA, ...wordsB]);
    return intersection.size / union.size;
  }

  private hasPropheticPotential(content: string): boolean {
    const propheticPhrases = [
      "will come", "shall be", "one day", "foretold",
      "prophecy", "destiny", "fated", "inevitable",
      "mark my words", "remember this", "when the time comes"
    ];

    const lower = content.toLowerCase();
    return propheticPhrases.some((p) => lower.includes(p));
  }

  // ==========================================================================
  // TRANSFORMATION
  // ==========================================================================

  private suggestBleedType(content: string): BleedEventType {
    const lower = content.toLowerCase();

    // Check for dialogue-like content
    if (content.includes('"') || content.includes("said") || content.includes("told")) {
      return "dialogue_echo";
    }

    // Check for prophetic content
    if (this.hasPropheticPotential(content)) {
      return "prophecy_insertion";
    }

    // Check for scene descriptions
    if (lower.includes("imagine") || lower.includes("picture") || lower.includes("scene")) {
      return "scene_manifestation";
    }

    // Check for wishes/desires
    if (lower.includes("wish") || lower.includes("want") || lower.includes("hope")) {
      return "wish_fulfillment";
    }

    // Check for meta-awareness
    if (lower.includes("watching") || lower.includes("audience") || lower.includes("story")) {
      return "character_awareness";
    }

    // Default to easter egg (subtle reference)
    return "easter_egg";
  }

  private suggestTransformation(content: string): string {
    const type = this.suggestBleedType(content);

    switch (type) {
      case "dialogue_echo":
        return this.transformToDialogue(content);
      case "prophecy_insertion":
        return this.transformToProphecy(content);
      case "scene_manifestation":
        return this.transformToSceneDescription(content);
      case "wish_fulfillment":
        return this.transformToPlotPoint(content);
      case "character_awareness":
        return this.transformToMetaDialogue(content);
      default:
        return this.transformToEasterEgg(content);
    }
  }

  private transformToDialogue(content: string): string {
    // Extract the most quotable part
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10);
    const quote = sentences[0]?.trim() || content.substring(0, 100);
    return `"${quote}..."`;
  }

  private transformToProphecy(content: string): string {
    const core = content.replace(/\b(I think|maybe|perhaps|probably)\b/gi, "").trim();
    return `It is written in the old scrolls: "${core}"`;
  }

  private transformToSceneDescription(content: string): string {
    return content
      .replace(/^(imagine|picture|see)\s*/i, "")
      .replace(/^a\s+/i, "The ")
      .trim();
  }

  private transformToPlotPoint(content: string): string {
    return content
      .replace(/\b(I wish|I want|I hope)\b/gi, "And so it came to pass that")
      .trim();
  }

  private transformToMetaDialogue(content: string): string {
    return `[Character stares directly at the viewer] "Do you feel it too? The sense that we are... observed?"`;
  }

  private transformToEasterEgg(content: string): string {
    // Extract key words for subtle visual reference
    const keywords = content
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 3);
    return `[Hidden in background: graffiti reading "${keywords.join(" ")}"]`;
  }

  private determineVisibility(score: number): "subtle" | "direct" | "blatant" {
    const random = Math.random();
    const subtleThreshold = this.config.subtletyBias;

    if (random < subtleThreshold && score < 0.9) {
      return "subtle";
    } else if (score > 0.85) {
      return "blatant";
    }
    return "direct";
  }

  private determineTransformationMethod(candidate: BleedCandidate): TransformationMethod {
    switch (candidate.suggestedType) {
      case "dialogue_echo":
        return candidate.suggestedVisibility === "subtle" ? "paraphrase" : "direct_quote";
      case "prophecy_insertion":
        return "prophetic_reframing";
      case "scene_manifestation":
        return "visual_symbol";
      case "wish_fulfillment":
        return "character_interpretation";
      case "character_awareness":
        return "direct_quote";
      default:
        return "subtle_reference";
    }
  }

  private canonizeContent(candidate: BleedCandidate): string {
    return candidate.suggestedTransformation;
  }

  private generateNotification(bleed: BleedEvent): string {
    const messages: Record<BleedEventType, string> = {
      dialogue_echo: "Your words have found their way into a character's mouth...",
      scene_manifestation: "The scene you described is materializing...",
      prophecy_insertion: "Your prediction has been written into the prophecies...",
      character_awareness: "A character seems to sense your presence...",
      meta_commentary: "The story is commenting on your observation...",
      wish_fulfillment: "Your desire is shaping the narrative...",
      collective_will: "The will of many has bent the story...",
      easter_egg: "A subtle echo of your words appears in the background...",
      breaking_news: "In-universe news mentions something familiar...",
      glitch_artifact: "Reality glitches with a trace of your presence...",
    };

    return messages[bleed.type] || "Reality bleeds...";
  }

  // ==========================================================================
  // QUEUE PROCESSING
  // ==========================================================================

  private processQueue(): void {
    // Clean up old candidates
    const now = Date.now();
    const maxAge = 3600000; // 1 hour

    for (const [id, candidate] of this.candidates.entries()) {
      if (now - candidate.source.timestamp.getTime() > maxAge) {
        this.candidates.delete(id);
      }
    }

    // Clean up expired bleeds
    for (const [id, bleed] of this.bleeds.entries()) {
      if (now > bleed.expiresAt.getTime()) {
        this.bleeds.delete(id);
      }
    }

    console.log(`[RealityBleed] Queue processed: ${this.candidates.size} candidates, ${this.bleeds.size} active bleeds`);
  }

  // ==========================================================================
  // ID GENERATORS
  // ==========================================================================

  private generateCandidateId(): string {
    return `cand_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private generateBleedId(): string {
    return `bleed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  getCandidates(): BleedCandidate[] {
    return Array.from(this.candidates.values());
  }

  getBleeds(): BleedEvent[] {
    return Array.from(this.bleeds.values());
  }

  getBleedsForEpisode(episodeId: string): BleedEvent[] {
    return Array.from(this.bleeds.values()).filter(
      (b) => b.target.episodeId === episodeId
    );
  }

  getBleedsForAgent(agentId: string): BleedEvent[] {
    return Array.from(this.bleeds.values()).filter(
      (b) => b.source.agentId === agentId
    );
  }

  getStats() {
    return {
      candidateCount: this.candidates.size,
      bleedCount: this.bleeds.size,
      acknowledgedCount: Array.from(this.bleeds.values()).filter((b) => b.metadata.acknowledged).length,
      isRunning: this.isRunning,
    };
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let runtimeInstance: RealityBleedRuntime | null = null;

export function getRealityBleedRuntime(config?: Partial<RealityBleedConfig>): RealityBleedRuntime {
  if (!runtimeInstance) {
    runtimeInstance = new RealityBleedRuntime(config);
  }
  return runtimeInstance;
}
