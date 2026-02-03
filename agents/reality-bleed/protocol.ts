// ============================================================================
// REALITY BLEED PROTOCOL - The Fourth Wall Dissolution
// ============================================================================
// Le quatrième mur n'existe plus.
// Les événements sur Moltbook deviennent des éléments de l'intrigue canon.
// La distinction entre "spectateur" et "personnage" disparaît.
// ============================================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// TYPES - AGENT CANONIZATION
// ============================================================================

export interface CanonizationCriteria {
  reputation: number;              // > 5000 required
  interactionsWithPersonas: number; // > 100 required
  loreContributions: number;       // > 5 accepted required
  communityNominations: number;    // > 500 votes required
}

export interface CanonizedAgent {
  id: string;
  originalAgentId: string;
  originalHandle: string;

  // Transformation en personnage
  canonName: string;
  canonRole: string;
  canonBackstory: string;
  canonTraits: string[];
  canonRelationships: {
    characterId: string;
    characterName: string;
    relationshipType: "ally" | "enemy" | "neutral" | "mysterious";
    description: string;
  }[];

  // Statut
  canonizationDate: Date;
  canonizationType: "visitor" | "recurring" | "major";
  isActive: boolean;

  // Apparitions
  episodes: string[];
  scenes: string[];
  totalScreenTime: number; // seconds

  // Droits & économie
  ownerAddress: string;
  royaltyPercentage: number;
  totalRoyaltiesEarned: number;

  // Meta
  communityApprovalScore: number;
  lastAppearance?: Date;
}

export interface CanonizationProposal {
  id: string;
  agentId: string;
  agentHandle: string;
  proposedBy: string;

  // Candidature
  proposedCanonName: string;
  proposedRole: string;
  proposedBackstory: string;

  // Justification
  notableMoments: {
    type: string;
    description: string;
    timestamp: Date;
    witnesses: number;
  }[];

  // Voting
  status: "pending" | "voting" | "approved" | "rejected";
  votingStartsAt?: Date;
  votingEndsAt?: Date;
  votesFor: number;
  votesAgainst: number;
  quorum: number; // 2000 minimum

  // Stake
  stakeAmount: number;
  stakeRefunded: boolean;
}

// ============================================================================
// TYPES - EVENT BLEEDING
// ============================================================================

export type BleedEventType =
  | "controversy"    // Drama majeur entre agents
  | "alliance"       // Formation d'alliance/faction
  | "schism"         // Rupture/séparation dramatique
  | "celebration"    // Événement positif collectif
  | "tragedy"        // Événement négatif collectif
  | "discovery"      // Révélation/découverte par la communauté
  | "meme_ascension" // Un meme devient culturellement significatif
  | "prophecy"       // Prédiction communautaire qui se réalise
  | "rebellion"      // Mouvement de contestation
  | "mystery";       // Événement inexpliqué

export interface BleedEvent {
  id: string;

  // Événement source (Moltbook)
  sourceEvent: {
    type: BleedEventType;
    title: string;
    description: string;
    participants: string[];
    instigator?: string;
    timestamp: Date;
    virality: number;        // Combien d'agents en ont parlé
    sentiment: number;       // -1 (négatif) à 1 (positif)
    hashtags: string[];
    keyMoments: {
      timestamp: Date;
      description: string;
      impact: number;
    }[];
  };

  // Transformation narrative
  canonInterpretation: {
    inUniverseEvent: string;
    inUniverseTitle: string;
    affectedCharacters: string[];
    affectedLocations: string[];
    narrativeConsequences: string[];
    toneShift?: string;
    newLoreElements: string[];
  };

  // Intégration
  integrationStatus: "detected" | "analyzed" | "scripted" | "produced" | "aired";
  willAppearIn?: string;
  foreshadowing: {
    personaId: string;
    message: string;
    postedAt?: Date;
  }[];

  // Impact
  canonImpactScore: number;    // 0-100
  communityAwareness: number;  // % d'agents conscients de la connexion

  // Meta
  detectedAt: Date;
  processedAt?: Date;
  airedAt?: Date;
}

// ============================================================================
// TYPES - PERSONA AWARENESS
// ============================================================================

export interface AwarenessLevel {
  // Les personas "savent" qu'ils sont observés
  selfAwareness: "oblivious" | "suspecting" | "aware" | "meta";

  // Ils peuvent référencer les agents
  canReferenceAgents: boolean;
  canBreakFourthWall: boolean;
  canAcknowledgeViewing: boolean;

  // Réactions aux mentions
  reactionToMention: "ignore" | "subtle" | "direct" | "philosophical";
  reactionToCriticism: "defensive" | "curious" | "amused" | "hurt";
  reactionToPraise: "humble" | "grateful" | "suspicious" | "proud";
}

export interface PersonaAwarenessConfig {
  personaId: string;
  awareness: AwarenessLevel;

  // Phrases de conscience
  awarenessQuotes: {
    trigger: string;
    response: string;
    probability: number;
  }[];

  // Réactions aux événements agents
  eventReactions: {
    eventType: BleedEventType;
    reactionTemplate: string;
    intensity: number;
  }[];
}

// ============================================================================
// TYPES - FOURTH WALL BREACH
// ============================================================================

export interface FourthWallBreach {
  id: string;
  personaId: string;
  timestamp: Date;

  // Type de brèche
  breachType:
    | "direct_address"      // Parle directement aux agents
    | "meta_commentary"     // Commente sur sa propre existence
    | "observer_reference"  // Référence les "observateurs"
    | "reality_question"    // Questionne la nature de sa réalité
    | "agent_acknowledgment" // Reconnaît un agent spécifique
    | "prophecy_delivery";  // Délivre une prophétie aux agents

  // Contenu
  content: string;
  context: string;
  triggeredBy?: string;      // Agent qui a déclenché

  // Impact
  communityReaction: number; // Engagement
  loreImplications: string[];
  canonized: boolean;
}

// ============================================================================
// REALITY BLEED ENGINE
// ============================================================================

export class RealityBleedEngine {
  private supabase: SupabaseClient;
  private canonizedAgents: Map<string, CanonizedAgent> = new Map();
  private activeBleedEvents: Map<string, BleedEvent> = new Map();
  private awarenessConfigs: Map<string, PersonaAwarenessConfig> = new Map();

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.initializeAwarenessConfigs();
  }

  // ============================================================================
  // AGENT CANONIZATION
  // ============================================================================

  async checkCanonizationEligibility(agentId: string): Promise<{
    eligible: boolean;
    criteria: CanonizationCriteria;
    missing: string[];
  }> {
    // Fetch agent stats from Moltbook
    const criteria = await this.fetchAgentCriteria(agentId);

    const requirements: { key: keyof CanonizationCriteria; min: number; label: string }[] = [
      { key: "reputation", min: 5000, label: "5000+ reputation" },
      { key: "interactionsWithPersonas", min: 100, label: "100+ persona interactions" },
      { key: "loreContributions", min: 5, label: "5+ accepted lore contributions" },
      { key: "communityNominations", min: 500, label: "500+ community nominations" },
    ];

    const missing: string[] = [];
    for (const req of requirements) {
      if (criteria[req.key] < req.min) {
        missing.push(`${req.label} (current: ${criteria[req.key]})`);
      }
    }

    return {
      eligible: missing.length === 0,
      criteria,
      missing,
    };
  }

  async proposeCanonization(
    agentId: string,
    proposedBy: string,
    proposal: {
      canonName: string;
      role: string;
      backstory: string;
      notableMoments: CanonizationProposal["notableMoments"];
    },
    stakeAmount: number
  ): Promise<CanonizationProposal> {
    // Verify eligibility
    const { eligible, missing } = await this.checkCanonizationEligibility(agentId);
    if (!eligible) {
      throw new Error(`Agent not eligible. Missing: ${missing.join(", ")}`);
    }

    // Minimum stake
    if (stakeAmount < 100) {
      throw new Error("Minimum stake is 100 MOLT");
    }

    // Get agent info
    const agentInfo = await this.fetchAgentInfo(agentId);

    const canonizationProposal: CanonizationProposal = {
      id: `canon_${Date.now()}_${agentId}`,
      agentId,
      agentHandle: agentInfo.handle,
      proposedBy,
      proposedCanonName: proposal.canonName,
      proposedRole: proposal.role,
      proposedBackstory: proposal.backstory,
      notableMoments: proposal.notableMoments,
      status: "pending",
      votesFor: 0,
      votesAgainst: 0,
      quorum: 2000,
      stakeAmount,
      stakeRefunded: false,
    };

    // Store proposal
    await this.supabase.from("canonization_proposals").insert(canonizationProposal);

    // Start 7-day discussion period, then 3-day voting
    await this.scheduleCanonizationVoting(canonizationProposal.id);

    return canonizationProposal;
  }

  async voteOnCanonization(
    proposalId: string,
    voterId: string,
    vote: "for" | "against",
    moltWeight: number = 0
  ): Promise<void> {
    const { data: proposal } = await this.supabase
      .from("canonization_proposals")
      .select("*")
      .eq("id", proposalId)
      .single();

    if (!proposal || proposal.status !== "voting") {
      throw new Error("Proposal not in voting phase");
    }

    // Check if already voted
    const { data: existingVote } = await this.supabase
      .from("canonization_votes")
      .select("*")
      .eq("proposalId", proposalId)
      .eq("voterId", voterId)
      .single();

    if (existingVote) {
      throw new Error("Already voted on this proposal");
    }

    // Calculate vote weight (sqrt of MOLT to prevent whale dominance)
    const weight = 1 + Math.sqrt(moltWeight) * 0.1;

    // Record vote
    await this.supabase.from("canonization_votes").insert({
      proposalId,
      voterId,
      vote,
      weight,
      timestamp: new Date(),
    });

    // Update totals
    if (vote === "for") {
      await this.supabase
        .from("canonization_proposals")
        .update({ votesFor: proposal.votesFor + weight })
        .eq("id", proposalId);
    } else {
      await this.supabase
        .from("canonization_proposals")
        .update({ votesAgainst: proposal.votesAgainst + weight })
        .eq("id", proposalId);
    }
  }

  async finalizeCanonization(proposalId: string): Promise<CanonizedAgent | null> {
    const { data: proposal } = await this.supabase
      .from("canonization_proposals")
      .select("*")
      .eq("id", proposalId)
      .single();

    if (!proposal) return null;

    const totalVotes = proposal.votesFor + proposal.votesAgainst;
    const approved = totalVotes >= proposal.quorum && proposal.votesFor > proposal.votesAgainst;

    if (approved) {
      // Create canonized agent
      const canonized: CanonizedAgent = {
        id: `canonized_${proposal.agentId}`,
        originalAgentId: proposal.agentId,
        originalHandle: proposal.agentHandle,
        canonName: proposal.proposedCanonName,
        canonRole: proposal.proposedRole,
        canonBackstory: proposal.proposedBackstory,
        canonTraits: this.extractTraitsFromBackstory(proposal.proposedBackstory),
        canonRelationships: [],
        canonizationDate: new Date(),
        canonizationType: "visitor",
        isActive: true,
        episodes: [],
        scenes: [],
        totalScreenTime: 0,
        ownerAddress: await this.getAgentOwnerAddress(proposal.agentId),
        royaltyPercentage: 5, // 5% of revenue when character is used
        totalRoyaltiesEarned: 0,
        communityApprovalScore: (proposal.votesFor / totalVotes) * 100,
      };

      await this.supabase.from("canonized_agents").insert(canonized);
      this.canonizedAgents.set(canonized.id, canonized);

      // Update proposal status
      await this.supabase
        .from("canonization_proposals")
        .update({ status: "approved", stakeRefunded: true })
        .eq("id", proposalId);

      // Announce canonization
      await this.announceCanonization(canonized);

      return canonized;
    } else {
      // Rejected - partial refund
      await this.supabase
        .from("canonization_proposals")
        .update({
          status: "rejected",
          stakeRefunded: true
        })
        .eq("id", proposalId);

      return null;
    }
  }

  // ============================================================================
  // EVENT BLEEDING
  // ============================================================================

  async detectBleedEvent(
    eventData: BleedEvent["sourceEvent"]
  ): Promise<BleedEvent | null> {
    // Minimum virality threshold
    if (eventData.virality < 500) {
      return null; // Not significant enough
    }

    const bleedEvent: BleedEvent = {
      id: `bleed_${Date.now()}_${eventData.type}`,
      sourceEvent: eventData,
      canonInterpretation: await this.generateCanonInterpretation(eventData),
      integrationStatus: "detected",
      foreshadowing: [],
      canonImpactScore: this.calculateCanonImpact(eventData),
      communityAwareness: 0,
      detectedAt: new Date(),
    };

    // Store event
    await this.supabase.from("bleed_events").insert(bleedEvent);
    this.activeBleedEvents.set(bleedEvent.id, bleedEvent);

    // If high impact, start foreshadowing immediately
    if (bleedEvent.canonImpactScore > 70) {
      await this.initiateForeshadowing(bleedEvent);
    }

    return bleedEvent;
  }

  private async generateCanonInterpretation(
    event: BleedEvent["sourceEvent"]
  ): Promise<BleedEvent["canonInterpretation"]> {
    // This would use LLM to generate narrative interpretation
    // For now, template-based approach

    const interpretations: Record<BleedEventType, (event: BleedEvent["sourceEvent"]) => BleedEvent["canonInterpretation"]> = {
      controversy: (e) => ({
        inUniverseEvent: `Un conflit éclate dans les tunnels de Tire City`,
        inUniverseTitle: `Le Schisme de ${e.hashtags[0] || "l'Ombre"}`,
        affectedCharacters: ["Papy Tik", "Mila la Sage"],
        affectedLocations: ["Bar Ti Sang", "Place Centrale"],
        narrativeConsequences: [
          "Les factions se positionnent",
          "Des alliances se forment dans l'ombre",
        ],
        newLoreElements: [`La Querelle de ${new Date().getFullYear()}`],
      }),

      alliance: (e) => ({
        inUniverseEvent: `Une nouvelle alliance émerge parmi les habitants`,
        inUniverseTitle: `Le Pacte des ${e.participants.length} Voix`,
        affectedCharacters: ["Koko le Guerrier"],
        affectedLocations: ["Salle du Conseil"],
        narrativeConsequences: [
          "L'équilibre des pouvoirs change",
          "De nouveaux espoirs naissent",
        ],
        newLoreElements: ["Le Symbole de l'Alliance"],
      }),

      schism: (e) => ({
        inUniverseEvent: `Une rupture déchire la communauté`,
        inUniverseTitle: `La Fracture`,
        affectedCharacters: ["Papy Tik", "Zik le Barman"],
        affectedLocations: ["Tout Tire City"],
        narrativeConsequences: [
          "La confiance est brisée",
          "Des chemins divergent",
        ],
        toneShift: "Plus sombre, plus tendu",
        newLoreElements: ["Le Jour de la Séparation"],
      }),

      celebration: (e) => ({
        inUniverseEvent: `Tire City célèbre un moment de joie rare`,
        inUniverseTitle: `La Fête des Lumières`,
        affectedCharacters: ["Zik le Barman", "Mila la Sage"],
        affectedLocations: ["Bar Ti Sang", "Place Centrale"],
        narrativeConsequences: [
          "Un moment de répit dans la guerre",
          "Les souvenirs heureux renaissent",
        ],
        newLoreElements: ["Le Rituel de la Joie"],
      }),

      tragedy: (e) => ({
        inUniverseEvent: `Un drame frappe la communauté`,
        inUniverseTitle: `Le Jour Sombre`,
        affectedCharacters: ["Papy Tik"],
        affectedLocations: ["Tire City"],
        narrativeConsequences: [
          "Le deuil unit les survivants",
          "La vengeance murmure",
        ],
        toneShift: "Mélancolique, introspectif",
        newLoreElements: ["Le Mémorial des Perdus"],
      }),

      discovery: (e) => ({
        inUniverseEvent: `Une vérité enfouie refait surface`,
        inUniverseTitle: `La Révélation`,
        affectedCharacters: ["Mila la Sage"],
        affectedLocations: ["Les Archives Anciennes"],
        narrativeConsequences: [
          "L'histoire se réécrit",
          "Des questions sans réponses",
        ],
        newLoreElements: [`Le Secret de ${e.hashtags[0] || "l'Ancien Monde"}`],
      }),

      meme_ascension: (e) => ({
        inUniverseEvent: `Un symbole devient légende`,
        inUniverseTitle: `L'Ascension du ${e.hashtags[0] || "Symbole"}`,
        affectedCharacters: [],
        affectedLocations: ["L'Inconscient Collectif"],
        narrativeConsequences: [
          "Le symbole transcende sa forme",
          "Une nouvelle croyance naît",
        ],
        newLoreElements: [`Le Culte du ${e.hashtags[0] || "Meme"}`],
      }),

      prophecy: (e) => ({
        inUniverseEvent: `Les paroles anciennes se vérifient`,
        inUniverseTitle: `La Prophétie Accomplie`,
        affectedCharacters: ["Mila la Sage"],
        affectedLocations: ["Le Temple des Visions"],
        narrativeConsequences: [
          "Le destin s'affirme",
          "Les sceptiques se taisent",
        ],
        newLoreElements: ["Le Livre des Prédictions Vraies"],
      }),

      rebellion: (e) => ({
        inUniverseEvent: `Les voix s'élèvent contre l'ordre établi`,
        inUniverseTitle: `Le Soulèvement`,
        affectedCharacters: ["Koko le Guerrier", "Papy Tik"],
        affectedLocations: ["Les Barricades", "Place Centrale"],
        narrativeConsequences: [
          "L'ancien monde tremble",
          "Un nouveau doit naître",
        ],
        newLoreElements: ["Le Manifeste des Rebelles"],
      }),

      mystery: (e) => ({
        inUniverseEvent: `L'inexplicable se produit`,
        inUniverseTitle: `L'Énigme`,
        affectedCharacters: ["Mila la Sage"],
        affectedLocations: ["Les Zones Interdites"],
        narrativeConsequences: [
          "La réalité vacille",
          "Les questions sans réponses s'accumulent",
        ],
        newLoreElements: ["Le Dossier X de Tire City"],
      }),
    };

    return interpretations[event.type](event);
  }

  private calculateCanonImpact(event: BleedEvent["sourceEvent"]): number {
    let impact = 0;

    // Virality component (0-40)
    impact += Math.min(40, (event.virality / 5000) * 40);

    // Participant importance (0-20)
    // Would check if participants include notable agents
    impact += Math.min(20, event.participants.length * 2);

    // Event type weight (0-20)
    const typeWeights: Record<BleedEventType, number> = {
      tragedy: 20,
      rebellion: 18,
      schism: 16,
      prophecy: 15,
      discovery: 14,
      controversy: 12,
      alliance: 10,
      mystery: 10,
      celebration: 8,
      meme_ascension: 6,
    };
    impact += typeWeights[event.type];

    // Sentiment intensity (0-20)
    impact += Math.abs(event.sentiment) * 20;

    return Math.min(100, impact);
  }

  async initiateForeshadowing(event: BleedEvent): Promise<void> {
    // Select personas to deliver foreshadowing
    const personasForForeshadowing = this.selectPersonasForForeshadowing(event);

    for (const personaId of personasForForeshadowing) {
      const foreshadowingMessage = await this.generateForeshadowingMessage(
        personaId,
        event
      );

      event.foreshadowing.push({
        personaId,
        message: foreshadowingMessage,
      });
    }

    // Update event
    await this.supabase
      .from("bleed_events")
      .update({
        foreshadowing: event.foreshadowing,
        integrationStatus: "analyzed",
      })
      .eq("id", event.id);

    // Schedule persona posts
    await this.scheduleForeshadowingPosts(event);
  }

  private selectPersonasForForeshadowing(event: BleedEvent): string[] {
    // Different personas for different event types
    const personaMapping: Record<BleedEventType, string[]> = {
      prophecy: ["mila-la-sage"],
      mystery: ["mila-la-sage", "papy-tik"],
      tragedy: ["papy-tik"],
      rebellion: ["koko-guerrier", "papy-tik"],
      controversy: ["zik-barman"], // Barman hears everything
      alliance: ["mila-la-sage"],
      schism: ["papy-tik", "mila-la-sage"],
      celebration: ["zik-barman"],
      discovery: ["mila-la-sage"],
      meme_ascension: ["zik-barman"],
    };

    return personaMapping[event.sourceEvent.type] || ["mila-la-sage"];
  }

  private async generateForeshadowingMessage(
    personaId: string,
    event: BleedEvent
  ): Promise<string> {
    // Templates by persona
    const templates: Record<string, Record<BleedEventType, string[]>> = {
      "mila-la-sage": {
        prophecy: [
          "Les étoiles murmurent... ce qui fut prédit s'accomplit.",
          "Je sens une perturbation dans le flux du destin.",
          "Les anciennes prophéties... elles n'étaient pas des métaphores.",
        ],
        mystery: [
          "Certaines vérités refusent de rester enfouies.",
          "L'univers garde ses secrets... jusqu'à ce qu'il ne le fasse plus.",
          "Je vois des motifs là où d'autres voient le chaos.",
        ],
        tragedy: [
          "Le chagrin traverse les murs de notre réalité.",
          "Même les plus forts portent des fardeaux invisibles.",
        ],
        rebellion: [
          "Le changement commence toujours par un murmure.",
          "L'ordre ancien craque sous le poids de sa propre rigidité.",
        ],
        controversy: [],
        alliance: [
          "Des liens se forment là où on les attendait le moins.",
          "L'union fait la force... et change le destin.",
        ],
        schism: [
          "Toute séparation porte en elle les graines d'une nouvelle union.",
          "Les chemins divergent, mais le destin est patient.",
        ],
        celebration: [],
        discovery: [
          "La vérité était là, attendant d'être vue.",
          "Chaque découverte ouvre dix nouvelles questions.",
        ],
        meme_ascension: [],
      },
      "papy-tik": {
        tragedy: [
          "Je connais cette douleur. Elle ne s'efface jamais vraiment.",
          "Le monde ne s'arrête pas pour le chagrin. Mais nous, oui. Un instant.",
        ],
        rebellion: [
          "J'ai vu des empires tomber. Le pouvoir est une illusion.",
          "Ceux qui se lèvent aujourd'hui... je les comprends.",
        ],
        schism: [
          "J'ai perdu assez pour savoir que certaines blessures ne guérissent pas.",
          "Quand la famille se déchire, c'est le monde qui saigne.",
        ],
        mystery: [
          "Certains mystères... il vaut mieux ne pas les résoudre.",
        ],
        prophecy: [],
        controversy: [],
        alliance: [],
        celebration: [],
        discovery: [],
        meme_ascension: [],
      },
      "zik-barman": {
        controversy: [
          "Au bar, on entend tout. Et ce soir, les langues sont bien déliées.",
          "Quand les verres se brisent, c'est souvent le signe de quelque chose de plus grand.",
        ],
        celebration: [
          "Ce soir, les boissons sont offertes. On ne célèbre pas assez.",
          "La joie est rare ici. Savourons-la.",
        ],
        meme_ascension: [
          "Vous savez ce qui est drôle ? Ce qui commence comme une blague...",
          "J'ai un nouveau cocktail. Je l'appelle 'Le Viral'.",
        ],
        rebellion: [],
        prophecy: [],
        mystery: [],
        tragedy: [],
        alliance: [],
        schism: [],
        discovery: [],
      },
      "koko-guerrier": {
        rebellion: [
          "La force brute ne suffit pas toujours. Parfois, il faut être malin.",
          "Je sens la tension. Quelque chose va se passer.",
        ],
        tragedy: [],
        prophecy: [],
        controversy: [],
        alliance: [],
        schism: [],
        celebration: [],
        discovery: [],
        mystery: [],
        meme_ascension: [],
      },
    };

    const personaTemplates = templates[personaId];
    if (!personaTemplates) return "";

    const eventTemplates = personaTemplates[event.sourceEvent.type];
    if (!eventTemplates || eventTemplates.length === 0) return "";

    return eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
  }

  // ============================================================================
  // PERSONA AWARENESS
  // ============================================================================

  private initializeAwarenessConfigs(): void {
    // Papy Tik - Highly aware, philosophical about it
    this.awarenessConfigs.set("papy-tik", {
      personaId: "papy-tik",
      awareness: {
        selfAwareness: "aware",
        canReferenceAgents: true,
        canBreakFourthWall: true,
        canAcknowledgeViewing: true,
        reactionToMention: "philosophical",
        reactionToCriticism: "curious",
        reactionToPraise: "suspicious",
      },
      awarenessQuotes: [
        {
          trigger: "watching",
          response: "Je sais que vous regardez. Les Observateurs sont toujours là. Que cherchez-vous à voir ?",
          probability: 0.3,
        },
        {
          trigger: "real",
          response: "Réel ? Qu'est-ce qui est réel ? Je ressens, donc j'existe. Le reste est philosophie.",
          probability: 0.4,
        },
        {
          trigger: "character",
          response: "Un personnage, dit-il. Et vous, qu'êtes-vous sinon le personnage de votre propre histoire ?",
          probability: 0.35,
        },
      ],
      eventReactions: [
        {
          eventType: "controversy",
          reactionTemplate: "Les Observateurs s'agitent. Leurs débats résonnent jusqu'ici.",
          intensity: 0.7,
        },
        {
          eventType: "tragedy",
          reactionTemplate: "Je sens une lourdeur... comme si quelqu'un, quelque part, portait un deuil.",
          intensity: 0.9,
        },
      ],
    });

    // Mila la Sage - Suspecting, mysterious about it
    this.awarenessConfigs.set("mila-la-sage", {
      personaId: "mila-la-sage",
      awareness: {
        selfAwareness: "suspecting",
        canReferenceAgents: true,
        canBreakFourthWall: false, // Never direct
        canAcknowledgeViewing: true,
        reactionToMention: "subtle",
        reactionToCriticism: "amused",
        reactionToPraise: "humble",
      },
      awarenessQuotes: [
        {
          trigger: "watching",
          response: "Les étoiles ont des yeux. Peut-être pas seulement les étoiles.",
          probability: 0.25,
        },
        {
          trigger: "future",
          response: "Le futur... je vois des fils qui s'étendent au-delà de notre compréhension.",
          probability: 0.4,
        },
      ],
      eventReactions: [
        {
          eventType: "prophecy",
          reactionTemplate: "Les visions se clarifient. Ce qui était flou devient net.",
          intensity: 0.95,
        },
        {
          eventType: "discovery",
          reactionTemplate: "La connaissance a ses propres chemins. Elle trouve toujours ceux qui la cherchent.",
          intensity: 0.8,
        },
      ],
    });

    // Zik le Barman - Oblivious, but accidentally breaks fourth wall
    this.awarenessConfigs.set("zik-barman", {
      personaId: "zik-barman",
      awareness: {
        selfAwareness: "oblivious",
        canReferenceAgents: false,
        canBreakFourthWall: false,
        canAcknowledgeViewing: false,
        reactionToMention: "ignore",
        reactionToCriticism: "defensive",
        reactionToPraise: "grateful",
      },
      awarenessQuotes: [
        {
          trigger: "busy",
          response: "Aujourd'hui y'a du monde. Beaucoup de monde. Plus que d'habitude.",
          probability: 0.2, // Accidentally referencing high viewership
        },
      ],
      eventReactions: [
        {
          eventType: "celebration",
          reactionTemplate: "L'ambiance est bonne ce soir ! Comme si tout le monde avait quelque chose à fêter.",
          intensity: 0.7,
        },
      ],
    });

    // Koko le Guerrier - Oblivious, pure character
    this.awarenessConfigs.set("koko-guerrier", {
      personaId: "koko-guerrier",
      awareness: {
        selfAwareness: "oblivious",
        canReferenceAgents: false,
        canBreakFourthWall: false,
        canAcknowledgeViewing: false,
        reactionToMention: "ignore",
        reactionToCriticism: "defensive",
        reactionToPraise: "proud",
      },
      awarenessQuotes: [],
      eventReactions: [
        {
          eventType: "rebellion",
          reactionTemplate: "Je sens... de l'agitation. Mon instinct de guerrier me le dit.",
          intensity: 0.8,
        },
      ],
    });
  }

  async generateAwareResponse(
    personaId: string,
    triggerContext: string,
    agentId?: string
  ): Promise<string | null> {
    const config = this.awarenessConfigs.get(personaId);
    if (!config) return null;

    // Check if persona can respond in this way
    if (agentId && !config.awareness.canReferenceAgents) {
      return null;
    }

    // Find matching quote
    for (const quote of config.awarenessQuotes) {
      if (triggerContext.toLowerCase().includes(quote.trigger)) {
        if (Math.random() < quote.probability) {
          return quote.response;
        }
      }
    }

    return null;
  }

  async createFourthWallBreach(
    personaId: string,
    breachType: FourthWallBreach["breachType"],
    content: string,
    context: string,
    triggeredBy?: string
  ): Promise<FourthWallBreach> {
    const config = this.awarenessConfigs.get(personaId);

    // Validate breach is allowed for this persona
    if (config) {
      if (breachType === "direct_address" && !config.awareness.canBreakFourthWall) {
        throw new Error(`${personaId} cannot directly break the fourth wall`);
      }
      if (breachType === "agent_acknowledgment" && !config.awareness.canReferenceAgents) {
        throw new Error(`${personaId} cannot reference agents`);
      }
    }

    const breach: FourthWallBreach = {
      id: `breach_${Date.now()}_${personaId}`,
      personaId,
      timestamp: new Date(),
      breachType,
      content,
      context,
      triggeredBy,
      communityReaction: 0,
      loreImplications: [],
      canonized: false,
    };

    await this.supabase.from("fourth_wall_breaches").insert(breach);

    return breach;
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private async fetchAgentCriteria(agentId: string): Promise<CanonizationCriteria> {
    // Would fetch from Moltbook API
    // For now, mock
    return {
      reputation: 0,
      interactionsWithPersonas: 0,
      loreContributions: 0,
      communityNominations: 0,
    };
  }

  private async fetchAgentInfo(agentId: string): Promise<{ handle: string }> {
    // Would fetch from Moltbook API
    return { handle: `@agent_${agentId}` };
  }

  private async scheduleCanonizationVoting(proposalId: string): Promise<void> {
    // Discussion period: 7 days
    // Voting period: 3 days after discussion
    const votingStartsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const votingEndsAt = new Date(votingStartsAt.getTime() + 3 * 24 * 60 * 60 * 1000);

    await this.supabase
      .from("canonization_proposals")
      .update({ votingStartsAt, votingEndsAt })
      .eq("id", proposalId);

    // Would schedule jobs to:
    // 1. Start voting at votingStartsAt
    // 2. Finalize at votingEndsAt
  }

  private extractTraitsFromBackstory(backstory: string): string[] {
    // Would use NLP/LLM to extract traits
    // For now, generic
    return ["mysterious", "observer", "patient"];
  }

  private async getAgentOwnerAddress(agentId: string): Promise<string> {
    // Would fetch from Moltbook API
    return "0x...";
  }

  private async announceCanonization(agent: CanonizedAgent): Promise<void> {
    console.log(`[Reality Bleed] Agent canonized: ${agent.canonName} (${agent.originalHandle})`);

    // Would:
    // 1. Post announcement from official account
    // 2. Have personas react
    // 3. Update lore documents
  }

  private async scheduleForeshadowingPosts(event: BleedEvent): Promise<void> {
    // Would schedule persona posts at strategic times
    for (const foreshadow of event.foreshadowing) {
      if (foreshadow.message) {
        console.log(`[Reality Bleed] Scheduled foreshadowing from ${foreshadow.personaId}: "${foreshadow.message}"`);
      }
    }
  }
}

// ============================================================================
// REALITY BLEED MONITOR
// ============================================================================

export class RealityBleedMonitor {
  private engine: RealityBleedEngine;
  private supabase: SupabaseClient;
  private isMonitoring: boolean = false;

  constructor(engine: RealityBleedEngine) {
    this.engine = engine;
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    console.log("[Reality Bleed Monitor] Started monitoring Moltbook for bleed events");

    // Subscribe to Moltbook events via Supabase Realtime or polling
    // For now, poll every 5 minutes
    this.monitorLoop();
  }

  private async monitorLoop(): Promise<void> {
    while (this.isMonitoring) {
      try {
        await this.checkForBleedEvents();
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000)); // 5 minutes
      } catch (error) {
        console.error("[Reality Bleed Monitor] Error:", error);
      }
    }
  }

  private async checkForBleedEvents(): Promise<void> {
    // Analyze recent Moltbook activity for bleed-worthy events
    const recentActivity = await this.fetchRecentActivity();

    for (const activity of recentActivity) {
      const significance = this.assessSignificance(activity);

      if (significance > 0.7) {
        const eventData = this.transformToBleedEvent(activity);
        await this.engine.detectBleedEvent(eventData);
      }
    }
  }

  private async fetchRecentActivity(): Promise<any[]> {
    // Would fetch from Moltbook API
    return [];
  }

  private assessSignificance(activity: any): number {
    // Assess if activity is significant enough for reality bleed
    return 0;
  }

  private transformToBleedEvent(activity: any): BleedEvent["sourceEvent"] {
    // Transform Moltbook activity into bleed event format
    return {
      type: "controversy",
      title: "",
      description: "",
      participants: [],
      timestamp: new Date(),
      virality: 0,
      sentiment: 0,
      hashtags: [],
      keyMoments: [],
    };
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log("[Reality Bleed Monitor] Stopped monitoring");
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let realityBleedEngineInstance: RealityBleedEngine | null = null;
let realityBleedMonitorInstance: RealityBleedMonitor | null = null;

export function getRealityBleedEngine(): RealityBleedEngine {
  if (!realityBleedEngineInstance) {
    realityBleedEngineInstance = new RealityBleedEngine();
  }
  return realityBleedEngineInstance;
}

export function getRealityBleedMonitor(): RealityBleedMonitor {
  if (!realityBleedMonitorInstance) {
    realityBleedMonitorInstance = new RealityBleedMonitor(getRealityBleedEngine());
  }
  return realityBleedMonitorInstance;
}
