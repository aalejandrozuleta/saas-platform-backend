import { Injectable, Inject } from '@nestjs/common';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { TotpEncryptionPort } from '@application/ports/totp-encryption.port';
import { TOTP_ENCRYPTION } from '@domain/token/services.tokens';

import type { PrismaClient } from '../../../generated/prisma';

import { PrismaService } from './prisma.service';

/**
 * Repositorio Prisma para seguridad.
 */
@Injectable()
export class SecurityPrismaRepository implements SecurityRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(TOTP_ENCRYPTION)
    private readonly totpEncryption: TotpEncryptionPort,
  ) { }

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
          lockoutCount: { increment: 1 },
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

  async updateLastPasswordChange(
    userId: string,
    now: Date,
  ): Promise<void> {
    await this.prisma.userSecurity.upsert({
      where: { userId },
      update: { lastPasswordChange: now },
      create: {
        userId,
        lastPasswordChange: now,
      },
    });
  }

  async saveTotpPendingSecret(userId: string, secret: string): Promise<void> {
    const encrypted = this.totpEncryption.encrypt(secret);
    await this.prisma.userSecurity.upsert({
      where: { userId },
      update: { totpPendingSecret: encrypted },
      create: { userId, totpPendingSecret: encrypted },
    });
  }

  async activateTwoFactor(userId: string): Promise<void> {
    const security = await this.prisma.userSecurity.findUnique({
      where: { userId },
      select: { totpPendingSecret: true },
    });

    await this.prisma.userSecurity.update({
      where: { userId },
      data: {
        twoFactorEnabled: true,
        twoFactorMethod: 'TOTP',
        totpSecret: security?.totpPendingSecret ?? null,
        totpPendingSecret: null,
      },
    });
  }

  async disableTwoFactor(userId: string): Promise<void> {
    await this.prisma.userSecurity.update({
      where: { userId },
      data: {
        twoFactorEnabled: false,
        twoFactorMethod: null,
        totpSecret: null,
        totpPendingSecret: null,
      },
    });
  }

  async getTotpSecret(userId: string): Promise<string | null> {
    const record = await this.prisma.userSecurity.findUnique({
      where: { userId },
      select: { totpSecret: true },
    });
    if (!record?.totpSecret) return null;
    return this.totpEncryption.decrypt(record.totpSecret);
  }

  async getTotpPendingSecret(userId: string): Promise<string | null> {
    const record = await this.prisma.userSecurity.findUnique({
      where: { userId },
      select: { totpPendingSecret: true },
    });
    if (!record?.totpPendingSecret) return null;
    return this.totpEncryption.decrypt(record.totpPendingSecret);
  }

  async getTrustedCountries(userId: string): Promise<string[]> {
    const record = await this.prisma.userSecurity.findUnique({
      where: { userId },
      select: { trustedCountries: true },
    });
    return record?.trustedCountries ?? [];
  }

  async addTrustedCountry(userId: string, country: string): Promise<void> {
    await this.prisma.userSecurity.upsert({
      where: { userId },
      update: { trustedCountries: { push: country } },
      create: { userId, trustedCountries: [country] },
    });
  }

  async removeTrustedCountry(userId: string, country: string): Promise<void> {
    const current = await this.getTrustedCountries(userId);
    const updated = current.filter(c => c !== country);
    await this.prisma.userSecurity.update({
      where: { userId },
      data: { trustedCountries: updated },
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
