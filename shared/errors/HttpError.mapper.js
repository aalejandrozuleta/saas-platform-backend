"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpErrorMapper = void 0;
const ErrorCode_enum_1 = require("./ErrorCode.enum");
exports.HttpErrorMapper = {
    [ErrorCode_enum_1.ErrorCode.INTERNAL_ERROR]: 500,
    [ErrorCode_enum_1.ErrorCode.VALIDATION_ERROR]: 400,
    [ErrorCode_enum_1.ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode_enum_1.ErrorCode.FORBIDDEN]: 403,
    [ErrorCode_enum_1.ErrorCode.NOT_FOUND]: 404,
    [ErrorCode_enum_1.ErrorCode.CONFLICT]: 409,
    [ErrorCode_enum_1.ErrorCode.TOO_MANY_REQUESTS]: 429,
    [ErrorCode_enum_1.ErrorCode.DEVICE_NOT_TRUSTED]: 403,
    [ErrorCode_enum_1.ErrorCode.USER_BLOCKED]: 403,
    [ErrorCode_enum_1.ErrorCode.INVALID_CREDENTIALS]: 401,
    [ErrorCode_enum_1.ErrorCode.DEVICE_FINGERPRINT_REQUIRED]: 400,
    [ErrorCode_enum_1.ErrorCode.EMAIL_ALREADY_EXISTS]: 409,
};
