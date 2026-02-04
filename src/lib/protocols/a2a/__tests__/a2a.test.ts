/**
 * A2A Protocol Tests
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  A2ARegistry,
  A2AMessenger,
  A2ATaskManager,
  createA2AHub,
  getA2AHub,
  type A2AAgentCard,
  type A2AMessage,
} from "../index";

describe("A2A Protocol", () => {
  describe("A2ARegistry", () => {
    let registry: A2ARegistry;

    beforeEach(() => {
      registry = new A2ARegistry();
    });

    it("should register agents", () => {
      const agent: A2AAgentCard = {
        id: "test-agent",
        name: "Test Agent",
        description: "A test agent",
        version: "1.0.0",
        capabilities: [
          { name: "test:action", description: "Test action" },
        ],
        endpoints: [
          { protocol: "internal", url: "test://agent", capabilities: ["*"] },
        ],
      };

      registry.registerAgent(agent);

      const retrieved = registry.getAgent("test-agent");
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe("Test Agent");
    });

    it("should unregister agents", () => {
      const agent: A2AAgentCard = {
        id: "temp-agent",
        name: "Temporary",
        description: "Temp",
        version: "1.0.0",
        capabilities: [],
        endpoints: [],
      };

      registry.registerAgent(agent);
      expect(registry.getAgent("temp-agent")).toBeDefined();

      const result = registry.unregisterAgent("temp-agent");
      expect(result).toBe(true);
      expect(registry.getAgent("temp-agent")).toBeUndefined();
    });

    it("should find agents by capability", () => {
      const agent1: A2AAgentCard = {
        id: "agent-1",
        name: "Agent 1",
        description: "First",
        version: "1.0.0",
        capabilities: [{ name: "generate:image", description: "Generate images" }],
        endpoints: [],
      };

      const agent2: A2AAgentCard = {
        id: "agent-2",
        name: "Agent 2",
        description: "Second",
        version: "1.0.0",
        capabilities: [{ name: "generate:video", description: "Generate videos" }],
        endpoints: [],
      };

      registry.registerAgent(agent1);
      registry.registerAgent(agent2);

      const imageAgents = registry.findAgentsByCapability("generate:image");
      expect(imageAgents.length).toBe(1);
      expect(imageAgents[0].id).toBe("agent-1");

      const videoAgents = registry.findAgentsByCapability("generate:video");
      expect(videoAgents.length).toBe(1);
      expect(videoAgents[0].id).toBe("agent-2");
    });

    it("should check capability availability", () => {
      const agent: A2AAgentCard = {
        id: "cap-agent",
        name: "Capable",
        description: "Has capabilities",
        version: "1.0.0",
        capabilities: [{ name: "special:action", description: "Special" }],
        endpoints: [],
      };

      registry.registerAgent(agent);

      expect(registry.hasCapability("special:action")).toBe(true);
      expect(registry.hasCapability("nonexistent:action")).toBe(false);
    });

    it("should get all agents", () => {
      registry.registerAgent({
        id: "a1", name: "A1", description: "", version: "1.0.0",
        capabilities: [], endpoints: [],
      });
      registry.registerAgent({
        id: "a2", name: "A2", description: "", version: "1.0.0",
        capabilities: [], endpoints: [],
      });

      const all = registry.getAllAgents();
      expect(all.length).toBe(2);
    });
  });

  describe("A2AMessenger", () => {
    let registry: A2ARegistry;
    let messenger: A2AMessenger;

    beforeEach(() => {
      registry = new A2ARegistry();
      messenger = new A2AMessenger(registry);

      // Register test agents
      registry.registerAgent({
        id: "sender", name: "Sender", description: "", version: "1.0.0",
        capabilities: [], endpoints: [],
      });
      registry.registerAgent({
        id: "receiver", name: "Receiver", description: "", version: "1.0.0",
        capabilities: [], endpoints: [],
      });
    });

    it("should send messages", async () => {
      const message = await messenger.send({
        type: "notification",
        from: "sender",
        to: "receiver",
        payload: { action: "test", data: { value: 42 } },
      });

      expect(message.id).toBeDefined();
      expect(message.timestamp).toBeDefined();
      expect(message.from).toBe("sender");
      expect(message.to).toBe("receiver");
    });

    it("should throw for unknown recipient", async () => {
      await expect(
        messenger.send({
          type: "notification",
          from: "sender",
          to: "unknown",
          payload: { action: "test" },
        })
      ).rejects.toThrow("Agent not found");
    });

    it("should register and invoke handlers", async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      messenger.registerHandler("receiver", "test:action", handler);

      await messenger.send({
        type: "request",
        from: "sender",
        to: "receiver",
        payload: { action: "test:action", data: { x: 1 } },
      });

      expect(handler).toHaveBeenCalled();
    });

    it("should handle request-response pattern", async () => {
      messenger.registerHandler("receiver", "echo", async (msg) => ({
        id: msg.id,
        type: "response" as const,
        from: "receiver",
        to: "sender",
        timestamp: new Date(),
        payload: { action: "echo:response", data: msg.payload.data },
      }));

      // Note: This test verifies the handler is called
      const handler = vi.fn();
      messenger.registerHandler("receiver", "ping", handler);

      await messenger.send({
        type: "request",
        from: "sender",
        to: "receiver",
        payload: { action: "ping" },
      });

      expect(handler).toHaveBeenCalled();
    });

    it("should broadcast to multiple agents", async () => {
      registry.registerAgent({
        id: "agent-a", name: "A", description: "", version: "1.0.0",
        capabilities: [], endpoints: [],
      });
      registry.registerAgent({
        id: "agent-b", name: "B", description: "", version: "1.0.0",
        capabilities: [], endpoints: [],
      });

      const messages = await messenger.broadcast(
        "sender",
        "announcement",
        { message: "Hello all" }
      );

      // Should send to all except sender
      expect(messages.length).toBeGreaterThanOrEqual(2);
    });

    it("should start conversations", () => {
      const conversation = messenger.startConversation(
        ["sender", "receiver"],
        "Test Topic"
      );

      expect(conversation.id).toBeDefined();
      expect(conversation.participants).toContain("sender");
      expect(conversation.participants).toContain("receiver");
      expect(conversation.topic).toBe("Test Topic");
      expect(conversation.status).toBe("active");
    });
  });

  describe("A2ATaskManager", () => {
    let registry: A2ARegistry;
    let messenger: A2AMessenger;
    let taskManager: A2ATaskManager;

    beforeEach(() => {
      registry = new A2ARegistry();
      messenger = new A2AMessenger(registry);
      taskManager = new A2ATaskManager(registry, messenger);

      registry.registerAgent({
        id: "creator", name: "Creator", description: "", version: "1.0.0",
        capabilities: [], endpoints: [],
      });
      registry.registerAgent({
        id: "worker", name: "Worker", description: "", version: "1.0.0",
        capabilities: [{ name: "process:data", description: "Process data" }],
        endpoints: [],
      });
    });

    it("should create tasks", async () => {
      const task = await taskManager.createTask(
        "creator",
        "process:data",
        { input: "test" },
        { priority: "high" }
      );

      expect(task.id).toBeDefined();
      expect(task.type).toBe("process:data");
      expect(task.createdBy).toBe("creator");
      expect(task.priority).toBe("high");
      expect(task.status).toBe("pending");
    });

    it("should auto-assign to capable agent", async () => {
      const task = await taskManager.createTask(
        "creator",
        "process:data",
        { input: "test" }
      );

      expect(task.assignedTo).toBe("worker");
    });

    it("should accept tasks", async () => {
      const task = await taskManager.createTask(
        "creator",
        "process:data",
        {},
        { assignTo: "worker" }
      );

      const accepted = taskManager.acceptTask(task.id, "worker");
      expect(accepted?.status).toBe("accepted");
    });

    it("should start and complete tasks", async () => {
      const task = await taskManager.createTask(
        "creator",
        "manual:task",
        {},
        { assignTo: "worker" }
      );

      taskManager.acceptTask(task.id, "worker");
      const started = taskManager.startTask(task.id);
      expect(started?.status).toBe("in_progress");

      const completed = taskManager.completeTask(task.id, { result: "done" });
      expect(completed?.status).toBe("completed");
      expect(completed?.output).toEqual({ result: "done" });
    });

    it("should fail tasks with error", async () => {
      const task = await taskManager.createTask(
        "creator",
        "fail:task",
        {},
        { assignTo: "worker" }
      );

      const failed = taskManager.failTask(task.id, {
        code: "ERROR",
        message: "Something went wrong",
      });

      expect(failed?.status).toBe("failed");
      expect(failed?.error?.message).toBe("Something went wrong");
    });

    it("should update progress", async () => {
      const task = await taskManager.createTask(
        "creator",
        "long:task",
        {},
        { assignTo: "worker" }
      );

      taskManager.startTask(task.id);
      const updated = taskManager.updateProgress(task.id, 50);

      expect(updated?.progress).toBe(50);
    });

    it("should get tasks by status", async () => {
      await taskManager.createTask("creator", "t1", {}, { assignTo: "worker" });
      const task2 = await taskManager.createTask("creator", "t2", {}, { assignTo: "worker" });

      taskManager.startTask(task2.id);

      const pending = taskManager.getTasksByStatus("pending");
      const inProgress = taskManager.getTasksByStatus("in_progress");

      expect(pending.length).toBeGreaterThanOrEqual(1);
      expect(inProgress.length).toBe(1);
    });
  });

  describe("A2A Hub", () => {
    it("should create hub with all components", () => {
      const hub = createA2AHub();

      expect(hub.registry).toBeDefined();
      expect(hub.messenger).toBeDefined();
      expect(hub.taskManager).toBeDefined();
    });

    it("should have pre-registered MOOSTIK agents", () => {
      const hub = createA2AHub();
      const agents = hub.registry.getAllAgents();

      const agentIds = agents.map((a) => a.id);
      expect(agentIds).toContain("swarm-narrative");
      expect(agentIds).toContain("reality-bleed");
      expect(agentIds).toContain("molt-collective");
      expect(agentIds).toContain("bloodwings-worker");
      expect(agentIds).toContain("orchestrator");
    });

    it("should return singleton", () => {
      const hub1 = getA2AHub();
      const hub2 = getA2AHub();

      expect(hub1).toBe(hub2);
    });
  });
});
