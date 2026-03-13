import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

import { SecurityPrismaRepository } from './security-prisma.repository';
import { PrismaService } from './prisma.service';

describe('SecurityPrismaRepository', () => {
  let repository: SecurityPrismaRepository;

  let prisma: any;

  beforeEach(() => {
    prisma = {
      user: {
        updateMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      userSecurity: {
        findUnique: jest.fn(),
      },
    };

    repository = new SecurityPrismaRepository(
      prisma as unknown as PrismaService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerFailedAttempt', () => {
    it('debe incrementar intentos fallidos', async () => {
      prisma.user.updateMany.mockResolvedValue({ count: 1 });

      prisma.user.findUnique.mockResolvedValue({
        failedLoginAttempts: 1,
      });

      await repository.registerFailedAttempt(
        'user-1',
        5,
        10,
        new Date(),
      );

      expect(prisma.user.updateMany).toHaveBeenCalled();
      expect(prisma.user.findUnique).toHaveBeenCalled();
    });

    it('debe lanzar error si el usuario ya está bloqueado', async () => {
      prisma.user.updateMany.mockResolvedValue({ count: 0 });

      const error = new Error('blocked');
      jest
        .spyOn(DomainErrorFactory, 'userBlocked')
        .mockReturnValue(error as any);

      await expect(
        repository.registerFailedAttempt(
          'user-1',
          5,
          10,
          new Date(),
        ),
      ).rejects.toThrow(error);
    });

    it('debe bloquear usuario al alcanzar el máximo de intentos', async () => {
      prisma.user.updateMany.mockResolvedValue({ count: 1 });

      prisma.user.findUnique.mockResolvedValue({
        failedLoginAttempts: 5,
      });

      await repository.registerFailedAttempt(
        'user-1',
        5,
        10,
        new Date(),
      );

      expect(prisma.user.update).toHaveBeenCalled();

      const args = prisma.user.update.mock.calls[0][0];

      expect(args.data.blockedUntil).toBeInstanceOf(Date);
      expect(args.data.status).toBeUndefined();
    });
  });

  describe('resetFailedLoginAttempts', () => {
    it('debe resetear intentos fallidos', async () => {
      await repository.resetFailedLoginAttempts('user-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          failedLoginAttempts: 0,
          blockedUntil: null,
        },
      });
    });
  });

  describe('releaseTemporaryBlock', () => {
    it('debe liberar un bloqueo temporal heredado', async () => {
      await repository.releaseTemporaryBlock('user-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          failedLoginAttempts: 0,
          blockedUntil: null,
          status: 'ACTIVE',
        },
      });
    });
  });

  describe('findByUserId', () => {
    it('debe consultar userSecurity por userId', async () => {
      prisma.userSecurity.findUnique.mockResolvedValue({
        trustedCountries: ['CO'],
      });

      const result = await repository.findByUserId('user-1');

      expect(prisma.userSecurity.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        select: { trustedCountries: true },
      });

      expect(result).toEqual({
        trustedCountries: ['CO'],
      });
    });
  });
});
