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
