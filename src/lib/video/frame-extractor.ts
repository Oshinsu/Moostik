/**
 * FRAME EXTRACTOR - Extraction de Frames Video
 * ===========================================================================
 * Utilitaires pour extraire des frames de videos:
 * - Premier frame pour reference
 * - Dernier frame pour chaining
 * - Frames cles pour storyboard
 * Multiple implementations: FFmpeg, Cloudinary, Cache
 * SOTA Janvier 2026
 * ===========================================================================
 */

import { uploadVariation } from "@/lib/supabase/storage";

// ============================================================================
// TYPES
// ============================================================================

export interface ExtractedFrame {
  url: string;                     // URL du frame extrait
  timestamp: number;               // Position en secondes
  type: "first" | "last" | "keyframe";
  sourceVideo: string;             // URL video source
  width?: number;
  height?: number;
  extractedAt: string;
}

export interface FrameExtractionOptions {
  method: "ffmpeg" | "cloudinary" | "browser" | "cache";
  quality?: "low" | "medium" | "high";
  format?: "png" | "jpg" | "webp";
  maxWidth?: number;
  maxHeight?: number;
}

export interface KeyframeSet {
  first: ExtractedFrame;
  last: ExtractedFrame;
  keyframes?: ExtractedFrame[];
  thumbnails?: ExtractedFrame[];
}

// ============================================================================
// FRAME CACHE
// ============================================================================

// In-memory cache for extracted frames
const frameCache = new Map<string, ExtractedFrame>();

/**
 * Get cache key for a frame
 */
function getCacheKey(videoUrl: string, type: "first" | "last", timestamp?: number): string {
  return `${videoUrl}:${type}:${timestamp || 0}`;
}

/**
 * Get frame from cache
 */
export function getCachedFrame(
  videoUrl: string,
  type: "first" | "last"
): ExtractedFrame | null {
  const key = getCacheKey(videoUrl, type);
  return frameCache.get(key) || null;
}

/**
 * Set frame in cache
 */
export function setCachedFrame(frame: ExtractedFrame): void {
  const key = getCacheKey(frame.sourceVideo, frame.type as "first" | "last", frame.timestamp);
  frameCache.set(key, frame);
}

// ============================================================================
// EXTRACTION METHODS
// ============================================================================

/**
 * Extract first frame from video
 */
export async function extractFirstFrame(
  videoUrl: string,
  options: FrameExtractionOptions = { method: "cloudinary" }
): Promise<ExtractedFrame | null> {
  // Check cache first
  const cached = getCachedFrame(videoUrl, "first");
  if (cached) return cached;
  
  try {
    let frameUrl: string | null = null;
    
    switch (options.method) {
      case "cloudinary":
        frameUrl = await extractViaCloudinary(videoUrl, 0, options);
        break;
      case "ffmpeg":
        frameUrl = await extractViaFFmpeg(videoUrl, 0, options);
        break;
      case "browser":
        frameUrl = await extractViaBrowser(videoUrl, 0, options);
        break;
      case "cache":
        // Cache-only mode, return null if not cached
        return null;
    }
    
    if (!frameUrl) return null;
    
    const frame: ExtractedFrame = {
      url: frameUrl,
      timestamp: 0,
      type: "first",
      sourceVideo: videoUrl,
      extractedAt: new Date().toISOString(),
    };
    
    setCachedFrame(frame);
    return frame;
    
  } catch (error) {
    console.error("[Frame Extractor] First frame extraction failed:", error);
    return null;
  }
}

/**
 * Extract last frame from video
 */
export async function extractLastFrame(
  videoUrl: string,
  videoDuration?: number,
  options: FrameExtractionOptions = { method: "cloudinary" }
): Promise<ExtractedFrame | null> {
  // Check cache first
  const cached = getCachedFrame(videoUrl, "last");
  if (cached) return cached;
  
  try {
    // If duration not provided, try to detect it
    const duration = videoDuration || await getVideoDuration(videoUrl) || 5;
    
    // Extract slightly before end to avoid black frames
    const timestamp = Math.max(0, duration - 0.1);
    
    let frameUrl: string | null = null;
    
    switch (options.method) {
      case "cloudinary":
        frameUrl = await extractViaCloudinary(videoUrl, timestamp, options);
        break;
      case "ffmpeg":
        frameUrl = await extractViaFFmpeg(videoUrl, timestamp, options);
        break;
      case "browser":
        frameUrl = await extractViaBrowser(videoUrl, timestamp, options);
        break;
      case "cache":
        return null;
    }
    
    if (!frameUrl) return null;
    
    const frame: ExtractedFrame = {
      url: frameUrl,
      timestamp,
      type: "last",
      sourceVideo: videoUrl,
      extractedAt: new Date().toISOString(),
    };
    
    setCachedFrame(frame);
    return frame;
    
  } catch (error) {
    console.error("[Frame Extractor] Last frame extraction failed:", error);
    return null;
  }
}

/**
 * Extract both first and last frames
 */
export async function extractFirstLastFrames(
  videoUrl: string,
  videoDuration?: number,
  options: FrameExtractionOptions = { method: "cloudinary" }
): Promise<{ first: ExtractedFrame | null; last: ExtractedFrame | null }> {
  const [first, last] = await Promise.all([
    extractFirstFrame(videoUrl, options),
    extractLastFrame(videoUrl, videoDuration, options),
  ]);
  
  return { first, last };
}

/**
 * Extract keyframes from video (for storyboard)
 */
export async function extractKeyframes(
  videoUrl: string,
  count: number = 4,
  videoDuration?: number,
  options: FrameExtractionOptions = { method: "cloudinary" }
): Promise<ExtractedFrame[]> {
  const duration = videoDuration || await getVideoDuration(videoUrl) || 5;
  const interval = duration / (count + 1);
  
  const keyframes: ExtractedFrame[] = [];
  
  for (let i = 1; i <= count; i++) {
    const timestamp = interval * i;
    
    try {
      let frameUrl: string | null = null;
      
      switch (options.method) {
        case "cloudinary":
          frameUrl = await extractViaCloudinary(videoUrl, timestamp, options);
          break;
        case "ffmpeg":
          frameUrl = await extractViaFFmpeg(videoUrl, timestamp, options);
          break;
        case "browser":
          frameUrl = await extractViaBrowser(videoUrl, timestamp, options);
          break;
      }
      
      if (frameUrl) {
        keyframes.push({
          url: frameUrl,
          timestamp,
          type: "keyframe",
          sourceVideo: videoUrl,
          extractedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`[Frame Extractor] Keyframe ${i} extraction failed:`, error);
    }
  }
  
  return keyframes;
}

// ============================================================================
// EXTRACTION IMPLEMENTATIONS
// ============================================================================

/**
 * Extract frame via Cloudinary transformation
 * Cloudinary can extract frames from video URLs directly
 */
async function extractViaCloudinary(
  videoUrl: string,
  timestamp: number,
  options: FrameExtractionOptions
): Promise<string | null> {
  // If it's already a Cloudinary URL, transform it
  if (videoUrl.includes("cloudinary.com")) {
    // Extract the video ID and construct frame URL
    // Format: https://res.cloudinary.com/demo/video/upload/so_5/video_id.jpg
    const parts = videoUrl.split("/upload/");
    if (parts.length === 2) {
      const base = parts[0];
      const path = parts[1];
      const videoId = path.replace(/\.[^/.]+$/, ""); // Remove extension
      
      const transformations = [
        `so_${timestamp.toFixed(1)}`, // Start offset
        "f_jpg",                       // Format
        "q_auto",                      // Quality
      ];
      
      if (options.maxWidth) {
        transformations.push(`w_${options.maxWidth}`);
      }
      
      return `${base}/upload/${transformations.join(",")}/${videoId}.jpg`;
    }
  }
  
  // For non-Cloudinary URLs, we need an API endpoint
  // This would be a server-side implementation
  console.log("[Frame Extractor] Cloudinary transformation requires Cloudinary URL or API");
  
  // Fallback: try direct URL with timestamp parameter (some CDNs support this)
  return `${videoUrl}#t=${timestamp.toFixed(1)}`;
}

/**
 * Extract frame via FFmpeg (server-side)
 * Requires FFmpeg to be available on the server
 */
async function extractViaFFmpeg(
  videoUrl: string,
  timestamp: number,
  options: FrameExtractionOptions
): Promise<string | null> {
  // This would call a server-side API that runs FFmpeg
  // For now, we'll use a placeholder implementation
  
  try {
    // Call our internal API for FFmpeg extraction
    const response = await fetch("/api/video/extract-frame", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoUrl,
        timestamp,
        format: options.format || "png",
        quality: options.quality || "medium",
        maxWidth: options.maxWidth,
        maxHeight: options.maxHeight,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`FFmpeg extraction failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.frameUrl;
    
  } catch (error) {
    console.error("[Frame Extractor] FFmpeg extraction failed:", error);
    return null;
  }
}

/**
 * Extract frame via browser (client-side)
 * Uses canvas to capture video frame
 */
async function extractViaBrowser(
  videoUrl: string,
  timestamp: number,
  options: FrameExtractionOptions
): Promise<string | null> {
  // Only works in browser environment
  if (typeof window === "undefined") {
    console.log("[Frame Extractor] Browser extraction only works client-side");
    return null;
  }
  
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    
    video.onloadedmetadata = () => {
      video.currentTime = timestamp;
    };
    
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      const width = options.maxWidth || video.videoWidth;
      const height = options.maxHeight || video.videoHeight;
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      
      ctx.drawImage(video, 0, 0, width, height);
      
      const format = options.format || "png";
      const quality = options.quality === "high" ? 0.95 : 
                      options.quality === "medium" ? 0.85 : 0.7;
      
      const dataUrl = canvas.toDataURL(`image/${format}`, quality);
      
      // Clean up
      video.remove();
      
      resolve(dataUrl);
    };
    
    video.onerror = () => {
      console.error("[Frame Extractor] Video load error");
      resolve(null);
    };
    
    video.src = videoUrl;
  });
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get video duration (approximate for remote videos)
 */
async function getVideoDuration(videoUrl: string): Promise<number | null> {
  // Try to get duration from video metadata
  if (typeof window !== "undefined") {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.muted = true;
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        video.remove();
        resolve(duration);
      };
      
      video.onerror = () => {
        resolve(null);
      };
      
      video.src = videoUrl;
    });
  }
  
  // Server-side: try to parse from URL or return default
  // Some video URLs include duration info
  const durationMatch = videoUrl.match(/[_-](\d+)s[_.-]/);
  if (durationMatch) {
    return parseInt(durationMatch[1], 10);
  }
  
  return null;
}

/**
 * Upload extracted frame to storage
 */
export async function uploadExtractedFrame(
  frame: ExtractedFrame,
  episodeId: string,
  shotId: string,
  frameType: "first" | "last" | "keyframe"
): Promise<string | null> {
  try {
    // If frame URL is a data URL, convert to blob
    if (frame.url.startsWith("data:")) {
      const response = await fetch(frame.url);
      const blob = await response.blob();
      const buffer = Buffer.from(await blob.arrayBuffer());
      
      const result = await uploadVariation(
        buffer,
        episodeId,
        shotId,
        `${frameType}-frame`
      );
      
      return result.publicUrl || null;
    }
    
    // If it's already a remote URL, return as-is or re-upload
    return frame.url;
    
  } catch (error) {
    console.error("[Frame Extractor] Upload failed:", error);
    return null;
  }
}

/**
 * Store frames during video generation
 * Called when video is generated to store first/last frames
 */
export async function storeGeneratedFrames(
  videoUrl: string,
  videoDuration: number,
  episodeId: string,
  shotId: string
): Promise<{
  firstFrameUrl?: string;
  lastFrameUrl?: string;
}> {
  const result: { firstFrameUrl?: string; lastFrameUrl?: string } = {};
  
  try {
    // Extract frames
    const { first, last } = await extractFirstLastFrames(
      videoUrl,
      videoDuration,
      { method: "cloudinary", quality: "high", format: "png" }
    );
    
    // Upload first frame
    if (first) {
      const uploadedFirst = await uploadExtractedFrame(
        first,
        episodeId,
        shotId,
        "first"
      );
      if (uploadedFirst) {
        result.firstFrameUrl = uploadedFirst;
      }
    }
    
    // Upload last frame
    if (last) {
      const uploadedLast = await uploadExtractedFrame(
        last,
        episodeId,
        shotId,
        "last"
      );
      if (uploadedLast) {
        result.lastFrameUrl = uploadedLast;
      }
    }
    
  } catch (error) {
    console.error("[Frame Extractor] Store frames failed:", error);
  }
  
  return result;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Extract and store frames for multiple videos
 */
export async function batchExtractFrames(
  videos: Array<{
    videoUrl: string;
    duration?: number;
    episodeId: string;
    shotId: string;
  }>,
  options: FrameExtractionOptions = { method: "cloudinary" }
): Promise<Map<string, { first?: string; last?: string }>> {
  const results = new Map<string, { first?: string; last?: string }>();
  
  // Process in parallel with limit
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < videos.length; i += BATCH_SIZE) {
    const batch = videos.slice(i, i + BATCH_SIZE);
    
    const batchResults = await Promise.all(
      batch.map(async (video) => {
        const frames = await storeGeneratedFrames(
          video.videoUrl,
          video.duration || 5,
          video.episodeId,
          video.shotId
        );
        return { shotId: video.shotId, frames };
      })
    );
    
    for (const { shotId, frames } of batchResults) {
      results.set(shotId, {
        first: frames.firstFrameUrl,
        last: frames.lastFrameUrl,
      });
    }
  }
  
  return results;
}
