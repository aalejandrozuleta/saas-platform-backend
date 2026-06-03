import type { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@saas/shared';
import { buildGatewayErrorResponse } from '@infrastructure/errors/gateway-error-response.util';

/**
 * Evita que el gateway quede colgado si un servicio no responde.
 */
export function timeoutMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setTimeout(10_000, () => {
    if (!res.headersSent) {
      res.status(504).json(
        buildGatewayErrorResponse(
          req,
          504,
          ErrorCode.GATEWAY_TIMEOUT,
          'common.gateway_timeout',
        ),
      );
    }
  });

  next();
}
