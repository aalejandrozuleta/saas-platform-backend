"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApiErrorResponse = void 0;
const isApiErrorResponse = (value) => {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const candidate = value;
    return candidate.success === false && Boolean(candidate.error);
};
exports.isApiErrorResponse = isApiErrorResponse;
