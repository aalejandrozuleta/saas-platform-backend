import { ErrorCode } from '@saas/shared';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { AcceptInvitationUseCase } from './accept-invitation.use-case';

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

describe('AcceptInvitationUseCase', () => {
  let useCase: AcceptInvitationUseCase;
  let membershipRepository: any;

  beforeEach(() => {
    membershipRepository = { findById: jest.fn(), update: jest.fn().mockResolvedValue(undefined) };

    useCase = new AcceptInvitationUseCase(membershipRepository);
  });

  it('acepta la invitación propia pendiente', async () => {
    membershipRepository.findById.mockResolvedValue(build());

    const updated = await useCase.execute('u-1', 'c-1', 'm-1');

    expect(updated.status).toBe(MembershipStatus.ACTIVE);
    expect(membershipRepository.update).toHaveBeenCalledWith(updated);
  });

  it('lanza MEMBERSHIP_NOT_FOUND si la membresía no existe', async () => {
    membershipRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('u-1', 'c-1', 'm-1')).rejects.toMatchObject({
      code: ErrorCode.MEMBERSHIP_NOT_FOUND,
    });
  });

  it('lanza MEMBERSHIP_NOT_FOUND si la membresía es de otra empresa', async () => {
    membershipRepository.findById.mockResolvedValue(build({ companyId: 'c-2' }));

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

    expect(membershipRepository.update).not.toHaveBeenCalled();
  });
});
