import { Injectable } from '@nestjs/common';
import { PasswordPolicy } from '@domain/entities/password-policy/password-policy.entity';
import type { PasswordPolicyRepository } from '@domain/repositories/password-policy.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class PasswordPolicyPrismaRepository implements PasswordPolicyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenantId(tenantId: string | null): Promise<PasswordPolicy | null> {
    const row = await this.prisma.passwordPolicy.findFirst({ where: { tenantId } });
    return row ? this.toDomain(row) : null;
  }

  async save(policy: PasswordPolicy): Promise<PasswordPolicy> {
    const snap = policy.toSnapshot();
    const row = await this.prisma.passwordPolicy.upsert({
      where: { id: snap.id },
      create: {
        id: snap.id,
        tenantId: snap.tenantId,
        minLength: snap.minLength,
        requireUppercase: snap.requireUppercase,
        requireLowercase: snap.requireLowercase,
        requireNumbers: snap.requireNumbers,
        requireSymbols: snap.requireSymbols,
        maxAgeDays: snap.maxAgeDays,
        historyCount: snap.historyCount,
        maxConcurrentSessions: snap.maxConcurrentSessions,
        createdAt: snap.createdAt,
        updatedAt: snap.updatedAt,
      },
      update: {
        minLength: snap.minLength,
        requireUppercase: snap.requireUppercase,
        requireLowercase: snap.requireLowercase,
        requireNumbers: snap.requireNumbers,
        requireSymbols: snap.requireSymbols,
        maxAgeDays: snap.maxAgeDays,
        historyCount: snap.historyCount,
        maxConcurrentSessions: snap.maxConcurrentSessions,
        updatedAt: snap.updatedAt,
      },
    });
    return this.toDomain(row);
  }

  private toDomain(row: any): PasswordPolicy {
    return new PasswordPolicy({
      id: row.id,
      tenantId: row.tenantId,
      minLength: row.minLength,
      requireUppercase: row.requireUppercase,
      requireLowercase: row.requireLowercase,
      requireNumbers: row.requireNumbers,
      requireSymbols: row.requireSymbols,
      maxAgeDays: row.maxAgeDays,
      historyCount: row.historyCount,
      maxConcurrentSessions: row.maxConcurrentSessions,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
