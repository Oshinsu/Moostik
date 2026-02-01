/**
 * MOOSTIK SOTA Export System
 * January 2026 Export Standards
 *
 * Supports:
 * - All modern codecs (AV1, H.265/HEVC, H.264, VP9, ProRes)
 * - HDR formats (HDR10, HDR10+, Dolby Vision, HLG)
 * - Multi-platform presets
 * - Batch export
 * - Cloud rendering
 */

import type { EditorProject, Resolution, AspectRatioPreset } from "./types";

// ============================================
// CODEC & FORMAT CONFIGURATION
// ============================================

export type VideoCodec =
  | "h264"             // AVC - Universal compatibility
  | "h265"             // HEVC - Better compression
  | "av1"              // AOMedia - Best compression, future standard
  | "vp9"              // Google - YouTube native
  | "prores_422"       // Apple - Editing
  | "prores_422_hq"    // Apple - High quality editing
  | "prores_4444"      // Apple - With alpha
  | "prores_raw"       // Apple - Camera raw
  | "dnxhd"            // Avid - Professional
  | "dnxhr"            // Avid - High resolution
  | "cineform"         // GoPro - Intermediate
  | "gif"              // Animated GIF
  | "webp"             // Animated WebP
  | "apng";            // Animated PNG

export type AudioCodec =
  | "aac"              // Universal
  | "opus"             // Best for streaming
  | "flac"             // Lossless
  | "wav"              // Uncompressed
  | "mp3"              // Legacy compatibility
  | "ac3"              // Dolby Digital
  | "eac3"             // Dolby Digital Plus
  | "truehd"           // Dolby TrueHD
  | "dts"              // DTS
  | "dts_hd"           // DTS-HD Master Audio
  | "alac";            // Apple Lossless

export type ContainerFormat =
  | "mp4"
  | "mov"
  | "webm"
  | "mkv"
  | "avi"
  | "mxf"
  | "ts"
  | "m3u8"             // HLS
  | "mpd";             // DASH

export type HDRFormat =
  | "sdr"              // Standard Dynamic Range
  | "hdr10"            // Static metadata
  | "hdr10plus"        // Dynamic metadata (Samsung)
  | "dolby_vision"     // Dynamic metadata (Dolby)
  | "hlg";             // Hybrid Log-Gamma (broadcast)

// ============================================
// EXPORT CONFIGURATION
// ============================================

export interface ExportConfig {
  /** Output filename (without extension) */
  filename: string;

  /** Output directory */
  outputDir: string;

  /** Video settings */
  video: VideoExportSettings;

  /** Audio settings */
  audio: AudioExportSettings;

  /** Container format */
  container: ContainerFormat;

  /** Export range (null = full timeline) */
  range?: { start: number; end: number };

  /** Render queue priority */
  priority: "low" | "normal" | "high";

  /** Use cloud rendering */
  useCloudRendering: boolean;

  /** GPU acceleration */
  gpuAcceleration: GPUAcceleration;

  /** Metadata */
  metadata?: ExportMetadata;

  /** Chapter markers */
  includeChapters: boolean;

  /** Subtitles */
  subtitles?: SubtitleExportConfig;
}

export interface VideoExportSettings {
  /** Video codec */
  codec: VideoCodec;

  /** Resolution */
  resolution: Resolution;

  /** Custom resolution (if not using preset) */
  customResolution?: { width: number; height: number };

  /** Aspect ratio */
  aspectRatio: AspectRatioPreset;

  /** Frame rate */
  fps: number;

  /** Bitrate mode */
  bitrateMode: "cbr" | "vbr" | "crf" | "cq";

  /** Target bitrate in Mbps (for CBR/VBR) */
  bitrate?: number;

  /** Max bitrate in Mbps (for VBR) */
  maxBitrate?: number;

  /** CRF value (0-51 for H.264/H.265, 0-63 for AV1) */
  crf?: number;

  /** Encoding preset */
  preset: EncodingPreset;

  /** HDR format */
  hdr: HDRFormat;

  /** Color space */
  colorSpace: "sRGB" | "Rec709" | "Rec2020" | "DCI-P3";

  /** Color depth */
  colorDepth: 8 | 10 | 12;

  /** Pixel format */
  pixelFormat: PixelFormat;

  /** Two-pass encoding */
  twoPass: boolean;

  /** Deinterlace */
  deinterlace: boolean;

  /** Include alpha channel (if supported) */
  includeAlpha: boolean;
}

export interface AudioExportSettings {
  /** Audio codec */
  codec: AudioCodec;

  /** Sample rate in Hz */
  sampleRate: 44100 | 48000 | 96000 | 192000;

  /** Bit depth */
  bitDepth: 16 | 24 | 32;

  /** Channel layout */
  channels: AudioChannelLayout;

  /** Bitrate in kbps */
  bitrate: number;

  /** Normalize audio */
  normalize: boolean;

  /** Target loudness in LUFS */
  targetLoudness?: number;

  /** True peak limit in dB */
  truePeakLimit?: number;
}

export type EncodingPreset =
  | "ultrafast"
  | "superfast"
  | "veryfast"
  | "faster"
  | "fast"
  | "medium"
  | "slow"
  | "slower"
  | "veryslow"
  | "placebo";

export type PixelFormat =
  | "yuv420p"          // 8-bit 4:2:0
  | "yuv422p"          // 8-bit 4:2:2
  | "yuv444p"          // 8-bit 4:4:4
  | "yuv420p10le"      // 10-bit 4:2:0
  | "yuv422p10le"      // 10-bit 4:2:2
  | "yuv444p10le"      // 10-bit 4:4:4
  | "yuv420p12le"      // 12-bit 4:2:0
  | "rgb24"            // RGB 8-bit
  | "rgba"             // RGBA 8-bit
  | "rgb48le"          // RGB 16-bit
  | "rgba64le";        // RGBA 16-bit

export type AudioChannelLayout =
  | "mono"
  | "stereo"
  | "2.1"
  | "5.1"
  | "7.1"
  | "atmos";           // Dolby Atmos (object-based)

export type GPUAcceleration =
  | "none"
  | "nvenc"            // NVIDIA
  | "qsv"              // Intel Quick Sync
  | "amf"              // AMD
  | "videotoolbox"     // Apple
  | "vaapi"            // Linux VA-API
  | "auto";            // Auto-detect best

// ============================================
// PLATFORM PRESETS
// ============================================

export interface PlatformPreset {
  id: string;
  name: string;
  platform: string;
  description: string;
  icon: string;

  /** Video settings */
  video: Partial<VideoExportSettings>;

  /** Audio settings */
  audio: Partial<AudioExportSettings>;

  /** Container format */
  container: ContainerFormat;

  /** Recommended aspect ratios */
  recommendedAspects: AspectRatioPreset[];

  /** Max file size in MB (0 = unlimited) */
  maxFileSizeMb: number;

  /** Max duration in seconds (0 = unlimited) */
  maxDuration: number;
}

export const PLATFORM_PRESETS: PlatformPreset[] = [
  // YouTube
  {
    id: "youtube_4k",
    name: "YouTube 4K",
    platform: "YouTube",
    description: "Best quality for YouTube",
    icon: "youtube",
    video: {
      codec: "h264",
      resolution: "4k",
      fps: 60,
      bitrateMode: "vbr",
      bitrate: 45,
      maxBitrate: 68,
      colorSpace: "Rec709",
      colorDepth: 8,
      pixelFormat: "yuv420p",
      preset: "slow",
    },
    audio: {
      codec: "aac",
      sampleRate: 48000,
      bitDepth: 16,
      channels: "stereo",
      bitrate: 384,
    },
    container: "mp4",
    recommendedAspects: ["16:9", "9:16", "1:1"],
    maxFileSizeMb: 256000, // 256GB
    maxDuration: 43200, // 12 hours
  },
  {
    id: "youtube_hdr",
    name: "YouTube HDR",
    platform: "YouTube",
    description: "HDR10 for YouTube",
    icon: "youtube",
    video: {
      codec: "vp9",
      resolution: "4k",
      fps: 60,
      bitrateMode: "vbr",
      bitrate: 50,
      maxBitrate: 80,
      colorSpace: "Rec2020",
      colorDepth: 10,
      hdr: "hdr10",
      pixelFormat: "yuv420p10le",
      preset: "slow",
    },
    audio: {
      codec: "opus",
      sampleRate: 48000,
      bitDepth: 24,
      channels: "stereo",
      bitrate: 256,
    },
    container: "webm",
    recommendedAspects: ["16:9"],
    maxFileSizeMb: 256000,
    maxDuration: 43200,
  },

  // TikTok
  {
    id: "tiktok",
    name: "TikTok",
    platform: "TikTok",
    description: "Optimized for TikTok",
    icon: "tiktok",
    video: {
      codec: "h264",
      resolution: "1080p",
      fps: 60,
      bitrateMode: "cbr",
      bitrate: 12,
      colorSpace: "sRGB",
      colorDepth: 8,
      pixelFormat: "yuv420p",
      preset: "fast",
    },
    audio: {
      codec: "aac",
      sampleRate: 44100,
      bitDepth: 16,
      channels: "stereo",
      bitrate: 192,
    },
    container: "mp4",
    recommendedAspects: ["9:16", "1:1"],
    maxFileSizeMb: 287,
    maxDuration: 600, // 10 min
  },

  // Instagram Reels
  {
    id: "instagram_reels",
    name: "Instagram Reels",
    platform: "Instagram",
    description: "Optimized for Reels",
    icon: "instagram",
    video: {
      codec: "h264",
      resolution: "1080p",
      fps: 30,
      bitrateMode: "cbr",
      bitrate: 8,
      colorSpace: "sRGB",
      colorDepth: 8,
      pixelFormat: "yuv420p",
      preset: "fast",
    },
    audio: {
      codec: "aac",
      sampleRate: 44100,
      bitDepth: 16,
      channels: "stereo",
      bitrate: 128,
    },
    container: "mp4",
    recommendedAspects: ["9:16", "4:5", "1:1"],
    maxFileSizeMb: 650,
    maxDuration: 90,
  },

  // Twitter/X
  {
    id: "twitter",
    name: "Twitter/X",
    platform: "Twitter",
    description: "Optimized for Twitter/X",
    icon: "twitter",
    video: {
      codec: "h264",
      resolution: "1080p",
      fps: 60,
      bitrateMode: "cbr",
      bitrate: 8,
      colorSpace: "sRGB",
      colorDepth: 8,
      pixelFormat: "yuv420p",
      preset: "fast",
    },
    audio: {
      codec: "aac",
      sampleRate: 44100,
      bitDepth: 16,
      channels: "stereo",
      bitrate: 128,
    },
    container: "mp4",
    recommendedAspects: ["16:9", "1:1"],
    maxFileSizeMb: 512,
    maxDuration: 140,
  },

  // Netflix
  {
    id: "netflix_4k_hdr",
    name: "Netflix 4K HDR",
    platform: "Netflix",
    description: "Netflix delivery spec",
    icon: "netflix",
    video: {
      codec: "h265",
      resolution: "4k",
      fps: 24,
      bitrateMode: "cbr",
      bitrate: 16,
      colorSpace: "Rec2020",
      colorDepth: 10,
      hdr: "dolby_vision",
      pixelFormat: "yuv420p10le",
      preset: "slower",
      twoPass: true,
    },
    audio: {
      codec: "eac3",
      sampleRate: 48000,
      bitDepth: 24,
      channels: "5.1",
      bitrate: 640,
    },
    container: "mp4",
    recommendedAspects: ["16:9", "2.35:1"],
    maxFileSizeMb: 0,
    maxDuration: 0,
  },

  // Apple TV+
  {
    id: "apple_tv_plus",
    name: "Apple TV+",
    platform: "Apple TV+",
    description: "Apple TV+ delivery spec",
    icon: "apple",
    video: {
      codec: "h265",
      resolution: "4k",
      fps: 24,
      bitrateMode: "cbr",
      bitrate: 25,
      colorSpace: "Rec2020",
      colorDepth: 10,
      hdr: "dolby_vision",
      pixelFormat: "yuv420p10le",
      preset: "slower",
      twoPass: true,
    },
    audio: {
      codec: "truehd",
      sampleRate: 48000,
      bitDepth: 24,
      channels: "atmos",
      bitrate: 0, // Lossless
    },
    container: "mov",
    recommendedAspects: ["16:9", "2.35:1", "2.76:1"],
    maxFileSizeMb: 0,
    maxDuration: 0,
  },

  // Professional
  {
    id: "prores_master",
    name: "ProRes Master",
    platform: "Professional",
    description: "High quality for post-production",
    icon: "professional",
    video: {
      codec: "prores_422_hq",
      resolution: "4k",
      fps: 24,
      bitrateMode: "cbr",
      bitrate: 880, // ~110 MB/s
      colorSpace: "Rec709",
      colorDepth: 10,
      pixelFormat: "yuv422p10le",
      preset: "medium",
    },
    audio: {
      codec: "wav",
      sampleRate: 48000,
      bitDepth: 24,
      channels: "stereo",
      bitrate: 0, // Uncompressed
    },
    container: "mov",
    recommendedAspects: ["16:9", "2.35:1"],
    maxFileSizeMb: 0,
    maxDuration: 0,
  },

  // Archive
  {
    id: "archive_av1",
    name: "Archive AV1",
    platform: "Archive",
    description: "Best compression for archival",
    icon: "archive",
    video: {
      codec: "av1",
      resolution: "4k",
      fps: 24,
      bitrateMode: "crf",
      crf: 23,
      colorSpace: "Rec709",
      colorDepth: 10,
      pixelFormat: "yuv420p10le",
      preset: "veryslow",
      twoPass: true,
    },
    audio: {
      codec: "flac",
      sampleRate: 48000,
      bitDepth: 24,
      channels: "stereo",
      bitrate: 0, // Lossless
    },
    container: "mkv",
    recommendedAspects: ["16:9", "2.35:1"],
    maxFileSizeMb: 0,
    maxDuration: 0,
  },

  // MOOSTIK Episode
  {
    id: "moostik_episode",
    name: "MOOSTIK Episode",
    platform: "MOOSTIK",
    description: "Optimized for MOOSTIK series",
    icon: "moostik",
    video: {
      codec: "h265",
      resolution: "4k",
      fps: 24,
      bitrateMode: "crf",
      crf: 18,
      colorSpace: "Rec709",
      colorDepth: 10,
      pixelFormat: "yuv420p10le",
      preset: "slow",
      twoPass: true,
    },
    audio: {
      codec: "aac",
      sampleRate: 48000,
      bitDepth: 24,
      channels: "stereo",
      bitrate: 320,
      normalize: true,
      targetLoudness: -14,
    },
    container: "mp4",
    recommendedAspects: ["16:9", "2.35:1"],
    maxFileSizeMb: 0,
    maxDuration: 0,
  },
];

// ============================================
// EXPORT METADATA
// ============================================

export interface ExportMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
  description?: string;
  copyright?: string;
  comment?: string;
  rating?: number;

  /** Custom tags */
  tags?: Record<string, string>;

  /** Thumbnail image */
  thumbnail?: string;

  /** SynthID watermark (for AI content) */
  synthId?: boolean;

  /** Content ID (for rights management) */
  contentId?: string;
}

// ============================================
// SUBTITLE EXPORT
// ============================================

export interface SubtitleExportConfig {
  /** Export format */
  format: "srt" | "vtt" | "ass" | "ttml" | "scc" | "burn_in";

  /** Include in container or separate file */
  embedded: boolean;

  /** Languages to export */
  languages?: string[];

  /** For burn-in: position */
  burnInPosition?: "bottom" | "top";

  /** For burn-in: style override */
  burnInStyle?: {
    fontFamily: string;
    fontSize: number;
    color: string;
    backgroundColor?: string;
  };
}

// ============================================
// EXPORT JOB
// ============================================

export interface ExportJob {
  id: string;
  projectId: string;
  config: ExportConfig;
  status: ExportStatus;

  /** Progress 0-100 */
  progress: number;

  /** Current stage */
  stage: ExportStage;

  /** Start time */
  startedAt?: string;

  /** Completion time */
  completedAt?: string;

  /** Estimated time remaining in seconds */
  estimatedTimeRemaining?: number;

  /** Output file path (when completed) */
  outputPath?: string;

  /** Output file size in bytes */
  outputSize?: number;

  /** Error message (if failed) */
  error?: string;

  /** Detailed logs */
  logs: ExportLog[];

  /** Render stats */
  stats?: ExportStats;
}

export type ExportStatus =
  | "queued"
  | "preparing"
  | "rendering"
  | "encoding"
  | "finalizing"
  | "completed"
  | "failed"
  | "cancelled";

export type ExportStage =
  | "analysis"
  | "audio_render"
  | "video_render"
  | "effects"
  | "composition"
  | "encoding"
  | "muxing"
  | "metadata"
  | "upload";

export interface ExportLog {
  timestamp: string;
  level: "info" | "warning" | "error";
  message: string;
  details?: Record<string, unknown>;
}

export interface ExportStats {
  /** Total frames rendered */
  framesRendered: number;

  /** Average FPS during render */
  averageRenderFps: number;

  /** Peak memory usage in MB */
  peakMemoryMb: number;

  /** GPU utilization % */
  gpuUtilization: number;

  /** CPU utilization % */
  cpuUtilization: number;

  /** Total render time in seconds */
  totalRenderTime: number;

  /** File size in bytes */
  outputFileSize: number;

  /** Bitrate achieved in Mbps */
  achievedBitrate: number;
}

// ============================================
// BATCH EXPORT
// ============================================

export interface BatchExportConfig {
  /** Export jobs */
  jobs: {
    projectId: string;
    config: ExportConfig;
  }[];

  /** Run in parallel (max concurrent) */
  parallelJobs: number;

  /** Continue on error */
  continueOnError: boolean;

  /** Notification when complete */
  notifyOnComplete: boolean;

  /** Cloud rendering */
  useCloudRendering: boolean;
}

export interface BatchExportResult {
  totalJobs: number;
  completed: number;
  failed: number;
  cancelled: number;
  totalTimeMs: number;
  jobs: ExportJob[];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get platform preset by ID
 */
export function getPreset(id: string): PlatformPreset | undefined {
  return PLATFORM_PRESETS.find(p => p.id === id);
}

/**
 * Get presets for a platform
 */
export function getPresetsForPlatform(platform: string): PlatformPreset[] {
  return PLATFORM_PRESETS.filter(p => p.platform === platform);
}

/**
 * Calculate estimated file size in MB
 */
export function estimateFileSize(config: ExportConfig, durationSeconds: number): number {
  const videoBitrateMbps = config.video.bitrate || 10;
  const audioBitrateKbps = config.audio.bitrate || 192;

  const videoSizeMb = (videoBitrateMbps * durationSeconds) / 8;
  const audioSizeMb = (audioBitrateKbps * durationSeconds) / 8000;

  // Add 5% overhead for container
  return (videoSizeMb + audioSizeMb) * 1.05;
}

/**
 * Calculate estimated export time in seconds
 */
export function estimateExportTime(
  config: ExportConfig,
  durationSeconds: number,
  complexity: "low" | "medium" | "high"
): number {
  const baseMultiplier = {
    low: 0.5,
    medium: 1,
    high: 2,
  }[complexity];

  const presetMultiplier = {
    ultrafast: 0.2,
    superfast: 0.3,
    veryfast: 0.5,
    faster: 0.7,
    fast: 0.9,
    medium: 1,
    slow: 1.5,
    slower: 2,
    veryslow: 3,
    placebo: 5,
  }[config.video.preset];

  const resolutionMultiplier = {
    "720p": 0.5,
    "1080p": 1,
    "2k": 1.5,
    "1440p": 1.5,
    "4k": 3,
    "4k_dci": 3.2,
    "8k": 10,
  }[config.video.resolution];

  const codecMultiplier = {
    h264: 1,
    h265: 1.5,
    av1: 4,
    vp9: 2,
    prores_422: 0.3,
    prores_422_hq: 0.4,
    prores_4444: 0.5,
    prores_raw: 0.2,
    dnxhd: 0.3,
    dnxhr: 0.4,
    cineform: 0.4,
    gif: 2,
    webp: 1.5,
    apng: 2,
  }[config.video.codec];

  const twoPassMultiplier = config.video.twoPass ? 1.8 : 1;

  // Base: 1 second of video = 1 second to export at medium settings
  return (
    durationSeconds *
    baseMultiplier *
    presetMultiplier *
    resolutionMultiplier *
    codecMultiplier *
    twoPassMultiplier
  );
}

/**
 * Validate export config against platform limits
 */
export function validateConfig(
  config: ExportConfig,
  durationSeconds: number,
  preset?: PlatformPreset
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (preset) {
    if (preset.maxDuration > 0 && durationSeconds > preset.maxDuration) {
      errors.push(`Duration exceeds ${preset.platform} limit of ${preset.maxDuration}s`);
    }

    const estimatedSize = estimateFileSize(config, durationSeconds);
    if (preset.maxFileSizeMb > 0 && estimatedSize > preset.maxFileSizeMb) {
      errors.push(`Estimated size ${estimatedSize.toFixed(0)}MB exceeds ${preset.platform} limit of ${preset.maxFileSizeMb}MB`);
    }
  }

  // Validate codec/container compatibility
  const validContainers: Record<VideoCodec, ContainerFormat[]> = {
    h264: ["mp4", "mov", "mkv", "ts", "m3u8", "mpd"],
    h265: ["mp4", "mov", "mkv", "ts", "m3u8", "mpd"],
    av1: ["mp4", "webm", "mkv"],
    vp9: ["webm", "mkv"],
    prores_422: ["mov"],
    prores_422_hq: ["mov"],
    prores_4444: ["mov"],
    prores_raw: ["mov"],
    dnxhd: ["mov", "mxf"],
    dnxhr: ["mov", "mxf"],
    cineform: ["mov", "avi"],
    gif: ["gif" as ContainerFormat],
    webp: ["webp" as ContainerFormat],
    apng: ["apng" as ContainerFormat],
  };

  if (!validContainers[config.video.codec]?.includes(config.container)) {
    errors.push(`Codec ${config.video.codec} is not compatible with container ${config.container}`);
  }

  // Validate HDR requirements
  if (config.video.hdr !== "sdr" && config.video.colorDepth < 10) {
    errors.push("HDR requires at least 10-bit color depth");
  }

  if (config.video.hdr === "dolby_vision" && !["h265", "av1"].includes(config.video.codec)) {
    errors.push("Dolby Vision requires H.265 or AV1 codec");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Build FFmpeg command from export config
 */
export function buildFFmpegCommand(
  config: ExportConfig,
  inputFile: string,
  outputFile: string
): string {
  const args: string[] = ["ffmpeg", "-y"];

  // Input
  args.push("-i", `"${inputFile}"`);

  // GPU acceleration
  if (config.gpuAcceleration !== "none") {
    const hwaccelMap: Record<GPUAcceleration, string> = {
      nvenc: "cuda",
      qsv: "qsv",
      amf: "amf",
      videotoolbox: "videotoolbox",
      vaapi: "vaapi",
      auto: "auto",
      none: "",
    };
    args.push("-hwaccel", hwaccelMap[config.gpuAcceleration]);
  }

  // Video codec
  const codecMap: Partial<Record<VideoCodec, string>> = {
    h264: config.gpuAcceleration === "nvenc" ? "h264_nvenc" : "libx264",
    h265: config.gpuAcceleration === "nvenc" ? "hevc_nvenc" : "libx265",
    av1: "libaom-av1",
    vp9: "libvpx-vp9",
    prores_422: "prores_ks -profile:v 2",
    prores_422_hq: "prores_ks -profile:v 3",
    prores_4444: "prores_ks -profile:v 4",
  };
  args.push("-c:v", codecMap[config.video.codec] || config.video.codec);

  // Resolution
  const resolutionMap: Record<Resolution, string> = {
    "720p": "1280:720",
    "1080p": "1920:1080",
    "2k": "2048:1080",
    "1440p": "2560:1440",
    "4k": "3840:2160",
    "4k_dci": "4096:2160",
    "8k": "7680:4320",
  };
  args.push("-vf", `scale=${resolutionMap[config.video.resolution]}`);

  // Frame rate
  args.push("-r", config.video.fps.toString());

  // Bitrate
  if (config.video.bitrateMode === "cbr" && config.video.bitrate) {
    args.push("-b:v", `${config.video.bitrate}M`);
  } else if (config.video.bitrateMode === "vbr" && config.video.bitrate) {
    args.push("-b:v", `${config.video.bitrate}M`);
    if (config.video.maxBitrate) {
      args.push("-maxrate", `${config.video.maxBitrate}M`);
      args.push("-bufsize", `${config.video.maxBitrate * 2}M`);
    }
  } else if (config.video.bitrateMode === "crf" && config.video.crf !== undefined) {
    args.push("-crf", config.video.crf.toString());
  }

  // Pixel format
  args.push("-pix_fmt", config.video.pixelFormat);

  // Preset
  if (["h264", "h265"].includes(config.video.codec)) {
    args.push("-preset", config.video.preset);
  }

  // Audio codec
  const audioCodecMap: Partial<Record<AudioCodec, string>> = {
    aac: "aac",
    opus: "libopus",
    flac: "flac",
    wav: "pcm_s24le",
    mp3: "libmp3lame",
    ac3: "ac3",
    eac3: "eac3",
  };
  args.push("-c:a", audioCodecMap[config.audio.codec] || config.audio.codec);

  // Audio sample rate
  args.push("-ar", config.audio.sampleRate.toString());

  // Audio bitrate
  if (config.audio.bitrate > 0) {
    args.push("-b:a", `${config.audio.bitrate}k`);
  }

  // Audio channels
  const channelMap: Record<AudioChannelLayout, string> = {
    mono: "1",
    stereo: "2",
    "2.1": "3",
    "5.1": "6",
    "7.1": "8",
    atmos: "8", // Base channels for Atmos
  };
  args.push("-ac", channelMap[config.audio.channels]);

  // Output
  args.push(`"${outputFile}"`);

  return args.join(" ");
}

/**
 * Create default export config for a project
 */
export function createDefaultConfig(project: EditorProject, presetId?: string): ExportConfig {
  const preset = presetId ? getPreset(presetId) : getPreset("youtube_4k");

  return {
    filename: project.name.replace(/[^a-zA-Z0-9]/g, "_"),
    outputDir: "./exports",
    video: {
      codec: preset?.video.codec || "h264",
      resolution: preset?.video.resolution || "1080p",
      aspectRatio: project.settings.aspectRatio,
      fps: project.settings.fps,
      bitrateMode: preset?.video.bitrateMode || "crf",
      bitrate: preset?.video.bitrate,
      crf: 23,
      preset: preset?.video.preset || "medium",
      hdr: preset?.video.hdr || "sdr",
      colorSpace: project.settings.colorSpace as "sRGB" | "Rec709" | "Rec2020" | "DCI-P3",
      colorDepth: preset?.video.colorDepth || 8,
      pixelFormat: preset?.video.pixelFormat || "yuv420p",
      twoPass: preset?.video.twoPass || false,
      deinterlace: false,
      includeAlpha: false,
    },
    audio: {
      codec: preset?.audio.codec || "aac",
      sampleRate: project.settings.audio.sampleRate,
      bitDepth: project.settings.audio.bitDepth,
      channels: project.settings.audio.channels === "stereo" ? "stereo" : project.settings.audio.channels as AudioChannelLayout,
      bitrate: preset?.audio.bitrate || 256,
      normalize: true,
      targetLoudness: -14,
      truePeakLimit: -1,
    },
    container: preset?.container || "mp4",
    priority: "normal",
    useCloudRendering: false,
    gpuAcceleration: "auto",
    includeChapters: true,
  };
}
