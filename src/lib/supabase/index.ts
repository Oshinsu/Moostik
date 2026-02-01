/**
 * MOOSTIK Supabase Module
 * Centralized exports for Supabase integration
 */

export { supabase, createServerClient } from "./client";
export type { Database, SupabaseClient } from "./client";
export type { Tables, Enums, Views } from "./database.types";

// Storage exports
export {
  uploadImage,
  uploadImageFromUrl,
  uploadVariation,
  uploadReference,
  getPublicUrl,
  deleteImage,
  listImages,
  imageExists,
  getVariationStoragePath,
  getReferenceStoragePath,
  BUCKET_GENERATED_IMAGES,
  BUCKET_REFERENCES,
} from "./storage";
export type { UploadResult, UploadOptions } from "./storage";
