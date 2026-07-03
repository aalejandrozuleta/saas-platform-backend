/**
 * Niveles de log soportados por la plataforma, en orden de severidad
 * creciente (`debug` < `info` < `warn` < `error`). Coinciden con los
 * niveles nativos de Pino.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Configuración base del logger, usada por {@link createPinoConfig} y por
 * {@link PinoLoggerAdapter} al construirse.
 */
export interface LoggerOptions {
  /** Nivel mínimo que se emite; los logs por debajo de este nivel se descartan. */
  level: LogLevel;
  /** Nombre del microservicio; se agrega como campo `service` en cada línea de log. */
  serviceName: string;
}
