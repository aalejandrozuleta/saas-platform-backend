import type { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@saas/shared';
import { buildGatewayErrorResponse } from '@infrastructure/errors/gateway-error-response.util';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const ALLOWED_METHODS = new Set<HttpMethod>(['GET', 'POST', 'PUT', 'DELETE']);

/**
 * Restringe el gateway a un allowlist cerrado de verbos HTTP.
 *
 * @remarks
 * Mitiga técnicas de HTTP verb tampering (p. ej. usar TRACE, CONNECT o
 * verbos poco comunes para eludir reglas de WAF/proxy pensadas solo para
 * GET/POST/PUT/DELETE, o para provocar comportamientos no manejados en
 * servicios downstream). Se ejecuta antes que cualquier otro middleware
 * de seguridad para descartar el tráfico inválido lo antes posible.
 */
export function methodGuardMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!ALLOWED_METHODS.has(req.method as HttpMethod)) {
    res
      .status(405)
      .json(
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
