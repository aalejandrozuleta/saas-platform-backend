import pino, { type Logger as PinoLogger } from 'pino';

import { requestContextStorage } from '../context/async-local-storage';

import type { PlatformLogger } from './logger.interface';
import type { LoggerOptions } from './logger.types';
import { createPinoConfig } from './pino.config';

/**
 * Implementación concreta de {@link PlatformLogger} usando Pino.
 *
 * NO crea instancias globales: cada instancia mantiene su propio logger de
 * Pino configurado con `createPinoConfig`. En la práctica, cada servicio
 * obtiene una única instancia vía {@link LoggerProvider} + inyección de
 * dependencias (token {@link PLATFORM_LOGGER}), en vez de instanciarla
 * directamente.
 *
 * Antes de emitir cada log, enriquece el `meta` recibido con los datos del
 * {@link RequestContext} activo (requestId, correlationId, userId) leídos
 * de {@link requestContextStorage}, si existe uno para la ejecución
 * actual. Esto permite correlacionar todos los logs de una misma request
 * sin que el código que llama a `logger.info(...)` tenga que pasar esos
 * campos explícitamente.
 */
export class PinoLoggerAdapter implements PlatformLogger {
  private readonly logger: PinoLogger;

  constructor(options: LoggerOptions) {
    this.logger = pino(createPinoConfig(options));
  }

  /**
   * Combina el `meta` recibido con los campos del contexto de request
   * activo (si lo hay). El `meta` explícito tiene prioridad sobre el
   * contexto en caso de colisión de claves.
   */
  private enrich(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
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
    enriched ? this.logger.info(enriched, message) : this.logger.info(message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    const enriched = this.enrich(meta);
    enriched ? this.logger.warn(enriched, message) : this.logger.warn(message);
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
    enriched ? this.logger.error(enriched, message) : this.logger.error(message);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    const enriched = this.enrich(meta);
    enriched ? this.logger.debug(enriched, message) : this.logger.debug(message);
  }
}
