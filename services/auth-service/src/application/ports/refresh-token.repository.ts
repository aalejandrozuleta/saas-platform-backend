import { Prisma } from '@prisma/client';

export interface RefreshTokenRepository {
  create(
    params: {
      userId: string;
      sessionId: string;
      tokenHash: string;
      expiresAt: Date;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<void>;

  revokeBySession(
    sessionId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;
}
