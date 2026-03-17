import { LoggerOptions } from './logger.types';

/**
 * Configuración base para Pino.
 * 
 * Se mantiene en shared para consistencia entre servicios.
 */
export const createPinoConfig = (options: LoggerOptions) => ({
  level: options.level,
  base: {
    service: options.serviceName
  },
  redact: {
    paths: [
      // Common auth secrets
      '*.password',
      '*.pass',
      '*.token',
      '*.accessToken',
      '*.refreshToken',
      '*.secret',
      // HTTP headers that often contain secrets
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["set-cookie"]',
    ],
    remove: true,
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`
});
