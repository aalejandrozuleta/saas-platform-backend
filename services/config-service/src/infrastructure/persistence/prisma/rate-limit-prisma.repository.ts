import { Injectable } from '@nestjs/common';
import { RateLimit } from '@domain/entities/rate-limit/rate-limit.entity';
import type { RateLimitRepository } from '@domain/repositories/rate-limit.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class RateLimitPrismaRepository implements RateLimitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEndpointAndTenant(endpoint: string, tenantId?: string | null): Promise<RateLimit | null> {
    const row = await this.prisma.rateLimitConfig.findFirst({
      where: { endpoint, tenantId: tenantId ?? null },
    });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: string): Promise<RateLimit | null> {
    const row = await this.prisma.rateLimitConfig.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(tenantId?: string | null): Promise<RateLimit[]> {
    const rows = await this.prisma.rateLimitConfig.findMany({
      where: { tenantId: tenantId !== undefined ? tenantId : undefined },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async save(rl: RateLimit): Promise<RateLimit> {
    const snap = rl.toSnapshot();
    const row = await this.prisma.rateLimitConfig.upsert({
      where: { id: snap.id },
      create: {
        id: snap.id,
        endpoint: snap.endpoint,
        maxRequests: snap.maxRequests,
        windowSeconds: snap.windowSeconds,
        tenantId: snap.tenantId,
        isActive: snap.isActive,
        createdAt: snap.createdAt,
        updatedAt: snap.updatedAt,
      },
      update: {
        maxRequests: snap.maxRequests,
        windowSeconds: snap.windowSeconds,
        isActive: snap.isActive,
        updatedAt: snap.updatedAt,
      },
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.rateLimitConfig.delete({ where: { id } });
  }

  private toDomain(row: any): RateLimit {
    return new RateLimit({
      id: row.id,
      endpoint: row.endpoint,
      maxRequests: row.maxRequests,
      windowSeconds: row.windowSeconds,
      tenantId: row.tenantId,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
