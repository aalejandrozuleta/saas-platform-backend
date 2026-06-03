/**
 * Contrato estándar de respuesta HTTP.
 */
export interface ApiResponseMeta {
  timestamp?: string;
  path?: string;
  requestId?: string;
  lang?: string;
  statusCode?: number;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  metadata?: Record<string, unknown> | null;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: ApiResponseMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
  meta?: ApiResponseMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface SuccessResponseOptions {
  message?: string;
  meta?: ApiResponseMeta;
}

export interface ErrorResponseInput {
  code?: string;
  message: string;
  details?: unknown;
  metadata?: Record<string, unknown> | null;
}

export type ErrorResponseSource = string | Error | ErrorResponseInput;

export interface ErrorResponseOptions {
  code?: string;
  details?: unknown;
  metadata?: Record<string, unknown> | null;
  meta?: ApiResponseMeta;
}

export const isApiErrorResponse = (value: unknown): value is ApiErrorResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ApiErrorResponse>;

  return candidate.success === false && Boolean(candidate.error);
};
