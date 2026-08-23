import { Injectable } from '@nestjs/common';
import { type Company } from '@domain/entities/company/company.entity';
import { type CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { type CompanyRepository } from '@domain/repositories/company.repository';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

import { Prisma } from '../../../generated/prisma';
import { CompanyMapper } from '../mappers/company.mapper';
import { CompanyMembershipMapper } from '../mappers/company-membership.mapper';

import { PrismaService } from './prisma.service';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

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

  async findByIds(ids: string[]): Promise<Company[]> {
    if (ids.length === 0) {
      return [];
    }

    const companies = await this.prisma.company.findMany({ where: { id: { in: ids } } });

    return companies.map((company) => CompanyMapper.toDomain(company));
  }

  async save(company: Company): Promise<void> {
    await this.runGuardingTaxIdUniqueness(() =>
      this.prisma.company.create({ data: CompanyMapper.toPersistence(company) }),
    );
  }

  async update(company: Company): Promise<void> {
    await this.runGuardingTaxIdUniqueness(() =>
      this.prisma.company.update({
        where: { id: company.id },
        data: CompanyMapper.toPersistence(company),
      }),
    );
  }

  /**
   * Crea empresa + membresía OWNER dentro de una única transacción
   * (forma de array de `$transaction`: dos escrituras independientes que
   * deben confirmarse o revertirse juntas).
   */
  async createWithOwnerMembership(company: Company, membership: CompanyMembership): Promise<void> {
    await this.runGuardingTaxIdUniqueness(() =>
      this.prisma.$transaction([
        this.prisma.company.create({ data: CompanyMapper.toPersistence(company) }),
        this.prisma.companyMembership.create({
          data: CompanyMembershipMapper.toPersistence(membership),
        }),
      ]),
    );
  }

  /**
   * Traduce la violación del índice único `(country, taxId)` a un error de
   * dominio legible en vez de dejar que el `PrismaClientKnownRequestError`
   * crudo llegue al filtro global como un 500 genérico.
   */
  private async runGuardingTaxIdUniqueness<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_VIOLATION &&
        (error.meta?.target as string[] | undefined)?.includes('taxId')
      ) {
        throw DomainErrorFactory.taxIdAlreadyRegistered();
      }

      throw error;
    }
  }
}
