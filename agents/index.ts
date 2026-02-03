/**
 * MOOSTIK AGENT SYSTEM - SOTA February 2026
 * ============================================================================
 * Unified exports for all agent runtimes with:
 * - MCP (Model Context Protocol) for tool connections
 * - A2A (Agent-to-Agent) Protocol for inter-agent communication
 * - Mem0 memory layer for persistent semantic memory
 * - LLM Reasoning with Claude integration
 * - Human-in-the-Loop checkpoints
 * ============================================================================
 */

// ============================================================================
// CORE AGENT RUNTIMES
// ============================================================================

// Swarm Narrative Engine
export {
  SwarmNarrativeEngineRuntime,
  getSwarmEngine,
  type AgentMessage,
  type SwarmEngineConfig,
} from "./swarm/runtime";

export type {
  NarrativeSignal,
  SwarmPattern,
  EmergentNarrativeBrief,
  SignalType,
} from "./swarm/narrative-engine";

// Reality Bleed Protocol
export {
  RealityBleedRuntime,
  getRealityBleedRuntime,
  type RealityBleedConfig,
  type BleedEvent,
  type BleedCandidate,
  type BleedEventType,
} from "./reality-bleed/runtime";

// THE MOLT - Collective Unconscious
export {
  MoltRuntime,
  getMoltRuntime,
  type MoltConfig,
  type DreamFragment,
  type CollectiveState,
  type MoltInfluence,
  type DreamType,
  type Archetype,
} from "./molt/runtime";

// Bloodwings Worker
export {
  BloodwingsWorkerRuntime,
  getBloodwingsWorker,
  type WorkerConfig,
  type GenerationTask,
  type GenerationStyle,
  type BeatSyncConfig,
  type WorkerStats,
} from "./bloodwings-worker/runtime";

// Orchestrator
export {
  OrchestratorRuntime,
  getOrchestrator,
  startOrchestrator,
  type OrchestratorConfig,
  type Workflow,
  type WorkflowType,
  type WorkflowStatus,
  type WorkflowStep,
  type OrchestratorStats,
} from "./orchestrator/runtime";

// ============================================================================
// QUICK START
// ============================================================================

/**
 * Quick start the entire agent system
 *
 * @example
 * ```typescript
 * import { quickStart } from '@/agents';
 *
 * const orchestrator = await quickStart();
 *
 * // Submit agent messages
 * orchestrator.processAgentMessage('agent123', 'I hope Tikoro finds redemption');
 *
 * // Get narrative briefs
 * const briefs = orchestrator.getSwarmEngine()?.getBriefs();
 *
 * // Get collective state
 * const state = orchestrator.getMolt()?.getCollectiveState();
 * ```
 */
export async function quickStart() {
  const { startOrchestrator: start } = await import("./orchestrator/runtime");
  const orchestrator = await start({
    autoStart: true,
    enableSwarm: true,
    enableRealityBleed: true,
    enableMolt: true,
    enableWorker: true,
  });

  console.log("[Agents] System ready");
  return orchestrator;
}

// ============================================================================
// SOTA PROTOCOLS (February 2026)
// ============================================================================

// MCP (Model Context Protocol) - Anthropic's standard for tool connections
export {
  MCPServer,
  MCPClient,
  getMCPServer,
  createMCPClient,
  createMoostikMCPServer,
  type MCPTool,
  type MCPToolCall,
  type MCPToolResult,
  type MCPResource,
  type MCPPrompt,
  type MCPContext,
} from "../src/lib/protocols/mcp";

// A2A (Agent-to-Agent) Protocol - Google/Linux Foundation standard
export {
  A2ARegistry,
  A2AMessenger,
  A2ATaskManager,
  getA2AHub,
  createA2AHub,
  type A2AAgentCard,
  type A2AMessage,
  type A2ATask,
  type A2ACapability,
  type A2AConversation,
  type A2AHub,
} from "../src/lib/protocols/a2a";

// Mem0 Memory Layer - Persistent semantic memory
export {
  AgentMemoryManager,
  getMemoryManager,
  getMem0Client,
  type AgentMemory,
  type MemoryMetadata,
  type MemorySearchResult,
  type MemoryConfig,
} from "../src/lib/memory/mem0-client";

// LLM Reasoning Engine - Claude integration
export {
  LLMReasoningEngine,
  getReasoningEngine,
  type ReasoningContext,
  type ReasoningResult,
  type NarrativeRequest,
  type NarrativeResult,
  type DecisionRequest,
  type DecisionResult,
  type LLMConfig,
} from "../src/lib/ai/llm-reasoning";

// Human-in-the-Loop Checkpoints
export {
  HITLManager,
  getHITLManager,
  withHumanApproval,
  type Checkpoint,
  type CheckpointType,
  type CheckpointPolicy,
  type HumanReview,
  type HITLConfig,
} from "./human-loop";

// Claude Agent Skills - Open standard for portable AI capabilities
export {
  SkillLoader,
  SkillRegistry,
  getSkillRegistry,
  buildSkillContext,
  buildSkillSummary,
  MOOSTIK_SKILLS,
  type Skill,
  type SkillMetadata,
  type SkillMatch,
} from "./skills";

// ============================================================================
// FULL SOTA QUICK START
// ============================================================================

/**
 * Start the complete SOTA agent system with all protocols
 *
 * @example
 * ```typescript
 * import { quickStartSOTA } from '@/agents';
 *
 * const system = await quickStartSOTA();
 *
 * // Use MCP to call tools
 * const mcp = system.mcp.createClient('my-agent');
 * mcp.connect();
 * await mcp.callTool('generate_image', { prompt: 'A mystical forest' });
 *
 * // Use A2A for agent communication
 * await system.a2a.messenger.send({
 *   type: 'request',
 *   from: 'my-agent',
 *   to: 'swarm-narrative',
 *   payload: { action: 'generate_narrative', data: { mood: 'mysterious' } }
 * });
 *
 * // Use memory
 * await system.memory.remember('my-agent', 'Important discovery about Tikoro');
 *
 * // Use LLM reasoning
 * const result = await system.reasoning.reason({
 *   agentId: 'my-agent',
 *   task: 'Analyze the emotional arc of Episode 3'
 * });
 *
 * // Create human checkpoint
 * const checkpoint = await system.hitl.createCheckpoint({
 *   agentId: 'my-agent',
 *   type: 'content_generation',
 *   action: 'publish_episode',
 *   description: 'Publishing Episode 3 to production',
 *   proposedValue: { episodeId: 'ep3' }
 * });
 * ```
 */
export async function quickStartSOTA() {
  // Import dynamically to avoid circular dependencies
  const { getMCPServer, createMCPClient } = await import("../src/lib/protocols/mcp");
  const { getA2AHub } = await import("../src/lib/protocols/a2a");
  const { getMemoryManager } = await import("../src/lib/memory/mem0-client");
  const { getReasoningEngine } = await import("../src/lib/ai/llm-reasoning");
  const { getHITLManager } = await import("./human-loop");
  const { getSkillRegistry } = await import("./skills");

  // Initialize all SOTA components
  const mcp = {
    server: getMCPServer(),
    createClient: (agentId: string) => createMCPClient(agentId),
  };

  const a2a = getA2AHub();
  const memory = getMemoryManager();
  const reasoning = getReasoningEngine();
  const hitl = getHITLManager();
  const skills = getSkillRegistry();

  // Start orchestrator with all agents
  const orchestrator = await quickStart();

  console.log("[Agents SOTA] Full system initialized:");
  console.log("  - MCP Server with", mcp.server.getTools().length, "tools");
  console.log("  - A2A Hub with", a2a.registry.getAllAgents().length, "registered agents");
  console.log("  - Memory Manager (Mem0)");
  console.log("  - LLM Reasoning Engine (Claude)");
  console.log("  - Human-in-the-Loop Manager");
  console.log("  - Skills Registry with", skills.getAll().length, "skills");

  return {
    orchestrator,
    mcp,
    a2a,
    memory,
    reasoning,
    hitl,
    skills,
  };
}
