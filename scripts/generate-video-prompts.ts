#!/usr/bin/env npx ts-node
/**
 * MOOSTIK Video Prompt Generator - SOTA Janvier 2026
 * 
 * Génère les prompts vidéo optimisés pour chaque variation de T05
 * en utilisant la stratégie "SOTA Optimal" sélectionnée.
 * 
 * Usage: npx ts-node scripts/generate-video-prompts.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// TYPES
// ============================================

interface Shot {
  id: string;
  number: number;
  name: string;
  description: string;
  sceneType: string;
  status: string;
  prompt: {
    goal: string;
    subjects: Array<{ id: string; description: string; importance?: string; reference_image?: string }>;
    scene: { location: string; atmosphere: string[] };
    camera: { angle: string; lens_mm?: number };
    lighting: { key: string; fill?: string };
  };
  variations: Variation[];
}

interface Variation {
  id: string;
  cameraAngle: string;
  status: string;
  imageUrl?: string;
  localPath?: string;
  customPrompt?: unknown;
  sotaVersion?: string;
  strategy?: string;
  isLegacy?: boolean;
  // Video fields
  videoPrompt?: VideoPromptData;
  videoUrl?: string;
  videoStatus?: "pending" | "generating" | "completed" | "failed";
  videoProvider?: string;
}

interface VideoPromptData {
  prompt: string;
  negativePrompt?: string;
  duration: number;
  fps: number;
  aspectRatio: string;
  cameraMotion?: string;
  audioPrompt?: string;
  firstFrame?: string;
  lastFrame?: string;
  provider: string;
  estimatedCost: number;
  modelConfig: Record<string, unknown>;
}

interface Episode {
  id: string;
  shots: Shot[];
  sequences: unknown[];
}

// ============================================
// SOTA OPTIMAL STRATEGY - Janvier 2026
// ============================================

type VideoProvider = "hailuo-2.3-fast" | "veo-3.1-fast" | "seedance-1.5-pro" | "kling-2.6" | "wan-2.6";

const SCENE_TYPE_TO_PROVIDER: Record<string, VideoProvider> = {
  // ==================================================
  // ACTUAL T05 SCENE TYPES MAPPING
  // ==================================================
  
  // Apocalyptic (11 shots) - Action/destruction - Hailuo 2.3 Fast ($0.25)
  // Best for: fire, chaos, movement, destruction
  apocalyptic: "hailuo-2.3-fast",
  
  // Sacred (11 shots) - Emotional/ritualistic - Kling 2.6 ($0.65)
  // Best for: emotional moments, rituals, sacred ceremonies
  sacred: "kling-2.6",
  
  // Tense (9 shots) - Tension/suspense - Veo 3.1 Fast ($0.75)
  // Best for: atmosphere, physics, suspense
  tense: "veo-3.1-fast",
  
  // Military (8 shots) - Action/training - Hailuo 2.3 Fast ($0.25)
  // Best for: dynamic motion, combat training
  military: "hailuo-2.3-fast",
  
  // Bar (4 shots) - Dialogue/atmospheric - Seedance 1.5 Pro ($0.50)
  // Best for: dialogue, character interactions, lip-sync
  bar: "seedance-1.5-pro",
  
  // Fallback mappings for potential other types
  action: "hailuo-2.3-fast",
  combat: "hailuo-2.3-fast",
  establishing: "veo-3.1-fast",
  death: "veo-3.1-fast",
  flashback: "veo-3.1-fast",
  transition: "veo-3.1-fast",
  dialogue: "seedance-1.5-pro",
  emotional: "kling-2.6",
  subtle: "wan-2.6",
  
  // Default fallback
  default: "hailuo-2.3-fast"
};

const PROVIDER_COSTS: Record<VideoProvider, number> = {
  "hailuo-2.3-fast": 0.25,
  "veo-3.1-fast": 0.75,
  "seedance-1.5-pro": 0.50,
  "kling-2.6": 0.65,
  "wan-2.6": 0.15
};

// ============================================
// PROMPT BUILDERS PAR PROVIDER
// ============================================

const MOOSTIK_VIDEO_PREFIX = "Pixar-dark 3D animated film, ILM-grade VFX, microscopic mosquito civilization";

const SCENE_MOTION_HINTS: Record<string, string> = {
  // Actual T05 scene types
  apocalyptic: "fire and particles in constant motion, destruction unfolding, chaos, toxic fog swirling",
  sacred: "solemn ceremonial movement, candlelight flickering, subtle reverent gestures, sacred ritual motions",
  tense: "suspenseful subtle movement, anxious breathing, nervous glances, atmospheric tension building",
  military: "disciplined formation movement, training exercises, combat stances, marching precision",
  bar: "casual gestures, drinking motions, conversation body language, ambient bar atmosphere",
  
  // Standard scene types (fallbacks)
  emotional: "subtle breathing and emotional micro-expressions, tears forming",
  action: "dynamic movement and energy, quick strikes",
  combat: "fierce combat motion, quick proboscis strikes, aerial maneuvers",
  establishing: "slow reveal of epic scale, ambient particle drift",
  dialogue: "speaking with natural gestures, expressive face movements",
  death: "final moments in slow motion, fading light in eyes",
  flashback: "dreamy motion blur effect, soft transitions",
  transition: "smooth transformation between states",
  dance: "fluid rhythmic movement, graceful motion",
  subtle: "minimal ambient motion, breathing, wing flutters"
};

const CAMERA_MOTIONS: Record<string, string[]> = {
  // Actual T05 scene types
  apocalyptic: ["slow push in through fire", "handheld shake chaos", "crane up revealing destruction scale"],
  sacred: ["slow reverent dolly", "static ceremonial shot", "gentle orbit around ritual"],
  tense: ["slow ominous push in", "static tension hold", "subtle rack focus"],
  military: ["tracking formation march", "dynamic training angles", "crane over troops"],
  bar: ["slow pan across patrons", "medium dialogue shot", "atmospheric dolly through space"],
  
  // Standard scene types (fallbacks)
  emotional: ["slow zoom in on eyes", "gentle pan across face", "static with subtle breathing"],
  action: ["tracking shot following movement", "whip pan", "dynamic angles"],
  combat: ["fast tracking", "POV shots", "360 orbit around action"],
  establishing: ["slow crane shot", "wide pan across landscape", "push in to reveal scale"],
  dialogue: ["medium shot", "slow dolly", "shot-reverse focus pulls"],
  death: ["slow motion pullback", "time freeze effect", "gentle drift away"],
  flashback: ["soft focus drift", "slow dissolve motion", "dream-like camera sway"],
  transition: ["smooth morph", "match cut motion", "seamless interpolation"],
  dance: ["fluid tracking", "360 orbit", "dynamic crane following movement"],
  subtle: ["minimal movement", "breathing camera", "static with ambient motion"]
};

const AUDIO_CONTEXTS: Record<string, string> = {
  // Actual T05 scene types
  apocalyptic: "crackling fire, distant screams, toxic hissing, debris falling, chaos soundscape",
  sacred: "solemn chanting undertones, candlelight crackling, reverent silence, ceremonial bells",
  tense: "suspenseful drone, nervous breathing, subtle tension music, heartbeat pulse",
  military: "marching footsteps, training impacts, commands echoing, disciplined movement sounds",
  bar: "ambient bar chatter, glasses clinking, background music, conversation tones",
  
  // Standard scene types (fallbacks)  
  emotional: "soft ambient, heartbeat, quiet sobbing, wind whispers",
  action: "wing buzzing intensity, proboscis impact sounds, battle chaos",
  combat: "fierce combat sounds, wing buzzes, impact strikes",
  establishing: "environmental ambience, wind, distant civilization sounds",
  dialogue: "clear dialogue with ambient background, emotional vocal tones",
  death: "fading heartbeat, mournful wind, silence growing",
  flashback: "echoed sounds, dreamy ambience, distant memories",
  transition: "swoosh sound, ambient shift",
  dance: "rhythmic beats, graceful movement sounds",
  subtle: "quiet ambience, soft breathing, gentle wing flutters"
};

function buildPromptForHailuo(shot: Shot, variation: Variation): string {
  const { prompt: imgPrompt, sceneType } = shot;
  const motionHint = SCENE_MOTION_HINTS[sceneType] || SCENE_MOTION_HINTS.subtle;
  const cameraMotion = CAMERA_MOTIONS[sceneType]?.[0] || "smooth camera movement";
  
  // Hailuo: Natural language, 60-1200 chars, supports negatives
  const parts = [
    MOOSTIK_VIDEO_PREFIX,
    imgPrompt.goal,
    `Motion: ${motionHint}`,
    `Camera: ${cameraMotion}`,
    "fluid, dynamic, expressive, emotional intensity"
  ];
  
  let prompt = parts.join(". ");
  
  // Truncate to 1200 chars max
  if (prompt.length > 1200) {
    prompt = prompt.slice(0, 1197) + "...";
  }
  
  return prompt;
}

function buildPromptForVeo(shot: Shot, variation: Variation, nextShotImageUrl?: string): string {
  const { prompt: imgPrompt, sceneType } = shot;
  const motionHint = SCENE_MOTION_HINTS[sceneType] || SCENE_MOTION_HINTS.subtle;
  const cameraMotion = CAMERA_MOTIONS[sceneType]?.[0] || "smooth camera movement";
  const audioContext = AUDIO_CONTEXTS[sceneType] || "ambient atmospheric sounds";
  
  // Veo 3.1: Best physics, native audio, first/last frame
  const parts = [
    MOOSTIK_VIDEO_PREFIX,
    imgPrompt.goal,
    `Motion: ${motionHint}`,
    `Camera: ${cameraMotion}`,
    `Audio: ${audioContext}`,
    "realistic physics, natural motion, cinematic"
  ];
  
  let prompt = parts.join(". ");
  
  // Truncate to 1500 chars max
  if (prompt.length > 1500) {
    prompt = prompt.slice(0, 1497) + "...";
  }
  
  return prompt;
}

function buildPromptForSeedance(shot: Shot, variation: Variation): string {
  const { prompt: imgPrompt, sceneType, description } = shot;
  const motionHint = SCENE_MOTION_HINTS[sceneType] || SCENE_MOTION_HINTS.dialogue;
  
  // Seedance: NO negative prompts, focus on lip-sync, natural language
  // Max 1000 chars, avoid negations
  const parts = [
    MOOSTIK_VIDEO_PREFIX,
    imgPrompt.goal,
    `Character speaking with natural expressions`,
    `Motion: ${motionHint}`,
    "expressive, emotional, dialogue, conversation"
  ];
  
  let prompt = parts.join(". ");
  
  // Remove any negation words (Seedance doesn't support them)
  prompt = prompt.replace(/\b(no|not|don't|without|never|none)\b/gi, "");
  
  // Truncate to 1000 chars max
  if (prompt.length > 1000) {
    prompt = prompt.slice(0, 997) + "...";
  }
  
  return prompt;
}

function buildPromptForKling(shot: Shot, variation: Variation): string {
  const { prompt: imgPrompt, sceneType } = shot;
  const motionHint = SCENE_MOTION_HINTS[sceneType] || SCENE_MOTION_HINTS.emotional;
  const cameraMotion = CAMERA_MOTIONS[sceneType]?.[0] || "smooth camera movement";
  const audioContext = AUDIO_CONTEXTS[sceneType] || "ambient atmospheric sounds";
  
  // Kling 2.6: Structured, motion control, native audio, up to 2500 chars
  const parts = [
    MOOSTIK_VIDEO_PREFIX,
    imgPrompt.goal,
    `Emotional motion: ${motionHint}`,
    `Camera: ${cameraMotion}`,
    `Audio: ${audioContext}`,
    "cinematic, film quality, professional lighting, atmospheric"
  ];
  
  let prompt = parts.join(". ");
  
  // Truncate to 2500 chars max
  if (prompt.length > 2500) {
    prompt = prompt.slice(0, 2497) + "...";
  }
  
  return prompt;
}

function buildPromptForWan(shot: Shot, variation: Variation): string {
  const { prompt: imgPrompt, sceneType } = shot;
  const motionHint = SCENE_MOTION_HINTS[sceneType] || SCENE_MOTION_HINTS.subtle;
  
  // Wan 2.6: Keyword-focused, shorter prompts, max 800 chars
  const parts = [
    MOOSTIK_VIDEO_PREFIX,
    imgPrompt.goal,
    motionHint,
    "cinematic, smooth, professional"
  ];
  
  let prompt = parts.join(". ");
  
  // Truncate to 800 chars max
  if (prompt.length > 800) {
    prompt = prompt.slice(0, 797) + "...";
  }
  
  return prompt;
}

function buildNegativePrompt(sceneType: string, provider: VideoProvider): string | undefined {
  // Seedance doesn't support negative prompts
  if (provider === "seedance-1.5-pro") {
    return undefined;
  }
  
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

function getOptimalDuration(sceneType: string): number {
  const durationMap: Record<string, number> = {
    // Actual T05 scene types
    apocalyptic: 6,  // Fast paced destruction
    sacred: 8,       // Slow ceremonial moments
    tense: 6,        // Building tension
    military: 5,     // Quick training shots
    bar: 6,          // Dialogue pacing
    
    // Standard fallbacks
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
  return durationMap[sceneType] || 5;
}

function getMotionAmount(sceneType: string): number {
  const motionMap: Record<string, number> = {
    // Actual T05 scene types
    apocalyptic: 0.85,  // High motion - fire, destruction
    sacred: 0.35,       // Low motion - reverent, ceremonial
    tense: 0.45,        // Medium-low - suspense building
    military: 0.75,     // Medium-high - training, marching
    bar: 0.4,           // Medium-low - dialogue, atmosphere
    
    // Standard fallbacks
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
// FIRST/LAST FRAME DETECTION
// ============================================

// Shots qui bénéficient de l'interpolation first/last frame
const FIRST_LAST_FRAME_SHOTS = new Set([
  // Flashbacks - transition entre époques
  "shot-034", "shot-035",
  // Transitions temporelles
  "shot-022", "shot-023", // Young Dorval -> Adult
  // Scènes de mort avec fade
  "shot-017", "shot-018", // Mama Dorval death
  // Establishing sequences
  "shot-028", "shot-029", // Tire City reveal
]);

function shouldUseFirstLastFrame(shot: Shot, shots: Shot[]): string | undefined {
  if (!FIRST_LAST_FRAME_SHOTS.has(shot.id)) {
    return undefined;
  }
  
  // Trouver le shot suivant
  const currentIndex = shots.findIndex(s => s.id === shot.id);
  const nextShot = shots[currentIndex + 1];
  
  if (!nextShot) return undefined;
  
  // Chercher une variation completed avec imageUrl
  const nextVariation = nextShot.variations.find(
    v => v.status === "completed" && v.imageUrl && !v.isLegacy
  );
  
  return nextVariation?.imageUrl;
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

function generateVideoPromptForVariation(
  shot: Shot,
  variation: Variation,
  allShots: Shot[]
): VideoPromptData | null {
  // Skip legacy variations
  if (variation.isLegacy) {
    return null;
  }
  
  // Skip if no image generated
  if (!variation.imageUrl || variation.status !== "completed") {
    return null;
  }
  
  const sceneType = shot.sceneType || "default";
  const provider = SCENE_TYPE_TO_PROVIDER[sceneType] || SCENE_TYPE_TO_PROVIDER.default;
  
  // Build prompt based on provider
  let prompt: string;
  switch (provider) {
    case "hailuo-2.3-fast":
      prompt = buildPromptForHailuo(shot, variation);
      break;
    case "veo-3.1-fast":
      prompt = buildPromptForVeo(shot, variation, shouldUseFirstLastFrame(shot, allShots));
      break;
    case "seedance-1.5-pro":
      prompt = buildPromptForSeedance(shot, variation);
      break;
    case "kling-2.6":
      prompt = buildPromptForKling(shot, variation);
      break;
    case "wan-2.6":
      prompt = buildPromptForWan(shot, variation);
      break;
    default:
      prompt = buildPromptForHailuo(shot, variation);
  }
  
  const duration = getOptimalDuration(sceneType);
  const lastFrame = shouldUseFirstLastFrame(shot, allShots);
  
  // Build model config
  const modelConfig: Record<string, unknown> = {
    image: variation.imageUrl,
    duration,
    aspect_ratio: "21:9"
  };
  
  switch (provider) {
    case "kling-2.6":
      modelConfig.mode = "pro";
      modelConfig.motion_amount = getMotionAmount(sceneType);
      modelConfig.audio_mode = "auto";
      break;
    case "seedance-1.5-pro":
      modelConfig.lip_sync = sceneType === "dialogue";
      modelConfig.language = "fr"; // French for MOOSTIK
      break;
    case "veo-3.1-fast":
      if (lastFrame) {
        modelConfig.end_image = lastFrame;
      }
      modelConfig.audio = true;
      break;
    case "hailuo-2.3-fast":
      modelConfig.motion_mode = sceneType === "dance" ? "dynamic" : "natural";
      break;
    case "wan-2.6":
      modelConfig.fast_mode = false;
      break;
  }
  
  return {
    prompt,
    negativePrompt: buildNegativePrompt(sceneType, provider),
    duration,
    fps: provider.includes("hailuo") ? 25 : 24,
    aspectRatio: "21:9",
    cameraMotion: CAMERA_MOTIONS[sceneType]?.[0],
    audioPrompt: AUDIO_CONTEXTS[sceneType],
    firstFrame: variation.imageUrl,
    lastFrame,
    provider,
    estimatedCost: PROVIDER_COSTS[provider],
    modelConfig
  };
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log("🎬 MOOSTIK Video Prompt Generator - SOTA Janvier 2026");
  console.log("=" .repeat(60));
  
  const episodePath = path.join(__dirname, "../data/episodes/t05.json");
  const episode: Episode = JSON.parse(fs.readFileSync(episodePath, "utf-8"));
  
  console.log(`📁 Loaded episode: ${episode.id}`);
  console.log(`🎞️  Shots: ${episode.shots.length}`);
  
  let totalVariations = 0;
  let processedVariations = 0;
  let totalEstimatedCost = 0;
  
  const providerCounts: Record<string, number> = {};
  
  // Process each shot
  for (const shot of episode.shots) {
    for (const variation of shot.variations) {
      totalVariations++;
      
      const videoPrompt = generateVideoPromptForVariation(shot, variation, episode.shots);
      
      if (videoPrompt) {
        // Add video data to variation
        variation.videoPrompt = videoPrompt;
        variation.videoStatus = "pending";
        variation.videoProvider = videoPrompt.provider;
        
        processedVariations++;
        totalEstimatedCost += videoPrompt.estimatedCost;
        
        providerCounts[videoPrompt.provider] = (providerCounts[videoPrompt.provider] || 0) + 1;
      }
    }
  }
  
  // Save updated episode
  fs.writeFileSync(episodePath, JSON.stringify(episode, null, 2));
  
  // Report
  console.log("\n" + "=" .repeat(60));
  console.log("📊 RAPPORT DE GÉNÉRATION");
  console.log("=" .repeat(60));
  console.log(`\n✅ Variations totales: ${totalVariations}`);
  console.log(`✅ Prompts vidéo générés: ${processedVariations}`);
  console.log(`⏭️  Skipped (legacy/incomplete): ${totalVariations - processedVariations}`);
  
  console.log("\n📦 RÉPARTITION PAR PROVIDER:");
  for (const [provider, count] of Object.entries(providerCounts).sort((a, b) => b[1] - a[1])) {
    const cost = PROVIDER_COSTS[provider as VideoProvider] * count;
    console.log(`   ${provider}: ${count} vidéos ($${cost.toFixed(2)})`);
  }
  
  console.log(`\n💰 COÛT TOTAL ESTIMÉ: $${totalEstimatedCost.toFixed(2)}`);
  
  console.log("\n📁 STRUCTURE LIBRARY POUR LES VIDÉOS:");
  console.log("   output/videos/t05/");
  console.log("   ├── by-provider/");
  console.log("   │   ├── hailuo-2.3-fast/");
  console.log("   │   ├── veo-3.1-fast/");
  console.log("   │   ├── seedance-1.5-pro/");
  console.log("   │   ├── kling-2.6/");
  console.log("   │   └── wan-2.6/");
  console.log("   ├── by-shot/");
  console.log("   │   ├── shot-001/");
  console.log("   │   │   └── [variation-id].mp4");
  console.log("   │   └── ...");
  console.log("   └── timeline/");
  console.log("       └── sequence-ordered.json");
  
  console.log("\n✨ Prompts vidéo SOTA générés avec succès!");
  console.log("🚀 Prêt pour la génération batch via l'API.");
}

main().catch(console.error);
