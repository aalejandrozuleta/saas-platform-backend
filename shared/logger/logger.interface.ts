/**
 * Contrato base de logger para la plataforma.
 * 
 * ❗ No depende de Pino ni de NestJS.
 * ❗ Permite reemplazar implementación sin romper servicios.
 */
export interface PlatformLogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}
