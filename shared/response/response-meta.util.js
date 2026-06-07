"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildResponseMeta = exports.compactResponseMeta = void 0;
const isDefined = (value) => value !== undefined;
const compactResponseMeta = (meta) => {
    if (!meta) {
        return undefined;
    }
    const entries = Object.entries(meta).filter(([, value]) => isDefined(value));
    if (entries.length === 0) {
        return undefined;
    }
    return Object.fromEntries(entries);
};
exports.compactResponseMeta = compactResponseMeta;
const buildResponseMeta = (req, statusCode, lang) => {
    return ((0, exports.compactResponseMeta)({
        timestamp: new Date().toISOString(),
        path: req.originalUrl ?? req.url ?? req.path,
        requestId: resolveRequestId(req.headers),
        lang,
        statusCode,
    }) ?? {});
};
exports.buildResponseMeta = buildResponseMeta;
const resolveRequestId = (headers) => {
    const candidate = headers['x-correlation-id'] ?? headers['x-request-id'];
    return typeof candidate === 'string' ? candidate : undefined;
};
