/**
 * MOOSTIK Generation Queue
 * Simple in-memory job queue for generation tasks
 *
 * For production, consider using:
 * - Redis + Bull/BullMQ
 * - Upstash QStash
 * - Vercel Cron + KV
 */

import { EventEmitter } from "events";

// ============================================================================
// TYPES
// ============================================================================

export type JobStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export interface GenerationJob {
  id: string;
  type: "image" | "video" | "batch";
  status: JobStatus;
  priority: number; // Higher = more urgent
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  userId: string;
  payload: {
    episodeId?: string;
    shotId?: string;
    shotIds?: string[];
    prompt?: unknown;
    options?: Record<string, unknown>;
  };
  result?: {
    success: boolean;
    imageUrls?: string[];
    videoUrl?: string;
    error?: string;
  };
  retries: number;
  maxRetries: number;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalProcessed: number;
  averageProcessingTimeMs: number;
}

// ============================================================================
// QUEUE IMPLEMENTATION
// ============================================================================

class GenerationQueue extends EventEmitter {
  private jobs: Map<string, GenerationJob> = new Map();
  private processingQueue: GenerationJob[] = [];
  private maxConcurrent: number;
  private isProcessing: boolean = false;
  private processedCount: number = 0;
  private totalProcessingTimeMs: number = 0;

  constructor(maxConcurrent: number = 3) {
    super();
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Add a new job to the queue
   */
  addJob(job: Omit<GenerationJob, "id" | "status" | "createdAt" | "retries">): GenerationJob {
    const fullJob: GenerationJob = {
      ...job,
      id: this.generateJobId(),
      status: "pending",
      createdAt: new Date(),
      retries: 0,
      maxRetries: job.maxRetries ?? 3,
    };

    this.jobs.set(fullJob.id, fullJob);
    this.processingQueue.push(fullJob);

    // Sort by priority (higher first)
    this.processingQueue.sort((a, b) => b.priority - a.priority);

    this.emit("job:added", fullJob);

    // Start processing if not already
    this.processNext();

    return fullJob;
  }

  /**
   * Get job by ID
   */
  getJob(id: string): GenerationJob | undefined {
    return this.jobs.get(id);
  }

  /**
   * Get all jobs for a user
   */
  getUserJobs(userId: string): GenerationJob[] {
    return Array.from(this.jobs.values()).filter((job) => job.userId === userId);
  }

  /**
   * Cancel a job
   */
  cancelJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;

    if (job.status === "pending") {
      job.status = "cancelled";
      this.processingQueue = this.processingQueue.filter((j) => j.id !== id);
      this.emit("job:cancelled", job);
      return true;
    }

    return false; // Can't cancel processing/completed jobs
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const jobs = Array.from(this.jobs.values());

    return {
      pending: jobs.filter((j) => j.status === "pending").length,
      processing: jobs.filter((j) => j.status === "processing").length,
      completed: jobs.filter((j) => j.status === "completed").length,
      failed: jobs.filter((j) => j.status === "failed").length,
      totalProcessed: this.processedCount,
      averageProcessingTimeMs:
        this.processedCount > 0 ? this.totalProcessingTimeMs / this.processedCount : 0,
    };
  }

  /**
   * Process next job in queue
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing) return;

    const processingJobs = Array.from(this.jobs.values()).filter(
      (j) => j.status === "processing"
    );

    if (processingJobs.length >= this.maxConcurrent) return;

    const nextJob = this.processingQueue.shift();
    if (!nextJob) return;

    this.isProcessing = true;
    nextJob.status = "processing";
    nextJob.startedAt = new Date();

    this.emit("job:started", nextJob);

    try {
      // Process the job (this would call actual generation logic)
      const result = await this.processJob(nextJob);

      nextJob.status = "completed";
      nextJob.completedAt = new Date();
      nextJob.result = result;

      const processingTime = nextJob.completedAt.getTime() - nextJob.startedAt.getTime();
      this.totalProcessingTimeMs += processingTime;
      this.processedCount++;

      this.emit("job:completed", nextJob);
    } catch (error) {
      if (nextJob.retries < nextJob.maxRetries) {
        // Retry
        nextJob.retries++;
        nextJob.status = "pending";
        this.processingQueue.push(nextJob);
        this.emit("job:retry", nextJob);
      } else {
        // Failed
        nextJob.status = "failed";
        nextJob.completedAt = new Date();
        nextJob.result = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
        this.emit("job:failed", nextJob);
      }
    }

    this.isProcessing = false;

    // Process next job
    this.processNext();
  }

  /**
   * Actual job processing logic
   * Override this in production with real generation
   */
  private async processJob(job: GenerationJob): Promise<GenerationJob["result"]> {
    // Placeholder - in production, this would call the generation API
    console.log(`[Queue] Processing job ${job.id} (type: ${job.type})`);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      imageUrls: [],
    };
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Clean up old jobs (call periodically)
   */
  cleanup(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - maxAgeMs;
    let cleaned = 0;

    for (const [id, job] of this.jobs.entries()) {
      if (
        (job.status === "completed" || job.status === "failed" || job.status === "cancelled") &&
        job.createdAt.getTime() < cutoff
      ) {
        this.jobs.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Set the processor function for job execution
   */
  setProcessor(
    processor: (job: GenerationJob) => Promise<GenerationJob["result"]>
  ): void {
    this.processJob = processor.bind(this);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let queueInstance: GenerationQueue | null = null;

export function getGenerationQueue(maxConcurrent: number = 3): GenerationQueue {
  if (!queueInstance) {
    queueInstance = new GenerationQueue(maxConcurrent);
  }
  return queueInstance;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create an image generation job
 */
export function createImageJob(
  userId: string,
  episodeId: string,
  shotId: string,
  prompt: unknown,
  priority: number = 5
): GenerationJob {
  const queue = getGenerationQueue();

  return queue.addJob({
    type: "image",
    userId,
    priority,
    payload: {
      episodeId,
      shotId,
      prompt,
    },
    maxRetries: 3,
  });
}

/**
 * Create a batch generation job
 */
export function createBatchJob(
  userId: string,
  episodeId: string,
  shotIds: string[],
  options?: Record<string, unknown>,
  priority: number = 5
): GenerationJob {
  const queue = getGenerationQueue();

  return queue.addJob({
    type: "batch",
    userId,
    priority,
    payload: {
      episodeId,
      shotIds,
      options,
    },
    maxRetries: 2,
  });
}

/**
 * Create a video generation job
 */
export function createVideoJob(
  userId: string,
  episodeId: string,
  shotId: string,
  options?: Record<string, unknown>,
  priority: number = 3
): GenerationJob {
  const queue = getGenerationQueue();

  return queue.addJob({
    type: "video",
    userId,
    priority,
    payload: {
      episodeId,
      shotId,
      options,
    },
    maxRetries: 2,
  });
}
