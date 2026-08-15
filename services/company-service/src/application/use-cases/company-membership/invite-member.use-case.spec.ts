import { ErrorCode } from '@saas/shared';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { InviteMemberUseCase } from './invite-member.use-case';

const buildMembership = (role: MembershipRole, status: MembershipStatus) =>
  CompanyMembership.create({
    id: 'm-requester',
    companyId: 'c-1',
    userId: 'u-req',
    role,
    status,
  });

describe('InviteMemberUseCase', () => {
  let useCase: InviteMemberUseCase;
  let membershipRepository: any;
  let authServiceClient: any;

  beforeEach(() => {
    membershipRepository = {
      findByCompanyAndUser: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    authServiceClient = { lookupUserByEmail: jest.fn() };

    useCase = new InviteMemberUseCase(membershipRepository, authServiceClient);
  });

  it('crea la membresía en INVITED cuando el usuario existe y no es miembro', async () => {
    membershipRepository.findByCompanyAndUser
      .mockResolvedValueOnce(buildMembership(MembershipRole.OWNER, MembershipStatus.ACTIVE))
      .mockResolvedValueOnce(null);
    authServiceClient.lookupUserByEmail.mockResolvedValue({
      userId: 'u-2',
      email: 'nuevo@example.com',
    });

    const membership = await useCase.execute('u-req', 'c-1', {
      email: 'nuevo@example.com',
      role: MembershipRole.WORKER,
    });

    expect(membership.userId).toBe('u-2');
    expect(membership.companyId).toBe('c-1');
    expect(membership.role).toBe(MembershipRole.WORKER);
    expect(membership.status).toBe(MembershipStatus.INVITED);
    expect(membershipRepository.save).toHaveBeenCalledWith(membership);
  });

  it('permite invitar siendo MANAGER', async () => {
    membershipRepository.findByCompanyAndUser
      .mockResolvedValueOnce(buildMembership(MembershipRole.MANAGER, MembershipStatus.ACTIVE))
      .mockResolvedValueOnce(null);
    authServiceClient.lookupUserByEmail.mockResolvedValue({ userId: 'u-2', email: 'a@b.com' });

    await expect(
      useCase.execute('u-req', 'c-1', { email: 'a@b.com', role: MembershipRole.WORKER }),
    ).resolves.toBeDefined();
  });

  it('lanza FORBIDDEN si el solicitante no es miembro', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(null);

    await expect(
      useCase.execute('u-req', 'c-1', { email: 'a@b.com', role: MembershipRole.WORKER }),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });

    expect(authServiceClient.lookupUserByEmail).not.toHaveBeenCalled();
  });

  it('lanza FORBIDDEN si el solicitante es WORKER', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      buildMembership(MembershipRole.WORKER, MembershipStatus.ACTIVE),
    );

    await expect(
      useCase.execute('u-req', 'c-1', { email: 'a@b.com', role: MembershipRole.WORKER }),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });
  });

  it('lanza USER_NOT_FOUND si auth-service no conoce el email', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValueOnce(
      buildMembership(MembershipRole.OWNER, MembershipStatus.ACTIVE),
    );
    authServiceClient.lookupUserByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute('u-req', 'c-1', { email: 'a@b.com', role: MembershipRole.WORKER }),
    ).rejects.toMatchObject({ code: ErrorCode.USER_NOT_FOUND });

    expect(membershipRepository.save).not.toHaveBeenCalled();
  });

  it('lanza MEMBERSHIP_ALREADY_EXISTS si el usuario ya es miembro', async () => {
    membershipRepository.findByCompanyAndUser
      .mockResolvedValueOnce(buildMembership(MembershipRole.OWNER, MembershipStatus.ACTIVE))
      .mockResolvedValueOnce(buildMembership(MembershipRole.WORKER, MembershipStatus.ACTIVE));
    authServiceClient.lookupUserByEmail.mockResolvedValue({ userId: 'u-2', email: 'a@b.com' });

    await expect(
      useCase.execute('u-req', 'c-1', { email: 'a@b.com', role: MembershipRole.WORKER }),
    ).rejects.toMatchObject({ code: ErrorCode.MEMBERSHIP_ALREADY_EXISTS });

    expect(membershipRepository.save).not.toHaveBeenCalled();
  });
});
