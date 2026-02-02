/**
 * MOOSTIK Video Prompt Standards - SOTA Janvier 2026
 * 
 * Chaque modèle vidéo a ses propres conventions de prompts.
 * Ce fichier définit les standards et transforme les prompts images en prompts vidéo optimisés.
 */

import { VideoProvider } from "./types";

// ============================================
// TYPES
// ============================================

export interface VideoPromptConfig {
  provider: VideoProvider;
  maxLength: number;           // Longueur max du prompt en caractères
  minLength: number;           // Longueur min recommandée
  structure: "natural" | "structured" | "keyword";
  supportsNegative: boolean;
  supportsBoost: boolean;
  audioSupport: "native" | "separate" | "none";
  cameraMotion: CameraMotionConfig;
  bestPractices: string[];
  avoidTerms: string[];
  boostTerms: string[];
}

export interface CameraMotionConfig {
  supported: boolean;
  keywords: string[];          // Mots-clés reconnus par le modèle
  maxComplexity: "simple" | "moderate" | "complex";
}

export interface VideoPromptResult {
  prompt: string;
  negativePrompt?: string;
  duration: number;            // En secondes
  fps: number;
  aspectRatio: string;
  cameraMotion?: string;
  audioPrompt?: string;        // Pour les modèles avec audio natif
  firstFrame?: string;         // URL image de début
  lastFrame?: string;          // URL image de fin (pour interpolation)
  modelConfig: Record<string, unknown>;
}

// ============================================
// CONFIGURATIONS PAR MODÈLE
// ============================================

export const VIDEO_PROMPT_CONFIGS: Record<VideoProvider, VideoPromptConfig> = {
  // ============================================
  // SOTA PREMIUM - Kling 2.6
  // ============================================
  "kling-2.6": {
    provider: "kling-2.6",
    maxLength: 2500,
    minLength: 100,
    structure: "structured",
    supportsNegative: true,
    supportsBoost: true,
    audioSupport: "native",
    cameraMotion: {
      supported: true,
      keywords: [
        "pan left", "pan right", "tilt up", "tilt down",
        "zoom in", "zoom out", "dolly in", "dolly out",
        "crane shot", "tracking shot", "static camera",
        "handheld shake", "slow motion", "time lapse"
      ],
      maxComplexity: "complex"
    },
    bestPractices: [
      "Start with subject/action, then environment details",
      "Use motion brush for specific element animation",
      "Specify exact camera movements with timing",
      "Include lighting direction changes for drama",
      "Native audio: describe soundscape in prompt"
    ],
    avoidTerms: ["morphing", "impossible physics", "extreme gore"],
    boostTerms: ["cinematic", "film quality", "professional lighting", "atmospheric"]
  },

  // ============================================
  // SOTA PREMIUM - Seedance 1.5 Pro (BEST LIP-SYNC)
  // ============================================
  "seedance-1.5-pro": {
    provider: "seedance-1.5-pro",
    maxLength: 1000,
    minLength: 50,
    structure: "natural",
    supportsNegative: false,   // IMPORTANT: Pas de negative prompts!
    supportsBoost: true,
    audioSupport: "native",    // Lip-sync multilingue!
    cameraMotion: {
      supported: true,
      keywords: [
        "slow pan", "gentle zoom", "static shot",
        "follow subject", "focus pull"
      ],
      maxComplexity: "moderate"
    },
    bestPractices: [
      "Focus on character expressions and emotions",
      "Describe dialogue context for lip-sync",
      "Keep prompts concise and natural",
      "Specify language for lip-sync (8 languages)",
      "Include emotional tone for voice synthesis"
    ],
    avoidTerms: ["don't", "no", "without", "never"],  // Pas de négations!
    boostTerms: ["expressive", "emotional", "speaking", "dialogue", "conversation"]
  },

  // ============================================
  // SOTA STANDARD - Veo 3.1 Fast
  // ============================================
  "veo-3.1-fast": {
    provider: "veo-3.1-fast",
    maxLength: 1500,
    minLength: 80,
    structure: "natural",
    supportsNegative: true,
    supportsBoost: true,
    audioSupport: "native",
    cameraMotion: {
      supported: true,
      keywords: [
        "camera push", "camera pull", "orbit around",
        "first person view", "aerial shot", "crane up/down"
      ],
      maxComplexity: "complex"
    },
    bestPractices: [
      "Describe physical interactions precisely",
      "Include environmental sounds in prompt",
      "Specify lighting transitions",
      "Use for first/last frame interpolation",
      "Best for physics-heavy scenes"
    ],
    avoidTerms: ["impossible", "surreal physics"],
    boostTerms: ["realistic physics", "natural motion", "atmospheric audio", "cinematic"]
  },

  "veo-3.1": {
    provider: "veo-3.1",
    maxLength: 2000,
    minLength: 100,
    structure: "natural",
    supportsNegative: true,
    supportsBoost: true,
    audioSupport: "native",
    cameraMotion: {
      supported: true,
      keywords: [
        "camera push", "camera pull", "orbit around",
        "first person view", "aerial shot", "crane up/down"
      ],
      maxComplexity: "complex"
    },
    bestPractices: [
      "Describe physical interactions precisely",
      "Include environmental sounds in prompt",
      "Specify lighting transitions",
      "Best physics simulation in the industry",
      "1080p quality output"
    ],
    avoidTerms: ["impossible", "surreal physics"],
    boostTerms: ["realistic physics", "natural motion", "atmospheric audio", "cinematic"]
  },

  // ============================================
  // SOTA STANDARD - Hailuo 2.3 Fast
  // ============================================
  "hailuo-2.3-fast": {
    provider: "hailuo-2.3-fast",
    maxLength: 1200,
    minLength: 60,
    structure: "natural",
    supportsNegative: true,
    supportsBoost: true,
    audioSupport: "none",
    cameraMotion: {
      supported: true,
      keywords: [
        "dynamic motion", "fluid movement", "dance movement",
        "expressive gesture", "emotional expression"
      ],
      maxComplexity: "complex"
    },
    bestPractices: [
      "Excellent for character expressions",
      "Best for dance and fluid motion",
      "Include emotional beats",
      "Describe gesture intensity",
      "50% cheaper than standard"
    ],
    avoidTerms: ["static", "frozen"],
    boostTerms: ["fluid", "graceful", "dynamic", "expressive", "emotional intensity"]
  },

  "hailuo-2.3": {
    provider: "hailuo-2.3",
    maxLength: 1500,
    minLength: 80,
    structure: "natural",
    supportsNegative: true,
    supportsBoost: true,
    audioSupport: "none",
    cameraMotion: {
      supported: true,
      keywords: [
        "dynamic motion", "fluid movement", "dance movement",
        "expressive gesture", "emotional expression"
      ],
      maxComplexity: "complex"
    },
    bestPractices: [
      "Best for character animation",
      "Excellent emotional expressions",
      "Dance and performance specialist",
      "Include emotional context"
    ],
    avoidTerms: ["static", "frozen"],
    boostTerms: ["fluid", "graceful", "dynamic", "expressive", "emotional intensity"]
  },

  // ============================================
  // SOTA BUDGET - Wan 2.6
  // ============================================
  "wan-2.6": {
    provider: "wan-2.6",
    maxLength: 800,
    minLength: 40,
    structure: "keyword",
    supportsNegative: true,
    supportsBoost: false,
    audioSupport: "none",
    cameraMotion: {
      supported: true,
      keywords: ["pan", "zoom", "tilt", "static"],
      maxComplexity: "simple"
    },
    bestPractices: [
      "Keep prompts short and keyword-focused",
      "Best value for money",
      "Good for establishing shots",
      "Fast generation (~40s)"
    ],
    avoidTerms: [],
    boostTerms: ["cinematic", "smooth", "professional"]
  },

  // Budget/older providers avec configs simplifiées
  "wan-2.2": {
    provider: "wan-2.2",
    maxLength: 500,
    minLength: 30,
    structure: "keyword",
    supportsNegative: false,
    supportsBoost: false,
    audioSupport: "none",
    cameraMotion: { supported: true, keywords: ["pan", "zoom"], maxComplexity: "simple" },
    bestPractices: ["Short prompts", "Fast prototyping"],
    avoidTerms: [],
    boostTerms: []
  },

  "wan-2.5": {
    provider: "wan-2.5",
    maxLength: 600,
    minLength: 35,
    structure: "keyword",
    supportsNegative: true,
    supportsBoost: false,
    audioSupport: "none",
    cameraMotion: { supported: true, keywords: ["pan", "zoom", "tilt"], maxComplexity: "simple" },
    bestPractices: ["Good balance quality/speed"],
    avoidTerms: [],
    boostTerms: []
  },

  "seedance-1-lite": {
    provider: "seedance-1-lite",
    maxLength: 600,
    minLength: 40,
    structure: "natural",
    supportsNegative: false,
    supportsBoost: false,
    audioSupport: "none",
    cameraMotion: { supported: true, keywords: ["pan", "zoom", "static"], maxComplexity: "simple" },
    bestPractices: ["Budget Seedance", "Good quality/price"],
    avoidTerms: ["don't", "no", "without"],
    boostTerms: []
  },

  "luma-ray-2": {
    provider: "luma-ray-2",
    maxLength: 1000,
    minLength: 60,
    structure: "natural",
    supportsNegative: true,
    supportsBoost: true,
    audioSupport: "none",
    cameraMotion: { supported: true, keywords: ["smooth transition", "interpolate", "morph"], maxComplexity: "moderate" },
    bestPractices: ["Best for first/last frame interpolation", "Natural physics"],
    avoidTerms: [],
    boostTerms: ["smooth", "natural", "interpolate"]
  },

  "luma-ray-3": {
    provider: "luma-ray-3",
    maxLength: 1200,
    minLength: 70,
    structure: "natural",
    supportsNegative: true,
    supportsBoost: true,
    audioSupport: "none",
    cameraMotion: { supported: true, keywords: ["smooth transition", "interpolate", "natural motion"], maxComplexity: "moderate" },
    bestPractices: ["Enhanced interpolation", "Better physics than Ray 2"],
    avoidTerms: [],
    boostTerms: ["smooth", "natural", "cinematic transition"]
  },

  "ltx-2": {
    provider: "ltx-2",
    maxLength: 800,
    minLength: 50,
    structure: "natural",
    supportsNegative: true,
    supportsBoost: false,
    audioSupport: "none",
    cameraMotion: { supported: true, keywords: ["pan", "zoom", "dolly"], maxComplexity: "moderate" },
    bestPractices: ["Open source 4K", "Good for long scenes"],
    avoidTerms: [],
    boostTerms: []
  },

  "sora-2": {
    provider: "sora-2",
    maxLength: 2000,
    minLength: 100,
    structure: "natural",
    supportsNegative: true,
    supportsBoost: true,
    audioSupport: "native",
    cameraMotion: { supported: true, keywords: ["cinematic", "dramatic", "smooth"], maxComplexity: "complex" },
    bestPractices: ["Longest duration (35s)", "Good realism"],
    avoidTerms: ["copyrighted characters", "real celebrities", "gore"],
    boostTerms: ["cinematic", "professional", "film quality"]
  },

  "hunyuan-1.5": {
    provider: "hunyuan-1.5",
    maxLength: 1000,
    minLength: 60,
    structure: "natural",
    supportsNegative: true,
    supportsBoost: false,
    audioSupport: "none",
    cameraMotion: { supported: true, keywords: ["pan", "zoom", "static"], maxComplexity: "simple" },
    bestPractices: ["Open source 13B", "Good baseline quality"],
    avoidTerms: [],
    boostTerms: []
  },

  "pixverse-4": {
    provider: "pixverse-4",
    maxLength: 800,
    minLength: 50,
    structure: "natural",
    supportsNegative: true,
    supportsBoost: false,
    audioSupport: "none",
    cameraMotion: { supported: true, keywords: ["cinematic", "dynamic"], maxComplexity: "moderate" },
    bestPractices: ["Good for stylized content"],
    avoidTerms: [],
    boostTerms: []
  },
};

// ============================================
// MOOSTIK SPECIFIC VIDEO CONTEXT
// ============================================

const MOOSTIK_VIDEO_CONTEXT = {
  stylePrefix: "Pixar-dark 3D animated film, ILM-grade VFX, microscopic mosquito civilization",
  
  motionGuidelines: {
    moostikCharacters: "Subtle wing flutters, proboscis movements, amber eyes blinking",
    apocalyptic: "Fire particles rising, toxic fog swirling, destruction debris",
    emotional: "Tears forming, breathing movements, subtle body language",
    action: "Quick proboscis strikes, wing bursts, aerial maneuvers",
    establishing: "Slow camera movement revealing scale, ambient particle drift",
    dialogue: "Lip movements synced to speech, head tilts, gestural emphasis"
  },

  audioGuidelines: {
    apocalyptic: "Crackling fire, distant screams, toxic hissing, debris falling",
    emotional: "Soft ambient, heartbeat, quiet sobbing, wind whispers",
    action: "Wing buzzing intensity, proboscis impact, battle chaos",
    establishing: "Environmental ambience, wind, distant sounds of civilization",
    dialogue: "Clear dialogue with ambient background, emotional vocal tones"
  },

  scaleReminders: [
    "Moostik are microscopic - human elements appear COLOSSAL",
    "Dust particles drift like asteroids",
    "Human fingers are 50-meter pillars",
    "Water droplets are small lakes"
  ]
};

// ============================================
// CAMERA MOTION MAPPING BY SCENE TYPE
// ============================================

export const SCENE_TYPE_CAMERA_MOTION: Record<string, string[]> = {
  apocalyptic: ["slow push in", "handheld shake", "crane up revealing destruction"],
  emotional: ["slow zoom in on eyes", "static with subtle breathing", "gentle pan across face"],
  action: ["tracking shot following movement", "whip pan", "dynamic angle changes"],
  combat: ["fast tracking", "POV shots", "360 orbit"],
  establishing: ["slow crane shot", "wide pan across landscape", "push in to reveal"],
  dialogue: ["shot-reverse-shot cuts", "slow dolly", "static medium shot"],
  death: ["slow motion", "time freeze", "gentle pull back"],
  flashback: ["soft focus transition", "slow dissolve motion", "dream-like drift"],
  transition: ["smooth morph", "match cut motion", "seamless interpolation"],
  dance: ["fluid tracking", "360 orbit", "dynamic crane"],
  subtle: ["minimal movement", "breathing camera", "static with ambient motion"]
};

// ============================================
// MAIN CONVERSION FUNCTION
// ============================================

export interface ImageToVideoInput {
  shotId: string;
  variationId: string;
  imageUrl: string;
  imagePrompt: {
    goal: string;
    subjects: Array<{ description: string; importance?: string }>;
    scene: { location: string; atmosphere: string[] };
    camera: { angle: string; lens_mm?: number };
    lighting: { key: string; fill?: string };
  };
  sceneType: string;
  duration?: number;
  hasDialogue?: boolean;
  dialogueText?: string;
  dialogueLanguage?: string;
  nextShotImageUrl?: string;  // Pour first/last frame
}

export function convertImagePromptToVideo(
  input: ImageToVideoInput,
  provider: VideoProvider
): VideoPromptResult {
  const config = VIDEO_PROMPT_CONFIGS[provider];
  const { imagePrompt, sceneType, hasDialogue, dialogueText, dialogueLanguage } = input;

  // Déterminer la durée optimale
  const duration = input.duration || getOptimalDuration(sceneType, provider);
  
  // Construire le prompt vidéo selon le provider
  let prompt = buildVideoPrompt(input, config);
  
  // Ajouter les mouvements de caméra
  const cameraMotion = selectCameraMotion(sceneType, config);
  if (cameraMotion) {
    prompt = `${prompt}. Camera: ${cameraMotion}`;
  }

  // Ajouter le contexte audio pour les providers qui le supportent
  let audioPrompt: string | undefined;
  if (config.audioSupport !== "none") {
    audioPrompt = buildAudioPrompt(sceneType, hasDialogue, dialogueText);
  }

  // Construire le negative prompt si supporté
  let negativePrompt: string | undefined;
  if (config.supportsNegative) {
    negativePrompt = buildNegativePrompt(sceneType);
  }

  // Tronquer si nécessaire
  if (prompt.length > config.maxLength) {
    prompt = truncatePrompt(prompt, config.maxLength);
  }

  // Config spécifique au modèle
  const modelConfig = buildModelConfig(provider, input, duration);

  return {
    prompt,
    negativePrompt,
    duration,
    fps: provider === "hailuo-2.3-fast" || provider === "hailuo-2.3" ? 25 : 24,
    aspectRatio: "21:9",  // Cinématique MOOSTIK
    cameraMotion,
    audioPrompt,
    firstFrame: input.imageUrl,
    lastFrame: input.nextShotImageUrl,
    modelConfig
  };
}

function buildVideoPrompt(input: ImageToVideoInput, config: VideoPromptConfig): string {
  const { imagePrompt, sceneType, hasDialogue, dialogueText } = input;
  
  const parts: string[] = [];

  // Style prefix MOOSTIK
  parts.push(MOOSTIK_VIDEO_CONTEXT.stylePrefix);

  // Goal principal adapté
  const adaptedGoal = adaptGoalForVideo(imagePrompt.goal, sceneType);
  parts.push(adaptedGoal);

  // Sujets avec motion guidelines
  const subjectMotion = buildSubjectMotion(imagePrompt.subjects, sceneType);
  if (subjectMotion) {
    parts.push(subjectMotion);
  }

  // Atmosphère et motion
  const atmosphereMotion = buildAtmosphereMotion(imagePrompt.scene.atmosphere, sceneType);
  if (atmosphereMotion) {
    parts.push(atmosphereMotion);
  }

  // Dialogue pour lip-sync
  if (hasDialogue && dialogueText && config.audioSupport === "native") {
    parts.push(`Character speaking: "${dialogueText}"`);
  }

  // Boost terms si supporté
  if (config.supportsBoost && config.boostTerms.length > 0) {
    const relevantBoosts = config.boostTerms.slice(0, 3).join(", ");
    parts.push(relevantBoosts);
  }

  return parts.join(". ");
}

function adaptGoalForVideo(goal: string, sceneType: string): string {
  // Ajouter des indicateurs de motion au goal
  const motionHints: Record<string, string> = {
    apocalyptic: "fire and particles in constant motion, destruction unfolding",
    emotional: "subtle breathing and emotional micro-expressions",
    action: "dynamic movement and energy",
    combat: "fierce combat motion, quick strikes",
    establishing: "slow reveal of epic scale",
    dialogue: "speaking with natural gestures",
    death: "final moments in slow motion",
    flashback: "dreamy motion blur effect",
    transition: "smooth transformation",
    dance: "fluid rhythmic movement",
    subtle: "minimal ambient motion"
  };

  const hint = motionHints[sceneType] || "natural ambient motion";
  return `${goal} with ${hint}`;
}

function buildSubjectMotion(
  subjects: Array<{ description: string; importance?: string }>,
  sceneType: string
): string {
  const motionGuide = MOOSTIK_VIDEO_CONTEXT.motionGuidelines;
  const relevantMotion = motionGuide[sceneType as keyof typeof motionGuide] || motionGuide.moostikCharacters;
  
  const primarySubject = subjects.find(s => s.importance === "primary") || subjects[0];
  if (!primarySubject) return "";

  return `${primarySubject.description} with ${relevantMotion}`;
}

function buildAtmosphereMotion(atmosphere: string[], sceneType: string): string {
  if (!atmosphere || atmosphere.length === 0) return "";
  
  const motionMap: Record<string, string> = {
    "toxic fog": "swirling toxic fog particles",
    "fire": "dancing flames and rising embers",
    "ember particles": "floating ember particles drifting upward",
    "screaming chaos": "chaotic motion and panic",
    "wind": "wind-swept elements in motion",
    "rain": "falling raindrops and splashes",
    "dust": "dust particles floating in light beams"
  };

  const motionAtmosphere = atmosphere
    .map(a => motionMap[a] || `${a} in gentle motion`)
    .slice(0, 2)
    .join(", ");

  return motionAtmosphere;
}

function selectCameraMotion(sceneType: string, config: VideoPromptConfig): string {
  const options = SCENE_TYPE_CAMERA_MOTION[sceneType] || SCENE_TYPE_CAMERA_MOTION.subtle;
  const supported = options.filter(motion => 
    config.cameraMotion.keywords.some(keyword => 
      motion.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  
  return supported[0] || options[0];
}

function buildAudioPrompt(sceneType: string, hasDialogue?: boolean, dialogueText?: string): string {
  const audioGuide = MOOSTIK_VIDEO_CONTEXT.audioGuidelines;
  const baseAudio = audioGuide[sceneType as keyof typeof audioGuide] || "ambient atmospheric sounds";
  
  if (hasDialogue && dialogueText) {
    return `${baseAudio}. Dialogue: "${dialogueText}"`;
  }
  
  return baseAudio;
}

function buildNegativePrompt(sceneType: string): string {
  const baseNegatives = [
    "low quality", "blurry", "artifacts", "flickering",
    "unnatural motion", "jittery", "frozen frames",
    "watermark", "text overlay"
  ];

  const sceneNegatives: Record<string, string[]> = {
    apocalyptic: ["calm peaceful", "bright cheerful"],
    emotional: ["chaotic", "fast motion"],
    action: ["static", "frozen", "slow"],
    dialogue: ["mumbling", "asynchronous lips"]
  };

  const specific = sceneNegatives[sceneType] || [];
  return [...baseNegatives, ...specific].join(", ");
}

function getOptimalDuration(sceneType: string, provider: VideoProvider): number {
  const config = VIDEO_PROMPT_CONFIGS[provider];
  
  const durationMap: Record<string, number> = {
    apocalyptic: 6,
    emotional: 8,
    action: 5,
    combat: 5,
    establishing: 8,
    dialogue: 6,
    death: 8,
    flashback: 6,
    transition: 4,
    dance: 8,
    subtle: 5
  };

  const ideal = durationMap[sceneType] || 5;
  return Math.min(Math.max(ideal, config.minLength || 4), config.maxLength || 10);
}

function truncatePrompt(prompt: string, maxLength: number): string {
  if (prompt.length <= maxLength) return prompt;
  
  // Trouver le dernier point avant la limite
  const truncated = prompt.slice(0, maxLength - 3);
  const lastPeriod = truncated.lastIndexOf(".");
  
  if (lastPeriod > maxLength * 0.7) {
    return truncated.slice(0, lastPeriod + 1);
  }
  
  return truncated + "...";
}

function buildModelConfig(
  provider: VideoProvider,
  input: ImageToVideoInput,
  duration: number
): Record<string, unknown> {
  const baseConfig = {
    image: input.imageUrl,
    duration,
    aspect_ratio: "21:9"
  };

  switch (provider) {
    case "kling-2.6":
      return {
        ...baseConfig,
        mode: "pro",
        motion_amount: getMotionAmount(input.sceneType),
        audio_mode: "auto"
      };

    case "seedance-1.5-pro":
      return {
        ...baseConfig,
        lip_sync: input.hasDialogue,
        language: input.dialogueLanguage || "en",
        audio_description: input.dialogueText
      };

    case "veo-3.1-fast":
    case "veo-3.1":
      return {
        ...baseConfig,
        end_image: input.nextShotImageUrl,  // First/Last frame
        audio: true
      };

    case "hailuo-2.3":
    case "hailuo-2.3-fast":
      return {
        ...baseConfig,
        motion_mode: input.sceneType === "dance" ? "dynamic" : "natural"
      };

    case "wan-2.6":
    case "wan-2.5":
    case "wan-2.2":
      return {
        ...baseConfig,
        fast_mode: provider === "wan-2.2"
      };

    case "luma-ray-2":
    case "luma-ray-3":
      return {
        ...baseConfig,
        end_image: input.nextShotImageUrl,  // Interpolation
        interpolation_mode: input.nextShotImageUrl ? "keyframe" : "standard"
      };

    default:
      return baseConfig;
  }
}

function getMotionAmount(sceneType: string): number {
  const motionMap: Record<string, number> = {
    apocalyptic: 0.8,
    emotional: 0.3,
    action: 0.9,
    combat: 0.95,
    establishing: 0.4,
    dialogue: 0.4,
    death: 0.5,
    flashback: 0.3,
    transition: 0.6,
    dance: 0.9,
    subtle: 0.2
  };
  
  return motionMap[sceneType] || 0.5;
}

// ============================================
// EXPORT HELPERS
// ============================================

export function getRecommendedProvider(sceneType: string, hasDialogue: boolean): VideoProvider {
  // Dialogue = Seedance pour le lip-sync
  if (hasDialogue) {
    return "seedance-1.5-pro";
  }

  const recommendations: Record<string, VideoProvider> = {
    apocalyptic: "hailuo-2.3-fast",
    emotional: "kling-2.6",
    action: "hailuo-2.3-fast",
    combat: "hailuo-2.3-fast",
    establishing: "veo-3.1-fast",
    dialogue: "seedance-1.5-pro",
    death: "veo-3.1-fast",
    flashback: "veo-3.1-fast",  // First/Last frame
    transition: "luma-ray-2",
    dance: "hailuo-2.3",
    subtle: "wan-2.6"
  };

  return recommendations[sceneType] || "hailuo-2.3-fast";
}

export function estimateCost(
  provider: VideoProvider,
  duration: number,
  count: number = 1
): { perVideo: number; total: number } {
  const costs: Record<VideoProvider, number> = {
    "kling-2.6": 0.65,
    "seedance-1.5-pro": 0.50,
    "veo-3.1-fast": 0.75,
    "veo-3.1": 1.75,
    "hailuo-2.3-fast": 0.25,
    "hailuo-2.3": 0.50,
    "wan-2.6": 0.15,
    "wan-2.5": 0.12,
    "wan-2.2": 0.086,
    "seedance-1-lite": 0.15,
    "luma-ray-2": 0.25,
    "luma-ray-3": 0.35,
    "ltx-2": 0.20,
    "sora-2": 0.50,
    "hunyuan-1.5": 0.15,
    "pixverse-4": 0.20
  };

  const perVideo = costs[provider] || 0.25;
  return { perVideo, total: perVideo * count };
}
