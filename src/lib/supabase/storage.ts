/**
 * MOOSTIK Supabase Storage Service
 * SOTA January 2026
 * 
 * Centralise toutes les opérations de stockage d'images sur Supabase Storage.
 * Utilisé pour les images générées et les images de référence.
 */

import { createServerClient } from "./client";

// ============================================================================
// CONFIGURATION
// ============================================================================

/** Bucket pour les images générées (shots, variations) */
export const BUCKET_GENERATED_IMAGES = "generated-images";

/** Bucket pour les images de référence (personnages, lieux) */
export const BUCKET_REFERENCES = "references";

/** URL publique de Supabase */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

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
  bucket: typeof BUCKET_GENERATED_IMAGES | typeof BUCKET_REFERENCES;
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
  try {
    const supabase = createServerClient();
    
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
  try {
    const supabase = createServerClient();
    
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
  try {
    const supabase = createServerClient();
    
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
      .filter(item => item.name && !item.name.startsWith("."))
      .map(item => folder ? `${folder}/${item.name}` : item.name);
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
  try {
    const supabase = createServerClient();
    
    // Essayer de récupérer les métadonnées
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split("/").slice(0, -1).join("/"), {
        search: path.split("/").pop(),
      });
    
    if (error) return false;
    
    const fileName = path.split("/").pop();
    return data.some(item => item.name === fileName);
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
