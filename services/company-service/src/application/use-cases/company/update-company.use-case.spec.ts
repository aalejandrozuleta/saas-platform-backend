import { ErrorCode } from '@saas/shared';
import { Company } from '@domain/entities/company/company.entity';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { UpdateCompanyUseCase } from './update-company.use-case';

const validInput = {
  name: 'Acme',
  email: 'contacto@acme.com',
  phone: '+57 3001234567',
  address: 'Calle 123',
  city: 'Bogotá',
};

const company = Company.create({ id: 'c-1', ...validInput });

const membership = (role: MembershipRole, status: MembershipStatus) =>
  CompanyMembership.create({ id: 'm-1', companyId: 'c-1', userId: 'u-1', role, status });

describe('UpdateCompanyUseCase', () => {
  let useCase: UpdateCompanyUseCase;
  let companyRepository: any;
  let membershipRepository: any;

  beforeEach(() => {
    companyRepository = { findById: jest.fn(), update: jest.fn().mockResolvedValue(undefined) };
    membershipRepository = { findByCompanyAndUser: jest.fn() };

    useCase = new UpdateCompanyUseCase(companyRepository, membershipRepository);
  });

  it('actualiza el perfil cuando el solicitante puede gestionar miembros', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      membership(MembershipRole.OWNER, MembershipStatus.ACTIVE),
    );
    companyRepository.findById.mockResolvedValue(company);

    const updated = await useCase.execute('u-1', 'c-1', { name: 'Acme Nueva' });

    expect(updated.name).toBe('Acme Nueva');
    expect(companyRepository.update).toHaveBeenCalledWith(updated);
  });

  it('permite actualizar siendo MANAGER', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      membership(MembershipRole.MANAGER, MembershipStatus.ACTIVE),
    );
    companyRepository.findById.mockResolvedValue(company);

    await expect(useCase.execute('u-1', 'c-1', { city: 'Cali' })).resolves.toBeDefined();
  });

  it('lanza FORBIDDEN si el solicitante no puede gestionar miembros', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      membership(MembershipRole.WORKER, MembershipStatus.ACTIVE),
    );

    await expect(useCase.execute('u-1', 'c-1', { name: 'X' })).rejects.toMatchObject({
      code: ErrorCode.FORBIDDEN,
    });

    expect(companyRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza COMPANY_NOT_FOUND si la empresa no existe', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      membership(MembershipRole.OWNER, MembershipStatus.ACTIVE),
    );
    companyRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('u-1', 'c-1', { name: 'X' })).rejects.toMatchObject({
      code: ErrorCode.COMPANY_NOT_FOUND,
    });
  });
});
