import { Injectable } from '@nestjs/common';
import { type CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { type CompanyMembershipRepository } from '@domain/repositories/company-membership.repository';

import { CompanyMembershipMapper } from '../mappers/company-membership.mapper';

import { PrismaService } from './prisma.service';

/**
 * Implementación Prisma del repositorio de membresías.
 */
@Injectable()
export class CompanyMembershipPrismaRepository implements CompanyMembershipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCompanyAndUser(companyId: string, userId: string): Promise<CompanyMembership | null> {
    const membership = await this.prisma.companyMembership.findUnique({
      where: { companyId_userId: { companyId, userId } },
    });

    return membership ? CompanyMembershipMapper.toDomain(membership) : null;
  }

  async findByCompanyId(companyId: string): Promise<CompanyMembership[]> {
    const memberships = await this.prisma.companyMembership.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((membership) => CompanyMembershipMapper.toDomain(membership));
  }

  async findById(id: string): Promise<CompanyMembership | null> {
    const membership = await this.prisma.companyMembership.findUnique({ where: { id } });

    return membership ? CompanyMembershipMapper.toDomain(membership) : null;
  }

  async save(membership: CompanyMembership): Promise<void> {
    await this.prisma.companyMembership.create({
      data: CompanyMembershipMapper.toPersistence(membership),
    });
  }

  async update(membership: CompanyMembership): Promise<void> {
    await this.prisma.companyMembership.update({
      where: { id: membership.id },
      data: CompanyMembershipMapper.toPersistence(membership),
    });
  }
}
