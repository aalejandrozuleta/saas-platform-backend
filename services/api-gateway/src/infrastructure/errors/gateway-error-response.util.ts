import { join } from 'node:path';

import type { Request } from 'express';
import {
  I18nService,
  buildResponseMeta,
  errorResponse,
  loadMessagesFromDirectory,
} from '@saas/shared';
import type { ErrorCode } from '@saas/shared';

const gatewayI18n = new I18nService(
  loadMessagesFromDirectory(join(process.cwd(), 'src', 'i18n')),
  'es',
);

interface GatewayErrorOptions {
  details?: unknown;
  metadata?: Record<string, unknown> | null;
}

/**
 * Construye una respuesta de error estandarizada y traducida, generada por
 * el propio gateway (no reenviada desde un servicio downstream).
 *
 * @remarks
 * Usada por los middlewares de seguridad y los proxies cuando el gateway
 * necesita responder por sí mismo (método no permitido, path inválido,
 * servicio downstream inalcanzable, etc.). El idioma se resuelve a partir
 * del header `Accept-Language` de la petición mediante una instancia propia
 * de `I18nService` (`gatewayI18n`), independiente del `I18nModule` de Nest,
 * porque estos middlewares corren fuera del ciclo de vida de Nest (antes de
 * que exista un `ExecutionContext`) y no pueden inyectar el servicio.
 *
 * @param req - Request (o subconjunto mínimo) para resolver idioma y meta.
 * @param statusCode - Código HTTP de la respuesta.
 * @param code - Código de error de dominio (`ErrorCode`).
 * @param messageKey - Clave i18n del mensaje a traducir.
 * @param options - `details` (info adicional para el cliente) y `metadata`.
 */
export const buildGatewayErrorResponse = (
  req: Pick<Request, 'headers' | 'originalUrl' | 'url' | 'path'>,
  statusCode: number,
  code: ErrorCode,
  messageKey: string,
  options: GatewayErrorOptions = {},
) => {
  const requestedLanguage = getRequestedLanguage(req);
  const resolvedLanguage = gatewayI18n.resolveLanguage(requestedLanguage);

  return errorResponse(
    {
      code,
      message: gatewayI18n.translate(messageKey, requestedLanguage),
      details: options.details,
      metadata: options.metadata,
    },
    {
      meta: buildResponseMeta(req, statusCode, resolvedLanguage),
    },
  );
};

const getRequestedLanguage = (req: Pick<Request, 'headers'>): string | undefined => {
  const acceptLanguage = req.headers['accept-language'];

  return typeof acceptLanguage === 'string' ? acceptLanguage : undefined;
};
