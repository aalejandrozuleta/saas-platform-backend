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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequestLoggingInterceptor = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const async_local_storage_1 = require("../context/async-local-storage");
const logger_token_1 = require("./logger.token");
let HttpRequestLoggingInterceptor = class HttpRequestLoggingInterceptor {
    constructor(logger) {
        this.logger = logger;
    }
    intercept(context, next) {
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();
        const startNs = process.hrtime.bigint();
        let thrown;
        const correlationId = this.resolveCorrelationId(req);
        res.setHeader('x-correlation-id', correlationId);
        req.headers['x-correlation-id'] =
            correlationId;
        const userId = req.user?.id && typeof req.user.id === 'string'
            ? req.user.id
            : undefined;
        const ctx = {
            requestId: correlationId,
            correlationId,
            userId,
        };
        return async_local_storage_1.requestContextStorage.run(ctx, () => (0, rxjs_1.defer)(() => next.handle()).pipe((0, operators_1.catchError)((err) => {
            thrown = err;
            throw err;
        }), (0, operators_1.finalize)(() => {
            const durationMs = Number(process.hrtime.bigint() - startNs) / 1_000_000;
            const defaultStatus = thrown ? 500 : 200;
            const status = typeof res.statusCode === 'number' && res.statusCode > 0
                ? res.statusCode
                : defaultStatus;
            const method = req.method;
            const path = req.originalUrl ?? req.url ?? 'unknown';
            const ip = typeof req.headers['x-forwarded-for'] === 'string'
                ? req.headers['x-forwarded-for'].split(',')[0].trim()
                : req.ip;
            const userAgent = typeof req.headers['user-agent'] === 'string'
                ? req.headers['user-agent']
                : undefined;
            const meta = {
                event: 'http.request',
                method,
                path,
                status,
                durationMs: Math.round(durationMs * 100) / 100,
                correlationId,
                userId,
                ip,
                userAgent,
            };
            if (thrown instanceof Error) {
                meta.err = thrown;
            }
            if (status >= 500) {
                this.logger.error('HTTP request failed', meta);
                return;
            }
            if (status >= 400) {
                this.logger.warn('HTTP request client error', meta);
                return;
            }
            if (this.isLowValuePath(path)) {
                this.logger.debug('HTTP request completed', meta);
                return;
            }
            this.logger.info('HTTP request completed', meta);
        })));
    }
    isLowValuePath(path) {
        return /\/(metrics|health)(\/|$)/.test(path);
    }
    resolveCorrelationId(req) {
        const header = req.headers['x-correlation-id'] ??
            req.headers['x-request-id'];
        return typeof header === 'string' && header.trim().length > 0
            ? header
            : (0, node_crypto_1.randomUUID)();
    }
};
exports.HttpRequestLoggingInterceptor = HttpRequestLoggingInterceptor;
exports.HttpRequestLoggingInterceptor = HttpRequestLoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(logger_token_1.PLATFORM_LOGGER)),
    __metadata("design:paramtypes", [Object])
], HttpRequestLoggingInterceptor);
