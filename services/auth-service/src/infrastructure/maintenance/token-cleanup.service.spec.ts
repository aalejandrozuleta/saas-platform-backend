import { type PrismaService } from '@infrastructure/persistence/prisma/prisma.service';

import { TokenCleanupService } from './token-cleanup.service';


type PrismaMock = {
  refreshToken: {
    deleteMany: jest.Mock;
  };
  session: {
    deleteMany: jest.Mock;
  };
};

describe('TokenCleanupService', () => {
  let service: TokenCleanupService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = {
      refreshToken: {
        deleteMany: jest.fn(),
      },
      session: {
        deleteMany: jest.fn(),
      },
    };

    service = new TokenCleanupService(prisma as unknown as PrismaService);
  });

  describe('cleanExpiredRefreshTokens', () => {
    it('debería eliminar refresh tokens expirados', async () => {
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 5 });

      await service.cleanExpiredRefreshTokens();

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledTimes(1);

      const args = prisma.refreshToken.deleteMany.mock.calls[0][0];

      expect(args.where.expiresAt.lt).toBeInstanceOf(Date);
    });
  });

  describe('cleanOldSessions', () => {
    it('debería eliminar sesiones revocadas o antiguas', async () => {
      prisma.session.deleteMany.mockResolvedValue({ count: 3 });

      await service.cleanOldSessions();

      expect(prisma.session.deleteMany).toHaveBeenCalledTimes(1);

      const args = prisma.session.deleteMany.mock.calls[0][0];

      expect(args.where.OR).toEqual(
        expect.arrayContaining([
          { revokedAt: { not: null } },
          expect.objectContaining({
            endedAt: {
              lt: expect.any(Date),
            },
          }),
        ]),
      );
    });
  });
});