import { Injectable } from '@nestjs/common';
import { type CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';
import {
  type CompanyMembershipRepository,
  type PagedMemberships,
} from '@domain/repositories/company-membership.repository';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

import { Prisma } from '../../../generated/prisma';
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

  async findByCompanyIdPaged(
    companyId: string,
    pagination: { skip: number; take: number },
  ): Promise<PagedMemberships> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.companyMembership.findMany({
        where: { companyId },
        orderBy: { createdAt: 'asc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.companyMembership.count({ where: { companyId } }),
    ]);

    return {
      items: rows.map((membership) => CompanyMembershipMapper.toDomain(membership)),
      total,
    };
  }

  async findById(id: string): Promise<CompanyMembership | null> {
    const membership = await this.prisma.companyMembership.findUnique({ where: { id } });

    return membership ? CompanyMembershipMapper.toDomain(membership) : null;
  }

  async findByUserId(userId: string): Promise<CompanyMembership[]> {
    const memberships = await this.prisma.companyMembership.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((membership) => CompanyMembershipMapper.toDomain(membership));
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

  async delete(id: string): Promise<void> {
    await this.prisma.companyMembership.delete({ where: { id } });
  }

  async updateAndCountActiveOwners(
    companyId: string,
    membership: CompanyMembership,
  ): Promise<{ updated: CompanyMembership; activeOwners: number }> {
    return this.prisma.$transaction(
      async (tx) => {
        const updatedRow = await tx.companyMembership.update({
          where: { id: membership.id },
          data: CompanyMembershipMapper.toPersistence(membership),
        });

        const activeOwners = await tx.companyMembership.count({
          where: { companyId, role: MembershipRole.OWNER, status: MembershipStatus.ACTIVE },
        });

        if (activeOwners < 1) {
          throw DomainErrorFactory.lastOwnerCannotBeDemoted();
        }

        return { updated: CompanyMembershipMapper.toDomain(updatedRow), activeOwners };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async deleteAndCountActiveOwners(
    companyId: string,
    membershipId: string,
  ): Promise<{ activeOwners: number }> {
    return this.prisma.$transaction(
      async (tx) => {
        await tx.companyMembership.delete({ where: { id: membershipId } });

        const activeOwners = await tx.companyMembership.count({
          where: { companyId, role: MembershipRole.OWNER, status: MembershipStatus.ACTIVE },
        });

        if (activeOwners < 1) {
          throw DomainErrorFactory.lastOwnerCannotBeDemoted();
        }

        return { activeOwners };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
