import type { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@saas/shared';
import { buildGatewayErrorResponse } from '@infrastructure/errors/gateway-error-response.util';

/**
 * Bloquea path traversal y URLs malformadas antes de enrutar la petición.
 *
 * @remarks
 * Decodifica el path (`decodeURIComponent`) para detectar secuencias `..`
 * incluso cuando vienen percent-encoded (p. ej. `%2e%2e/`), que de otro modo
 * pasarían inadvertidas y podrían usarse para escapar del prefijo de ruta
 * esperado al construir la URL upstream en los proxies. Un path con encoding
 * inválido (que hace fallar `decodeURIComponent`) se rechaza como
 * `MALFORMED_URL` en vez de dejarlo pasar sin decodificar.
 */
export function pathSanitizerMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const decodedPath = decodeURIComponent(req.path);

    if (decodedPath.includes('..')) {
      res
        .status(400)
        .json(
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
    res
      .status(400)
      .json(buildGatewayErrorResponse(req, 400, ErrorCode.MALFORMED_URL, 'common.malformed_url'));
  }
}
