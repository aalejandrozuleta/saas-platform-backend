import { Injectable } from '@nestjs/common';
import { type Company } from '@domain/entities/company/company.entity';
import { type CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { type CompanyRepository } from '@domain/repositories/company.repository';

import { CompanyMapper } from '../mappers/company.mapper';
import { CompanyMembershipMapper } from '../mappers/company-membership.mapper';

import { PrismaService } from './prisma.service';

/**
 * Implementación Prisma del repositorio de empresas.
 */
@Injectable()
export class CompanyPrismaRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({ where: { id } });

    return company ? CompanyMapper.toDomain(company) : null;
  }

  async save(company: Company): Promise<void> {
    await this.prisma.company.create({ data: CompanyMapper.toPersistence(company) });
  }

  /**
   * Crea empresa + membresía OWNER dentro de una única transacción
   * (forma de array de `$transaction`: dos escrituras independientes que
   * deben confirmarse o revertirse juntas).
   */
  async createWithOwnerMembership(company: Company, membership: CompanyMembership): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.company.create({ data: CompanyMapper.toPersistence(company) }),
      this.prisma.companyMembership.create({
        data: CompanyMembershipMapper.toPersistence(membership),
      }),
    ]);
  }
}
