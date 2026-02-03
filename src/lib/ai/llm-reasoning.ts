/**
 * LLM Reasoning Engine - Claude Integration for MOOSTIK Agents
 *
 * Provides intelligent reasoning capabilities for agents using Claude API.
 * Supports:
 * - Narrative generation
 * - Pattern analysis
 * - Decision making
 * - Memory-augmented reasoning
 *
 * @see https://docs.anthropic.com/
 */

import Anthropic from "@anthropic-ai/sdk";
import { getMemoryManager, type MemorySearchResult } from "../memory/mem0-client";

// Types
export interface ReasoningContext {
  agentId: string;
  task: string;
  memories?: MemorySearchResult[];
  additionalContext?: Record<string, unknown>;
}

export interface ReasoningResult {
  response: string;
  confidence: number;
  reasoning: string[];
  suggestions?: string[];
  tokensUsed: number;
}

export interface NarrativeRequest {
  signals: Array<{
    content: string;
    source: string;
    timestamp: Date;
  }>;
  characters: string[];
  currentMood: string;
  targetLength?: "short" | "medium" | "long";
}

export interface NarrativeResult {
  narrative: string;
  title: string;
  themes: string[];
  emotionalArc: string;
  suggestedVisuals: string[];
}

export interface DecisionRequest {
  situation: string;
  options: string[];
  criteria: string[];
  constraints?: string[];
}

export interface DecisionResult {
  selectedOption: string;
  reasoning: string;
  confidence: number;
  risks: string[];
  alternatives?: string[];
}

// Configuration
export interface LLMConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  enableMemoryAugmentation?: boolean;
}

const DEFAULT_CONFIG: Required<LLMConfig> = {
  apiKey: "",
  model: "claude-sonnet-4-20250514",
  maxTokens: 4096,
  temperature: 0.7,
  enableMemoryAugmentation: true,
};

/**
 * LLM Reasoning Engine
 */
export class LLMReasoningEngine {
  private client: Anthropic | null = null;
  private config: Required<LLMConfig>;
  private memoryManager = getMemoryManager();

  constructor(config?: LLMConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    const apiKey = this.config.apiKey || process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    } else {
      console.warn("[LLM] No ANTHROPIC_API_KEY provided. LLM reasoning features unavailable.");
    }
  }

  /**
   * Check if LLM reasoning is available
   */
  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * General reasoning with memory augmentation
   */
  async reason(context: ReasoningContext): Promise<ReasoningResult> {
    const startTime = Date.now();

    // Augment with memories if enabled
    let memoryContext = "";
    if (this.config.enableMemoryAugmentation && !context.memories) {
      const memories = await this.memoryManager.recall(context.agentId, context.task, {
        limit: 5,
        minRelevance: 0.6,
      });
      if (memories.length > 0) {
        memoryContext = `\n\nRelevant memories:\n${memories
          .map((m) => `- ${m.memory.content}`)
          .join("\n")}`;
      }
    } else if (context.memories) {
      memoryContext = `\n\nRelevant memories:\n${context.memories
        .map((m) => `- ${m.memory.content}`)
        .join("\n")}`;
    }

    const systemPrompt = `You are an AI reasoning engine for MOOSTIK, an animated series generator.
Your role is to help agents make intelligent decisions and generate creative content.
Be concise, creative, and follow the narrative style of the BLOODWINGS universe.
Always provide your reasoning process.`;

    const userPrompt = `Agent: ${context.agentId}
Task: ${context.task}
${memoryContext}
${context.additionalContext ? `\nAdditional context: ${JSON.stringify(context.additionalContext, null, 2)}` : ""}

Please reason through this task and provide:
1. Your response
2. Your confidence level (0-1)
3. Your reasoning steps
4. Any suggestions for improvement`;

    if (!this.client) {
      throw new Error(
        "ANTHROPIC_API_KEY not configured. LLM reasoning requires a valid API key. " +
        "Set the ANTHROPIC_API_KEY environment variable to enable reasoning features."
      );
    }

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const content = response.content[0];
      const text = content.type === "text" ? content.text : "";

      // Parse the response
      const result = this.parseReasoningResponse(text);
      result.tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

      // Store the reasoning as a memory
      await this.memoryManager.remember(
        context.agentId,
        `Reasoned about: ${context.task.slice(0, 100)}... Result: ${result.response.slice(0, 100)}...`,
        { type: "procedural", tags: ["reasoning"] }
      );

      console.log(
        `[LLM] Reasoning completed in ${Date.now() - startTime}ms, ${result.tokensUsed} tokens`
      );

      return result;
    } catch (error) {
      console.error("[LLM] Reasoning failed:", error);
      throw error;
    }
  }

  /**
   * Generate narrative from signals
   */
  async generateNarrative(request: NarrativeRequest): Promise<NarrativeResult> {
    const systemPrompt = `You are a narrative generator for MOOSTIK/BLOODWINGS animated series.
Create compelling, dark, and atmospheric narratives based on collective signals.
The style should be mysterious, slightly unsettling, but captivating.
Characters include Koko (corrupted AI guide), Papy Tik (nostalgic elder), and various molties.`;

    const lengthGuide = {
      short: "2-3 paragraphs",
      medium: "4-6 paragraphs",
      long: "8-10 paragraphs",
    };

    const userPrompt = `Generate a narrative based on these collective signals:

Signals:
${request.signals.map((s) => `- [${s.source}]: "${s.content}"`).join("\n")}

Characters involved: ${request.characters.join(", ")}
Current mood: ${request.currentMood}
Target length: ${lengthGuide[request.targetLength || "medium"]}

Provide:
1. A compelling title
2. The narrative text
3. Main themes (3-5)
4. Emotional arc description
5. Suggested visuals for key scenes (3-5)

Format as JSON.`;

    if (!this.client) {
      throw new Error(
        "ANTHROPIC_API_KEY not configured. Narrative generation requires a valid API key. " +
        "Set the ANTHROPIC_API_KEY environment variable to enable this feature."
      );
    }

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: 0.8, // Higher for creativity
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const content = response.content[0];
      const text = content.type === "text" ? content.text : "";

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          narrative: parsed.narrative || parsed.text || text,
          title: parsed.title || "Untitled Episode",
          themes: parsed.themes || [],
          emotionalArc: parsed.emotionalArc || parsed.emotional_arc || "",
          suggestedVisuals: parsed.suggestedVisuals || parsed.suggested_visuals || [],
        };
      }

      return {
        narrative: text,
        title: "Emergent Narrative",
        themes: ["emergence", "collective"],
        emotionalArc: "building tension",
        suggestedVisuals: [],
      };
    } catch (error) {
      console.error("[LLM] Narrative generation failed:", error);
      throw error;
    }
  }

  /**
   * Make a decision between options
   */
  async decide(request: DecisionRequest): Promise<DecisionResult> {
    const systemPrompt = `You are a decision-making AI for MOOSTIK.
Analyze situations carefully, weigh options against criteria, and make informed decisions.
Always explain your reasoning and identify potential risks.`;

    const userPrompt = `Make a decision for this situation:

Situation: ${request.situation}

Options:
${request.options.map((o, i) => `${i + 1}. ${o}`).join("\n")}

Criteria to consider:
${request.criteria.map((c) => `- ${c}`).join("\n")}

${request.constraints ? `Constraints:\n${request.constraints.map((c) => `- ${c}`).join("\n")}` : ""}

Provide:
1. Selected option (exact text)
2. Reasoning explanation
3. Confidence level (0-1)
4. Potential risks
5. Alternative approaches if main option fails

Format as JSON.`;

    if (!this.client) {
      throw new Error(
        "ANTHROPIC_API_KEY not configured. Decision making requires a valid API key. " +
        "Set the ANTHROPIC_API_KEY environment variable to enable this feature."
      );
    }

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 2048,
        temperature: 0.3, // Lower for more deterministic decisions
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const content = response.content[0];
      const text = content.type === "text" ? content.text : "";

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          selectedOption: parsed.selectedOption || parsed.selected_option || request.options[0],
          reasoning: parsed.reasoning || "",
          confidence: parsed.confidence || 0.5,
          risks: parsed.risks || [],
          alternatives: parsed.alternatives || [],
        };
      }

      return {
        selectedOption: request.options[0],
        reasoning: text,
        confidence: 0.5,
        risks: ["Unable to fully parse response"],
      };
    } catch (error) {
      console.error("[LLM] Decision making failed:", error);
      throw error;
    }
  }

  /**
   * Analyze patterns in data
   */
  async analyzePatterns(
    data: Array<{ content: string; metadata?: Record<string, unknown> }>,
    question: string
  ): Promise<{
    patterns: string[];
    insights: string[];
    anomalies: string[];
    confidence: number;
  }> {
    const systemPrompt = `You are a pattern analysis AI for MOOSTIK.
Identify patterns, trends, anomalies, and insights in collective data.
Focus on narrative potential and emotional resonance.`;

    const userPrompt = `Analyze this data for patterns:

Data points (${data.length} items):
${data.slice(0, 20).map((d, i) => `${i + 1}. ${d.content}${d.metadata ? ` [${JSON.stringify(d.metadata)}]` : ""}`).join("\n")}
${data.length > 20 ? `... and ${data.length - 20} more items` : ""}

Question: ${question}

Identify:
1. Key patterns (3-5)
2. Insights (3-5)
3. Anomalies or outliers
4. Overall confidence in analysis

Format as JSON.`;

    if (!this.client) {
      throw new Error(
        "ANTHROPIC_API_KEY not configured. Pattern analysis requires a valid API key. " +
        "Set the ANTHROPIC_API_KEY environment variable to enable this feature."
      );
    }

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 2048,
        temperature: 0.5,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const content = response.content[0];
      const text = content.type === "text" ? content.text : "";

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          patterns: parsed.patterns || [],
          insights: parsed.insights || [],
          anomalies: parsed.anomalies || [],
          confidence: parsed.confidence || 0.5,
        };
      }

      return {
        patterns: [],
        insights: [text],
        anomalies: [],
        confidence: 0.5,
      };
    } catch (error) {
      console.error("[LLM] Pattern analysis failed:", error);
      throw error;
    }
  }

  // Private helpers

  private parseReasoningResponse(text: string): ReasoningResult {
    // Try to parse structured response
    const lines = text.split("\n");
    const reasoning: string[] = [];
    let response = text;
    let confidence = 0.7;
    const suggestions: string[] = [];

    for (const line of lines) {
      if (line.includes("Confidence:") || line.includes("confidence:")) {
        const match = line.match(/(\d+\.?\d*)/);
        if (match) {
          confidence = parseFloat(match[1]);
          if (confidence > 1) confidence /= 100;
        }
      }
      if (line.includes("Reasoning:") || line.match(/^\d+\./)) {
        reasoning.push(line.replace(/^[\d.]+\s*/, "").trim());
      }
      if (line.includes("Suggestion:") || line.includes("suggestion:")) {
        suggestions.push(line.replace(/Suggestion[s]?:/i, "").trim());
      }
    }

    return {
      response,
      confidence,
      reasoning: reasoning.length > 0 ? reasoning : [text],
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      tokensUsed: 0,
    };
  }

}

// Singleton instance
let reasoningEngine: LLMReasoningEngine | null = null;

export function getReasoningEngine(config?: LLMConfig): LLMReasoningEngine {
  if (!reasoningEngine) {
    reasoningEngine = new LLMReasoningEngine(config);
  }
  return reasoningEngine;
}

export default getReasoningEngine;
