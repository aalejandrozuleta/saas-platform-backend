import { type Prisma } from "@prisma/client";


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

  findByJti(
    jti: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{
    id: string;
    userId: string;
    sessionId: string;
    familyId: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
  } | null>;

  revoke(
    jti: string,
    replacedBy: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;
}
