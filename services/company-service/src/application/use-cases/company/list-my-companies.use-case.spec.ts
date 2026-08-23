import { Company } from '@domain/entities/company/company.entity';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { ListMyCompaniesUseCase } from './list-my-companies.use-case';

const buildCompany = (id: string) =>
  Company.create({
    id,
    name: `Company ${id}`,
    email: 'contacto@acme.com',
    phone: '+57 3001234567',
    address: 'Calle 123',
    city: 'Bogotá',
  });

const buildMembership = (
  id: string,
  companyId: string,
  role: MembershipRole,
  status: MembershipStatus,
) => CompanyMembership.create({ id, companyId, userId: 'u-1', role, status });

describe('ListMyCompaniesUseCase', () => {
  let useCase: ListMyCompaniesUseCase;
  let membershipRepository: any;
  let companyRepository: any;

  beforeEach(() => {
    membershipRepository = { findByUserId: jest.fn() };
    companyRepository = { findByIds: jest.fn() };

    useCase = new ListMyCompaniesUseCase(membershipRepository, companyRepository);
  });

  it('devuelve vacío sin consultar companyRepository si no hay membresías', async () => {
    membershipRepository.findByUserId.mockResolvedValue([]);

    await expect(useCase.execute('u-1')).resolves.toEqual([]);
    expect(companyRepository.findByIds).not.toHaveBeenCalled();
  });

  it('combina membresías (en cualquier estado) con sus empresas', async () => {
    const memberships = [
      buildMembership('m-1', 'c-1', MembershipRole.OWNER, MembershipStatus.ACTIVE),
      buildMembership('m-2', 'c-2', MembershipRole.WORKER, MembershipStatus.INVITED),
    ];
    membershipRepository.findByUserId.mockResolvedValue(memberships);
    companyRepository.findByIds.mockResolvedValue([buildCompany('c-1'), buildCompany('c-2')]);

    const rows = await useCase.execute('u-1');

    expect(companyRepository.findByIds).toHaveBeenCalledWith(['c-1', 'c-2']);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      membershipId: 'm-1',
      role: MembershipRole.OWNER,
      status: MembershipStatus.ACTIVE,
    });
    expect(rows[0].company.id).toBe('c-1');
    expect(rows[1]).toMatchObject({ membershipId: 'm-2', status: MembershipStatus.INVITED });
  });

  it('descarta membresías cuya empresa ya no existe', async () => {
    membershipRepository.findByUserId.mockResolvedValue([
      buildMembership('m-1', 'c-1', MembershipRole.OWNER, MembershipStatus.ACTIVE),
    ]);
    companyRepository.findByIds.mockResolvedValue([]);

    await expect(useCase.execute('u-1')).resolves.toEqual([]);
  });
});
