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
      findByCompanyIdPaged: jest.fn(),
    };

    useCase = new ListMembersUseCase(membershipRepository);
  });

  it('devuelve la página de miembros si el solicitante es miembro activo', async () => {
    const page = { items: [requester(MembershipStatus.ACTIVE)], total: 1 };

    membershipRepository.findByCompanyAndUser.mockResolvedValue(requester(MembershipStatus.ACTIVE));
    membershipRepository.findByCompanyIdPaged.mockResolvedValue(page);

    await expect(useCase.execute('u-1', 'c-1', { page: 1, limit: 20 })).resolves.toBe(page);
    expect(membershipRepository.findByCompanyIdPaged).toHaveBeenCalledWith(
      'c-1',
      { skip: 0, take: 20 },
      undefined,
    );
  });

  it('calcula el skip a partir de la página solicitada', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(requester(MembershipStatus.ACTIVE));
    membershipRepository.findByCompanyIdPaged.mockResolvedValue({ items: [], total: 0 });

    await useCase.execute('u-1', 'c-1', { page: 3, limit: 10 });

    expect(membershipRepository.findByCompanyIdPaged).toHaveBeenCalledWith(
      'c-1',
      { skip: 20, take: 10 },
      undefined,
    );
  });

  it('pasa los filtros de role/status al repositorio', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(requester(MembershipStatus.ACTIVE));
    membershipRepository.findByCompanyIdPaged.mockResolvedValue({ items: [], total: 0 });

    await useCase.execute(
      'u-1',
      'c-1',
      { page: 1, limit: 20 },
      { role: MembershipRole.WORKER, status: MembershipStatus.INVITED },
    );

    expect(membershipRepository.findByCompanyIdPaged).toHaveBeenCalledWith(
      'c-1',
      { skip: 0, take: 20 },
      { role: MembershipRole.WORKER, status: MembershipStatus.INVITED },
    );
  });

  it('lanza COMPANY_NOT_FOUND si no tiene membresía', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(null);

    await expect(useCase.execute('u-1', 'c-1', { page: 1, limit: 20 })).rejects.toMatchObject({
      code: ErrorCode.COMPANY_NOT_FOUND,
    });

    expect(membershipRepository.findByCompanyIdPaged).not.toHaveBeenCalled();
  });

  it('lanza COMPANY_NOT_FOUND si la membresía no está activa', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      requester(MembershipStatus.SUSPENDED),
    );

    await expect(useCase.execute('u-1', 'c-1', { page: 1, limit: 20 })).rejects.toMatchObject({
      code: ErrorCode.COMPANY_NOT_FOUND,
    });
  });
});
