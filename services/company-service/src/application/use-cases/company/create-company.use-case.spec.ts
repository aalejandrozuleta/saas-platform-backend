import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { CreateCompanyUseCase } from './create-company.use-case';

const validInput = {
  name: 'Acme',
  taxId: '900-1',
  email: 'contacto@acme.com',
  phone: '+57 3001234567',
  address: 'Calle 123',
  city: 'Bogotá',
};

describe('CreateCompanyUseCase', () => {
  let useCase: CreateCompanyUseCase;
  let companyRepository: any;

  beforeEach(() => {
    companyRepository = {
      findById: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      createWithOwnerMembership: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new CreateCompanyUseCase(companyRepository);
  });

  it('crea la empresa junto a la membresía OWNER activa del creador', async () => {
    const company = await useCase.execute('u-1', validInput);

    expect(company.name).toBe('Acme');
    expect(company.email).toBe('contacto@acme.com');
    expect(company.phone).toBe('+57 3001234567');
    expect(company.address).toBe('Calle 123');
    expect(company.city).toBe('Bogotá');
    expect(company.country).toBe('CO');
    expect(companyRepository.createWithOwnerMembership).toHaveBeenCalledTimes(1);

    const [persistedCompany, membership] =
      companyRepository.createWithOwnerMembership.mock.calls[0];

    expect(persistedCompany).toBe(company);
    expect(membership.companyId).toBe(company.id);
    expect(membership.userId).toBe('u-1');
    expect(membership.role).toBe(MembershipRole.OWNER);
    expect(membership.status).toBe(MembershipStatus.ACTIVE);
  });

  it('permite crear sin taxId', async () => {
    const company = await useCase.execute('u-1', { ...validInput, taxId: undefined });

    expect(company.taxId).toBeUndefined();
  });

  it('propaga el country explícito', async () => {
    const company = await useCase.execute('u-1', { ...validInput, country: 'US' });

    expect(company.country).toBe('US');
  });

  it('propaga el error de dominio si el nombre está vacío', async () => {
    await expect(useCase.execute('u-1', { ...validInput, name: '  ' })).rejects.toThrow(
      'COMPANY_NAME_REQUIRED',
    );

    expect(companyRepository.createWithOwnerMembership).not.toHaveBeenCalled();
  });

  it('propaga el error de dominio si el email está vacío', async () => {
    await expect(useCase.execute('u-1', { ...validInput, email: '  ' })).rejects.toThrow(
      'COMPANY_EMAIL_REQUIRED',
    );

    expect(companyRepository.createWithOwnerMembership).not.toHaveBeenCalled();
  });
});
