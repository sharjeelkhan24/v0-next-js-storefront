/**
 * Production-ready logging utility
 * Replaces console.log with structured logging
 * 
 * In production, this can be extended to send logs to:
 * - Sentry, LogRocket, Datadog, etc.
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  environment: string
}

class Logger {
  private isDevelopment: boolean
  private isServer: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development"
    this.isServer = typeof window === "undefined"
  }

  private formatEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      environment: this.isDevelopment ? "development" : "production",
    }
  }

  private output(entry: LogEntry): void {
    // In production, only log warnings and errors unless DEBUG is set
    if (!this.isDevelopment && entry.level === "debug" && !process.env.DEBUG) {
      return
    }

    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : ""

    switch (entry.level) {
      case "debug":
        if (this.isDevelopment) {
          console.debug(`${prefix} ${entry.message}${contextStr}`)
        }
        break
      case "info":
        console.info(`${prefix} ${entry.message}${contextStr}`)
        break
      case "warn":
        console.warn(`${prefix} ${entry.message}${contextStr}`)
        break
      case "error":
        console.error(`${prefix} ${entry.message}${contextStr}`)
        break
    }

    // In production, send to external logging service
    if (!this.isDevelopment && this.isServer) {
      this.sendToExternalService(entry)
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // Placeholder for external logging service integration
    // Examples: Sentry, LogRocket, Datadog, AWS CloudWatch
    
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureMessage(entry.message, {
    //     level: entry.level,
    //     extra: entry.context,
    //   })
    // }
  }

  debug(message: string, context?: LogContext): void {
    this.output(this.formatEntry("debug", message, context))
  }

  info(message: string, context?: LogContext): void {
    this.output(this.formatEntry("info", message, context))
  }

  warn(message: string, context?: LogContext): void {
    this.output(this.formatEntry("warn", message, context))
  }

  error(message: string, context?: LogContext): void {
    this.output(this.formatEntry("error", message, context))
  }

  /**
   * Log an error with stack trace
   */
  exception(error: Error, context?: LogContext): void {
    this.output(
      this.formatEntry("error", error.message, {
        ...context,
        stack: error.stack,
        name: error.name,
      })
    )
  }

  /**
   * Create a child logger with preset context
   */
  child(defaultContext: LogContext): ChildLogger {
    return new ChildLogger(this, defaultContext)
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private defaultContext: LogContext
  ) {}

  private mergeContext(context?: LogContext): LogContext {
    return { ...this.defaultContext, ...context }
  }

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, this.mergeContext(context))
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, this.mergeContext(context))
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, this.mergeContext(context))
  }

  error(message: string, context?: LogContext): void {
    this.parent.error(message, this.mergeContext(context))
  }

  exception(error: Error, context?: LogContext): void {
    this.parent.exception(error, this.mergeContext(context))
  }
}

// Export singleton instance
export const logger = new Logger()

// Export types for external use
export type { LogLevel, LogContext, LogEntry }
