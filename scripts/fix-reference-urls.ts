/**
 * MOOSTIK - Fix Reference URLs
 * Update all reference URLs to use Supabase Storage
 * Remove placeholder references
 */

import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = "https://yatwvcojuomvjvrxlugs.supabase.co";
const DATA_DIR = path.join(__dirname, "../data");

// Characters that have REAL images in Supabase
const CHARACTERS_WITH_IMAGES = [
  "baby-dorval",
  "child-killer", 
  "mama-dorval",
  "koko-survivor",
  "mila-survivor",
  "trez-survivor"
];

// Locations that have REAL images in Supabase
const LOCATIONS_WITH_IMAGES = [
  "cooltik-village",
  "martinique-house-interior",
  "jalousies-gateway",
  "martinique-exterior-storm"
];

function getSupabaseUrl(type: "characters" | "locations", id: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/references/${type}/${id}.png`;
}

function fixCharacters() {
  console.log("\n📦 Fixing character reference URLs...");
  
  const filePath = path.join(DATA_DIR, "characters.json");
  const characters = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  
  let updated = 0;
  let cleared = 0;
  
  for (const char of characters) {
    if (CHARACTERS_WITH_IMAGES.includes(char.id)) {
      // Has real image - set Supabase URL
      const url = getSupabaseUrl("characters", char.id);
      if (!char.referenceImages?.includes(url)) {
        char.referenceImages = [url];
        updated++;
        console.log(`  ✓ ${char.id} → Supabase URL`);
      }
    } else {
      // No real image - clear references
      if (char.referenceImages?.length > 0 && !char.referenceImages[0]?.includes("supabase.co")) {
        char.referenceImages = [];
        cleared++;
        console.log(`  ○ ${char.id} → Cleared (no real image)`);
      }
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(characters, null, 2));
  console.log(`  Updated: ${updated}, Cleared: ${cleared}`);
}

function fixLocations() {
  console.log("\n📍 Fixing location reference URLs...");
  
  const filePath = path.join(DATA_DIR, "locations.json");
  const locations = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  
  let updated = 0;
  let cleared = 0;
  
  for (const loc of locations) {
    if (LOCATIONS_WITH_IMAGES.includes(loc.id)) {
      // Has real image - set Supabase URL
      const url = getSupabaseUrl("locations", loc.id);
      if (!loc.referenceImages?.includes(url)) {
        loc.referenceImages = [url];
        updated++;
        console.log(`  ✓ ${loc.id} → Supabase URL`);
      }
    } else {
      // No real image - clear references
      if (loc.referenceImages?.length > 0 && !loc.referenceImages[0]?.includes("supabase.co")) {
        loc.referenceImages = [];
        cleared++;
        console.log(`  ○ ${loc.id} → Cleared (no real image)`);
      }
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(locations, null, 2));
  console.log(`  Updated: ${updated}, Cleared: ${cleared}`);
}

function main() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║    MOOSTIK - Fix Reference URLs            ║");
  console.log("╚════════════════════════════════════════════╝");
  
  fixCharacters();
  fixLocations();
  
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║          Done! 🎉                          ║");
  console.log("╚════════════════════════════════════════════╝");
}

main();
