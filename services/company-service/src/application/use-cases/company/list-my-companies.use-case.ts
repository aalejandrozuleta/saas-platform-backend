import { Inject } from '@nestjs/common';
import { type Company } from '@domain/entities/company/company.entity';
import { type MembershipRole } from '@domain/enums/membership-role.enum';
import { type MembershipStatus } from '@domain/enums/membership-status.enum';
import { type CompanyRepository } from '@domain/repositories/company.repository';
import { type CompanyMembershipRepository } from '@domain/repositories/company-membership.repository';
import {
  COMPANY_REPOSITORY,
  COMPANY_MEMBERSHIP_REPOSITORY,
} from '@domain/token/repositories.tokens';

/** Una fila de "mis empresas": la empresa junto con el rol/estado de esa membresía. */
export interface MyCompanyMembership {
  company: Company;
  membershipId: string;
  role: MembershipRole;
  status: MembershipStatus;
}

/**
 * Caso de uso: listar las empresas a las que pertenece el usuario
 * autenticado, con el rol y estado (incluye `INVITED` y `SUSPENDED`, no
 * solo `ACTIVE`, para que el usuario pueda ver y actuar sobre invitaciones
 * pendientes).
 */
export class ListMyCompaniesUseCase {
  constructor(
    @Inject(COMPANY_MEMBERSHIP_REPOSITORY)
    private readonly companyMembershipRepository: CompanyMembershipRepository,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(userId: string): Promise<MyCompanyMembership[]> {
    const memberships = await this.companyMembershipRepository.findByUserId(userId);

    if (memberships.length === 0) {
      return [];
    }

    const companies = await this.companyRepository.findByIds(
      memberships.map((membership) => membership.companyId),
    );
    const companyById = new Map(companies.map((company) => [company.id, company]));

    return memberships
      .map((membership) => {
        const company = companyById.get(membership.companyId);

        return company
          ? {
              company,
              membershipId: membership.id,
              role: membership.role,
              status: membership.status,
            }
          : null;
      })
      .filter((row): row is MyCompanyMembership => row !== null);
  }
}
