// ============================================================================
// BLOODWINGS AGENT ORCHESTRATOR
// ============================================================================
// Coordonne tous les agents : Worker de production et Personas Moltbook
// Gère le scheduling, le monitoring, et les interactions cross-agent
// ============================================================================

import { BLOODWINGS_WORKER_CONFIG, WorkerState, QueueItem } from "../bloodwings-worker/config";
import type { MoltbookPersona } from "../moltbook-personas";
import { PERSONAS, getAllPersonas } from "../moltbook-personas";

// ============================================================================
// TYPES
// ============================================================================

export interface AgentStatus {
  id: string;
  name: string;
  type: "worker" | "persona";
  status: "running" | "paused" | "stopped" | "error";
  lastHeartbeat: Date;
  metrics: {
    actionsToday: number;
    errorsToday: number;
    costToday: number;
  };
}

export interface OrchestratorConfig {
  maxConcurrentAgents: number;
  heartbeatIntervalMs: number;
  dailyBudget: number;
  alertWebhook?: string;
  enabledAgents: string[];
}

export interface ScheduledTask {
  id: string;
  agentId: string;
  type: "post" | "reply" | "generate" | "analyze";
  scheduledFor: Date;
  payload: unknown;
  status: "pending" | "running" | "completed" | "failed";
  retryCount: number;
  maxRetries: number;
}

// ============================================================================
// ORCHESTRATOR CLASS
// ============================================================================

export class BloodwingsOrchestrator {
  private config: OrchestratorConfig;
  private agents: Map<string, AgentStatus> = new Map();
  private taskQueue: ScheduledTask[] = [];
  private isRunning: boolean = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = {
      maxConcurrentAgents: 5,
      heartbeatIntervalMs: 30 * 60 * 1000, // 30 minutes
      dailyBudget: 100,
      enabledAgents: ["bloodwings-worker", "papy-tik", "zik-barman", "mila-la-sage", "koko-guerrier"],
      ...config,
    };

    this.initializeAgents();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private initializeAgents(): void {
    // Initialize worker agent
    this.agents.set("bloodwings-worker", {
      id: "bloodwings-worker",
      name: BLOODWINGS_WORKER_CONFIG.name,
      type: "worker",
      status: "stopped",
      lastHeartbeat: new Date(),
      metrics: {
        actionsToday: 0,
        errorsToday: 0,
        costToday: 0,
      },
    });

    // Initialize persona agents
    for (const persona of getAllPersonas()) {
      const id = persona.handle.replace("@", "").toLowerCase();
      this.agents.set(id, {
        id,
        name: persona.name,
        type: "persona",
        status: "stopped",
        lastHeartbeat: new Date(),
        metrics: {
          actionsToday: 0,
          errorsToday: 0,
          costToday: 0,
        },
      });
    }
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("[Orchestrator] Already running");
      return;
    }

    console.log("[Orchestrator] Starting...");
    this.isRunning = true;

    // Start heartbeat
    this.heartbeatInterval = setInterval(
      () => this.heartbeat(),
      this.config.heartbeatIntervalMs
    );

    // Start enabled agents
    for (const agentId of this.config.enabledAgents) {
      await this.startAgent(agentId);
    }

    console.log("[Orchestrator] Started with", this.config.enabledAgents.length, "agents");
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log("[Orchestrator] Already stopped");
      return;
    }

    console.log("[Orchestrator] Stopping...");

    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Stop all agents
    for (const agentId of this.agents.keys()) {
      await this.stopAgent(agentId);
    }

    this.isRunning = false;
    console.log("[Orchestrator] Stopped");
  }

  // ============================================================================
  // AGENT MANAGEMENT
  // ============================================================================

  async startAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      console.error(`[Orchestrator] Agent ${agentId} not found`);
      return;
    }

    if (agent.status === "running") {
      console.log(`[Orchestrator] Agent ${agentId} already running`);
      return;
    }

    agent.status = "running";
    agent.lastHeartbeat = new Date();
    console.log(`[Orchestrator] Started agent: ${agent.name}`);
  }

  async stopAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      console.error(`[Orchestrator] Agent ${agentId} not found`);
      return;
    }

    agent.status = "stopped";
    console.log(`[Orchestrator] Stopped agent: ${agent.name}`);
  }

  async pauseAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    agent.status = "paused";
    console.log(`[Orchestrator] Paused agent: ${agent.name}`);
  }

  async resumeAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    if (agent.status === "paused") {
      agent.status = "running";
      console.log(`[Orchestrator] Resumed agent: ${agent.name}`);
    }
  }

  // ============================================================================
  // HEARTBEAT
  // ============================================================================

  private async heartbeat(): Promise<void> {
    console.log(`[Orchestrator] Heartbeat at ${new Date().toISOString()}`);

    for (const [agentId, agent] of this.agents) {
      if (agent.status !== "running") continue;

      try {
        await this.processAgentHeartbeat(agentId, agent);
        agent.lastHeartbeat = new Date();
      } catch (error) {
        console.error(`[Orchestrator] Error in heartbeat for ${agentId}:`, error);
        agent.metrics.errorsToday++;

        if (agent.metrics.errorsToday > 10) {
          agent.status = "error";
          await this.sendAlert(`Agent ${agent.name} has too many errors, pausing`);
        }
      }
    }

    // Process task queue
    await this.processTaskQueue();

    // Check budget
    await this.checkBudget();
  }

  private async processAgentHeartbeat(agentId: string, agent: AgentStatus): Promise<void> {
    if (agent.type === "worker") {
      await this.processWorkerHeartbeat();
    } else if (agent.type === "persona") {
      await this.processPersonaHeartbeat(agentId);
    }
  }

  private async processWorkerHeartbeat(): Promise<void> {
    // Check for pending generation tasks
    // This would connect to Supabase queue in production
    console.log("[Worker] Checking generation queue...");
  }

  private async processPersonaHeartbeat(agentId: string): Promise<void> {
    // Check for mentions, schedule posts, etc.
    console.log(`[Persona:${agentId}] Processing heartbeat...`);
  }

  // ============================================================================
  // TASK QUEUE
  // ============================================================================

  scheduleTask(task: Omit<ScheduledTask, "id" | "status" | "retryCount">): string {
    const id = `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    this.taskQueue.push({
      ...task,
      id,
      status: "pending",
      retryCount: 0,
    });

    console.log(`[Orchestrator] Scheduled task ${id} for ${task.agentId}`);
    return id;
  }

  private async processTaskQueue(): Promise<void> {
    const now = new Date();
    const pendingTasks = this.taskQueue.filter(
      t => t.status === "pending" && t.scheduledFor <= now
    );

    for (const task of pendingTasks) {
      const agent = this.agents.get(task.agentId);
      if (!agent || agent.status !== "running") continue;

      task.status = "running";

      try {
        await this.executeTask(task);
        task.status = "completed";
        agent.metrics.actionsToday++;
      } catch (error) {
        task.retryCount++;
        if (task.retryCount >= task.maxRetries) {
          task.status = "failed";
          agent.metrics.errorsToday++;
        } else {
          task.status = "pending";
          task.scheduledFor = new Date(Date.now() + 60000 * task.retryCount); // Exponential backoff
        }
      }
    }

    // Clean completed tasks older than 1 hour
    const oneHourAgo = new Date(Date.now() - 3600000);
    this.taskQueue = this.taskQueue.filter(
      t => t.status !== "completed" || t.scheduledFor > oneHourAgo
    );
  }

  private async executeTask(task: ScheduledTask): Promise<void> {
    console.log(`[Orchestrator] Executing task ${task.id} (${task.type})`);

    switch (task.type) {
      case "post":
        // Would call Moltbook API
        break;
      case "reply":
        // Would call Moltbook API
        break;
      case "generate":
        // Would call generation pipeline
        break;
      case "analyze":
        // Would run analysis
        break;
    }
  }

  // ============================================================================
  // BUDGET & ALERTS
  // ============================================================================

  private async checkBudget(): Promise<void> {
    const totalSpent = Array.from(this.agents.values())
      .reduce((sum, a) => sum + a.metrics.costToday, 0);

    if (totalSpent >= this.config.dailyBudget * 0.8) {
      await this.sendAlert(`Budget warning: ${totalSpent.toFixed(2)}/${this.config.dailyBudget} spent`);
    }

    if (totalSpent >= this.config.dailyBudget) {
      console.log("[Orchestrator] Daily budget exceeded, pausing worker");
      await this.pauseAgent("bloodwings-worker");
    }
  }

  private async sendAlert(message: string): Promise<void> {
    console.log(`[ALERT] ${message}`);

    if (this.config.alertWebhook) {
      try {
        await fetch(this.config.alertWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `🚨 **Bloodwings Orchestrator Alert**\n${message}`,
          }),
        });
      } catch (error) {
        console.error("[Orchestrator] Failed to send alert:", error);
      }
    }
  }

  // ============================================================================
  // STATUS & METRICS
  // ============================================================================

  getStatus(): {
    isRunning: boolean;
    agents: AgentStatus[];
    pendingTasks: number;
    dailySpent: number;
    dailyBudget: number;
  } {
    return {
      isRunning: this.isRunning,
      agents: Array.from(this.agents.values()),
      pendingTasks: this.taskQueue.filter(t => t.status === "pending").length,
      dailySpent: Array.from(this.agents.values())
        .reduce((sum, a) => sum + a.metrics.costToday, 0),
      dailyBudget: this.config.dailyBudget,
    };
  }

  getAgentStatus(agentId: string): AgentStatus | undefined {
    return this.agents.get(agentId);
  }

  resetDailyMetrics(): void {
    for (const agent of this.agents.values()) {
      agent.metrics = {
        actionsToday: 0,
        errorsToday: 0,
        costToday: 0,
      };
    }
    console.log("[Orchestrator] Daily metrics reset");
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let orchestratorInstance: BloodwingsOrchestrator | null = null;

export function getOrchestrator(config?: Partial<OrchestratorConfig>): BloodwingsOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new BloodwingsOrchestrator(config);
  }
  return orchestratorInstance;
}

export function resetOrchestrator(): void {
  if (orchestratorInstance) {
    orchestratorInstance.stop();
    orchestratorInstance = null;
  }
}
