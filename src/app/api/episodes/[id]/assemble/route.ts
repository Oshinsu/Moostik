/**
 * MOOSTIK Episode Assembly API
 * Combines shots, audio, and effects into final episode
 */

import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { getEpisode } from "@/lib/storage";

export const maxDuration = 600; // 10 minutes

interface AssemblyRequest {
  shotIds?: string[]; // If not provided, assembles all shots
  includeAudio?: boolean;
  includeSubtitles?: boolean;
  preset?: "draft" | "standard" | "high" | "master";
  transitions?: {
    type: "cut" | "fade" | "dissolve" | "wipe";
    duration: number; // seconds
  };
  music?: {
    url: string;
    volume: number; // 0-1
    fadeIn?: number;
    fadeOut?: number;
  };
  outputFormat?: "mp4" | "mov" | "webm";
}

interface AssemblyStatus {
  id: string;
  episodeId: string;
  status: "queued" | "preparing" | "assembling" | "encoding" | "completed" | "failed";
  progress: number;
  currentStep: string;
  outputPath?: string;
  error?: string;
  stats?: {
    shotCount: number;
    totalDuration: number;
    fileSize: number;
  };
}

// In-memory job tracking
const assemblyJobs = new Map<string, AssemblyStatus>();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: episodeId } = await params;
    const body: AssemblyRequest = await request.json();

    // Get episode
    const episode = await getEpisode(episodeId);
    if (!episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    // Filter shots
    let shots = episode.shots;
    if (body.shotIds?.length) {
      shots = shots.filter(s => body.shotIds!.includes(s.id));
    }

    // Filter to completed shots only
    const completedShots = shots.filter(s => {
      const hasCompletedVariation = s.variations.some(v => v.status === "completed" && v.imageUrl);
      return hasCompletedVariation;
    });

    if (completedShots.length === 0) {
      return NextResponse.json(
        { error: "No completed shots to assemble" },
        { status: 400 }
      );
    }

    // Create job
    const jobId = `assemble-${episodeId}-${Date.now()}`;
    const outputDir = path.join(process.cwd(), "output", "episodes", episodeId);
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `EP${episode.number}-${body.preset || "standard"}.${body.outputFormat || "mp4"}`);

    const status: AssemblyStatus = {
      id: jobId,
      episodeId,
      status: "queued",
      progress: 0,
      currentStep: "Initializing",
    };
    assemblyJobs.set(jobId, status);

    // Start assembly in background
    runAssembly(jobId, episode, completedShots, body, outputPath);

    return NextResponse.json({
      jobId,
      shotCount: completedShots.length,
      estimatedDuration: completedShots.length * 5, // Assume 5s per shot
    });

  } catch (error) {
    console.error("Assembly error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Assembly failed" },
      { status: 500 }
    );
  }
}

// GET - Check assembly status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  const { id: episodeId } = await params;

  if (jobId) {
    const status = assemblyJobs.get(jobId);
    if (!status) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json(status);
  }

  // List all jobs for this episode
  const episodeJobs = Array.from(assemblyJobs.entries())
    .filter(([, s]) => s.episodeId === episodeId)
    .map(([, s]) => s);

  return NextResponse.json({ jobs: episodeJobs });
}

interface Shot {
  id: string;
  number: number;
  name: string;
  variations: { status: string; imageUrl?: string; localPath?: string }[];
}

interface Episode {
  id: string;
  number: number;
  title: string;
  shots: Shot[];
}

async function runAssembly(
  jobId: string,
  episode: Episode,
  shots: Shot[],
  config: AssemblyRequest,
  outputPath: string
): Promise<void> {
  const status = assemblyJobs.get(jobId)!;

  try {
    status.status = "preparing";
    status.currentStep = "Preparing shot files";
    status.progress = 5;

    // Create temp directory for assembly
    const tempDir = path.join(process.cwd(), "tmp", "assembly", jobId);
    await fs.mkdir(tempDir, { recursive: true });

    // Collect video files (or generate from images)
    const videoFiles: string[] = [];

    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      const variation = shot.variations.find(v => v.status === "completed" && (v.imageUrl || v.localPath));

      if (!variation) continue;

      status.progress = 5 + Math.floor((i / shots.length) * 20);
      status.currentStep = `Preparing shot ${i + 1}/${shots.length}`;

      // Get or generate video for this shot
      let videoPath: string;

      if (variation.localPath?.endsWith(".mp4")) {
        // Already a video
        videoPath = variation.localPath;
      } else {
        // Image - create a 5-second video from it
        const imagePath = variation.localPath || await downloadFile(variation.imageUrl!, tempDir, `shot-${shot.number}.png`);
        videoPath = path.join(tempDir, `shot-${shot.number}.mp4`);

        await createVideoFromImage(imagePath, videoPath, 5); // 5 seconds
      }

      videoFiles.push(videoPath);
    }

    if (videoFiles.length === 0) {
      throw new Error("No video files to assemble");
    }

    status.status = "assembling";
    status.currentStep = "Concatenating shots";
    status.progress = 30;

    // Create concat file
    const concatPath = path.join(tempDir, "concat.txt");
    const concatContent = videoFiles.map(f => `file '${f}'`).join("\n");
    await fs.writeFile(concatPath, concatContent);

    // Build FFmpeg command
    const ffmpegArgs = buildAssemblyFFmpegArgs(concatPath, config, outputPath, tempDir);

    status.status = "encoding";
    status.currentStep = "Encoding final video";
    status.progress = 50;

    // Run FFmpeg
    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", ffmpegArgs, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stderr = "";

      ffmpeg.stderr?.on("data", (data: Buffer) => {
        stderr += data.toString();

        // Parse progress
        const frameMatch = stderr.match(/frame=\s*(\d+)/);
        if (frameMatch) {
          const frame = parseInt(frameMatch[1]);
          const estimatedFrames = shots.length * 5 * 24; // 5s per shot, 24fps
          const encodingProgress = Math.min((frame / estimatedFrames) * 100, 99);
          status.progress = 50 + Math.floor(encodingProgress * 0.45);
        }
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg failed: ${stderr.slice(-500)}`));
        }
      });

      ffmpeg.on("error", reject);
    });

    // Get stats
    const stats = await fs.stat(outputPath);

    status.status = "completed";
    status.progress = 100;
    status.currentStep = "Complete";
    status.outputPath = outputPath;
    status.stats = {
      shotCount: shots.length,
      totalDuration: shots.length * 5,
      fileSize: stats.size,
    };

    // Cleanup temp files
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

    console.log(`[Assembly] Completed: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

  } catch (error) {
    status.status = "failed";
    status.error = error instanceof Error ? error.message : "Assembly failed";
    console.error("[Assembly] Failed:", error);
  }
}

async function downloadFile(url: string, dir: string, filename: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${url}`);
  }

  const buffer = await response.arrayBuffer();
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, Buffer.from(buffer));

  return filePath;
}

async function createVideoFromImage(imagePath: string, outputPath: string, duration: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-loop", "1",
      "-i", imagePath,
      "-c:v", "libx264",
      "-t", duration.toString(),
      "-pix_fmt", "yuv420p",
      "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2",
      "-r", "24",
      outputPath,
    ]);

    let stderr = "";
    ffmpeg.stderr?.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Image to video failed: ${stderr.slice(-200)}`));
      }
    });

    ffmpeg.on("error", reject);
  });
}

function buildAssemblyFFmpegArgs(
  concatPath: string,
  config: AssemblyRequest,
  outputPath: string,
  tempDir: string
): string[] {
  const args: string[] = [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concatPath,
  ];

  // Add music if provided
  if (config.music?.url) {
    args.push("-i", config.music.url);
  }

  // Video settings based on preset
  const presetSettings = {
    draft: { crf: "28", preset: "ultrafast" },
    standard: { crf: "23", preset: "medium" },
    high: { crf: "18", preset: "slow" },
    master: { crf: "15", preset: "veryslow" },
  };

  const preset = presetSettings[config.preset || "standard"];

  args.push(
    "-c:v", "libx264",
    "-crf", preset.crf,
    "-preset", preset.preset,
    "-pix_fmt", "yuv420p",
  );

  // Audio
  if (config.music?.url) {
    args.push(
      "-c:a", "aac",
      "-b:a", "192k",
      "-filter_complex", `[1:a]volume=${config.music.volume || 0.5}[music];[music]afade=t=in:st=0:d=${config.music.fadeIn || 2},afade=t=out:st=${config.music.fadeOut ? -config.music.fadeOut : -2}:d=${config.music.fadeOut || 2}[audio]`,
      "-map", "0:v",
      "-map", "[audio]",
    );
  } else {
    args.push("-an"); // No audio
  }

  // Container settings
  if (config.outputFormat === "mp4" || !config.outputFormat) {
    args.push("-movflags", "+faststart");
  }

  args.push(outputPath);

  return args;
}
