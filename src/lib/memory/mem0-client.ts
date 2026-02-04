/**
 * Mem0 Memory Client - Universal Memory Layer for MOOSTIK Agents
 *
 * Provides persistent, semantic memory for all AI agents with:
 * - Long-term memory storage
 * - Semantic search across memories
 * - Agent-specific and shared memories
 * - Memory consolidation and forgetting
 *
 * @see https://mem0.ai/
 */

import { MemoryClient, type Memory, type Message } from "mem0ai";

// Types for our memory system
export interface AgentMemory {
  id: string;
  agentId: string;
  content: string;
  metadata: MemoryMetadata;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  importance: number; // 0-1 score
}

export interface MemoryMetadata {
  type: "episodic" | "semantic" | "procedural" | "emotional";
  context?: string;
  relatedAgents?: string[];
  relatedEpisodes?: string[];
  relatedCharacters?: string[];
  emotionalValence?: number; // -1 to 1
  tags?: string[];
}

export interface MemorySearchResult {
  memory: AgentMemory;
  relevance: number;
}

export interface MemoryConfig {
  apiKey?: string;
  enableConsolidation?: boolean;
  maxMemoriesPerAgent?: number;
  forgettingThreshold?: number;
}

// Extended Memory type with additional fields we use
interface ExtendedMemory extends Memory {
  score?: number;
  metadata?: Record<string, unknown>;
}

// Local memory store for development without API key
interface LocalMemoryEntry {
  id: string;
  memory: string;
  metadata: MemoryMetadata;
  user_id: string;
  score?: number;
}

/**
 * Local Memory Store - Fallback when no API key is provided
 */
class LocalMemoryStore {
  private store: Map<string, LocalMemoryEntry[]> = new Map();

  async add(
    messages: Message[],
    options?: { user_id?: string; metadata?: Record<string, unknown> }
  ): Promise<Memory[]> {
    const userId = options?.user_id || "default";
    const existing = this.store.get(userId) || [];

    const content = messages
      .map((m) => (typeof m.content === "string" ? m.content : ""))
      .join(" ");

    const entry: LocalMemoryEntry = {
      id: crypto.randomUUID(),
      memory: content,
      metadata: (options?.metadata as unknown as MemoryMetadata) || { type: "episodic" },
      user_id: userId,
    };

    existing.push(entry);
    this.store.set(userId, existing);

    return [entry as unknown as Memory];
  }

  async search(
    query: string,
    options?: { user_id?: string; limit?: number }
  ): Promise<Memory[]> {
    const userId = options?.user_id || "default";
    const memories = this.store.get(userId) || [];
    const queryLower = query.toLowerCase();

    const results = memories
      .map((m) => ({
        ...m,
        score: m.memory.toLowerCase().includes(queryLower) ? 0.8 : 0.3,
      }))
      .filter((m) => m.score > 0.5)
      .slice(0, options?.limit || 10);

    return results as unknown as Memory[];
  }

  async getAll(options?: { user_id?: string }): Promise<Memory[]> {
    const userId = options?.user_id || "default";
    return (this.store.get(userId) || []) as unknown as Memory[];
  }

  async delete(id: string): Promise<{ message: string }> {
    for (const [userId, memories] of this.store.entries()) {
      const index = memories.findIndex((m) => m.id === id);
      if (index !== -1) {
        memories.splice(index, 1);
        this.store.set(userId, memories);
        break;
      }
    }
    return { message: "Memory deleted" };
  }
}

// Memory client interface that both MemoryClient and LocalMemoryStore implement
interface IMemoryClient {
  add(
    messages: Message[],
    options?: { user_id?: string; metadata?: Record<string, unknown> }
  ): Promise<Memory[]>;
  search(
    query: string,
    options?: { user_id?: string; limit?: number }
  ): Promise<Memory[]>;
  getAll(options?: { user_id?: string }): Promise<Memory[]>;
  delete(id: string): Promise<{ message: string }>;
}

// Singleton instances
let mem0Client: MemoryClient | null = null;
let localStore: LocalMemoryStore | null = null;

/**
 * Initialize or get the Mem0 client
 */
export function getMem0Client(config?: MemoryConfig): IMemoryClient {
  const apiKey = config?.apiKey || process.env.MEM0_API_KEY;

  if (!apiKey) {
    console.warn("[Mem0] No API key provided, using local fallback memory");
    if (!localStore) {
      localStore = new LocalMemoryStore();
    }
    return localStore;
  }

  if (!mem0Client) {
    mem0Client = new MemoryClient({ apiKey });
  }

  return mem0Client as unknown as IMemoryClient;
}

/**
 * MOOSTIK Agent Memory Manager
 * High-level interface for agent memory operations
 */
export class AgentMemoryManager {
  private client: IMemoryClient;
  private localCache: Map<string, AgentMemory[]> = new Map();
  private config: MemoryConfig;
  private isLocalMode: boolean;

  constructor(config?: MemoryConfig) {
    this.config = {
      enableConsolidation: true,
      maxMemoriesPerAgent: 1000,
      forgettingThreshold: 0.1,
      ...config,
    };

    const apiKey = config?.apiKey || process.env.MEM0_API_KEY;
    this.isLocalMode = !apiKey;
    this.client = getMem0Client(config);
  }

  /**
   * Store a new memory for an agent
   */
  async remember(
    agentId: string,
    content: string,
    metadata?: Partial<MemoryMetadata>
  ): Promise<AgentMemory> {
    const fullMetadata: MemoryMetadata = {
      type: "episodic",
      ...metadata,
    };

    try {
      // Create message format for Mem0
      const messages: Message[] = [{ role: "user", content }];

      // Add to Mem0
      const result = await this.client.add(messages, {
        user_id: agentId,
        metadata: fullMetadata as unknown as Record<string, unknown>,
      });

      const firstResult = result[0] as ExtendedMemory | undefined;

      const memory: AgentMemory = {
        id: firstResult?.id || crypto.randomUUID(),
        agentId,
        content,
        metadata: fullMetadata,
        createdAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 0,
        importance: this.calculateImportance(content, fullMetadata),
      };

      // Update local cache
      this.addToCache(agentId, memory);

      console.log(
        `[Mem0] Agent ${agentId} remembered: "${content.slice(0, 50)}..."`
      );

      return memory;
    } catch (error) {
      console.error("[Mem0] Failed to store memory:", error);
      // Fallback to local storage
      return this.rememberLocally(agentId, content, fullMetadata);
    }
  }

  /**
   * Search for relevant memories
   */
  async recall(
    agentId: string,
    query: string,
    options?: {
      limit?: number;
      types?: MemoryMetadata["type"][];
      minRelevance?: number;
    }
  ): Promise<MemorySearchResult[]> {
    const { limit = 10, types, minRelevance = 0.5 } = options || {};

    try {
      const results = await this.client.search(query, {
        user_id: agentId,
        limit,
      });

      const memories: MemorySearchResult[] = (results || [])
        .map((r: Memory) => {
          const extended = r as ExtendedMemory;
          const mem = extended as unknown as {
            id?: string;
            memory?: string;
            score?: number;
            metadata?: MemoryMetadata;
          };
          return {
            memory: {
              id: mem.id || extended.id || "",
              agentId,
              content: mem.memory || "",
              metadata: (mem.metadata as MemoryMetadata) || { type: "episodic" },
              createdAt: new Date(),
              lastAccessed: new Date(),
              accessCount: 1,
              importance: mem.score || 0.5,
            },
            relevance: mem.score || 0.5,
          };
        })
        .filter((m) => m.relevance >= minRelevance)
        .filter((m) => {
          if (!types) return true;
          return types.includes(m.memory.metadata.type);
        });

      console.log(
        `[Mem0] Agent ${agentId} recalled ${memories.length} memories for: "${query.slice(0, 30)}..."`
      );

      return memories;
    } catch (error) {
      console.error("[Mem0] Failed to search memories:", error);
      return this.recallLocally(agentId, query, limit);
    }
  }

  /**
   * Get all memories for an agent
   */
  async getAllMemories(agentId: string): Promise<AgentMemory[]> {
    try {
      const results = await this.client.getAll({
        user_id: agentId,
      });

      return (results || []).map((r: Memory) => {
        const extended = r as ExtendedMemory;
        const mem = extended as unknown as {
          id?: string;
          memory?: string;
          metadata?: MemoryMetadata;
        };
        return {
          id: mem.id || extended.id || "",
          agentId,
          content: mem.memory || "",
          metadata: (mem.metadata as MemoryMetadata) || { type: "episodic" },
          createdAt: new Date(),
          lastAccessed: new Date(),
          accessCount: 1,
          importance: 0.5,
        };
      });
    } catch (error) {
      console.error("[Mem0] Failed to get all memories:", error);
      return this.localCache.get(agentId) || [];
    }
  }

  /**
   * Delete a specific memory
   */
  async forget(memoryId: string): Promise<boolean> {
    try {
      await this.client.delete(memoryId);
      console.log(`[Mem0] Forgot memory: ${memoryId}`);
      return true;
    } catch (error) {
      console.error("[Mem0] Failed to delete memory:", error);
      return false;
    }
  }

  /**
   * Share a memory between agents (cross-agent memory)
   */
  async shareMemory(
    fromAgentId: string,
    toAgentId: string,
    content: string,
    metadata?: Partial<MemoryMetadata>
  ): Promise<AgentMemory> {
    const sharedMetadata: MemoryMetadata = {
      type: "semantic",
      relatedAgents: [fromAgentId, toAgentId],
      ...metadata,
    };

    return this.remember(toAgentId, content, sharedMetadata);
  }

  /**
   * Store emotional memory with valence
   */
  async rememberEmotion(
    agentId: string,
    content: string,
    valence: number, // -1 (negative) to 1 (positive)
    context?: string
  ): Promise<AgentMemory> {
    return this.remember(agentId, content, {
      type: "emotional",
      emotionalValence: Math.max(-1, Math.min(1, valence)),
      context,
    });
  }

  /**
   * Store procedural knowledge (how to do things)
   */
  async rememberProcedure(
    agentId: string,
    procedure: string,
    tags?: string[]
  ): Promise<AgentMemory> {
    return this.remember(agentId, procedure, {
      type: "procedural",
      tags,
    });
  }

  /**
   * Consolidate memories (merge similar, forget unimportant)
   */
  async consolidateMemories(agentId: string): Promise<{
    merged: number;
    forgotten: number;
  }> {
    if (!this.config.enableConsolidation) {
      return { merged: 0, forgotten: 0 };
    }

    const memories = await this.getAllMemories(agentId);
    let merged = 0;
    let forgotten = 0;

    // Forget low-importance, old memories
    for (const memory of memories) {
      if (memory.importance < (this.config.forgettingThreshold || 0.1)) {
        await this.forget(memory.id);
        forgotten++;
      }
    }

    console.log(
      `[Mem0] Consolidated memories for ${agentId}: ${merged} merged, ${forgotten} forgotten`
    );

    return { merged, forgotten };
  }

  /**
   * Get memory statistics for an agent
   */
  async getMemoryStats(agentId: string): Promise<{
    totalMemories: number;
    byType: Record<MemoryMetadata["type"], number>;
    avgImportance: number;
    oldestMemory: Date | null;
    newestMemory: Date | null;
  }> {
    const memories = await this.getAllMemories(agentId);

    const byType: Record<MemoryMetadata["type"], number> = {
      episodic: 0,
      semantic: 0,
      procedural: 0,
      emotional: 0,
    };

    let totalImportance = 0;
    let oldest: Date | null = null;
    let newest: Date | null = null;

    for (const memory of memories) {
      byType[memory.metadata.type]++;
      totalImportance += memory.importance;

      if (!oldest || memory.createdAt < oldest) oldest = memory.createdAt;
      if (!newest || memory.createdAt > newest) newest = memory.createdAt;
    }

    return {
      totalMemories: memories.length,
      byType,
      avgImportance: memories.length > 0 ? totalImportance / memories.length : 0,
      oldestMemory: oldest,
      newestMemory: newest,
    };
  }

  /**
   * Check if using local mode (no API key)
   */
  isUsingLocalMode(): boolean {
    return this.isLocalMode;
  }

  // Private helpers

  private calculateImportance(
    content: string,
    metadata: MemoryMetadata
  ): number {
    let importance = 0.5;

    // Emotional memories are more important
    if (metadata.type === "emotional") {
      importance += 0.2;
      if (metadata.emotionalValence) {
        importance += Math.abs(metadata.emotionalValence) * 0.1;
      }
    }

    // Procedural knowledge is important
    if (metadata.type === "procedural") {
      importance += 0.15;
    }

    // Longer content might be more detailed/important
    if (content.length > 200) {
      importance += 0.1;
    }

    // Memories with relations are more important
    if (metadata.relatedAgents?.length) {
      importance += 0.05 * Math.min(metadata.relatedAgents.length, 3);
    }

    return Math.min(1, importance);
  }

  private addToCache(agentId: string, memory: AgentMemory): void {
    const existing = this.localCache.get(agentId) || [];
    existing.push(memory);

    // Limit cache size
    if (existing.length > (this.config.maxMemoriesPerAgent || 1000)) {
      existing.shift();
    }

    this.localCache.set(agentId, existing);
  }

  private rememberLocally(
    agentId: string,
    content: string,
    metadata: MemoryMetadata
  ): AgentMemory {
    const memory: AgentMemory = {
      id: crypto.randomUUID(),
      agentId,
      content,
      metadata,
      createdAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 0,
      importance: this.calculateImportance(content, metadata),
    };

    this.addToCache(agentId, memory);
    return memory;
  }

  private recallLocally(
    agentId: string,
    query: string,
    limit: number
  ): MemorySearchResult[] {
    const memories = this.localCache.get(agentId) || [];
    const queryLower = query.toLowerCase();

    // Simple keyword matching for local fallback
    return memories
      .map((memory) => ({
        memory,
        relevance: this.calculateLocalRelevance(memory.content, queryLower),
      }))
      .filter((r) => r.relevance > 0.3)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  private calculateLocalRelevance(content: string, query: string): number {
    const contentLower = content.toLowerCase();
    const words = query.split(/\s+/);
    let matches = 0;

    for (const word of words) {
      if (contentLower.includes(word)) {
        matches++;
      }
    }

    return words.length > 0 ? matches / words.length : 0;
  }
}

// Singleton memory manager
let memoryManager: AgentMemoryManager | null = null;

export function getMemoryManager(config?: MemoryConfig): AgentMemoryManager {
  if (!memoryManager) {
    memoryManager = new AgentMemoryManager(config);
  }
  return memoryManager;
}

// Export default instance
export default getMemoryManager;
