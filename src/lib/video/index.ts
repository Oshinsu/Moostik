/**
 * MOOSTIK Video Generation Module
 * SOTA I2V providers via Replicate - January 2026
 *
 * Supported providers:
 * - Wan 2.2/2.5/2.6 (Alibaba) - Best value, native audio
 * - Kling 2.6 Pro (Kuaishou) - Premium quality, 6-region motion brush
 * - Veo 3.1 (Google DeepMind) - Highest quality, 4K, physics simulation
 * - Hailuo 2.3 (MiniMax) - Excellent motion, character consistency
 * - Luma Ray 2/3 (Luma AI) - Fast, frame interpolation
 * - LTX-2 (Lightricks) - Open source, very fast
 * - Sora 2 (OpenAI) - Premium quality, long-form video
 * - Hunyuan 1.5 (Tencent) - Excellent quality/cost ratio
 * - PixVerse 4 - Budget option with decent quality
 */

// Main manager
export { VideoManager, getVideoManager, ReplicateVideoError } from "./video-manager";

// Types - all SOTA provider configs, capabilities, and pricing
export * from "./types";

// Unified Replicate provider - works with all 12 I2V models
export {
  generateVideo,
  generateVideoAndWait,
  generateVideoWithRetry,
  checkVideoStatus,
  cancelVideo,
  downloadVideo,
  ReplicateVideoError as VideoProviderError,
} from "./providers/replicate";

// Legacy provider base (for custom providers)
export { VideoProviderBase, createProvider } from "./provider-base";

// ============================================
// SOTA PROMPT OPTIMIZATION (January 2026)
// ============================================

// Prompt optimizer - adapts prompts per provider
export {
  VideoPromptOptimizer,
  videoPromptOptimizer,
  optimizePrompt,
  getNegativePrompt,
  scoreVideoPrompt,
  type OptimizedPrompt,
  type OptimizeOptions,
} from "./prompt-optimizer";

// Provider-specific prompt configurations
export {
  PROVIDER_PROMPT_CONFIGS,
  getProviderConfig,
  shouldAvoidTerm,
  getBoostTerms,
  getPreferredStyle,
  getMaxPromptLength,
  supportsNegativePrompt,
  type ProviderPromptConfig,
  type PromptStyle,
} from "./provider-configs";

// Scene-specific prompt templates
export {
  PROMPT_TEMPLATES,
  getPromptTemplate,
  applyTemplateToPrompt,
  getCameraPreset,
  getStyleGuide,
  getAllSceneTypes,
  getRecommendedProviders,
  type SceneType,
  type PromptTemplate,
  type TemplatePlaceholder,
  type StyleGuide,
  type CameraPreset,
} from "./prompt-templates";

// Prompt quality scoring
export {
  scorePrompt,
  quickScore,
  getScoreGrade,
  getScoreDescription,
  type PromptScore,
  type ScoreBreakdown,
} from "./prompt-scorer";

// ============================================
// METRICS & ANALYTICS
// ============================================

export {
  metricsStore,
  trackGenerationStart,
  trackGenerationComplete,
  getProviderMetrics,
  getAllMetrics,
  startMetricsSession,
  endMetricsSession,
  getCurrentSessionMetrics,
  type GenerationMetric,
  type ProviderStats,
  type SessionMetrics,
  type QualityMetrics,
} from "./metrics";

// ============================================
// IMAGE ANALYZER FOR VIDEO PROMPTS (KLING 2.6)
// ============================================

export {
  ImageAnalyzer,
  getImageAnalyzer,
  generateVideoPromptForImage,
  generateVideoPromptsForShot,
  type ImageAnalysis,
  type DetectedCharacter,
  type EnvironmentAnalysis,
  type CompositionAnalysis,
  type SceneContext,
  type VideoPromptSuggestion,
  type CameraMotionSuggestion,
  type MotionRegion,
} from "./image-analyzer";
