"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorCodeFromHttpStatus = exports.HttpErrorMapper = void 0;
const ErrorCode_enum_1 = require("./ErrorCode.enum");
exports.HttpErrorMapper = {
    [ErrorCode_enum_1.ErrorCode.INTERNAL_ERROR]: 500,
    [ErrorCode_enum_1.ErrorCode.VALIDATION_ERROR]: 400,
    [ErrorCode_enum_1.ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode_enum_1.ErrorCode.FORBIDDEN]: 403,
    [ErrorCode_enum_1.ErrorCode.NOT_FOUND]: 404,
    [ErrorCode_enum_1.ErrorCode.CONFLICT]: 409,
    [ErrorCode_enum_1.ErrorCode.METHOD_NOT_ALLOWED]: 405,
    [ErrorCode_enum_1.ErrorCode.UNSUPPORTED_MEDIA_TYPE]: 415,
    [ErrorCode_enum_1.ErrorCode.TOO_MANY_REQUESTS]: 429,
    [ErrorCode_enum_1.ErrorCode.BAD_GATEWAY]: 502,
    [ErrorCode_enum_1.ErrorCode.SERVICE_UNAVAILABLE]: 503,
    [ErrorCode_enum_1.ErrorCode.GATEWAY_TIMEOUT]: 504,
    [ErrorCode_enum_1.ErrorCode.INVALID_REQUEST_PATH]: 400,
    [ErrorCode_enum_1.ErrorCode.MALFORMED_URL]: 400,
    [ErrorCode_enum_1.ErrorCode.DEVICE_NOT_TRUSTED]: 403,
    [ErrorCode_enum_1.ErrorCode.USER_BLOCKED]: 403,
    [ErrorCode_enum_1.ErrorCode.INVALID_CREDENTIALS]: 401,
    [ErrorCode_enum_1.ErrorCode.DEVICE_FINGERPRINT_REQUIRED]: 400,
    [ErrorCode_enum_1.ErrorCode.EMAIL_ALREADY_EXISTS]: 409,
    [ErrorCode_enum_1.ErrorCode.COUNTRY_NOT_TRUSTED]: 403,
    [ErrorCode_enum_1.ErrorCode.SECURITY_CHALLENGE_REQUIRED]: 403,
    [ErrorCode_enum_1.ErrorCode.INVALID_REFRESH_TOKEN]: 401,
    [ErrorCode_enum_1.ErrorCode.INVALID_CURRENT_PASSWORD]: 401,
    [ErrorCode_enum_1.ErrorCode.SAME_PASSWORD_NOT_ALLOWED]: 422,
};
const getErrorCodeFromHttpStatus = (status) => {
    switch (status) {
        case 400:
            return ErrorCode_enum_1.ErrorCode.VALIDATION_ERROR;
        case 401:
            return ErrorCode_enum_1.ErrorCode.UNAUTHORIZED;
        case 403:
            return ErrorCode_enum_1.ErrorCode.FORBIDDEN;
        case 404:
            return ErrorCode_enum_1.ErrorCode.NOT_FOUND;
        case 405:
            return ErrorCode_enum_1.ErrorCode.METHOD_NOT_ALLOWED;
        case 409:
            return ErrorCode_enum_1.ErrorCode.CONFLICT;
        case 422:
            return ErrorCode_enum_1.ErrorCode.VALIDATION_ERROR;
        case 415:
            return ErrorCode_enum_1.ErrorCode.UNSUPPORTED_MEDIA_TYPE;
        case 429:
            return ErrorCode_enum_1.ErrorCode.TOO_MANY_REQUESTS;
        case 502:
            return ErrorCode_enum_1.ErrorCode.BAD_GATEWAY;
        case 503:
            return ErrorCode_enum_1.ErrorCode.SERVICE_UNAVAILABLE;
        case 504:
            return ErrorCode_enum_1.ErrorCode.GATEWAY_TIMEOUT;
        default:
            return ErrorCode_enum_1.ErrorCode.INTERNAL_ERROR;
    }
};
exports.getErrorCodeFromHttpStatus = getErrorCodeFromHttpStatus;
