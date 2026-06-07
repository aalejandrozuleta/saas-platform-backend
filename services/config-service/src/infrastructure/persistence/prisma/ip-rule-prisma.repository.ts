import { Injectable } from '@nestjs/common';
import { IpRule } from '@domain/entities/ip-rule/ip-rule.entity';
import { IpRuleType } from '@domain/enums/ip-rule-type.enum';
import type { IpRuleRepository } from '@domain/repositories/ip-rule.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class IpRulePrismaRepository implements IpRuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIpAndTenant(ip: string, tenantId?: string | null): Promise<IpRule | null> {
    const row = await this.prisma.ipRule.findFirst({ where: { ip, tenantId: tenantId ?? null } });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: string): Promise<IpRule | null> {
    const row = await this.prisma.ipRule.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(type?: IpRuleType, tenantId?: string | null): Promise<IpRule[]> {
    const rows = await this.prisma.ipRule.findMany({
      where: {
        type: type ?? undefined,
        tenantId: tenantId !== undefined ? tenantId : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async save(rule: IpRule): Promise<IpRule> {
    const snap = rule.toSnapshot();
    const row = await this.prisma.ipRule.upsert({
      where: { id: snap.id },
      create: {
        id: snap.id,
        ip: snap.ip,
        cidr: snap.cidr,
        type: snap.type,
        tenantId: snap.tenantId,
        reason: snap.reason,
        expiresAt: snap.expiresAt,
        createdBy: snap.createdBy,
        createdAt: snap.createdAt,
        updatedAt: snap.updatedAt,
      },
      update: { reason: snap.reason, expiresAt: snap.expiresAt, updatedAt: snap.updatedAt },
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.ipRule.delete({ where: { id } });
  }

  private toDomain(row: any): IpRule {
    return new IpRule({
      id: row.id,
      ip: row.ip,
      cidr: row.cidr,
      type: row.type as IpRuleType,
      tenantId: row.tenantId,
      reason: row.reason,
      expiresAt: row.expiresAt,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
