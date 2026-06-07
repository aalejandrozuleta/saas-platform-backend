"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPinoConfig = void 0;
const createPinoConfig = (options) => ({
    level: options.level,
    base: {
        service: options.serviceName
    },
    redact: {
        paths: [
            '*.password',
            '*.pass',
            '*.token',
            '*.accessToken',
            '*.refreshToken',
            '*.secret',
            'req.headers.authorization',
            'req.headers.cookie',
            'req.headers["set-cookie"]',
        ],
        remove: true,
    },
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`
});
exports.createPinoConfig = createPinoConfig;
