/**
 * MCP Protocol Tests
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

    it("should execute tools correctly", async () => {
      const call: MCPToolCall = {
        id: "test-call-1",
        name: "get_characters",
        arguments: {},
      };

      const result = await server.executeTool(call);

      expect(result.id).toBe("test-call-1");
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
    });

    it("should return error for unknown tools", async () => {
      const call: MCPToolCall = {
        id: "test-call-2",
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

    it("should call tools through client", async () => {
      const client = new MCPClient(server, "client-agent");
      client.connect();

      const result = await client.callTool("get_characters", {});

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
    });

    it("should disconnect properly", () => {
      const client = new MCPClient(server, "client-agent");
      client.connect();
      expect(client.isConnected()).toBe(true);

      client.disconnect();
      expect(client.isConnected()).toBe(false);
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
