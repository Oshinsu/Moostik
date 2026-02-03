/**
 * MOOSTIK AGENT SYSTEM
 * ============================================================================
 * Unified exports for all agent runtimes
 * ============================================================================
 */

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
  const orchestrator = await startOrchestrator({
    autoStart: true,
    enableSwarm: true,
    enableRealityBleed: true,
    enableMolt: true,
    enableWorker: true,
  });

  console.log("[Agents] System ready");
  return orchestrator;
}
