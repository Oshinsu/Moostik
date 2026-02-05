/**
 * BLOODWINGS WORKER - RUNTIME
 * ============================================================================
 * The production worker that generates frames, syncs to beats, and
 * produces the actual visual content for the series.
 * ============================================================================
 */

import { EventEmitter } from "events";

// ============================================================================
// TYPES
// ============================================================================

export interface GenerationTask {
  id: string;
  type: "image" | "video" | "reference";
  priority: number;
  status: TaskStatus;
  input: {
    episodeId?: string;
    shotId?: string;
    prompt: string;
    referenceImages?: string[];
    style?: GenerationStyle;
    beatSync?: BeatSyncConfig;
  };
  output?: {
    url?: string;
    urls?: string[];
    metadata?: Record<string, unknown>;
  };
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  retries: number;
  maxRetries: number;
}

export type TaskStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export interface GenerationStyle {
  model: "nano-banana-pro" | "flux-2-pro" | "flux-2-max" | "imagen-4" | "flux-schnell" | "seedream-4.5";
  aspectRatio: string;
  resolution: string;
  steps: number;
  guidance: number;
  negativePrompt?: string;
}

export interface BeatSyncConfig {
  bpm: number;
  beatOffset: number;
  frameRate: number;
  syncType: "on-beat" | "off-beat" | "phrase";
}

export interface WorkerStats {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageProcessingTimeMs: number;
  imagesGenerated: number;
  videosGenerated: number;
}

export interface WorkerConfig {
  maxConcurrentTasks: number;
  taskTimeoutMs: number;
  maxRetries: number;
  pollIntervalMs: number;
  replicateApiToken?: string;
}

const DEFAULT_CONFIG: WorkerConfig = {
  maxConcurrentTasks: 3,
  taskTimeoutMs: 120000, // 2 minutes
  maxRetries: 3,
  pollIntervalMs: 1000,
};

// ============================================================================
// BLOODWINGS WORKER RUNTIME
// ============================================================================

export class BloodwingsWorkerRuntime extends EventEmitter {
  private taskQueue: GenerationTask[] = [];
  private activeTasks: Map<string, GenerationTask> = new Map();
  private completedTasks: Map<string, GenerationTask> = new Map();
  private config: WorkerConfig;
  private isRunning: boolean = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private stats: WorkerStats;

  constructor(config: Partial<WorkerConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = this.createEmptyStats();
  }

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log("[BloodwingsWorker] Starting worker...");

    this.pollInterval = setInterval(() => {
      this.processTasks();
    }, this.config.pollIntervalMs);

    this.emit("started");
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    console.log("[BloodwingsWorker] Worker stopped");
    this.emit("stopped");
  }

  // ==========================================================================
  // TASK SUBMISSION
  // ==========================================================================

  /**
   * Submit an image generation task
   */
  submitImageTask(
    prompt: string,
    options: {
      episodeId?: string;
      shotId?: string;
      referenceImages?: string[];
      style?: Partial<GenerationStyle>;
      priority?: number;
    } = {}
  ): GenerationTask {
    const task: GenerationTask = {
      id: this.generateTaskId(),
      type: "image",
      priority: options.priority || 5,
      status: "pending",
      input: {
        episodeId: options.episodeId,
        shotId: options.shotId,
        prompt,
        referenceImages: options.referenceImages,
        style: {
          model: "nano-banana-pro",
          aspectRatio: "21:9",
          resolution: "4096x1744",
          steps: 70,
          guidance: 7.5,
          ...options.style,
        },
      },
      createdAt: new Date(),
      retries: 0,
      maxRetries: this.config.maxRetries,
    };

    this.enqueueTask(task);
    return task;
  }

  /**
   * Submit a video generation task
   */
  submitVideoTask(
    prompt: string,
    options: {
      episodeId?: string;
      shotId?: string;
      sourceImage?: string;
      duration?: number;
      beatSync?: BeatSyncConfig;
      priority?: number;
    } = {}
  ): GenerationTask {
    const task: GenerationTask = {
      id: this.generateTaskId(),
      type: "video",
      priority: options.priority || 3,
      status: "pending",
      input: {
        episodeId: options.episodeId,
        shotId: options.shotId,
        prompt,
        referenceImages: options.sourceImage ? [options.sourceImage] : undefined,
        beatSync: options.beatSync,
      },
      createdAt: new Date(),
      retries: 0,
      maxRetries: this.config.maxRetries,
    };

    this.enqueueTask(task);
    return task;
  }

  /**
   * Submit a batch of tasks
   */
  submitBatch(
    tasks: {
      type: "image" | "video";
      prompt: string;
      options?: Record<string, unknown>;
    }[]
  ): GenerationTask[] {
    return tasks.map((t) => {
      if (t.type === "image") {
        return this.submitImageTask(t.prompt, t.options as Parameters<typeof this.submitImageTask>[1]);
      }
      return this.submitVideoTask(t.prompt, t.options as Parameters<typeof this.submitVideoTask>[1]);
    });
  }

  private enqueueTask(task: GenerationTask): void {
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => b.priority - a.priority);
    this.stats.totalTasks++;
    this.stats.pendingTasks++;

    console.log(`[BloodwingsWorker] Task queued: ${task.id} (${task.type})`);
    this.emit("task:queued", task);
  }

  // ==========================================================================
  // TASK PROCESSING
  // ==========================================================================

  private async processTasks(): Promise<void> {
    if (!this.isRunning) return;

    // Check for available slots
    const availableSlots = this.config.maxConcurrentTasks - this.activeTasks.size;
    if (availableSlots <= 0) return;

    // Get next tasks
    const tasksToProcess = this.taskQueue.splice(0, availableSlots);

    for (const task of tasksToProcess) {
      this.processTask(task);
    }
  }

  private async processTask(task: GenerationTask): Promise<void> {
    task.status = "processing";
    task.startedAt = new Date();
    this.activeTasks.set(task.id, task);
    this.stats.pendingTasks--;

    console.log(`[BloodwingsWorker] Processing: ${task.id}`);
    this.emit("task:started", task);

    try {
      // Set timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Task timeout")), this.config.taskTimeoutMs);
      });

      // Process based on type
      const resultPromise = task.type === "image"
        ? this.generateImage(task)
        : this.generateVideo(task);

      const result = await Promise.race([resultPromise, timeoutPromise]);

      // Success
      task.status = "completed";
      task.completedAt = new Date();
      task.output = result;

      this.stats.completedTasks++;
      if (task.type === "image") this.stats.imagesGenerated++;
      if (task.type === "video") this.stats.videosGenerated++;

      // Update average processing time
      const processingTime = task.completedAt.getTime() - task.startedAt!.getTime();
      this.updateAverageProcessingTime(processingTime);

      console.log(`[BloodwingsWorker] Completed: ${task.id}`);
      this.emit("task:completed", task);
    } catch (error) {
      task.error = error instanceof Error ? error.message : "Unknown error";

      if (task.retries < task.maxRetries) {
        // Retry
        task.retries++;
        task.status = "pending";
        this.taskQueue.push(task);
        this.stats.pendingTasks++;

        console.log(`[BloodwingsWorker] Retrying: ${task.id} (attempt ${task.retries})`);
        this.emit("task:retry", task);
      } else {
        // Failed
        task.status = "failed";
        task.completedAt = new Date();
        this.stats.failedTasks++;

        console.error(`[BloodwingsWorker] Failed: ${task.id} - ${task.error}`);
        this.emit("task:failed", task);
      }
    }

    // Move to completed
    this.activeTasks.delete(task.id);
    this.completedTasks.set(task.id, task);
  }

  // ==========================================================================
  // GENERATION METHODS
  // ==========================================================================

  private async generateImage(task: GenerationTask): Promise<GenerationTask["output"]> {
    const apiToken = this.config.replicateApiToken || process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
      throw new Error("REPLICATE_API_TOKEN not configured");
    }

    // Build the prompt with style information
    const fullPrompt = this.buildFullPrompt(task.input.prompt, task.input.style);

    // Call Replicate API
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "google/nano-banana-pro",
        input: {
          prompt: fullPrompt,
          negative_prompt: task.input.style?.negativePrompt || "blurry, low quality, distorted",
          width: parseInt(task.input.style?.resolution?.split("x")[0] || "1024"),
          height: parseInt(task.input.style?.resolution?.split("x")[1] || "576"),
          num_inference_steps: task.input.style?.steps || 70,
          guidance_scale: task.input.style?.guidance || 7.5,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    const prediction = await response.json();

    // Poll for completion
    const result = await this.pollForCompletion(prediction.id, apiToken);

    return {
      url: Array.isArray(result.output) ? result.output[0] : result.output,
      urls: Array.isArray(result.output) ? result.output : [result.output],
      metadata: {
        predictionId: prediction.id,
        model: task.input.style?.model,
        processingTime: result.metrics?.predict_time,
      },
    };
  }

  private async generateVideo(task: GenerationTask): Promise<GenerationTask["output"]> {
    const apiToken = this.config.replicateApiToken || process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
      throw new Error("REPLICATE_API_TOKEN not configured");
    }

    // Use image-to-video model
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "stability-ai/stable-video-diffusion",
        input: {
          input_image: task.input.referenceImages?.[0],
          motion_bucket_id: 127,
          fps: task.input.beatSync?.frameRate || 24,
          cond_aug: 0.02,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    const prediction = await response.json();
    const result = await this.pollForCompletion(prediction.id, apiToken);

    return {
      url: Array.isArray(result.output) ? result.output[0] : result.output,
      metadata: {
        predictionId: prediction.id,
        beatSync: task.input.beatSync,
        processingTime: result.metrics?.predict_time,
      },
    };
  }

  private async pollForCompletion(
    predictionId: string,
    apiToken: string,
    maxAttempts: number = 120
  ): Promise<{ output: string | string[]; metrics?: { predict_time?: number } }> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Token ${apiToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to poll prediction: ${response.statusText}`);
      }

      const prediction = await response.json();

      if (prediction.status === "succeeded") {
        return {
          output: prediction.output,
          metrics: prediction.metrics,
        };
      }

      if (prediction.status === "failed") {
        throw new Error(prediction.error || "Prediction failed");
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error("Prediction timed out");
  }

  private buildFullPrompt(basePrompt: string, style?: GenerationStyle): string {
    const stylePrefix = style?.model === "nano-banana-pro"
      ? "Pixar-style dark animation, cinematic lighting, microscopic scale, "
      : "";

    return `${stylePrefix}${basePrompt}`;
  }

  // ==========================================================================
  // BEAT SYNC
  // ==========================================================================

  /**
   * Calculate frame timings based on beat sync config
   */
  calculateBeatSyncFrames(
    durationMs: number,
    beatSync: BeatSyncConfig
  ): { frameNumber: number; timestampMs: number; isOnBeat: boolean }[] {
    const frames: { frameNumber: number; timestampMs: number; isOnBeat: boolean }[] = [];
    const msPerBeat = 60000 / beatSync.bpm;
    const msPerFrame = 1000 / beatSync.frameRate;
    const totalFrames = Math.floor(durationMs / msPerFrame);

    for (let i = 0; i < totalFrames; i++) {
      const timestampMs = i * msPerFrame;
      const adjustedTime = timestampMs - beatSync.beatOffset;
      const beatPosition = adjustedTime / msPerBeat;
      const isOnBeat = Math.abs(beatPosition - Math.round(beatPosition)) < 0.1;

      frames.push({
        frameNumber: i,
        timestampMs,
        isOnBeat,
      });
    }

    return frames;
  }

  /**
   * Analyze audio for BPM detection
   */
  async analyzeBpm(_audioUrl: string): Promise<number> {
    // Placeholder - would integrate with music-tempo library
    // For now, return common BPM for dramatic music
    return 120;
  }

  // ==========================================================================
  // TASK MANAGEMENT
  // ==========================================================================

  /**
   * Cancel a pending task
   */
  cancelTask(taskId: string): boolean {
    const queueIndex = this.taskQueue.findIndex((t) => t.id === taskId);

    if (queueIndex !== -1) {
      const task = this.taskQueue.splice(queueIndex, 1)[0];
      task.status = "cancelled";
      this.completedTasks.set(task.id, task);
      this.stats.pendingTasks--;

      console.log(`[BloodwingsWorker] Cancelled: ${taskId}`);
      this.emit("task:cancelled", task);
      return true;
    }

    return false;
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): GenerationTask | undefined {
    return (
      this.taskQueue.find((t) => t.id === taskId) ||
      this.activeTasks.get(taskId) ||
      this.completedTasks.get(taskId)
    );
  }

  /**
   * Get all tasks for an episode
   */
  getTasksForEpisode(episodeId: string): GenerationTask[] {
    const allTasks = [
      ...this.taskQueue,
      ...this.activeTasks.values(),
      ...this.completedTasks.values(),
    ];

    return allTasks.filter((t) => t.input.episodeId === episodeId);
  }

  // ==========================================================================
  // STATS
  // ==========================================================================

  private createEmptyStats(): WorkerStats {
    return {
      totalTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageProcessingTimeMs: 0,
      imagesGenerated: 0,
      videosGenerated: 0,
    };
  }

  private updateAverageProcessingTime(newTime: number): void {
    const totalCompleted = this.stats.completedTasks;
    const currentAvg = this.stats.averageProcessingTimeMs;

    this.stats.averageProcessingTimeMs =
      (currentAvg * (totalCompleted - 1) + newTime) / totalCompleted;
  }

  getStats(): WorkerStats {
    return { ...this.stats };
  }

  // ==========================================================================
  // ID GENERATION
  // ==========================================================================

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  getQueueLength(): number {
    return this.taskQueue.length;
  }

  getActiveTaskCount(): number {
    return this.activeTasks.size;
  }

  isWorkerRunning(): boolean {
    return this.isRunning;
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let workerInstance: BloodwingsWorkerRuntime | null = null;

export function getBloodwingsWorker(config?: Partial<WorkerConfig>): BloodwingsWorkerRuntime {
  if (!workerInstance) {
    workerInstance = new BloodwingsWorkerRuntime(config);
  }
  return workerInstance;
}
