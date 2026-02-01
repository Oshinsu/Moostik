/**
 * MOOSTIK Video Generation Metrics
 * Tracking and analytics for video generation - January 2026
 *
 * Monitors performance, costs, and quality across providers
 */

import { VideoProvider, VideoGenerationOutput, VideoStatus } from "./types";
import { PromptScore } from "./prompt-scorer";

// ============================================
// TYPES
// ============================================

export interface GenerationMetric {
  id: string;
  timestamp: string;
  provider: VideoProvider;
  status: VideoStatus;
  
  // Timing
  startTime: number;
  endTime?: number;
  durationMs?: number;
  estimatedMs?: number;
  
  // Cost
  costUsd?: number;
  
  // Quality
  promptScore?: number;
  promptLength: number;
  
  // Request details
  requestedDurationSec: number;
  actualDurationSec?: number;
  resolution?: string;
  aspectRatio: string;
  
  // Result
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  
  // Context
  episodeId?: string;
  shotId?: string;
  variationId?: string;
  sceneType?: string;
}

export interface ProviderStats {
  provider: VideoProvider;
  totalGenerations: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  
  // Timing
  averageProcessingMs: number;
  minProcessingMs: number;
  maxProcessingMs: number;
  
  // Cost
  totalCostUsd: number;
  averageCostPerVideo: number;
  costPer5sVideo: number;
  
  // Quality correlation
  averagePromptScore: number;
  scoreSuccessCorrelation: number; // -1 to 1
  
  // Errors
  commonErrors: { code: string; count: number }[];
  
  // Recent activity
  last24hCount: number;
  last7dCount: number;
}

export interface SessionMetrics {
  sessionId: string;
  startTime: string;
  endTime?: string;
  
  // Totals
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  
  // Cost
  totalCostUsd: number;
  budgetUsedPercent?: number;
  
  // By provider
  providerBreakdown: Record<VideoProvider, {
    count: number;
    success: number;
    cost: number;
    avgTimeMs: number;
  }>;
  
  // By episode/shot
  episodeBreakdown?: Record<string, {
    shotCount: number;
    completedCount: number;
    totalCost: number;
  }>;
  
  // Quality
  averagePromptScore: number;
  promptScoreDistribution: Record<string, number>; // A: 5, B: 10, etc.
}

export interface QualityMetrics {
  promptScore: number;
  generationSuccess: boolean;
  provider: VideoProvider;
  sceneType?: string;
  timestamp: string;
}

// ============================================
// METRICS STORE (In-Memory)
// ============================================

class MetricsStore {
  private metrics: GenerationMetric[] = [];
  private qualityData: QualityMetrics[] = [];
  private currentSession: SessionMetrics | null = null;
  private maxStoredMetrics = 1000;
  
  /**
   * Start a new metrics session
   */
  startSession(sessionId?: string): SessionMetrics {
    this.currentSession = {
      sessionId: sessionId || `session-${Date.now()}`,
      startTime: new Date().toISOString(),
      totalGenerations: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      totalCostUsd: 0,
      providerBreakdown: {} as SessionMetrics['providerBreakdown'],
      averagePromptScore: 0,
      promptScoreDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
    };
    return this.currentSession;
  }
  
  /**
   * End current session
   */
  endSession(): SessionMetrics | null {
    if (this.currentSession) {
      this.currentSession.endTime = new Date().toISOString();
    }
    return this.currentSession;
  }
  
  /**
   * Record a generation start
   */
  recordGenerationStart(
    id: string,
    provider: VideoProvider,
    details: {
      promptLength: number;
      promptScore?: number;
      requestedDurationSec: number;
      aspectRatio: string;
      resolution?: string;
      episodeId?: string;
      shotId?: string;
      variationId?: string;
      sceneType?: string;
    }
  ): GenerationMetric {
    const metric: GenerationMetric = {
      id,
      timestamp: new Date().toISOString(),
      provider,
      status: 'starting',
      startTime: Date.now(),
      promptScore: details.promptScore,
      promptLength: details.promptLength,
      requestedDurationSec: details.requestedDurationSec,
      aspectRatio: details.aspectRatio,
      resolution: details.resolution,
      success: false,
      retryCount: 0,
      episodeId: details.episodeId,
      shotId: details.shotId,
      variationId: details.variationId,
      sceneType: details.sceneType,
    };
    
    this.metrics.push(metric);
    this.trimMetrics();
    
    return metric;
  }
  
  /**
   * Update generation with completion status
   */
  recordGenerationComplete(
    id: string,
    result: Partial<GenerationMetric>
  ): GenerationMetric | null {
    const metric = this.metrics.find(m => m.id === id);
    if (!metric) return null;
    
    const endTime = Date.now();
    Object.assign(metric, {
      ...result,
      endTime,
      durationMs: endTime - metric.startTime,
    });
    
    // Update session
    if (this.currentSession) {
      this.currentSession.totalGenerations++;
      
      if (metric.success) {
        this.currentSession.successfulGenerations++;
      } else {
        this.currentSession.failedGenerations++;
      }
      
      if (metric.costUsd) {
        this.currentSession.totalCostUsd += metric.costUsd;
      }
      
      // Update provider breakdown
      const pb = this.currentSession.providerBreakdown[metric.provider] || {
        count: 0, success: 0, cost: 0, avgTimeMs: 0
      };
      pb.count++;
      if (metric.success) pb.success++;
      pb.cost += metric.costUsd || 0;
      pb.avgTimeMs = (pb.avgTimeMs * (pb.count - 1) + (metric.durationMs || 0)) / pb.count;
      this.currentSession.providerBreakdown[metric.provider] = pb;
      
      // Update prompt score distribution
      if (metric.promptScore) {
        const grade = this.getGrade(metric.promptScore);
        this.currentSession.promptScoreDistribution[grade]++;
      }
    }
    
    // Record quality correlation data
    if (metric.promptScore !== undefined) {
      this.qualityData.push({
        promptScore: metric.promptScore,
        generationSuccess: metric.success,
        provider: metric.provider,
        sceneType: metric.sceneType,
        timestamp: metric.timestamp,
      });
    }
    
    return metric;
  }
  
  /**
   * Record a retry attempt
   */
  recordRetry(id: string): void {
    const metric = this.metrics.find(m => m.id === id);
    if (metric) {
      metric.retryCount++;
    }
  }
  
  /**
   * Get provider statistics
   */
  getProviderStats(provider: VideoProvider, timeRangeMs?: number): ProviderStats {
    const now = Date.now();
    const cutoff = timeRangeMs ? now - timeRangeMs : 0;
    
    const providerMetrics = this.metrics.filter(
      m => m.provider === provider && new Date(m.timestamp).getTime() > cutoff
    );
    
    const successful = providerMetrics.filter(m => m.success);
    const failed = providerMetrics.filter(m => !m.success);
    
    // Calculate timing stats
    const durations = successful
      .map(m => m.durationMs)
      .filter((d): d is number => d !== undefined);
    
    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;
    
    // Calculate cost stats
    const costs = providerMetrics
      .map(m => m.costUsd)
      .filter((c): c is number => c !== undefined);
    
    const totalCost = costs.reduce((a, b) => a + b, 0);
    
    // Calculate prompt score stats
    const scores = providerMetrics
      .map(m => m.promptScore)
      .filter((s): s is number => s !== undefined);
    
    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
    
    // Calculate score-success correlation
    const correlation = this.calculateScoreSuccessCorrelation(providerMetrics);
    
    // Error analysis
    const errorCounts: Record<string, number> = {};
    failed.forEach(m => {
      if (m.errorCode) {
        errorCounts[m.errorCode] = (errorCounts[m.errorCode] || 0) + 1;
      }
    });
    
    const commonErrors = Object.entries(errorCounts)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Recent activity
    const day = 24 * 60 * 60 * 1000;
    const last24h = providerMetrics.filter(
      m => new Date(m.timestamp).getTime() > now - day
    ).length;
    const last7d = providerMetrics.filter(
      m => new Date(m.timestamp).getTime() > now - 7 * day
    ).length;
    
    return {
      provider,
      totalGenerations: providerMetrics.length,
      successCount: successful.length,
      failureCount: failed.length,
      successRate: providerMetrics.length > 0
        ? successful.length / providerMetrics.length
        : 0,
      averageProcessingMs: avgDuration,
      minProcessingMs: durations.length > 0 ? Math.min(...durations) : 0,
      maxProcessingMs: durations.length > 0 ? Math.max(...durations) : 0,
      totalCostUsd: totalCost,
      averageCostPerVideo: costs.length > 0 ? totalCost / costs.length : 0,
      costPer5sVideo: costs.length > 0 ? (totalCost / costs.length) : 0,
      averagePromptScore: avgScore,
      scoreSuccessCorrelation: correlation,
      commonErrors,
      last24hCount: last24h,
      last7dCount: last7d,
    };
  }
  
  /**
   * Get all provider stats
   */
  getAllProviderStats(): ProviderStats[] {
    const providers = Array.from(new Set(this.metrics.map(m => m.provider)));
    return providers.map(p => this.getProviderStats(p));
  }
  
  /**
   * Get current session metrics
   */
  getCurrentSession(): SessionMetrics | null {
    return this.currentSession;
  }
  
  /**
   * Get quality correlation data
   */
  getQualityCorrelation(provider?: VideoProvider): {
    avgScoreSuccessful: number;
    avgScoreFailed: number;
    correlation: number;
    sampleSize: number;
  } {
    const data = provider
      ? this.qualityData.filter(q => q.provider === provider)
      : this.qualityData;
    
    if (data.length === 0) {
      return {
        avgScoreSuccessful: 0,
        avgScoreFailed: 0,
        correlation: 0,
        sampleSize: 0,
      };
    }
    
    const successful = data.filter(q => q.generationSuccess);
    const failed = data.filter(q => !q.generationSuccess);
    
    const avgSuccessScore = successful.length > 0
      ? successful.reduce((a, b) => a + b.promptScore, 0) / successful.length
      : 0;
    
    const avgFailedScore = failed.length > 0
      ? failed.reduce((a, b) => a + b.promptScore, 0) / failed.length
      : 0;
    
    return {
      avgScoreSuccessful: avgSuccessScore,
      avgScoreFailed: avgFailedScore,
      correlation: this.calculateScoreSuccessCorrelation(
        data.map(d => ({
          promptScore: d.promptScore,
          success: d.generationSuccess,
        }))
      ),
      sampleSize: data.length,
    };
  }
  
  /**
   * Export metrics as JSON
   */
  exportMetrics(): {
    metrics: GenerationMetric[];
    session: SessionMetrics | null;
    providerStats: ProviderStats[];
    qualityCorrelation: {
      avgScoreSuccessful: number;
      avgScoreFailed: number;
      correlation: number;
      sampleSize: number;
    };
  } {
    return {
      metrics: this.metrics,
      session: this.currentSession,
      providerStats: this.getAllProviderStats(),
      qualityCorrelation: this.getQualityCorrelation(),
    };
  }
  
  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.qualityData = [];
    this.currentSession = null;
  }
  
  // ============================================
  // PRIVATE HELPERS
  // ============================================
  
  private trimMetrics(): void {
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics = this.metrics.slice(-this.maxStoredMetrics);
    }
    if (this.qualityData.length > this.maxStoredMetrics) {
      this.qualityData = this.qualityData.slice(-this.maxStoredMetrics);
    }
  }
  
  private getGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
  
  private calculateScoreSuccessCorrelation(
    data: Array<{ promptScore?: number; success: boolean }>
  ): number {
    const withScores = data.filter(d => d.promptScore !== undefined);
    if (withScores.length < 5) return 0; // Not enough data
    
    // Simple correlation: difference in means
    const successScores = withScores.filter(d => d.success).map(d => d.promptScore!);
    const failScores = withScores.filter(d => !d.success).map(d => d.promptScore!);
    
    if (successScores.length === 0 || failScores.length === 0) return 0;
    
    const avgSuccess = successScores.reduce((a, b) => a + b, 0) / successScores.length;
    const avgFail = failScores.reduce((a, b) => a + b, 0) / failScores.length;
    
    // Normalize to -1 to 1 range
    const diff = avgSuccess - avgFail;
    return Math.max(-1, Math.min(1, diff / 50)); // 50 point difference = correlation of 1
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const metricsStore = new MetricsStore();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Start tracking a generation
 */
export function trackGenerationStart(
  id: string,
  provider: VideoProvider,
  details: Parameters<MetricsStore['recordGenerationStart']>[2]
): GenerationMetric {
  return metricsStore.recordGenerationStart(id, provider, details);
}

/**
 * Record generation completion
 */
export function trackGenerationComplete(
  id: string,
  result: Partial<GenerationMetric>
): GenerationMetric | null {
  return metricsStore.recordGenerationComplete(id, result);
}

/**
 * Get stats for a provider
 */
export function getProviderMetrics(provider: VideoProvider): ProviderStats {
  return metricsStore.getProviderStats(provider);
}

/**
 * Get all metrics
 */
export function getAllMetrics() {
  return metricsStore.exportMetrics();
}

/**
 * Start a new session
 */
export function startMetricsSession(sessionId?: string): SessionMetrics {
  return metricsStore.startSession(sessionId);
}

/**
 * End current session
 */
export function endMetricsSession(): SessionMetrics | null {
  return metricsStore.endSession();
}

/**
 * Get current session
 */
export function getCurrentSessionMetrics(): SessionMetrics | null {
  return metricsStore.getCurrentSession();
}
