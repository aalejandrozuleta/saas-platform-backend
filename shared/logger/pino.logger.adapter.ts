import pino, { type Logger as PinoLogger } from 'pino';

import { requestContextStorage } from '../context/async-local-storage';

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

  private enrich(
    meta?: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    const ctx = requestContextStorage.getStore();
    if (!ctx) return meta;

    const ctxMeta: Record<string, unknown> = {
      requestId: ctx.requestId,
      correlationId: ctx.correlationId,
      userId: ctx.userId,
    };

    if (!meta) return ctxMeta;

    return { ...ctxMeta, ...meta };
  }

  info(message: string, meta?: Record<string, unknown>): void {
    const enriched = this.enrich(meta);
    enriched
      ? this.logger.info(enriched, message)
      : this.logger.info(message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    const enriched = this.enrich(meta);
    enriched
      ? this.logger.warn(enriched, message)
      : this.logger.warn(message);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    const ctx = requestContextStorage.getStore();

    if (meta instanceof Error) {
      if (ctx) {
        this.logger.error(
          {
            requestId: ctx.requestId,
            correlationId: ctx.correlationId,
            userId: ctx.userId,
            err: meta,
          },
          message,
        );
        return;
      }

      this.logger.error(meta, message);
      return;
    }

    const enriched = this.enrich(meta);
    enriched
      ? this.logger.error(enriched, message)
      : this.logger.error(message);
  }


  debug(message: string, meta?: Record<string, unknown>): void {
    const enriched = this.enrich(meta);
    enriched
      ? this.logger.debug(enriched, message)
      : this.logger.debug(message);
  }
}
