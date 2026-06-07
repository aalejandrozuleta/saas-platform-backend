"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseException = void 0;
class BaseException extends Error {
    constructor(messageKey, code, httpStatus, metadata) {
        super(messageKey);
        this.messageKey = messageKey;
        this.code = code;
        this.httpStatus = httpStatus;
        this.metadata = metadata;
    }
}
exports.BaseException = BaseException;
