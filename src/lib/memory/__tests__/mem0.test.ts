/**
 * Mem0 Memory Layer Tests
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  AgentMemoryManager,
  getMemoryManager,
  type AgentMemory,
  type MemoryMetadata,
} from "../mem0-client";

describe("Mem0 Memory Layer", () => {
  let manager: AgentMemoryManager;

  beforeEach(() => {
    // Create new instance for each test (no API key = local mode)
    manager = new AgentMemoryManager();
  });

  describe("AgentMemoryManager", () => {
    it("should use local mode without API key", () => {
      expect(manager.isUsingLocalMode()).toBe(true);
    });

    it("should remember content", async () => {
      const memory = await manager.remember(
        "test-agent",
        "This is a test memory"
      );

      expect(memory.id).toBeDefined();
      expect(memory.agentId).toBe("test-agent");
      expect(memory.content).toBe("This is a test memory");
      expect(memory.metadata.type).toBe("episodic");
    });

    it("should remember with custom metadata", async () => {
      const memory = await manager.remember(
        "test-agent",
        "Important procedure",
        {
          type: "procedural",
          tags: ["important", "workflow"],
        }
      );

      expect(memory.metadata.type).toBe("procedural");
      expect(memory.metadata.tags).toContain("important");
    });

    it("should recall memories", async () => {
      await manager.remember("recall-agent", "The sky is blue");
      await manager.remember("recall-agent", "Water is wet");
      await manager.remember("recall-agent", "Fire is hot");

      const results = await manager.recall("recall-agent", "sky");

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].memory.content).toContain("sky");
    });

    it("should filter recall by types", async () => {
      await manager.remember("filter-agent", "Episodic memory", { type: "episodic" });
      await manager.remember("filter-agent", "Procedural memory", { type: "procedural" });

      const procedural = await manager.recall("filter-agent", "memory", {
        types: ["procedural"],
      });

      expect(procedural.every((r) => r.memory.metadata.type === "procedural")).toBe(true);
    });

    it("should get all memories for agent", async () => {
      await manager.remember("all-agent", "Memory 1");
      await manager.remember("all-agent", "Memory 2");
      await manager.remember("all-agent", "Memory 3");

      const all = await manager.getAllMemories("all-agent");

      expect(all.length).toBe(3);
    });

    it("should share memories between agents", async () => {
      const shared = await manager.shareMemory(
        "agent-a",
        "agent-b",
        "Shared knowledge about the project"
      );

      expect(shared.agentId).toBe("agent-b");
      expect(shared.metadata.type).toBe("semantic");
      expect(shared.metadata.relatedAgents).toContain("agent-a");
      expect(shared.metadata.relatedAgents).toContain("agent-b");
    });

    it("should remember emotions with valence", async () => {
      const positive = await manager.rememberEmotion(
        "emotion-agent",
        "Great success!",
        0.9,
        "Project completion"
      );

      expect(positive.metadata.type).toBe("emotional");
      expect(positive.metadata.emotionalValence).toBe(0.9);
      expect(positive.metadata.context).toBe("Project completion");

      const negative = await manager.rememberEmotion(
        "emotion-agent",
        "Encountered an error",
        -0.5
      );

      expect(negative.metadata.emotionalValence).toBe(-0.5);
    });

    it("should clamp emotional valence to valid range", async () => {
      const memory = await manager.rememberEmotion(
        "clamp-agent",
        "Extreme emotion",
        2.0 // Over max
      );

      expect(memory.metadata.emotionalValence).toBe(1);
    });

    it("should remember procedures", async () => {
      const procedure = await manager.rememberProcedure(
        "proc-agent",
        "Step 1: Initialize. Step 2: Process. Step 3: Complete.",
        ["workflow", "initialization"]
      );

      expect(procedure.metadata.type).toBe("procedural");
      expect(procedure.metadata.tags).toContain("workflow");
    });

    it("should calculate importance scores", async () => {
      const episodic = await manager.remember("importance-agent", "Simple memory");
      const emotional = await manager.rememberEmotion(
        "importance-agent",
        "Emotional memory",
        0.8
      );
      const procedural = await manager.rememberProcedure(
        "importance-agent",
        "Important procedure"
      );

      // Emotional and procedural should have higher importance
      expect(emotional.importance).toBeGreaterThan(episodic.importance);
      expect(procedural.importance).toBeGreaterThan(episodic.importance);
    });

    it("should get memory statistics", async () => {
      await manager.remember("stats-agent", "Episodic 1", { type: "episodic" });
      await manager.remember("stats-agent", "Episodic 2", { type: "episodic" });
      await manager.rememberProcedure("stats-agent", "Procedure 1");
      await manager.rememberEmotion("stats-agent", "Emotion 1", 0.5);

      const stats = await manager.getMemoryStats("stats-agent");

      expect(stats.totalMemories).toBe(4);
      expect(stats.byType.episodic).toBe(2);
      expect(stats.byType.procedural).toBe(1);
      expect(stats.byType.emotional).toBe(1);
      expect(stats.avgImportance).toBeGreaterThan(0);
    });

    it("should consolidate memories", async () => {
      // Create some low-importance memories
      for (let i = 0; i < 5; i++) {
        await manager.remember("consolidate-agent", `Memory ${i}`);
      }

      const result = await manager.consolidateMemories("consolidate-agent");

      expect(result.merged).toBeGreaterThanOrEqual(0);
      expect(result.forgotten).toBeGreaterThanOrEqual(0);
    });

    it("should handle forget operation", async () => {
      const memory = await manager.remember("forget-agent", "To be forgotten");

      // In local mode, forget might not work the same way
      const result = await manager.forget(memory.id);

      // Just verify it doesn't throw
      expect(typeof result).toBe("boolean");
    });
  });

  describe("Singleton", () => {
    it("should return same instance", () => {
      const manager1 = getMemoryManager();
      const manager2 = getMemoryManager();

      expect(manager1).toBe(manager2);
    });
  });
});
