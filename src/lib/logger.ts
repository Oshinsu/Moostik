/**
 * MOOSTIK - Structured Logging Service
 *
 * Ce module fournit un système de logging structuré avec niveaux,
 * contexte et formatage pour faciliter le debugging.
 */

// ============================================================================
// TYPES
// ============================================================================

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

interface LoggerConfig {
  /** Minimum level to log (default: 'info' in prod, 'debug' in dev) */
  minLevel?: LogLevel;
  /** Enable colored output (default: true) */
  colors?: boolean;
  /** Include timestamps (default: true) */
  timestamps?: boolean;
  /** Pretty print JSON data (default: true in dev) */
  prettyPrint?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: "\x1b[36m", // Cyan
  info: "\x1b[32m", // Green
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red
};

const RESET_COLOR = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

// ============================================================================
// LOGGER CLASS
// ============================================================================

class Logger {
  private context: string;
  private config: Required<LoggerConfig>;

  constructor(context: string, config: LoggerConfig = {}) {
    this.context = context;
    const isDev = process.env.NODE_ENV !== "production";

    this.config = {
      minLevel: config.minLevel ?? (isDev ? "debug" : "info"),
      colors: config.colors ?? true,
      timestamps: config.timestamps ?? true,
      prettyPrint: config.prettyPrint ?? isDev,
    };
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log("debug", message, data);
  }

  /**
   * Log an info message
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log("info", message, data);
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log("warn", message, data);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorInfo =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error
          ? { message: String(error) }
          : undefined;

    this.log("error", message, { ...data, error: errorInfo });
  }

  /**
   * Create a child logger with additional context
   */
  child(subContext: string): Logger {
    return new Logger(`${this.context}:${subContext}`, this.config);
  }

  /**
   * Time an async operation
   */
  async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    this.debug(`${label} started`);

    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(`${label} completed`, { duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`${label} failed`, error, { duration: `${duration}ms` });
      throw error;
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    // Check if this level should be logged
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      data,
    };

    // Format and output
    const formatted = this.format(entry);

    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  /**
   * Format a log entry
   */
  private format(entry: LogEntry): string {
    const parts: string[] = [];

    // Timestamp
    if (this.config.timestamps) {
      const time = entry.timestamp.split("T")[1].replace("Z", "");
      parts.push(this.colorize(time, DIM));
    }

    // Level
    const levelStr = entry.level.toUpperCase().padEnd(5);
    parts.push(this.colorize(levelStr, LEVEL_COLORS[entry.level], BOLD));

    // Context
    parts.push(this.colorize(`[${entry.context}]`, DIM));

    // Message
    parts.push(entry.message);

    // Data
    if (entry.data && Object.keys(entry.data).length > 0) {
      const dataStr = this.config.prettyPrint
        ? JSON.stringify(entry.data, null, 2)
        : JSON.stringify(entry.data);
      parts.push(this.colorize(dataStr, DIM));
    }

    return parts.join(" ");
  }

  /**
   * Apply ANSI colors if enabled
   */
  private colorize(text: string, ...colors: string[]): string {
    if (!this.config.colors) {
      return text;
    }
    return `${colors.join("")}${text}${RESET_COLOR}`;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a logger for a specific context
 */
export function createLogger(context: string, config?: LoggerConfig): Logger {
  return new Logger(context, config);
}

// ============================================================================
// PRE-CONFIGURED LOGGERS
// ============================================================================

/** Logger for API routes */
export const apiLogger = createLogger("API");

/** Logger for storage operations */
export const storageLogger = createLogger("Storage");

/** Logger for Replicate operations */
export const replicateLogger = createLogger("Replicate");

/** Logger for reference resolution */
export const referenceLogger = createLogger("Reference");

/** Logger for cache operations */
export const cacheLogger = createLogger("Cache");

/** Logger for validation */
export const validationLogger = createLogger("Validation");

// ============================================================================
// GLOBAL LOGGING UTILITIES
// ============================================================================

/**
 * Log application startup info
 */
export function logStartup(): void {
  const logger = createLogger("App");
  logger.info("Application starting", {
    nodeVersion: process.version,
    env: process.env.NODE_ENV,
    cwd: process.cwd(),
  });
}

/**
 * Log a request (for API routes)
 */
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number
): void {
  const logger = apiLogger.child("Request");
  const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

  logger[level](`${method} ${url}`, {
    statusCode,
    duration: `${duration}ms`,
  });
}

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

interface PerformanceMetrics {
  operation: string;
  startTime: number;
  checkpoints: { label: string; time: number }[];
}

class PerformanceTracker {
  private metrics: PerformanceMetrics;
  private logger: Logger;

  constructor(operation: string, context: string = "Performance") {
    this.logger = createLogger(context);
    this.metrics = {
      operation,
      startTime: Date.now(),
      checkpoints: [],
    };
  }

  checkpoint(label: string): void {
    this.metrics.checkpoints.push({
      label,
      time: Date.now(),
    });
  }

  finish(): void {
    const totalTime = Date.now() - this.metrics.startTime;
    const checkpointData: Record<string, string> = {};

    let lastTime = this.metrics.startTime;
    for (const cp of this.metrics.checkpoints) {
      checkpointData[cp.label] = `${cp.time - lastTime}ms`;
      lastTime = cp.time;
    }

    this.logger.info(`${this.metrics.operation} completed`, {
      total: `${totalTime}ms`,
      ...checkpointData,
    });
  }

  /** Alias for finish() for backward compatibility */
  end(): void {
    this.finish();
  }
}

export function trackPerformance(operation: string, context?: string): PerformanceTracker {
  return new PerformanceTracker(operation, context);
}

export { Logger };
export type { LogLevel, LogEntry, LoggerConfig };
