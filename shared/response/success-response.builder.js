"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = void 0;
const response_meta_util_1 = require("./response-meta.util");
const successResponse = (data, options = {}) => {
    const response = {
        success: true,
        data,
    };
    if (options.message) {
        response.message = options.message;
    }
    const meta = (0, response_meta_util_1.compactResponseMeta)(options.meta);
    if (meta) {
        response.meta = meta;
    }
    return response;
};
exports.successResponse = successResponse;
