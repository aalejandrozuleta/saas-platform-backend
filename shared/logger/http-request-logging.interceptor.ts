import { randomUUID } from 'node:crypto';

import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { defer, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import type { Request, Response } from 'express';

import { requestContextStorage } from '../context/async-local-storage';

import { PLATFORM_LOGGER } from './logger.token';
import type { PlatformLogger } from './logger.interface';

/**
 * Interceptor global que establece el {@link RequestContext} de cada
 * request HTTP y loguea su resultado al finalizar.
 *
 * Se registra como `APP_INTERCEPTOR` en {@link SharedModule}, por lo que
 * se aplica automáticamente a todas las rutas de un servicio sin
 * configuración adicional. Responsabilidades:
 *
 * - Resuelve o genera un `correlationId` (header `x-correlation-id` /
 *   `x-request-id`, o `randomUUID()` si no viene ninguno) y lo devuelve en
 *   la respuesta vía el header `x-correlation-id`.
 * - Ejecuta el resto del pipeline dentro de
 *   `requestContextStorage.run(ctx, ...)`, para que {@link PinoLoggerAdapter}
 *   y cualquier otro consumidor de {@link requestContextStorage} tengan
 *   acceso al contexto durante toda la request.
 * - Al finalizar (éxito o error), emite un log estructurado con método,
 *   ruta, status, duración, IP y user agent. Las rutas de polling
 *   (`/metrics`, `/health`, `/maintenance/status`) se omiten en 2xx para no
 *   inundar los logs.
 */
@Injectable()
export class HttpRequestLoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(PLATFORM_LOGGER)
    private readonly logger: PlatformLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const startNs = process.hrtime.bigint();
    let thrown: unknown;

    const correlationId = this.resolveCorrelationId(req);

    // Always echo correlation id for clients and for upstream services.
    res.setHeader('x-correlation-id', correlationId);
    (req.headers as Record<string, unknown>)['x-correlation-id'] = correlationId;

    const userId =
      (req as any).user?.id && typeof (req as any).user.id === 'string'
        ? (req as any).user.id
        : undefined;

    const ctx = {
      requestId: correlationId,
      correlationId,
      userId,
    };

    return requestContextStorage.run(ctx, () =>
      defer(() => next.handle()).pipe(
        catchError((err: unknown) => {
          thrown = err;
          throw err;
        }),
        finalize(() => {
          const durationMs = Number(process.hrtime.bigint() - startNs) / 1_000_000;

          const defaultStatus = thrown ? 500 : 200;
          const status =
            typeof res.statusCode === 'number' && res.statusCode > 0
              ? res.statusCode
              : defaultStatus;

          const method = req.method;
          const path = req.originalUrl ?? req.url ?? 'unknown';

          const ip =
            typeof req.headers['x-forwarded-for'] === 'string'
              ? req.headers['x-forwarded-for'].split(',')[0].trim()
              : req.ip;

          const userAgent =
            typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;

          const meta: Record<string, unknown> = {
            event: 'http.request',
            method,
            path,
            status,
            durationMs: Math.round(durationMs * 100) / 100,
            correlationId,
            userId,
            ip,
            userAgent,
          };

          if (thrown instanceof Error) {
            meta.err = thrown;
          }

          if (status >= 500) {
            this.logger.error('HTTP request failed', meta);
            return;
          }

          if (status >= 400) {
            this.logger.warn('HTTP request client error', meta);
            return;
          }

          if (this.isPollingPath(path)) {
            // Scrapers/healthchecks pegan estas rutas cada pocos segundos y una
            // respuesta 2xx no aporta nada al entender un proceso; se omite el
            // log entero (no solo se baja a debug) para no ensuciar la salida
            // incluso en LOG_LEVEL=debug. Los fallos (4xx/5xx) igual se loguean,
            // porque esas ramas corren antes de llegar aquí.
            return;
          }

          this.logger.info('HTTP request completed', meta);
        }),
      ),
    );
  }

  private isPollingPath(path: string): boolean {
    return /\/(metrics|health|maintenance\/status)(\/|$|\?)/.test(path);
  }

  private resolveCorrelationId(req: Request): string {
    const header =
      (req.headers['x-correlation-id'] as unknown) ?? (req.headers['x-request-id'] as unknown);

    return typeof header === 'string' && header.trim().length > 0 ? header : randomUUID();
  }
}
