/**
 * MOOSTIK - Upload Reference Images to Supabase Storage
 * Uploads local reference images to Supabase Storage and updates JSON files
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BUCKET_NAME = "references";
const OUTPUT_DIR = path.join(__dirname, "../output/references");
const DATA_DIR = path.join(__dirname, "../data");

interface UploadResult {
  localPath: string;
  storagePath: string;
  publicUrl: string;
  success: boolean;
  error?: string;
}

async function uploadFile(localPath: string, storagePath: string): Promise<UploadResult> {
  try {
    // Check if file exists and is a real image (not a placeholder)
    const stats = fs.statSync(localPath);
    if (stats.size < 1000) {
      // Skip placeholder files (132 bytes)
      return {
        localPath,
        storagePath,
        publicUrl: "",
        success: false,
        error: "Placeholder file (skipped)",
      };
    }

    const fileBuffer = fs.readFileSync(localPath);
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      return {
        localPath,
        storagePath,
        publicUrl: "",
        success: false,
        error: error.message,
      };
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`;
    
    return {
      localPath,
      storagePath,
      publicUrl,
      success: true,
    };
  } catch (err) {
    return {
      localPath,
      storagePath,
      publicUrl: "",
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function uploadCharacterReferences(): Promise<Map<string, string>> {
  console.log("\n📦 Uploading character references...");
  
  const urlMap = new Map<string, string>();
  const charactersDir = path.join(OUTPUT_DIR, "characters");
  
  if (!fs.existsSync(charactersDir)) {
    console.log("  ⚠️ No characters directory found");
    return urlMap;
  }

  const files = fs.readdirSync(charactersDir).filter(f => f.endsWith(".png"));
  
  for (const file of files) {
    const localPath = path.join(charactersDir, file);
    const storagePath = `characters/${file}`;
    
    const result = await uploadFile(localPath, storagePath);
    
    if (result.success) {
      console.log(`  ✓ ${file}`);
      const characterId = file.replace(".png", "");
      urlMap.set(characterId, result.publicUrl);
    } else if (result.error !== "Placeholder file (skipped)") {
      console.log(`  ✗ ${file}: ${result.error}`);
    }
  }
  
  return urlMap;
}

async function uploadLocationReferences(): Promise<Map<string, string>> {
  console.log("\n📍 Uploading location references...");
  
  const urlMap = new Map<string, string>();
  const locationsDir = path.join(OUTPUT_DIR, "locations");
  
  if (!fs.existsSync(locationsDir)) {
    console.log("  ⚠️ No locations directory found");
    return urlMap;
  }

  const files = fs.readdirSync(locationsDir).filter(f => f.endsWith(".png"));
  
  for (const file of files) {
    const localPath = path.join(locationsDir, file);
    const storagePath = `locations/${file}`;
    
    const result = await uploadFile(localPath, storagePath);
    
    if (result.success) {
      console.log(`  ✓ ${file}`);
      // Extract location ID from filename (e.g., "fort-sang-noir-establishing.png" -> "fort-sang-noir")
      const locationId = file.replace(".png", "").replace(/-establishing|-aerial|-entrance|-atmosphere|-detail$/, "");
      const existing = urlMap.get(locationId) || "";
      // Append to existing URLs for this location
      urlMap.set(locationId, existing ? `${existing}|${result.publicUrl}` : result.publicUrl);
    } else if (result.error !== "Placeholder file (skipped)") {
      console.log(`  ✗ ${file}: ${result.error}`);
    }
  }
  
  return urlMap;
}

async function updateCharactersJson(urlMap: Map<string, string>) {
  console.log("\n📝 Updating characters.json...");
  
  const charactersPath = path.join(DATA_DIR, "characters.json");
  const characters = JSON.parse(fs.readFileSync(charactersPath, "utf-8"));
  
  let updated = 0;
  for (const char of characters) {
    const url = urlMap.get(char.id);
    if (url) {
      char.referenceImages = [url];
      updated++;
    }
  }
  
  fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2));
  console.log(`  ✓ Updated ${updated} characters with Supabase URLs`);
}

async function updateLocationsJson(urlMap: Map<string, string>) {
  console.log("\n📝 Updating locations.json...");
  
  const locationsPath = path.join(DATA_DIR, "locations.json");
  const locations = JSON.parse(fs.readFileSync(locationsPath, "utf-8"));
  
  let updated = 0;
  for (const loc of locations) {
    const urls = urlMap.get(loc.id);
    if (urls) {
      loc.referenceImages = urls.split("|");
      updated++;
    }
  }
  
  fs.writeFileSync(locationsPath, JSON.stringify(locations, null, 2));
  console.log(`  ✓ Updated ${updated} locations with Supabase URLs`);
}

async function main() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║  MOOSTIK - Upload References to Supabase   ║");
  console.log("╚════════════════════════════════════════════╝");
  
  // Upload images
  const characterUrls = await uploadCharacterReferences();
  const locationUrls = await uploadLocationReferences();
  
  // Update JSON files
  if (characterUrls.size > 0) {
    await updateCharactersJson(characterUrls);
  }
  
  if (locationUrls.size > 0) {
    await updateLocationsJson(locationUrls);
  }
  
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║          Upload Complete! 🎉               ║");
  console.log("╚════════════════════════════════════════════╝\n");
  
  console.log("📊 Summary:");
  console.log(`   Characters uploaded: ${characterUrls.size}`);
  console.log(`   Locations uploaded:  ${locationUrls.size}`);
  console.log("\n⚡ Next steps:");
  console.log("   1. Commit updated JSON files");
  console.log("   2. Push to trigger Vercel redeploy");
}

main().catch(console.error);
