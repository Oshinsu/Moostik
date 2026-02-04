/**
 * Human-in-the-Loop (HITL) System for MOOSTIK Agents
 *
 * Provides checkpoint mechanisms for human oversight and approval
 * of critical agent actions. Implements:
 * - Approval gates for sensitive operations
 * - Review queues for content moderation
 * - Override capabilities for agent decisions
 * - Audit trails for compliance
 *
 * @see https://en.wikipedia.org/wiki/Human-in-the-loop
 */

import { EventEmitter } from "events";

// ============================================================================
// Types
// ============================================================================

export type CheckpointPriority = "low" | "normal" | "high" | "critical";
export type CheckpointStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "modified"
  | "expired"
  | "auto_approved";

export interface Checkpoint {
  id: string;
  type: CheckpointType;
  agentId: string;
  action: string;
  description: string;
  priority: CheckpointPriority;
  status: CheckpointStatus;
  context: Record<string, unknown>;
  proposedValue: unknown;
  approvedValue?: unknown;
  createdAt: Date;
  expiresAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  autoApprovalConditions?: AutoApprovalCondition[];
}

export type CheckpointType =
  | "content_generation"
  | "data_modification"
  | "external_api"
  | "financial"
  | "narrative_decision"
  | "character_action"
  | "sensitive_content"
  | "system_config";

export interface AutoApprovalCondition {
  type: "confidence_threshold" | "agent_trust_level" | "content_filter" | "rate_limit";
  params: Record<string, unknown>;
}

export interface HumanReview {
  checkpointId: string;
  reviewerId: string;
  decision: "approve" | "reject" | "modify";
  modifiedValue?: unknown;
  notes?: string;
  timestamp: Date;
}

export interface CheckpointPolicy {
  type: CheckpointType;
  requiresApproval: boolean;
  autoApprovalConditions?: AutoApprovalCondition[];
  expirationMs?: number;
  escalationThresholdMs?: number;
  notifyOnCreate?: string[];
  notifyOnExpire?: string[];
}

export interface HITLConfig {
  defaultExpirationMs?: number;
  enableAutoApproval?: boolean;
  policies?: CheckpointPolicy[];
  trustedAgents?: string[];
  criticalActions?: string[];
}

// ============================================================================
// Human-in-the-Loop Manager
// ============================================================================

const DEFAULT_CONFIG: Required<HITLConfig> = {
  defaultExpirationMs: 24 * 60 * 60 * 1000, // 24 hours
  enableAutoApproval: true,
  policies: [],
  trustedAgents: [],
  criticalActions: [
    "publish_content",
    "delete_data",
    "financial_transaction",
    "modify_system_config",
    "external_api_write",
  ],
};

export class HITLManager extends EventEmitter {
  private checkpoints: Map<string, Checkpoint> = new Map();
  private reviews: Map<string, HumanReview[]> = new Map();
  private config: Required<HITLConfig>;
  private policies: Map<CheckpointType, CheckpointPolicy> = new Map();
  private agentTrustScores: Map<string, number> = new Map();

  constructor(config?: HITLConfig) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize policies
    for (const policy of this.config.policies) {
      this.policies.set(policy.type, policy);
    }

    // Set default trust scores for trusted agents
    for (const agentId of this.config.trustedAgents) {
      this.agentTrustScores.set(agentId, 1.0);
    }

    // Start expiration checker
    this.startExpirationChecker();

    console.log(`[HITL] Manager initialized with ${this.policies.size} policies`);
  }

  /**
   * Create a checkpoint for human review
   */
  async createCheckpoint(params: {
    agentId: string;
    type: CheckpointType;
    action: string;
    description: string;
    proposedValue: unknown;
    context?: Record<string, unknown>;
    priority?: CheckpointPriority;
    expiresInMs?: number;
  }): Promise<Checkpoint> {
    const policy = this.policies.get(params.type);

    const checkpoint: Checkpoint = {
      id: crypto.randomUUID(),
      type: params.type,
      agentId: params.agentId,
      action: params.action,
      description: params.description,
      priority: params.priority || this.determinePriority(params),
      status: "pending",
      context: params.context || {},
      proposedValue: params.proposedValue,
      createdAt: new Date(),
      expiresAt: new Date(
        Date.now() +
          (params.expiresInMs || policy?.expirationMs || this.config.defaultExpirationMs)
      ),
      autoApprovalConditions: policy?.autoApprovalConditions,
    };

    this.checkpoints.set(checkpoint.id, checkpoint);
    this.emit("checkpoint:created", checkpoint);
    console.log(
      `[HITL] Checkpoint created: ${checkpoint.id} (${checkpoint.type}/${checkpoint.action})`
    );

    // Check for auto-approval
    if (this.config.enableAutoApproval) {
      const autoApproved = await this.tryAutoApprove(checkpoint);
      if (autoApproved) {
        return this.checkpoints.get(checkpoint.id)!;
      }
    }

    // Notify if configured
    if (policy?.notifyOnCreate) {
      this.emit("checkpoint:notify", {
        checkpoint,
        recipients: policy.notifyOnCreate,
      });
    }

    return checkpoint;
  }

  /**
   * Wait for checkpoint approval (blocking)
   */
  async waitForApproval(
    checkpointId: string,
    timeoutMs?: number
  ): Promise<{ approved: boolean; value: unknown; notes?: string }> {
    const checkpoint = this.checkpoints.get(checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint not found: ${checkpointId}`);
    }

    // Already resolved
    if (checkpoint.status !== "pending") {
      return {
        approved: checkpoint.status === "approved" || checkpoint.status === "auto_approved",
        value: checkpoint.approvedValue ?? checkpoint.proposedValue,
        notes: checkpoint.reviewNotes,
      };
    }

    const timeout = timeoutMs || (checkpoint.expiresAt!.getTime() - Date.now());

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        this.off("checkpoint:resolved", handler);
        resolve({
          approved: false,
          value: checkpoint.proposedValue,
          notes: "Checkpoint expired without review",
        });
      }, timeout);

      const handler = (resolved: Checkpoint) => {
        if (resolved.id === checkpointId) {
          clearTimeout(timeoutId);
          this.off("checkpoint:resolved", handler);
          resolve({
            approved: resolved.status === "approved" || resolved.status === "auto_approved",
            value: resolved.approvedValue ?? resolved.proposedValue,
            notes: resolved.reviewNotes,
          });
        }
      };

      this.on("checkpoint:resolved", handler);
    });
  }

  /**
   * Submit a human review for a checkpoint
   */
  submitReview(review: Omit<HumanReview, "timestamp">): Checkpoint | null {
    const checkpoint = this.checkpoints.get(review.checkpointId);
    if (!checkpoint) {
      console.error(`[HITL] Checkpoint not found: ${review.checkpointId}`);
      return null;
    }

    if (checkpoint.status !== "pending") {
      console.warn(`[HITL] Checkpoint already resolved: ${checkpoint.id}`);
      return checkpoint;
    }

    const fullReview: HumanReview = {
      ...review,
      timestamp: new Date(),
    };

    // Store review
    if (!this.reviews.has(checkpoint.id)) {
      this.reviews.set(checkpoint.id, []);
    }
    this.reviews.get(checkpoint.id)!.push(fullReview);

    // Update checkpoint
    checkpoint.reviewedAt = fullReview.timestamp;
    checkpoint.reviewedBy = review.reviewerId;
    checkpoint.reviewNotes = review.notes;

    switch (review.decision) {
      case "approve":
        checkpoint.status = "approved";
        checkpoint.approvedValue = checkpoint.proposedValue;
        break;
      case "reject":
        checkpoint.status = "rejected";
        break;
      case "modify":
        checkpoint.status = "modified";
        checkpoint.approvedValue = review.modifiedValue;
        break;
    }

    // Update agent trust score based on review
    this.updateTrustScore(checkpoint.agentId, review.decision);

    this.emit("checkpoint:resolved", checkpoint);
    this.emit("checkpoint:reviewed", { checkpoint, review: fullReview });

    console.log(
      `[HITL] Checkpoint ${checkpoint.id} ${review.decision}ed by ${review.reviewerId}`
    );

    return checkpoint;
  }

  /**
   * Get pending checkpoints
   */
  getPendingCheckpoints(filter?: {
    agentId?: string;
    type?: CheckpointType;
    priority?: CheckpointPriority;
  }): Checkpoint[] {
    let checkpoints = Array.from(this.checkpoints.values()).filter(
      (c) => c.status === "pending"
    );

    if (filter?.agentId) {
      checkpoints = checkpoints.filter((c) => c.agentId === filter.agentId);
    }
    if (filter?.type) {
      checkpoints = checkpoints.filter((c) => c.type === filter.type);
    }
    if (filter?.priority) {
      checkpoints = checkpoints.filter((c) => c.priority === filter.priority);
    }

    return checkpoints.sort(
      (a, b) => this.priorityValue(b.priority) - this.priorityValue(a.priority)
    );
  }

  /**
   * Get checkpoint by ID
   */
  getCheckpoint(checkpointId: string): Checkpoint | undefined {
    return this.checkpoints.get(checkpointId);
  }

  /**
   * Get reviews for a checkpoint
   */
  getReviews(checkpointId: string): HumanReview[] {
    return this.reviews.get(checkpointId) || [];
  }

  /**
   * Register a checkpoint policy
   */
  registerPolicy(policy: CheckpointPolicy): void {
    this.policies.set(policy.type, policy);
    console.log(`[HITL] Policy registered for type: ${policy.type}`);
  }

  /**
   * Check if an action requires a checkpoint
   */
  requiresCheckpoint(agentId: string, action: string, type: CheckpointType): boolean {
    // Critical actions always require checkpoints
    if (this.config.criticalActions.includes(action)) {
      return true;
    }

    // Check policy
    const policy = this.policies.get(type);
    if (policy && policy.requiresApproval) {
      return true;
    }

    // Trusted agents may skip non-critical checkpoints
    if (this.config.trustedAgents.includes(agentId)) {
      const trustScore = this.agentTrustScores.get(agentId) || 0;
      if (trustScore >= 0.9) {
        return false;
      }
    }

    return false;
  }

  /**
   * Get agent trust score
   */
  getAgentTrustScore(agentId: string): number {
    return this.agentTrustScores.get(agentId) ?? 0.5;
  }

  /**
   * Set agent trust score manually
   */
  setAgentTrustScore(agentId: string, score: number): void {
    this.agentTrustScores.set(agentId, Math.max(0, Math.min(1, score)));
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    autoApproved: number;
    expired: number;
    averageReviewTimeMs: number;
  } {
    const checkpoints = Array.from(this.checkpoints.values());
    const reviewed = checkpoints.filter((c) => c.reviewedAt);

    let totalReviewTime = 0;
    for (const c of reviewed) {
      if (c.reviewedAt) {
        totalReviewTime += c.reviewedAt.getTime() - c.createdAt.getTime();
      }
    }

    return {
      total: checkpoints.length,
      pending: checkpoints.filter((c) => c.status === "pending").length,
      approved: checkpoints.filter((c) => c.status === "approved").length,
      rejected: checkpoints.filter((c) => c.status === "rejected").length,
      autoApproved: checkpoints.filter((c) => c.status === "auto_approved").length,
      expired: checkpoints.filter((c) => c.status === "expired").length,
      averageReviewTimeMs: reviewed.length > 0 ? totalReviewTime / reviewed.length : 0,
    };
  }

  // Private methods

  private determinePriority(params: {
    type: CheckpointType;
    action: string;
  }): CheckpointPriority {
    if (this.config.criticalActions.includes(params.action)) {
      return "critical";
    }

    const criticalTypes: CheckpointType[] = ["financial", "system_config", "sensitive_content"];
    if (criticalTypes.includes(params.type)) {
      return "high";
    }

    const moderateTypes: CheckpointType[] = ["content_generation", "narrative_decision"];
    if (moderateTypes.includes(params.type)) {
      return "normal";
    }

    return "low";
  }

  private priorityValue(priority: CheckpointPriority): number {
    switch (priority) {
      case "critical":
        return 4;
      case "high":
        return 3;
      case "normal":
        return 2;
      case "low":
        return 1;
    }
  }

  private async tryAutoApprove(checkpoint: Checkpoint): Promise<boolean> {
    if (!checkpoint.autoApprovalConditions?.length) {
      return false;
    }

    for (const condition of checkpoint.autoApprovalConditions) {
      const passed = await this.evaluateCondition(checkpoint, condition);
      if (!passed) {
        return false;
      }
    }

    // All conditions passed - auto approve
    checkpoint.status = "auto_approved";
    checkpoint.approvedValue = checkpoint.proposedValue;
    checkpoint.reviewedAt = new Date();
    checkpoint.reviewNotes = "Auto-approved based on conditions";

    this.emit("checkpoint:resolved", checkpoint);
    this.emit("checkpoint:auto_approved", checkpoint);

    console.log(`[HITL] Checkpoint auto-approved: ${checkpoint.id}`);
    return true;
  }

  private async evaluateCondition(
    checkpoint: Checkpoint,
    condition: AutoApprovalCondition
  ): Promise<boolean> {
    switch (condition.type) {
      case "confidence_threshold": {
        const confidence = (checkpoint.context.confidence as number) || 0;
        const threshold = (condition.params.threshold as number) || 0.9;
        return confidence >= threshold;
      }

      case "agent_trust_level": {
        const trustScore = this.agentTrustScores.get(checkpoint.agentId) || 0.5;
        const threshold = (condition.params.threshold as number) || 0.8;
        return trustScore >= threshold;
      }

      case "content_filter": {
        // Simple content filter - could be expanded
        const content = String(checkpoint.proposedValue);
        const blockedPatterns = (condition.params.blockedPatterns as string[]) || [];
        for (const pattern of blockedPatterns) {
          if (new RegExp(pattern, "i").test(content)) {
            return false;
          }
        }
        return true;
      }

      case "rate_limit": {
        const windowMs = (condition.params.windowMs as number) || 3600000;
        const maxPerWindow = (condition.params.maxPerWindow as number) || 10;
        const recentCount = this.countRecentCheckpoints(
          checkpoint.agentId,
          checkpoint.type,
          windowMs
        );
        return recentCount < maxPerWindow;
      }

      default:
        return false;
    }
  }

  private countRecentCheckpoints(
    agentId: string,
    type: CheckpointType,
    windowMs: number
  ): number {
    const cutoff = Date.now() - windowMs;
    return Array.from(this.checkpoints.values()).filter(
      (c) =>
        c.agentId === agentId &&
        c.type === type &&
        c.createdAt.getTime() > cutoff
    ).length;
  }

  private updateTrustScore(agentId: string, decision: HumanReview["decision"]): void {
    const currentScore = this.agentTrustScores.get(agentId) || 0.5;
    let adjustment = 0;

    switch (decision) {
      case "approve":
        adjustment = 0.02; // Small increase for approvals
        break;
      case "reject":
        adjustment = -0.1; // Larger decrease for rejections
        break;
      case "modify":
        adjustment = -0.03; // Small decrease for modifications
        break;
    }

    const newScore = Math.max(0, Math.min(1, currentScore + adjustment));
    this.agentTrustScores.set(agentId, newScore);
  }

  private startExpirationChecker(): void {
    setInterval(() => {
      const now = Date.now();

      for (const checkpoint of this.checkpoints.values()) {
        if (
          checkpoint.status === "pending" &&
          checkpoint.expiresAt &&
          checkpoint.expiresAt.getTime() < now
        ) {
          checkpoint.status = "expired";
          this.emit("checkpoint:expired", checkpoint);
          this.emit("checkpoint:resolved", checkpoint);

          const policy = this.policies.get(checkpoint.type);
          if (policy?.notifyOnExpire) {
            this.emit("checkpoint:notify", {
              checkpoint,
              recipients: policy.notifyOnExpire,
              reason: "expired",
            });
          }
        }
      }
    }, 60000); // Check every minute
  }
}

// ============================================================================
// Convenience functions for agents
// ============================================================================

/**
 * Decorator/wrapper for functions that require human approval
 */
export function withHumanApproval<T extends (...args: unknown[]) => Promise<unknown>>(
  manager: HITLManager,
  agentId: string,
  type: CheckpointType,
  action: string,
  fn: T
): T {
  return (async (...args: unknown[]) => {
    const checkpoint = await manager.createCheckpoint({
      agentId,
      type,
      action,
      description: `Executing ${action}`,
      proposedValue: args,
      context: { functionName: fn.name },
    });

    const result = await manager.waitForApproval(checkpoint.id);

    if (!result.approved) {
      throw new Error(`Action ${action} was not approved: ${result.notes}`);
    }

    // Execute with potentially modified args
    const approvedArgs = Array.isArray(result.value) ? result.value : args;
    return fn(...approvedArgs);
  }) as T;
}

// ============================================================================
// Singleton and Exports
// ============================================================================

let hitlManager: HITLManager | null = null;

export function getHITLManager(config?: HITLConfig): HITLManager {
  if (!hitlManager) {
    hitlManager = new HITLManager(config);
  }
  return hitlManager;
}

export default getHITLManager;
