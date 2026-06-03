import type { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@saas/shared';
import { buildGatewayErrorResponse } from '@infrastructure/errors/gateway-error-response.util';

/**
 * Previene path traversal y URLs maliciosas.
 */
export function pathSanitizerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const decodedPath = decodeURIComponent(req.path);

    if (decodedPath.includes('..')) {
      res.status(400).json(
        buildGatewayErrorResponse(
          req,
          400,
          ErrorCode.INVALID_REQUEST_PATH,
          'common.invalid_request_path',
        ),
      );
      return;
    }

    next();
  } catch {
    res.status(400).json(
      buildGatewayErrorResponse(
        req,
        400,
        ErrorCode.MALFORMED_URL,
        'common.malformed_url',
      ),
    );
  }
}
