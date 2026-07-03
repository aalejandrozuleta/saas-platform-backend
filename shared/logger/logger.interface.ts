/**
 * Contrato base de logger para la plataforma.
 *
 * ❗ No depende de Pino ni de NestJS.
 * ❗ Permite reemplazar la implementación (p. ej. en tests, con un logger en
 *   memoria) sin romper servicios, ya que estos siempre dependen de esta
 *   interfaz e inyectan la implementación vía el token {@link PLATFORM_LOGGER}.
 *
 * La implementación por defecto ({@link PinoLoggerAdapter}) enriquece
 * automáticamente cada `meta` con los datos del {@link RequestContext}
 * activo (requestId, correlationId, userId), así que normalmente no hace
 * falta incluirlos manualmente al llamar a estos métodos.
 *
 * @example
 * ```ts
 * constructor(
 *   \@Inject(PLATFORM_LOGGER) private readonly logger: PlatformLogger,
 * ) {}
 *
 * this.logger.info('Usuario creado', { userId: user.id });
 * ```
 */
export interface PlatformLogger {
  /** Evento informativo del flujo normal de la aplicación. */
  info(message: string, meta?: Record<string, unknown>): void;
  /** Situación anómala pero no bloqueante (p. ej. respuesta 4xx). */
  warn(message: string, meta?: Record<string, unknown>): void;
  /**
   * Error o falla. Si `meta` es una instancia de `Error`, se adjunta como
   * campo `err` (Pino lo serializa con stack trace incluido) en lugar de
   * tratarse como metadata arbitraria.
   */
  error(message: string, meta?: Record<string, unknown>): void;
  /** Detalle de diagnóstico, visible solo cuando el nivel configurado lo permite. */
  debug(message: string, meta?: Record<string, unknown>): void;
}
