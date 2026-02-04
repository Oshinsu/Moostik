/**
 * LLM Reasoning Engine Tests
 * Tests the real LLM implementation - requires ANTHROPIC_API_KEY for full tests
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  LLMReasoningEngine,
  getReasoningEngine,
  type ReasoningContext,
  type NarrativeRequest,
  type DecisionRequest,
} from "../llm-reasoning";

describe("LLM Reasoning Engine", () => {
  describe("Initialization", () => {
    it("should initialize without API key", () => {
      const engine = new LLMReasoningEngine();
      expect(engine).toBeDefined();
    });

    it("should report unavailable without API key", () => {
      const engine = new LLMReasoningEngine();
      expect(engine.isAvailable()).toBe(false);
    });

    it("should accept custom configuration", () => {
      const customEngine = new LLMReasoningEngine({
        model: "claude-sonnet-4-20250514",
        maxTokens: 2048,
        temperature: 0.5,
        enableMemoryAugmentation: false,
      });

      expect(customEngine).toBeDefined();
    });
  });

  describe("Error Handling (No API Key)", () => {
    let engine: LLMReasoningEngine;

    beforeEach(() => {
      engine = new LLMReasoningEngine();
    });

    it("should throw error for reason without API key", async () => {
      const context: ReasoningContext = {
        agentId: "test-agent",
        task: "Analyze the emotional state of Tikoro in Episode 3",
      };

      await expect(engine.reason(context)).rejects.toThrow("ANTHROPIC_API_KEY not configured");
    });

    it("should throw error for generateNarrative without API key", async () => {
      const request: NarrativeRequest = {
        signals: [
          { content: "Users expressing sadness", source: "community", timestamp: new Date() },
        ],
        characters: ["Koko", "Tikoro"],
        currentMood: "melancholic",
      };

      await expect(engine.generateNarrative(request)).rejects.toThrow("ANTHROPIC_API_KEY not configured");
    });

    it("should throw error for decide without API key", async () => {
      const request: DecisionRequest = {
        situation: "Tikoro must choose a path in the Submolt",
        options: [
          "Follow the glowing data streams",
          "Enter the dark archive",
          "Wait for Koko's guidance",
        ],
        criteria: [
          "Safety first",
          "Character development",
          "Narrative tension",
        ],
      };

      await expect(engine.decide(request)).rejects.toThrow("ANTHROPIC_API_KEY not configured");
    });

    it("should throw error for analyzePatterns without API key", async () => {
      const data = [
        { content: "User mentioned transformation", metadata: { source: "chat" } },
        { content: "Interest in Koko's backstory", metadata: { source: "survey" } },
      ];

      await expect(
        engine.analyzePatterns(data, "What themes are emerging?")
      ).rejects.toThrow("ANTHROPIC_API_KEY not configured");
    });
  });

  describe("Singleton", () => {
    it("should return same instance", () => {
      const engine1 = getReasoningEngine();
      const engine2 = getReasoningEngine();

      expect(engine1).toBe(engine2);
    });
  });

  // Integration tests - only run if ANTHROPIC_API_KEY is set
  describe.skipIf(!process.env.ANTHROPIC_API_KEY)("Integration Tests (requires API key)", () => {
    let engine: LLMReasoningEngine;

    beforeEach(() => {
      engine = new LLMReasoningEngine({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    });

    it("should be available with API key", () => {
      expect(engine.isAvailable()).toBe(true);
    });

    it("should reason about tasks", async () => {
      const context: ReasoningContext = {
        agentId: "test-agent",
        task: "What is the capital of France?",
      };

      const result = await engine.reason(context);

      expect(result.response).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.reasoning).toBeDefined();
      expect(Array.isArray(result.reasoning)).toBe(true);
      expect(result.tokensUsed).toBeGreaterThan(0);
    });

    it("should generate narrative from signals", async () => {
      const request: NarrativeRequest = {
        signals: [
          { content: "A shadow moves in the darkness", source: "observer", timestamp: new Date() },
        ],
        characters: ["Koko"],
        currentMood: "mysterious",
        targetLength: "short",
      };

      const result = await engine.generateNarrative(request);

      expect(result.narrative).toBeDefined();
      expect(result.narrative.length).toBeGreaterThan(0);
      expect(result.title).toBeDefined();
      expect(result.themes).toBeDefined();
      expect(Array.isArray(result.themes)).toBe(true);
    });

    it("should make decisions between options", async () => {
      const request: DecisionRequest = {
        situation: "Choose a path",
        options: ["Path A", "Path B"],
        criteria: ["Safety", "Speed"],
      };

      const result = await engine.decide(request);

      expect(result.selectedOption).toBeDefined();
      expect(request.options).toContain(result.selectedOption);
      expect(result.reasoning).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.risks).toBeDefined();
    });

    it("should analyze patterns in data", async () => {
      const data = [
        { content: "User mentioned transformation" },
        { content: "User mentioned change" },
        { content: "User mentioned evolution" },
      ];

      const result = await engine.analyzePatterns(data, "What themes emerge?");

      expect(result.patterns).toBeDefined();
      expect(Array.isArray(result.patterns)).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });
  });
});
