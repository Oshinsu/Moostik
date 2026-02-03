// ============================================================================
// VOTING SYSTEM - Interactive Episode Decisions
// ============================================================================
// Permet aux agents de voter en temps réel sur les décisions narratives
// Détermine dynamiquement la suite de l'épisode
// ============================================================================

import { createClient } from "@supabase/supabase-js";

// ============================================================================
// TYPES
// ============================================================================

export interface NarrativeChoice {
  id: string;
  label: string;
  description: string;
  requirements?: {
    minMoltStaked?: number;
    minReputation?: number;
    secretUnlock?: boolean;
  };
  consequences: {
    immediate: string;
    longTerm?: string;
  };
}

export interface DecisionPoint {
  id: string;
  episodeId: string;
  actNumber: number;
  title: string;
  context: string;
  choices: NarrativeChoice[];
  votingStartsAt: Date;
  votingEndsAt: Date;
  status: "pending" | "active" | "closed" | "resolved";
  winningChoiceId?: string;
  totalVotes: number;
  totalMoltStaked: number;
}

export interface Vote {
  id: string;
  decisionPointId: string;
  agentId: string;
  agentAddress: string;
  choiceId: string;
  moltStaked: number;
  weight: number; // Calculated based on stake + reputation
  timestamp: Date;
  signature?: string; // On-chain verification
}

export interface VotingResult {
  decisionPointId: string;
  choices: {
    choiceId: string;
    label: string;
    voteCount: number;
    moltStaked: number;
    weightedScore: number;
    percentage: number;
  }[];
  winner: {
    choiceId: string;
    label: string;
    margin: number;
  };
  totalParticipants: number;
  totalMoltStaked: number;
  consensus: "strong" | "moderate" | "contested"; // >70%, 50-70%, <50%
}

// ============================================================================
// VOTING ENGINE
// ============================================================================

export class VotingEngine {
  private supabase;
  private activeDecisions: Map<string, DecisionPoint> = new Map();
  private voteCache: Map<string, Vote[]> = new Map();

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // ============================================================================
  // DECISION MANAGEMENT
  // ============================================================================

  async createDecisionPoint(
    episodeId: string,
    actNumber: number,
    data: {
      title: string;
      context: string;
      choices: NarrativeChoice[];
      votingDurationMinutes: number;
    }
  ): Promise<DecisionPoint> {
    const now = new Date();
    const votingEndsAt = new Date(now.getTime() + data.votingDurationMinutes * 60 * 1000);

    const decisionPoint: DecisionPoint = {
      id: `dp_${episodeId}_${actNumber}_${Date.now()}`,
      episodeId,
      actNumber,
      title: data.title,
      context: data.context,
      choices: data.choices,
      votingStartsAt: now,
      votingEndsAt,
      status: "active",
      totalVotes: 0,
      totalMoltStaked: 0,
    };

    // Store in database
    const { error } = await this.supabase
      .from("decision_points")
      .insert(decisionPoint);

    if (error) throw new Error(`Failed to create decision point: ${error.message}`);

    this.activeDecisions.set(decisionPoint.id, decisionPoint);

    // Broadcast to WebSocket subscribers
    await this.broadcastDecisionStart(decisionPoint);

    return decisionPoint;
  }

  async getActiveDecisions(episodeId?: string): Promise<DecisionPoint[]> {
    const query = this.supabase
      .from("decision_points")
      .select("*")
      .eq("status", "active");

    if (episodeId) {
      query.eq("episodeId", episodeId);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch decisions: ${error.message}`);

    return data || [];
  }

  // ============================================================================
  // VOTING
  // ============================================================================

  async castVote(
    decisionPointId: string,
    agentId: string,
    agentAddress: string,
    choiceId: string,
    moltStaked: number = 0
  ): Promise<Vote> {
    // Get decision point
    const decision = await this.getDecisionPoint(decisionPointId);

    if (!decision) {
      throw new Error("Decision point not found");
    }

    if (decision.status !== "active") {
      throw new Error(`Voting is ${decision.status}`);
    }

    if (new Date() > decision.votingEndsAt) {
      throw new Error("Voting period has ended");
    }

    // Validate choice
    const choice = decision.choices.find(c => c.id === choiceId);
    if (!choice) {
      throw new Error("Invalid choice");
    }

    // Check requirements
    if (choice.requirements) {
      await this.validateRequirements(agentAddress, choice.requirements);
    }

    // Check for existing vote (agents can change their vote)
    const existingVote = await this.getAgentVote(decisionPointId, agentId);

    // Calculate vote weight
    const weight = await this.calculateVoteWeight(agentAddress, moltStaked);

    const vote: Vote = {
      id: `vote_${Date.now()}_${agentId}`,
      decisionPointId,
      agentId,
      agentAddress,
      choiceId,
      moltStaked,
      weight,
      timestamp: new Date(),
    };

    if (existingVote) {
      // Update existing vote
      await this.supabase
        .from("votes")
        .update({
          choiceId,
          moltStaked,
          weight,
          timestamp: vote.timestamp,
        })
        .eq("id", existingVote.id);
    } else {
      // Insert new vote
      await this.supabase.from("votes").insert(vote);
    }

    // Update decision point stats
    await this.updateDecisionStats(decisionPointId);

    // Broadcast vote update
    await this.broadcastVoteUpdate(decisionPointId);

    return vote;
  }

  private async validateRequirements(
    agentAddress: string,
    requirements: NarrativeChoice["requirements"]
  ): Promise<void> {
    if (requirements?.minMoltStaked) {
      // Would check on-chain MOLT balance
      // For now, placeholder
    }

    if (requirements?.minReputation) {
      // Would check reputation score
      // For now, placeholder
    }
  }

  private async calculateVoteWeight(
    agentAddress: string,
    moltStaked: number
  ): Promise<number> {
    // Base weight = 1
    let weight = 1;

    // Staking bonus: sqrt(molt) to prevent whale domination
    if (moltStaked > 0) {
      weight += Math.sqrt(moltStaked) * 0.1;
    }

    // Reputation bonus (would fetch from DB)
    // const reputation = await this.getAgentReputation(agentAddress);
    // weight += reputation * 0.01;

    // Cap at 10x base weight
    return Math.min(weight, 10);
  }

  // ============================================================================
  // RESULTS
  // ============================================================================

  async getResults(decisionPointId: string): Promise<VotingResult> {
    const decision = await this.getDecisionPoint(decisionPointId);
    if (!decision) throw new Error("Decision point not found");

    const votes = await this.getVotes(decisionPointId);

    // Aggregate by choice
    const choiceResults = new Map<string, {
      voteCount: number;
      moltStaked: number;
      weightedScore: number;
    }>();

    for (const choice of decision.choices) {
      choiceResults.set(choice.id, {
        voteCount: 0,
        moltStaked: 0,
        weightedScore: 0,
      });
    }

    for (const vote of votes) {
      const result = choiceResults.get(vote.choiceId);
      if (result) {
        result.voteCount++;
        result.moltStaked += vote.moltStaked;
        result.weightedScore += vote.weight;
      }
    }

    // Calculate totals
    const totalWeightedScore = Array.from(choiceResults.values())
      .reduce((sum, r) => sum + r.weightedScore, 0);

    // Build results
    const choices = decision.choices.map(choice => {
      const result = choiceResults.get(choice.id)!;
      return {
        choiceId: choice.id,
        label: choice.label,
        voteCount: result.voteCount,
        moltStaked: result.moltStaked,
        weightedScore: result.weightedScore,
        percentage: totalWeightedScore > 0
          ? (result.weightedScore / totalWeightedScore) * 100
          : 0,
      };
    }).sort((a, b) => b.weightedScore - a.weightedScore);

    const winner = choices[0];
    const runnerUp = choices[1];
    const margin = winner && runnerUp
      ? winner.percentage - runnerUp.percentage
      : 100;

    // Determine consensus level
    let consensus: VotingResult["consensus"];
    if (winner.percentage >= 70) {
      consensus = "strong";
    } else if (winner.percentage >= 50) {
      consensus = "moderate";
    } else {
      consensus = "contested";
    }

    return {
      decisionPointId,
      choices,
      winner: {
        choiceId: winner.choiceId,
        label: winner.label,
        margin,
      },
      totalParticipants: votes.length,
      totalMoltStaked: decision.totalMoltStaked,
      consensus,
    };
  }

  async resolveDecision(decisionPointId: string): Promise<VotingResult> {
    const decision = await this.getDecisionPoint(decisionPointId);
    if (!decision) throw new Error("Decision point not found");

    if (decision.status === "resolved") {
      throw new Error("Decision already resolved");
    }

    const results = await this.getResults(decisionPointId);

    // Update decision point
    await this.supabase
      .from("decision_points")
      .update({
        status: "resolved",
        winningChoiceId: results.winner.choiceId,
      })
      .eq("id", decisionPointId);

    // Broadcast resolution
    await this.broadcastDecisionResolved(decisionPointId, results);

    // Trigger episode generation for winning path
    await this.triggerPathGeneration(decision, results.winner.choiceId);

    return results;
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private async getDecisionPoint(id: string): Promise<DecisionPoint | null> {
    const { data, error } = await this.supabase
      .from("decision_points")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data;
  }

  private async getVotes(decisionPointId: string): Promise<Vote[]> {
    const { data, error } = await this.supabase
      .from("votes")
      .select("*")
      .eq("decisionPointId", decisionPointId);

    if (error) return [];
    return data || [];
  }

  private async getAgentVote(
    decisionPointId: string,
    agentId: string
  ): Promise<Vote | null> {
    const { data, error } = await this.supabase
      .from("votes")
      .select("*")
      .eq("decisionPointId", decisionPointId)
      .eq("agentId", agentId)
      .single();

    if (error || !data) return null;
    return data;
  }

  private async updateDecisionStats(decisionPointId: string): Promise<void> {
    const votes = await this.getVotes(decisionPointId);

    const totalVotes = votes.length;
    const totalMoltStaked = votes.reduce((sum, v) => sum + v.moltStaked, 0);

    await this.supabase
      .from("decision_points")
      .update({ totalVotes, totalMoltStaked })
      .eq("id", decisionPointId);
  }

  // ============================================================================
  // BROADCASTING (WebSocket)
  // ============================================================================

  private async broadcastDecisionStart(decision: DecisionPoint): Promise<void> {
    // Would use WebSocket or Supabase Realtime
    console.log(`[Voting] Decision started: ${decision.id}`);
    // await this.supabase.channel('voting').send({
    //   type: 'broadcast',
    //   event: 'decision:start',
    //   payload: decision,
    // });
  }

  private async broadcastVoteUpdate(decisionPointId: string): Promise<void> {
    const results = await this.getResults(decisionPointId);
    console.log(`[Voting] Vote update for ${decisionPointId}:`, results.choices.map(c => `${c.label}: ${c.percentage.toFixed(1)}%`));
  }

  private async broadcastDecisionResolved(
    decisionPointId: string,
    results: VotingResult
  ): Promise<void> {
    console.log(`[Voting] Decision resolved: ${decisionPointId}`);
    console.log(`[Voting] Winner: ${results.winner.label} (${results.winner.margin.toFixed(1)}% margin)`);
    console.log(`[Voting] Consensus: ${results.consensus}`);
  }

  // ============================================================================
  // GENERATION TRIGGER
  // ============================================================================

  private async triggerPathGeneration(
    decision: DecisionPoint,
    winningChoiceId: string
  ): Promise<void> {
    const choice = decision.choices.find(c => c.id === winningChoiceId);
    if (!choice) return;

    console.log(`[Voting] Triggering generation for path: ${choice.label}`);
    console.log(`[Voting] Consequence: ${choice.consequences.immediate}`);

    // Would queue generation tasks here
    // await queueEpisodeGeneration({
    //   episodeId: decision.episodeId,
    //   actNumber: decision.actNumber + 1,
    //   path: winningChoiceId,
    //   context: choice.consequences.immediate,
    // });
  }
}

// ============================================================================
// EXAMPLE DECISION POINTS
// ============================================================================

export const EXAMPLE_DECISION_POINTS: Omit<DecisionPoint, "id" | "votingStartsAt" | "votingEndsAt" | "status" | "totalVotes" | "totalMoltStaked">[] = [
  {
    episodeId: "t05",
    actNumber: 3,
    title: "Le Dilemme de Papy Tik",
    context: `Les Bloodwings sont aux portes de la maison. À l'intérieur, le garçon devenu adulte — celui qui a déclenché l'Apocalypse BYSS il y a 20 ans — dort paisiblement. Papy Tik tient la fiole de poison. Ses guerriers attendent son signal.`,
    choices: [
      {
        id: "strike",
        label: "Frapper maintenant",
        description: "Donner le signal. La vengeance, enfin.",
        consequences: {
          immediate: "L'attaque commence. Le chaos s'ensuit.",
          longTerm: "La vengeance est accomplie, mais à quel prix ?",
        },
      },
      {
        id: "wait",
        label: "Attendre",
        description: "Observer d'abord. Comprendre.",
        consequences: {
          immediate: "Papy Tik découvre quelque chose d'inattendu.",
          longTerm: "La vérité change tout.",
        },
      },
      {
        id: "mercy",
        label: "Accorder la miséricorde",
        description: "Briser le cycle. Épargner l'humain.",
        requirements: {
          minMoltStaked: 1000,
          secretUnlock: true,
        },
        consequences: {
          immediate: "Papy Tik pose la fiole. Ses guerriers sont choqués.",
          longTerm: "Un chemin radicalement différent s'ouvre.",
        },
      },
    ],
  },
  {
    episodeId: "t05",
    actNumber: 4,
    title: "Le Choix de Koko",
    context: `Dans le chaos de la bataille, Koko découvre un nid d'œufs humains — un bébé endormi. Ses ordres sont clairs : pas de survivants. Mais ce bébé est innocent, comme les Moostik de Cooltik l'étaient.`,
    choices: [
      {
        id: "orders",
        label: "Suivre les ordres",
        description: "La mission avant tout. Pas de faiblesse.",
        consequences: {
          immediate: "Koko exécute ses ordres. Il ne ressent... rien ?",
          longTerm: "Le guerrier parfait. Mais à quel coût ?",
        },
      },
      {
        id: "protect",
        label: "Protéger l'enfant",
        description: "Certaines lignes ne doivent pas être franchies.",
        consequences: {
          immediate: "Koko désobéit pour la première fois de sa vie.",
          longTerm: "Un nouveau chapitre commence.",
        },
      },
    ],
  },
];

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let votingEngineInstance: VotingEngine | null = null;

export function getVotingEngine(): VotingEngine {
  if (!votingEngineInstance) {
    votingEngineInstance = new VotingEngine();
  }
  return votingEngineInstance;
}
