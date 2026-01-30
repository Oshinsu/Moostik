/**
 * MOOSTIK - URL Utilities
 *
 * Utilitaires centralisés pour la gestion des URLs.
 * Évite la duplication de code entre les différents modules.
 */

import path from "path";
import { readFile } from "fs/promises";
import { base64Cache, getOrSet } from "./cache";

// ============================================================================
// TYPES
// ============================================================================

export interface Base64Result {
  dataUri: string;
  mimeType: string;
  size: number;
}

// ============================================================================
// URL DETECTION
// ============================================================================

/**
 * Vérifie si une URL est locale (non-accessible directement par des services externes)
 */
export function isLocalUrl(url: string): boolean {
  return (
    url.startsWith("/api/images/") ||
    url.startsWith("/output/") ||
    (!url.startsWith("http://") &&
      !url.startsWith("https://") &&
      !url.startsWith("data:"))
  );
}

/**
 * Vérifie si une URL est une data URI base64
 */
export function isBase64DataUri(url: string): boolean {
  return url.startsWith("data:");
}

/**
 * Vérifie si une URL est une URL publique HTTP(S)
 */
export function isPublicUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

// ============================================================================
// PATH CONVERSION
// ============================================================================

/**
 * Convertit une URL locale en chemin de fichier absolu
 */
export function localUrlToFilePath(url: string): string {
  const cwd = process.cwd();

  // /api/images/references/characters/papy-tik.png -> output/references/characters/papy-tik.png
  if (url.startsWith("/api/images/")) {
    return path.join(cwd, "output", url.replace("/api/images/", ""));
  }

  // /output/... -> output/...
  if (url.startsWith("/output/")) {
    return path.join(cwd, url.substring(1));
  }

  // Chemin relatif ou déjà absolu
  if (path.isAbsolute(url)) {
    return url;
  }

  return path.join(cwd, url);
}

/**
 * Convertit un chemin de fichier local en URL API
 */
export function filePathToApiUrl(filePath: string): string {
  const cwd = process.cwd();
  const outputDir = path.join(cwd, "output");

  // Si le chemin est dans output/, le convertir en /api/images/
  if (filePath.startsWith(outputDir)) {
    const relativePath = filePath.substring(outputDir.length);
    return `/api/images${relativePath.replace(/\\/g, "/")}`;
  }

  // Sinon retourner le chemin tel quel (pour les URLs externes)
  return filePath;
}

// ============================================================================
// BASE64 CONVERSION
// ============================================================================

/** Map des extensions vers les types MIME */
const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

/**
 * Détermine le type MIME à partir de l'extension
 */
export function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

/**
 * Convertit une URL locale en data URI base64
 * Utilise le cache pour éviter les lectures répétées
 */
export async function localUrlToBase64(url: string): Promise<Base64Result | null> {
  const cacheKey = `base64:${url}`;

  // Vérifier le cache
  const cached = base64Cache.get(cacheKey);
  if (cached) {
    // Reconstruire le résultat depuis le cache
    const mimeMatch = cached.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
    return {
      dataUri: cached,
      mimeType,
      size: cached.length,
    };
  }

  try {
    const filePath = localUrlToFilePath(url);
    const buffer = await readFile(filePath);
    const base64 = buffer.toString("base64");
    const mimeType = getMimeType(filePath);
    const dataUri = `data:${mimeType};base64,${base64}`;

    // Mettre en cache
    base64Cache.set(cacheKey, dataUri);

    console.log(`[URL Utils] Converted local image to base64: ${url} (${buffer.length} bytes)`);

    return {
      dataUri,
      mimeType,
      size: buffer.length,
    };
  } catch (error) {
    console.error(`[URL Utils] Failed to convert local URL to base64: ${url}`, error);
    return null;
  }
}

/**
 * Convertit plusieurs URLs locales en base64 en parallèle
 */
export async function convertLocalRefsToBase64(urls: string[]): Promise<string[]> {
  const results = await Promise.all(
    urls.map(async (url) => {
      if (isBase64DataUri(url)) {
        // Déjà en base64
        return url;
      }

      if (isLocalUrl(url)) {
        const result = await localUrlToBase64(url);
        return result?.dataUri || null;
      }

      // URL publique - conserver telle quelle
      return url;
    })
  );

  // Filtrer les nulls
  return results.filter((url): url is string => url !== null);
}

// ============================================================================
// URL VALIDATION & NORMALIZATION
// ============================================================================

/**
 * Normalise une URL (supprime les doublons de slashes, etc.)
 */
export function normalizeUrl(url: string): string {
  // Supprimer les espaces
  let normalized = url.trim();

  // Gérer les doublons de slashes (sauf après le protocole)
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    const [protocol, rest] = normalized.split("://");
    normalized = `${protocol}://${rest.replace(/\/+/g, "/")}`;
  } else {
    normalized = normalized.replace(/\/+/g, "/");
  }

  return normalized;
}

/**
 * Vérifie si une URL est valide et accessible
 */
export async function isUrlAccessible(url: string): Promise<boolean> {
  if (isLocalUrl(url)) {
    try {
      const filePath = localUrlToFilePath(url);
      await readFile(filePath);
      return true;
    } catch {
      return false;
    }
  }

  if (isPublicUrl(url)) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }

  return false;
}

// ============================================================================
// BATCH URL PROCESSING
// ============================================================================

/**
 * Prépare les URLs pour Replicate (conversion base64 si nécessaire)
 */
export async function prepareUrlsForReplicate(
  urls: string[],
  maxCount: number = 14
): Promise<{
  convertedUrls: string[];
  localCount: number;
  publicCount: number;
  failedCount: number;
}> {
  const validUrls = urls.filter((url) => url && url.length > 0).slice(0, maxCount);

  let localCount = 0;
  let publicCount = 0;
  let failedCount = 0;

  const convertedUrls: string[] = [];

  for (const url of validUrls) {
    if (isBase64DataUri(url)) {
      convertedUrls.push(url);
      localCount++;
    } else if (isLocalUrl(url)) {
      const result = await localUrlToBase64(url);
      if (result) {
        convertedUrls.push(result.dataUri);
        localCount++;
      } else {
        failedCount++;
      }
    } else if (isPublicUrl(url)) {
      convertedUrls.push(url);
      publicCount++;
    } else {
      failedCount++;
    }
  }

  return {
    convertedUrls,
    localCount,
    publicCount,
    failedCount,
  };
}
