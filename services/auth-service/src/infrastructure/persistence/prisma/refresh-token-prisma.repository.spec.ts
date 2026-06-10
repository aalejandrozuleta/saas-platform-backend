import { RefreshTokenPrismaRepository } from './refresh-token-prisma.repository';
import { type PrismaService } from './prisma.service';

describe('RefreshTokenPrismaRepository', () => {
  let repository: RefreshTokenPrismaRepository;

  let prisma: {
    refreshToken: {
      create: jest.Mock;
      updateMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      refreshToken: {
        create: jest.fn(),
        updateMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    repository = new RefreshTokenPrismaRepository(
      prisma as unknown as PrismaService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un refresh token usando PrismaService', async () => {
      const params = {
        userId: 'user-1',
        sessionId: 'session-1',
        jti: 'jti-123',
        familyId: 'family-1',
        tokenHash: 'hash',
        expiresAt: new Date(),
      };

      await repository.create(params);

      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: {
          ...params,
          revokedAt: null,
        },
      });
    });

    it('debe usar cliente transaccional si se proporciona', async () => {
      const tx = {
        refreshToken: {
          create: jest.fn(),
        },
      };

      const params = {
        userId: 'user-2',
        sessionId: 'session-2',
        jti: 'jti-456',
        familyId: 'family-2',
        tokenHash: 'hash',
        expiresAt: new Date(),
      };

      await repository.create(
        params,
        tx as any,
      );

      expect(tx.refreshToken.create).toHaveBeenCalled();
    });
  });

  describe('findByJti', () => {
    it('debe retornar el refresh token si existe', async () => {
      const token = {
        id: 'rt-1',
        userId: 'user-1',
        sessionId: 'session-1',
        familyId: 'family-1',
        tokenHash: 'hash',
        expiresAt: new Date(),
        revokedAt: null,
      };

      prisma.refreshToken.findUnique.mockResolvedValue(token);

      const result = await repository.findByJti('jti-123');

      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { jti: 'jti-123' },
      });
      expect(result).toBe(token);
    });

    it('debe retornar null si el jti no existe', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      const result = await repository.findByJti('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('revoke', () => {
    it('debe revocar el token y registrar quién lo reemplazó', async () => {
      prisma.refreshToken.update.mockResolvedValue({});

      await repository.revoke('old-jti', 'new-jti');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { jti: 'old-jti' },
        data: {
          revokedAt: expect.any(Date),
          replacedBy: 'new-jti',
        },
      });
    });
  });

  describe('revokeAllByUser', () => {
    it('debe revocar todos los refresh tokens activos del usuario', async () => {
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 3 });

      await repository.revokeAllByUser('user-1');

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
    });
  });

  describe('revokeBySession', () => {
    it('debe revocar tokens activos de una sesión', async () => {
      await repository.revokeBySession('session-1');

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          sessionId: 'session-1',
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
    });

    it('debe usar cliente transaccional para revokeBySession', async () => {
      const tx = {
        refreshToken: {
          updateMany: jest.fn(),
        },
      };

      await repository.revokeBySession(
        'session-2',
        tx as any,
      );

      expect(tx.refreshToken.updateMany).toHaveBeenCalled();
    });
  });

  describe('revokeByFamily', () => {
    it('debe revocar todos los tokens activos de una familia', async () => {
      await repository.revokeByFamily('family-1');

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          familyId: 'family-1',
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
    });
  });
});