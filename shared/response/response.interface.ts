/**
 * Contrato estándar de respuesta HTTP de la plataforma. Todo endpoint
 * público debería responder con {@link ApiSuccessResponse} o
 * {@link ApiErrorResponse} (unificados en {@link ApiResponse}), construidos
 * con {@link successResponse} / {@link errorResponse} en vez de armarlos a mano.
 */
export interface ApiResponseMeta {
  /** Fecha/hora de la respuesta en formato ISO 8601. */
  timestamp?: string;
  /** Path original de la request (`req.originalUrl`). */
  path?: string;
  /** Id de correlación, tomado de `x-correlation-id` / `x-request-id`. */
  requestId?: string;
  /** Idioma resuelto para el mensaje (ver {@link I18nService.resolveLanguage}). */
  lang?: string;
  /** Status HTTP de la respuesta. */
  statusCode?: number;
}

/** Forma del campo `error` dentro de una {@link ApiErrorResponse}. */
export interface ApiErrorPayload {
  /** Código estable de error, típicamente un valor de {@link ErrorCode}. */
  code: string;
  /** Mensaje ya traducido, listo para mostrar al usuario. */
  message: string;
  /** Detalle adicional (p. ej. lista de errores de validación por campo). */
  details?: unknown;
  /** Metadata cruda del error, usada también como parámetros de interpolación i18n. */
  metadata?: Record<string, unknown> | null;
}

/** Envoltorio de una respuesta exitosa (`success: true`). */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: ApiResponseMeta;
}

/** Envoltorio de una respuesta de error (`success: false`). */
export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
  meta?: ApiResponseMeta;
}

/** Unión discriminada por `success`, útil para tipar clientes HTTP. */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Opciones aceptadas por {@link successResponse}. */
export interface SuccessResponseOptions {
  message?: string;
  meta?: ApiResponseMeta;
}

/** Forma explícita de error aceptada por {@link errorResponse} como `source`. */
export interface ErrorResponseInput {
  code?: string;
  message: string;
  details?: unknown;
  metadata?: Record<string, unknown> | null;
}

/**
 * Cualquier forma que {@link errorResponse} sabe normalizar: un mensaje
 * plano, una instancia de `Error`, o un objeto ya estructurado.
 */
export type ErrorResponseSource = string | Error | ErrorResponseInput;

/** Opciones aceptadas por {@link errorResponse}. */
export interface ErrorResponseOptions {
  code?: string;
  details?: unknown;
  metadata?: Record<string, unknown> | null;
  meta?: ApiResponseMeta;
}

/**
 * Type guard: determina si un valor desconocido ya tiene la forma de
 * {@link ApiErrorResponse}. Lo usa {@link GlobalExceptionFilter} para
 * evitar re-envolver un error que un servicio ya formateó manualmente
 * (p. ej. el body de una `HttpException` construida con {@link errorResponse}).
 *
 * @param value - Valor a inspeccionar (normalmente el body de una `HttpException`).
 */
export const isApiErrorResponse = (value: unknown): value is ApiErrorResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ApiErrorResponse>;

  return candidate.success === false && Boolean(candidate.error);
};
