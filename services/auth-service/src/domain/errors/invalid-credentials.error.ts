import { BaseException } from '@saas/shared';

/**
 * Credenciales inválidas
 */
export class InvalidCredentialsError extends BaseException {
  constructor() {
    super(
      'Invalid credentials',
      'INVALID_CREDENTIALS',
      { httpStatus: 401 },
    );
  }
}
