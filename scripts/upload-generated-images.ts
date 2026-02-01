/**
 * MOOSTIK - Upload Generated Images to Supabase Storage
 * Uploads all generated shot images and updates episode JSON
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BUCKET_NAME = "generated-images";
const IMAGES_DIR = path.join(__dirname, "../output/images");
const EPISODES_DIR = path.join(__dirname, "../data/episodes");

interface UploadResult {
  localPath: string;
  storagePath: string;
  publicUrl: string;
}

const uploadedUrls = new Map<string, string>();

async function uploadImage(localPath: string): Promise<UploadResult | null> {
  try {
    const stats = fs.statSync(localPath);
    if (stats.size < 1000) return null; // Skip placeholders

    // Create storage path from local path
    const relativePath = path.relative(IMAGES_DIR, localPath);
    const storagePath = relativePath.replace(/\\/g, "/");

    const fileBuffer = fs.readFileSync(localPath);
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      console.error(`  ✗ ${storagePath}: ${error.message}`);
      return null;
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`;
    
    return { localPath, storagePath, publicUrl };
  } catch (err) {
    return null;
  }
}

async function uploadAllImages() {
  console.log("\n📤 Uploading generated images...");
  
  const episodes = fs.readdirSync(IMAGES_DIR).filter(f => 
    fs.statSync(path.join(IMAGES_DIR, f)).isDirectory()
  );
  
  let uploaded = 0;
  let failed = 0;
  
  for (const episode of episodes) {
    const episodeDir = path.join(IMAGES_DIR, episode);
    console.log(`\n  📁 ${episode}`);
    
    // Find all PNG files recursively
    const findPngs = (dir: string): string[] => {
      const files: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...findPngs(fullPath));
        } else if (entry.name.endsWith(".png")) {
          files.push(fullPath);
        }
      }
      return files;
    };
    
    const pngFiles = findPngs(episodeDir);
    
    for (const file of pngFiles) {
      const result = await uploadImage(file);
      if (result) {
        uploaded++;
        uploadedUrls.set(result.localPath, result.publicUrl);
        const shortName = path.relative(IMAGES_DIR, file);
        console.log(`    ✓ ${shortName}`);
      } else {
        const stats = fs.statSync(file);
        if (stats.size >= 1000) failed++;
      }
    }
  }
  
  console.log(`\n  Uploaded: ${uploaded}, Failed: ${failed}`);
  return uploaded;
}

function updateEpisodeUrls() {
  console.log("\n📝 Updating episode URLs...");
  
  const episodeFiles = fs.readdirSync(EPISODES_DIR).filter(f => f.endsWith(".json"));
  
  for (const file of episodeFiles) {
    const filePath = path.join(EPISODES_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    let episode = JSON.parse(content);
    let updated = 0;
    
    // Update each shot's variations
    for (const shot of episode.shots || []) {
      for (const variation of shot.variations || []) {
        // Check if localPath exists and convert to Supabase URL
        if (variation.localPath) {
          const fullLocalPath = path.join(__dirname, "..", variation.localPath);
          const relativePath = variation.localPath.replace(/^\.?\/?(output\/)?images\//, "");
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${relativePath}`;
          
          variation.imageUrl = publicUrl;
          updated++;
        }
        
        // Also update if imageUrl points to /api/images/
        if (variation.imageUrl?.startsWith("/api/images/")) {
          const relativePath = variation.imageUrl.replace("/api/images/", "");
          variation.imageUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${relativePath}`;
          updated++;
        }
      }
    }
    
    fs.writeFileSync(filePath, JSON.stringify(episode, null, 2));
    console.log(`  ✓ ${file}: ${updated} URLs updated`);
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║  MOOSTIK - Upload Generated Images         ║");
  console.log("╚════════════════════════════════════════════╝");
  
  const count = await uploadAllImages();
  
  if (count > 0) {
    updateEpisodeUrls();
  }
  
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║          Done! 🎉                          ║");
  console.log("╚════════════════════════════════════════════╝");
}

main().catch(console.error);
