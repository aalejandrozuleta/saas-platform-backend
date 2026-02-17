import { BaseException } from '@saas/shared';

/**
 * Usuario bloqueado temporal o permanente
 */
export class UserBlockedError extends BaseException {
  constructor(blockedUntil?: Date) {
    super(
      'User is blocked',
      'USER_BLOCKED',
      { blockedUntil, httpStatus: 403 },
    );
  }
}
