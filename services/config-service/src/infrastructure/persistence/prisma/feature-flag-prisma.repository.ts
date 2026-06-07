import { Injectable } from '@nestjs/common';
import { FeatureFlag } from '@domain/entities/feature-flag/feature-flag.entity';
import type { FeatureFlagRepository, FeatureFlagFilter } from '@domain/repositories/feature-flag.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class FeatureFlagPrismaRepository implements FeatureFlagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByKey(key: string, filter?: FeatureFlagFilter): Promise<FeatureFlag | null> {
    const row = await this.prisma.featureFlag.findFirst({
      where: {
        key,
        tenantId: filter?.tenantId !== undefined ? filter.tenantId : undefined,
        role: filter?.role !== undefined ? filter.role : undefined,
        environment: filter?.environment !== undefined ? filter.environment : undefined,
      },
    });
    return row ? this.toDomain(row) : null;
  }

  async findAll(filter?: FeatureFlagFilter): Promise<FeatureFlag[]> {
    const rows = await this.prisma.featureFlag.findMany({
      where: {
        tenantId: filter?.tenantId !== undefined ? filter.tenantId : undefined,
        enabled: filter?.enabled !== undefined ? filter.enabled : undefined,
      },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async save(flag: FeatureFlag): Promise<FeatureFlag> {
    const snap = flag.toSnapshot();
    const row = await this.prisma.featureFlag.upsert({
      where: { id: snap.id },
      create: {
        id: snap.id,
        key: snap.key,
        enabled: snap.enabled,
        tenantId: snap.tenantId,
        role: snap.role,
        environment: snap.environment,
        description: snap.description,
        metadata: snap.metadata ?? undefined,
        createdAt: snap.createdAt,
        updatedAt: snap.updatedAt,
      },
      update: {
        enabled: snap.enabled,
        description: snap.description,
        metadata: snap.metadata ?? undefined,
        updatedAt: snap.updatedAt,
      },
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.featureFlag.delete({ where: { id } });
  }

  private toDomain(row: any): FeatureFlag {
    return new FeatureFlag({
      id: row.id,
      key: row.key,
      enabled: row.enabled,
      tenantId: row.tenantId,
      role: row.role,
      environment: row.environment,
      description: row.description,
      metadata: row.metadata as Record<string, unknown> | null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
