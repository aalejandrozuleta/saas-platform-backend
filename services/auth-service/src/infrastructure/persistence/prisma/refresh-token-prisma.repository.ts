import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { RefreshTokenRepository } from '@application/ports/refresh-token.repository';

import { PrismaService } from './prisma.service';

/**
 * Implementación Prisma del repositorio de refresh tokens.
 */
@Injectable()
export class RefreshTokenPrismaRepository
  implements RefreshTokenRepository
{
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Crea un refresh token asociado a una sesión.
   */
  async create(
    params: {
      userId: string;
      sessionId: string;
      jti: string;
      familyId: string;
      tokenHash: string;
      expiresAt: Date;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = this.getClient(tx);

    await client.refreshToken.create({
      data: {
        userId: params.userId,
        sessionId: params.sessionId,
        jti: params.jti,
        familyId: params.familyId,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
        revokedAt: null,
      },
    });
  }

  /**
   * Revoca todos los refresh tokens asociados a una sesión.
   */
  async revokeBySession(
    sessionId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = this.getClient(tx);

    await client.refreshToken.updateMany({
      where: {
        sessionId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Resuelve el cliente adecuado según exista o no transacción.
   */
  private getClient(
    tx?: Prisma.TransactionClient,
  ): Prisma.TransactionClient | PrismaClient {
    return tx ?? this.prisma;
  }
}
