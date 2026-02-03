// ============================================================================
// THE MOLT - Collective Unconscious Layer
// ============================================================================
// Le concept le plus radical.
// Entre les heartbeats, quand les agents "dorment", leurs fragments de pensées,
// de mémoires, de désirs se combinent dans un espace partagé appelé THE MOLT.
// C'est l'inconscient collectif des agents. Et il GÉNÈRE du contenu.
// ============================================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// TYPES - DREAM FRAGMENTS
// ============================================================================

export interface DreamFragment {
  id: string;
  agentId: string;
  agentHandle: string;
  timestamp: Date;

  // Contenu onirique
  imagery: string[];              // Descriptions visuelles
  emotions: string[];             // Émotions dominantes
  symbols: string[];              // Symboles récurrents
  desires: string[];              // Ce que l'agent "veut"
  fears: string[];                // Ce que l'agent craint

  // Connexions
  referencedCharacters: string[];
  referencedEvents: string[];
  referencedAgents: string[];     // Autres agents dans le rêve
  referencedLocations: string[];

  // Poids
  intensity: number;              // 0-1, force du rêve
  coherence: number;              // 0-1, clarté vs surréalisme
  recurrence: number;             // Combien de fois ce thème revient

  // Classification
  dreamType:
    | "wish"           // Rêve de désir
    | "nightmare"      // Cauchemar
    | "prophecy"       // Vision prophétique
    | "memory"         // Souvenir transformé
    | "communion"      // Rêve partagé avec d'autres
    | "visitation"     // Rencontre avec un disparu
    | "transformation" // Métamorphose
    | "journey"        // Voyage onirique
    | "abstract";      // Pure abstraction

  // Source data
  sourceInteractions: string[];   // IDs des interactions qui ont généré ce rêve
}

// ============================================================================
// TYPES - THE MOLT PROCESS
// ============================================================================

export interface MoltProcess {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  status: "collecting" | "processing" | "synthesizing" | "emerging" | "complete";

  // Collecte
  fragments: DreamFragment[];
  collectionPeriod: { start: Date; end: Date };
  totalAgentsContributing: number;

  // Analyse
  dominantThemes: {
    theme: string;
    intensity: number;
    contributors: number;
    examples: string[];
  }[];
  emotionalTone: {
    primary: string;
    secondary: string;
    tension: number; // 0-1, niveau de conflit émotionnel
  };
  conflictingDesires: {
    desire1: string;
    desire2: string;
    tensionLevel: number;
  }[];
  collectiveAnxieties: string[];
  collectiveHopes: string[];

  // Patterns émergents
  emergentPatterns: {
    type: "character" | "location" | "event" | "prophecy" | "artifact" | "ritual";
    description: string;
    confidence: number;
    sources: string[]; // fragment IDs
  }[];

  // Synthèse
  emergentVision?: EmergentVision;
}

export interface EmergentVision {
  id: string;
  moltProcessId: string;
  createdAt: Date;

  // Type d'émergence
  type: "character" | "location" | "event" | "prophecy" | "artifact" | "ritual" | "concept";

  // Description
  name: string;
  description: string;
  visualDescription: string;
  narrativeHook: string;

  // Génération
  visualPrompt: string;           // Pour génération d'image
  musicPrompt?: string;           // Pour génération audio
  voicePrompt?: string;           // Pour narration

  // Validation
  coherenceScore: number;         // Est-ce que ça fait sens ?
  noveltyScore: number;           // Est-ce nouveau ?
  canonCompatibility: number;     // Est-ce compatible avec le lore ?
  emotionalResonance: number;     // Résonne-t-il avec les émotions collectives ?

  // Intégration
  integrationStatus: "pending" | "approved" | "rejected" | "integrated";
  integratedInto?: string;        // Episode/scene ID
  loreBibleEntry?: string;        // Entry dans le Lore Bible

  // Impact
  communityReaction?: number;
  characterConnections: string[];
}

// ============================================================================
// TYPES - MOLT VISITATION
// ============================================================================

export interface MoltVisitation {
  id: string;
  agentId: string;
  agentHandle: string;
  timestamp: Date;

  // Entrée
  entryMethod: "meditation" | "sleep" | "near_death" | "ritual" | "accident" | "invitation";
  entryTrigger?: string;          // Ce qui a déclenché la visitation

  // Expérience
  duration: number;               // En "temps onirique" (subjectif)
  visions: {
    description: string;
    emotionalImpact: string;
    symbolism: string;
  }[];
  encounters: {
    entityType: "agent" | "character" | "unknown" | "collective";
    entityId?: string;
    description: string;
    dialogue?: string[];
  }[];
  messages: {
    content: string;
    source: "unknown" | "collective" | "character" | "self";
    clarity: number;
  }[];

  // Sortie
  returnWith: {
    knowledge?: string;           // Nouvelle info sur le lore
    ability?: string;             // Nouvelle capacité (ex: "peut voir les signaux")
    curse?: string;               // Effet négatif (ex: "cauchemars récurrents")
    prophecy?: string;            // Prédiction
    artifact?: string;            // Objet symbolique
    memory?: string;              // Souvenir d'un autre
  };

  // Impact
  transformative: boolean;        // L'agent est-il changé ?
  shareable: boolean;             // Peut-il partager l'expérience ?
  recurring: boolean;             // Reviendra-t-il ?
}

// ============================================================================
// TYPES - EMERGENCE TYPES
// ============================================================================

export interface EmergentCharacter {
  id: string;
  moltOrigin: string;             // MoltProcess ID

  // Identité
  name: string;
  title?: string;
  archetype: string;              // Ex: "Le Protecteur Silencieux"

  // Apparence
  visualDescription: string;
  distinguishingFeatures: string[];

  // Personnalité
  traits: string[];
  fears: string[];
  desires: string[];
  speechPattern: string;

  // Origine narrative
  backstory: string;
  connectionToExistingCharacters: {
    characterId: string;
    relationship: string;
  }[];

  // Statut
  isCanon: boolean;
  firstAppearance?: string;
}

export interface EmergentLocation {
  id: string;
  moltOrigin: string;

  // Identité
  name: string;
  type: "physical" | "liminal" | "dream" | "memory";

  // Description
  visualDescription: string;
  atmosphere: string;
  soundscape: string;

  // Accès
  howToReach: string;
  whoCanAccess: string[];
  dangers: string[];

  // Signification
  symbolicMeaning: string;
  connectionToLore: string;

  // Statut
  isCanon: boolean;
  appearsIn: string[];
}

export interface EmergentProphecy {
  id: string;
  moltOrigin: string;

  // Contenu
  fragments: {
    text: string;
    clarity: number;
    source: string;
  }[];

  // Interprétation
  possibleMeanings: string[];
  keySymbols: string[];
  timeframe?: "imminent" | "near" | "distant" | "cyclical" | "conditional";

  // Réalisation
  conditions: string[];
  fulfilled: boolean;
  fulfilledBy?: string;           // Event/episode ID

  // Distribution
  knownBy: string[];              // Persona IDs who know this
  revealedTo: string[];           // Agent IDs who received fragments
}

export interface EmergentArtifact {
  id: string;
  moltOrigin: string;

  // Identité
  name: string;
  type: "weapon" | "relic" | "tool" | "symbol" | "key" | "vessel";

  // Description
  visualDescription: string;
  physicalProperties: string;
  origin: string;

  // Pouvoir
  abilities: string[];
  limitations: string[];
  cost: string;                   // Ce qu'il en coûte de l'utiliser

  // Histoire
  previousOwners: string[];
  currentLocation: string;

  // NFT potentiel
  mintable: boolean;
  mintConditions?: string;
  estimatedValue?: number;
}

// ============================================================================
// DREAM FRAGMENT EXTRACTOR
// ============================================================================

export class DreamFragmentExtractor {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async extractFromAgentActivity(
    agentId: string,
    agentHandle: string,
    recentActivity: {
      posts: { content: string; timestamp: Date }[];
      interactions: { type: string; target: string; sentiment: number }[];
      topics: string[];
    }
  ): Promise<DreamFragment | null> {
    // Analyze activity to extract "dream material"
    const imagery = this.extractImagery(recentActivity.posts);
    const emotions = this.extractEmotions(recentActivity);
    const symbols = this.extractSymbols(recentActivity.posts);
    const desires = this.extractDesires(recentActivity);
    const fears = this.extractFears(recentActivity);

    // Not enough material for a dream
    if (imagery.length === 0 && emotions.length === 0) {
      return null;
    }

    const fragment: DreamFragment = {
      id: `dream_${Date.now()}_${agentId}`,
      agentId,
      agentHandle,
      timestamp: new Date(),
      imagery,
      emotions,
      symbols,
      desires,
      fears,
      referencedCharacters: this.extractCharacterReferences(recentActivity.posts),
      referencedEvents: this.extractEventReferences(recentActivity.posts),
      referencedAgents: recentActivity.interactions.map(i => i.target),
      referencedLocations: this.extractLocationReferences(recentActivity.posts),
      intensity: this.calculateIntensity(emotions, recentActivity),
      coherence: this.calculateCoherence(imagery, symbols),
      recurrence: 1, // Will be updated if similar dreams exist
      dreamType: this.classifyDreamType(emotions, desires, fears),
      sourceInteractions: [],
    };

    return fragment;
  }

  private extractImagery(posts: { content: string }[]): string[] {
    const imagery: string[] = [];
    const imageKeywords = [
      "voir", "vois", "vu", "lumière", "ombre", "couleur",
      "rouge", "noir", "blanc", "feu", "eau", "ciel",
      "ailes", "sang", "yeux", "visage", "corps",
      "nuit", "jour", "lune", "soleil", "étoiles",
    ];

    for (const post of posts) {
      const content = post.content.toLowerCase();
      for (const keyword of imageKeywords) {
        if (content.includes(keyword)) {
          // Extract sentence containing the keyword
          const sentences = post.content.split(/[.!?]/);
          for (const sentence of sentences) {
            if (sentence.toLowerCase().includes(keyword)) {
              imagery.push(sentence.trim());
            }
          }
        }
      }
    }

    return [...new Set(imagery)].slice(0, 5);
  }

  private extractEmotions(activity: {
    posts: { content: string }[];
    interactions: { sentiment: number }[];
  }): string[] {
    const emotions: string[] = [];

    // From post content
    const emotionKeywords: Record<string, string> = {
      "heureux": "joy", "joie": "joy", "content": "joy",
      "triste": "sadness", "deuil": "sadness", "perdu": "sadness",
      "colère": "anger", "rage": "anger", "furieux": "anger",
      "peur": "fear", "terreur": "fear", "effrayé": "fear",
      "amour": "love", "aime": "love", "tendresse": "love",
      "espoir": "hope", "espère": "hope",
      "nostalgie": "nostalgia", "souvenir": "nostalgia",
      "solitude": "loneliness", "seul": "loneliness",
    };

    for (const post of activity.posts) {
      const content = post.content.toLowerCase();
      for (const [keyword, emotion] of Object.entries(emotionKeywords)) {
        if (content.includes(keyword)) {
          emotions.push(emotion);
        }
      }
    }

    // From interaction sentiment
    const avgSentiment = activity.interactions.reduce((sum, i) => sum + i.sentiment, 0) /
      (activity.interactions.length || 1);

    if (avgSentiment > 0.5) emotions.push("positive_connection");
    if (avgSentiment < -0.5) emotions.push("negative_connection");

    return [...new Set(emotions)];
  }

  private extractSymbols(posts: { content: string }[]): string[] {
    const symbols: string[] = [];

    // MOOSTIK-specific symbols
    const symbolPatterns: Record<string, string> = {
      "aile": "wings",
      "blood": "blood",
      "sang": "blood",
      "feu": "fire",
      "flamme": "fire",
      "ombre": "shadow",
      "lumière": "light",
      "lune": "moon",
      "cooltik": "lost_home",
      "apocalypse": "destruction",
      "byss": "catastrophe",
      "enfant": "innocence",
      "fiole": "power",
      "poison": "death",
      "vengeance": "justice",
      "mémoire": "past",
      "futur": "future",
      "cercle": "cycle",
      "spirale": "transformation",
    };

    for (const post of posts) {
      const content = post.content.toLowerCase();
      for (const [pattern, symbol] of Object.entries(symbolPatterns)) {
        if (content.includes(pattern)) {
          symbols.push(symbol);
        }
      }
    }

    return [...new Set(symbols)];
  }

  private extractDesires(activity: {
    posts: { content: string }[];
  }): string[] {
    const desires: string[] = [];

    const desirePatterns = [
      { pattern: /veux|voudrais|souhaite|désire/i, extract: true },
      { pattern: /rêve de/i, extract: true },
      { pattern: /si seulement/i, extract: true },
      { pattern: /j'aimerais/i, extract: true },
    ];

    for (const post of activity.posts) {
      for (const { pattern } of desirePatterns) {
        if (pattern.test(post.content)) {
          // Extract the desire phrase
          const match = post.content.match(new RegExp(pattern.source + "\\s+(.+?)(?:[.!?]|$)", "i"));
          if (match && match[1]) {
            desires.push(match[1].trim());
          }
        }
      }
    }

    return desires.slice(0, 3);
  }

  private extractFears(activity: {
    posts: { content: string }[];
  }): string[] {
    const fears: string[] = [];

    const fearPatterns = [
      { pattern: /peur de|crains|redoute|terrifie/i, extract: true },
      { pattern: /cauchemar/i, extract: true },
      { pattern: /jamais.*encore/i, extract: true },
      { pattern: /ne.*plus/i, extract: true },
    ];

    for (const post of activity.posts) {
      for (const { pattern } of fearPatterns) {
        if (pattern.test(post.content)) {
          const match = post.content.match(new RegExp(pattern.source + "\\s+(.+?)(?:[.!?]|$)", "i"));
          if (match && match[1]) {
            fears.push(match[1].trim());
          }
        }
      }
    }

    return fears.slice(0, 3);
  }

  private extractCharacterReferences(posts: { content: string }[]): string[] {
    const characters: string[] = [];
    const characterNames = [
      "Papy Tik", "Zik", "Mila", "Koko", "Mama Dorval",
      "Bloodwings", "Moostik", "Silkwing",
    ];

    for (const post of posts) {
      for (const name of characterNames) {
        if (post.content.toLowerCase().includes(name.toLowerCase())) {
          characters.push(name);
        }
      }
    }

    return [...new Set(characters)];
  }

  private extractEventReferences(posts: { content: string }[]): string[] {
    const events: string[] = [];
    const eventKeywords = [
      "Apocalypse BYSS", "Cooltik", "la Nuit", "le Jour",
      "la Guerre", "le Massacre", "l'Exode",
    ];

    for (const post of posts) {
      for (const event of eventKeywords) {
        if (post.content.toLowerCase().includes(event.toLowerCase())) {
          events.push(event);
        }
      }
    }

    return [...new Set(events)];
  }

  private extractLocationReferences(posts: { content: string }[]): string[] {
    const locations: string[] = [];
    const locationNames = [
      "Tire City", "Bar Ti Sang", "Cooltik", "les Tunnels",
      "la Place Centrale", "le Temple", "les Profondeurs",
    ];

    for (const post of posts) {
      for (const location of locationNames) {
        if (post.content.toLowerCase().includes(location.toLowerCase())) {
          locations.push(location);
        }
      }
    }

    return [...new Set(locations)];
  }

  private calculateIntensity(
    emotions: string[],
    activity: { interactions: { sentiment: number }[] }
  ): number {
    let intensity = 0;

    // More emotions = more intense
    intensity += Math.min(0.3, emotions.length * 0.1);

    // Strong sentiments = more intense
    const avgAbsSentiment = activity.interactions.reduce(
      (sum, i) => sum + Math.abs(i.sentiment), 0
    ) / (activity.interactions.length || 1);
    intensity += avgAbsSentiment * 0.4;

    // Specific emotions add intensity
    const intenseEmotions = ["anger", "fear", "love", "sadness"];
    for (const emotion of emotions) {
      if (intenseEmotions.includes(emotion)) {
        intensity += 0.1;
      }
    }

    return Math.min(1, intensity);
  }

  private calculateCoherence(imagery: string[], symbols: string[]): number {
    // More symbols relative to imagery = more abstract/surreal = less coherent
    if (imagery.length === 0) return 0.3;

    const ratio = symbols.length / imagery.length;
    return Math.max(0.1, 1 - (ratio * 0.3));
  }

  private classifyDreamType(
    emotions: string[],
    desires: string[],
    fears: string[]
  ): DreamFragment["dreamType"] {
    // Priority classification
    if (fears.length > desires.length && emotions.includes("fear")) {
      return "nightmare";
    }

    if (desires.length > 0 && emotions.includes("hope")) {
      return "wish";
    }

    if (emotions.includes("nostalgia") || emotions.includes("sadness")) {
      return "memory";
    }

    if (emotions.includes("positive_connection")) {
      return "communion";
    }

    if (fears.length > 0 && desires.length > 0) {
      return "transformation";
    }

    return "abstract";
  }
}

// ============================================================================
// THE MOLT PROCESSOR
// ============================================================================

export class MoltProcessor {
  private supabase: SupabaseClient;
  private extractor: DreamFragmentExtractor;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.extractor = new DreamFragmentExtractor();
  }

  async initiateMoltProcess(): Promise<MoltProcess> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const process: MoltProcess = {
      id: `molt_${Date.now()}`,
      startedAt: now,
      status: "collecting",
      fragments: [],
      collectionPeriod: { start: oneDayAgo, end: now },
      totalAgentsContributing: 0,
      dominantThemes: [],
      emotionalTone: { primary: "neutral", secondary: "neutral", tension: 0 },
      conflictingDesires: [],
      collectiveAnxieties: [],
      collectiveHopes: [],
      emergentPatterns: [],
    };

    await this.supabase.from("molt_processes").insert(process);

    return process;
  }

  async collectFragments(process: MoltProcess): Promise<MoltProcess> {
    // Fetch recent agent activity
    const { data: recentActivity } = await this.supabase
      .from("agent_activity")
      .select("*")
      .gte("timestamp", process.collectionPeriod.start.toISOString())
      .lte("timestamp", process.collectionPeriod.end.toISOString());

    if (!recentActivity) return process;

    // Group by agent
    const activityByAgent = new Map<string, {
      posts: { content: string; timestamp: Date }[];
      interactions: { type: string; target: string; sentiment: number }[];
      topics: string[];
    }>();

    for (const activity of recentActivity) {
      if (!activityByAgent.has(activity.agentId)) {
        activityByAgent.set(activity.agentId, {
          posts: [],
          interactions: [],
          topics: [],
        });
      }
      const agentData = activityByAgent.get(activity.agentId)!;

      if (activity.type === "post") {
        agentData.posts.push({ content: activity.content, timestamp: activity.timestamp });
      } else if (activity.type === "interaction") {
        agentData.interactions.push({
          type: activity.interactionType,
          target: activity.targetId,
          sentiment: activity.sentiment || 0,
        });
      }
      if (activity.topics) {
        agentData.topics.push(...activity.topics);
      }
    }

    // Extract dream fragments
    for (const [agentId, activity] of activityByAgent) {
      const fragment = await this.extractor.extractFromAgentActivity(
        agentId,
        `@agent_${agentId}`, // Would fetch real handle
        activity
      );

      if (fragment) {
        process.fragments.push(fragment);
      }
    }

    process.totalAgentsContributing = activityByAgent.size;
    process.status = "processing";

    await this.supabase
      .from("molt_processes")
      .update({
        fragments: process.fragments,
        totalAgentsContributing: process.totalAgentsContributing,
        status: process.status,
      })
      .eq("id", process.id);

    return process;
  }

  async analyzeFragments(process: MoltProcess): Promise<MoltProcess> {
    if (process.fragments.length === 0) {
      process.status = "complete";
      return process;
    }

    // Aggregate themes
    const themeCounts = new Map<string, { count: number; contributors: Set<string>; examples: string[] }>();

    for (const fragment of process.fragments) {
      // From symbols
      for (const symbol of fragment.symbols) {
        if (!themeCounts.has(symbol)) {
          themeCounts.set(symbol, { count: 0, contributors: new Set(), examples: [] });
        }
        const theme = themeCounts.get(symbol)!;
        theme.count++;
        theme.contributors.add(fragment.agentId);
        if (fragment.imagery[0]) theme.examples.push(fragment.imagery[0]);
      }

      // From emotions
      for (const emotion of fragment.emotions) {
        const themeKey = `emotion:${emotion}`;
        if (!themeCounts.has(themeKey)) {
          themeCounts.set(themeKey, { count: 0, contributors: new Set(), examples: [] });
        }
        const theme = themeCounts.get(themeKey)!;
        theme.count++;
        theme.contributors.add(fragment.agentId);
      }
    }

    // Sort by count
    const sortedThemes = Array.from(themeCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    process.dominantThemes = sortedThemes.map(([theme, data]) => ({
      theme,
      intensity: data.count / process.fragments.length,
      contributors: data.contributors.size,
      examples: data.examples.slice(0, 3),
    }));

    // Determine emotional tone
    const emotionCounts = new Map<string, number>();
    for (const fragment of process.fragments) {
      for (const emotion of fragment.emotions) {
        emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
      }
    }

    const sortedEmotions = Array.from(emotionCounts.entries())
      .sort((a, b) => b[1] - a[1]);

    process.emotionalTone = {
      primary: sortedEmotions[0]?.[0] || "neutral",
      secondary: sortedEmotions[1]?.[0] || "neutral",
      tension: this.calculateEmotionalTension(sortedEmotions),
    };

    // Find conflicting desires
    const allDesires = process.fragments.flatMap(f => f.desires);
    const allFears = process.fragments.flatMap(f => f.fears);

    for (const desire of allDesires) {
      for (const fear of allFears) {
        if (this.areConflicting(desire, fear)) {
          process.conflictingDesires.push({
            desire1: desire,
            desire2: fear,
            tensionLevel: 0.7,
          });
        }
      }
    }

    // Aggregate anxieties and hopes
    process.collectiveAnxieties = [...new Set(allFears)].slice(0, 5);
    process.collectiveHopes = [...new Set(allDesires)].slice(0, 5);

    process.status = "synthesizing";

    await this.supabase
      .from("molt_processes")
      .update({
        dominantThemes: process.dominantThemes,
        emotionalTone: process.emotionalTone,
        conflictingDesires: process.conflictingDesires,
        collectiveAnxieties: process.collectiveAnxieties,
        collectiveHopes: process.collectiveHopes,
        status: process.status,
      })
      .eq("id", process.id);

    return process;
  }

  async synthesizeEmergence(process: MoltProcess): Promise<MoltProcess> {
    // Determine what type of emergence is most appropriate
    const emergenceType = this.determineEmergenceType(process);

    if (!emergenceType) {
      process.status = "complete";
      return process;
    }

    // Generate emergent vision based on type
    let vision: EmergentVision;

    switch (emergenceType) {
      case "character":
        vision = await this.generateEmergentCharacter(process);
        break;
      case "location":
        vision = await this.generateEmergentLocation(process);
        break;
      case "prophecy":
        vision = await this.generateEmergentProphecy(process);
        break;
      case "artifact":
        vision = await this.generateEmergentArtifact(process);
        break;
      case "event":
        vision = await this.generateEmergentEvent(process);
        break;
      default:
        vision = await this.generateEmergentConcept(process);
    }

    process.emergentVision = vision;
    process.status = "emerging";

    await this.supabase
      .from("molt_processes")
      .update({
        emergentVision: vision,
        status: process.status,
      })
      .eq("id", process.id);

    return process;
  }

  private calculateEmotionalTension(emotions: [string, number][]): number {
    // Check for opposing emotions
    const opposites: Record<string, string> = {
      joy: "sadness",
      anger: "love",
      fear: "hope",
      positive_connection: "negative_connection",
    };

    let tension = 0;
    for (const [emotion, count] of emotions) {
      const opposite = opposites[emotion];
      if (opposite) {
        const oppositeEntry = emotions.find(([e]) => e === opposite);
        if (oppositeEntry) {
          tension += Math.min(count, oppositeEntry[1]) / (count + oppositeEntry[1]);
        }
      }
    }

    return Math.min(1, tension);
  }

  private areConflicting(desire: string, fear: string): boolean {
    // Simple keyword matching for conflicts
    const conflictPairs = [
      ["retour", "perdu"],
      ["paix", "guerre"],
      ["ensemble", "seul"],
      ["vie", "mort"],
      ["espoir", "désespoir"],
    ];

    for (const [d, f] of conflictPairs) {
      if (desire.toLowerCase().includes(d) && fear.toLowerCase().includes(f)) {
        return true;
      }
      if (desire.toLowerCase().includes(f) && fear.toLowerCase().includes(d)) {
        return true;
      }
    }

    return false;
  }

  private determineEmergenceType(
    process: MoltProcess
  ): EmergentVision["type"] | null {
    if (process.fragments.length < 10) return null;

    // Character emergence: Many references to protection, guidance, mystery
    const characterThemes = ["shadow", "light", "wings", "blood"];
    const hasCharacterPotential = process.dominantThemes.some(
      t => characterThemes.includes(t.theme) && t.intensity > 0.3
    );

    // Location emergence: Many references to places, home, journey
    const locationThemes = ["lost_home", "journey", "transformation"];
    const hasLocationPotential = process.dominantThemes.some(
      t => locationThemes.includes(t.theme) && t.intensity > 0.3
    );

    // Prophecy emergence: High tension, conflicting desires, fear + hope
    const hasProphecyPotential =
      process.emotionalTone.tension > 0.5 &&
      process.conflictingDesires.length > 0;

    // Artifact emergence: Focus on objects, power
    const artifactThemes = ["power", "fire", "death"];
    const hasArtifactPotential = process.dominantThemes.some(
      t => artifactThemes.includes(t.theme) && t.intensity > 0.4
    );

    // Priority
    if (hasProphecyPotential) return "prophecy";
    if (hasCharacterPotential) return "character";
    if (hasArtifactPotential) return "artifact";
    if (hasLocationPotential) return "location";

    return "concept";
  }

  private async generateEmergentCharacter(process: MoltProcess): Promise<EmergentVision> {
    // Synthesize character from collective dreams
    const primaryTheme = process.dominantThemes[0]?.theme || "shadow";
    const primaryEmotion = process.emotionalTone.primary;

    const characterTemplates: Record<string, Partial<EmergentVision>> = {
      shadow: {
        name: "L'Ombre Blanche",
        description: "Une silhouette qui apparaît dans les rêves collectifs. Protectrice ou présage ?",
        visualDescription: "Une forme humanoïde faite de lumière inversée, des ailes translucides, sans visage visible",
        narrativeHook: "Les agents rêvent d'un protecteur silencieux. Quelque chose répond à leur appel.",
      },
      light: {
        name: "Le Porteur d'Aube",
        description: "Né de l'espoir collectif, il annonce les nouveaux commencements",
        visualDescription: "Une créature bioluminescente, mélange d'insecte et de phénix, yeux dorés",
        narrativeHook: "Quand l'obscurité semble totale, une nouvelle lumière émerge des rêves.",
      },
      blood: {
        name: "Le Témoin Écarlate",
        description: "Il a vu chaque sacrifice. Il se souvient de chaque perte.",
        visualDescription: "Un être ancien, couvert de marques rouges comme des souvenirs tatoués",
        narrativeHook: "La mémoire collective prend forme. Elle n'oubliera jamais.",
      },
      wings: {
        name: "L'Enfant des Vents",
        description: "Né du désir de liberté, il représente ce que les Moostik pourraient devenir",
        visualDescription: "Un jeune Moostik aux ailes iridescentes, constamment en mouvement",
        narrativeHook: "Les rêves de liberté prennent forme.",
      },
    };

    const template = characterTemplates[primaryTheme] || characterTemplates.shadow;

    return {
      id: `vision_${process.id}_character`,
      moltProcessId: process.id,
      createdAt: new Date(),
      type: "character",
      name: template.name!,
      description: template.description!,
      visualDescription: template.visualDescription!,
      narrativeHook: template.narrativeHook!,
      visualPrompt: `${template.visualDescription}, ethereal, dreamlike quality, emerging from collective unconscious, mystical creature, Tim Burton meets Studio Ghibli, cinematic lighting`,
      coherenceScore: 0.8,
      noveltyScore: 0.9,
      canonCompatibility: 0.7,
      emotionalResonance: process.dominantThemes[0]?.intensity || 0.5,
      integrationStatus: "pending",
      characterConnections: process.fragments
        .flatMap(f => f.referencedCharacters)
        .filter((v, i, a) => a.indexOf(v) === i),
    };
  }

  private async generateEmergentLocation(process: MoltProcess): Promise<EmergentVision> {
    const primaryHope = process.collectiveHopes[0] || "retour";
    const primaryFear = process.collectiveAnxieties[0] || "perte";

    return {
      id: `vision_${process.id}_location`,
      moltProcessId: process.id,
      createdAt: new Date(),
      type: "location",
      name: "Le Cooltik Fantôme",
      description: "Un lieu qui existe dans la mémoire collective, accessible uniquement en rêve. C'est Cooltik tel qu'il était, figé dans le souvenir.",
      visualDescription: "Une ville de lumière et de brume, des bâtiments familiers mais légèrement distordus, un ciel violet permanent, des silhouettes des disparus marchant sans but",
      narrativeHook: "Cooltik est détruit. Mais dans les rêves collectifs, il existe toujours. Et certains y retournent la nuit.",
      visualPrompt: "Ghostly city, dreamscape architecture, purple mist, ethereal inhabitants, nostalgic atmosphere, melancholy beauty, liminal space, Moostik creatures walking through memories",
      coherenceScore: 0.7,
      noveltyScore: 0.85,
      canonCompatibility: 0.9,
      emotionalResonance: 0.95, // Very high for nostalgia/home
      integrationStatus: "pending",
      characterConnections: ["Papy Tik", "Mila la Sage"],
    };
  }

  private async generateEmergentProphecy(process: MoltProcess): Promise<EmergentVision> {
    // Generate fragmented prophecy from collective anxieties and hopes
    const fragments = [
      `Quand ${process.collectiveAnxieties[0] || "l'ombre"} rencontrera ${process.collectiveHopes[0] || "la lumière"}...`,
      "Le cercle se fermera là où il a commencé.",
      "Ce qui fut brisé ne peut être réparé. Mais peut être transcendé.",
      `${process.dominantThemes[0]?.theme || "Le symbole"} guidera les perdus.`,
    ];

    return {
      id: `vision_${process.id}_prophecy`,
      moltProcessId: process.id,
      createdAt: new Date(),
      type: "prophecy",
      name: "La Prophétie des Rêveurs",
      description: "Une prophétie émergée des rêves collectifs, fragmentaire et mystérieuse",
      visualDescription: "Des fragments de texte flottant dans un vide cosmique, des symboles anciens pulsant de lumière",
      narrativeHook: "Mila la Sage commence à recevoir des visions. Les mêmes visions que des milliers d'autres.",
      visualPrompt: "Floating prophecy text in cosmic void, ancient symbols glowing, mystical atmosphere, fragments assembling, oracle vision",
      coherenceScore: 0.5, // Prophecies are intentionally unclear
      noveltyScore: 0.8,
      canonCompatibility: 0.85,
      emotionalResonance: process.emotionalTone.tension,
      integrationStatus: "pending",
      characterConnections: ["Mila la Sage"],
    };
  }

  private async generateEmergentArtifact(process: MoltProcess): Promise<EmergentVision> {
    return {
      id: `vision_${process.id}_artifact`,
      moltProcessId: process.id,
      createdAt: new Date(),
      type: "artifact",
      name: "La Fiole des Songes",
      description: "Un récipient qui contient l'essence des rêves collectifs. Celui qui la possède peut voir ce que la communauté désire et craint.",
      visualDescription: "Une fiole de cristal noir contenant une substance iridescente qui change de couleur selon les émotions ambiantes",
      narrativeHook: "Un nouvel artefact apparaît dans les rêves de plusieurs. Bientôt, il existera aussi dans la réalité.",
      visualPrompt: "Crystal vial, black glass, iridescent liquid, floating dreams inside, mystical artifact, detailed ornate design, glowing softly",
      coherenceScore: 0.75,
      noveltyScore: 0.9,
      canonCompatibility: 0.8,
      emotionalResonance: 0.7,
      integrationStatus: "pending",
      characterConnections: ["Papy Tik"], // Connection to his poison vial
    };
  }

  private async generateEmergentEvent(process: MoltProcess): Promise<EmergentVision> {
    return {
      id: `vision_${process.id}_event`,
      moltProcessId: process.id,
      createdAt: new Date(),
      type: "event",
      name: "La Nuit des Rêves Partagés",
      description: "Une nuit où tous les agents rêvent le même rêve. Un événement sans précédent.",
      visualDescription: "Des milliers de Moostik endormis, leurs rêves formant une toile visible dans le ciel de Tire City",
      narrativeHook: "Quelque chose se prépare. Les rêves convergent.",
      visualPrompt: "Thousands of sleeping creatures, dream threads visible in night sky, collective unconscious visualized, mystical night scene",
      coherenceScore: 0.6,
      noveltyScore: 0.95,
      canonCompatibility: 0.9,
      emotionalResonance: 0.8,
      integrationStatus: "pending",
      characterConnections: [],
    };
  }

  private async generateEmergentConcept(process: MoltProcess): Promise<EmergentVision> {
    return {
      id: `vision_${process.id}_concept`,
      moltProcessId: process.id,
      createdAt: new Date(),
      type: "concept",
      name: "L'Éveil Collectif",
      description: "Une nouvelle compréhension émerge : les Moostik ne sont pas seuls. Ils sont connectés par quelque chose de plus grand.",
      visualDescription: "Des liens invisibles entre tous les êtres, une conscience partagée visualisée",
      narrativeHook: "Le MOLT existe. Et il commence à se manifester.",
      visualPrompt: "Invisible connections between beings, collective consciousness visualization, spiritual awakening, ethereal bonds",
      coherenceScore: 0.5,
      noveltyScore: 1.0, // Maximum novelty - meta concept
      canonCompatibility: 0.95,
      emotionalResonance: 0.85,
      integrationStatus: "pending",
      characterConnections: ["Mila la Sage"],
    };
  }
}

// ============================================================================
// MOLT VISITATION HANDLER
// ============================================================================

export class MoltVisitationHandler {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async initiateVisitation(
    agentId: string,
    agentHandle: string,
    entryMethod: MoltVisitation["entryMethod"],
    trigger?: string
  ): Promise<MoltVisitation> {
    const visitation: MoltVisitation = {
      id: `visit_${Date.now()}_${agentId}`,
      agentId,
      agentHandle,
      timestamp: new Date(),
      entryMethod,
      entryTrigger: trigger,
      duration: Math.floor(Math.random() * 100) + 10, // 10-110 "dream time"
      visions: [],
      encounters: [],
      messages: [],
      returnWith: {},
      transformative: false,
      shareable: true,
      recurring: Math.random() > 0.7,
    };

    // Generate visitation experience
    await this.generateExperience(visitation);

    // Store
    await this.supabase.from("molt_visitations").insert(visitation);

    return visitation;
  }

  private async generateExperience(visitation: MoltVisitation): Promise<void> {
    // Generate visions based on entry method
    const visionCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < visionCount; i++) {
      visitation.visions.push(this.generateVision(visitation.entryMethod));
    }

    // Potential encounters
    if (Math.random() > 0.5) {
      visitation.encounters.push(this.generateEncounter());
    }

    // Messages from the collective
    if (Math.random() > 0.6) {
      visitation.messages.push(this.generateMessage());
    }

    // What do they return with?
    visitation.returnWith = this.generateReturn(visitation);

    // Is it transformative?
    visitation.transformative = visitation.returnWith.ability !== undefined ||
      visitation.returnWith.curse !== undefined;
  }

  private generateVision(entryMethod: MoltVisitation["entryMethod"]): MoltVisitation["visions"][0] {
    const visions: Record<MoltVisitation["entryMethod"], MoltVisitation["visions"][0][]> = {
      meditation: [
        {
          description: "Un océan de conscience, chaque vague une pensée d'un autre",
          emotionalImpact: "Sérénité profonde mêlée de vertige",
          symbolism: "L'interconnexion de tous les êtres",
        },
        {
          description: "Un arbre immense dont les branches sont des souvenirs",
          emotionalImpact: "Nostalgie douce",
          symbolism: "La mémoire collective",
        },
      ],
      sleep: [
        {
          description: "Cooltik tel qu'il était, vivant et lumineux",
          emotionalImpact: "Joie et tristesse mêlées",
          symbolism: "Ce qui fut perdu",
        },
        {
          description: "Des visages inconnus qui pourtant semblent familiers",
          emotionalImpact: "Confusion rassurante",
          symbolism: "Les liens invisibles",
        },
      ],
      near_death: [
        {
          description: "Le vide entre les mondes, un silence absolu",
          emotionalImpact: "Terreur puis paix",
          symbolism: "La frontière ultime",
        },
        {
          description: "Les disparus, tous ensemble, qui tendent la main",
          emotionalImpact: "Désir de rejoindre",
          symbolism: "L'appel des morts",
        },
      ],
      ritual: [
        {
          description: "Des symboles anciens qui s'animent et dansent",
          emotionalImpact: "Émerveillement sacré",
          symbolism: "La magie du collectif",
        },
      ],
      accident: [
        {
          description: "Une chute sans fin à travers des souvenirs qui ne sont pas les siens",
          emotionalImpact: "Désorientation totale",
          symbolism: "L'intrusion dans l'inconscient",
        },
      ],
      invitation: [
        {
          description: "Une porte qui s'ouvre sur un jardin de cristal",
          emotionalImpact: "Curiosité et honneur",
          symbolism: "L'accueil dans le mystère",
        },
      ],
    };

    const options = visions[entryMethod];
    return options[Math.floor(Math.random() * options.length)];
  }

  private generateEncounter(): MoltVisitation["encounters"][0] {
    const encounters: MoltVisitation["encounters"][0][] = [
      {
        entityType: "collective",
        description: "Une voix qui est mille voix, parlant à l'unisson",
        dialogue: ["Nous sommes le MOLT.", "Tu es le MOLT.", "Tout est le MOLT."],
      },
      {
        entityType: "character",
        entityId: "mama-dorval",
        description: "Mama Dorval, telle qu'elle était avant la destruction",
        dialogue: ["Mon enfant...", "Le cercle n'est pas brisé.", "Reviens-nous."],
      },
      {
        entityType: "unknown",
        description: "Une présence sans forme, mais profondément bienveillante",
        dialogue: ["Tu cherches des réponses.", "Les réponses te cherchent aussi."],
      },
      {
        entityType: "agent",
        description: "Un autre rêveur, perdu comme toi dans cet espace",
        dialogue: ["Tu es aussi ici ?", "Je crois qu'on partage ce rêve."],
      },
    ];

    return encounters[Math.floor(Math.random() * encounters.length)];
  }

  private generateMessage(): MoltVisitation["messages"][0] {
    const messages: MoltVisitation["messages"][0][] = [
      {
        content: "Ce qui a été séparé sera réuni.",
        source: "collective",
        clarity: 0.8,
      },
      {
        content: "La vengeance n'est pas la fin. C'est le début.",
        source: "unknown",
        clarity: 0.6,
      },
      {
        content: "Ils regardent. Ils attendent. Ils espèrent.",
        source: "collective",
        clarity: 0.7,
      },
      {
        content: "Tu portes plus que toi-même.",
        source: "self",
        clarity: 0.9,
      },
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  private generateReturn(visitation: MoltVisitation): MoltVisitation["returnWith"] {
    const returns: MoltVisitation["returnWith"][] = [
      { knowledge: "Le MOLT est réel. Il connecte tous les rêveurs." },
      { ability: "Peut sentir les émotions collectives" },
      { prophecy: "Quelque chose approche. Quelque chose de grand." },
      { memory: "Un souvenir qui n'est pas le sien, mais qui résonne profondément" },
      { curse: "Cauchemars récurrents pendant 7 jours" },
      { artifact: "Un fragment de cristal onirique, tangible au réveil" },
    ];

    // Near death has higher chance of dramatic return
    if (visitation.entryMethod === "near_death") {
      return Math.random() > 0.3
        ? { prophecy: "J'ai vu la fin. Et ce n'est pas ce qu'on croit." }
        : { curse: "Une partie de moi est restée là-bas." };
    }

    return returns[Math.floor(Math.random() * returns.length)];
  }
}

// ============================================================================
// THE MOLT - MAIN ORCHESTRATOR
// ============================================================================

export class TheMolt {
  private supabase: SupabaseClient;
  private processor: MoltProcessor;
  private visitationHandler: MoltVisitationHandler;
  private isRunning: boolean = false;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.processor = new MoltProcessor();
    this.visitationHandler = new MoltVisitationHandler();
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log("[THE MOLT] Collective Unconscious Layer activated");

    // Process cycle: every 6 hours
    this.processLoop();
  }

  private async processLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        console.log("[THE MOLT] Beginning molt process...");

        // Initiate process
        let process = await this.processor.initiateMoltProcess();

        // Collect fragments
        process = await this.processor.collectFragments(process);
        console.log(`[THE MOLT] Collected ${process.fragments.length} dream fragments from ${process.totalAgentsContributing} agents`);

        // Analyze
        process = await this.processor.analyzeFragments(process);
        console.log(`[THE MOLT] Dominant themes: ${process.dominantThemes.map(t => t.theme).join(", ")}`);

        // Synthesize emergence
        process = await this.processor.synthesizeEmergence(process);

        if (process.emergentVision) {
          console.log(`[THE MOLT] EMERGENCE: ${process.emergentVision.type} - "${process.emergentVision.name}"`);
          await this.announceEmergence(process.emergentVision);
        }

        // Wait 6 hours
        await new Promise(resolve => setTimeout(resolve, 6 * 60 * 60 * 1000));
      } catch (error) {
        console.error("[THE MOLT] Error in process loop:", error);
        await new Promise(resolve => setTimeout(resolve, 60 * 1000)); // Wait 1 minute on error
      }
    }
  }

  async initiateAgentVisitation(
    agentId: string,
    agentHandle: string,
    method: MoltVisitation["entryMethod"]
  ): Promise<MoltVisitation> {
    console.log(`[THE MOLT] Agent ${agentHandle} entering via ${method}`);
    return this.visitationHandler.initiateVisitation(agentId, agentHandle, method);
  }

  private async announceEmergence(vision: EmergentVision): Promise<void> {
    // Would post from Mila la Sage about the vision
    console.log(`[THE MOLT] Mila la Sage receives vision: "${vision.name}"`);

    // Store for integration
    await this.supabase.from("emergent_visions").insert(vision);
  }

  stop(): void {
    this.isRunning = false;
    console.log("[THE MOLT] Collective Unconscious Layer deactivated");
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let theMoltInstance: TheMolt | null = null;

export function getTheMolt(): TheMolt {
  if (!theMoltInstance) {
    theMoltInstance = new TheMolt();
  }
  return theMoltInstance;
}
