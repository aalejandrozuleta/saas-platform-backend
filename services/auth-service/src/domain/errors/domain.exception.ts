import { BaseException, ErrorCode } from '@saas/shared';

/**
 * Excepción base del dominio.
 *
 * Representa errores derivados de reglas de negocio
 * que deben ser manejados por la capa de aplicación.
 */
export class DomainException extends BaseException {
  /**
   * Método de fábrica estático para crear excepciones del dominio.
   */
  static create(
    messageKey: string,
    code: ErrorCode,
    httpStatus: number,
    metadata?: Record<string, unknown>,
  ): DomainException {
    return new DomainException(
      messageKey,
      code,
      httpStatus,
      metadata,
    );
  }

  private constructor(
    messageKey: string,
    code: ErrorCode,
    httpStatus: number,
    metadata?: Record<string, unknown>,
  ) {
    super(messageKey, code, httpStatus, metadata);
  }
}
