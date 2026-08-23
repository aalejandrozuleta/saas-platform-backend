import { ErrorCode } from '@saas/shared';
import { Company } from '@domain/entities/company/company.entity';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { RemoveCompanyLogoUseCase } from './remove-company-logo.use-case';

const validInput = {
  name: 'Acme',
  email: 'contacto@acme.com',
  phone: '+57 3001234567',
  address: 'Calle 123',
  city: 'Bogotá',
};

const membership = (role: MembershipRole, status: MembershipStatus) =>
  CompanyMembership.create({ id: 'm-1', companyId: 'c-1', userId: 'u-1', role, status });

describe('RemoveCompanyLogoUseCase', () => {
  let useCase: RemoveCompanyLogoUseCase;
  let companyRepository: any;
  let membershipRepository: any;
  let imageStorage: any;

  beforeEach(() => {
    companyRepository = { findById: jest.fn(), update: jest.fn().mockResolvedValue(undefined) };
    membershipRepository = { findByCompanyAndUser: jest.fn() };
    imageStorage = { deleteByUrl: jest.fn().mockResolvedValue(undefined) };

    useCase = new RemoveCompanyLogoUseCase(companyRepository, membershipRepository, imageStorage);
  });

  it('borra el logo del storage y limpia logoUrl', async () => {
    const company = Company.create({ id: 'c-1', ...validInput }).updateLogo(
      'https://storage/logos/c-1.webp',
    );
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      membership(MembershipRole.OWNER, MembershipStatus.ACTIVE),
    );
    companyRepository.findById.mockResolvedValue(company);

    const updated = await useCase.execute('u-1', 'c-1');

    expect(imageStorage.deleteByUrl).toHaveBeenCalledWith('https://storage/logos/c-1.webp');
    expect(updated.logoUrl).toBeUndefined();
    expect(companyRepository.update).toHaveBeenCalledWith(updated);
  });

  it('es idempotente si la empresa ya no tiene logo', async () => {
    const company = Company.create({ id: 'c-1', ...validInput });
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      membership(MembershipRole.OWNER, MembershipStatus.ACTIVE),
    );
    companyRepository.findById.mockResolvedValue(company);

    const result = await useCase.execute('u-1', 'c-1');

    expect(result).toBe(company);
    expect(imageStorage.deleteByUrl).not.toHaveBeenCalled();
    expect(companyRepository.update).not.toHaveBeenCalled();
  });

  it('lanza FORBIDDEN si el solicitante no puede gestionar miembros', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      membership(MembershipRole.WORKER, MembershipStatus.ACTIVE),
    );

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
  });
});
