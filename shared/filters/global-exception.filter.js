"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const errors_1 = require("../errors");
const i18n_1 = require("../i18n");
const response_1 = require("../response");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    constructor(i18n) {
        this.i18n = i18n;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const acceptLanguage = this.getRequestedLanguage(request);
        const resolvedLang = this.i18n.resolveLanguage(acceptLanguage);
        if (exception instanceof errors_1.BaseException) {
            const translatedMessage = this.i18n.translate(exception.messageKey, acceptLanguage, exception.metadata);
            response.status(exception.httpStatus).json((0, response_1.errorResponse)({
                code: exception.code,
                message: translatedMessage,
                metadata: exception.metadata,
            }, {
                meta: (0, response_1.buildResponseMeta)(request, exception.httpStatus, resolvedLang),
            }));
            return;
        }
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const body = exception.getResponse();
            if ((0, response_1.isApiErrorResponse)(body)) {
                response.status(status).json((0, response_1.errorResponse)(body.error, {
                    meta: (0, response_1.buildResponseMeta)(request, status, resolvedLang),
                }));
                return;
            }
            response.status(status).json((0, response_1.errorResponse)(this.normalizeHttpException(body, status, acceptLanguage), {
                meta: (0, response_1.buildResponseMeta)(request, status, resolvedLang),
            }));
            return;
        }
        response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json((0, response_1.errorResponse)({
            code: errors_1.ErrorCode.INTERNAL_ERROR,
            message: this.i18n.translate('common.internal_error', acceptLanguage),
        }, {
            meta: (0, response_1.buildResponseMeta)(request, common_1.HttpStatus.INTERNAL_SERVER_ERROR, resolvedLang),
        }));
    }
    normalizeHttpException(body, status, lang) {
        if (typeof body === 'string') {
            return {
                code: (0, errors_1.getErrorCodeFromHttpStatus)(status),
                message: body,
            };
        }
        if (!body || typeof body !== 'object') {
            return {
                code: errors_1.ErrorCode.INTERNAL_ERROR,
                message: this.i18n.translate('common.internal_error', lang),
            };
        }
        const record = body;
        const rawMessage = record.message;
        const metadata = this.asMetadata(record.metadata);
        if (typeof record.messageKey === 'string') {
            return {
                code: typeof record.code === 'string'
                    ? record.code
                    : (0, errors_1.getErrorCodeFromHttpStatus)(status),
                message: this.i18n.translate(record.messageKey, lang, metadata),
                details: record.details,
                metadata,
            };
        }
        if (Array.isArray(rawMessage)) {
            return {
                code: typeof record.code === 'string'
                    ? record.code
                    : (0, errors_1.getErrorCodeFromHttpStatus)(status),
                message: this.i18n.translate('common.validation_error', lang),
                details: rawMessage,
                metadata,
            };
        }
        let message;
        if (typeof rawMessage === 'string') {
            message = rawMessage;
        }
        else if (typeof record.error === 'string') {
            message = record.error;
        }
        else {
            message = this.i18n.translate('common.internal_error', lang);
        }
        return {
            code: typeof record.code === 'string'
                ? record.code
                : (0, errors_1.getErrorCodeFromHttpStatus)(status),
            message,
            details: record.details,
            metadata,
        };
    }
    getRequestedLanguage(request) {
        const acceptLanguage = request.headers['accept-language'];
        return typeof acceptLanguage === 'string' ? acceptLanguage : undefined;
    }
    asMetadata(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return undefined;
        }
        return value;
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [i18n_1.I18nService])
], GlobalExceptionFilter);
