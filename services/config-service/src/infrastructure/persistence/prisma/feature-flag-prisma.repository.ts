import { Injectable } from '@nestjs/common';
import { FeatureFlag } from '@domain/entities/feature-flag/feature-flag.entity';
import type { FeatureFlagRepository, FeatureFlagFilter } from '@domain/repositories/feature-flag.repository';

import type { FeatureFlag as PrismaFeatureFlag } from '../../../generated/prisma';

import { PrismaService } from './prisma.service';

@Injectable()
export class FeatureFlagPrismaRepository implements FeatureFlagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByKey(key: string, environment?: string | null): Promise<FeatureFlag | null> {
    const row = await this.prisma.featureFlag.findFirst({
      where: {
        key,
        environment,
      },
    });
    return row ? this.toDomain(row) : null;
  } 

  async findAll(filter?: FeatureFlagFilter): Promise<FeatureFlag[]> {
    const rows = await this.prisma.featureFlag.findMany({
      where: {
        enabled: filter?.enabled,
        environment: filter?.environment,
      },
      orderBy: { key: 'asc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async save(flag: FeatureFlag): Promise<FeatureFlag> {
    const snap = flag.toSnapshot();
    const row = await this.prisma.featureFlag.upsert({
      where: {
        key_environment: {
          key: snap.key,
          environment: snap.environment ?? '',
        },
      },
      create: {
        id: snap.id,
        key: snap.key,
        enabled: snap.enabled,
        environment: snap.environment,
        description: snap.description,
        createdAt: snap.createdAt,
        updatedAt: snap.updatedAt,
      },
      update: {
        enabled: snap.enabled,
        description: snap.description,
        updatedAt: snap.updatedAt,
      },
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.featureFlag.delete({ where: { id } });
  }

  private toDomain(row: PrismaFeatureFlag): FeatureFlag {
    return new FeatureFlag({
      id: row.id,
      key: row.key,
      enabled: row.enabled,
      environment: row.environment,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
