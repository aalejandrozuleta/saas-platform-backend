import { randomUUID } from 'node:crypto';

import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { defer, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import type { Request, Response } from 'express';

import { requestContextStorage } from '../context/async-local-storage';

import { PLATFORM_LOGGER } from './logger.token';
import type { PlatformLogger } from './logger.interface';

@Injectable()
export class HttpRequestLoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(PLATFORM_LOGGER)
    private readonly logger: PlatformLogger,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const startNs = process.hrtime.bigint();
    let thrown: unknown;

    const correlationId = this.resolveCorrelationId(req);

    // Always echo correlation id for clients and for upstream services.
    res.setHeader('x-correlation-id', correlationId);
    (req.headers as Record<string, unknown>)['x-correlation-id'] =
      correlationId;

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
          const durationMs =
            Number(process.hrtime.bigint() - startNs) / 1_000_000;

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
            typeof req.headers['user-agent'] === 'string'
              ? req.headers['user-agent']
              : undefined;

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

          if (this.isLowValuePath(path)) {
            this.logger.debug('HTTP request completed', meta);
            return;
          }

          this.logger.info('HTTP request completed', meta);
        }),
      ),
    );
  }

  private isLowValuePath(path: string): boolean {
    return /\/(metrics|health)(\/|$)/.test(path);
  }

  private resolveCorrelationId(req: Request): string {
    const header =
      (req.headers['x-correlation-id'] as unknown) ??
      (req.headers['x-request-id'] as unknown);

    return typeof header === 'string' && header.trim().length > 0
      ? header
      : randomUUID();
  }
}
