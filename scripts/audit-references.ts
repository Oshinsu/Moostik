/**
 * MOOSTIK - Audit References & SOTA Compliance
 * 
 * Ce script analyse l'état des références et la conformité SOTA de tous les shots.
 * Génère un rapport détaillé avec les actions recommandées.
 */

import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(__dirname, "../data");
const EPISODES_DIR = path.join(DATA_DIR, "episodes");

// ============================================================================
// TYPES
// ============================================================================

interface AuditReport {
  timestamp: string;
  characters: {
    total: number;
    withImages: number;
    validated: number;
    missing: string[];
  };
  locations: {
    total: number;
    withImages: number;
    validated: number;
    missing: string[];
  };
  episodes: EpisodeAudit[];
  summary: {
    totalShots: number;
    sotaShots: number;
    legacyShots: number;
    shotsWithRefs: number;
    shotsWithoutRefs: number;
    totalImages: number;
    imagesWithSupabaseUrl: number;
  };
}

interface EpisodeAudit {
  id: string;
  title: string;
  shots: ShotAudit[];
}

interface ShotAudit {
  id: string;
  name: string;
  isSota: boolean;
  hasCharacterRefs: boolean;
  hasLocationRefs: boolean;
  characterIds: string[];
  locationIds: string[];
  missingCharacterRefs: string[];
  missingLocationRefs: string[];
  variationsCount: number;
  completedVariations: number;
  hasSupabaseUrls: boolean;
}

// ============================================================================
// AUDIT FUNCTIONS
// ============================================================================

function loadCharacters(): any[] {
  const filePath = path.join(DATA_DIR, "characters.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function loadLocations(): any[] {
  const filePath = path.join(DATA_DIR, "locations.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function isSotaPrompt(prompt: any): boolean {
  return prompt?.task === "generate_image" && 
         prompt?.deliverable && 
         typeof prompt.deliverable === "object" &&
         prompt.deliverable.type;
}

function hasSupabaseUrl(url?: string): boolean {
  return !!url && url.includes("supabase.co");
}

function auditEpisode(episodeId: string, characters: any[], locations: any[]): EpisodeAudit {
  const filePath = path.join(EPISODES_DIR, `${episodeId}.json`);
  const episode = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  
  const characterMap = new Map(characters.map(c => [c.id, c]));
  const locationMap = new Map(locations.map(l => [l.id, l]));
  
  const shots: ShotAudit[] = [];
  
  for (const shot of episode.shots || []) {
    const characterIds = shot.characterIds || [];
    const locationIds = shot.locationIds || [];
    
    const missingCharacterRefs = characterIds.filter((id: string) => {
      const char = characterMap.get(id);
      return !char?.referenceImages || char.referenceImages.length === 0;
    });
    
    const missingLocationRefs = locationIds.filter((id: string) => {
      const loc = locationMap.get(id);
      return !loc?.referenceImages || loc.referenceImages.length === 0;
    });
    
    const completedVariations = (shot.variations || []).filter(
      (v: any) => v.status === "completed" && v.imageUrl
    );
    
    const hasSupabaseUrls = completedVariations.every(
      (v: any) => hasSupabaseUrl(v.imageUrl)
    );
    
    shots.push({
      id: shot.id,
      name: shot.name,
      isSota: isSotaPrompt(shot.prompt),
      hasCharacterRefs: missingCharacterRefs.length === 0 && characterIds.length > 0,
      hasLocationRefs: missingLocationRefs.length === 0 && locationIds.length > 0,
      characterIds,
      locationIds,
      missingCharacterRefs,
      missingLocationRefs,
      variationsCount: (shot.variations || []).length,
      completedVariations: completedVariations.length,
      hasSupabaseUrls,
    });
  }
  
  return {
    id: episode.id,
    title: episode.title,
    shots,
  };
}

function generateReport(): AuditReport {
  const characters = loadCharacters();
  const locations = loadLocations();
  
  // Character audit
  const charactersWithImages = characters.filter(
    c => c.referenceImages && c.referenceImages.length > 0
  );
  const validatedCharacters = characters.filter(c => c.validated);
  const missingCharacters = characters
    .filter(c => !c.referenceImages || c.referenceImages.length === 0)
    .map(c => c.id);
  
  // Location audit
  const locationsWithImages = locations.filter(
    l => l.referenceImages && l.referenceImages.length > 0
  );
  const validatedLocations = locations.filter(l => l.validated);
  const missingLocations = locations
    .filter(l => !l.referenceImages || l.referenceImages.length === 0)
    .map(l => l.id);
  
  // Episodes audit
  const episodeFiles = fs.readdirSync(EPISODES_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => f.replace(".json", ""));
  
  const episodes = episodeFiles.map(id => auditEpisode(id, characters, locations));
  
  // Summary
  let totalShots = 0;
  let sotaShots = 0;
  let legacyShots = 0;
  let shotsWithRefs = 0;
  let shotsWithoutRefs = 0;
  let totalImages = 0;
  let imagesWithSupabaseUrl = 0;
  
  for (const ep of episodes) {
    for (const shot of ep.shots) {
      totalShots++;
      if (shot.isSota) sotaShots++;
      else legacyShots++;
      
      if (shot.hasCharacterRefs || shot.hasLocationRefs) shotsWithRefs++;
      else if (shot.characterIds.length > 0 || shot.locationIds.length > 0) shotsWithoutRefs++;
      
      totalImages += shot.completedVariations;
      if (shot.hasSupabaseUrls) imagesWithSupabaseUrl += shot.completedVariations;
    }
  }
  
  return {
    timestamp: new Date().toISOString(),
    characters: {
      total: characters.length,
      withImages: charactersWithImages.length,
      validated: validatedCharacters.length,
      missing: missingCharacters,
    },
    locations: {
      total: locations.length,
      withImages: locationsWithImages.length,
      validated: validatedLocations.length,
      missing: missingLocations,
    },
    episodes,
    summary: {
      totalShots,
      sotaShots,
      legacyShots,
      shotsWithRefs,
      shotsWithoutRefs,
      totalImages,
      imagesWithSupabaseUrl,
    },
  };
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║  MOOSTIK - SOTA & References Audit         ║");
  console.log("╚════════════════════════════════════════════╝\n");
  
  const report = generateReport();
  
  // Print summary
  console.log("═══════════════════════════════════════════════");
  console.log("                 📊 SUMMARY");
  console.log("═══════════════════════════════════════════════\n");
  
  console.log("🦟 PERSONNAGES:");
  console.log(`   Total:        ${report.characters.total}`);
  console.log(`   With Images:  ${report.characters.withImages} (${Math.round(100 * report.characters.withImages / report.characters.total)}%)`);
  console.log(`   Validated:    ${report.characters.validated}`);
  console.log(`   Missing:      ${report.characters.missing.length}`);
  if (report.characters.missing.length > 0) {
    console.log(`   → ${report.characters.missing.join(", ")}`);
  }
  
  console.log("\n🏛️ LIEUX:");
  console.log(`   Total:        ${report.locations.total}`);
  console.log(`   With Images:  ${report.locations.withImages} (${Math.round(100 * report.locations.withImages / report.locations.total)}%)`);
  console.log(`   Validated:    ${report.locations.validated}`);
  console.log(`   Missing:      ${report.locations.missing.length}`);
  if (report.locations.missing.length > 0) {
    console.log(`   → ${report.locations.missing.join(", ")}`);
  }
  
  console.log("\n🎬 SHOTS:");
  console.log(`   Total:        ${report.summary.totalShots}`);
  console.log(`   SOTA Format:  ${report.summary.sotaShots} (${Math.round(100 * report.summary.sotaShots / report.summary.totalShots)}%)`);
  console.log(`   Legacy:       ${report.summary.legacyShots}`);
  console.log(`   With Refs:    ${report.summary.shotsWithRefs}`);
  console.log(`   Missing Refs: ${report.summary.shotsWithoutRefs}`);
  
  console.log("\n🖼️ IMAGES:");
  console.log(`   Total:        ${report.summary.totalImages}`);
  console.log(`   Supabase:     ${report.summary.imagesWithSupabaseUrl} (${Math.round(100 * report.summary.imagesWithSupabaseUrl / Math.max(1, report.summary.totalImages))}%)`);
  
  // SOTA compliance
  console.log("\n═══════════════════════════════════════════════");
  console.log("              ✅ SOTA COMPLIANCE");
  console.log("═══════════════════════════════════════════════\n");
  
  const sotaCompliance = report.summary.sotaShots === report.summary.totalShots;
  const supabaseCompliance = report.summary.imagesWithSupabaseUrl === report.summary.totalImages;
  const refsCompliance = report.characters.missing.length === 0 && report.locations.missing.length === 0;
  
  console.log(`   Prompts SOTA:     ${sotaCompliance ? "✅ 100%" : `❌ ${Math.round(100 * report.summary.sotaShots / report.summary.totalShots)}%`}`);
  console.log(`   Supabase Storage: ${supabaseCompliance ? "✅ 100%" : `❌ ${Math.round(100 * report.summary.imagesWithSupabaseUrl / Math.max(1, report.summary.totalImages))}%`}`);
  console.log(`   All References:   ${refsCompliance ? "✅ Complete" : `❌ Missing ${report.characters.missing.length + report.locations.missing.length}`}`);
  
  // Actions needed
  if (!sotaCompliance || !supabaseCompliance || !refsCompliance) {
    console.log("\n═══════════════════════════════════════════════");
    console.log("              ⚡ ACTIONS NEEDED");
    console.log("═══════════════════════════════════════════════\n");
    
    if (!sotaCompliance) {
      console.log("   1. Run: npx tsx scripts/convert-legacy-to-sota.ts");
    }
    if (!refsCompliance) {
      console.log("   2. Generate missing references via 'Galerie des Âmes' page");
      console.log(`      - Characters: ${report.characters.missing.join(", ")}`);
      console.log(`      - Locations: ${report.locations.missing.join(", ")}`);
    }
    if (!supabaseCompliance) {
      console.log("   3. Run: npx tsx scripts/upload-generated-images.ts");
    }
  } else {
    console.log("\n   🎉 All checks passed! Project is SOTA compliant.");
  }
  
  // Save report to file
  const reportPath = path.join(__dirname, "../audit-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full report saved to: audit-report.json`);
}

main();
