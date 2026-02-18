import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { UserBlockedError } from '@domain/errors/user-blocked.error';

/**
 * Repositorio Prisma para seguridad.
 */
@Injectable()
export class SecurityPrismaRepository implements SecurityRepository {

  constructor(private readonly prisma: Prisma.TransactionClient | any) { }

  private client(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  async registerFailedAttempt(
    userId: string,
    maxAttempts: number,
    lockDurationMinutes: number,
    now: Date,
    tx?: Prisma.TransactionClient,
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
      throw new UserBlockedError();
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
          status: 'BLOCKED',
        },
      });
    }
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

  async findByUserId(
    userId: string,
    tx?: Prisma.TransactionClient,
  ) {

    return this.client(tx).userSecurity.findUnique({
      where: { userId },
      select: { trustedCountries: true },
    });
  }
}
