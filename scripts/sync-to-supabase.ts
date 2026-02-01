/**
 * MOOSTIK - Sync JSON Data to Supabase
 * Synchronise les données locales (characters, locations, episodes) vers Supabase
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabase/database.types";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in environment");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Map local role to database enum
function mapCharacterRole(role: string): "protagonist" | "antagonist" | "supporting" | "background" {
  const roleMap: Record<string, "protagonist" | "antagonist" | "supporting" | "background"> = {
    protagonist: "protagonist",
    antagonist: "antagonist",
    supporting: "supporting",
    background: "background",
  };
  return roleMap[role] || "supporting";
}

// Map local location type
function mapLocationType(type: string): "moostik_city" | "human_space" | "hybrid" | "natural" {
  const typeMap: Record<string, "moostik_city" | "human_space" | "hybrid" | "natural"> = {
    moostik_city: "moostik_city",
    human_space: "human_space",
    hybrid: "hybrid",
    natural: "natural",
  };
  return typeMap[type] || "moostik_city";
}

// Map scene type
function mapSceneType(type: string): Database["public"]["Enums"]["scene_type"] {
  const typeMap: Record<string, Database["public"]["Enums"]["scene_type"]> = {
    genocide: "genocide",
    survival: "survival",
    training: "training",
    planning: "planning",
    bar_scene: "bar_scene",
    battle: "battle",
    emotional: "emotional",
    establishing: "establishing",
    flashback: "flashback",
    montage: "montage",
    revelation: "revelation",
  };
  return typeMap[type] || "establishing";
}

// Map camera angle
function mapCameraAngle(angle: string): Database["public"]["Enums"]["camera_angle"] {
  const angleMap: Record<string, Database["public"]["Enums"]["camera_angle"]> = {
    macro: "macro",
    extreme_close_up: "extreme_close_up",
    close_up: "close_up",
    medium: "medium",
    wide: "wide",
    extreme_wide: "extreme_wide",
    low_angle: "low_angle",
    high_angle: "high_angle",
    dutch_angle: "dutch_angle",
    pov: "pov",
  };
  return angleMap[angle] || "medium";
}

// Map variation status
function mapVariationStatus(status: string): Database["public"]["Enums"]["variation_status"] {
  const statusMap: Record<string, Database["public"]["Enums"]["variation_status"]> = {
    pending: "pending",
    generating: "generating",
    completed: "completed",
    failed: "failed",
  };
  return statusMap[status] || "pending";
}

async function syncCharacters() {
  console.log("📦 Syncing characters...");
  
  const charactersPath = path.join(__dirname, "../data/characters.json");
  const characters = JSON.parse(fs.readFileSync(charactersPath, "utf-8"));
  
  for (const char of characters) {
    const { error } = await supabase.from("characters").upsert({
      id: char.id,
      name: char.name,
      title: char.title,
      role: mapCharacterRole(char.role),
      species: char.type || "moostik",
      age: char.age,
      physical_description: char.description,
      distinctive_features: char.visualTraits,
      personality_traits: char.personality,
      backstory: char.backstory,
      motivations: char.motivations,
      fears: char.fears,
      quotes: char.quotes,
      reference_prompt: char.referencePrompt,
      reference_images: char.referenceImages,
      relationships: char.relationships || [],
    });
    
    if (error) {
      console.error(`  ❌ Error syncing character ${char.id}:`, error.message);
    } else {
      console.log(`  ✓ ${char.name}`);
    }
  }
  
  console.log(`✅ Synced ${characters.length} characters\n`);
}

async function syncLocations() {
  console.log("📍 Syncing locations...");
  
  const locationsPath = path.join(__dirname, "../data/locations.json");
  const locations = JSON.parse(fs.readFileSync(locationsPath, "utf-8"));
  
  for (const loc of locations) {
    const { error } = await supabase.from("locations").upsert({
      id: loc.id,
      name: loc.name,
      type: mapLocationType(loc.type),
      description: loc.description,
      scale: loc.scale,
      architectural_features: loc.architecturalFeatures,
      atmosphere: loc.atmosphericElements,
      reference_prompt: loc.referencePrompt,
      reference_images: loc.referenceImages,
    });
    
    if (error) {
      console.error(`  ❌ Error syncing location ${loc.id}:`, error.message);
    } else {
      console.log(`  ✓ ${loc.name}`);
    }
  }
  
  console.log(`✅ Synced ${locations.length} locations\n`);
}

async function syncEpisode() {
  console.log("🎬 Syncing episode 0...");
  
  const episodePath = path.join(__dirname, "../data/episodes/ep0.json");
  const episode = JSON.parse(fs.readFileSync(episodePath, "utf-8"));
  
  // Sync episode
  const { error: epError } = await supabase.from("episodes").upsert({
    id: episode.id,
    number: episode.number,
    title: episode.title,
    description: episode.description,
    status: "in_production",
  });
  
  if (epError) {
    console.error(`  ❌ Error syncing episode:`, epError.message);
    return;
  }
  console.log(`  ✓ Episode: ${episode.title}`);
  
  // Sync acts
  for (const act of episode.acts || []) {
    const { error: actError } = await supabase.from("acts").upsert({
      id: act.id,
      episode_id: episode.id,
      number: act.number,
      title: act.title,
      description: act.description,
    });
    
    if (actError) {
      console.error(`  ❌ Error syncing act ${act.id}:`, actError.message);
    } else {
      console.log(`  ✓ Act ${act.number}: ${act.title}`);
    }
  }
  
  // Sync shots
  for (const shot of episode.shots || []) {
    const actId = episode.acts?.find((a: { shotIds?: string[] }) => 
      a.shotIds?.includes(shot.id) || a.shotIds?.includes(`shot-${String(shot.number).padStart(3, "0")}`)
    )?.id;
    
    const { error: shotError } = await supabase.from("shots").upsert({
      id: shot.id,
      episode_id: episode.id,
      act_id: actId,
      number: shot.number,
      name: shot.name,
      description: shot.description,
      scene_type: mapSceneType(shot.sceneType),
      status: shot.status === "completed" ? "completed" : shot.status === "in_progress" ? "in_progress" : "pending",
      prompt: shot.prompt,
    });
    
    if (shotError) {
      console.error(`  ❌ Error syncing shot ${shot.id}:`, shotError.message);
      continue;
    }
    console.log(`  ✓ Shot ${shot.number}: ${shot.name}`);
    
    // Sync shot_characters
    for (const charId of shot.characterIds || []) {
      await supabase.from("shot_characters").upsert({
        shot_id: shot.id,
        character_id: charId,
        importance: "primary",
      });
    }
    
    // Sync shot_locations
    for (const locId of shot.locationIds || []) {
      await supabase.from("shot_locations").upsert({
        shot_id: shot.id,
        location_id: locId,
      });
    }
    
    // Sync variations
    for (const variation of shot.variations || []) {
      const { error: varError } = await supabase.from("variations").upsert({
        id: variation.id,
        shot_id: shot.id,
        camera_angle: mapCameraAngle(variation.cameraAngle),
        status: mapVariationStatus(variation.status),
        image_url: variation.imageUrl,
        local_path: variation.localPath,
        generated_at: variation.generatedAt,
      });
      
      if (varError) {
        console.error(`    ❌ Error syncing variation ${variation.id}:`, varError.message);
      }
    }
  }
  
  console.log(`✅ Synced episode with ${episode.shots?.length || 0} shots\n`);
}

async function testConnection() {
  console.log("🔌 Testing Supabase connection...\n");
  
  // Test query
  const { data: characters, error } = await supabase
    .from("characters")
    .select("id, name, role")
    .limit(5);
  
  if (error) {
    console.error("❌ Connection failed:", error.message);
    return false;
  }
  
  console.log("✅ Connection successful!");
  console.log(`   Found ${characters?.length || 0} characters in database\n`);
  return true;
}

async function main() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     MOOSTIK - Supabase Sync Script         ║");
  console.log("╚════════════════════════════════════════════╝\n");
  
  const connected = await testConnection();
  
  if (!connected) {
    console.log("\nRunning initial sync...\n");
  }
  
  await syncCharacters();
  await syncLocations();
  await syncEpisode();
  
  console.log("╔════════════════════════════════════════════╗");
  console.log("║          Sync Complete! 🎉                 ║");
  console.log("╚════════════════════════════════════════════╝\n");
  
  // Final stats
  const { count: charCount } = await supabase.from("characters").select("*", { count: "exact", head: true });
  const { count: locCount } = await supabase.from("locations").select("*", { count: "exact", head: true });
  const { count: shotCount } = await supabase.from("shots").select("*", { count: "exact", head: true });
  const { count: varCount } = await supabase.from("variations").select("*", { count: "exact", head: true });
  
  console.log("📊 Database Stats:");
  console.log(`   Characters: ${charCount}`);
  console.log(`   Locations:  ${locCount}`);
  console.log(`   Shots:      ${shotCount}`);
  console.log(`   Variations: ${varCount}`);
}

main().catch(console.error);
