import pino, { Logger as PinoLogger } from 'pino';
import { PlatformLogger } from './logger.interface';
import { LoggerOptions } from './logger.types';
import { createPinoConfig } from './pino.config';

/**
 * Implementación concreta del logger usando Pino.
 */
export class PinoLoggerAdapter implements PlatformLogger {
  private readonly logger: PinoLogger;

  constructor(options: LoggerOptions) {
    this.logger = pino(createPinoConfig(options));
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(meta ?? {}, message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(meta ?? {}, message);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error(meta ?? {}, message);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(meta ?? {}, message);
  }
}
