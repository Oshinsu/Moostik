import Replicate from "replicate";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import type { CameraAngle, MoostikPrompt, Variation } from "@/types/moostik";
import { promptToText, CAMERA_ANGLES } from "@/types/moostik";
import type { JsonMoostik } from "./json-moostik-standard";
import { jsonMoostikToPrompt, getJsonMoostikNegative } from "./json-moostik-standard";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Configuration de génération parallèle
// Réduit pour éviter le rate limiting avec les images base64 volumineuses (~7-8MB chacune)
const MAX_PARALLEL_GENERATIONS = 2;
const GENERATION_DELAY_MS = 2000; // Délai plus long entre les lancements pour éviter le rate limiting

// ============================================================================
// CONVERSION D'URLS LOCALES EN BASE64
// ============================================================================

/**
 * Vérifie si une URL est locale (non-accessible par Replicate)
 */
function isLocalUrl(url: string): boolean {
  return url.startsWith('/api/images/') || 
         url.startsWith('/output/') ||
         (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:'));
}

/**
 * Convertit un chemin local en chemin de fichier absolu
 */
function localUrlToFilePath(url: string): string {
  // /api/images/references/characters/papy-tik.png -> output/references/characters/papy-tik.png
  if (url.startsWith('/api/images/')) {
    return path.join(process.cwd(), 'output', url.replace('/api/images/', ''));
  }
  // /output/... -> output/...
  if (url.startsWith('/output/')) {
    return path.join(process.cwd(), url.substring(1));
  }
  // Chemin relatif
  return path.join(process.cwd(), url);
}

/**
 * Convertit une URL locale en data URI base64
 */
async function localUrlToBase64(url: string): Promise<string | null> {
  try {
    const filePath = localUrlToFilePath(url);
    const buffer = await readFile(filePath);
    const base64 = buffer.toString('base64');
    
    // Déterminer le type MIME
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    const mimeType = mimeTypes[ext] || 'image/png';
    
    console.log(`[Replicate] Converted local image to base64: ${url}`);
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`[Replicate] Failed to convert local URL to base64: ${url}`, error);
    return null;
  }
}

/**
 * Convertit toutes les URLs locales en base64 pour Replicate
 * Les URLs publiques (http/https) sont conservées telles quelles
 */
async function convertLocalRefsToBase64(referenceImages: string[]): Promise<string[]> {
  const convertedRefs: string[] = [];
  
  for (const url of referenceImages) {
    if (isLocalUrl(url)) {
      const base64 = await localUrlToBase64(url);
      if (base64) {
        convertedRefs.push(base64);
      }
    } else {
      // URL publique - conserver telle quelle
      convertedRefs.push(url);
    }
  }
  
  return convertedRefs;
}

export interface GenerateImageOptions {
  prompt: string;
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

// Générer une seule image
export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResult> {
  const { prompt, aspectRatio = "16:9", outputFormat = "png", seed, referenceImages } = options;

  console.log("[Replicate] Generating image...");
  console.log("[Replicate] Prompt length:", prompt.length);
  
  if (referenceImages && referenceImages.length > 0) {
    console.log("[Replicate] Using", referenceImages.length, "reference images");
  }

  const input: Record<string, unknown> = {
    prompt,
    aspect_ratio: aspectRatio,
    output_format: outputFormat,
  };

  if (seed !== undefined) {
    input.seed = seed;
  }

  // Ajouter les images de référence si fournies (limite: 14 images max)
  if (referenceImages && referenceImages.length > 0) {
    // Nano Banana Pro supporte jusqu'à 14 images de référence
    const validRefs = referenceImages.filter(url => url && url.length > 0).slice(0, 14);
    if (validRefs.length > 0) {
      // Convertir les URLs locales en base64 pour que Replicate puisse les utiliser
      const convertedRefs = await convertLocalRefsToBase64(validRefs);
      if (convertedRefs.length > 0) {
        input.image_input = convertedRefs;
        console.log("[Replicate] Injecting", convertedRefs.length, "reference images into image_input");
        const localCount = validRefs.filter(isLocalUrl).length;
        if (localCount > 0) {
          console.log(`[Replicate] Converted ${localCount} local URLs to base64`);
        }
      }
    }
  }

  const output = await replicate.run("google/nano-banana-pro", { input });

  // Le output est un FileOutput avec une méthode url()
  const fileOutput = output as { url: () => string } & Blob;
  const url = fileOutput.url();

  console.log("[Replicate] Image generated:", url);

  return { url, seed };
}

// Télécharger une image localement
export async function downloadImage(
  imageUrl: string,
  episodeId: string,
  shotId: string,
  variationId: string
): Promise<string> {
  const outputDir = path.join(process.cwd(), "output", "images", episodeId, shotId);
  await mkdir(outputDir, { recursive: true });

  const filename = `${variationId}.png`;
  const localPath = path.join(outputDir, filename);

  console.log("[Download] Fetching image from:", imageUrl);

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await writeFile(localPath, buffer);

  console.log("[Download] Saved to:", localPath);

  return localPath;
}

// Générer et sauvegarder une image
export async function generateAndSave(
  prompt: string,
  episodeId: string,
  shotId: string,
  variationId: string,
  seed?: number,
  referenceImages?: string[]
): Promise<GenerateImageResult> {
  const result = await generateImage({ prompt, seed, referenceImages });
  const localPath = await downloadImage(result.url, episodeId, shotId, variationId);

  return {
    url: result.url,
    localPath,
    seed: result.seed,
  };
}

// Générer une variation spécifique d'un shot
export async function generateVariation(
  moostikPrompt: MoostikPrompt | JsonMoostik,
  angle: CameraAngle,
  episodeId: string,
  shotId: string,
  variationId: string,
  referenceImages?: string[]
): Promise<GenerateImageResult> {
  let promptText = "";
  let aspectRatio = "16:9";

  // Détecter si c'est un JsonMoostik (Standard SOTA) ou un MoostikPrompt (Ancien)
  if ("deliverable" in moostikPrompt && "goal" in moostikPrompt) {
    // C'est un JsonMoostik
    const json = moostikPrompt as JsonMoostik;
    // On peut ajuster l'angle dans le JSON avant de générer le prompt
    const updatedJson = { ...json };
    updatedJson.camera = { ...json.camera, angle: angle.replace("_", " ") };
    
    const angleToFraming: Record<string, any> = {
      extreme_wide: "extreme_wide",
      wide: "wide",
      medium: "medium",
      close_up: "close",
      extreme_close_up: "extreme_close",
      macro: "macro"
    };
    
    updatedJson.composition = { 
      ...json.composition, 
      framing: angleToFraming[angle] || "medium" 
    };
    
    promptText = jsonMoostikToPrompt(updatedJson);
    const negative = getJsonMoostikNegative(updatedJson);
    promptText = `${promptText}. AVOID: ${negative}`;
    aspectRatio = json.deliverable.aspect_ratio;
  } else {
    // C'est l'ancien format MoostikPrompt
    promptText = promptToText(moostikPrompt as MoostikPrompt, angle);
  }

  return generateAndSave(promptText, episodeId, shotId, variationId, undefined, referenceImages);
}

// Générer toutes les variations d'un shot en parallèle
export async function generateShotVariations(
  moostikPrompt: MoostikPrompt | JsonMoostik,
  variations: Variation[],
  episodeId: string,
  shotId: string,
  onProgress?: (variationId: string, status: "generating" | "completed" | "error", result?: GenerateImageResult, error?: string) => void,
  referenceImages?: string[]
): Promise<BatchGenerationResult[]> {
  const results: BatchGenerationResult[] = [];
  const pendingVariations = variations.filter(v => v.status === "pending" || v.status === "failed");

  // Traiter en batches parallèles
  for (let i = 0; i < pendingVariations.length; i += MAX_PARALLEL_GENERATIONS) {
    const batch = pendingVariations.slice(i, i + MAX_PARALLEL_GENERATIONS);

    const batchPromises = batch.map(async (variation, index) => {
      // Petit délai échelonné pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, index * GENERATION_DELAY_MS));

      onProgress?.(variation.id, "generating");

      try {
        const result = await generateVariation(
          moostikPrompt,
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
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        onProgress?.(variation.id, "error", undefined, errorMessage);

        return {
          variationId: variation.id,
          success: false,
          error: errorMessage,
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

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

  // Traiter les shots en batches parallèles
  for (let i = 0; i < shots.length; i += maxParallelShots) {
    const shotBatch = shots.slice(i, i + maxParallelShots);

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
  }

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
  
  console.log("[JsonMoostik] Generating with standard structure...");
  console.log("[JsonMoostik] Type:", jsonMoostik.deliverable.type);
  console.log("[JsonMoostik] Goal:", jsonMoostik.goal);
  
  const result = await generateImage({
    prompt: fullPrompt,
    aspectRatio: jsonMoostik.deliverable.aspect_ratio,
  });
  
  // Sauvegarder si un chemin est fourni
  if (outputPath) {
    await mkdir(outputPath.dir, { recursive: true });
    const localPath = path.join(outputPath.dir, outputPath.filename);
    
    const response = await fetch(result.url);
    const arrayBuffer = await response.arrayBuffer();
    await writeFile(localPath, Buffer.from(arrayBuffer));
    
    return { url: result.url, localPath };
  }
  
  return result;
}

// Génération de personnage de référence avec JSON MOOSTIK
export async function generateCharacterReference(
  characterPrompt: string,
  characterId: string
): Promise<GenerateImageResult> {
  const outputDir = path.join(process.cwd(), "output", "references", "characters");
  await mkdir(outputDir, { recursive: true });

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
    aspectRatio: "21:9", // Turnaround sheet
  });

  const filename = `${characterId}.png`;
  const localPath = path.join(outputDir, filename);

  const response = await fetch(result.url);
  const arrayBuffer = await response.arrayBuffer();
  await writeFile(localPath, Buffer.from(arrayBuffer));

  return {
    url: result.url,
    localPath,
  };
}

// Génération de lieu de référence avec JSON MOOSTIK
export async function generateLocationReference(
  locationPrompt: string,
  locationId: string
): Promise<GenerateImageResult> {
  const outputDir = path.join(process.cwd(), "output", "references", "locations");
  await mkdir(outputDir, { recursive: true });

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
    aspectRatio: "16:9",
  });

  const filename = `${locationId}.png`;
  const localPath = path.join(outputDir, filename);

  const response = await fetch(result.url);
  const arrayBuffer = await response.arrayBuffer();
  await writeFile(localPath, Buffer.from(arrayBuffer));

  return {
    url: result.url,
    localPath,
  };
}
