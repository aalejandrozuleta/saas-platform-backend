import { ErrorCode } from '@saas/shared';
import { Company } from '@domain/entities/company/company.entity';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { GetCompanyUseCase } from './get-company.use-case';

describe('GetCompanyUseCase', () => {
  let useCase: GetCompanyUseCase;
  let companyRepository: any;
  let membershipRepository: any;

  const company = Company.create({
    id: 'c-1',
    name: 'Acme',
  });

  const membership = (status: MembershipStatus) =>
    CompanyMembership.create({
      id: 'm-1',
      companyId: 'c-1',
      userId: 'u-1',
      role: MembershipRole.WORKER,
      status,
    });

  beforeEach(() => {
    companyRepository = { findById: jest.fn() };
    membershipRepository = { findByCompanyAndUser: jest.fn() };

    useCase = new GetCompanyUseCase(companyRepository, membershipRepository);
  });

  it('devuelve la empresa si el solicitante es miembro activo', async () => {
    companyRepository.findById.mockResolvedValue(company);
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      membership(MembershipStatus.ACTIVE),
    );

    await expect(useCase.execute('u-1', 'c-1')).resolves.toBe(company);
  });

  it('lanza COMPANY_NOT_FOUND si la empresa no existe', async () => {
    companyRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('u-1', 'c-1')).rejects.toMatchObject({
      code: ErrorCode.COMPANY_NOT_FOUND,
    });

    expect(membershipRepository.findByCompanyAndUser).not.toHaveBeenCalled();
  });

  it('lanza COMPANY_NOT_FOUND si el solicitante no tiene membresía', async () => {
    companyRepository.findById.mockResolvedValue(company);
    membershipRepository.findByCompanyAndUser.mockResolvedValue(null);

    await expect(useCase.execute('u-1', 'c-1')).rejects.toMatchObject({
      code: ErrorCode.COMPANY_NOT_FOUND,
    });
  });

  it('lanza COMPANY_NOT_FOUND si la membresía no está activa', async () => {
    companyRepository.findById.mockResolvedValue(company);
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      membership(MembershipStatus.INVITED),
    );

    await expect(useCase.execute('u-1', 'c-1')).rejects.toMatchObject({
      code: ErrorCode.COMPANY_NOT_FOUND,
    });
  });
});
