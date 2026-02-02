/**
 * Niveles de log soportados por la plataforma.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Configuración base del logger.
 */
export interface LoggerOptions {
  level: LogLevel;
  serviceName: string;
}
