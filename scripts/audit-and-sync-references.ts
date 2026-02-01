/**
 * MOOSTIK - Audit et Sync des Références
 * ============================================================================
 * 1. Audit des images sans prompt SOTA JSON Moostik
 * 2. Upload des images locales vers Supabase
 * 3. Mise à jour des referenceImages dans characters.json et locations.json
 * 4. Nettoyage des doublons
 * ============================================================================
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

// ============================================================================
// CONFIGURATION
// ============================================================================

const CHARACTERS_JSON_PATH = path.join(__dirname, "../data/characters.json");
const LOCATIONS_JSON_PATH = path.join(__dirname, "../data/locations.json");
const CHARACTERS_REFS_DIR = path.join(__dirname, "../output/references/characters");
const LOCATIONS_REFS_DIR = path.join(__dirname, "../output/references/locations");

// Mapping des fichiers locaux vers les IDs de personnages
const CHARACTER_FILE_TO_ID: Record<string, string> = {
  "papy-tik.png": "papy-tik",
  "papy-moostik.png": "papy-tik", // ancien nom
  "young-dorval.png": "young-dorval",
  "young-papy.png": "young-dorval", // ancien nom
  "baby-dorval.png": "baby-dorval",
  "baby-papy.png": "baby-dorval", // ancien nom
  "mama-dorval.png": "mama-dorval",
  "mama-moostik.png": "mama-dorval", // ancien nom
  "general-aedes.png": "general-aedes",
  "scholar-culex.png": "scholar-culex",
  "bartender-anopheles.png": "bartender-anopheles",
  "singer-stegomyia.png": "singer-stegomyia",
  "femme-fatale-tigresse.png": "femme-fatale-tigresse",
  "bar-girl-tigre.png": "femme-fatale-tigresse", // ancien nom
  "evil-pik.png": "evil-pik",
  "petit-t1.png": "petit-t1",
  "doc-hemoglobin.png": "doc-hemoglobin",
  "mama-zika.png": "mama-zika",
  "captain-dengue.png": "captain-dengue",
  "infiltrator-aedes-albopictus.png": "infiltrator-aedes-albopictus",
  "child-killer.png": "child-killer",
  "koko-survivor.png": "koko-survivor",
  "mila-survivor.png": "mila-survivor",
  "trez-survivor.png": "trez-survivor",
};

// Mapping des fichiers locaux vers les IDs de locations (principal seulement)
const LOCATION_FILE_TO_ID: Record<string, string> = {
  "tire-city.png": "tire-city",
  "tire-fortress.png": "tire-city", // doublon
  "fort-sang-noir.png": "fort-sang-noir",
  "bar-ti-sang.png": "bar-ti-sang",
  "ti-sang-bar.png": "bar-ti-sang", // doublon
  "academy-of-blood.png": "academy-of-blood",
  "cathedral-of-blood.png": "cathedral-of-blood",
  "cathedral-sang.png": "cathedral-of-blood", // doublon
  "genocide-memorial.png": "genocide-memorial",
  "memorial-genocide.png": "genocide-memorial", // doublon
  "nursery-pods.png": "nursery-pods",
  "creole-house-enemy.png": "creole-house-enemy",
  "cooltik-village.png": "cooltik-village",
  "martinique-house-interior.png": "martinique-house-interior",
  "martinique-house.png": "martinique-house-interior", // doublon
  "jalousies-gateway.png": "jalousies-gateway",
  "martinique-exterior-storm.png": "martinique-exterior-storm",
  "blood-bank-vault.png": "blood-bank-vault",
  "tissu-metropolis.png": "tissu-metropolis",
  "university-culex.png": "university-culex",
};

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

async function uploadToSupabase(
  localPath: string,
  bucket: string,
  remotePath: string
): Promise<string | null> {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(remotePath, fileBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      console.error(`  ❌ Upload failed for ${remotePath}:`, error.message);
      return null;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(remotePath);
    return urlData.publicUrl;
  } catch (err) {
    console.error(`  ❌ Error uploading ${localPath}:`, err);
    return null;
  }
}

// ============================================================================
// AUDIT DES PERSONNAGES
// ============================================================================

async function auditAndSyncCharacters() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║            AUDIT & SYNC - PERSONNAGES                      ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const characters = JSON.parse(fs.readFileSync(CHARACTERS_JSON_PATH, "utf-8"));
  const localFiles = fs.readdirSync(CHARACTERS_REFS_DIR);

  console.log(`📁 Fichiers locaux trouvés: ${localFiles.length}`);
  console.log(`📊 Personnages dans JSON: ${characters.length}\n`);

  // Audit: personnages sans referenceImages
  const missingRefs: string[] = [];
  const hasRefs: string[] = [];

  for (const char of characters) {
    if (!char.referenceImages || char.referenceImages.length === 0) {
      missingRefs.push(char.id);
    } else {
      hasRefs.push(char.id);
    }
  }

  console.log("✅ Personnages avec référence Supabase:", hasRefs.length);
  hasRefs.forEach((id) => console.log(`   ✓ ${id}`));

  console.log("\n❌ Personnages SANS référence Supabase:", missingRefs.length);
  missingRefs.forEach((id) => console.log(`   ✗ ${id}`));

  // Upload des images manquantes
  console.log("\n📤 Upload des images manquantes vers Supabase...\n");

  let uploaded = 0;
  let skipped = 0;

  for (const filename of localFiles) {
    const characterId = CHARACTER_FILE_TO_ID[filename];
    if (!characterId) {
      console.log(`  ⚠️  Fichier non mappé: ${filename}`);
      continue;
    }

    const character = characters.find((c: any) => c.id === characterId);
    if (!character) {
      console.log(`  ⚠️  Personnage non trouvé: ${characterId} (fichier: ${filename})`);
      continue;
    }

    // Vérifier si déjà uploadé
    if (character.referenceImages && character.referenceImages.length > 0) {
      console.log(`  ⏭️  ${characterId} - déjà sync`);
      skipped++;
      continue;
    }

    // Upload vers Supabase
    const localPath = path.join(CHARACTERS_REFS_DIR, filename);
    const remotePath = `characters/${characterId}.png`;

    console.log(`  📤 Upload: ${filename} → ${remotePath}`);
    const publicUrl = await uploadToSupabase(localPath, "references", remotePath);

    if (publicUrl) {
      character.referenceImages = [publicUrl];
      uploaded++;
      console.log(`     ✅ ${publicUrl}`);
    }
  }

  // Sauvegarder le JSON mis à jour
  fs.writeFileSync(CHARACTERS_JSON_PATH, JSON.stringify(characters, null, 2));

  console.log(`\n📊 Résultat: ${uploaded} uploadés, ${skipped} déjà sync`);

  return { uploaded, skipped, total: characters.length };
}

// ============================================================================
// AUDIT DES LOCATIONS
// ============================================================================

async function auditAndSyncLocations() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║            AUDIT & SYNC - LOCATIONS                        ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const locations = JSON.parse(fs.readFileSync(LOCATIONS_JSON_PATH, "utf-8"));
  const localFiles = fs.readdirSync(LOCATIONS_REFS_DIR);

  console.log(`📁 Fichiers locaux trouvés: ${localFiles.length}`);
  console.log(`📊 Locations dans JSON: ${locations.length}\n`);

  // Filtrer les fichiers principaux (pas les variations -aerial, -detail, etc.)
  const mainFiles = localFiles.filter(
    (f) =>
      !f.includes("-aerial") &&
      !f.includes("-atmosphere") &&
      !f.includes("-detail") &&
      !f.includes("-entrance") &&
      !f.includes("-establishing")
  );

  console.log(`📁 Fichiers principaux (sans variations): ${mainFiles.length}\n`);

  // Audit
  const missingRefs: string[] = [];
  const hasRefs: string[] = [];

  for (const loc of locations) {
    if (!loc.referenceImages || loc.referenceImages.length === 0) {
      missingRefs.push(loc.id);
    } else {
      hasRefs.push(loc.id);
    }
  }

  console.log("✅ Locations avec référence Supabase:", hasRefs.length);
  hasRefs.forEach((id) => console.log(`   ✓ ${id}`));

  console.log("\n❌ Locations SANS référence Supabase:", missingRefs.length);
  missingRefs.forEach((id) => console.log(`   ✗ ${id}`));

  // Upload des images manquantes
  console.log("\n📤 Upload des images manquantes vers Supabase...\n");

  let uploaded = 0;
  let skipped = 0;

  for (const filename of mainFiles) {
    const locationId = LOCATION_FILE_TO_ID[filename];
    if (!locationId) {
      console.log(`  ⚠️  Fichier non mappé: ${filename}`);
      continue;
    }

    const location = locations.find((l: any) => l.id === locationId);
    if (!location) {
      console.log(`  ⚠️  Location non trouvée: ${locationId} (fichier: ${filename})`);
      continue;
    }

    // Vérifier si déjà uploadé
    if (location.referenceImages && location.referenceImages.length > 0) {
      console.log(`  ⏭️  ${locationId} - déjà sync`);
      skipped++;
      continue;
    }

    // Upload vers Supabase
    const localPath = path.join(LOCATIONS_REFS_DIR, filename);
    const remotePath = `locations/${locationId}.png`;

    console.log(`  📤 Upload: ${filename} → ${remotePath}`);
    const publicUrl = await uploadToSupabase(localPath, "references", remotePath);

    if (publicUrl) {
      location.referenceImages = [publicUrl];
      uploaded++;
      console.log(`     ✅ ${publicUrl}`);
    }
  }

  // Sauvegarder le JSON mis à jour
  fs.writeFileSync(LOCATIONS_JSON_PATH, JSON.stringify(locations, null, 2));

  console.log(`\n📊 Résultat: ${uploaded} uploadés, ${skipped} déjà sync`);

  return { uploaded, skipped, total: locations.length };
}

// ============================================================================
// NETTOYAGE DES DOUBLONS
// ============================================================================

function identifyDuplicates() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║            IDENTIFICATION DES DOUBLONS                     ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const charFiles = fs.readdirSync(CHARACTERS_REFS_DIR);
  const locFiles = fs.readdirSync(LOCATIONS_REFS_DIR);

  console.log("🔍 Doublons de personnages identifiés:");
  const charDuplicates = [
    { old: "papy-moostik.png", new: "papy-tik.png", action: "RENAME" },
    { old: "young-papy.png", new: "young-dorval.png", action: "RENAME" },
    { old: "baby-papy.png", new: "baby-dorval.png", action: "RENAME" },
    { old: "mama-moostik.png", new: "mama-dorval.png", action: "RENAME" },
    { old: "bar-girl-tigre.png", new: "femme-fatale-tigresse.png", action: "RENAME" },
  ];

  for (const dup of charDuplicates) {
    const oldExists = charFiles.includes(dup.old);
    const newExists = charFiles.includes(dup.new);
    console.log(`   ${dup.old} → ${dup.new} | Old: ${oldExists ? "✓" : "✗"}, New: ${newExists ? "✓" : "✗"} | ${dup.action}`);
  }

  console.log("\n🔍 Doublons de locations identifiés:");
  const locDuplicates = [
    { old: "ti-sang-bar.png", new: "bar-ti-sang.png", action: "DELETE old" },
    { old: "cathedral-sang.png", new: "cathedral-of-blood.png", action: "DELETE old" },
    { old: "memorial-genocide.png", new: "genocide-memorial.png", action: "DELETE old" },
    { old: "tire-fortress.png", new: "tire-city.png OR fort-sang-noir.png", action: "REVIEW" },
    { old: "martinique-house.png", new: "martinique-house-interior.png", action: "DELETE old" },
  ];

  for (const dup of locDuplicates) {
    const oldExists = locFiles.includes(dup.old);
    console.log(`   ${dup.old} | Exists: ${oldExists ? "✓" : "✗"} | ${dup.action}`);
  }

  return { charDuplicates, locDuplicates };
}

// ============================================================================
// AUDIT DES PROMPTS SOTA
// ============================================================================

function auditSotaPrompts() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║            AUDIT PROMPTS SOTA JSON MOOSTIK                 ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const characters = JSON.parse(fs.readFileSync(CHARACTERS_JSON_PATH, "utf-8"));

  let sotaCount = 0;
  let legacyCount = 0;
  const needsUpdate: string[] = [];

  for (const char of characters) {
    // Un prompt SOTA doit contenir:
    // 1. "Premium 3D animated feature film" ou "Pixar-demonic"
    // 2. "THREE VIEWS" ou "turnaround sheet"
    // 3. "MUST INCLUDE"
    // 4. "matte obsidian chitin body (#0B0B0E)"

    const prompt = char.referencePrompt || "";
    const hasPixarDark = prompt.includes("Pixar-demonic") || prompt.includes("Premium 3D animated");
    const hasThreeViews = prompt.includes("THREE VIEWS") || prompt.includes("turnaround");
    const hasMustInclude = prompt.includes("MUST INCLUDE");
    const hasColorCodes = prompt.includes("#0B0B0E") || prompt.includes("#FFB25A");

    const isSota = hasPixarDark && hasThreeViews && hasMustInclude && hasColorCodes;

    if (isSota) {
      console.log(`   ✅ ${char.id} - SOTA compliant`);
      sotaCount++;
    } else {
      console.log(`   ⚠️  ${char.id} - Legacy prompt`);
      if (!hasPixarDark) console.log(`      - Manque: Pixar-demonic style`);
      if (!hasThreeViews) console.log(`      - Manque: THREE VIEWS format`);
      if (!hasMustInclude) console.log(`      - Manque: MUST INCLUDE section`);
      if (!hasColorCodes) console.log(`      - Manque: Color codes (#0B0B0E, #FFB25A)`);
      needsUpdate.push(char.id);
      legacyCount++;
    }
  }

  console.log(`\n📊 Résultat: ${sotaCount} SOTA, ${legacyCount} Legacy`);
  console.log(`📋 Personnages à mettre à jour: ${needsUpdate.join(", ") || "Aucun"}`);

  return { sotaCount, legacyCount, needsUpdate };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     MOOSTIK - AUDIT & SYNC COMPLET                         ║");
  console.log("║     Janvier 2026 - SOTA Compliance Check                   ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // 1. Audit des prompts SOTA
  const sotaAudit = auditSotaPrompts();

  // 2. Identifier les doublons
  identifyDuplicates();

  // 3. Sync personnages
  const charResult = await auditAndSyncCharacters();

  // 4. Sync locations
  const locResult = await auditAndSyncLocations();

  // Résumé final
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║                    RÉSUMÉ FINAL                            ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  console.log("📊 PROMPTS SOTA:");
  console.log(`   - Conformes: ${sotaAudit.sotaCount}`);
  console.log(`   - Legacy: ${sotaAudit.legacyCount}`);

  console.log("\n📊 PERSONNAGES:");
  console.log(`   - Uploadés: ${charResult.uploaded}`);
  console.log(`   - Déjà sync: ${charResult.skipped}`);
  console.log(`   - Total: ${charResult.total}`);

  console.log("\n📊 LOCATIONS:");
  console.log(`   - Uploadés: ${locResult.uploaded}`);
  console.log(`   - Déjà sync: ${locResult.skipped}`);
  console.log(`   - Total: ${locResult.total}`);

  console.log("\n✅ Audit et synchronisation terminés!");
}

main().catch(console.error);
