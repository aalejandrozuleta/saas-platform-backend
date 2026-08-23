import { Inject } from '@nestjs/common';
import { type Company } from '@domain/entities/company/company.entity';
import { type CompanyRepository } from '@domain/repositories/company.repository';
import { type CompanyMembershipRepository } from '@domain/repositories/company-membership.repository';
import {
  COMPANY_REPOSITORY,
  COMPANY_MEMBERSHIP_REPOSITORY,
} from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: actualizar el perfil de una empresa.
 *
 * @remarks
 * Solo quien puede gestionar miembros (`OWNER`/`MANAGER`, mismo check que
 * `InviteMemberUseCase` y `UploadCompanyLogoUseCase`) puede editar el
 * perfil del tenant.
 */
export class UpdateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @Inject(COMPANY_MEMBERSHIP_REPOSITORY)
    private readonly companyMembershipRepository: CompanyMembershipRepository,
  ) {}

  async execute(
    requesterUserId: string,
    companyId: string,
    patch: {
      name?: string;
      taxId?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      country?: string;
    },
  ): Promise<Company> {
    const requesterMembership = await this.companyMembershipRepository.findByCompanyAndUser(
      companyId,
      requesterUserId,
    );

    if (!requesterMembership?.canManageMembers()) {
      throw DomainErrorFactory.notCompanyOwner();
    }

    const existing = await this.companyRepository.findById(companyId);

    if (!existing) {
      throw DomainErrorFactory.companyNotFound();
    }

    const updated = existing.updateProfile(patch);

    await this.companyRepository.update(updated);

    return updated;
  }
}
