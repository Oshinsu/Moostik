/**
 * MOOSTIK Video Generation Module
 * Exports for video generation capabilities
 */

// Main manager
export { VideoManager, getVideoManager } from "./video-manager";

// Types
export * from "./types";

// Provider base
export { VideoProviderBase, VideoProviderError, createProvider } from "./provider-base";

// Individual providers (auto-registered)
export { KlingProvider, createKlingProvider } from "./providers/kling";
export { RunwayProvider, createRunwayProvider } from "./providers/runway";
