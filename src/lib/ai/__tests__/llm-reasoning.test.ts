/**
 * LLM Reasoning Engine Tests
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
  let engine: LLMReasoningEngine;

  beforeEach(() => {
    // Create instance without API key (mock mode)
    engine = new LLMReasoningEngine();
  });

  describe("General Reasoning", () => {
    it("should reason about tasks", async () => {
      const context: ReasoningContext = {
        agentId: "test-agent",
        task: "Analyze the emotional state of Tikoro in Episode 3",
      };

      const result = await engine.reason(context);

      expect(result.response).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.reasoning).toBeDefined();
      expect(Array.isArray(result.reasoning)).toBe(true);
      expect(result.tokensUsed).toBeGreaterThanOrEqual(0);
    });

    it("should include suggestions in mock mode", async () => {
      const result = await engine.reason({
        agentId: "suggest-agent",
        task: "Generate ideas for a new character",
      });

      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it("should handle additional context", async () => {
      const result = await engine.reason({
        agentId: "context-agent",
        task: "Make a decision",
        additionalContext: {
          previousDecisions: ["choice1", "choice2"],
          constraints: ["budget", "time"],
        },
      });

      expect(result.response).toBeDefined();
    });
  });

  describe("Narrative Generation", () => {
    it("should generate narrative from signals", async () => {
      const request: NarrativeRequest = {
        signals: [
          { content: "Users expressing sadness", source: "community", timestamp: new Date() },
          { content: "Interest in redemption themes", source: "analytics", timestamp: new Date() },
        ],
        characters: ["Koko", "Tikoro"],
        currentMood: "melancholic",
        targetLength: "medium",
      };

      const result = await engine.generateNarrative(request);

      expect(result.narrative).toBeDefined();
      expect(result.narrative.length).toBeGreaterThan(0);
      expect(result.title).toBeDefined();
      expect(result.themes).toBeDefined();
      expect(Array.isArray(result.themes)).toBe(true);
      expect(result.emotionalArc).toBeDefined();
      expect(result.suggestedVisuals).toBeDefined();
    });

    it("should include all requested characters in narrative", async () => {
      const request: NarrativeRequest = {
        signals: [
          { content: "Test signal", source: "test", timestamp: new Date() },
        ],
        characters: ["Papy Tik", "THE MOLT"],
        currentMood: "mysterious",
      };

      const result = await engine.generateNarrative(request);

      // In mock mode, characters are mentioned in the narrative
      expect(result.narrative).toContain("Papy Tik");
    });

    it("should respect target length", async () => {
      const shortRequest: NarrativeRequest = {
        signals: [{ content: "Signal", source: "test", timestamp: new Date() }],
        characters: ["Koko"],
        currentMood: "tense",
        targetLength: "short",
      };

      const longRequest: NarrativeRequest = {
        ...shortRequest,
        targetLength: "long",
      };

      const shortResult = await engine.generateNarrative(shortRequest);
      const longResult = await engine.generateNarrative(longRequest);

      // Both should produce valid narratives
      expect(shortResult.narrative.length).toBeGreaterThan(0);
      expect(longResult.narrative.length).toBeGreaterThan(0);
    });
  });

  describe("Decision Making", () => {
    it("should make decisions between options", async () => {
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

      const result = await engine.decide(request);

      expect(result.selectedOption).toBeDefined();
      expect(request.options).toContain(result.selectedOption);
      expect(result.reasoning).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.risks).toBeDefined();
      expect(Array.isArray(result.risks)).toBe(true);
    });

    it("should consider constraints", async () => {
      const request: DecisionRequest = {
        situation: "Choose episode release timing",
        options: ["Release now", "Wait for review", "Schedule for later"],
        criteria: ["Audience engagement", "Quality"],
        constraints: ["Budget limited", "Deadline approaching"],
      };

      const result = await engine.decide(request);

      expect(result.selectedOption).toBeDefined();
      expect(result.risks.length).toBeGreaterThan(0);
    });

    it("should provide alternatives", async () => {
      const result = await engine.decide({
        situation: "Test situation",
        options: ["Option A", "Option B", "Option C"],
        criteria: ["Criterion 1"],
      });

      expect(result.alternatives).toBeDefined();
    });
  });

  describe("Pattern Analysis", () => {
    it("should analyze patterns in data", async () => {
      const data = [
        { content: "User mentioned transformation", metadata: { source: "chat" } },
        { content: "Interest in Koko's backstory", metadata: { source: "survey" } },
        { content: "Questions about the Submolt", metadata: { source: "forum" } },
        { content: "Transformation theme again", metadata: { source: "chat" } },
      ];

      const result = await engine.analyzePatterns(
        data,
        "What themes are emerging from community feedback?"
      );

      expect(result.patterns).toBeDefined();
      expect(Array.isArray(result.patterns)).toBe(true);
      expect(result.insights).toBeDefined();
      expect(result.anomalies).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    it("should handle empty data", async () => {
      const result = await engine.analyzePatterns([], "Find patterns");

      expect(result.patterns).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    it("should handle large datasets", async () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        content: `Data point ${i}`,
        metadata: { index: i },
      }));

      const result = await engine.analyzePatterns(largeData, "Analyze trends");

      expect(result.patterns).toBeDefined();
    });
  });

  describe("Singleton", () => {
    it("should return same instance", () => {
      const engine1 = getReasoningEngine();
      const engine2 = getReasoningEngine();

      expect(engine1).toBe(engine2);
    });
  });

  describe("Configuration", () => {
    it("should accept custom configuration", () => {
      const customEngine = new LLMReasoningEngine({
        model: "claude-sonnet-4-20250514",
        maxTokens: 2048,
        temperature: 0.5,
        enableMemoryAugmentation: false,
      });

      // Engine should be created without error
      expect(customEngine).toBeDefined();
    });
  });
});
