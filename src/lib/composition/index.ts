/**
 * MOOSTIK Composition Module
 * Timeline management, video editing, and episode assembly
 */

// Types
export * from "./types";

// FFmpeg utilities
export {
  FFmpegCommandBuilder,
  FFmpegError,
  executeFFmpeg,
  concatenateClips,
  mixAudioTracks,
  addAudioToVideo,
  applyKenBurns,
  applyColorGrade,
  checkFFmpegAvailable,
  getVideoDuration,
  generateThumbnail,
} from "./ffmpeg";

// Episode assembler
export {
  EpisodeAssembler,
  EpisodeAssemblyError,
  getEpisodeAssembler,
} from "./episode-assembler";
