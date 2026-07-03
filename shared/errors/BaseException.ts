import { type ErrorCode } from './ErrorCode.enum';

/**
 * Excepción base para errores de dominio/negocio de toda la plataforma.
 * No depende de NestJS.
 *
 * Es `abstract`: no se instancia directamente. Cada servicio debe definir
 * su propia subclase (p. ej. `DomainException` en auth-service y
 * config-service) con un constructor público o un método de fábrica
 * estático que llame a `super(...)`. Ver
 * `services/auth-service/src/domain/errors/domain.exception.ts` como
 * referencia de implementación.
 *
 * {@link GlobalExceptionFilter} reconoce cualquier instancia de
 * `BaseException` de forma polimórfica: cuando la captura, traduce
 * `messageKey` con {@link I18nService} usando `metadata` como parámetros de
 * interpolación, y responde con `httpStatus` y `code` tal cual los definió
 * la excepción — no hace falta registrar cada subclase en el filtro.
 *
 * @example
 * ```ts
 * class DomainException extends BaseException {
 *   static create(messageKey: string, code: ErrorCode, httpStatus: number) {
 *     return new DomainException(messageKey, code, httpStatus);
 *   }
 *   private constructor(messageKey: string, code: ErrorCode, httpStatus: number) {
 *     super(messageKey, code, httpStatus);
 *   }
 * }
 *
 * throw DomainException.create('auth.invalid_credentials', ErrorCode.INVALID_CREDENTIALS, 401);
 * ```
 */
export abstract class BaseException extends Error {
  /** Código de error estable, consumido por clientes y por {@link HttpErrorMapper}. */
  public readonly code: ErrorCode;
  /** Datos adicionales; se usan también como parámetros de interpolación i18n (p. ej. `{{field}}`). */
  public readonly metadata?: Record<string, unknown>;
  /** Status HTTP con el que {@link GlobalExceptionFilter} responderá. */
  public readonly httpStatus: number;
  /** Clave de traducción i18n (no el mensaje final); se resuelve con {@link I18nService.translate}. */
  public readonly messageKey: string;

  protected constructor(
    messageKey: string,
    code: ErrorCode,
    httpStatus: number,
    metadata?: Record<string, unknown>,
  ) {
    super(messageKey);
    this.messageKey = messageKey;
    this.code = code;
    this.httpStatus = httpStatus;
    this.metadata = metadata;
  }
}
