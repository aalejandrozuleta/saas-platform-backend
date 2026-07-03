import { ArgumentsHost, Catch } from '@nestjs/common';
import { GlobalExceptionFilter } from '@saas/shared';

/**
 * Filtro global de excepciones de notification-service.
 *
 * @remarks
 * Es una especialización vacía de `GlobalExceptionFilter` (paquete
 * `@saas/shared`): existe solo para que Nest pueda inyectarlo/registrarlo
 * como filtro propio del servicio (vía `APP_FILTER` con su propia
 * `I18nService`), sin cambiar el comportamiento. Toda excepción no
 * manejada termina con la misma forma estándar `ApiErrorResponse`:
 *
 * ```
 * { success: false, error: { code, message, details?, metadata? }, meta: { timestamp, path, requestId, lang, statusCode } }
 * ```
 *
 * - Errores de dominio (`BaseException`): usan su `httpStatus`/`code` y
 *   traducen `messageKey`.
 * - `HttpException` de Nest (p. ej. validación de DTOs): se normalizan a
 *   la misma forma, soportando arrays de `class-validator`.
 * - Cualquier otro error: responde 500 con `ErrorCode.INTERNAL_ERROR` y un
 *   mensaje traducido genérico, sin filtrar detalles internos.
 *
 * @param exception - Excepción capturada (de cualquier tipo).
 * @param host - Contexto de ejecución de Nest (HTTP request/response).
 */
@Catch()
export class NotificationGlobalExceptionFilter extends GlobalExceptionFilter {
  override catch(exception: unknown, host: ArgumentsHost): void {
    super.catch(exception, host);
  }
}
