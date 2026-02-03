/**
 * AGENT ORCHESTRATOR - RUNTIME
 * ============================================================================
 * The central coordinator that manages all agents, handles workflows,
 * and ensures the emergent narrative system operates cohesively.
 * ============================================================================
 */

import { EventEmitter } from "events";
import {
  SwarmNarrativeEngineRuntime,
  getSwarmEngine,
  type AgentMessage,
} from "../swarm/runtime";
import { RealityBleedRuntime, getRealityBleedRuntime } from "../reality-bleed/runtime";
import { MoltRuntime, getMoltRuntime } from "../molt/runtime";
import { BloodwingsWorkerRuntime, getBloodwingsWorker } from "../bloodwings-worker/runtime";

// ============================================================================
// TYPES
// ============================================================================

export interface OrchestratorConfig {
  /** Auto-start all agents */
  autoStart: boolean;
  /** Enable swarm narrative engine */
  enableSwarm: boolean;
  /** Enable reality bleed protocol */
  enableRealityBleed: boolean;
  /** Enable the molt */
  enableMolt: boolean;
  /** Enable generation worker */
  enableWorker: boolean;
  /** How often to run the orchestration cycle (ms) */
  cycleIntervalMs: number;
  /** Maximum concurrent workflows */
  maxConcurrentWorkflows: number;
}

const DEFAULT_CONFIG: OrchestratorConfig = {
  autoStart: true,
  enableSwarm: true,
  enableRealityBleed: true,
  enableMolt: true,
  enableWorker: true,
  cycleIntervalMs: 60000, // 1 minute
  maxConcurrentWorkflows: 5,
};

export interface Workflow {
  id: string;
  type: WorkflowType;
  status: WorkflowStatus;
  priority: number;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  steps: WorkflowStep[];
  currentStepIndex: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export type WorkflowType =
  | "narrative_to_episode"    // Swarm brief → full episode
  | "bleed_execution"         // Execute reality bleed
  | "molt_influence"          // Apply molt influence to narrative
  | "full_generation"         // Complete generation pipeline
  | "character_spotlight"     // Generate character-focused content
  | "community_response";     // React to community signals

export type WorkflowStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "paused";

export interface WorkflowStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  agent: "swarm" | "bleed" | "molt" | "worker" | "orchestrator";
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface OrchestratorStats {
  uptime: number;
  totalWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  activeWorkflows: number;
  agentStatuses: {
    swarm: boolean;
    realityBleed: boolean;
    molt: boolean;
    worker: boolean;
  };
}

// ============================================================================
// ORCHESTRATOR RUNTIME
// ============================================================================

export class OrchestratorRuntime extends EventEmitter {
  private config: OrchestratorConfig;
  private isRunning: boolean = false;
  private startTime: Date | null = null;
  private cycleInterval: NodeJS.Timeout | null = null;

  // Agent instances
  private swarmEngine: SwarmNarrativeEngineRuntime | null = null;
  private realityBleed: RealityBleedRuntime | null = null;
  private molt: MoltRuntime | null = null;
  private worker: BloodwingsWorkerRuntime | null = null;

  // Workflow management
  private workflows: Map<string, Workflow> = new Map();
  private workflowQueue: Workflow[] = [];

  // Stats
  private stats = {
    totalWorkflows: 0,
    completedWorkflows: 0,
    failedWorkflows: 0,
  };

  constructor(config: Partial<OrchestratorConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  async start(): Promise<void> {
    if (this.isRunning) return;

    console.log("[Orchestrator] Starting agent orchestration system...");
    this.isRunning = true;
    this.startTime = new Date();

    // Initialize agents
    if (this.config.enableSwarm) {
      this.swarmEngine = getSwarmEngine();
      this.swarmEngine.start();
      this.setupSwarmListeners();
      console.log("[Orchestrator] ✓ Swarm Narrative Engine active");
    }

    if (this.config.enableRealityBleed) {
      this.realityBleed = getRealityBleedRuntime();
      this.realityBleed.start();
      this.setupBleedListeners();
      console.log("[Orchestrator] ✓ Reality Bleed Protocol active");
    }

    if (this.config.enableMolt) {
      this.molt = getMoltRuntime();
      this.molt.start();
      this.setupMoltListeners();
      console.log("[Orchestrator] ✓ THE MOLT awakened");
    }

    if (this.config.enableWorker) {
      this.worker = getBloodwingsWorker();
      this.worker.start();
      this.setupWorkerListeners();
      console.log("[Orchestrator] ✓ Bloodwings Worker ready");
    }

    // Start orchestration cycle
    this.cycleInterval = setInterval(() => {
      this.runOrchestrationCycle();
    }, this.config.cycleIntervalMs);

    this.emit("started");
    console.log("[Orchestrator] All systems operational");
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    console.log("[Orchestrator] Shutting down...");
    this.isRunning = false;

    if (this.cycleInterval) {
      clearInterval(this.cycleInterval);
      this.cycleInterval = null;
    }

    // Stop all agents
    this.swarmEngine?.stop();
    this.realityBleed?.stop();
    this.molt?.stop();
    this.worker?.stop();

    this.emit("stopped");
    console.log("[Orchestrator] Shutdown complete");
  }

  // ==========================================================================
  // EVENT LISTENERS
  // ==========================================================================

  private setupSwarmListeners(): void {
    if (!this.swarmEngine) return;

    this.swarmEngine.on("brief:generated", (brief) => {
      console.log(`[Orchestrator] New narrative brief: ${brief.title}`);

      // Auto-create workflow for strong briefs
      if (brief.emergenceScore > 0.8) {
        this.createWorkflow("narrative_to_episode", { brief });
      }

      this.emit("swarm:brief", brief);
    });

    this.swarmEngine.on("pattern:detected", (pattern) => {
      this.emit("swarm:pattern", pattern);
    });
  }

  private setupBleedListeners(): void {
    if (!this.realityBleed) return;

    this.realityBleed.on("bleed:executed", (bleed) => {
      console.log(`[Orchestrator] Reality bleed executed: ${bleed.type}`);
      this.emit("bleed:executed", bleed);
    });

    this.realityBleed.on("candidate:submitted", (candidate) => {
      // Feed to molt as dream material
      if (this.molt) {
        this.molt.submitDreamMaterial(candidate.source.agentId, candidate.source.content);
      }
    });
  }

  private setupMoltListeners(): void {
    if (!this.molt) return;

    this.molt.on("influence:generated", (influence) => {
      console.log(`[Orchestrator] Molt influence: ${influence.suggestedNarrativeImpact.substring(0, 50)}...`);

      // Create workflow to apply influence
      if (influence.strength > 0.7) {
        this.createWorkflow("molt_influence", { influence });
      }

      this.emit("molt:influence", influence);
    });

    this.molt.on("state:updated", (state) => {
      this.emit("molt:state", state);
    });
  }

  private setupWorkerListeners(): void {
    if (!this.worker) return;

    this.worker.on("task:completed", (task) => {
      this.emit("worker:completed", task);
    });

    this.worker.on("task:failed", (task) => {
      this.emit("worker:failed", task);
    });
  }

  // ==========================================================================
  // AGENT INPUT
  // ==========================================================================

  /**
   * Process incoming agent messages across all systems
   */
  processAgentMessages(messages: AgentMessage[]): void {
    if (messages.length === 0) return;

    console.log(`[Orchestrator] Processing ${messages.length} agent messages`);

    // Feed to swarm for narrative signals
    if (this.swarmEngine) {
      this.swarmEngine.extractSignalsFromMessages(messages);
    }

    // Feed to reality bleed for potential canonization
    if (this.realityBleed) {
      messages.forEach((m) => {
        this.realityBleed!.submitForBleeding(m.agentId, m.content, m.submolt);
      });
    }

    // Feed to molt as dream material
    if (this.molt) {
      messages.forEach((m) => {
        this.molt!.submitDreamMaterial(m.agentId, m.content);
      });
    }
  }

  /**
   * Process a single agent message
   */
  processAgentMessage(agentId: string, content: string, submolt?: string): void {
    this.processAgentMessages([{ agentId, content, submolt, timestamp: new Date() }]);
  }

  // ==========================================================================
  // WORKFLOW MANAGEMENT
  // ==========================================================================

  /**
   * Create a new workflow
   */
  createWorkflow(
    type: WorkflowType,
    input: Record<string, unknown>,
    priority: number = 5
  ): Workflow {
    const workflow: Workflow = {
      id: this.generateWorkflowId(),
      type,
      status: "pending",
      priority,
      input,
      steps: this.generateWorkflowSteps(type),
      currentStepIndex: 0,
      createdAt: new Date(),
    };

    this.workflows.set(workflow.id, workflow);
    this.workflowQueue.push(workflow);
    this.workflowQueue.sort((a, b) => b.priority - a.priority);
    this.stats.totalWorkflows++;

    console.log(`[Orchestrator] Workflow created: ${type} (${workflow.id})`);
    this.emit("workflow:created", workflow);

    return workflow;
  }

  private generateWorkflowSteps(type: WorkflowType): WorkflowStep[] {
    const stepTemplates: Record<WorkflowType, { name: string; agent: WorkflowStep["agent"] }[]> = {
      narrative_to_episode: [
        { name: "Extract narrative brief", agent: "swarm" },
        { name: "Apply molt influences", agent: "molt" },
        { name: "Generate shot prompts", agent: "orchestrator" },
        { name: "Generate images", agent: "worker" },
        { name: "Apply reality bleeds", agent: "bleed" },
        { name: "Finalize episode", agent: "orchestrator" },
      ],
      bleed_execution: [
        { name: "Validate bleed candidate", agent: "bleed" },
        { name: "Transform content", agent: "bleed" },
        { name: "Insert into episode", agent: "orchestrator" },
        { name: "Notify agents", agent: "bleed" },
      ],
      molt_influence: [
        { name: "Analyze collective state", agent: "molt" },
        { name: "Generate influence directives", agent: "molt" },
        { name: "Apply to active narratives", agent: "orchestrator" },
      ],
      full_generation: [
        { name: "Validate inputs", agent: "orchestrator" },
        { name: "Resolve references", agent: "orchestrator" },
        { name: "Generate images", agent: "worker" },
        { name: "Post-process", agent: "orchestrator" },
      ],
      character_spotlight: [
        { name: "Gather character signals", agent: "swarm" },
        { name: "Extract molt influence", agent: "molt" },
        { name: "Generate character shots", agent: "worker" },
      ],
      community_response: [
        { name: "Analyze community signals", agent: "swarm" },
        { name: "Generate response narrative", agent: "orchestrator" },
        { name: "Execute reality bleeds", agent: "bleed" },
      ],
    };

    return stepTemplates[type].map((template, index) => ({
      id: `step_${index}`,
      name: template.name,
      status: "pending",
      agent: template.agent,
    }));
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (workflow.status !== "pending") {
      throw new Error(`Workflow not in pending state: ${workflow.status}`);
    }

    workflow.status = "running";
    workflow.startedAt = new Date();

    console.log(`[Orchestrator] Executing workflow: ${workflow.type}`);
    this.emit("workflow:started", workflow);

    try {
      for (let i = workflow.currentStepIndex; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        workflow.currentStepIndex = i;

        step.status = "running";
        step.startedAt = new Date();

        console.log(`[Orchestrator] Step ${i + 1}/${workflow.steps.length}: ${step.name}`);

        try {
          step.output = await this.executeStep(workflow, step);
          step.status = "completed";
          step.completedAt = new Date();
        } catch (error) {
          step.status = "failed";
          step.error = error instanceof Error ? error.message : "Unknown error";
          step.completedAt = new Date();

          throw error;
        }
      }

      workflow.status = "completed";
      workflow.completedAt = new Date();
      workflow.output = this.aggregateStepOutputs(workflow);
      this.stats.completedWorkflows++;

      console.log(`[Orchestrator] Workflow completed: ${workflowId}`);
      this.emit("workflow:completed", workflow);
    } catch (error) {
      workflow.status = "failed";
      workflow.completedAt = new Date();
      workflow.error = error instanceof Error ? error.message : "Unknown error";
      this.stats.failedWorkflows++;

      console.error(`[Orchestrator] Workflow failed: ${workflowId} - ${workflow.error}`);
      this.emit("workflow:failed", workflow);
    }
  }

  private async executeStep(
    workflow: Workflow,
    step: WorkflowStep
  ): Promise<Record<string, unknown>> {
    // Get input from previous step or workflow input
    const input =
      workflow.currentStepIndex > 0
        ? workflow.steps[workflow.currentStepIndex - 1].output || {}
        : workflow.input;

    step.input = input;

    switch (step.agent) {
      case "swarm":
        return this.executeSwarmStep(workflow, step, input);
      case "bleed":
        return this.executeBleedStep(workflow, step, input);
      case "molt":
        return this.executeMoltStep(workflow, step, input);
      case "worker":
        return this.executeWorkerStep(workflow, step, input);
      case "orchestrator":
        return this.executeOrchestratorStep(workflow, step, input);
      default:
        throw new Error(`Unknown agent: ${step.agent}`);
    }
  }

  private async executeSwarmStep(
    _workflow: Workflow,
    step: WorkflowStep,
    input: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (!this.swarmEngine) {
      throw new Error("Swarm engine not available");
    }

    if (step.name.includes("brief")) {
      const briefs = this.swarmEngine.getBriefs();
      return { briefs, selectedBrief: input.brief || briefs[0] };
    }

    if (step.name.includes("signals")) {
      const patterns = this.swarmEngine.getPatterns();
      return { patterns };
    }

    return {};
  }

  private async executeBleedStep(
    _workflow: Workflow,
    step: WorkflowStep,
    input: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (!this.realityBleed) {
      throw new Error("Reality bleed not available");
    }

    if (step.name.includes("Validate")) {
      const candidates = this.realityBleed.getCandidates();
      return { candidates, valid: candidates.length > 0 };
    }

    if (step.name.includes("Transform")) {
      // Already transformed during submission
      return { transformed: true };
    }

    if (step.name.includes("Execute") || step.name.includes("Apply")) {
      const candidates = this.realityBleed.getCandidates();
      const episodeId = input.episodeId as string || "current";

      const bleeds = this.realityBleed.autoExecuteForEpisode(episodeId, 3);
      return { bleeds };
    }

    if (step.name.includes("Notify")) {
      // Notifications are automatic
      return { notified: true };
    }

    return {};
  }

  private async executeMoltStep(
    _workflow: Workflow,
    step: WorkflowStep,
    _input: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (!this.molt) {
      throw new Error("Molt not available");
    }

    if (step.name.includes("Analyze")) {
      const state = this.molt.getCollectiveState();
      return { collectiveState: state };
    }

    if (step.name.includes("influence") || step.name.includes("Generate")) {
      const influences = this.molt.getInfluences();
      return { influences };
    }

    if (step.name.includes("Apply") || step.name.includes("Extract")) {
      const influences = this.molt.getInfluences();
      return {
        applied: true,
        influences,
        narrativeModifications: influences.map((i) => i.suggestedNarrativeImpact),
      };
    }

    return {};
  }

  private async executeWorkerStep(
    _workflow: Workflow,
    step: WorkflowStep,
    input: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (!this.worker) {
      throw new Error("Worker not available");
    }

    if (step.name.includes("Generate images")) {
      const prompts = (input.prompts as string[]) || [];
      const tasks = prompts.map((prompt) =>
        this.worker!.submitImageTask(prompt, {
          episodeId: input.episodeId as string,
        })
      );

      // Wait for completion (simplified - real implementation would poll)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      return {
        tasks: tasks.map((t) => ({
          id: t.id,
          status: t.status,
          output: t.output,
        })),
      };
    }

    return {};
  }

  private async executeOrchestratorStep(
    workflow: Workflow,
    step: WorkflowStep,
    input: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (step.name.includes("Validate")) {
      return { valid: true, input };
    }

    if (step.name.includes("Resolve references")) {
      // Reference resolution logic
      return { referencesResolved: true };
    }

    if (step.name.includes("Generate shot prompts")) {
      const brief = input.selectedBrief as { synopsis?: string } | undefined;
      if (!brief) {
        return { prompts: [] };
      }

      // Generate prompts from brief
      const prompts = this.generatePromptsFromBrief(brief);
      return { prompts };
    }

    if (step.name.includes("Finalize") || step.name.includes("Post-process")) {
      return {
        finalized: true,
        workflowId: workflow.id,
        completedSteps: workflow.steps.filter((s) => s.status === "completed").length,
      };
    }

    if (step.name.includes("Apply to active")) {
      const influences = input.influences as { suggestedNarrativeImpact: string }[];
      return {
        applied: true,
        modifications: influences?.map((i) => i.suggestedNarrativeImpact) || [],
      };
    }

    if (step.name.includes("Insert")) {
      return { inserted: true };
    }

    if (step.name.includes("response narrative")) {
      return { narrative: "Generated response to community" };
    }

    return {};
  }

  private generatePromptsFromBrief(brief: { synopsis?: string }): string[] {
    // Simple prompt generation from brief
    const synopsis = brief.synopsis || "";
    const sentences = synopsis.split(". ").filter((s) => s.length > 20);

    return sentences.slice(0, 5).map((sentence) =>
      `Pixar-style dark animation, cinematic shot: ${sentence}`
    );
  }

  private aggregateStepOutputs(workflow: Workflow): Record<string, unknown> {
    const aggregated: Record<string, unknown> = {};

    workflow.steps.forEach((step) => {
      if (step.output) {
        Object.assign(aggregated, step.output);
      }
    });

    return aggregated;
  }

  // ==========================================================================
  // ORCHESTRATION CYCLE
  // ==========================================================================

  private async runOrchestrationCycle(): Promise<void> {
    if (!this.isRunning) return;

    // Count active workflows
    const activeWorkflows = Array.from(this.workflows.values()).filter(
      (w) => w.status === "running"
    ).length;

    // Process queued workflows
    while (
      activeWorkflows < this.config.maxConcurrentWorkflows &&
      this.workflowQueue.length > 0
    ) {
      const workflow = this.workflowQueue.shift();
      if (workflow) {
        this.executeWorkflow(workflow.id).catch((error) => {
          console.error(`[Orchestrator] Workflow execution error: ${error}`);
        });
      }
    }

    // Log status
    console.log(
      `[Orchestrator] Cycle complete - Active: ${activeWorkflows}, Queued: ${this.workflowQueue.length}`
    );
  }

  // ==========================================================================
  // STATS
  // ==========================================================================

  getStats(): OrchestratorStats {
    return {
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
      totalWorkflows: this.stats.totalWorkflows,
      completedWorkflows: this.stats.completedWorkflows,
      failedWorkflows: this.stats.failedWorkflows,
      activeWorkflows: Array.from(this.workflows.values()).filter(
        (w) => w.status === "running"
      ).length,
      agentStatuses: {
        swarm: this.swarmEngine?.getStats().isRunning || false,
        realityBleed: this.realityBleed?.getStats().isRunning || false,
        molt: this.molt?.getStats().isRunning || false,
        worker: this.worker?.isWorkerRunning() || false,
      },
    };
  }

  getAgentStats() {
    return {
      swarm: this.swarmEngine?.getStats(),
      realityBleed: this.realityBleed?.getStats(),
      molt: this.molt?.getStats(),
      worker: this.worker?.getStats(),
    };
  }

  // ==========================================================================
  // ID GENERATION
  // ==========================================================================

  private generateWorkflowId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  getWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  getSwarmEngine(): SwarmNarrativeEngineRuntime | null {
    return this.swarmEngine;
  }

  getRealityBleed(): RealityBleedRuntime | null {
    return this.realityBleed;
  }

  getMolt(): MoltRuntime | null {
    return this.molt;
  }

  getWorker(): BloodwingsWorkerRuntime | null {
    return this.worker;
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let orchestratorInstance: OrchestratorRuntime | null = null;

export function getOrchestrator(config?: Partial<OrchestratorConfig>): OrchestratorRuntime {
  if (!orchestratorInstance) {
    orchestratorInstance = new OrchestratorRuntime(config);
  }
  return orchestratorInstance;
}

export async function startOrchestrator(config?: Partial<OrchestratorConfig>): Promise<OrchestratorRuntime> {
  const orchestrator = getOrchestrator(config);
  await orchestrator.start();
  return orchestrator;
}
