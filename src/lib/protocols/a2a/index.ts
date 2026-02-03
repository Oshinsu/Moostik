/**
 * A2A (Agent-to-Agent) Protocol Implementation for MOOSTIK
 *
 * Google/Linux Foundation standard for secure, structured communication
 * between autonomous AI agents. Provides:
 * - Agent discovery and capability advertisement
 * - Task delegation and coordination
 * - Secure message passing
 * - Workflow orchestration
 *
 * @see https://google.github.io/A2A/
 */

import { EventEmitter } from "events";

// ============================================================================
// A2A Types (Based on A2A Specification)
// ============================================================================

/**
 * Agent Card - Describes an agent's identity and capabilities
 */
export interface A2AAgentCard {
  id: string;
  name: string;
  description: string;
  version: string;
  capabilities: A2ACapability[];
  endpoints: A2AEndpoint[];
  authentication?: A2AAuthentication;
  metadata?: Record<string, unknown>;
}

export interface A2ACapability {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  constraints?: string[];
}

export interface A2AEndpoint {
  protocol: "http" | "websocket" | "grpc" | "internal";
  url: string;
  capabilities: string[];
}

export interface A2AAuthentication {
  type: "none" | "bearer" | "oauth2" | "apiKey";
  config?: Record<string, unknown>;
}

/**
 * A2A Message - Standard message format between agents
 */
export interface A2AMessage {
  id: string;
  type: "request" | "response" | "notification" | "error";
  from: string;
  to: string;
  timestamp: Date;
  correlationId?: string;
  payload: A2APayload;
  metadata?: Record<string, unknown>;
}

export interface A2APayload {
  action: string;
  data?: Record<string, unknown>;
  error?: A2AError;
}

export interface A2AError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * A2A Task - A unit of work delegated between agents
 */
export interface A2ATask {
  id: string;
  type: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "failed" | "cancelled";
  priority: "low" | "normal" | "high" | "critical";
  createdBy: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: A2AError;
  subtasks?: A2ATask[];
  progress?: number;
}

/**
 * A2A Conversation - A thread of messages between agents
 */
export interface A2AConversation {
  id: string;
  participants: string[];
  topic: string;
  messages: A2AMessage[];
  status: "active" | "paused" | "completed" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// A2A Registry - Agent Discovery and Registration
// ============================================================================

export class A2ARegistry extends EventEmitter {
  private agents: Map<string, A2AAgentCard> = new Map();
  private capabilities: Map<string, Set<string>> = new Map(); // capability -> agent IDs

  /**
   * Register an agent with the registry
   */
  registerAgent(card: A2AAgentCard): void {
    this.agents.set(card.id, card);

    // Index capabilities
    for (const cap of card.capabilities) {
      if (!this.capabilities.has(cap.name)) {
        this.capabilities.set(cap.name, new Set());
      }
      this.capabilities.get(cap.name)!.add(card.id);
    }

    this.emit("agent:registered", card);
    console.log(`[A2A Registry] Agent registered: ${card.name} (${card.id})`);
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): boolean {
    const card = this.agents.get(agentId);
    if (!card) return false;

    // Remove from capability index
    for (const cap of card.capabilities) {
      this.capabilities.get(cap.name)?.delete(agentId);
    }

    this.agents.delete(agentId);
    this.emit("agent:unregistered", agentId);
    console.log(`[A2A Registry] Agent unregistered: ${agentId}`);
    return true;
  }

  /**
   * Get an agent's card
   */
  getAgent(agentId: string): A2AAgentCard | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): A2AAgentCard[] {
    return Array.from(this.agents.values());
  }

  /**
   * Find agents with a specific capability
   */
  findAgentsByCapability(capability: string): A2AAgentCard[] {
    const agentIds = this.capabilities.get(capability);
    if (!agentIds) return [];

    return Array.from(agentIds)
      .map((id) => this.agents.get(id))
      .filter((card): card is A2AAgentCard => card !== undefined);
  }

  /**
   * Check if a capability is available
   */
  hasCapability(capability: string): boolean {
    const agents = this.capabilities.get(capability);
    return agents !== undefined && agents.size > 0;
  }
}

// ============================================================================
// A2A Messenger - Message Passing Between Agents
// ============================================================================

export type MessageHandler = (message: A2AMessage) => Promise<A2AMessage | void>;

export class A2AMessenger extends EventEmitter {
  private registry: A2ARegistry;
  private handlers: Map<string, Map<string, MessageHandler>> = new Map(); // agentId -> action -> handler
  private conversations: Map<string, A2AConversation> = new Map();
  private messageQueue: Map<string, A2AMessage[]> = new Map(); // agentId -> pending messages

  constructor(registry: A2ARegistry) {
    super();
    this.registry = registry;
  }

  /**
   * Register a message handler for an agent
   */
  registerHandler(agentId: string, action: string, handler: MessageHandler): void {
    if (!this.handlers.has(agentId)) {
      this.handlers.set(agentId, new Map());
    }
    this.handlers.get(agentId)!.set(action, handler);
    console.log(`[A2A Messenger] Handler registered: ${agentId}/${action}`);
  }

  /**
   * Send a message to another agent
   */
  async send(message: Omit<A2AMessage, "id" | "timestamp">): Promise<A2AMessage> {
    const fullMessage: A2AMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    // Verify recipient exists
    const recipient = this.registry.getAgent(message.to);
    if (!recipient) {
      throw new Error(`Agent not found: ${message.to}`);
    }

    this.emit("message:sent", fullMessage);

    // Try to deliver immediately
    const delivered = await this.deliver(fullMessage);

    if (!delivered) {
      // Queue for later delivery
      if (!this.messageQueue.has(message.to)) {
        this.messageQueue.set(message.to, []);
      }
      this.messageQueue.get(message.to)!.push(fullMessage);
      console.log(`[A2A Messenger] Message queued for ${message.to}`);
    }

    return fullMessage;
  }

  /**
   * Deliver a message to its recipient
   */
  private async deliver(message: A2AMessage): Promise<boolean> {
    const handlers = this.handlers.get(message.to);
    if (!handlers) return false;

    const handler = handlers.get(message.payload.action) || handlers.get("*");
    if (!handler) {
      console.warn(`[A2A Messenger] No handler for action: ${message.payload.action}`);
      return false;
    }

    try {
      this.emit("message:delivering", message);
      const response = await handler(message);
      this.emit("message:delivered", message);

      // If handler returns a response, send it back
      if (response) {
        await this.send({
          type: "response",
          from: message.to,
          to: message.from,
          correlationId: message.id,
          payload: response.payload,
        });
      }

      return true;
    } catch (error) {
      console.error(`[A2A Messenger] Delivery failed:`, error);
      this.emit("message:failed", { message, error });
      return false;
    }
  }

  /**
   * Request-response pattern
   */
  async request(
    from: string,
    to: string,
    action: string,
    data?: Record<string, unknown>,
    timeout: number = 30000
  ): Promise<A2AMessage> {
    const request = await this.send({
      type: "request",
      from,
      to,
      payload: { action, data },
    });

    // Wait for response
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Request timeout: ${action} to ${to}`));
      }, timeout);

      const responseHandler = (response: A2AMessage) => {
        if (response.correlationId === request.id) {
          clearTimeout(timeoutId);
          this.off("message:delivered", responseHandler);
          resolve(response);
        }
      };

      this.on("message:delivered", responseHandler);
    });
  }

  /**
   * Broadcast a message to multiple agents
   */
  async broadcast(
    from: string,
    action: string,
    data?: Record<string, unknown>,
    filter?: (agent: A2AAgentCard) => boolean
  ): Promise<A2AMessage[]> {
    let targets = this.registry.getAllAgents();

    if (filter) {
      targets = targets.filter(filter);
    }

    // Don't send to self
    targets = targets.filter((a) => a.id !== from);

    const messages = await Promise.all(
      targets.map((target) =>
        this.send({
          type: "notification",
          from,
          to: target.id,
          payload: { action, data },
        })
      )
    );

    console.log(`[A2A Messenger] Broadcast to ${messages.length} agents`);
    return messages;
  }

  /**
   * Get pending messages for an agent
   */
  getPendingMessages(agentId: string): A2AMessage[] {
    const messages = this.messageQueue.get(agentId) || [];
    this.messageQueue.set(agentId, []);
    return messages;
  }

  /**
   * Start a conversation
   */
  startConversation(participants: string[], topic: string): A2AConversation {
    const conversation: A2AConversation = {
      id: crypto.randomUUID(),
      participants,
      topic,
      messages: [],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.conversations.set(conversation.id, conversation);
    this.emit("conversation:started", conversation);

    return conversation;
  }

  /**
   * Add a message to a conversation
   */
  addToConversation(conversationId: string, message: A2AMessage): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    conversation.messages.push(message);
    conversation.updatedAt = new Date();
    this.emit("conversation:updated", conversation);
  }
}

// ============================================================================
// A2A Task Manager - Task Delegation and Tracking
// ============================================================================

export class A2ATaskManager extends EventEmitter {
  private tasks: Map<string, A2ATask> = new Map();
  private agentTasks: Map<string, Set<string>> = new Map(); // agentId -> taskIds
  private messenger: A2AMessenger;
  private registry: A2ARegistry;

  constructor(registry: A2ARegistry, messenger: A2AMessenger) {
    super();
    this.registry = registry;
    this.messenger = messenger;
  }

  /**
   * Create and delegate a task
   */
  async createTask(
    createdBy: string,
    type: string,
    input: Record<string, unknown>,
    options?: {
      assignTo?: string;
      priority?: A2ATask["priority"];
      deadline?: Date;
    }
  ): Promise<A2ATask> {
    const task: A2ATask = {
      id: crypto.randomUUID(),
      type,
      status: "pending",
      priority: options?.priority || "normal",
      createdBy,
      assignedTo: options?.assignTo,
      createdAt: new Date(),
      updatedAt: new Date(),
      deadline: options?.deadline,
      input,
    };

    this.tasks.set(task.id, task);
    this.emit("task:created", task);

    // If no assignee, find one based on capability
    if (!task.assignedTo) {
      const capable = this.registry.findAgentsByCapability(type);
      if (capable.length > 0) {
        // Simple round-robin assignment
        task.assignedTo = capable[0].id;
      }
    }

    // Delegate if assigned
    if (task.assignedTo) {
      await this.delegateTask(task);
    }

    return task;
  }

  /**
   * Delegate a task to an agent
   */
  private async delegateTask(task: A2ATask): Promise<void> {
    if (!task.assignedTo) return;

    // Track task by agent
    if (!this.agentTasks.has(task.assignedTo)) {
      this.agentTasks.set(task.assignedTo, new Set());
    }
    this.agentTasks.get(task.assignedTo)!.add(task.id);

    // Send delegation message
    await this.messenger.send({
      type: "request",
      from: task.createdBy,
      to: task.assignedTo,
      payload: {
        action: "task:delegate",
        data: {
          taskId: task.id,
          type: task.type,
          input: task.input,
          priority: task.priority,
          deadline: task.deadline,
        },
      },
    });

    console.log(`[A2A Tasks] Delegated task ${task.id} to ${task.assignedTo}`);
    this.emit("task:delegated", task);
  }

  /**
   * Accept a delegated task
   */
  acceptTask(taskId: string, agentId: string): A2ATask | null {
    const task = this.tasks.get(taskId);
    if (!task || task.assignedTo !== agentId) return null;

    task.status = "accepted";
    task.updatedAt = new Date();
    this.emit("task:accepted", task);

    return task;
  }

  /**
   * Start working on a task
   */
  startTask(taskId: string): A2ATask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.status = "in_progress";
    task.updatedAt = new Date();
    this.emit("task:started", task);

    return task;
  }

  /**
   * Update task progress
   */
  updateProgress(taskId: string, progress: number): A2ATask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.progress = Math.max(0, Math.min(100, progress));
    task.updatedAt = new Date();
    this.emit("task:progress", task);

    return task;
  }

  /**
   * Complete a task
   */
  completeTask(taskId: string, output: Record<string, unknown>): A2ATask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.status = "completed";
    task.output = output;
    task.progress = 100;
    task.updatedAt = new Date();

    this.emit("task:completed", task);
    console.log(`[A2A Tasks] Task completed: ${taskId}`);

    // Notify creator
    if (task.assignedTo && task.createdBy !== task.assignedTo) {
      this.messenger.send({
        type: "notification",
        from: task.assignedTo,
        to: task.createdBy,
        payload: {
          action: "task:completed",
          data: { taskId, output },
        },
      });
    }

    return task;
  }

  /**
   * Fail a task
   */
  failTask(taskId: string, error: A2AError): A2ATask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.status = "failed";
    task.error = error;
    task.updatedAt = new Date();

    this.emit("task:failed", task);
    console.log(`[A2A Tasks] Task failed: ${taskId} - ${error.message}`);

    return task;
  }

  /**
   * Cancel a task
   */
  cancelTask(taskId: string, reason?: string): A2ATask | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.status = "cancelled";
    task.error = {
      code: "CANCELLED",
      message: reason || "Task was cancelled",
    };
    task.updatedAt = new Date();

    this.emit("task:cancelled", task);

    return task;
  }

  /**
   * Get a task by ID
   */
  getTask(taskId: string): A2ATask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks for an agent
   */
  getAgentTasks(agentId: string): A2ATask[] {
    const taskIds = this.agentTasks.get(agentId);
    if (!taskIds) return [];

    return Array.from(taskIds)
      .map((id) => this.tasks.get(id))
      .filter((t): t is A2ATask => t !== undefined);
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: A2ATask["status"]): A2ATask[] {
    return Array.from(this.tasks.values()).filter((t) => t.status === status);
  }
}

// ============================================================================
// MOOSTIK A2A Hub - Pre-configured A2A infrastructure
// ============================================================================

export interface A2AHub {
  registry: A2ARegistry;
  messenger: A2AMessenger;
  taskManager: A2ATaskManager;
}

export function createA2AHub(): A2AHub {
  const registry = new A2ARegistry();
  const messenger = new A2AMessenger(registry);
  const taskManager = new A2ATaskManager(registry, messenger);

  // Pre-register MOOSTIK agent cards
  const moostikAgents: A2AAgentCard[] = [
    {
      id: "swarm-narrative",
      name: "Swarm Narrative Engine",
      description: "Generates emergent narratives from collective signals",
      version: "1.0.0",
      capabilities: [
        {
          name: "narrative:generate",
          description: "Generate narrative from signals",
          inputSchema: { signals: "array", mood: "string" },
        },
        {
          name: "pattern:detect",
          description: "Detect patterns in signal streams",
          inputSchema: { signals: "array" },
        },
      ],
      endpoints: [{ protocol: "internal", url: "swarm://narrative", capabilities: ["*"] }],
    },
    {
      id: "reality-bleed",
      name: "Reality Bleed Protocol",
      description: "Fourth-wall breaking system for meta-content",
      version: "1.0.0",
      capabilities: [
        {
          name: "bleed:submit",
          description: "Submit content for bleeding",
          inputSchema: { content: "string", targetEpisode: "string" },
        },
        {
          name: "bleed:execute",
          description: "Execute a bleed into the narrative",
          inputSchema: { candidateId: "string" },
        },
      ],
      endpoints: [{ protocol: "internal", url: "bleed://protocol", capabilities: ["*"] }],
    },
    {
      id: "molt-collective",
      name: "THE MOLT Collective Unconscious",
      description: "Jungian collective unconscious for agents",
      version: "1.0.0",
      capabilities: [
        {
          name: "dream:submit",
          description: "Submit dream material",
          inputSchema: { content: "string", agentId: "string" },
        },
        {
          name: "symbol:interpret",
          description: "Interpret symbolic content",
          inputSchema: { symbols: "array" },
        },
      ],
      endpoints: [{ protocol: "internal", url: "molt://unconscious", capabilities: ["*"] }],
    },
    {
      id: "bloodwings-worker",
      name: "Bloodwings Generation Worker",
      description: "Image and video generation worker",
      version: "1.0.0",
      capabilities: [
        {
          name: "generate:image",
          description: "Generate an image",
          inputSchema: { prompt: "string", style: "string" },
        },
        {
          name: "generate:video",
          description: "Generate a video",
          inputSchema: { prompt: "string", duration: "number" },
        },
      ],
      endpoints: [{ protocol: "internal", url: "worker://generation", capabilities: ["*"] }],
    },
    {
      id: "orchestrator",
      name: "MOOSTIK Orchestrator",
      description: "Central coordinator for all agents",
      version: "1.0.0",
      capabilities: [
        {
          name: "workflow:create",
          description: "Create a new workflow",
          inputSchema: { type: "string", input: "object" },
        },
        {
          name: "workflow:execute",
          description: "Execute a workflow",
          inputSchema: { workflowId: "string" },
        },
        {
          name: "agent:status",
          description: "Get status of all agents",
          inputSchema: {},
        },
      ],
      endpoints: [{ protocol: "internal", url: "orchestrator://main", capabilities: ["*"] }],
    },
  ];

  // Register all agents
  for (const agent of moostikAgents) {
    registry.registerAgent(agent);
  }

  console.log(`[A2A Hub] Initialized with ${moostikAgents.length} agents`);

  return { registry, messenger, taskManager };
}

// ============================================================================
// Singleton and Exports
// ============================================================================

let a2aHub: A2AHub | null = null;

export function getA2AHub(): A2AHub {
  if (!a2aHub) {
    a2aHub = createA2AHub();
  }
  return a2aHub;
}

export default getA2AHub;
