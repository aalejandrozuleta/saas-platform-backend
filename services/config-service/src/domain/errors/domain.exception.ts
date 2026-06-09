import { BaseException, type ErrorCode } from '@saas/shared';

/**
 * Excepción concreta del config-service.
 *
 * Extiende BaseException con un factory estático para que
 * DomainErrorFactory pueda crear excepciones sin acceder
 * directamente al constructor protegido de BaseException.
 */
export class DomainException extends BaseException {
  static create(
    messageKey: string,
    code: ErrorCode,
    httpStatus: number,
    metadata?: Record<string, unknown>,
  ): DomainException {
    return new DomainException(messageKey, code, httpStatus, metadata);
  }

  private constructor(
    messageKey: string,
    code: ErrorCode,
    httpStatus: number,
    metadata?: Record<string, unknown>,
  ) {
    super(messageKey, code, httpStatus, metadata);
    this.name = 'DomainException';
  }
}
