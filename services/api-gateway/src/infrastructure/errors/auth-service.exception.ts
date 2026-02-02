import { BaseException } from '@shared/errors';
import { ErrorCode } from '@shared/errors';

/**
 * Error cuando el Auth Service no está disponible.
 */
export class AuthServiceUnavailableException extends BaseException {
  constructor(metadata?: Record<string, unknown>) {
    super(
      'Auth service unavailable',
      ErrorCode.INTERNAL_ERROR,
      metadata,
    );
  }
}
