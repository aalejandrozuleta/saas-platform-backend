import { BaseException, ErrorCode } from '@saas/shared';

/**
 * El email ya está registrado en el sistema
 */
export class EmailAlreadyExistsError extends BaseException {
  constructor() {
    super(
      'Email already exists',
      ErrorCode.EMAIL_ALREADY_EXISTS,
      409,
    );
  }
}

