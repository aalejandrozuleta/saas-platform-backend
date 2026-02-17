import pino, { Logger as PinoLogger } from 'pino';

import { PlatformLogger } from './logger.interface';
import { LoggerOptions } from './logger.types';
import { createPinoConfig } from './pino.config';

/**
 * Implementación concreta del logger usando Pino.
 * NO crea instancias globales.
 */
export class PinoLoggerAdapter implements PlatformLogger {
  private readonly logger: PinoLogger;

  constructor(options: LoggerOptions) {
    this.logger = pino(createPinoConfig(options));
  }

  info(message: string, meta?: Record<string, unknown>): void {
    meta ? this.logger.info(meta, message) : this.logger.info(message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    meta ? this.logger.warn(meta, message) : this.logger.warn(message);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    if (meta instanceof Error) {
      this.logger.error(meta, message);
    } else {
      meta
        ? this.logger.error(meta, message)
        : this.logger.error(message);
    }
  }


  debug(message: string, meta?: Record<string, unknown>): void {
    meta ? this.logger.debug(meta, message) : this.logger.debug(message);
  }
}
