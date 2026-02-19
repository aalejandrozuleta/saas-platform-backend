import { BaseException, ErrorCode } from '@saas/shared';

/**
 * Excepción concreta del dominio Auth.
 * Extiende la excepción base compartida.
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
