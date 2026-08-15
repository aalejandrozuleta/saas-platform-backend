import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { CreateCompanyUseCase } from './create-company.use-case';

const validInput = {
  name: 'Acme',
  taxId: '900-1',
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

  it('propaga el error de dominio si el nombre está vacío', async () => {
    await expect(useCase.execute('u-1', { ...validInput, name: '  ' })).rejects.toThrow(
      'COMPANY_NAME_REQUIRED',
    );

    expect(companyRepository.createWithOwnerMembership).not.toHaveBeenCalled();
  });
});
