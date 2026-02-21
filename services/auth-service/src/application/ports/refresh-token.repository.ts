import { Prisma } from "@prisma-client/client";


export interface RefreshTokenRepository {
  create(
    params: {
      userId: string;
      sessionId: string;
      jti: string;
      familyId: string;
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
