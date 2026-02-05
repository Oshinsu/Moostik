import Replicate from "replicate";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import type { CameraAngle, MoostikPrompt, Variation } from "@/types/moostik";
import { promptToText } from "@/types/moostik";
import type { JsonMoostik } from "./json-moostik-standard";
import { jsonMoostikToPrompt, getJsonMoostikNegative } from "./json-moostik-standard";
import { withReplicateRetry, processBatch } from "./retry";
import { prepareUrlsForReplicate } from "./url-utils";
import { replicateLogger as logger, trackPerformance } from "./logger";
import { ReplicateError, RateLimitError } from "./errors";
import { config } from "./config";
import { 
  uploadVariation, 
  uploadReference, 
  BUCKET_GENERATED_IMAGES,
  BUCKET_REFERENCES 
} from "./supabase/storage";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Configuration de génération parallèle (depuis config centralisée)
const MAX_PARALLEL_GENERATIONS = config.replicate.maxParallelGenerations;
const GENERATION_DELAY_MS = config.replicate.generationDelayMs;
const MAX_REFERENCE_IMAGES = config.replicate.maxReferenceImages;

export interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;  // SOTA: Separate negative prompt for better control
  aspectRatio?: string;
  outputFormat?: "png" | "jpg" | "webp";
  seed?: number;
  referenceImages?: string[];  // URLs des images de référence (max 14)
}

export interface GenerateImageResult {
  url: string;
  localPath?: string;
  seed?: number;
}

export interface BatchGenerationResult {
  variationId: string;
  success: boolean;
  result?: GenerateImageResult;
  error?: string;
}

// Générer une seule image avec retry automatique
export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResult> {
  const { prompt, negativePrompt, aspectRatio = "16:9", outputFormat = "png", seed, referenceImages } = options;

  logger.info("Generating image", {
    promptLength: prompt.length,
    negativeLength: negativePrompt?.length ?? 0,
    aspectRatio,
    refCount: referenceImages?.length ?? 0,
  });

  const input: Record<string, unknown> = {
    prompt,
    aspect_ratio: aspectRatio,
    output_format: outputFormat,
  };

  // SOTA: Use separate negative_prompt parameter for better control
  if (negativePrompt && negativePrompt.length > 0) {
    input.negative_prompt = negativePrompt;
  }

  if (seed !== undefined) {
    input.seed = seed;
  }

  // Ajouter les images de référence si fournies (limite: 14 images max)
  if (referenceImages && referenceImages.length > 0) {
    const { convertedUrls, localCount, publicCount, failedCount } =
      await prepareUrlsForReplicate(referenceImages, MAX_REFERENCE_IMAGES);

    if (convertedUrls.length > 0) {
      input.image_input = convertedUrls;
      logger.debug("Reference images prepared", {
        total: convertedUrls.length,
        local: localCount,
        public: publicCount,
        failed: failedCount,
      });
    }
  }

  // Utiliser le retry automatique pour les appels Replicate
  const output = await withReplicateRetry(async () => {
    try {
      return await replicate.run(config.replicate.model, { input });
    } catch (error) {
      // Détecter les erreurs de rate limiting
      if (error instanceof Error && error.message.includes("429")) {
        throw new RateLimitError(60);
      }
      throw error;
    }
  });

  // Le output peut être différent selon la version de Replicate
  let url: string;
  
  if (typeof output === 'string') {
    url = output;
  } else if (Array.isArray(output) && typeof output[0] === 'string') {
    url = output[0];
  } else if (output && typeof (output as { url: () => string }).url === 'function') {
    url = (output as { url: () => string }).url();
  } else if (output && typeof output === 'object' && 'url' in output) {
    url = String((output as { url: unknown }).url);
  } else {
    throw new ReplicateError(`Unexpected output format from Replicate: ${typeof output}`, "INVALID_OUTPUT");
  }

  logger.info("Image generated successfully", { url: typeof url === 'string' ? url.substring(0, 50) + "..." : url });

  return { url, seed };
}

// Télécharger une image et uploader vers Supabase Storage
export async function downloadImage(
  imageUrl: string,
  episodeId: string,
  shotId: string,
  variationId: string
): Promise<{ localPath: string; supabaseUrl: string }> {
  const outputDir = path.join(config.paths.images, episodeId, shotId);
  await mkdir(outputDir, { recursive: true });

  const filename = `${variationId}.png`;
  const localPath = path.join(outputDir, filename);

  logger.debug("Downloading image", { url: typeof imageUrl === 'string' ? imageUrl.substring(0, 50) + "..." : imageUrl });

  // Utiliser retry pour le téléchargement
  const buffer = await withReplicateRetry(async () => {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new ReplicateError(
        `Failed to download image: ${response.statusText}`,
        "DOWNLOAD_ERROR",
        response.status >= 500 // Retry uniquement pour les erreurs serveur
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }, { maxRetries: 3, initialDelay: 1000 });

  // Sauvegarder localement (backup)
  await writeFile(localPath, buffer);
  logger.debug("Image saved locally", { path: localPath });

  // Upload vers Supabase Storage (source de vérité)
  const uploadResult = await uploadVariation(buffer, episodeId, shotId, variationId);
  
  if (uploadResult.success && uploadResult.publicUrl) {
    logger.info("Image uploaded to Supabase", { 
      path: uploadResult.storagePath,
      url: uploadResult.publicUrl.substring(0, 80) + "..."
    });
    return { localPath, supabaseUrl: uploadResult.publicUrl };
  } else {
    logger.warn("Supabase upload failed, using local path", { 
      error: uploadResult.error,
      localPath 
    });
    // Fallback: utiliser l'URL de l'API locale si Supabase échoue
    return { localPath, supabaseUrl: `/api/images/${episodeId}/${shotId}/${variationId}.png` };
  }
}

// Générer et sauvegarder une image (local + Supabase)
export async function generateAndSave(
  prompt: string,
  episodeId: string,
  shotId: string,
  variationId: string,
  seed?: number,
  referenceImages?: string[],
  negativePrompt?: string  // SOTA: Separate negative prompt
): Promise<GenerateImageResult> {
  const result = await generateImage({ prompt, negativePrompt, seed, referenceImages });
  const { localPath, supabaseUrl } = await downloadImage(result.url, episodeId, shotId, variationId);

  return {
    // URL principale = Supabase (source de vérité pour le déploiement)
    url: supabaseUrl,
    localPath,
    seed: result.seed,
  };
}

// Générer une variation spécifique d'un shot
// SOTA Janvier 2026: Intègre le contexte global BLOODWINGS
export async function generateVariation(
  moostikPrompt: MoostikPrompt | JsonMoostik,
  angle: CameraAngle,
  episodeId: string,
  shotId: string,
  variationId: string,
  referenceImages?: string[]
): Promise<GenerateImageResult> {
  let promptText = "";

  // Détecter si c'est un JsonMoostik (Standard SOTA) ou un MoostikPrompt (Ancien)
  if ("deliverable" in moostikPrompt && "goal" in moostikPrompt) {
    // C'est un JsonMoostik - Appliquer le contexte global BLOODWINGS
    const json = moostikPrompt as JsonMoostik;
    
    // 1. Charger le contexte global
    const { loadGlobalContext, injectGlobalContext } = await import("./moostik-context");
    const context = loadGlobalContext(episodeId);
    
    // 2. Déterminer le type de scène pour les gigantism cues appropriés
    const sceneType = json.scene_graph?.environment?.mood?.includes("human") 
      ? "human_interaction" 
      : json.scene?.location?.toLowerCase().includes("bar") 
        ? "interior" 
        : "default";
    
    // 3. Injecter le contexte global dans le prompt
    const enrichedJson = injectGlobalContext(json, context, {
      sceneType: sceneType as "interior" | "exterior" | "human_interaction" | "default",
      includeGigantism: true,
      includeHumanRules: true,
    });
    
    // 4. Ajuster l'angle dans le JSON enrichi
    const updatedJson = { ...enrichedJson };
    updatedJson.camera = { ...enrichedJson.camera, angle: angle.replace("_", " ") };
    
    const angleToFraming: Record<string, string> = {
      extreme_wide: "extreme_wide",
      wide: "wide",
      medium: "medium",
      close_up: "close",
      extreme_close_up: "extreme_close",
      macro: "macro"
    };
    
    updatedJson.composition = { 
      ...(enrichedJson.composition || {}), 
      framing: (angleToFraming[angle] || "medium") as "extreme_wide" | "wide" | "medium" | "close" | "extreme_close" | "macro"
    };
    
    // 5. Convertir en prompt texte
    promptText = jsonMoostikToPrompt(updatedJson);
    
    // 6. Extraire le negative prompt (inclut constraints.must_not_include)
    const negativePrompt = getJsonMoostikNegative(updatedJson);
    
    // 7. Utiliser le seed du prompt si disponible
    const seed = updatedJson.parameters?.seed;
    
    logger.info("Generating with BLOODWINGS context", {
      shotId,
      variationId,
      hasGigantism: (updatedJson.scene_graph?.environment?.gigantism_cues?.length || 0) > 0,
      hasConstraints: !!updatedJson.constraints,
      seed,
    });
    
    return generateAndSave(promptText, episodeId, shotId, variationId, seed, referenceImages, negativePrompt);
  } else {
    // C'est l'ancien format MoostikPrompt
    promptText = promptToText(moostikPrompt as MoostikPrompt, angle);
    return generateAndSave(promptText, episodeId, shotId, variationId, undefined, referenceImages);
  }
}

// Générer toutes les variations d'un shot en parallèle
// SOTA BLOODWINGS: Support pour customPrompt par variation
export async function generateShotVariations(
  moostikPrompt: MoostikPrompt | JsonMoostik,
  variations: Variation[],
  episodeId: string,
  shotId: string,
  onProgress?: (variationId: string, status: "generating" | "completed" | "error", result?: GenerateImageResult, error?: string) => void,
  referenceImages?: string[]
): Promise<BatchGenerationResult[]> {
  const pendingVariations = variations.filter(v => v.status === "pending" || v.status === "failed");

  // Count variations with custom prompts
  const customPromptCount = pendingVariations.filter(v => v.customPrompt).length;

  logger.info("Starting shot variations generation", {
    shotId,
    total: pendingVariations.length,
    withCustomPrompt: customPromptCount,
    episodeId,
  });

  const tracker = trackPerformance(`Shot ${shotId} generation`, "Replicate");

  // Utiliser processBatch pour le traitement parallèle avec retry
  const batchResult = await processBatch({
    items: pendingVariations,
    processor: async (variation) => {
      onProgress?.(variation.id, "generating");

      // SOTA BLOODWINGS: Use customPrompt if available, otherwise use base prompt
      const promptToUse = variation.customPrompt || moostikPrompt;
      
      logger.debug(`Generating variation ${variation.id}`, {
        hasCustomPrompt: !!variation.customPrompt,
        strategy: variation.strategy,
        cameraAngle: variation.cameraAngle,
      });

      const result = await generateVariation(
        promptToUse,
        variation.cameraAngle,
        episodeId,
        shotId,
        variation.id,
        referenceImages
      );

      onProgress?.(variation.id, "completed", result);

      return {
        variationId: variation.id,
        success: true,
        result,
      } as BatchGenerationResult;
    },
    concurrency: MAX_PARALLEL_GENERATIONS,
    batchDelay: GENERATION_DELAY_MS,
    onProgress: (completed, total, result) => {
      if (result instanceof Error) {
        logger.warn("Variation generation failed", { error: result.message });
      }
    },
    continueOnError: true,
  });

  tracker.finish();

  // Combiner les résultats
  const results: BatchGenerationResult[] = [
    ...batchResult.successful,
    ...batchResult.failed.map(f => ({
      variationId: pendingVariations[f.index].id,
      success: false,
      error: f.error.message,
    })),
  ];

  // Notifier les erreurs
  for (const failed of batchResult.failed) {
    const variation = pendingVariations[failed.index];
    onProgress?.(variation.id, "error", undefined, failed.error.message);
  }

  logger.info("Shot variations generation completed", {
    shotId,
    successful: batchResult.successful.length,
    failed: batchResult.failed.length,
    withCustomPrompt: customPromptCount,
    totalTime: `${batchResult.totalTime}ms`,
  });

  return results;
}

// Générer plusieurs shots en parallèle (niveau épisode)
export interface ParallelShotGeneration {
  shotId: string;
  prompt: MoostikPrompt | JsonMoostik;
  variations: Variation[];
  referenceImages?: string[];  // Images de référence pour ce shot
}

export async function generateMultipleShotsParallel(
  shots: ParallelShotGeneration[],
  episodeId: string,
  maxParallelShots: number = 3,
  onShotProgress?: (shotId: string, variationId: string, status: "generating" | "completed" | "error", result?: GenerateImageResult, error?: string) => void
): Promise<Map<string, BatchGenerationResult[]>> {
  const allResults = new Map<string, BatchGenerationResult[]>();

  logger.info("Starting multi-shot parallel generation", {
    episodeId,
    totalShots: shots.length,
    maxParallel: maxParallelShots,
  });

  const tracker = trackPerformance(`Episode ${episodeId} batch generation`, "Replicate");

  // Traiter les shots en batches parallèles
  for (let i = 0; i < shots.length; i += maxParallelShots) {
    const shotBatch = shots.slice(i, i + maxParallelShots);
    const batchNumber = Math.floor(i / maxParallelShots) + 1;

    logger.debug(`Processing shot batch ${batchNumber}`, {
      shots: shotBatch.map(s => s.shotId),
    });

    tracker.checkpoint(`Batch ${batchNumber} start`);

    const shotPromises = shotBatch.map(async (shot) => {
      const results = await generateShotVariations(
        shot.prompt,
        shot.variations,
        episodeId,
        shot.shotId,
        (variationId, status, result, error) => {
          onShotProgress?.(shot.shotId, variationId, status, result, error);
        },
        shot.referenceImages
      );

      return { shotId: shot.shotId, results };
    });

    const batchResults = await Promise.all(shotPromises);

    for (const { shotId, results } of batchResults) {
      allResults.set(shotId, results);
    }

    tracker.checkpoint(`Batch ${batchNumber} complete`);
  }

  tracker.finish();

  // Calculer les statistiques finales
  let totalSuccess = 0;
  let totalFailed = 0;
  for (const results of allResults.values()) {
    totalSuccess += results.filter(r => r.success).length;
    totalFailed += results.filter(r => !r.success).length;
  }

  logger.info("Multi-shot generation completed", {
    episodeId,
    totalShots: shots.length,
    totalSuccess,
    totalFailed,
  });

  return allResults;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GÉNÉRATION AVEC JSON MOOSTIK STANDARD
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Génère une image en utilisant le standard JSON MOOSTIK constitutionnel
 */
export async function generateWithJsonMoostik(
  jsonMoostik: JsonMoostik,
  outputPath?: { dir: string; filename: string }
): Promise<GenerateImageResult> {
  const prompt = jsonMoostikToPrompt(jsonMoostik);
  const negativePrompt = getJsonMoostikNegative(jsonMoostik);

  // Construire le prompt final avec negative
  const fullPrompt = `${prompt}. AVOID: ${negativePrompt}`;

  logger.info("Generating with JSON MOOSTIK standard", {
    type: jsonMoostik.deliverable.type,
    goal: jsonMoostik.goal,
  });

  const result = await generateImage({
    prompt: fullPrompt,
    aspectRatio: jsonMoostik.deliverable.aspect_ratio,
  });

  // Sauvegarder si un chemin est fourni
  if (outputPath) {
    await mkdir(outputPath.dir, { recursive: true });
    const localPath = path.join(outputPath.dir, outputPath.filename);

    const buffer = await withReplicateRetry(async () => {
      const response = await fetch(result.url);
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    });

    await writeFile(localPath, buffer);

    logger.debug("Image saved", { localPath });
    return { url: result.url, localPath };
  }

  return result;
}

// Génération de personnage de référence avec JSON MOOSTIK + upload Supabase
export async function generateCharacterReference(
  characterPrompt: string,
  characterId: string
): Promise<GenerateImageResult> {
  const outputDir = path.join(config.paths.references, "characters");
  await mkdir(outputDir, { recursive: true });

  logger.info("Generating character reference", { characterId });

  // Construire le prompt avec les invariants constitutionnels
  const fullPrompt = `${characterPrompt}.
    Style: Pixar-dark 3D feature-film quality, ILM-grade VFX.
    MUST INCLUDE: visible needle-like proboscis.
    Palette: obsidian black, blood red, crimson, copper accent, warm amber eyes.
    Character sheet turnaround: front, three-quarter, profile views.
    Dark gradient background, studio lighting, 8K micro-textures.
    AVOID: anime, cartoon, 2D, flat shading, proboscis not visible, cropped character, wings cut off.`;

  const result = await generateImage({
    prompt: fullPrompt,
    aspectRatio: config.generation.characterTurnaroundRatio,
  });

  const filename = `${characterId}.png`;
  const localPath = path.join(outputDir, filename);

  // Télécharger avec retry
  const buffer = await withReplicateRetry(async () => {
    const response = await fetch(result.url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  });

  // Sauvegarder localement (backup)
  await writeFile(localPath, buffer);

  // Upload vers Supabase Storage (source de vérité)
  const uploadResult = await uploadReference(buffer, "characters", characterId);
  
  let finalUrl = result.url;
  if (uploadResult.success && uploadResult.publicUrl) {
    finalUrl = uploadResult.publicUrl;
    logger.info("Character reference uploaded to Supabase", { 
      characterId, 
      url: finalUrl.substring(0, 80) + "..." 
    });
  } else {
    logger.warn("Character Supabase upload failed", { 
      characterId, 
      error: uploadResult.error 
    });
  }

  return {
    url: finalUrl,
    localPath,
  };
}

// Génération de lieu de référence avec JSON MOOSTIK + upload Supabase
export async function generateLocationReference(
  locationPrompt: string,
  locationId: string
): Promise<GenerateImageResult> {
  const outputDir = path.join(config.paths.references, "locations");
  await mkdir(outputDir, { recursive: true });

  logger.info("Generating location reference", { locationId });

  // Construire le prompt avec les invariants constitutionnels
  const fullPrompt = `${locationPrompt}.
    Style: Pixar-dark 3D feature-film quality, ILM-grade VFX.
    Architecture: Renaissance bio-organic Gothic, NO human architecture.
    Materials: chitin, resin, wing-membrane, silk threads, nectar-wax, blood-ruby.
    Lighting: bioluminescent amber/crimson lanterns, NO electric lights.
    Palette: obsidian black, blood red, crimson, copper accent, warm amber.
    Establishing shot, wide framing, atmospheric depth, 8K textures.
    AVOID: human architecture, human buildings, modern buildings, electric lights, anime, cartoon, 2D.`;

  const result = await generateImage({
    prompt: fullPrompt,
    aspectRatio: config.generation.defaultAspectRatio,
  });

  const filename = `${locationId}.png`;
  const localPath = path.join(outputDir, filename);

  // Télécharger avec retry
  const buffer = await withReplicateRetry(async () => {
    const response = await fetch(result.url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  });

  // Sauvegarder localement (backup)
  await writeFile(localPath, buffer);

  // Upload vers Supabase Storage (source de vérité)
  const uploadResult = await uploadReference(buffer, "locations", locationId);
  
  let finalUrl = result.url;
  if (uploadResult.success && uploadResult.publicUrl) {
    finalUrl = uploadResult.publicUrl;
    logger.info("Location reference uploaded to Supabase", { 
      locationId, 
      url: finalUrl.substring(0, 80) + "..." 
    });
  } else {
    logger.warn("Location Supabase upload failed", { 
      locationId, 
      error: uploadResult.error 
    });
  }

  return {
    url: finalUrl,
    localPath,
  };
}
