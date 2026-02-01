/**
 * VIDEO GENERATION HELPER
 * ===========================================================================
 * Utilitaires pour générer des vidéos avec les nouveaux standards Kling/Veo
 * Intègre les standards JSON et l'orchestrateur
 * SOTA Janvier 2026
 * ===========================================================================
 */

import type { Shot } from "@/types/episode";
import type { ShotAnalysis } from "./shot-analyzer";
import { 
  createJsonKling, 
  klingBuilder,
  jsonKlingToApiParams,
  MOOSTIK_SCENE_PRESETS as KLING_PRESETS,
  type JsonKling 
} from "@/lib/json-kling-standard";
import { 
  createJsonVeo, 
  veoBuilder,
  jsonVeoToApiParams,
  MOOSTIK_VEO_SCENE_PRESETS as VEO_PRESETS,
  type JsonVeo 
} from "@/lib/json-veo-standard";
import { analyzeShot, buildEpisodeContext, recommendProvider } from "./shot-analyzer";
import type { Episode } from "@/types/episode";

// ============================================================================
// TYPES
// ============================================================================

export type VideoProvider = "kling" | "veo" | "auto";

export interface VideoGenerationConfig {
  provider: VideoProvider;
  quality: "draft" | "standard" | "professional";
  prioritizeSpeed: boolean;
  enableAudio: boolean;
  chainFromPrevious: boolean;
}

export interface PreparedVideoRequest {
  shotId: string;
  provider: "kling" | "veo";
  config: JsonKling | JsonVeo;
  apiParams: Record<string, unknown>;
  estimatedCost: number;
  estimatedDuration: number;
}

// ============================================================================
// MAIN HELPERS
// ============================================================================

/**
 * Prepare video generation request for a shot
 * Auto-selects provider and configures based on shot analysis
 */
export function prepareVideoRequest(
  shot: Shot,
  episode: Episode,
  options: Partial<VideoGenerationConfig> = {}
): PreparedVideoRequest {
  const {
    provider = "auto",
    quality = "professional",
    prioritizeSpeed = false,
    enableAudio = true,
    chainFromPrevious = true,
  } = options;

  // Analyze shot
  const shotIndex = episode.shots.findIndex(s => s.id === shot.id);
  const context = buildEpisodeContext(episode, shotIndex);
  const analysis = analyzeShot(shot, context);

  // Select provider (fallback luma to kling since we don't have luma config)
  const recommendedProvider = provider === "auto" ? recommendProvider(analysis) : provider;
  const selectedProvider: "kling" | "veo" = 
    recommendedProvider === "luma" ? "kling" : recommendedProvider as "kling" | "veo";

  // Get previous shot for chaining
  const prevShot = shotIndex > 0 ? episode.shots[shotIndex - 1] : undefined;
  const prevVideoUrl = prevShot?.variations?.find(v => v.videoStatus === "completed")?.videoUrl;
  const prevLastFrame = (prevShot as any)?.generatedFrames?.last;

  // Build config based on provider
  let config: JsonKling | JsonVeo;
  let apiParams: Record<string, unknown>;
  let estimatedCost: number;
  let estimatedDuration: number;

  if (selectedProvider === "kling") {
    config = buildKlingConfig(shot, analysis, {
      quality,
      chainFromPrevious: chainFromPrevious && !!prevLastFrame,
      previousFrame: prevLastFrame,
      continuityShot: chainFromPrevious ? prevShot?.id : undefined,
    });
    apiParams = jsonKlingToApiParams(config as JsonKling);
    estimatedCost = ((config as JsonKling).parameters.duration === 10 ? 0.10 : 0.05);
    estimatedDuration = (config as JsonKling).parameters.duration;
  } else {
    config = buildVeoConfig(shot, analysis, {
      quality,
      enableAudio,
      chainFromPrevious: chainFromPrevious && !!prevLastFrame,
      previousFrame: prevLastFrame,
      previousVideo: prevVideoUrl,
      continuityShot: chainFromPrevious ? prevShot?.id : undefined,
      useFastModel: prioritizeSpeed,
    });
    apiParams = jsonVeoToApiParams(config as JsonVeo);
    estimatedCost = ((config as JsonVeo).parameters.duration === 8 ? 0.16 : 0.12);
    estimatedDuration = (config as JsonVeo).parameters.duration;
  }

  return {
    shotId: shot.id,
    provider: selectedProvider,
    config,
    apiParams,
    estimatedCost,
    estimatedDuration,
  };
}

/**
 * Build Kling configuration for a shot
 */
function buildKlingConfig(
  shot: Shot,
  analysis: ShotAnalysis,
  options: {
    quality: string;
    chainFromPrevious: boolean;
    previousFrame?: string;
    continuityShot?: string;
  }
): JsonKling {
  const { quality, chainFromPrevious, previousFrame, continuityShot } = options;

  // Get image URL for first frame
  const firstFrame = shot.variations?.find(v => v.status === "completed")?.imageUrl;

  // Build with builder
  const builder = klingBuilder(shot.id, "MOOSTIK")
    .intent(shot.description || shot.name)
    .duration(analysis.recommendedDuration.kling)
    .resolution(quality === "professional" ? "1080p" : "720p");

  // Set source
  if (analysis.frameStrategy === "first_last" && previousFrame) {
    builder.source("first_last_frame", firstFrame, previousFrame);
  } else if (firstFrame) {
    builder.source("single_frame", firstFrame);
  } else {
    builder.source("text_only");
  }

  // Apply scene preset if matching
  const scenePresetKey = findMatchingKlingPreset(shot);
  if (scenePresetKey) {
    builder.moostikScene(scenePresetKey);
  } else {
    // Apply based on analysis
    builder.motion(analysis.motionComplexity === "static" ? "subtle" : 
                   analysis.motionComplexity === "subtle" ? "gentle" :
                   analysis.motionComplexity === "dynamic" ? "moderate" : "dynamic");
  }

  // Add chaining
  if (chainFromPrevious && continuityShot) {
    builder.continuityWith(continuityShot);
  }

  // Build prompt
  const prompt = buildVideoPrompt(shot, analysis);
  builder.prompt(prompt);

  return builder.build();
}

/**
 * Build Veo configuration for a shot
 */
function buildVeoConfig(
  shot: Shot,
  analysis: ShotAnalysis,
  options: {
    quality: string;
    enableAudio: boolean;
    chainFromPrevious: boolean;
    previousFrame?: string;
    previousVideo?: string;
    continuityShot?: string;
    useFastModel: boolean;
  }
): JsonVeo {
  const { 
    quality, 
    enableAudio, 
    chainFromPrevious, 
    previousFrame, 
    previousVideo,
    continuityShot, 
    useFastModel 
  } = options;

  const firstFrame = shot.variations?.find(v => v.status === "completed")?.imageUrl;

  const builder = veoBuilder(shot.id, "MOOSTIK")
    .intent(shot.description || shot.name)
    .model(!useFastModel)
    .duration(analysis.recommendedDuration.veo)
    .resolution(quality === "professional" ? "1080p" : "720p");

  // Set source
  if (analysis.frameStrategy === "first_last" && previousFrame) {
    builder.source("first_last_frame", firstFrame, previousFrame);
  } else if (firstFrame) {
    builder.source("single_frame", firstFrame);
  } else {
    builder.source("text_only");
  }

  // Apply scene preset if matching
  const scenePresetKey = findMatchingVeoPreset(shot);
  if (scenePresetKey) {
    builder.moostikScene(scenePresetKey);
  } else {
    // Apply physics based on analysis
    if (analysis.sceneCharacteristics.hasCharacterMovement) {
      builder.physics("realistic");
    }
  }

  // Audio
  if (enableAudio) {
    if (analysis.sceneCharacteristics.hasDialogue) {
      builder.audio("dialogue");
    } else {
      builder.audio("ambient_full");
    }
  } else {
    builder.silentAudio();
  }

  // Chaining
  if (chainFromPrevious && continuityShot) {
    builder.continuityWith(continuityShot);
    if (previousVideo) {
      builder.chainFrom(previousVideo);
    }
  }

  // Build prompt
  const prompt = buildVideoPrompt(shot, analysis);
  builder.prompt(prompt);

  // Add reasoning
  builder.reasoningFromContext(
    shot.description,
    undefined // Would need next shot description
  );

  return builder.build();
}

/**
 * Build video prompt from shot data
 */
function buildVideoPrompt(shot: Shot, analysis: ShotAnalysis): string {
  const parts: string[] = [];

  // Base description
  if (shot.description) {
    parts.push(shot.description);
  }

  // Motion hints
  if (analysis.sceneCharacteristics.hasCharacterMovement) {
    parts.push("smooth character movement");
  }
  if (analysis.sceneCharacteristics.hasTransformation) {
    parts.push("gradual transformation");
  }

  // Style
  parts.push("Pixar-demonic style");
  parts.push("cinematic quality");

  // Moostik-specific
  if (shot.characterIds?.length) {
    parts.push("micro-scale perspective");
  }

  return parts.join(", ");
}

/**
 * Find matching Kling preset for a shot
 */
function findMatchingKlingPreset(shot: Shot): keyof typeof KLING_PRESETS | undefined {
  const sceneType = shot.sceneType?.toLowerCase() || "";
  const description = (shot.description || "").toLowerCase();

  // Check for specific matches
  if (description.includes("vol") || description.includes("flight")) {
    if (description.includes("attaque") || description.includes("attack")) {
      return "moostik_flight_attack";
    }
    if (description.includes("fuite") || description.includes("escape")) {
      return "moostik_flight_escape";
    }
    return "moostik_flight_peaceful";
  }

  if (description.includes("bar") || description.includes("ti-sang")) {
    if (description.includes("confrontation")) {
      return "bar_confrontation";
    }
    return "bar_ambiance";
  }

  if (description.includes("genocide") || description.includes("byss")) {
    if (description.includes("survivant") || description.includes("survivor")) {
      return "genocide_survivor";
    }
    return "genocide_byss_cloud";
  }

  if (description.includes("pov") || description.includes("gigant")) {
    if (description.includes("main") || description.includes("hand")) {
      return "pov_hand_swat";
    }
    if (description.includes("oreille") || description.includes("ear")) {
      return "pov_ear_approach";
    }
    return "pov_human_looming";
  }

  if (sceneType === "establishing" || description.includes("établissement")) {
    if (description.includes("martinique")) {
      return "martinique_dawn";
    }
    if (description.includes("village") || description.includes("cooltik")) {
      return "cooltik_village_reveal";
    }
  }

  return undefined;
}

/**
 * Find matching Veo preset for a shot
 */
function findMatchingVeoPreset(shot: Shot): keyof typeof VEO_PRESETS | undefined {
  const sceneType = shot.sceneType?.toLowerCase() || "";
  const description = (shot.description || "").toLowerCase();

  if (description.includes("vol") || description.includes("flight")) {
    if (description.includes("essaim") || description.includes("swarm")) {
      return "moostik_swarm_attack";
    }
    return "moostik_flight_majestic";
  }

  if (description.includes("byss") || description.includes("genocide")) {
    if (description.includes("nuage") || description.includes("cloud")) {
      return "byss_cloud_approach";
    }
    return "genocide_mass_death";
  }

  if (description.includes("bar") || description.includes("ti-sang")) {
    if (description.includes("cocktail") || description.includes("sang")) {
      return "bar_blood_cocktail";
    }
    return "bar_interior_ambiance";
  }

  if (description.includes("pov") || description.includes("geant")) {
    if (description.includes("oreille") || description.includes("ear")) {
      return "pov_ear_landscape";
    }
    return "pov_giant_human_looms";
  }

  if (description.includes("papy") && description.includes("monologue")) {
    return "papy_tik_monologue";
  }

  if (description.includes("cauchemar") || description.includes("nightmare")) {
    return "baby_dorval_nightmare";
  }

  if (sceneType === "establishing") {
    if (description.includes("village")) {
      return "cooltik_village_living";
    }
    return "martinique_sunrise";
  }

  return undefined;
}

// ============================================================================
// BATCH PREPARATION
// ============================================================================

/**
 * Prepare video requests for all shots in an episode
 */
export function prepareEpisodeVideoRequests(
  episode: Episode,
  options: Partial<VideoGenerationConfig> = {}
): PreparedVideoRequest[] {
  return (episode.shots || []).map(shot => 
    prepareVideoRequest(shot, episode, options)
  );
}

/**
 * Calculate total estimated cost for episode video generation
 */
export function estimateEpisodeCost(requests: PreparedVideoRequest[]): {
  totalCost: number;
  totalDuration: number;
  byProvider: { kling: number; veo: number };
} {
  let totalCost = 0;
  let totalDuration = 0;
  const byProvider = { kling: 0, veo: 0 };

  for (const req of requests) {
    totalCost += req.estimatedCost;
    totalDuration += req.estimatedDuration;
    byProvider[req.provider] += req.estimatedCost;
  }

  return { totalCost, totalDuration, byProvider };
}

/**
 * Group requests by provider for batch processing
 */
export function groupRequestsByProvider(
  requests: PreparedVideoRequest[]
): { kling: PreparedVideoRequest[]; veo: PreparedVideoRequest[] } {
  return {
    kling: requests.filter(r => r.provider === "kling"),
    veo: requests.filter(r => r.provider === "veo"),
  };
}
