export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  readonly module?: string;
  readonly feature?: string;
  readonly userId?: string;
  readonly tags?: string[];
  readonly extras?: Record<string, unknown>;
  readonly breadcrumbs?: LoggerBreadcrumb[];
  readonly [key: string]: unknown;
}

export interface LoggerBreadcrumb {
  readonly category: string;
  readonly message?: string;
  readonly level?: LogLevel;
  readonly data?: Record<string, unknown>;
  readonly timestamp?: Date;
}

export interface LoggerUser {
  readonly id: string;
  readonly email?: string;
  readonly username?: string;
  readonly ipAddress?: string;
  readonly data?: Record<string, unknown>;
}

export interface LoggerService {
  readonly name?: string;

  setUser(user: LoggerUser | null): void;

  addBreadcrumb(breadcrumb: LoggerBreadcrumb): void;

  log(level: LogLevel, message: string, context?: LogContext): void;

  debug(message: string, context?: LogContext): void;

  info(message: string, context?: LogContext): void;

  warn(message: string, context?: LogContext): void;

  error(error: unknown, context?: LogContext): void;

  fatal(error: unknown, context?: LogContext): void;

  captureException(error: unknown, context?: LogContext): string | void;

  captureMessage(message: string, level?: LogLevel, context?: LogContext): string | void;

  flush(timeoutMs?: number): Promise<boolean>;
}
