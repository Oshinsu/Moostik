/**
 * MOOSTIK - Link Legacy Images to Shots
 * Updates shot variations with Supabase URLs for legacy images (shot-001.png to shot-016.png)
 */

import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = "https://yatwvcojuomvjvrxlugs.supabase.co";
const BUCKET_NAME = "generated-images";
const EPISODES_DIR = path.join(__dirname, "../data/episodes");

// Map legacy shot filenames to shot IDs (based on actual JSON IDs)
const LEGACY_SHOTS: Record<string, string> = {
  "shot-001.png": "shot-1-1769759484234",
  "shot-002.png": "shot-2-1769759484235", 
  "shot-003.png": "shot-3-1769759484235",
  "shot-004.png": "shot-4-1769759484235",
  "shot-005.png": "shot-5-1769759484235",
  "shot-006.png": "shot-6-1769759484235",
  "shot-007.png": "shot-7-1769759484235",
  "shot-008.png": "shot-8-1769759484235",
  "shot-009.png": "shot-9-1769759484235",
  "shot-010.png": "shot-10-1769759484235",
  "shot-011.png": "shot-011",
  "shot-012.png": "shot-012",
  "shot-013.png": "shot-013",
  "shot-014.png": "shot-014",
  "shot-015.png": "shot-015",
  "shot-016.png": "shot-exp-1769889794560-16",
};

function getSupabaseUrl(episodeId: string, filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${episodeId}/${filename}`;
}

function linkLegacyImages(episodeId: string) {
  console.log(`\n📝 Linking legacy images for ${episodeId}...`);
  
  const filePath = path.join(EPISODES_DIR, `${episodeId}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️ Episode file not found`);
    return;
  }
  
  const content = fs.readFileSync(filePath, "utf-8");
  const episode = JSON.parse(content);
  
  let linked = 0;
  
  for (const [filename, shotId] of Object.entries(LEGACY_SHOTS)) {
    const shot = episode.shots?.find((s: any) => s.id === shotId);
    
    if (!shot) {
      console.log(`  ⚠️ Shot ${shotId} not found`);
      continue;
    }
    
    const url = getSupabaseUrl(episodeId, filename);
    
    // If shot has no variations or all variations have no imageUrl
    if (!shot.variations || shot.variations.length === 0) {
      // Create a default variation
      shot.variations = [{
        id: `var-legacy-${shotId}`,
        cameraAngle: "wide",
        status: "completed",
        imageUrl: url,
        generatedAt: new Date().toISOString(),
      }];
      shot.status = "completed";
      linked++;
      console.log(`  ✓ ${shotId} → created variation with legacy image`);
    } else {
      // Update first variation without imageUrl
      const emptyVar = shot.variations.find((v: any) => !v.imageUrl);
      if (emptyVar) {
        emptyVar.imageUrl = url;
        emptyVar.status = "completed";
        emptyVar.generatedAt = new Date().toISOString();
        linked++;
        console.log(`  ✓ ${shotId} → updated existing variation`);
        
        // Update shot status
        const allCompleted = shot.variations.every((v: any) => v.status === "completed");
        if (allCompleted) {
          shot.status = "completed";
        }
      } else {
        // All variations have images, add the legacy as extra
        const hasLegacy = shot.variations.some((v: any) => v.id?.includes("legacy"));
        if (!hasLegacy) {
          shot.variations.push({
            id: `var-legacy-${shotId}`,
            cameraAngle: "establishing",
            status: "completed",
            imageUrl: url,
            generatedAt: new Date().toISOString(),
          });
          linked++;
          console.log(`  ✓ ${shotId} → added legacy variation`);
        }
      }
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(episode, null, 2));
  console.log(`  Total: ${linked} legacy images linked`);
}

function main() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║    MOOSTIK - Link Legacy Images            ║");
  console.log("╚════════════════════════════════════════════╝");
  
  linkLegacyImages("ep0");
  
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║          Done! 🎉                          ║");
  console.log("╚════════════════════════════════════════════╝");
}

main();
