import { Prisma } from '@prisma/client';

export interface SessionRepository {
  create(
    params: {
      userId: string;
      deviceId: string;
      ipAddress: string;
      country?: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<{
    id: string;
  }>;
}
