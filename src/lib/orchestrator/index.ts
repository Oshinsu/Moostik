/**
 * MOOSTIK Orchestrator Module
 * High-level automation for series generation
 */

export {
  SeriesGenerator,
  SeriesGeneratorError,
  getSeriesGenerator,
} from "./series-generator";

export type {
  GenerationPipeline,
  GenerationOptions,
  GenerationProgress,
  GenerationPhase,
  GenerationResult,
  GenerationStats,
  GenerationError,
} from "./series-generator";
