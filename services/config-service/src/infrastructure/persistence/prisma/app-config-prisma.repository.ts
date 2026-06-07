import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/index.js';
import { AppConfig } from '@domain/entities/app-config/app-config.entity';
import { ConfigCategory } from '@domain/enums/config-category.enum';
import type { AppConfigRepository } from '@domain/repositories/app-config.repository';
import { PrismaService } from './prisma.service';

type AppConfigRow = {
  id: string;
  key: string;
  value: string;
  description: string | null;
  category: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Implementación Prisma del repositorio de configuraciones globales.
 */
@Injectable()
export class AppConfigPrismaRepository implements AppConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByKey(key: string): Promise<AppConfig | null> {
    const row = await this.prisma.appConfig.findUnique({ where: { key } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(category?: ConfigCategory): Promise<AppConfig[]> {
    const where: Prisma.AppConfigWhereInput = category ? { category } : {};
    const rows = await this.prisma.appConfig.findMany({ where });
    return rows.map((r) => this.toDomain(r));
  }

  async save(config: AppConfig): Promise<AppConfig> {
    const snap = config.toSnapshot();
    const row = await this.prisma.appConfig.upsert({
      where: { key: snap.key },
      update: {
        value: snap.value,
        description: snap.description,
        updatedBy: snap.updatedBy,
        updatedAt: snap.updatedAt,
      },
      create: {
        id: snap.id,
        key: snap.key,
        value: snap.value,
        description: snap.description,
        category: snap.category as Prisma.EnumConfigCategoryFilter,
        updatedBy: snap.updatedBy,
        createdAt: snap.createdAt,
        updatedAt: snap.updatedAt,
      },
    });
    return this.toDomain(row);
  }

  async delete(key: string): Promise<void> {
    await this.prisma.appConfig.deleteMany({ where: { key } });
  }

  private toDomain(row: AppConfigRow): AppConfig {
    return new AppConfig({
      id: row.id,
      key: row.key,
      value: row.value,
      description: row.description,
      category: row.category as ConfigCategory,
      updatedBy: row.updatedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
