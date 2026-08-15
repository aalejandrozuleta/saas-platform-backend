import { ErrorCode } from '@saas/shared';

import { DomainErrorFactory } from './domain-error.factory';

describe('DomainErrorFactory', () => {
  it.each([
    ['companyNotFound', ErrorCode.COMPANY_NOT_FOUND, 404, 'company.not_found'],
    [
      'membershipAlreadyExists',
      ErrorCode.MEMBERSHIP_ALREADY_EXISTS,
      409,
      'membership.already_exists',
    ],
    ['membershipNotFound', ErrorCode.MEMBERSHIP_NOT_FOUND, 404, 'membership.not_found'],
    ['notCompanyOwner', ErrorCode.FORBIDDEN, 403, 'company.not_owner'],
    ['lastOwnerCannotBeDemoted', ErrorCode.CONFLICT, 409, 'membership.last_owner'],
    ['userNotFoundForInvite', ErrorCode.USER_NOT_FOUND, 404, 'membership.user_not_found'],
    [
      'authServiceUnavailable',
      ErrorCode.SERVICE_UNAVAILABLE,
      503,
      'company.auth_service_unavailable',
    ],
  ])('%s produce el código/status/clave esperados', (method, code, status, messageKey) => {
    const error = (DomainErrorFactory as unknown as Record<string, () => Error>)[method]();

    expect(error).toMatchObject({ code, httpStatus: status, message: messageKey });
  });
});
