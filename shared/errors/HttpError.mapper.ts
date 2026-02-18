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
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  [ErrorCode.DEVICE_NOT_TRUSTED]: 403,
  [ErrorCode.USER_BLOCKED]: 403,
  [ErrorCode.INVALID_CREDENTIALS]: 401
};
