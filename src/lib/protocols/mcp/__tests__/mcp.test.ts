/**
 * MCP Protocol Tests
 * Tests the real MCP implementation with actual data sources
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  MCPServer,
  MCPClient,
  createMoostikMCPServer,
  getMCPServer,
  createMCPClient,
  type MCPTool,
  type MCPToolCall,
} from "../index";

describe("MCP Protocol", () => {
  let server: MCPServer;

  beforeEach(() => {
    server = createMoostikMCPServer();
  });

  describe("MCPServer", () => {
    it("should initialize with correct config", () => {
      expect(server).toBeDefined();
      expect(server.getTools().length).toBeGreaterThan(0);
    });

    it("should have pre-registered MOOSTIK tools", () => {
      const tools = server.getTools();
      const toolNames = tools.map((t) => t.name);

      expect(toolNames).toContain("generate_image");
      expect(toolNames).toContain("generate_video");
      expect(toolNames).toContain("get_characters");
      expect(toolNames).toContain("get_episodes");
      expect(toolNames).toContain("remember");
      expect(toolNames).toContain("recall");
      expect(toolNames).toContain("send_message");
    });

    it("should register custom tools", () => {
      const customTool: MCPTool = {
        name: "custom_tool",
        description: "A custom test tool",
        inputSchema: {
          type: "object",
          properties: {
            input: { type: "string", description: "Test input" },
          },
          required: ["input"],
        },
      };

      server.registerTool(customTool, async (args) => {
        return { result: `Processed: ${args.input}` };
      });

      const tools = server.getTools();
      expect(tools.find((t) => t.name === "custom_tool")).toBeDefined();
    });

    it("should execute get_characters with real data", async () => {
      const call: MCPToolCall = {
        id: "test-call-characters",
        name: "get_characters",
        arguments: {},
      };

      const result = await server.executeTool(call);

      expect(result.id).toBe("test-call-characters");
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();

      const data = result.result as { characters: Array<{ id: string; name: string }>; total: number };
      expect(data.characters).toBeDefined();
      expect(Array.isArray(data.characters)).toBe(true);
      // Should have real characters from data/characters.json
      expect(data.total).toBeGreaterThan(0);
      // Check for known character
      const papyTik = data.characters.find((c) => c.id === "papy-tik");
      expect(papyTik).toBeDefined();
    });

    it("should filter characters by ID", async () => {
      const call: MCPToolCall = {
        id: "test-call-character-filter",
        name: "get_characters",
        arguments: { characterId: "papy-tik" },
      };

      const result = await server.executeTool(call);

      expect(result.success).toBe(true);
      const data = result.result as { characters: Array<{ id: string }>; total: number };
      expect(data.total).toBe(1);
      expect(data.characters[0].id).toBe("papy-tik");
    });

    it("should execute get_episodes with real data", async () => {
      const call: MCPToolCall = {
        id: "test-call-episodes",
        name: "get_episodes",
        arguments: {},
      };

      const result = await server.executeTool(call);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();

      const data = result.result as { episodes: Array<{ id: string; title?: string }>; total: number };
      expect(data.episodes).toBeDefined();
      expect(Array.isArray(data.episodes)).toBe(true);
      // Should have real episodes from data/episodes/
      expect(data.total).toBeGreaterThan(0);
    });

    it("should return error for unknown tools", async () => {
      const call: MCPToolCall = {
        id: "test-call-unknown",
        name: "unknown_tool",
        arguments: {},
      };

      const result = await server.executeTool(call);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Tool not found");
    });

    it("should register and retrieve resources", () => {
      const resources = server.getResources();

      expect(resources.length).toBeGreaterThan(0);
      expect(resources.some((r) => r.uri.includes("characters"))).toBe(true);
      expect(resources.some((r) => r.uri.includes("episodes"))).toBe(true);
    });

    it("should register and retrieve prompts", () => {
      const prompts = server.getPrompts();

      expect(prompts.length).toBeGreaterThan(0);
      expect(prompts.some((p) => p.name === "narrative_generation")).toBe(true);
      expect(prompts.some((p) => p.name === "character_dialogue")).toBe(true);
    });

    it("should create and manage sessions", () => {
      const session = server.createSession("test-agent");

      expect(session.sessionId).toBeDefined();
      expect(session.agentId).toBe("test-agent");
      expect(session.tools.length).toBeGreaterThan(0);
      expect(session.resources.length).toBeGreaterThan(0);

      const retrieved = server.getSession(session.sessionId);
      expect(retrieved).toEqual(session);

      const closed = server.closeSession(session.sessionId);
      expect(closed).toBe(true);

      expect(server.getSession(session.sessionId)).toBeUndefined();
    });
  });

  describe("MCPClient", () => {
    it("should connect to server", () => {
      const client = new MCPClient(server, "client-agent");
      const context = client.connect();

      expect(context.agentId).toBe("client-agent");
      expect(context.tools.length).toBeGreaterThan(0);
      expect(client.isConnected()).toBe(true);
    });

    it("should get available tools", () => {
      const client = new MCPClient(server, "client-agent");
      client.connect();

      const tools = client.getAvailableTools();
      expect(tools.length).toBeGreaterThan(0);
    });

    it("should call tools through client and get real data", async () => {
      const client = new MCPClient(server, "client-agent");
      client.connect();

      const result = await client.callTool("get_characters", {});

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();

      const data = result.result as { characters: Array<{ id: string }>; total: number };
      expect(data.characters.length).toBeGreaterThan(0);
    });

    it("should disconnect properly", () => {
      const client = new MCPClient(server, "client-agent");
      client.connect();
      expect(client.isConnected()).toBe(true);

      client.disconnect();
      expect(client.isConnected()).toBe(false);
    });
  });

  describe("Memory Integration", () => {
    it("should remember and recall using Mem0", async () => {
      const client = new MCPClient(server, "memory-test-agent");
      client.connect();

      // Store a memory
      const rememberResult = await client.callTool("remember", {
        content: "Test memory for MCP integration",
        type: "episodic",
        agentId: "mcp-test-agent",
      });

      expect(rememberResult.success).toBe(true);
      const remembered = rememberResult.result as { memoryId: string; stored: boolean };
      expect(remembered.stored).toBe(true);
      expect(remembered.memoryId).toBeDefined();

      // Recall memories
      const recallResult = await client.callTool("recall", {
        query: "Test memory",
        agentId: "mcp-test-agent",
      });

      expect(recallResult.success).toBe(true);
    });
  });

  describe("A2A Integration", () => {
    it("should send messages to registered agents", async () => {
      const client = new MCPClient(server, "a2a-test-agent");
      client.connect();

      // Send to a pre-registered agent
      const result = await client.callTool("send_message", {
        toAgent: "orchestrator",
        content: "Test message from MCP",
        fromAgent: "a2a-test-agent",
      });

      expect(result.success).toBe(true);
      const message = result.result as { delivered: boolean; messageId?: string };
      expect(message.delivered).toBe(true);
      expect(message.messageId).toBeDefined();
    });

    it("should return error for unknown agents", async () => {
      const client = new MCPClient(server, "a2a-test-agent-2");
      client.connect();

      const result = await client.callTool("send_message", {
        toAgent: "nonexistent-agent",
        content: "Test message",
      });

      expect(result.success).toBe(true);
      const message = result.result as { delivered: boolean; error?: string; availableAgents?: string[] };
      expect(message.delivered).toBe(false);
      expect(message.error).toContain("not found");
      expect(message.availableAgents).toBeDefined();
    });
  });

  describe("Singleton", () => {
    it("should return same instance", () => {
      const server1 = getMCPServer();
      const server2 = getMCPServer();

      expect(server1).toBe(server2);
    });

    it("should create client with singleton server", () => {
      const client = createMCPClient("singleton-test");
      client.connect();

      expect(client.isConnected()).toBe(true);
      expect(client.getAvailableTools().length).toBeGreaterThan(0);
    });
  });
});
