/**
 * MOOSTIK - Fix Episode Image URLs
 * Corrects malformed Supabase URLs in episode JSON
 */

import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = "https://yatwvcojuomvjvrxlugs.supabase.co";
const BUCKET_NAME = "generated-images";
const EPISODES_DIR = path.join(__dirname, "../data/episodes");

function fixUrl(url: string): string {
  if (!url) return url;
  
  // Pattern to fix: .../generated-images//Users/pascalbeecee/Moostik/output/images/ep0/...
  // Should become: .../generated-images/ep0/...
  
  const badPattern = /.*\/generated-images\/.*\/output\/images\//;
  if (badPattern.test(url)) {
    const relativePath = url.replace(badPattern, "");
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${relativePath}`;
  }
  
  return url;
}

function fixEpisode(episodeId: string) {
  console.log(`\n📝 Fixing ${episodeId}...`);
  
  const filePath = path.join(EPISODES_DIR, `${episodeId}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️ File not found`);
    return;
  }
  
  const content = fs.readFileSync(filePath, "utf-8");
  const episode = JSON.parse(content);
  
  let fixed = 0;
  
  for (const shot of episode.shots || []) {
    for (const variation of shot.variations || []) {
      if (variation.imageUrl && variation.imageUrl.includes("/output/images/")) {
        const oldUrl = variation.imageUrl;
        variation.imageUrl = fixUrl(variation.imageUrl);
        if (oldUrl !== variation.imageUrl) {
          fixed++;
        }
      }
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(episode, null, 2));
  console.log(`  ✓ Fixed ${fixed} URLs`);
}

function main() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║    MOOSTIK - Fix Episode URLs              ║");
  console.log("╚════════════════════════════════════════════╝");
  
  const episodes = fs.readdirSync(EPISODES_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => f.replace(".json", ""));
  
  for (const ep of episodes) {
    fixEpisode(ep);
  }
  
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║          Done! 🎉                          ║");
  console.log("╚════════════════════════════════════════════╝");
}

main();
