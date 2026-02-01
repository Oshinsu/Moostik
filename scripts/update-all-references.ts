#!/usr/bin/env bun
/**
 * MOOSTIK - Mise à jour des referenceImages
 * Met à jour characters.json et locations.json avec toutes les variations générées
 */

import * as fs from "fs";
import * as path from "path";

const CHARACTERS_JSON_PATH = path.join(__dirname, "../data/characters.json");
const LOCATIONS_JSON_PATH = path.join(__dirname, "../data/locations.json");
const CHARACTERS_DIR = path.join(__dirname, "../output/references/characters");
const LOCATIONS_DIR = path.join(__dirname, "../output/references/locations");

// Base URL Supabase pour les références
const SUPABASE_BASE_URL = "https://yatwvcojuomvjvrxlugs.supabase.co/storage/v1/object/public/references";

async function updateCharacterReferences() {
  console.log("\n📦 Mise à jour des références personnages...\n");
  
  const characters = JSON.parse(fs.readFileSync(CHARACTERS_JSON_PATH, "utf-8"));
  const characterFiles = fs.readdirSync(CHARACTERS_DIR).filter(f => f.endsWith(".png"));
  
  let updated = 0;
  
  for (const char of characters) {
    // Trouver tous les fichiers pour ce personnage
    const charFiles = characterFiles.filter(f => f.startsWith(char.id));
    
    if (charFiles.length > 0) {
      // Construire les URLs (local et Supabase)
      const localUrls = charFiles.map(f => `/api/images/references/characters/${f}`);
      const supabaseUrls = charFiles.map(f => `${SUPABASE_BASE_URL}/characters/${f}`);
      
      // Garder l'URL Supabase de base si elle existe, sinon utiliser les nouvelles
      const existingSupabaseUrl = char.referenceImages?.find((url: string) => url.includes("supabase"));
      
      // Prioriser: URL Supabase de base + URLs locales des variations
      char.referenceImages = existingSupabaseUrl 
        ? [existingSupabaseUrl, ...localUrls.filter(u => !u.includes(char.id + ".png"))]
        : localUrls;
      
      console.log(`  ✅ ${char.name}: ${charFiles.length} images`);
      charFiles.forEach(f => console.log(`     - ${f}`));
      updated++;
    }
  }
  
  fs.writeFileSync(CHARACTERS_JSON_PATH, JSON.stringify(characters, null, 2));
  console.log(`\n✅ ${updated} personnages mis à jour`);
}

async function updateLocationReferences() {
  console.log("\n📍 Mise à jour des références lieux...\n");
  
  const locations = JSON.parse(fs.readFileSync(LOCATIONS_JSON_PATH, "utf-8"));
  const locationFiles = fs.readdirSync(LOCATIONS_DIR).filter(f => f.endsWith(".png"));
  
  let updated = 0;
  
  for (const loc of locations) {
    // Trouver tous les fichiers pour ce lieu
    const locFiles = locationFiles.filter(f => f.startsWith(loc.id));
    
    if (locFiles.length > 0) {
      // Construire les URLs locales
      const localUrls = locFiles.map(f => `/api/images/references/locations/${f}`);
      
      // Garder l'URL Supabase de base si elle existe
      const existingSupabaseUrl = loc.referenceImages?.find((url: string) => url.includes("supabase"));
      
      // Prioriser: URL Supabase de base + URLs locales des variations
      loc.referenceImages = existingSupabaseUrl 
        ? [existingSupabaseUrl, ...localUrls.filter(u => !u.includes(loc.id + ".png"))]
        : localUrls;
      
      console.log(`  ✅ ${loc.name}: ${locFiles.length} images`);
      locFiles.forEach(f => console.log(`     - ${f}`));
      updated++;
    }
  }
  
  fs.writeFileSync(LOCATIONS_JSON_PATH, JSON.stringify(locations, null, 2));
  console.log(`\n✅ ${updated} lieux mis à jour`);
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     MOOSTIK - Mise à jour des References                       ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  
  await updateCharacterReferences();
  await updateLocationReferences();
  
  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║                    TERMINÉ !                                   ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");
}

main().catch(console.error);
