import type { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@saas/shared';

import { buildGatewayErrorResponse } from '@infrastructure/errors/gateway-error-response.util';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const ALLOWED_METHODS = new Set<HttpMethod>([
  'GET',
  'POST',
  'PUT',
  'DELETE',
]);

export function methodGuardMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!ALLOWED_METHODS.has(req.method as HttpMethod)) {
    res.status(405).json(
      buildGatewayErrorResponse(
        req,
        405,
        ErrorCode.METHOD_NOT_ALLOWED,
        'common.method_not_allowed',
      ),
    );
    return;
  }

  next();
}
