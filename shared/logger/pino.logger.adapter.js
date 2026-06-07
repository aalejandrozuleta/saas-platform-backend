"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PinoLoggerAdapter = void 0;
const pino_1 = __importDefault(require("pino"));
const async_local_storage_1 = require("../context/async-local-storage");
const pino_config_1 = require("./pino.config");
class PinoLoggerAdapter {
    constructor(options) {
        this.logger = (0, pino_1.default)((0, pino_config_1.createPinoConfig)(options));
    }
    enrich(meta) {
        const ctx = async_local_storage_1.requestContextStorage.getStore();
        if (!ctx)
            return meta;
        const ctxMeta = {
            requestId: ctx.requestId,
            correlationId: ctx.correlationId,
            userId: ctx.userId,
        };
        if (!meta)
            return ctxMeta;
        return { ...ctxMeta, ...meta };
    }
    info(message, meta) {
        const enriched = this.enrich(meta);
        enriched
            ? this.logger.info(enriched, message)
            : this.logger.info(message);
    }
    warn(message, meta) {
        const enriched = this.enrich(meta);
        enriched
            ? this.logger.warn(enriched, message)
            : this.logger.warn(message);
    }
    error(message, meta) {
        const ctx = async_local_storage_1.requestContextStorage.getStore();
        if (meta instanceof Error) {
            if (ctx) {
                this.logger.error({
                    requestId: ctx.requestId,
                    correlationId: ctx.correlationId,
                    userId: ctx.userId,
                    err: meta,
                }, message);
                return;
            }
            this.logger.error(meta, message);
            return;
        }
        const enriched = this.enrich(meta);
        enriched
            ? this.logger.error(enriched, message)
            : this.logger.error(message);
    }
    debug(message, meta) {
        const enriched = this.enrich(meta);
        enriched
            ? this.logger.debug(enriched, message)
            : this.logger.debug(message);
    }
}
exports.PinoLoggerAdapter = PinoLoggerAdapter;
