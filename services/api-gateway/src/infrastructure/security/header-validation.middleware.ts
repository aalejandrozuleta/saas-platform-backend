import type { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@saas/shared';
import { buildGatewayErrorResponse } from '@infrastructure/errors/gateway-error-response.util';

/**
 * Exige `Content-Type: application/json` en métodos que llevan body.
 *
 * @remarks
 * Se ejecuta antes de `express.json()`/`express.urlencoded()` (ver
 * `main.ts`) para rechazar de forma temprana payloads con content-type
 * inesperado (form-data, XML, texto plano, etc.) que podrían usarse para
 * evadir validaciones pensadas solo para JSON o para explotar parsers
 * alternativos en servicios downstream. También reduce el trabajo gastado
 * en parsear bodies que de todos modos van a ser rechazados aguas abajo.
 */
export function headerValidationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const methodRequiresBody = ['POST', 'PUT', 'PATCH'].includes(req.method);
  const contentType = req.headers['content-type'] ?? '';

  if (methodRequiresBody && !contentType.startsWith('application/json')) {
    res
      .status(415)
      .json(
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
