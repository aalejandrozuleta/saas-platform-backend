import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SecurityRepository } from '@domain/repositories/security.repository';

import { PrismaService } from './prisma.service';

@Injectable()
export class SecurityPrismaRepository implements SecurityRepository {
  constructor(private readonly prisma: PrismaService) {}

  private client(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  async incrementFailedLoginAttempts(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.client(tx).user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: { increment: 1 },
      },
    });
  }

  async resetFailedLoginAttempts(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    await this.client(tx).user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        blockedUntil: null,
        status: 'ACTIVE',
      },
    });
  }

  async lockAccount(
    userId: string,
    durationMinutes: number,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const blockedUntil = new Date(
      Date.now() + durationMinutes * 60 * 1000,
    );

    await this.client(tx).user.update({
      where: { id: userId },
      data: {
        blockedUntil,
        status: 'BLOCKED',
      },
    });
  }

  async findByUserId(
    userId: string,
    tx?: Prisma.TransactionClient,
  ) {
    return this.client(tx).userSecurity.findUnique({
      where: { userId },
      select: {
        trustedCountries: true,
      },
    });
  }
}
