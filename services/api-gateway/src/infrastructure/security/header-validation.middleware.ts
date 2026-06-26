import type { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@saas/shared';
import { buildGatewayErrorResponse } from '@infrastructure/errors/gateway-error-response.util';

/**
 * Valida headers mínimos esperados en el gateway.
 * Evita requests malformadas o sospechosas.
 */
export function headerValidationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const methodRequiresBody = ['POST', 'PUT', 'PATCH'].includes(req.method);
  const contentType = req.headers['content-type'] ?? '';

  if (methodRequiresBody && !contentType.startsWith('application/json')) {
    res.status(415).json(
      buildGatewayErrorResponse(
        req,
        415,
        ErrorCode.UNSUPPORTED_MEDIA_TYPE,
        'common.unsupported_media_type',
      ),
    );
    return;
  }

  next();
}
