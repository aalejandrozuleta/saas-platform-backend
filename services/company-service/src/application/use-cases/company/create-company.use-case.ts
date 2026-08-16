import { randomUUID } from 'node:crypto';

import { Inject } from '@nestjs/common';
import { Company } from '@domain/entities/company/company.entity';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';
import { type CompanyRepository } from '@domain/repositories/company.repository';
import { COMPANY_REPOSITORY } from '@domain/token/repositories.tokens';

/**
 * Caso de uso: crear una empresa (tenant).
 *
 * @remarks
 * Cualquier usuario autenticado puede crear una empresa y queda
 * automáticamente como `OWNER` activo de ella. La empresa y su membresía
 * de dueño se persisten atómicamente (ver
 * {@link CompanyRepository.createWithOwnerMembership}) para que nunca
 * exista un tenant sin dueño.
 */
export class CreateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(
    userId: string,
    input: {
      name: string;
      taxId?: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      country?: string;
    },
  ): Promise<Company> {
    const company = Company.create({
      id: randomUUID(),
      name: input.name,
      taxId: input.taxId,
      email: input.email,
      phone: input.phone,
      address: input.address,
      city: input.city,
      country: input.country,
    });

    const ownerMembership = CompanyMembership.create({
      id: randomUUID(),
      companyId: company.id,
      userId,
      role: MembershipRole.OWNER,
      status: MembershipStatus.ACTIVE,
    });

    await this.companyRepository.createWithOwnerMembership(company, ownerMembership);

    return company;
  }
}
