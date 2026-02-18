import { Prisma } from '@prisma/client';

export abstract class SecurityRepository {
  abstract incrementFailedLoginAttempts(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;

  abstract resetFailedLoginAttempts(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;

  abstract lockAccount(
    userId: string,
    durationMinutes: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;

  abstract findByUserId(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{
    trustedCountries: string[];
  } | null>;
}
