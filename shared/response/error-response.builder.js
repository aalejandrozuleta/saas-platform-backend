"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = void 0;
const errors_1 = require("../errors");
const response_meta_util_1 = require("./response-meta.util");
const errorResponse = (error, options = {}) => {
    const response = {
        success: false,
        error: normalizeError(error, options),
    };
    const meta = (0, response_meta_util_1.compactResponseMeta)(options.meta);
    if (meta) {
        response.meta = meta;
    }
    return response;
};
exports.errorResponse = errorResponse;
const normalizeError = (source, options) => {
    const baseCode = options.code ?? errors_1.ErrorCode.INTERNAL_ERROR;
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
const buildErrorPayload = (code, message, options) => {
    const payload = {
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
