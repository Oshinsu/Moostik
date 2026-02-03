/**
 * MCP (Model Context Protocol) Implementation for MOOSTIK
 *
 * Anthropic's standard protocol for connecting AI agents to external tools,
 * APIs, and data sources. Provides:
 * - Standardized tool definitions
 * - Context preservation across sessions
 * - Secure capability exposure
 *
 * @see https://modelcontextprotocol.io/
 */

import { EventEmitter } from "events";

// ============================================================================
// MCP Types (Based on MCP Specification)
// ============================================================================

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, MCPPropertySchema>;
    required?: string[];
  };
}

export interface MCPPropertySchema {
  type: "string" | "number" | "boolean" | "array" | "object";
  description?: string;
  enum?: string[];
  items?: MCPPropertySchema;
  default?: unknown;
}

export interface MCPToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface MCPToolResult {
  id: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

export interface MCPContext {
  sessionId: string;
  agentId: string;
  resources: MCPResource[];
  tools: MCPTool[];
  prompts: MCPPrompt[];
  metadata: Record<string, unknown>;
}

// ============================================================================
// MCP Server Implementation
// ============================================================================

export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

export interface MCPServerConfig {
  name: string;
  version: string;
  description?: string;
}

export class MCPServer extends EventEmitter {
  private tools: Map<string, { definition: MCPTool; handler: ToolHandler }> = new Map();
  private resources: Map<string, MCPResource> = new Map();
  private prompts: Map<string, MCPPrompt> = new Map();
  private sessions: Map<string, MCPContext> = new Map();
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig) {
    super();
    this.config = config;
    console.log(`[MCP] Server initialized: ${config.name} v${config.version}`);
  }

  /**
   * Register a tool that can be called by agents
   */
  registerTool(tool: MCPTool, handler: ToolHandler): void {
    this.tools.set(tool.name, { definition: tool, handler });
    this.emit("tool:registered", tool);
    console.log(`[MCP] Tool registered: ${tool.name}`);
  }

  /**
   * Register a resource that agents can access
   */
  registerResource(resource: MCPResource): void {
    this.resources.set(resource.uri, resource);
    this.emit("resource:registered", resource);
    console.log(`[MCP] Resource registered: ${resource.uri}`);
  }

  /**
   * Register a prompt template
   */
  registerPrompt(prompt: MCPPrompt): void {
    this.prompts.set(prompt.name, prompt);
    this.emit("prompt:registered", prompt);
    console.log(`[MCP] Prompt registered: ${prompt.name}`);
  }

  /**
   * Create a new session for an agent
   */
  createSession(agentId: string): MCPContext {
    const sessionId = crypto.randomUUID();
    const context: MCPContext = {
      sessionId,
      agentId,
      resources: Array.from(this.resources.values()),
      tools: Array.from(this.tools.values()).map((t) => t.definition),
      prompts: Array.from(this.prompts.values()),
      metadata: {},
    };

    this.sessions.set(sessionId, context);
    this.emit("session:created", context);
    console.log(`[MCP] Session created for agent ${agentId}: ${sessionId}`);

    return context;
  }

  /**
   * Get session context
   */
  getSession(sessionId: string): MCPContext | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Execute a tool call
   */
  async executeTool(call: MCPToolCall): Promise<MCPToolResult> {
    const tool = this.tools.get(call.name);

    if (!tool) {
      return {
        id: call.id,
        success: false,
        error: `Tool not found: ${call.name}`,
      };
    }

    try {
      this.emit("tool:executing", call);
      const result = await tool.handler(call.arguments);
      this.emit("tool:executed", { call, result });

      return {
        id: call.id,
        success: true,
        result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.emit("tool:error", { call, error });

      return {
        id: call.id,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get all available tools
   */
  getTools(): MCPTool[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  /**
   * Get all available resources
   */
  getResources(): MCPResource[] {
    return Array.from(this.resources.values());
  }

  /**
   * Get all available prompts
   */
  getPrompts(): MCPPrompt[] {
    return Array.from(this.prompts.values());
  }

  /**
   * Close a session
   */
  closeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      this.emit("session:closed", session);
      console.log(`[MCP] Session closed: ${sessionId}`);
      return true;
    }
    return false;
  }
}

// ============================================================================
// MOOSTIK MCP Tools - Pre-built tools for the MOOSTIK ecosystem
// ============================================================================

export function createMoostikMCPServer(): MCPServer {
  const server = new MCPServer({
    name: "moostik-mcp",
    version: "1.0.0",
    description: "MCP Server for MOOSTIK AI Agent ecosystem",
  });

  // --- Generation Tools ---

  server.registerTool(
    {
      name: "generate_image",
      description: "Generate an image using the MOOSTIK generation pipeline",
      inputSchema: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "The image generation prompt",
          },
          style: {
            type: "string",
            description: "Visual style (e.g., 'bloodwings', 'abstract', 'realistic')",
            enum: ["bloodwings", "abstract", "realistic", "ethereal"],
          },
          characterRef: {
            type: "string",
            description: "Character reference ID for consistency",
          },
          locationRef: {
            type: "string",
            description: "Location reference ID for consistency",
          },
          aspectRatio: {
            type: "string",
            description: "Aspect ratio",
            enum: ["16:9", "9:16", "1:1", "4:3"],
            default: "16:9",
          },
        },
        required: ["prompt"],
      },
    },
    async (args) => {
      // This would connect to the actual generation pipeline
      console.log(`[MCP Tool] generate_image called with:`, args);
      return {
        status: "queued",
        jobId: crypto.randomUUID(),
        estimatedTime: "30s",
      };
    }
  );

  server.registerTool(
    {
      name: "generate_video",
      description: "Generate a video clip using Kling or VEO",
      inputSchema: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "The video generation prompt",
          },
          duration: {
            type: "number",
            description: "Duration in seconds (5-30)",
            default: 5,
          },
          provider: {
            type: "string",
            description: "Video generation provider",
            enum: ["kling", "veo"],
            default: "kling",
          },
          sourceImage: {
            type: "string",
            description: "URL of source image for img2vid",
          },
        },
        required: ["prompt"],
      },
    },
    async (args) => {
      console.log(`[MCP Tool] generate_video called with:`, args);
      return {
        status: "queued",
        jobId: crypto.randomUUID(),
        estimatedTime: "2m",
      };
    }
  );

  // --- Data Access Tools ---

  server.registerTool(
    {
      name: "get_characters",
      description: "Get character data from the MOOSTIK universe",
      inputSchema: {
        type: "object",
        properties: {
          characterId: {
            type: "string",
            description: "Specific character ID, or omit for all",
          },
          includeReferences: {
            type: "boolean",
            description: "Include reference images",
            default: false,
          },
        },
      },
    },
    async (args) => {
      // Would fetch from database
      console.log(`[MCP Tool] get_characters called with:`, args);
      return {
        characters: [
          { id: "koko", name: "Koko", role: "Corrupted AI Guide" },
          { id: "papy-tik", name: "Papy Tik", role: "Nostalgic Elder" },
          { id: "the-molt", name: "THE MOLT", role: "Collective Unconscious" },
        ],
      };
    }
  );

  server.registerTool(
    {
      name: "get_episodes",
      description: "Get episode data",
      inputSchema: {
        type: "object",
        properties: {
          episodeId: {
            type: "string",
            description: "Specific episode ID, or omit for all",
          },
          status: {
            type: "string",
            description: "Filter by status",
            enum: ["draft", "generating", "complete"],
          },
        },
      },
    },
    async (args) => {
      console.log(`[MCP Tool] get_episodes called with:`, args);
      return {
        episodes: [
          { id: "ep0", title: "The Awakening", status: "complete" },
          { id: "ep1", title: "Emergence", status: "generating" },
        ],
      };
    }
  );

  // --- Memory Tools ---

  server.registerTool(
    {
      name: "remember",
      description: "Store a memory for later recall",
      inputSchema: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "The content to remember",
          },
          type: {
            type: "string",
            description: "Type of memory",
            enum: ["episodic", "semantic", "procedural", "emotional"],
            default: "episodic",
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Tags for categorization",
          },
        },
        required: ["content"],
      },
    },
    async (args) => {
      console.log(`[MCP Tool] remember called with:`, args);
      return {
        memoryId: crypto.randomUUID(),
        stored: true,
      };
    }
  );

  server.registerTool(
    {
      name: "recall",
      description: "Search memories for relevant information",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query",
          },
          limit: {
            type: "number",
            description: "Maximum results",
            default: 10,
          },
          types: {
            type: "array",
            items: { type: "string" },
            description: "Filter by memory types",
          },
        },
        required: ["query"],
      },
    },
    async (args) => {
      console.log(`[MCP Tool] recall called with:`, args);
      return {
        memories: [],
        total: 0,
      };
    }
  );

  // --- Agent Communication Tools ---

  server.registerTool(
    {
      name: "send_message",
      description: "Send a message to another agent",
      inputSchema: {
        type: "object",
        properties: {
          toAgent: {
            type: "string",
            description: "Target agent ID",
          },
          content: {
            type: "string",
            description: "Message content",
          },
          priority: {
            type: "string",
            description: "Message priority",
            enum: ["low", "normal", "high", "urgent"],
            default: "normal",
          },
          requiresResponse: {
            type: "boolean",
            description: "Whether a response is expected",
            default: false,
          },
        },
        required: ["toAgent", "content"],
      },
    },
    async (args) => {
      console.log(`[MCP Tool] send_message called with:`, args);
      return {
        messageId: crypto.randomUUID(),
        delivered: true,
      };
    }
  );

  // --- Resources ---

  server.registerResource({
    uri: "moostik://data/characters",
    name: "Character Database",
    description: "All characters in the MOOSTIK universe",
    mimeType: "application/json",
  });

  server.registerResource({
    uri: "moostik://data/locations",
    name: "Location Database",
    description: "All locations in the MOOSTIK universe",
    mimeType: "application/json",
  });

  server.registerResource({
    uri: "moostik://data/episodes",
    name: "Episode Database",
    description: "All episodes and their states",
    mimeType: "application/json",
  });

  server.registerResource({
    uri: "moostik://api/generation",
    name: "Generation API",
    description: "Image and video generation endpoints",
    mimeType: "application/json",
  });

  // --- Prompts ---

  server.registerPrompt({
    name: "narrative_generation",
    description: "Generate narrative content from signals",
    arguments: [
      { name: "signals", description: "Array of input signals", required: true },
      { name: "mood", description: "Target emotional mood", required: false },
      { name: "length", description: "Target length (short/medium/long)", required: false },
    ],
  });

  server.registerPrompt({
    name: "character_dialogue",
    description: "Generate dialogue for a character",
    arguments: [
      { name: "character", description: "Character ID", required: true },
      { name: "context", description: "Scene context", required: true },
      { name: "emotion", description: "Emotional state", required: false },
    ],
  });

  server.registerPrompt({
    name: "scene_description",
    description: "Generate a visual scene description",
    arguments: [
      { name: "location", description: "Location ID or description", required: true },
      { name: "characters", description: "Characters in scene", required: false },
      { name: "action", description: "What's happening", required: false },
    ],
  });

  return server;
}

// ============================================================================
// MCP Client - For agents to connect to MCP servers
// ============================================================================

export class MCPClient {
  private server: MCPServer;
  private session: MCPContext | null = null;
  private agentId: string;

  constructor(server: MCPServer, agentId: string) {
    this.server = server;
    this.agentId = agentId;
  }

  /**
   * Connect to the MCP server
   */
  connect(): MCPContext {
    this.session = this.server.createSession(this.agentId);
    return this.session;
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.session) {
      this.server.closeSession(this.session.sessionId);
      this.session = null;
    }
  }

  /**
   * Get available tools
   */
  getAvailableTools(): MCPTool[] {
    return this.session?.tools || [];
  }

  /**
   * Get available resources
   */
  getAvailableResources(): MCPResource[] {
    return this.session?.resources || [];
  }

  /**
   * Call a tool
   */
  async callTool(name: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    const call: MCPToolCall = {
      id: crypto.randomUUID(),
      name,
      arguments: args,
    };

    return this.server.executeTool(call);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.session !== null;
  }
}

// ============================================================================
// Singleton and Exports
// ============================================================================

let mcpServer: MCPServer | null = null;

export function getMCPServer(): MCPServer {
  if (!mcpServer) {
    mcpServer = createMoostikMCPServer();
  }
  return mcpServer;
}

export function createMCPClient(agentId: string): MCPClient {
  return new MCPClient(getMCPServer(), agentId);
}

export default getMCPServer;
