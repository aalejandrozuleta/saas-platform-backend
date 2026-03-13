import { type LoggerOptions } from './logger.types';

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
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`
});
