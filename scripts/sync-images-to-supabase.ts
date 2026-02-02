#!/usr/bin/env npx tsx
/**
 * MOOSTIK - Sync Local Images to Supabase Storage
 * Téléverse toutes les images locales vers Supabase Storage
 * 
 * SOTA Février 2026
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in environment");
  console.log("   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Buckets
const BUCKET_REFERENCES = "references";
const BUCKET_GENERATED = "generated-images";

// Stats
const stats = {
  uploaded: 0,
  skipped: 0,
  failed: 0,
  total: 0,
};

/**
 * Ensure bucket exists
 */
async function ensureBucketExists(bucketName: string): Promise<boolean> {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error(`❌ Failed to list buckets:`, error.message);
    return false;
  }
  
  const exists = buckets?.some(b => b.name === bucketName);
  
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    });
    
    if (createError && !createError.message.includes("already exists")) {
      console.error(`❌ Failed to create bucket ${bucketName}:`, createError.message);
      return false;
    }
    
    console.log(`✓ Created bucket: ${bucketName}`);
  }
  
  return true;
}

/**
 * Check if file exists in bucket
 */
async function fileExists(bucket: string, path: string): Promise<boolean> {
  const { data } = await supabase.storage.from(bucket).list(
    path.split("/").slice(0, -1).join("/") || "",
    { search: path.split("/").pop() }
  );
  
  return (data?.length ?? 0) > 0 && data?.some(f => f.name === path.split("/").pop());
}

/**
 * Upload a single file
 */
async function uploadFile(
  localPath: string,
  bucket: string,
  storagePath: string,
  overwrite: boolean = false
): Promise<{ success: boolean; url?: string }> {
  stats.total++;
  
  // Check if file exists locally
  if (!fs.existsSync(localPath)) {
    console.log(`  ⚠️ File not found: ${localPath}`);
    stats.skipped++;
    return { success: false };
  }
  
  // Check if already uploaded (unless overwrite)
  if (!overwrite && await fileExists(bucket, storagePath)) {
    // console.log(`  ⏭️ Already exists: ${storagePath}`);
    stats.skipped++;
    const url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
    return { success: true, url };
  }
  
  try {
    const fileBuffer = fs.readFileSync(localPath);
    const contentType = localPath.endsWith(".png") ? "image/png" : 
                       localPath.endsWith(".jpg") || localPath.endsWith(".jpeg") ? "image/jpeg" :
                       "application/octet-stream";
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: overwrite,
      });
    
    if (error) {
      if (error.message.includes("already exists")) {
        stats.skipped++;
        const url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
        return { success: true, url };
      }
      console.error(`  ❌ Upload failed: ${storagePath} - ${error.message}`);
      stats.failed++;
      return { success: false };
    }
    
    const url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
    console.log(`  ✅ Uploaded: ${storagePath}`);
    stats.uploaded++;
    return { success: true, url };
    
  } catch (error) {
    console.error(`  ❌ Error: ${storagePath}`, error);
    stats.failed++;
    return { success: false };
  }
}

/**
 * Sync character reference images
 */
async function syncCharacterImages(): Promise<Map<string, string>> {
  console.log("\n📸 Syncing character reference images...");
  
  const urlMap = new Map<string, string>();
  const charsDir = path.join(__dirname, "../output/references/characters");
  
  if (!fs.existsSync(charsDir)) {
    console.log("  ⚠️ Characters directory not found");
    return urlMap;
  }
  
  const files = fs.readdirSync(charsDir).filter(f => f.endsWith(".png"));
  console.log(`  Found ${files.length} character images`);
  
  for (const file of files) {
    const localPath = path.join(charsDir, file);
    const storagePath = `characters/${file}`;
    const charId = file.replace(".png", "");
    
    const result = await uploadFile(localPath, BUCKET_REFERENCES, storagePath);
    if (result.url) {
      urlMap.set(charId, result.url);
    }
  }
  
  return urlMap;
}

/**
 * Sync location reference images
 */
async function syncLocationImages(): Promise<Map<string, string>> {
  console.log("\n🏛️ Syncing location reference images...");
  
  const urlMap = new Map<string, string>();
  const locsDir = path.join(__dirname, "../output/references/locations");
  
  if (!fs.existsSync(locsDir)) {
    console.log("  ⚠️ Locations directory not found");
    return urlMap;
  }
  
  const files = fs.readdirSync(locsDir).filter(f => f.endsWith(".png"));
  console.log(`  Found ${files.length} location images`);
  
  for (const file of files) {
    const localPath = path.join(locsDir, file);
    const storagePath = `locations/${file}`;
    const locId = file.replace(".png", "");
    
    const result = await uploadFile(localPath, BUCKET_REFERENCES, storagePath);
    if (result.url) {
      urlMap.set(locId, result.url);
    }
  }
  
  return urlMap;
}

/**
 * Update database references with Supabase URLs
 */
async function updateDatabaseUrls(
  charUrls: Map<string, string>,
  locUrls: Map<string, string>
): Promise<void> {
  console.log("\n📝 Updating database references...");
  
  // Update characters
  let charUpdated = 0;
  for (const [charId, url] of charUrls) {
    const { error } = await supabase
      .from("characters")
      .update({ reference_images: [url] })
      .eq("id", charId);
    
    if (!error) charUpdated++;
  }
  console.log(`  ✅ Updated ${charUpdated} characters with Supabase URLs`);
  
  // Update locations
  let locUpdated = 0;
  for (const [locId, url] of locUrls) {
    const baseId = locId.split("-").slice(0, -1).join("-") || locId;
    const { error } = await supabase
      .from("locations")
      .update({ 
        reference_images: supabase.rpc("array_append_unique", { 
          arr: "reference_images", 
          val: url 
        }) 
      })
      .eq("id", baseId);
    
    if (!error) locUpdated++;
  }
  console.log(`  ✅ Updated ${locUpdated} locations with Supabase URLs`);
}

/**
 * Main sync function
 */
async function main(): Promise<void> {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   MOOSTIK - Sync Images to Supabase Storage            ║");
  console.log("║   SOTA Février 2026                                    ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  
  // Test connection
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("\n❌ Failed to connect to Supabase:", error.message);
    process.exit(1);
  }
  console.log(`\n✅ Connected to Supabase (${data?.length} buckets found)`);
  
  // Ensure buckets exist
  await ensureBucketExists(BUCKET_REFERENCES);
  await ensureBucketExists(BUCKET_GENERATED);
  
  // Sync images
  const charUrls = await syncCharacterImages();
  const locUrls = await syncLocationImages();
  
  // Update database
  if (charUrls.size > 0 || locUrls.size > 0) {
    await updateDatabaseUrls(charUrls, locUrls);
  }
  
  // Final stats
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║                    Sync Complete! 🎉                   ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log("\n📊 Summary:");
  console.log(`   Total files:  ${stats.total}`);
  console.log(`   Uploaded:     ${stats.uploaded}`);
  console.log(`   Skipped:      ${stats.skipped} (already exist)`);
  console.log(`   Failed:       ${stats.failed}`);
  
  console.log("\n🔗 Supabase URLs:");
  console.log(`   References: ${supabaseUrl}/storage/v1/object/public/${BUCKET_REFERENCES}/`);
  console.log(`   Generated:  ${supabaseUrl}/storage/v1/object/public/${BUCKET_GENERATED}/`);
}

main().catch(console.error);
