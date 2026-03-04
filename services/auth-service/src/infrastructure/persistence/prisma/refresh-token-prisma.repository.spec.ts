import { RefreshTokenPrismaRepository } from './refresh-token-prisma.repository';
import { PrismaService } from './prisma.service';

describe('RefreshTokenPrismaRepository', () => {
  let repository: RefreshTokenPrismaRepository;

  let prisma: {
    refreshToken: {
      create: jest.Mock;
      updateMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      refreshToken: {
        create: jest.fn(),
        updateMany: jest.fn(),
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
});