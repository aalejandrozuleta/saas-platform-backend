import { ErrorCode } from './ErrorCode.enum';

/**
 * Mapeo estándar entre códigos de error y HTTP Status Code.
 */
export const HttpErrorMapper: Record<ErrorCode, number> = {
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.CONFLICT]: 409
};
