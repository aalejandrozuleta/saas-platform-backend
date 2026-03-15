import { ErrorCode } from '../errors';

import { compactResponseMeta } from './response-meta.util';
import {
  ApiErrorPayload,
  ApiErrorResponse,
  ErrorResponseOptions,
  ErrorResponseSource,
} from './response.interface';

/**
 * Construye una respuesta de error estándar.
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

  return buildErrorPayload(
    source.code ?? baseCode,
    source.message,
    {
      ...options,
      details: source.details ?? options.details,
      metadata: source.metadata ?? options.metadata,
    },
  );
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
