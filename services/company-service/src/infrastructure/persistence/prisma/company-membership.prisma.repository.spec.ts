import { ErrorCode } from '@saas/shared';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { Prisma } from '../../../generated/prisma';

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
        count: jest.fn(),
      },
      $transaction: jest.fn(),
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

  it('findByCompanyIdPaged devuelve la página y el total en una sola transacción', async () => {
    prisma.$transaction.mockResolvedValue([[row], 5]);

    const page = await repository.findByCompanyIdPaged('c-1', { skip: 20, take: 10 });

    expect(page.total).toBe(5);
    expect(page.items).toHaveLength(1);
    expect(page.items[0].id).toBe('m-1');
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.$transaction.mock.calls[0][0]).toHaveLength(2);
  });

  it('updateAndCountActiveOwners escribe y cuenta OWNERs activos en una transacción SERIALIZABLE', async () => {
    const membership = CompanyMembership.create({
      id: 'm-1',
      companyId: 'c-1',
      userId: 'u-1',
      role: MembershipRole.MANAGER,
      status: MembershipStatus.ACTIVE,
    });

    const tx = {
      companyMembership: {
        update: jest.fn().mockResolvedValue({ ...row, role: 'MANAGER' }),
        count: jest.fn().mockResolvedValue(1),
      },
    };
    prisma.$transaction.mockImplementation(async (fn: any, options: any) => {
      expect(options).toEqual({ isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      return fn(tx);
    });

    const result = await repository.updateAndCountActiveOwners('c-1', membership);

    expect(result.activeOwners).toBe(1);
    expect(result.updated.role).toBe(MembershipRole.MANAGER);
    expect(tx.companyMembership.count).toHaveBeenCalledWith({
      where: { companyId: 'c-1', role: MembershipRole.OWNER, status: MembershipStatus.ACTIVE },
    });
  });

  it('updateAndCountActiveOwners lanza CONFLICT si no queda ningún OWNER activo', async () => {
    const membership = CompanyMembership.create({
      id: 'm-1',
      companyId: 'c-1',
      userId: 'u-1',
      role: MembershipRole.MANAGER,
      status: MembershipStatus.ACTIVE,
    });

    const tx = {
      companyMembership: {
        update: jest.fn().mockResolvedValue(row),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    prisma.$transaction.mockImplementation(async (fn: any) => fn(tx));

    await expect(repository.updateAndCountActiveOwners('c-1', membership)).rejects.toMatchObject({
      code: ErrorCode.CONFLICT,
    });
  });
});
