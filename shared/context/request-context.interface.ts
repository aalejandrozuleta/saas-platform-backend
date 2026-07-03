/**
 * Contexto de ejecución de una request HTTP.
 *
 * Se crea una instancia por request entrante y se propaga durante todo su
 * ciclo de vida (controllers, servicios, listeners async, etc.) usando
 * {@link requestContextStorage}, sin necesidad de pasarlo explícitamente
 * como parámetro. Lo escribe {@link HttpRequestLoggingInterceptor} y lo
 * consumen, entre otros, {@link PinoLoggerAdapter} (para enriquecer cada
 * log) y {@link GlobalExceptionFilter}.
 */
export interface RequestContext {
  /**
   * Identificador único de la request. Coincide con `correlationId`: hoy
   * ambos campos se derivan del mismo header (`x-correlation-id` /
   * `x-request-id`) o, si no viene, de un `randomUUID()` generado por el
   * interceptor.
   */
  requestId: string;

  /**
   * Identificador de correlación entre servicios. Se propaga vía el header
   * `x-correlation-id` para poder rastrear una misma operación a través de
   * varios microservicios (API Gateway → auth-service → notification-service, etc.).
   */
  correlationId?: string;

  /** Id del usuario autenticado, si la request ya pasó por un guard de auth. */
  userId?: string;
}
