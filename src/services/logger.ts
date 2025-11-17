export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const envLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

export class Logger {
  constructor(private readonly level: LogLevel = envLevel) {}

  private shouldLog(level: LogLevel): boolean {
    return levelOrder[level] >= levelOrder[this.level];
  }

  private format(message: string, context?: Record<string, unknown>) {
    return {
      timestamp: new Date().toISOString(),
      level: this.level,
      message,
      ...context,
    };
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (this.shouldLog('debug')) console.debug(JSON.stringify(this.format(message, context)));
  }

  info(message: string, context?: Record<string, unknown>) {
    if (this.shouldLog('info')) console.info(JSON.stringify(this.format(message, context)));
  }

  warn(message: string, context?: Record<string, unknown>) {
    if (this.shouldLog('warn')) console.warn(JSON.stringify(this.format(message, context)));
  }

  error(message: string, context?: Record<string, unknown>) {
    if (this.shouldLog('error')) console.error(JSON.stringify(this.format(message, context)));
  }
}

export const logger = new Logger();
