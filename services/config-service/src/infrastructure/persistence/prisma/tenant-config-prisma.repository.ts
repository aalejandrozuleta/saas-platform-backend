import { Injectable } from '@nestjs/common';
import { TenantConfig } from '@domain/entities/tenant-config/tenant-config.entity';
import { PlanType } from '@domain/enums/plan-type.enum';
import type { TenantConfigRepository } from '@domain/repositories/tenant-config.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class TenantConfigPrismaRepository implements TenantConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenantId(tenantId: string): Promise<TenantConfig | null> {
    const row = await this.prisma.tenantConfig.findUnique({ where: { tenantId } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<TenantConfig[]> {
    const rows = await this.prisma.tenantConfig.findMany();
    return rows.map((r) => this.toDomain(r));
  }

  async save(config: TenantConfig): Promise<TenantConfig> {
    const snap = config.toSnapshot();
    const row = await this.prisma.tenantConfig.upsert({
      where: { tenantId: snap.tenantId },
      create: {
        id: snap.id,
        tenantId: snap.tenantId,
        name: snap.name,
        logoUrl: snap.logoUrl,
        language: snap.language,
        timezone: snap.timezone,
        plan: snap.plan,
        maxUsers: snap.maxUsers,
        maxStorage: snap.maxStorage,
        customData: snap.customData ?? undefined,
        isActive: snap.isActive,
        createdAt: snap.createdAt,
        updatedAt: snap.updatedAt,
      },
      update: {
        name: snap.name,
        logoUrl: snap.logoUrl,
        language: snap.language,
        timezone: snap.timezone,
        plan: snap.plan,
        maxUsers: snap.maxUsers,
        maxStorage: snap.maxStorage,
        customData: snap.customData ?? undefined,
        isActive: snap.isActive,
        updatedAt: snap.updatedAt,
      },
    });
    return this.toDomain(row);
  }

  async delete(tenantId: string): Promise<void> {
    await this.prisma.tenantConfig.delete({ where: { tenantId } });
  }

  private toDomain(row: any): TenantConfig {
    return new TenantConfig({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      logoUrl: row.logoUrl,
      language: row.language,
      timezone: row.timezone,
      plan: row.plan as PlanType,
      maxUsers: row.maxUsers,
      maxStorage: row.maxStorage,
      customData: row.customData as Record<string, unknown> | null,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
