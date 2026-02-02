import { PinoLoggerAdapter } from './adapters/pino.logger.adapter';
import type { LoggerOptions } from './logger.types';

/**
 * Fábrica del logger de la plataforma.
 * ÚNICA instancia compartida.
 */
const loggerOptions: LoggerOptions = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  serviceName: 'platform',
};

export const logger = new PinoLoggerAdapter(loggerOptions);
