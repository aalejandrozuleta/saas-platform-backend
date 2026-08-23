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
    ['ownerRoleRequiresOwner', ErrorCode.FORBIDDEN, 403, 'membership.owner_role_requires_owner'],
    ['logoFileRequired', ErrorCode.VALIDATION_ERROR, 400, 'company.logo_file_required'],
    [
      'taxIdAlreadyRegistered',
      ErrorCode.TAX_ID_ALREADY_REGISTERED,
      409,
      'company.tax_id_already_registered',
    ],
    ['invitationNotPending', ErrorCode.CONFLICT, 409, 'membership.invitation_not_pending'],
    ['cannotRemoveOwner', ErrorCode.FORBIDDEN, 403, 'membership.cannot_remove_owner'],
    ['companyDeletionRequiresOwner', ErrorCode.FORBIDDEN, 403, 'company.deletion_requires_owner'],
  ])('%s produce el código/status/clave esperados', (method, code, status, messageKey) => {
    const error = (DomainErrorFactory as unknown as Record<string, () => Error>)[method]();

    expect(error).toMatchObject({ code, httpStatus: status, message: messageKey });
  });
});
