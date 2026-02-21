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
let GlobalExceptionFilter = class GlobalExceptionFilter {
    constructor(i18n) {
        this.i18n = i18n;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const timestamp = new Date().toISOString();
        const path = request.url;
        const acceptLanguage = request.headers['accept-language'];
        const lang = typeof acceptLanguage === 'string'
            ? acceptLanguage.split(',')[0]
            : undefined;
        if (exception instanceof errors_1.BaseException) {
            const translatedMessage = this.i18n.translate(exception.messageKey, lang);
            response.status(exception.httpStatus).json({
                success: false,
                error: {
                    code: exception.code,
                    message: translatedMessage,
                    metadata: exception.metadata ?? null,
                },
                path,
                timestamp,
            });
            return;
        }
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const body = exception.getResponse();
            response.status(status).json({
                success: false,
                error: typeof body === 'object'
                    ? body
                    : {
                        code: errors_1.ErrorCode.INTERNAL_ERROR,
                        message: body,
                    },
                path,
                timestamp,
            });
            return;
        }
        const fallbackMessage = this.i18n.translate('common.internal_error', lang);
        response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: {
                code: errors_1.ErrorCode.INTERNAL_ERROR,
                message: fallbackMessage,
            },
            path,
            timestamp,
        });
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [i18n_1.I18nService])
], GlobalExceptionFilter);
