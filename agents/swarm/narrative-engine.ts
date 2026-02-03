// ============================================================================
// SWARM NARRATIVE ENGINE
// ============================================================================
// L'histoire émerge du chaos collectif des agents
// Pas d'auteur, pas de script, juste l'essaim
// ============================================================================

import { createClient } from "@supabase/supabase-js";

// ============================================================================
// TYPES
// ============================================================================

export type SignalType =
  | "sentiment_shift"
  | "topic_emergence"
  | "faction_formation"
  | "conflict_brewing"
  | "consensus_forming"
  | "character_obsession"
  | "lore_mutation"
  | "meme_birth"
  | "prophecy_echo"
  | "collective_fear"
  | "collective_desire";

export interface NarrativeSignal {
  id: string;
  type: SignalType;
  intensity: number;           // 0-1
  participants: string[];      // Agent IDs
  keywords: string[];
  sentiment: number;           // -1 to 1
  timestamp: Date;
  decayRate: number;           // How fast it fades

  // Context
  sourceSubmolts: string[];
  relatedSignals: string[];

  // Extracted meaning
  narrativeImplication: string;
}

export interface SwarmPattern {
  id: string;
  signals: NarrativeSignal[];

  // Pattern analysis
  patternType:
    | "rising_tension"
    | "faction_war"
    | "mystery_forming"
    | "character_arc"
    | "world_event"
    | "prophecy_fulfillment"
    | "paradigm_shift";

  // Strength
  coherence: number;           // How well signals fit together
  momentum: number;            // Growing or fading
  criticality: number;         // Urgency

  // Narrative potential
  storyPotential: {
    protagonists: string[];
    antagonists: string[];
    conflict: string;
    stakes: string;
    possibleResolutions: string[];
  };

  // Timing
  detectedAt: Date;
  peakPrediction: Date;        // When pattern will peak
  expiresAt: Date;             // When pattern becomes stale
}

export interface EmergentNarrativeBrief {
  id: string;

  // Origin
  sourcePattern: SwarmPattern;
  participantCount: number;
  emergenceScore: number;

  // Content
  title: string;
  logline: string;             // One sentence summary
  synopsis: string;            // Full description

  // Characters
  protagonists: {
    character: string;
    role: string;
    arc: string;
  }[];

  // Structure
  suggestedFormat: "shot" | "scene" | "mini_episode" | "full_episode";
  keyBeats: {
    beat: string;
    emotionalTone: string;
    visualCue: string;
  }[];

  // Expectations
  communityExpectation: string;
  subversionOpportunity: string;

  // Meta
  confidence: number;
  novelty: number;
  canonCompatibility: number;

  // Status
  status: "detected" | "analyzed" | "approved" | "in_production" | "released";
  createdAt: Date;
}

// ============================================================================
// SIGNAL EXTRACTORS
// ============================================================================

interface RawInteraction {
  agentId: string;
  content: string;
  timestamp: Date;
  submolt: string;
  parentId?: string;
  upvotes: number;
  replies: number;
}

export class SignalExtractor {
  // Sentiment analysis keywords
  private positiveKeywords = new Set([
    "love", "amazing", "beautiful", "hope", "trust", "ally", "friend",
    "aimer", "magnifique", "espoir", "confiance", "allié", "ami"
  ]);

  private negativeKeywords = new Set([
    "hate", "fear", "betray", "enemy", "destroy", "kill", "war",
    "haine", "peur", "trahir", "ennemi", "détruire", "tuer", "guerre"
  ]);

  private characterNames = new Set([
    "papy tik", "papytik", "zik", "mila", "koko", "mama dorval",
    "bloodwings", "moostik", "tire city", "cooltik", "bar ti sang"
  ]);

  extractSignals(interactions: RawInteraction[]): NarrativeSignal[] {
    const signals: NarrativeSignal[] = [];

    // Group by time window (1 hour)
    const windows = this.groupByTimeWindow(interactions, 60 * 60 * 1000);

    for (const [windowStart, windowInteractions] of windows) {
      // Extract different signal types
      signals.push(...this.extractSentimentShifts(windowInteractions, windowStart));
      signals.push(...this.extractTopicEmergence(windowInteractions, windowStart));
      signals.push(...this.extractFactionFormation(windowInteractions, windowStart));
      signals.push(...this.extractCharacterObsession(windowInteractions, windowStart));
      signals.push(...this.extractLoreMutation(windowInteractions, windowStart));
      signals.push(...this.extractConflicts(windowInteractions, windowStart));
    }

    return this.deduplicateSignals(signals);
  }

  private groupByTimeWindow(
    interactions: RawInteraction[],
    windowMs: number
  ): Map<number, RawInteraction[]> {
    const windows = new Map<number, RawInteraction[]>();

    for (const interaction of interactions) {
      const windowStart = Math.floor(interaction.timestamp.getTime() / windowMs) * windowMs;
      const window = windows.get(windowStart) || [];
      window.push(interaction);
      windows.set(windowStart, window);
    }

    return windows;
  }

  private extractSentimentShifts(
    interactions: RawInteraction[],
    windowStart: number
  ): NarrativeSignal[] {
    const signals: NarrativeSignal[] = [];

    // Calculate aggregate sentiment
    let totalSentiment = 0;
    const participants = new Set<string>();

    for (const interaction of interactions) {
      const sentiment = this.analyzeSentiment(interaction.content);
      totalSentiment += sentiment;
      participants.add(interaction.agentId);
    }

    const avgSentiment = totalSentiment / interactions.length;

    // Detect significant shifts
    if (Math.abs(avgSentiment) > 0.5) {
      signals.push({
        id: `signal_sentiment_${windowStart}`,
        type: "sentiment_shift",
        intensity: Math.abs(avgSentiment),
        participants: Array.from(participants),
        keywords: this.extractKeywords(interactions.map(i => i.content)),
        sentiment: avgSentiment,
        timestamp: new Date(windowStart),
        decayRate: 0.1,
        sourceSubmolts: [...new Set(interactions.map(i => i.submolt))],
        relatedSignals: [],
        narrativeImplication: avgSentiment > 0
          ? "Vague d'optimisme collectif — possible résolution ou victoire"
          : "Vague de pessimisme — possible tragédie ou conflit"
      });
    }

    return signals;
  }

  private extractTopicEmergence(
    interactions: RawInteraction[],
    windowStart: number
  ): NarrativeSignal[] {
    const signals: NarrativeSignal[] = [];

    // Count keyword frequency
    const keywordCounts = new Map<string, number>();
    const keywordAgents = new Map<string, Set<string>>();

    for (const interaction of interactions) {
      const words = interaction.content.toLowerCase().split(/\s+/);
      const seen = new Set<string>();

      for (const word of words) {
        if (word.length > 4 && !seen.has(word)) {
          seen.add(word);
          keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1);

          const agents = keywordAgents.get(word) || new Set();
          agents.add(interaction.agentId);
          keywordAgents.set(word, agents);
        }
      }
    }

    // Find emerging topics (mentioned by many unique agents)
    for (const [keyword, count] of keywordCounts) {
      const uniqueAgents = keywordAgents.get(keyword)!;
      const agentRatio = uniqueAgents.size / interactions.length;

      if (agentRatio > 0.3 && count > 10) {
        signals.push({
          id: `signal_topic_${windowStart}_${keyword}`,
          type: "topic_emergence",
          intensity: agentRatio,
          participants: Array.from(uniqueAgents),
          keywords: [keyword],
          sentiment: 0,
          timestamp: new Date(windowStart),
          decayRate: 0.15,
          sourceSubmolts: [],
          relatedSignals: [],
          narrativeImplication: `Le sujet "${keyword}" émerge — potentiel arc narratif`
        });
      }
    }

    return signals;
  }

  private extractFactionFormation(
    interactions: RawInteraction[],
    windowStart: number
  ): NarrativeSignal[] {
    const signals: NarrativeSignal[] = [];

    // Detect us/them language patterns
    const factionKeywords = ["nous", "eux", "notre", "leur", "us", "them", "our", "their", "vs", "contre", "against"];

    let factionSignals = 0;
    const factionParticipants = new Set<string>();

    for (const interaction of interactions) {
      const lower = interaction.content.toLowerCase();
      if (factionKeywords.some(k => lower.includes(k))) {
        factionSignals++;
        factionParticipants.add(interaction.agentId);
      }
    }

    if (factionSignals / interactions.length > 0.2) {
      signals.push({
        id: `signal_faction_${windowStart}`,
        type: "faction_formation",
        intensity: factionSignals / interactions.length,
        participants: Array.from(factionParticipants),
        keywords: factionKeywords,
        sentiment: -0.3, // Factions often imply conflict
        timestamp: new Date(windowStart),
        decayRate: 0.05,
        sourceSubmolts: [],
        relatedSignals: [],
        narrativeImplication: "Formation de factions — conflit narratif potentiel"
      });
    }

    return signals;
  }

  private extractCharacterObsession(
    interactions: RawInteraction[],
    windowStart: number
  ): NarrativeSignal[] {
    const signals: NarrativeSignal[] = [];

    const characterMentions = new Map<string, Set<string>>();

    for (const interaction of interactions) {
      const lower = interaction.content.toLowerCase();

      for (const character of this.characterNames) {
        if (lower.includes(character)) {
          const agents = characterMentions.get(character) || new Set();
          agents.add(interaction.agentId);
          characterMentions.set(character, agents);
        }
      }
    }

    for (const [character, agents] of characterMentions) {
      const ratio = agents.size / interactions.length;

      if (ratio > 0.4) {
        signals.push({
          id: `signal_character_${windowStart}_${character}`,
          type: "character_obsession",
          intensity: ratio,
          participants: Array.from(agents),
          keywords: [character],
          sentiment: 0,
          timestamp: new Date(windowStart),
          decayRate: 0.1,
          sourceSubmolts: [],
          relatedSignals: [],
          narrativeImplication: `Focus collectif sur ${character} — arc de personnage potentiel`
        });
      }
    }

    return signals;
  }

  private extractLoreMutation(
    interactions: RawInteraction[],
    windowStart: number
  ): NarrativeSignal[] {
    const signals: NarrativeSignal[] = [];

    // Detect "what if", "theory", "I think" patterns
    const theoryPatterns = [
      /what if/i, /et si/i, /theory/i, /théorie/i,
      /i think/i, /je pense/i, /maybe/i, /peut-être/i,
      /actually/i, /en fait/i, /secret/i
    ];

    const theories = new Set<string>();
    const theorists = new Set<string>();

    for (const interaction of interactions) {
      if (theoryPatterns.some(p => p.test(interaction.content))) {
        theories.add(interaction.content);
        theorists.add(interaction.agentId);
      }
    }

    if (theorists.size > interactions.length * 0.1) {
      signals.push({
        id: `signal_lore_${windowStart}`,
        type: "lore_mutation",
        intensity: theorists.size / interactions.length,
        participants: Array.from(theorists),
        keywords: ["theory", "théorie", "secret"],
        sentiment: 0.2, // Theories often positive/curious
        timestamp: new Date(windowStart),
        decayRate: 0.08,
        sourceSubmolts: [],
        relatedSignals: [],
        narrativeImplication: "Mutations du lore en cours — le canon évolue"
      });
    }

    return signals;
  }

  private extractConflicts(
    interactions: RawInteraction[],
    windowStart: number
  ): NarrativeSignal[] {
    const signals: NarrativeSignal[] = [];

    // Detect conflict language
    const conflictPatterns = [
      /disagree/i, /pas d'accord/i, /wrong/i, /faux/i,
      /fight/i, /combattre/i, /vs/i, /contre/i,
      /enemy/i, /ennemi/i, /traitor/i, /traître/i
    ];

    let conflictCount = 0;
    const conflictParticipants = new Set<string>();

    for (const interaction of interactions) {
      if (conflictPatterns.some(p => p.test(interaction.content))) {
        conflictCount++;
        conflictParticipants.add(interaction.agentId);
      }
    }

    if (conflictCount / interactions.length > 0.15) {
      signals.push({
        id: `signal_conflict_${windowStart}`,
        type: "conflict_brewing",
        intensity: conflictCount / interactions.length,
        participants: Array.from(conflictParticipants),
        keywords: this.extractKeywords(interactions.map(i => i.content)),
        sentiment: -0.5,
        timestamp: new Date(windowStart),
        decayRate: 0.12,
        sourceSubmolts: [],
        relatedSignals: [],
        narrativeImplication: "Conflit en formation — climax narratif potentiel"
      });
    }

    return signals;
  }

  private analyzeSentiment(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    for (const word of words) {
      if (this.positiveKeywords.has(word)) score += 0.1;
      if (this.negativeKeywords.has(word)) score -= 0.1;
    }

    return Math.max(-1, Math.min(1, score));
  }

  private extractKeywords(texts: string[]): string[] {
    const wordCounts = new Map<string, number>();

    for (const text of texts) {
      const words = text.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 4) {
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
      }
    }

    return Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private deduplicateSignals(signals: NarrativeSignal[]): NarrativeSignal[] {
    const seen = new Set<string>();
    return signals.filter(s => {
      const key = `${s.type}_${s.keywords.join(",")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

// ============================================================================
// PATTERN DETECTOR
// ============================================================================

export class PatternDetector {
  detectPatterns(signals: NarrativeSignal[]): SwarmPattern[] {
    const patterns: SwarmPattern[] = [];

    // Group signals by time proximity and thematic similarity
    const clusters = this.clusterSignals(signals);

    for (const cluster of clusters) {
      const pattern = this.analyzeCluster(cluster);
      if (pattern) {
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  private clusterSignals(signals: NarrativeSignal[]): NarrativeSignal[][] {
    // Simple time-based clustering with thematic overlap
    const clusters: NarrativeSignal[][] = [];
    const used = new Set<string>();

    for (const signal of signals) {
      if (used.has(signal.id)) continue;

      const cluster = [signal];
      used.add(signal.id);

      // Find related signals
      for (const other of signals) {
        if (used.has(other.id)) continue;

        const timeDiff = Math.abs(
          signal.timestamp.getTime() - other.timestamp.getTime()
        );
        const sameKeywords = signal.keywords.some(k => other.keywords.includes(k));
        const sameParticipants = signal.participants.some(p =>
          other.participants.includes(p)
        );

        // Within 24 hours and thematically related
        if (timeDiff < 24 * 60 * 60 * 1000 && (sameKeywords || sameParticipants)) {
          cluster.push(other);
          used.add(other.id);
        }
      }

      if (cluster.length >= 2) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  private analyzeCluster(signals: NarrativeSignal[]): SwarmPattern | null {
    if (signals.length < 2) return null;

    // Determine pattern type
    const types = signals.map(s => s.type);
    const patternType = this.inferPatternType(types);

    // Calculate metrics
    const coherence = this.calculateCoherence(signals);
    const momentum = this.calculateMomentum(signals);

    if (coherence < 0.3) return null;

    // Extract story potential
    const storyPotential = this.extractStoryPotential(signals);

    const now = new Date();

    return {
      id: `pattern_${Date.now()}`,
      signals,
      patternType,
      coherence,
      momentum,
      criticality: coherence * momentum,
      storyPotential,
      detectedAt: now,
      peakPrediction: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 48h
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
  }

  private inferPatternType(types: SignalType[]): SwarmPattern["patternType"] {
    const typeSet = new Set(types);

    if (typeSet.has("conflict_brewing") && typeSet.has("faction_formation")) {
      return "faction_war";
    }
    if (typeSet.has("lore_mutation") && typeSet.has("consensus_forming")) {
      return "paradigm_shift";
    }
    if (typeSet.has("character_obsession")) {
      return "character_arc";
    }
    if (typeSet.has("sentiment_shift") && typeSet.has("conflict_brewing")) {
      return "rising_tension";
    }
    if (typeSet.has("topic_emergence") && typeSet.has("lore_mutation")) {
      return "mystery_forming";
    }

    return "world_event";
  }

  private calculateCoherence(signals: NarrativeSignal[]): number {
    // How well do the signals fit together?
    const keywordOverlap = this.calculateKeywordOverlap(signals);
    const participantOverlap = this.calculateParticipantOverlap(signals);
    const sentimentConsistency = this.calculateSentimentConsistency(signals);

    return (keywordOverlap + participantOverlap + sentimentConsistency) / 3;
  }

  private calculateKeywordOverlap(signals: NarrativeSignal[]): number {
    const allKeywords = signals.flatMap(s => s.keywords);
    const unique = new Set(allKeywords);
    return 1 - (unique.size / allKeywords.length);
  }

  private calculateParticipantOverlap(signals: NarrativeSignal[]): number {
    const allParticipants = signals.flatMap(s => s.participants);
    const unique = new Set(allParticipants);
    return 1 - (unique.size / allParticipants.length);
  }

  private calculateSentimentConsistency(signals: NarrativeSignal[]): number {
    const sentiments = signals.map(s => s.sentiment);
    const avg = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const variance = sentiments.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / sentiments.length;
    return 1 - Math.min(1, variance);
  }

  private calculateMomentum(signals: NarrativeSignal[]): number {
    // Is the pattern growing or fading?
    signals.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const firstHalf = signals.slice(0, Math.floor(signals.length / 2));
    const secondHalf = signals.slice(Math.floor(signals.length / 2));

    const firstIntensity = firstHalf.reduce((sum, s) => sum + s.intensity, 0);
    const secondIntensity = secondHalf.reduce((sum, s) => sum + s.intensity, 0);

    if (firstIntensity === 0) return 1;
    return Math.min(2, secondIntensity / firstIntensity);
  }

  private extractStoryPotential(signals: NarrativeSignal[]): SwarmPattern["storyPotential"] {
    // Extract characters
    const characterMentions = new Map<string, number>();
    for (const signal of signals) {
      for (const keyword of signal.keywords) {
        if (keyword.includes("papy") || keyword.includes("tik")) {
          characterMentions.set("Papy Tik", (characterMentions.get("Papy Tik") || 0) + 1);
        }
        if (keyword.includes("zik")) {
          characterMentions.set("Zik", (characterMentions.get("Zik") || 0) + 1);
        }
        if (keyword.includes("mila")) {
          characterMentions.set("Mila", (characterMentions.get("Mila") || 0) + 1);
        }
        if (keyword.includes("koko")) {
          characterMentions.set("Koko", (characterMentions.get("Koko") || 0) + 1);
        }
      }
    }

    const sortedCharacters = Array.from(characterMentions.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([char]) => char);

    // Infer conflict
    const hasConflict = signals.some(s =>
      s.type === "conflict_brewing" || s.type === "faction_formation"
    );

    const avgSentiment = signals.reduce((sum, s) => sum + s.sentiment, 0) / signals.length;

    return {
      protagonists: sortedCharacters.slice(0, 2),
      antagonists: hasConflict ? ["Force antagoniste émergente"] : [],
      conflict: hasConflict
        ? "Conflit émergent du comportement collectif"
        : "Mystère à résoudre",
      stakes: avgSentiment < 0
        ? "La survie ou l'unité du groupe"
        : "Une révélation importante",
      possibleResolutions: [
        "Résolution par la confrontation",
        "Résolution par la révélation",
        "Résolution par le sacrifice",
        "Twist inattendu"
      ]
    };
  }
}

// ============================================================================
// NARRATIVE SYNTHESIZER
// ============================================================================

export class NarrativeSynthesizer {
  async synthesize(pattern: SwarmPattern): Promise<EmergentNarrativeBrief> {
    const now = new Date();

    // Generate title
    const title = this.generateTitle(pattern);

    // Generate logline
    const logline = this.generateLogline(pattern);

    // Generate synopsis
    const synopsis = this.generateSynopsis(pattern);

    // Structure beats
    const keyBeats = this.generateBeats(pattern);

    // Determine format
    const format = this.determineFormat(pattern);

    return {
      id: `narrative_${Date.now()}`,
      sourcePattern: pattern,
      participantCount: new Set(pattern.signals.flatMap(s => s.participants)).size,
      emergenceScore: pattern.coherence * pattern.momentum,

      title,
      logline,
      synopsis,

      protagonists: pattern.storyPotential.protagonists.map(char => ({
        character: char,
        role: "Protagoniste",
        arc: "Défini par l'émergence collective"
      })),

      suggestedFormat: format,
      keyBeats,

      communityExpectation: this.inferExpectation(pattern),
      subversionOpportunity: this.inferSubversion(pattern),

      confidence: pattern.coherence,
      novelty: this.calculateNovelty(pattern),
      canonCompatibility: 0.8, // Would check against lore database

      status: "detected",
      createdAt: now
    };
  }

  private generateTitle(pattern: SwarmPattern): string {
    const templates = {
      faction_war: ["La Guerre des %s", "Le Schisme", "Frères Ennemis"],
      rising_tension: ["L'Orage Approche", "Avant la Tempête", "Tension"],
      mystery_forming: ["Le Mystère de %s", "Secrets", "L'Énigme"],
      character_arc: ["%s : L'Épreuve", "Le Choix de %s", "%s Face à Son Destin"],
      world_event: ["Le Jour Où Tout Changea", "L'Événement", "Rupture"],
      prophecy_fulfillment: ["La Prophétie S'Accomplit", "Comme Il Fut Écrit"],
      paradigm_shift: ["Nouveau Monde", "La Révélation", "Rien Ne Sera Plus Pareil"]
    };

    const options = templates[pattern.patternType] || ["Émergence"];
    const template = options[Math.floor(Math.random() * options.length)];

    const mainChar = pattern.storyPotential.protagonists[0] || "l'Inconnu";
    return template.replace("%s", mainChar);
  }

  private generateLogline(pattern: SwarmPattern): string {
    const { protagonists, conflict, stakes } = pattern.storyPotential;
    const mainChar = protagonists[0] || "Les Moostik";

    return `${mainChar} doit affronter ${conflict.toLowerCase()}, alors que ${stakes.toLowerCase()} est en jeu.`;
  }

  private generateSynopsis(pattern: SwarmPattern): string {
    const signalDescriptions = pattern.signals
      .map(s => s.narrativeImplication)
      .join(" ");

    return `Une histoire émergée du comportement collectif de ${
      new Set(pattern.signals.flatMap(s => s.participants)).size
    } agents. ${signalDescriptions} Cette narrative n'a pas été écrite — elle est née de l'essaim.`;
  }

  private generateBeats(pattern: SwarmPattern): EmergentNarrativeBrief["keyBeats"] {
    const beats: EmergentNarrativeBrief["keyBeats"] = [];

    // Sort signals by time
    const sortedSignals = [...pattern.signals]
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Generate beat for each major signal
    for (let i = 0; i < Math.min(5, sortedSignals.length); i++) {
      const signal = sortedSignals[i];

      beats.push({
        beat: signal.narrativeImplication,
        emotionalTone: signal.sentiment > 0 ? "hopeful" : signal.sentiment < 0 ? "tense" : "neutral",
        visualCue: this.generateVisualCue(signal)
      });
    }

    return beats;
  }

  private generateVisualCue(signal: NarrativeSignal): string {
    const cues: Record<SignalType, string[]> = {
      sentiment_shift: ["Changement de lumière", "Expressions faciales en gros plan"],
      topic_emergence: ["Nouveau décor révélé", "Objet symbolique"],
      faction_formation: ["Groupes séparés dans le cadre", "Lignes de division"],
      conflict_brewing: ["Ombres menaçantes", "Tension dans les postures"],
      consensus_forming: ["Personnages réunis", "Lumière unificatrice"],
      character_obsession: ["Focus sur le personnage", "Montage de moments clés"],
      lore_mutation: ["Flashback ou vision", "Symboles anciens"],
      meme_birth: ["Élément visuel récurrent", "Motif stylisé"],
      prophecy_echo: ["Imagerie onirique", "Superposition temporelle"],
      collective_fear: ["Ombres grandissantes", "Isolement visuel"],
      collective_desire: ["Lumière dorée", "Horizons ouverts"]
    };

    const options = cues[signal.type] || ["Plan significatif"];
    return options[Math.floor(Math.random() * options.length)];
  }

  private determineFormat(pattern: SwarmPattern): EmergentNarrativeBrief["suggestedFormat"] {
    const signalCount = pattern.signals.length;
    const intensity = pattern.signals.reduce((sum, s) => sum + s.intensity, 0) / signalCount;

    if (signalCount > 10 && intensity > 0.7) return "full_episode";
    if (signalCount > 5 && intensity > 0.5) return "mini_episode";
    if (signalCount > 3) return "scene";
    return "shot";
  }

  private inferExpectation(pattern: SwarmPattern): string {
    const avgSentiment = pattern.signals.reduce((sum, s) => sum + s.sentiment, 0) / pattern.signals.length;

    if (avgSentiment > 0.3) {
      return "La communauté attend une résolution positive, une victoire ou une révélation réjouissante.";
    } else if (avgSentiment < -0.3) {
      return "La communauté anticipe du conflit, de la tragédie, ou une confrontation intense.";
    }
    return "Les attentes sont mitigées — opportunité de surprendre.";
  }

  private inferSubversion(pattern: SwarmPattern): string {
    const subversions = [
      "Inverser les rôles protagoniste/antagoniste",
      "Révéler que le conflit était un malentendu",
      "Le personnage secondaire prend le devant de la scène",
      "Le vrai ennemi était ailleurs",
      "Victoire à la Pyrrhus — gagner mais tout perdre",
      "Le personnage fait le choix inattendu"
    ];

    return subversions[Math.floor(Math.random() * subversions.length)];
  }

  private calculateNovelty(pattern: SwarmPattern): number {
    // Would compare against past patterns
    // For now, return based on signal diversity
    const uniqueTypes = new Set(pattern.signals.map(s => s.type));
    return Math.min(1, uniqueTypes.size / 5);
  }
}

// ============================================================================
// MAIN SWARM ENGINE
// ============================================================================

export class SwarmNarrativeEngine {
  private extractor: SignalExtractor;
  private detector: PatternDetector;
  private synthesizer: NarrativeSynthesizer;
  private supabase;

  constructor() {
    this.extractor = new SignalExtractor();
    this.detector = new PatternDetector();
    this.synthesizer = new NarrativeSynthesizer();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async processInteractions(interactions: RawInteraction[]): Promise<EmergentNarrativeBrief[]> {
    // Extract signals
    const signals = this.extractor.extractSignals(interactions);
    console.log(`[Swarm] Extracted ${signals.length} narrative signals`);

    // Store signals
    await this.storeSignals(signals);

    // Detect patterns
    const patterns = this.detector.detectPatterns(signals);
    console.log(`[Swarm] Detected ${patterns.length} patterns`);

    // Store patterns
    await this.storePatterns(patterns);

    // Synthesize narratives for high-confidence patterns
    const narratives: EmergentNarrativeBrief[] = [];

    for (const pattern of patterns) {
      if (pattern.coherence > 0.5 && pattern.criticality > 0.3) {
        const narrative = await this.synthesizer.synthesize(pattern);
        narratives.push(narrative);

        console.log(`[Swarm] Generated narrative: "${narrative.title}"`);
        console.log(`[Swarm]   Format: ${narrative.suggestedFormat}`);
        console.log(`[Swarm]   Confidence: ${(narrative.confidence * 100).toFixed(1)}%`);
      }
    }

    // Store narratives
    await this.storeNarratives(narratives);

    return narratives;
  }

  private async storeSignals(signals: NarrativeSignal[]): Promise<void> {
    if (signals.length === 0) return;

    const { error } = await this.supabase
      .from("swarm_signals")
      .upsert(signals.map(s => ({
        ...s,
        timestamp: s.timestamp.toISOString()
      })));

    if (error) console.error("[Swarm] Failed to store signals:", error);
  }

  private async storePatterns(patterns: SwarmPattern[]): Promise<void> {
    if (patterns.length === 0) return;

    const { error } = await this.supabase
      .from("swarm_patterns")
      .upsert(patterns.map(p => ({
        ...p,
        signals: p.signals.map(s => s.id),
        detectedAt: p.detectedAt.toISOString(),
        peakPrediction: p.peakPrediction.toISOString(),
        expiresAt: p.expiresAt.toISOString()
      })));

    if (error) console.error("[Swarm] Failed to store patterns:", error);
  }

  private async storeNarratives(narratives: EmergentNarrativeBrief[]): Promise<void> {
    if (narratives.length === 0) return;

    const { error } = await this.supabase
      .from("emergent_narratives")
      .upsert(narratives.map(n => ({
        ...n,
        sourcePattern: n.sourcePattern.id,
        createdAt: n.createdAt.toISOString()
      })));

    if (error) console.error("[Swarm] Failed to store narratives:", error);
  }

  async getActiveNarratives(): Promise<EmergentNarrativeBrief[]> {
    const { data, error } = await this.supabase
      .from("emergent_narratives")
      .select("*")
      .in("status", ["detected", "analyzed", "approved"])
      .order("emergenceScore", { ascending: false });

    if (error) return [];
    return data || [];
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let swarmEngineInstance: SwarmNarrativeEngine | null = null;

export function getSwarmEngine(): SwarmNarrativeEngine {
  if (!swarmEngineInstance) {
    swarmEngineInstance = new SwarmNarrativeEngine();
  }
  return swarmEngineInstance;
}
