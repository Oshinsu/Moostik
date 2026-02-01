/**
 * MOOSTIK Export API
 * Backend for video export with FFmpeg
 */

import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import {
  PLATFORM_PRESETS,
  type PlatformPreset,
} from "@/lib/editor/export";

export const maxDuration = 60; // 60s max for Vercel hobby plan

// Local config interface for API (different from library ExportConfig)
interface APIExportConfig {
  video?: {
    codec?: string;
    resolution?: string;
    fps?: number;
    bitrate?: number;
    crf?: number;
    colorDepth?: string;
  };
  audio?: {
    codec?: string;
    bitrate?: number;
    sampleRate?: number;
  };
  output?: {
    container?: string;
    filename?: string;
  };
}

interface ExportRequest {
  episodeId: string;
  presetId: string;
  customConfig?: Partial<APIExportConfig>;
  inputFiles: {
    videos: string[];
    audios?: string[];
  };
  outputPath?: string;
}

interface ExportStatus {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  outputPath?: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  fileSize?: number;
}

// In-memory job tracking (would use Redis in production)
const exportJobs = new Map<string, ExportStatus>();

// Simple estimation functions
function estimateExportTime(durationSeconds: number, config: APIExportConfig): number {
  // Rough estimate: encoding takes about 2-5x real-time depending on settings
  const multiplier = config.video?.codec === "av1" ? 10 : config.video?.codec === "h265" ? 5 : 3;
  return durationSeconds * multiplier * 1000; // Return milliseconds
}

function estimateFileSize(durationSeconds: number, config: APIExportConfig): number {
  // Estimate based on bitrate or use defaults
  const videoBitrate = config.video?.bitrate || 8000; // kbps
  const audioBitrate = config.audio?.bitrate || 192; // kbps
  const totalBitrate = videoBitrate + audioBitrate;
  return Math.round((totalBitrate * durationSeconds) / 8); // Bytes
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();

    // Validate
    if (!body.episodeId || !body.presetId || !body.inputFiles?.videos?.length) {
      return NextResponse.json(
        { error: "Missing required fields: episodeId, presetId, inputFiles.videos" },
        { status: 400 }
      );
    }

    // Get preset
    const preset = PLATFORM_PRESETS.find(p => p.id === body.presetId);
    if (!preset) {
      return NextResponse.json(
        { error: `Unknown preset: ${body.presetId}` },
        { status: 400 }
      );
    }

    // Create job ID
    const jobId = `export-${body.episodeId}-${Date.now()}`;

    // Build config - extract only the fields we need to avoid type conflicts
    const config: APIExportConfig = {
      video: { 
        codec: preset.video?.codec,
        resolution: preset.video?.resolution,
        fps: preset.video?.fps,
        bitrate: preset.video?.bitrate,
        crf: preset.video?.crf,
        colorDepth: preset.video?.colorDepth?.toString(),
        ...body.customConfig?.video,
      },
      audio: { 
        codec: preset.audio?.codec,
        bitrate: preset.audio?.bitrate,
        sampleRate: preset.audio?.sampleRate,
        ...body.customConfig?.audio,
      },
      output: {
        container: (preset as { output?: { container?: string } }).output?.container || "mp4",
        filename: `${body.episodeId}-${preset.id}`,
        ...body.customConfig?.output,
      },
    };

    // Determine output path
    const outputDir = path.join(process.cwd(), "output", "exports", body.episodeId);
    await fs.mkdir(outputDir, { recursive: true });
    const outputPath = body.outputPath || path.join(outputDir, `${config.output?.filename || jobId}.${config.output?.container || "mp4"}`);

    // Initialize job status
    const status: ExportStatus = {
      id: jobId,
      status: "queued",
      progress: 0,
      outputPath,
    };
    exportJobs.set(jobId, status);

    // Start export in background
    runFFmpegExport(jobId, body.inputFiles, config, outputPath, preset);

    return NextResponse.json({
      jobId,
      status: "queued",
      estimatedTimeMs: estimateExportTime(
        body.inputFiles.videos.length * 5, // Assume 5s per video
        config
      ),
      estimatedFileSize: estimateFileSize(
        body.inputFiles.videos.length * 5,
        config
      ),
    });

  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 }
    );
  }
}

// GET - Check export status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("id");

  if (!jobId) {
    return NextResponse.json(
      { error: "Missing job ID" },
      { status: 400 }
    );
  }

  const status = exportJobs.get(jobId);
  if (!status) {
    return NextResponse.json(
      { error: "Job not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(status);
}

// Background FFmpeg export
async function runFFmpegExport(
  jobId: string,
  inputFiles: { videos: string[]; audios?: string[] },
  config: APIExportConfig,
  outputPath: string,
  preset: PlatformPreset
): Promise<void> {
  const status = exportJobs.get(jobId)!;
  status.status = "processing";
  status.startedAt = new Date().toISOString();

  try {
    // Create concat file for FFmpeg
    const concatPath = path.join(path.dirname(outputPath), `${jobId}-concat.txt`);
    const concatContent = inputFiles.videos.map(v => `file '${v}'`).join("\n");
    await fs.writeFile(concatPath, concatContent);

    // Build FFmpeg args
    const args = buildFFmpegArgs(concatPath, inputFiles.audios, config, outputPath, preset);

    console.log(`[Export] Starting FFmpeg:`, args.join(" "));

    // Run FFmpeg
    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", args, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stderr = "";

      ffmpeg.stderr?.on("data", (data: Buffer) => {
        stderr += data.toString();

        // Parse progress from FFmpeg output
        const timeMatch = stderr.match(/time=(\d+):(\d+):(\d+)/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          const mins = parseInt(timeMatch[2]);
          const secs = parseInt(timeMatch[3]);
          const totalSeconds = hours * 3600 + mins * 60 + secs;
          const estimatedTotal = inputFiles.videos.length * 5;
          status.progress = Math.min((totalSeconds / estimatedTotal) * 100, 99);
        }
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-500)}`));
        }
      });

      ffmpeg.on("error", reject);
    });

    // Get file size
    const stats = await fs.stat(outputPath);

    // Update status
    status.status = "completed";
    status.progress = 100;
    status.completedAt = new Date().toISOString();
    status.fileSize = stats.size;

    // Cleanup concat file
    await fs.unlink(concatPath).catch(() => {});

    console.log(`[Export] Completed: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

  } catch (error) {
    status.status = "failed";
    status.error = error instanceof Error ? error.message : "Export failed";
    console.error(`[Export] Failed:`, error);
  }
}

function buildFFmpegArgs(
  concatPath: string,
  audioFiles: string[] | undefined,
  config: APIExportConfig,
  outputPath: string,
  _preset: PlatformPreset
): string[] {
  const args: string[] = [
    "-y", // Overwrite
    "-f", "concat",
    "-safe", "0",
    "-i", concatPath,
  ];

  // Add audio input if provided
  if (audioFiles?.length) {
    audioFiles.forEach(audio => {
      args.push("-i", audio);
    });
  }

  // Video codec
  const videoCodec = config.video?.codec || "h264";
  const codecMap: Record<string, string> = {
    h264: "libx264",
    h265: "libx265",
    av1: "libaom-av1",
    vp9: "libvpx-vp9",
    prores_422: "prores_ks",
    prores_422hq: "prores_ks",
    prores_4444: "prores_ks",
  };
  args.push("-c:v", codecMap[videoCodec] || "libx264");

  // Resolution
  if (config.video?.resolution) {
    const resMap: Record<string, string> = {
      "720p": "1280:720",
      "1080p": "1920:1080",
      "2k": "2560:1440",
      "4k": "3840:2160",
    };
    if (resMap[config.video.resolution]) {
      args.push("-vf", `scale=${resMap[config.video.resolution]}`);
    }
  }

  // Frame rate
  if (config.video?.fps) {
    args.push("-r", config.video.fps.toString());
  }

  // Bitrate or CRF
  if (config.video?.bitrate) {
    args.push("-b:v", `${config.video.bitrate}k`);
  } else if (config.video?.crf !== undefined) {
    args.push("-crf", config.video.crf.toString());
  } else {
    args.push("-crf", "18"); // Default quality
  }

  // Pixel format for 10-bit
  if (config.video?.colorDepth === "10bit") {
    args.push("-pix_fmt", "yuv420p10le");
  } else {
    args.push("-pix_fmt", "yuv420p");
  }

  // Audio codec
  if (audioFiles?.length || config.audio?.codec) {
    const audioCodecMap: Record<string, string> = {
      aac: "aac",
      opus: "libopus",
      flac: "flac",
      mp3: "libmp3lame",
      ac3: "ac3",
    };
    args.push("-c:a", audioCodecMap[config.audio?.codec || "aac"] || "aac");

    if (config.audio?.bitrate) {
      args.push("-b:a", `${config.audio.bitrate}k`);
    }

    if (config.audio?.sampleRate) {
      args.push("-ar", config.audio.sampleRate.toString());
    }
  } else {
    args.push("-an"); // No audio
  }

  // Fast start for streaming
  if (config.output?.container === "mp4") {
    args.push("-movflags", "+faststart");
  }

  // Preset for encoding speed
  args.push("-preset", "medium");

  // Output
  args.push(outputPath);

  return args;
}
