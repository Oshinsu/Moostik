/**
 * MOOSTIK Supabase Storage Service
 * SOTA January 2026
 * 
 * Centralise toutes les opérations de stockage d'images sur Supabase Storage.
 * Utilisé pour les images générées et les images de référence.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/** Bucket pour les images générées (shots, variations) */
export const BUCKET_GENERATED_IMAGES = "generated-images";

/** Bucket pour les images de référence (personnages, lieux) */
export const BUCKET_REFERENCES = "references";

/** Bucket pour les vidéos générées - SOTA Janvier 2026 */
export const BUCKET_VIDEOS = "generated-videos";

/** URL publique de Supabase */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

/** Check if Supabase is configured */
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/** Lazy-load server client to avoid import errors */
function getServerClient() {
  // Dynamic import to avoid errors when env vars are missing
  const { createServerClient } = require("./client");
  return createServerClient();
}

// ============================================================================
// TYPES
// ============================================================================

export interface UploadResult {
  success: boolean;
  publicUrl?: string;
  storagePath?: string;
  error?: string;
}

export interface UploadOptions {
  /** Bucket cible */
  bucket: typeof BUCKET_GENERATED_IMAGES | typeof BUCKET_REFERENCES | typeof BUCKET_VIDEOS;
  /** Chemin dans le bucket (ex: "ep0/shot-1/var-wide.png") */
  path: string;
  /** Type MIME du fichier */
  contentType?: string;
  /** Écraser si le fichier existe déjà */
  upsert?: boolean;
}

// ============================================================================
// FONCTIONS PRINCIPALES
// ============================================================================

/**
 * Upload une image vers Supabase Storage
 * 
 * @param imageData - Buffer ou Blob de l'image
 * @param options - Options d'upload (bucket, path, contentType)
 * @returns UploadResult avec l'URL publique si succès
 */
export async function uploadImage(
  imageData: Buffer | Blob | ArrayBuffer,
  options: UploadOptions
): Promise<UploadResult> {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    console.warn("[Supabase Storage] Not configured, skipping upload");
    return {
      success: false,
      error: "Supabase not configured",
    };
  }

  try {
    const supabase = getServerClient();
    
    const { bucket, path, contentType = "image/png", upsert = true } = options;
    
    // Convertir en format compatible si nécessaire
    const data = imageData instanceof Buffer 
      ? imageData 
      : imageData instanceof ArrayBuffer 
        ? Buffer.from(imageData)
        : imageData;
    
    // Upload vers Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, data, {
        contentType,
        upsert,
      });
    
    if (error) {
      console.error(`[Supabase Storage] Upload failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
    
    // Construire l'URL publique
    const publicUrl = getPublicUrl(bucket, path);
    
    console.log(`[Supabase Storage] Uploaded: ${bucket}/${path}`);
    
    return {
      success: true,
      publicUrl,
      storagePath: path,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Supabase Storage] Upload error: ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Upload une image depuis une URL (télécharge puis upload)
 * 
 * @param imageUrl - URL de l'image à télécharger
 * @param options - Options d'upload
 * @returns UploadResult
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    // Télécharger l'image
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch image: ${response.status} ${response.statusText}`,
      };
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Détecter le type MIME depuis l'URL ou la réponse
    const contentType = response.headers.get("content-type") || 
      (imageUrl.endsWith(".png") ? "image/png" : 
       imageUrl.endsWith(".jpg") || imageUrl.endsWith(".jpeg") ? "image/jpeg" : 
       "image/png");
    
    return uploadImage(buffer, { ...options, contentType });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Construit l'URL publique d'un fichier dans Supabase Storage
 * 
 * @param bucket - Nom du bucket
 * @param path - Chemin du fichier dans le bucket
 * @returns URL publique complète
 */
export function getPublicUrl(bucket: string, path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Supprime un fichier de Supabase Storage
 * 
 * @param bucket - Nom du bucket
 * @param path - Chemin du fichier
 * @returns true si succès
 */
export async function deleteImage(bucket: string, path: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn("[Supabase Storage] Not configured, skipping delete");
    return false;
  }

  try {
    const supabase = getServerClient();
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      console.error(`[Supabase Storage] Delete failed: ${error.message}`);
      return false;
    }
    
    console.log(`[Supabase Storage] Deleted: ${bucket}/${path}`);
    return true;
  } catch (error) {
    console.error(`[Supabase Storage] Delete error:`, error);
    return false;
  }
}

/**
 * Liste les fichiers dans un dossier de Supabase Storage
 * 
 * @param bucket - Nom du bucket
 * @param folder - Chemin du dossier (optionnel)
 * @returns Liste des chemins de fichiers
 */
export async function listImages(bucket: string, folder?: string): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    console.warn("[Supabase Storage] Not configured, returning empty list");
    return [];
  }

  try {
    const supabase = getServerClient();
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
      });
    
    if (error) {
      console.error(`[Supabase Storage] List failed: ${error.message}`);
      return [];
    }
    
    return data
      .filter((item: { name: string }) => item.name && !item.name.startsWith("."))
      .map((item: { name: string }) => folder ? `${folder}/${item.name}` : item.name);
  } catch (error) {
    console.error(`[Supabase Storage] List error:`, error);
    return [];
  }
}

/**
 * Vérifie si un fichier existe dans Supabase Storage
 * 
 * @param bucket - Nom du bucket
 * @param path - Chemin du fichier
 * @returns true si le fichier existe
 */
export async function imageExists(bucket: string, path: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const supabase = getServerClient();
    
    // Essayer de récupérer les métadonnées
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split("/").slice(0, -1).join("/"), {
        search: path.split("/").pop(),
      });
    
    if (error) return false;
    
    const fileName = path.split("/").pop();
    return data.some((item: { name: string }) => item.name === fileName);
  } catch {
    return false;
  }
}

// ============================================================================
// HELPERS POUR GÉNÉRATION D'IMAGES
// ============================================================================

/**
 * Génère le chemin de stockage pour une variation de shot
 * 
 * @param episodeId - ID de l'épisode (ex: "ep0")
 * @param shotId - ID du shot (ex: "shot-1-1234567")
 * @param variationId - ID de la variation (ex: "var-wide-1234567")
 * @returns Chemin formaté (ex: "ep0/shot-1-1234567/var-wide-1234567.png")
 */
export function getVariationStoragePath(
  episodeId: string,
  shotId: string,
  variationId: string
): string {
  return `${episodeId}/${shotId}/${variationId}.png`;
}

/**
 * Génère le chemin de stockage pour une image de référence
 * 
 * @param type - Type de référence ("characters" | "locations")
 * @param id - ID du personnage ou lieu
 * @returns Chemin formaté (ex: "characters/papy-tik.png")
 */
export function getReferenceStoragePath(
  type: "characters" | "locations",
  id: string
): string {
  return `${type}/${id}.png`;
}

/**
 * Upload une variation de shot et retourne l'URL publique
 * 
 * @param imageData - Données de l'image
 * @param episodeId - ID de l'épisode
 * @param shotId - ID du shot
 * @param variationId - ID de la variation
 * @returns UploadResult
 */
export async function uploadVariation(
  imageData: Buffer | Blob | ArrayBuffer,
  episodeId: string,
  shotId: string,
  variationId: string
): Promise<UploadResult> {
  const path = getVariationStoragePath(episodeId, shotId, variationId);
  
  return uploadImage(imageData, {
    bucket: BUCKET_GENERATED_IMAGES,
    path,
    contentType: "image/png",
    upsert: true,
  });
}

/**
 * Upload une image de référence et retourne l'URL publique
 * 
 * @param imageData - Données de l'image
 * @param type - Type de référence
 * @param id - ID du personnage ou lieu
 * @returns UploadResult
 */
export async function uploadReference(
  imageData: Buffer | Blob | ArrayBuffer,
  type: "characters" | "locations",
  id: string
): Promise<UploadResult> {
  const path = getReferenceStoragePath(type, id);
  
  return uploadImage(imageData, {
    bucket: BUCKET_REFERENCES,
    path,
    contentType: "image/png",
    upsert: true,
  });
}

// ============================================
// VIDEO UPLOAD FUNCTIONS - SOTA Janvier 2026
// ============================================

/**
 * Upload une vidéo générée vers Supabase Storage
 * 
 * @param videoData - Données de la vidéo
 * @param episodeId - ID de l'épisode
 * @param shotId - ID du shot
 * @param variationId - ID de la variation
 * @returns UploadResult avec l'URL publique
 */
export async function uploadVideo(
  videoData: Buffer | Blob | ArrayBuffer,
  episodeId: string,
  shotId: string,
  variationId: string
): Promise<UploadResult> {
  const path = `${episodeId}/${shotId}/${variationId}.mp4`;
  
  return uploadFile(videoData, {
    bucket: BUCKET_VIDEOS,
    path,
    contentType: "video/mp4",
    upsert: true,
  });
}

/**
 * Upload une vidéo depuis une URL vers Supabase Storage
 * 
 * @param videoUrl - URL de la vidéo source
 * @param episodeId - ID de l'épisode
 * @param shotId - ID du shot  
 * @param variationId - ID de la variation
 * @returns UploadResult avec l'URL publique
 */
export async function uploadVideoFromUrl(
  videoUrl: string,
  episodeId: string,
  shotId: string,
  variationId: string
): Promise<UploadResult> {
  try {
    console.log(`[VideoUpload] Downloading from: ${videoUrl}`);
    
    const response = await fetch(videoUrl);
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch video: ${response.status} ${response.statusText}`,
      };
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`[VideoUpload] Downloaded ${buffer.length} bytes, uploading to Supabase...`);
    
    return uploadVideo(buffer, episodeId, shotId, variationId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[VideoUpload] Error:`, error);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Upload générique d'un fichier vers Supabase Storage
 */
async function uploadFile(
  data: Buffer | Blob | ArrayBuffer,
  options: UploadOptions
): Promise<UploadResult> {
  const { bucket, path, contentType, upsert = true } = options;
  
  if (!isSupabaseConfigured()) {
    console.warn("[Storage] Supabase not configured, skipping upload");
    return {
      success: false,
      error: "Supabase not configured",
    };
  }
  
  try {
    // Convertir en Uint8Array pour Supabase
    let fileData: Uint8Array;
    if (Buffer.isBuffer(data)) {
      fileData = new Uint8Array(data);
    } else if (data instanceof ArrayBuffer) {
      fileData = new Uint8Array(data);
    } else {
      fileData = new Uint8Array(await data.arrayBuffer());
    }
    
    const supabase = getServerClient();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, fileData, {
        contentType,
        upsert,
      });

    if (uploadError) {
      console.error(`[Storage] Upload error for ${bucket}/${path}:`, uploadError);
      return {
        success: false,
        error: uploadError.message,
      };
    }
    
    const publicUrl = getPublicUrl(bucket, path);
    console.log(`[Storage] Uploaded to ${bucket}/${path} -> ${publicUrl}`);
    
    return {
      success: true,
      publicUrl,
      storagePath: path,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Storage] Error uploading to ${bucket}/${path}:`, error);
    return {
      success: false,
      error: message,
    };
  }
}
