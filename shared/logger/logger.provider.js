"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerProvider = void 0;
const logger_token_1 = require("./logger.token");
const pino_logger_adapter_1 = require("./pino.logger.adapter");
exports.LoggerProvider = {
    provide: logger_token_1.PLATFORM_LOGGER,
    useFactory: () => new pino_logger_adapter_1.PinoLoggerAdapter({
        level: process.env.NODE_ENV === 'production'
            ? 'info'
            : 'debug',
        serviceName: process.env.SERVICE_NAME ?? 'auth-service',
    }),
};
