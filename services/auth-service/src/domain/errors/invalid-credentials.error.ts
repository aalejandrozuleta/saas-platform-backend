import { BaseException, ErrorCode } from '@saas/shared';

/**
 * Credenciales inválidas
 */
export class InvalidCredentialsError extends BaseException {
  constructor() {
    super(
      'Invalid credentials',
      ErrorCode.INVALID_CREDENTIALS,
      401,
    );
  }
}
