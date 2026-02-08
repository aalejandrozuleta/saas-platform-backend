import { randomUUID } from 'node:crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { requestContextStorage } from '../context';

import { logger } from './logger.factory';



/**
 * Middleware HTTP para logging estructurado con contexto de request.
 *
 * - Genera requestId y correlationId
 * - Mide duración de la petición
 * - Inyecta contexto async (ALS)
 */
@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();

    const correlationId =
      (req.headers['x-correlation-id'] as string | undefined) ?? requestId;

    const startTime = Date.now();

    requestContextStorage.run(
      { requestId, correlationId },
      () => {
        res.on('finish', () => {
          const durationMs = Date.now() - startTime;

          logger.info('HTTP Request', {
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
