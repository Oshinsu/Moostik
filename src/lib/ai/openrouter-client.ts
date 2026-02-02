/**
 * OPENROUTER CLIENT
 * ===========================================================================
 * Client unifié pour accéder à 300+ modèles AI via OpenRouter
 * Supporte: Claude 4.5, GPT-5.2, Gemini 3, Kimi K2.5, DeepSeek, etc.
 * 
 * SOTA Février 2026
 * ===========================================================================
 */

// ============================================================================
// TYPES
// ============================================================================

export type ModelId = 
  // Premium
  | "anthropic/claude-4.5-opus"
  | "anthropic/claude-4-sonnet"
  | "openai/gpt-5.2"
  | "openai/gpt-5.2-mini"
  | "google/gemini-3-pro"
  // Best Value
  | "moonshotai/kimi-k2.5"
  | "deepseek/deepseek-v3.2"
  | "google/gemini-3-flash"
  // Free
  | "mistralai/devstral-2"
  // Fallback
  | string;

export interface ModelInfo {
  id: ModelId;
  name: string;
  provider: string;
  contextWindow: number;
  inputPrice: number;  // per 1M tokens
  outputPrice: number; // per 1M tokens
  sweBenchScore?: number;
  bestFor: string[];
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionOptions {
  model?: ModelId;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

// ============================================================================
// VISION TYPES
// ============================================================================

export interface ImageContent {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
}

export interface TextContent {
  type: "text";
  text: string;
}

export type MessageContent = string | Array<TextContent | ImageContent>;

export interface VisionMessage {
  role: "system" | "user" | "assistant";
  content: MessageContent;
}

export interface VisionOptions {
  systemPrompt?: string;
  model?: ModelId;
  temperature?: number;
  maxTokens?: number;
  detail?: "auto" | "low" | "high";
}

export interface VisionAnalysisResult {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
}

export interface CompletionResult {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
}

// ============================================================================
// MODEL REGISTRY
// ============================================================================

export const MODELS: Record<string, ModelInfo> = {
  // === PREMIUM ===
  "anthropic/claude-4.5-opus": {
    id: "anthropic/claude-4.5-opus",
    name: "Claude Opus 4.5",
    provider: "Anthropic",
    contextWindow: 200000,
    inputPrice: 5,
    outputPrice: 25,
    sweBenchScore: 80.9,
    bestFor: ["coding", "debugging", "complex-tasks"],
  },
  "openai/gpt-5.2": {
    id: "openai/gpt-5.2",
    name: "GPT-5.2",
    provider: "OpenAI",
    contextWindow: 400000,
    inputPrice: 10,
    outputPrice: 30,
    sweBenchScore: 75.8,
    bestFor: ["reasoning", "math", "general"],
  },
  "google/gemini-3-pro": {
    id: "google/gemini-3-pro",
    name: "Gemini 3 Pro",
    provider: "Google",
    contextWindow: 1000000,
    inputPrice: 3.5,
    outputPrice: 10.5,
    sweBenchScore: 76.2,
    bestFor: ["vision", "long-context", "multimodal"],
  },
  
  // === BEST VALUE ===
  "moonshotai/kimi-k2.5": {
    id: "moonshotai/kimi-k2.5",
    name: "Kimi K2.5",
    provider: "Moonshot AI",
    contextWindow: 262000,
    inputPrice: 0.6,
    outputPrice: 2.5,
    sweBenchScore: 76.8,
    bestFor: ["coding", "bulk-tasks", "cost-effective"],
  },
  "deepseek/deepseek-v3.2": {
    id: "deepseek/deepseek-v3.2",
    name: "DeepSeek V3.2",
    provider: "DeepSeek",
    contextWindow: 128000,
    inputPrice: 0.25,
    outputPrice: 0.38,
    sweBenchScore: 72,
    bestFor: ["bulk-generation", "ultra-cheap", "coding"],
  },
  "google/gemini-3-flash": {
    id: "google/gemini-3-flash",
    name: "Gemini 3 Flash",
    provider: "Google",
    contextWindow: 1000000,
    inputPrice: 0.075,
    outputPrice: 0.30,
    sweBenchScore: 57.6,
    bestFor: ["fast-tasks", "chat", "quick-iterations"],
  },
  
  // === FREE ===
  "mistralai/devstral-2": {
    id: "mistralai/devstral-2",
    name: "Devstral 2",
    provider: "Mistral AI",
    contextWindow: 256000,
    inputPrice: 0,
    outputPrice: 0.22,
    sweBenchScore: 70,
    bestFor: ["prototyping", "testing", "free-tier"],
  },
};

// ============================================================================
// OPENROUTER CLIENT
// ============================================================================

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: ModelId;

  constructor(options?: { 
    apiKey?: string; 
    defaultModel?: ModelId;
  }) {
    this.apiKey = options?.apiKey || process.env.OPENROUTER_API_KEY || "";
    this.baseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
    this.defaultModel = options?.defaultModel || "moonshotai/kimi-k2.5";

    if (!this.apiKey) {
      console.warn("[OpenRouter] No API key found. Set OPENROUTER_API_KEY in .env.local");
    }
  }

  /**
   * Send a chat completion request
   */
  async chat(
    messages: ChatMessage[],
    options: CompletionOptions = {}
  ): Promise<CompletionResult> {
    const {
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 4096,
      topP = 1,
      stream = false,
    } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://moostik.vercel.app",
        "X-Title": "Moostik Bloodwings",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        stream,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    const modelInfo = MODELS[model];
    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;
    
    // Calculate cost
    const cost = modelInfo
      ? (promptTokens * modelInfo.inputPrice + completionTokens * modelInfo.outputPrice) / 1_000_000
      : 0;

    return {
      content: data.choices?.[0]?.message?.content || "",
      model: data.model || model,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      cost,
    };
  }

  /**
   * Simple completion with just a prompt
   */
  async complete(
    prompt: string,
    options: CompletionOptions = {}
  ): Promise<CompletionResult> {
    return this.chat([{ role: "user", content: prompt }], options);
  }

  /**
   * Complete with system prompt
   */
  async completeWithSystem(
    systemPrompt: string,
    userPrompt: string,
    options: CompletionOptions = {}
  ): Promise<CompletionResult> {
    return this.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], options);
  }

  /**
   * Get model info
   */
  getModelInfo(modelId: ModelId): ModelInfo | undefined {
    return MODELS[modelId];
  }

  /**
   * List available models
   */
  listModels(): ModelInfo[] {
    return Object.values(MODELS);
  }

  /**
   * Get best model for a specific task
   */
  getBestModelFor(task: string): ModelId {
    const taskLower = task.toLowerCase();
    
    // Coding tasks
    if (taskLower.includes("coding") || taskLower.includes("debug") || taskLower.includes("code")) {
      return "anthropic/claude-4.5-opus"; // Best SWE-Bench
    }
    
    // Bulk/batch tasks
    if (taskLower.includes("bulk") || taskLower.includes("batch") || taskLower.includes("mass")) {
      return "deepseek/deepseek-v3.2"; // Cheapest
    }
    
    // Vision/image tasks
    if (taskLower.includes("vision") || taskLower.includes("image") || taskLower.includes("video")) {
      return "google/gemini-3-pro"; // Best multimodal
    }
    
    // Long context
    if (taskLower.includes("long") || taskLower.includes("context") || taskLower.includes("document")) {
      return "google/gemini-3-pro"; // 1M context
    }
    
    // Free/testing
    if (taskLower.includes("test") || taskLower.includes("prototype") || taskLower.includes("free")) {
      return "mistralai/devstral-2"; // Free
    }
    
    // Fast tasks
    if (taskLower.includes("fast") || taskLower.includes("quick") || taskLower.includes("chat")) {
      return "google/gemini-3-flash"; // Fastest
    }
    
    // Default: best value for coding
    return "moonshotai/kimi-k2.5";
  }

  /**
   * Estimate cost for a task
   */
  estimateCost(
    modelId: ModelId,
    estimatedInputTokens: number,
    estimatedOutputTokens: number
  ): number {
    const model = MODELS[modelId];
    if (!model) return 0;
    
    return (
      (estimatedInputTokens * model.inputPrice + estimatedOutputTokens * model.outputPrice) / 
      1_000_000
    );
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let clientInstance: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
  if (!clientInstance) {
    clientInstance = new OpenRouterClient();
  }
  return clientInstance;
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick completion with default settings
 */
export async function aiComplete(
  prompt: string,
  model?: ModelId
): Promise<string> {
  const client = getOpenRouterClient();
  const result = await client.complete(prompt, { model });
  return result.content;
}

/**
 * Quick completion optimized for coding
 */
export async function aiCode(prompt: string): Promise<string> {
  const client = getOpenRouterClient();
  const result = await client.complete(prompt, { 
    model: "moonshotai/kimi-k2.5",
    temperature: 0.3,
  });
  return result.content;
}

/**
 * Free completion for testing
 */
export async function aiFree(prompt: string): Promise<string> {
  const client = getOpenRouterClient();
  const result = await client.complete(prompt, { 
    model: "mistralai/devstral-2",
  });
  return result.content;
}

/**
 * Bulk completion (cheapest)
 */
export async function aiBulk(prompt: string): Promise<string> {
  const client = getOpenRouterClient();
  const result = await client.complete(prompt, { 
    model: "deepseek/deepseek-v3.2",
  });
  return result.content;
}

/**
 * Premium completion (best quality)
 */
export async function aiPremium(prompt: string): Promise<string> {
  const client = getOpenRouterClient();
  const result = await client.complete(prompt, { 
    model: "anthropic/claude-4.5-opus",
    temperature: 0.5,
  });
  return result.content;
}

// ============================================================================
// VISION FUNCTIONS
// ============================================================================

/**
 * Analyze an image with optional reference images
 * Uses Gemini 3 Pro by default (best for vision tasks)
 */
export async function analyzeImageWithVision(
  imageUrl: string,
  prompt: string,
  referenceImageUrls: string[] = [],
  options: VisionOptions = {}
): Promise<VisionAnalysisResult> {
  const {
    systemPrompt,
    model = "google/gemini-3-pro",
    temperature = 0.5,
    maxTokens = 4096,
    detail = "high",
  } = options;

  const client = getOpenRouterClient();

  // Build user message with images
  const userContent: Array<TextContent | ImageContent> = [];

  // Add main image first
  userContent.push({
    type: "image_url",
    image_url: {
      url: imageUrl,
      detail,
    },
  });

  // Add reference images
  for (const refUrl of referenceImageUrls) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: refUrl,
        detail: "low", // Use low detail for references to save tokens
      },
    });
  }

  // Add text prompt
  userContent.push({
    type: "text",
    text: prompt,
  });

  // Build messages
  const messages: VisionMessage[] = [];

  if (systemPrompt) {
    messages.push({
      role: "system",
      content: systemPrompt,
    });
  }

  messages.push({
    role: "user",
    content: userContent,
  });

  // Make API call
  const response = await fetch(`${client["baseUrl"]}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${client["apiKey"]}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://moostik.vercel.app",
      "X-Title": "Moostik Bloodwings - Vision Analysis",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter Vision API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  const modelInfo = MODELS[model];
  const promptTokens = data.usage?.prompt_tokens || 0;
  const completionTokens = data.usage?.completion_tokens || 0;
  
  // Calculate cost (vision images add ~500-2000 tokens each)
  const cost = modelInfo
    ? (promptTokens * modelInfo.inputPrice + completionTokens * modelInfo.outputPrice) / 1_000_000
    : 0;

  return {
    content: data.choices?.[0]?.message?.content || "",
    model: data.model || model,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    },
    cost,
  };
}

/**
 * Compare multiple images (e.g., generated vs reference)
 */
export async function compareImages(
  images: string[],
  comparisonPrompt: string,
  options: VisionOptions = {}
): Promise<VisionAnalysisResult> {
  if (images.length < 2) {
    throw new Error("At least 2 images required for comparison");
  }

  const {
    systemPrompt = "Tu es un expert en analyse d'images. Compare les images fournies et donne une evaluation detaillee.",
    model = "google/gemini-3-pro",
    temperature = 0.3,
    maxTokens = 4096,
    detail = "high",
  } = options;

  const client = getOpenRouterClient();

  // Build user message with all images
  const userContent: Array<TextContent | ImageContent> = [];

  for (let i = 0; i < images.length; i++) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: images[i],
        detail: i === 0 ? detail : "low", // First image high detail, rest low
      },
    });
  }

  userContent.push({
    type: "text",
    text: comparisonPrompt,
  });

  const messages: VisionMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ];

  const response = await fetch(`${client["baseUrl"]}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${client["apiKey"]}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://moostik.vercel.app",
      "X-Title": "Moostik Bloodwings - Image Comparison",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter Vision API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  const modelInfo = MODELS[model];
  const promptTokens = data.usage?.prompt_tokens || 0;
  const completionTokens = data.usage?.completion_tokens || 0;
  
  const cost = modelInfo
    ? (promptTokens * modelInfo.inputPrice + completionTokens * modelInfo.outputPrice) / 1_000_000
    : 0;

  return {
    content: data.choices?.[0]?.message?.content || "",
    model: data.model || model,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    },
    cost,
  };
}

/**
 * Quick image description
 */
export async function describeImage(imageUrl: string): Promise<string> {
  const result = await analyzeImageWithVision(
    imageUrl,
    "Decris cette image en detail.",
    [],
    { model: "google/gemini-3-flash", temperature: 0.3 }
  );
  return result.content;
}
