import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { type MembershipRole } from '@domain/enums/membership-role.enum';
import { type MembershipStatus } from '@domain/enums/membership-status.enum';

import { type CompanyMembership as PrismaCompanyMembership } from '../../../generated/prisma';

/**
 * Mapper entre Prisma CompanyMembership y CompanyMembership de dominio.
 */
export class CompanyMembershipMapper {
  static toDomain(prisma: PrismaCompanyMembership): CompanyMembership {
    return CompanyMembership.fromPersistence({
      id: prisma.id,
      companyId: prisma.companyId,
      userId: prisma.userId,
      role: prisma.role as MembershipRole,
      status: prisma.status as MembershipStatus,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  static toPersistence(membership: CompanyMembership) {
    return {
      id: membership.id,
      companyId: membership.companyId,
      userId: membership.userId,
      role: membership.role,
      status: membership.status,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }
}
