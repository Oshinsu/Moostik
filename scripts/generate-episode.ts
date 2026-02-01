#!/usr/bin/env npx tsx
/**
 * MOOSTIK Episode Generator Script
 * Generates all images and videos for an episode
 *
 * Usage:
 *   REPLICATE_API_TOKEN=your_token npx tsx scripts/generate-episode.ts ep0
 *
 * Or with .env.local configured:
 *   npx tsx scripts/generate-episode.ts ep0
 */

import { config } from "dotenv";
import path from "path";
import fs from "fs/promises";

// Load environment variables
config({ path: path.join(process.cwd(), ".env.local") });
config({ path: path.join(process.cwd(), ".env") });

const API_BASE = process.env.API_BASE || "http://localhost:3000";
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;

interface Episode {
  id: string;
  title: string;
  shots: Shot[];
}

interface Shot {
  id: string;
  number: number;
  name: string;
  status: string;
  variations: Variation[];
  prompt: unknown;
}

interface Variation {
  id: string;
  cameraAngle: string;
  status: string;
  imageUrl?: string;
  videoUrl?: string;
  videoStatus?: string;
}

interface GenerationResult {
  success: boolean;
  generated?: number;
  errors?: number;
  total?: number;
  error?: string;
}

// ANSI colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log("");
  log(`${"═".repeat(60)}`, colors.magenta);
  log(`  ${title}`, colors.bright + colors.magenta);
  log(`${"═".repeat(60)}`, colors.magenta);
}

function logProgress(current: number, total: number, message: string) {
  const percent = Math.round((current / total) * 100);
  const bar = "█".repeat(Math.floor(percent / 5)) + "░".repeat(20 - Math.floor(percent / 5));
  log(`  [${bar}] ${percent}% - ${message}`, colors.cyan);
}

async function fetchEpisode(episodeId: string): Promise<Episode | null> {
  try {
    const response = await fetch(`${API_BASE}/api/episodes/${episodeId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch episode: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    log(`Failed to fetch episode: ${error}`, colors.red);
    return null;
  }
}

async function generateAllImages(episodeId: string): Promise<GenerationResult> {
  log("Starting batch image generation...", colors.cyan);

  try {
    const response = await fetch(`${API_BASE}/api/generate/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        episodeId,
        maxParallelShots: 3, // Generate 3 shots in parallel
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function generateVideo(
  episodeId: string,
  shotId: string,
  variationId: string,
  imageUrl: string,
  provider: string = "wan"
): Promise<{ success: boolean; videoUrl?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/video/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        episodeId,
        shotId,
        variationId,
        provider,
        waitForCompletion: true,
        config: {
          sourceImage: imageUrl,
          durationSeconds: 5,
          aspectRatio: "16:9",
          motionIntensity: 0.5,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const result = await response.json();
    return { success: true, videoUrl: result.videoUrl };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const episodeId = args[0] || "ep0";
  const skipVideos = args.includes("--skip-videos");
  const videoProvider = args.find(a => a.startsWith("--provider="))?.split("=")[1] || "wan";

  logSection("MOOSTIK EPISODE GENERATOR");

  // Check API token
  if (!REPLICATE_TOKEN) {
    log("\n❌ REPLICATE_API_TOKEN not set!", colors.red);
    log("\nTo set it:", colors.yellow);
    log("  1. Create a .env.local file with: REPLICATE_API_TOKEN=your_token", colors.reset);
    log("  2. Or run: REPLICATE_API_TOKEN=your_token npx tsx scripts/generate-episode.ts", colors.reset);
    log("\nGet your token at: https://replicate.com/account/api-tokens", colors.cyan);
    process.exit(1);
  }

  log(`\n✓ API Token configured`, colors.green);
  log(`  Episode: ${episodeId}`, colors.reset);
  log(`  Video provider: ${videoProvider}`, colors.reset);
  log(`  Skip videos: ${skipVideos}`, colors.reset);

  // Fetch episode data
  logSection("LOADING EPISODE");
  const episode = await fetchEpisode(episodeId);

  if (!episode) {
    log("❌ Failed to load episode", colors.red);
    process.exit(1);
  }

  log(`\n✓ Loaded: "${episode.title}"`, colors.green);
  log(`  Total shots: ${episode.shots.length}`, colors.reset);

  // Analyze current state
  const stats = {
    totalShots: episode.shots.length,
    totalVariations: 0,
    completedImages: 0,
    pendingImages: 0,
    failedImages: 0,
    completedVideos: 0,
    pendingVideos: 0,
  };

  for (const shot of episode.shots) {
    for (const variation of shot.variations) {
      stats.totalVariations++;
      if (variation.status === "completed" && variation.imageUrl) {
        stats.completedImages++;
        if (variation.videoStatus === "completed") {
          stats.completedVideos++;
        } else {
          stats.pendingVideos++;
        }
      } else if (variation.status === "failed") {
        stats.failedImages++;
      } else {
        stats.pendingImages++;
      }
    }
  }

  logSection("CURRENT STATUS");
  log(`\n📊 Episode Stats:`, colors.bright);
  log(`   Shots: ${stats.totalShots}`, colors.reset);
  log(`   Total variations: ${stats.totalVariations}`, colors.reset);
  log(`   ✅ Completed images: ${stats.completedImages}`, colors.green);
  log(`   ⏳ Pending images: ${stats.pendingImages}`, colors.yellow);
  log(`   ❌ Failed images: ${stats.failedImages}`, colors.red);
  log(`   🎬 Completed videos: ${stats.completedVideos}`, colors.green);
  log(`   ⏳ Pending videos: ${stats.pendingVideos}`, colors.yellow);

  // Generate images if needed
  if (stats.pendingImages > 0 || stats.failedImages > 0) {
    logSection("GENERATING IMAGES");
    log(`\n🖼️  Starting generation of ${stats.pendingImages + stats.failedImages} images...`, colors.cyan);
    log(`   This may take several minutes depending on queue...`, colors.yellow);

    const startTime = Date.now();
    const result = await generateAllImages(episodeId);
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    if (result.success) {
      log(`\n✅ Image generation complete in ${elapsed}s`, colors.green);
      log(`   Generated: ${result.generated}`, colors.green);
      log(`   Errors: ${result.errors || 0}`, result.errors ? colors.red : colors.reset);
    } else {
      log(`\n❌ Image generation failed: ${result.error}`, colors.red);
    }
  } else {
    log(`\n✅ All images already generated!`, colors.green);
  }

  // Generate videos if not skipped
  if (!skipVideos) {
    // Reload episode to get updated image URLs
    const updatedEpisode = await fetchEpisode(episodeId);
    if (!updatedEpisode) {
      log("❌ Failed to reload episode", colors.red);
      process.exit(1);
    }

    // Find variations with images but no videos
    const variationsNeedingVideos: Array<{
      shotId: string;
      shotName: string;
      variation: Variation;
    }> = [];

    for (const shot of updatedEpisode.shots) {
      for (const variation of shot.variations) {
        if (
          variation.status === "completed" &&
          variation.imageUrl &&
          variation.videoStatus !== "completed"
        ) {
          variationsNeedingVideos.push({
            shotId: shot.id,
            shotName: shot.name,
            variation,
          });
        }
      }
    }

    if (variationsNeedingVideos.length > 0) {
      logSection("GENERATING VIDEOS");
      log(`\n🎬 Starting video generation for ${variationsNeedingVideos.length} variations...`, colors.cyan);
      log(`   Provider: ${videoProvider}`, colors.reset);
      log(`   This may take 2-5 minutes per video...`, colors.yellow);

      let completed = 0;
      let failed = 0;

      for (let i = 0; i < variationsNeedingVideos.length; i++) {
        const item = variationsNeedingVideos[i];
        logProgress(i + 1, variationsNeedingVideos.length, `${item.shotName} (${item.variation.cameraAngle})`);

        const result = await generateVideo(
          episodeId,
          item.shotId,
          item.variation.id,
          item.variation.imageUrl!,
          videoProvider
        );

        if (result.success) {
          completed++;
          log(`     ✅ Video generated`, colors.green);
        } else {
          failed++;
          log(`     ❌ Failed: ${result.error}`, colors.red);
        }
      }

      log(`\n🎬 Video generation complete:`, colors.bright);
      log(`   ✅ Completed: ${completed}`, colors.green);
      log(`   ❌ Failed: ${failed}`, colors.red);
    } else {
      log(`\n✅ All videos already generated!`, colors.green);
    }
  }

  // Final summary
  logSection("GENERATION COMPLETE");

  const finalEpisode = await fetchEpisode(episodeId);
  if (finalEpisode) {
    let finalCompleted = 0;
    let finalVideos = 0;

    for (const shot of finalEpisode.shots) {
      for (const v of shot.variations) {
        if (v.status === "completed") finalCompleted++;
        if (v.videoStatus === "completed") finalVideos++;
      }
    }

    log(`\n📊 Final Stats:`, colors.bright);
    log(`   ✅ Images: ${finalCompleted}/${stats.totalVariations}`, colors.green);
    log(`   🎬 Videos: ${finalVideos}/${finalCompleted}`, colors.green);
    log(`\n🎉 Episode "${finalEpisode.title}" is ready!`, colors.bright + colors.green);
  }

  log(`\n💡 View in Library: ${API_BASE}/library`, colors.cyan);
}

main().catch((error) => {
  log(`\n❌ Fatal error: ${error}`, colors.red);
  process.exit(1);
});
