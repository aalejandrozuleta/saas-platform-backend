import { ErrorCode } from '@saas/shared';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { ListMembersUseCase } from './list-members.use-case';

describe('ListMembersUseCase', () => {
  let useCase: ListMembersUseCase;
  let membershipRepository: any;

  const requester = (status: MembershipStatus) =>
    CompanyMembership.create({
      id: 'm-1',
      companyId: 'c-1',
      userId: 'u-1',
      role: MembershipRole.WORKER,
      status,
    });

  beforeEach(() => {
    membershipRepository = {
      findByCompanyAndUser: jest.fn(),
      findByCompanyId: jest.fn(),
    };

    useCase = new ListMembersUseCase(membershipRepository);
  });

  it('devuelve los miembros si el solicitante es miembro activo', async () => {
    const members = [requester(MembershipStatus.ACTIVE)];

    membershipRepository.findByCompanyAndUser.mockResolvedValue(requester(MembershipStatus.ACTIVE));
    membershipRepository.findByCompanyId.mockResolvedValue(members);

    await expect(useCase.execute('u-1', 'c-1')).resolves.toBe(members);
    expect(membershipRepository.findByCompanyId).toHaveBeenCalledWith('c-1');
  });

  it('lanza COMPANY_NOT_FOUND si no tiene membresía', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(null);

    await expect(useCase.execute('u-1', 'c-1')).rejects.toMatchObject({
      code: ErrorCode.COMPANY_NOT_FOUND,
    });

    expect(membershipRepository.findByCompanyId).not.toHaveBeenCalled();
  });

  it('lanza COMPANY_NOT_FOUND si la membresía no está activa', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      requester(MembershipStatus.SUSPENDED),
    );

    await expect(useCase.execute('u-1', 'c-1')).rejects.toMatchObject({
      code: ErrorCode.COMPANY_NOT_FOUND,
    });
  });
});
