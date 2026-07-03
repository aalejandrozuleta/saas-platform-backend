import type { Request } from 'express';

import type { ApiResponseMeta } from './response.interface';

const isDefined = (value: unknown): boolean => value !== undefined;

/**
 * Elimina las claves `undefined` de un {@link ApiResponseMeta} y devuelve
 * `undefined` si el resultado queda vacío. Se usa internamente en
 * {@link successResponse} y {@link errorResponse} para no incluir un
 * objeto `meta: {}` en la respuesta cuando no hay nada que informar.
 */
export const compactResponseMeta = (meta?: ApiResponseMeta): ApiResponseMeta | undefined => {
  if (!meta) {
    return undefined;
  }

  const entries = Object.entries(meta).filter(([, value]) => isDefined(value));

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries) as ApiResponseMeta;
};

/**
 * Construye el `meta` estándar (timestamp, path, requestId, lang,
 * statusCode) a partir de la request de Express y el status HTTP de la
 * respuesta. Usado por {@link GlobalExceptionFilter} para poblar `meta` en
 * cada {@link ApiErrorResponse}; también puede usarse en controllers para
 * enriquecer respuestas exitosas con la misma forma.
 *
 * @param req - Objeto request de Express (o un subconjunto con los campos usados).
 * @param statusCode - Status HTTP con el que se está respondiendo.
 * @param lang - Idioma ya resuelto (ver {@link I18nService.resolveLanguage}).
 */
export const buildResponseMeta = (
  req: Pick<Request, 'headers' | 'originalUrl' | 'url' | 'path'>,
  statusCode: number,
  lang?: string,
): ApiResponseMeta => {
  return (
    compactResponseMeta({
      timestamp: new Date().toISOString(),
      path: req.originalUrl ?? req.url ?? req.path,
      requestId: resolveRequestId(req.headers),
      lang,
      statusCode,
    }) /* istanbul ignore next */ ?? {}
  );
};

const resolveRequestId = (headers: Request['headers']): string | undefined => {
  const candidate = headers['x-correlation-id'] ?? headers['x-request-id'];

  return typeof candidate === 'string' ? candidate : undefined;
};
