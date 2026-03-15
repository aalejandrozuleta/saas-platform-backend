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
  [ErrorCode.METHOD_NOT_ALLOWED]: 405,
  [ErrorCode.UNSUPPORTED_MEDIA_TYPE]: 415,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  [ErrorCode.BAD_GATEWAY]: 502,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.GATEWAY_TIMEOUT]: 504,
  [ErrorCode.INVALID_REQUEST_PATH]: 400,
  [ErrorCode.MALFORMED_URL]: 400,
  [ErrorCode.DEVICE_NOT_TRUSTED]: 403,
  [ErrorCode.USER_BLOCKED]: 403,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.DEVICE_FINGERPRINT_REQUIRED]: 400,
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 409,
  [ErrorCode.COUNTRY_NOT_TRUSTED]: 403,
  [ErrorCode.SECURITY_CHALLENGE_REQUIRED]: 403,
  [ErrorCode.INVALID_REFRESH_TOKEN]: 401,
};

export const getErrorCodeFromHttpStatus = (status: number): ErrorCode => {
  switch (status) {
    case 400:
      return ErrorCode.VALIDATION_ERROR;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 405:
      return ErrorCode.METHOD_NOT_ALLOWED;
    case 409:
      return ErrorCode.CONFLICT;
    case 415:
      return ErrorCode.UNSUPPORTED_MEDIA_TYPE;
    case 429:
      return ErrorCode.TOO_MANY_REQUESTS;
    case 502:
      return ErrorCode.BAD_GATEWAY;
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE;
    case 504:
      return ErrorCode.GATEWAY_TIMEOUT;
    default:
      return ErrorCode.INTERNAL_ERROR;
  }
};
