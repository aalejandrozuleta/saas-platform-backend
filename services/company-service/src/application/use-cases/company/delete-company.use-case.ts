import { Inject } from '@nestjs/common';
import { type CompanyRepository } from '@domain/repositories/company.repository';
import { type CompanyMembershipRepository } from '@domain/repositories/company-membership.repository';
import {
  COMPANY_REPOSITORY,
  COMPANY_MEMBERSHIP_REPOSITORY,
} from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: eliminar una empresa (tenant) completa.
 *
 * @remarks
 * Operación irreversible: a diferencia de editar el perfil o gestionar
 * miembros (donde `canManageMembers()` — OWNER o MANAGER — basta), borrar
 * la empresa entera exige ser OWNER. La base de datos se encarga de la
 * cascada (`onDelete: Cascade` en `CompanyMembership.company`), así que
 * todas las membresías desaparecen junto con el tenant.
 */
export class DeleteCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @Inject(COMPANY_MEMBERSHIP_REPOSITORY)
    private readonly companyMembershipRepository: CompanyMembershipRepository,
  ) {}

  async execute(requesterUserId: string, companyId: string): Promise<void> {
    const requesterMembership = await this.companyMembershipRepository.findByCompanyAndUser(
      companyId,
      requesterUserId,
    );

    if (!requesterMembership?.isActive() || !requesterMembership.isOwner()) {
      throw DomainErrorFactory.companyDeletionRequiresOwner();
    }

    const existing = await this.companyRepository.findById(companyId);

    if (!existing) {
      throw DomainErrorFactory.companyNotFound();
    }

    await this.companyRepository.delete(companyId);
  }
}
