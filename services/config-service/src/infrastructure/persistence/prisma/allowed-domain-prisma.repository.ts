import { Injectable } from '@nestjs/common';
import type { AllowedDomainRecord, AllowedDomainRepository } from '@domain/repositories/allowed-domain.repository';
import { PrismaService } from './prisma.service';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AllowedDomainPrismaRepository implements AllowedDomainRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByDomainAndTenant(domain: string, tenantId?: string | null): Promise<AllowedDomainRecord | null> {
    const row = await this.prisma.allowedDomain.findFirst({
      where: { domain, tenantId: tenantId ?? null },
    });
    return row ? this.toDomain(row) : null;
  }

  async findAll(tenantId?: string | null): Promise<AllowedDomainRecord[]> {
    const rows = await this.prisma.allowedDomain.findMany({
      where: { tenantId: tenantId !== undefined ? tenantId : undefined },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async save(record: Omit<AllowedDomainRecord, 'id' | 'createdAt'>): Promise<AllowedDomainRecord> {
    const row = await this.prisma.allowedDomain.create({
      data: { id: randomUUID(), domain: record.domain, tenantId: record.tenantId },
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.allowedDomain.delete({ where: { id } });
  }

  private toDomain(row: any): AllowedDomainRecord {
    return { id: row.id, domain: row.domain, tenantId: row.tenantId, createdAt: row.createdAt };
  }
}
