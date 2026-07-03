import { ErrorCode } from '../errors';

import { compactResponseMeta } from './response-meta.util';
import type {
  ApiErrorPayload,
  ApiErrorResponse,
  ErrorResponseOptions,
  ErrorResponseSource,
} from './response.interface';

/**
 * Construye una respuesta de error estándar ({@link ApiErrorResponse}).
 *
 * Acepta tres formas de `source` ({@link ErrorResponseSource}):
 * - `string`: se usa como `message`; el `code` sale de `options.code` o cae
 *   a `ErrorCode.INTERNAL_ERROR`.
 * - `Error`: igual que el caso anterior, tomando `source.message`.
 * - `ErrorResponseInput`: objeto ya estructurado (código, mensaje, details,
 *   metadata); sus campos tienen prioridad sobre `options`.
 *
 * Es el mismo builder que usa internamente {@link GlobalExceptionFilter},
 * así que suele bastar con lanzar una {@link BaseException} en vez de
 * llamar a esta función directamente — úsala cuando necesites construir
 * una respuesta de error fuera del flujo de excepciones (p. ej. dentro de
 * un `HttpException` custom).
 *
 * @param error - Origen del error a normalizar.
 * @param options - `code`/`details`/`metadata` por defecto y `meta` de la respuesta.
 */
export const errorResponse = (
  error: ErrorResponseSource,
  options: ErrorResponseOptions = {},
): ApiErrorResponse => {
  const response: ApiErrorResponse = {
    success: false,
    error: normalizeError(error, options),
  };

  const meta = compactResponseMeta(options.meta);

  if (meta) {
    response.meta = meta;
  }

  return response;
};

const normalizeError = (
  source: ErrorResponseSource,
  options: ErrorResponseOptions,
): ApiErrorPayload => {
  const baseCode = options.code ?? ErrorCode.INTERNAL_ERROR;

  if (typeof source === 'string') {
    return buildErrorPayload(baseCode, source, options);
  }

  if (source instanceof Error) {
    return buildErrorPayload(baseCode, source.message, options);
  }

  return buildErrorPayload(source.code ?? baseCode, source.message, {
    ...options,
    details: source.details ?? options.details,
    metadata: source.metadata ?? options.metadata,
  });
};

const buildErrorPayload = (
  code: string,
  message: string,
  options: Pick<ErrorResponseOptions, 'details' | 'metadata'>,
): ApiErrorPayload => {
  const payload: ApiErrorPayload = {
    code,
    message,
  };

  if (options.details !== undefined) {
    payload.details = options.details;
  }

  if (options.metadata !== undefined) {
    payload.metadata = options.metadata;
  }

  return payload;
};
