import { BaseException, ErrorCode } from '@saas/shared';

/**
 * Usuario bloqueado temporal o permanente
 */
export class UserBlockedError extends BaseException {
  constructor(blockedUntil?: Date) {
    super(
      'User is blocked',
      ErrorCode.UNAUTHORIZED,
      { blockedUntil, httpStatus: 403 },
    );
  }
}
