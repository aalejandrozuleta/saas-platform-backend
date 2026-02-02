import { randomUUID } from 'node:crypto';
import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { requestContextStorage } from '@saas/shared';
import { logger } from '@saas/shared';

/**
 * Middleware de logging global del Gateway.
 * Se ejecuta una sola vez por request entrante.
 */
@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
    const correlationId =
      (req.headers['x-correlation-id'] as string) ?? requestId;

    const start = Date.now();

    requestContextStorage.run(
      {
        requestId,
        correlationId,
      },
      () => {
        res.on('finish', () => {
          const durationMs = Date.now() - start;

          logger.info('Incoming request', {
            requestId,
            correlationId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs,
          });
        });

        next();
      },
    );
  }
}
