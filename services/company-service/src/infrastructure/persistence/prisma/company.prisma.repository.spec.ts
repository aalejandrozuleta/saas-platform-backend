import { Company } from '@domain/entities/company/company.entity';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { CompanyPrismaRepository } from './company.prisma.repository';

describe('CompanyPrismaRepository', () => {
  let prisma: any;
  let repository: CompanyPrismaRepository;

  const company = Company.create({
    id: 'c-1',
    name: 'Acme',
  });
  const membership = CompanyMembership.create({
    id: 'm-1',
    companyId: 'c-1',
    userId: 'u-1',
    role: MembershipRole.OWNER,
    status: MembershipStatus.ACTIVE,
  });

  beforeEach(() => {
    prisma = {
      company: { findUnique: jest.fn(), create: jest.fn() },
      companyMembership: { create: jest.fn() },
      $transaction: jest.fn().mockResolvedValue([]),
    };

    repository = new CompanyPrismaRepository(prisma);
  });

  it('findById devuelve la entidad de dominio', async () => {
    prisma.company.findUnique.mockResolvedValue({
      id: 'c-1',
      name: 'Acme',
      taxId: null,
      plan: 'STARTER',
      subscriptionStatus: 'active',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const found = await repository.findById('c-1');

    expect(found?.id).toBe('c-1');
    expect(prisma.company.findUnique).toHaveBeenCalledWith({ where: { id: 'c-1' } });
  });

  it('findById devuelve null si no existe', async () => {
    prisma.company.findUnique.mockResolvedValue(null);

    await expect(repository.findById('c-1')).resolves.toBeNull();
  });

  it('save persiste la empresa', async () => {
    await repository.save(company);

    expect(prisma.company.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: 'c-1', name: 'Acme' }),
    });
  });

  it('createWithOwnerMembership persiste ambas filas en una transacción', async () => {
    await repository.createWithOwnerMembership(company, membership);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.$transaction.mock.calls[0][0]).toHaveLength(2);
    expect(prisma.company.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: 'c-1' }),
    });
    expect(prisma.companyMembership.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: 'm-1', role: MembershipRole.OWNER }),
    });
  });
});
