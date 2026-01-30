/**
 * MOOSTIK Audio Module
 * Voice synthesis, music generation, and lip sync
 */

// Types
export * from "./types";

// Voice synthesis
export {
  VoiceSynthesisManager,
  getVoiceSynthesisManager,
  VoiceSynthesisError,
} from "./voice-synthesis";

// Music generation
export {
  MusicGenerationManager,
  getMusicGenerationManager,
  MusicGenerationError,
} from "./music-generation";

// Lip sync
export {
  LipSyncManager,
  getLipSyncManager,
  LipSyncGenerationError,
  phonemesToVisemes,
  PHONEME_TO_VISEME,
} from "./lip-sync";
