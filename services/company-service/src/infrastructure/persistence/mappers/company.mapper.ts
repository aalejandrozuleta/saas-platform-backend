import { Company } from '@domain/entities/company/company.entity';
import { type CompanyPlan } from '@domain/enums/company-plan.enum';

import { type Company as PrismaCompany } from '../../../generated/prisma';

/**
 * Mapper entre Prisma Company y Company de dominio.
 */
export class CompanyMapper {
  static toDomain(prisma: PrismaCompany): Company {
    return Company.fromPersistence({
      id: prisma.id,
      name: prisma.name,
      taxId: prisma.taxId ?? undefined,
      plan: prisma.plan as CompanyPlan,
      subscriptionStatus: prisma.subscriptionStatus,
      stripeCustomerId: prisma.stripeCustomerId ?? undefined,
      stripeSubscriptionId: prisma.stripeSubscriptionId ?? undefined,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  static toPersistence(company: Company) {
    return {
      id: company.id,
      name: company.name,
      taxId: company.taxId ?? null,
      plan: company.plan,
      subscriptionStatus: company.subscriptionStatus,
      stripeCustomerId: company.stripeCustomerId ?? null,
      stripeSubscriptionId: company.stripeSubscriptionId ?? null,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}
