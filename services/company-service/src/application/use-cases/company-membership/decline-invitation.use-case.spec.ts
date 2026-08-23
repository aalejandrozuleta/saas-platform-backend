import { ErrorCode } from '@saas/shared';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { DeclineInvitationUseCase } from './decline-invitation.use-case';

const build = (
  overrides: Partial<{ companyId: string; userId: string; status: MembershipStatus }> = {},
) =>
  CompanyMembership.create({
    id: 'm-1',
    companyId: 'c-1',
    userId: 'u-1',
    role: MembershipRole.WORKER,
    status: MembershipStatus.INVITED,
    ...overrides,
  });

describe('DeclineInvitationUseCase', () => {
  let useCase: DeclineInvitationUseCase;
  let membershipRepository: any;

  beforeEach(() => {
    membershipRepository = { findById: jest.fn(), delete: jest.fn().mockResolvedValue(undefined) };

    useCase = new DeclineInvitationUseCase(membershipRepository);
  });

  it('elimina la invitación propia pendiente', async () => {
    membershipRepository.findById.mockResolvedValue(build());

    await useCase.execute('u-1', 'c-1', 'm-1');

    expect(membershipRepository.delete).toHaveBeenCalledWith('m-1');
  });

  it('lanza MEMBERSHIP_NOT_FOUND si la membresía no existe', async () => {
    membershipRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('u-1', 'c-1', 'm-1')).rejects.toMatchObject({
      code: ErrorCode.MEMBERSHIP_NOT_FOUND,
    });
  });

  it('lanza MEMBERSHIP_NOT_FOUND si la membresía pertenece a otro usuario', async () => {
    membershipRepository.findById.mockResolvedValue(build({ userId: 'u-2' }));

    await expect(useCase.execute('u-1', 'c-1', 'm-1')).rejects.toMatchObject({
      code: ErrorCode.MEMBERSHIP_NOT_FOUND,
    });
  });

  it('lanza CONFLICT si la membresía ya no está pendiente', async () => {
    membershipRepository.findById.mockResolvedValue(build({ status: MembershipStatus.ACTIVE }));

    await expect(useCase.execute('u-1', 'c-1', 'm-1')).rejects.toMatchObject({
      code: ErrorCode.CONFLICT,
    });

    expect(membershipRepository.delete).not.toHaveBeenCalled();
  });
});
