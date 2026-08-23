import { ErrorCode } from '@saas/shared';
import { Company } from '@domain/entities/company/company.entity';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { DeleteCompanyUseCase } from './delete-company.use-case';

const company = Company.create({
  id: 'c-1',
  name: 'Acme',
  email: 'contacto@acme.com',
  phone: '+57 3001234567',
  address: 'Calle 123',
  city: 'Bogotá',
});

const membership = (role: MembershipRole, status: MembershipStatus) =>
  CompanyMembership.create({ id: 'm-1', companyId: 'c-1', userId: 'u-1', role, status });

describe('DeleteCompanyUseCase', () => {
  let useCase: DeleteCompanyUseCase;
  let companyRepository: any;
  let membershipRepository: any;

  beforeEach(() => {
    companyRepository = { findById: jest.fn(), delete: jest.fn().mockResolvedValue(undefined) };
    membershipRepository = { findByCompanyAndUser: jest.fn() };

    useCase = new DeleteCompanyUseCase(companyRepository, membershipRepository);
  });

  it('elimina la empresa cuando el solicitante es OWNER activo', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      membership(MembershipRole.OWNER, MembershipStatus.ACTIVE),
    );
    companyRepository.findById.mockResolvedValue(company);

    await useCase.execute('u-1', 'c-1');

    expect(companyRepository.delete).toHaveBeenCalledWith('c-1');
  });

  it('lanza FORBIDDEN si el solicitante es MANAGER', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      membership(MembershipRole.MANAGER, MembershipStatus.ACTIVE),
    );

    await expect(useCase.execute('u-1', 'c-1')).rejects.toMatchObject({
      code: ErrorCode.FORBIDDEN,
    });

    expect(companyRepository.delete).not.toHaveBeenCalled();
  });

  it('lanza FORBIDDEN si el OWNER no está activo', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      membership(MembershipRole.OWNER, MembershipStatus.SUSPENDED),
    );

    await expect(useCase.execute('u-1', 'c-1')).rejects.toMatchObject({
      code: ErrorCode.FORBIDDEN,
    });
  });

  it('lanza FORBIDDEN si el solicitante no tiene membresía', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(null);

    await expect(useCase.execute('u-1', 'c-1')).rejects.toMatchObject({
      code: ErrorCode.FORBIDDEN,
    });

    expect(companyRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza COMPANY_NOT_FOUND si la empresa no existe', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      membership(MembershipRole.OWNER, MembershipStatus.ACTIVE),
    );
    companyRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('u-1', 'c-1')).rejects.toMatchObject({
      code: ErrorCode.COMPANY_NOT_FOUND,
    });

    expect(companyRepository.delete).not.toHaveBeenCalled();
  });
});
