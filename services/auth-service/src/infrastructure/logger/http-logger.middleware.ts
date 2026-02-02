import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { requestContextStorage } from '@shared/context';
import { PinoLoggerAdapter } from '@shared/logger';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new PinoLoggerAdapter({
    level: 'info',
    serviceName: 'auth-service',
  });

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = req.headers['x-request-id'] as string ?? randomUUID();
    const start = Date.now();

    requestContextStorage.run({ requestId }, () => {
      res.on('finish', () => {
        const durationMs = Date.now() - start;

        this.logger.info('HTTP Request', {
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs,
        });
      });

      next();
    });
  }
}
