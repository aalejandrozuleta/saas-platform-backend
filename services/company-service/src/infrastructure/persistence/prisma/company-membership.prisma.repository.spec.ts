import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { CompanyMembershipPrismaRepository } from './company-membership.prisma.repository';

const row = {
  id: 'm-1',
  companyId: 'c-1',
  userId: 'u-1',
  role: 'WORKER',
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CompanyMembershipPrismaRepository', () => {
  let prisma: any;
  let repository: CompanyMembershipPrismaRepository;

  beforeEach(() => {
    prisma = {
      companyMembership: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    repository = new CompanyMembershipPrismaRepository(prisma);
  });

  it('findByCompanyAndUser usa la clave compuesta', async () => {
    prisma.companyMembership.findUnique.mockResolvedValue(row);

    const found = await repository.findByCompanyAndUser('c-1', 'u-1');

    expect(found?.id).toBe('m-1');
    expect(prisma.companyMembership.findUnique).toHaveBeenCalledWith({
      where: { companyId_userId: { companyId: 'c-1', userId: 'u-1' } },
    });
  });

  it('findByCompanyAndUser devuelve null si no existe', async () => {
    prisma.companyMembership.findUnique.mockResolvedValue(null);

    await expect(repository.findByCompanyAndUser('c-1', 'u-1')).resolves.toBeNull();
  });

  it('findByCompanyId mapea todas las filas', async () => {
    prisma.companyMembership.findMany.mockResolvedValue([row, { ...row, id: 'm-2' }]);

    const found = await repository.findByCompanyId('c-1');

    expect(found).toHaveLength(2);
    expect(found[1].id).toBe('m-2');
  });

  it('findById devuelve la entidad', async () => {
    prisma.companyMembership.findUnique.mockResolvedValue(row);

    await expect(repository.findById('m-1')).resolves.toMatchObject({ id: 'm-1' });
  });

  it('findById devuelve null si no existe', async () => {
    prisma.companyMembership.findUnique.mockResolvedValue(null);

    await expect(repository.findById('m-1')).resolves.toBeNull();
  });

  it('save persiste la membresía', async () => {
    const membership = CompanyMembership.create({
      id: 'm-1',
      companyId: 'c-1',
      userId: 'u-1',
      role: MembershipRole.WORKER,
    });

    await repository.save(membership);

    expect(prisma.companyMembership.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: 'm-1', status: MembershipStatus.INVITED }),
    });
  });

  it('update actualiza por id', async () => {
    const membership = CompanyMembership.create({
      id: 'm-1',
      companyId: 'c-1',
      userId: 'u-1',
      role: MembershipRole.MANAGER,
      status: MembershipStatus.ACTIVE,
    });

    await repository.update(membership);

    expect(prisma.companyMembership.update).toHaveBeenCalledWith({
      where: { id: 'm-1' },
      data: expect.objectContaining({ role: MembershipRole.MANAGER }),
    });
  });
});
