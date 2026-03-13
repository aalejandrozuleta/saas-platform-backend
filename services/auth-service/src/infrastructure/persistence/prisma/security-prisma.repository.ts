import { Injectable } from '@nestjs/common';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import type { PrismaClient } from '@prisma/client';

import { PrismaService } from './prisma.service';

/**
 * Repositorio Prisma para seguridad.
 */
@Injectable()
export class SecurityPrismaRepository implements SecurityRepository {
  constructor(private readonly prisma: PrismaService) { }

  private client(tx?: PrismaClient) {
    return tx ?? this.prisma;
  }

  async registerFailedAttempt(
    userId: string,
    maxAttempts: number,
    lockDurationMinutes: number,
    now: Date,
    tx?: PrismaClient,
  ): Promise<void> {

    const client = this.client(tx);

    // Incremento protegido por condición
    const updated = await client.user.updateMany({
      where: {
        id: userId,
        OR: [
          { blockedUntil: null },
          { blockedUntil: { lt: now } }
        ],
        failedLoginAttempts: {
          lt: maxAttempts,
        },
      },
      data: {
        failedLoginAttempts: { increment: 1 },
      },
    });


    // Si no se actualizó nada, ya superó el límite
    if (updated.count === 0) {
      throw DomainErrorFactory.userBlocked();
    }

    // Obtener valor actualizado
    const user = await client.user.findUnique({
      where: { id: userId },
      select: { failedLoginAttempts: true },
    });

    if (user && user.failedLoginAttempts >= maxAttempts) {
      await client.user.update({
        where: { id: userId },
        data: {
          blockedUntil: new Date(
            now.getTime() + lockDurationMinutes * 60_000,
          ),
        },
      });
    }
  }


  async resetFailedLoginAttempts(
    userId: string,
    tx?: PrismaClient
  ): Promise<void> {

    await this.client(tx).user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        blockedUntil: null,
      },
    });
  }

  async releaseTemporaryBlock(
    userId: string,
    tx?: PrismaClient
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

  async findByUserId(
    userId: string,
    tx?: PrismaClient
  ) {
    const record = await this.client(tx).user.findUnique({
      where: { id: userId },
      select: {
        security: {
          select: {
            trustedCountries: true,
            twoFactorEnabled: true,
            twoFactorMethod: true,
          },
        },
        recoveryCodes: {
          take: 1,
          select: { id: true },
        },
      },
    });

    if (!record) {
      return null;
    }

    return {
      trustedCountries: record.security?.trustedCountries ?? [],
      twoFactorEnabled: record.security?.twoFactorEnabled ?? false,
      twoFactorMethod: record.security?.twoFactorMethod ?? undefined,
      hasRecoveryCodes: record.recoveryCodes.length > 0,
    };
  }
}
