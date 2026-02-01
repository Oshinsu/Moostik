/**
 * MOOSTIK - Export centralisé des types
 */

// Episode types
export type {
  SceneType,
  VariationStatus,
  ShotStatus,
  Variation,
  Shot,
  Episode,
  Act,
  // Dialogue types
  DialogueType,
  DialogueEmotion,
  DialogueLine,
  // Audio types
  AudioTrackType,
  AudioIntensity,
  ShotAudioTrack,
  ShotAudio
} from "./episode";

// Character types
export type {
  RelationshipType,
  CharacterRelationship,
  Character
} from "./character";

export {
  getRelationshipLabel,
  getRelationshipEmoji
} from "./character";

// Location types
export type { Location } from "./location";

export {
  getLocationTypeLabel,
  getLocationTypeEmoji,
  getScaleLabel
} from "./location";

// Prompt types
export type {
  CameraAngle,
  MoostikPrompt
} from "./prompt";

// Scene Cluster types (Act is already exported from episode)
export type {
  ClusterType,
  SceneCluster,
  ClusterReferenceMap,
  CoherenceRules,
  CharacterReference,
  LocationReference,
  ClusterReferences,
  MissingReference,
  GenerationReadinessCheck,
  ClusterAnalysisResult,
  ClusterGenerationOptions
} from "./scene-cluster";

export {
  DEFAULT_CLUSTER_GENERATION_OPTIONS,
  createEmptyCluster,
  createEmptyReadinessCheck,
  createEmptyClusterReferences,
  getClusterTypeLabel
} from "./scene-cluster";

// Generated Image types
export type {
  GeneratedImage,
  GeneratedImageWithEpisode,
  GeneratedImageStats,
  GeneratedImagesResponse
} from "./generated-image";
