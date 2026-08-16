import type { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@saas/shared';
import { buildGatewayErrorResponse } from '@infrastructure/errors/gateway-error-response.util';

/**
 * Rutas que legítimamente reciben archivos (`multipart/form-data`) en vez
 * de JSON. Allowlist explícita y cerrada — cualquier ruta nueva de subida
 * de archivos debe agregarse aquí a propósito, no queda abierta por
 * omisión.
 */
const MULTIPART_ROUTES = new Set(['/v1/users/me/profile/avatar']);

/**
 * Variante de {@link MULTIPART_ROUTES} para rutas con parámetros dinámicos
 * (no se pueden listar como string exacto en el Set). Misma allowlist
 * cerrada, cada patrón debe agregarse a propósito.
 */
const MULTIPART_ROUTE_PATTERNS = [/^\/v1\/companies\/[^/]+\/logo$/];

/**
 * Exige `Content-Type: application/json` en métodos que llevan body — con
 * la excepción explícita de {@link MULTIPART_ROUTES}, que exigen
 * `multipart/form-data` en su lugar.
 *
 * @remarks
 * Se ejecuta antes de `express.json()`/`express.urlencoded()` (ver
 * `main.ts`) para rechazar de forma temprana payloads con content-type
 * inesperado (form-data, XML, texto plano, etc.) que podrían usarse para
 * evadir validaciones pensadas solo para JSON o para explotar parsers
 * alternativos en servicios downstream. También reduce el trabajo gastado
 * en parsear bodies que de todos modos van a ser rechazados aguas abajo.
 * La excepción de multipart sigue siendo estricta (debe ser
 * `multipart/form-data`, no "cualquier cosa") — no se abre la validación,
 * solo se le agrega un segundo content-type válido para rutas puntuales.
 */
export function headerValidationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const methodRequiresBody = ['POST', 'PUT', 'PATCH'].includes(req.method);
  const contentType = req.headers['content-type'] ?? '';
  const expectsMultipart =
    MULTIPART_ROUTES.has(req.path) ||
    MULTIPART_ROUTE_PATTERNS.some((pattern) => pattern.test(req.path));

  const isValid = expectsMultipart
    ? contentType.startsWith('multipart/form-data')
    : contentType.startsWith('application/json');

  if (methodRequiresBody && !isValid) {
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
