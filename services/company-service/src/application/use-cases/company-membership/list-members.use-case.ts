import { Inject } from '@nestjs/common';
import { type CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { type CompanyMembershipRepository } from '@domain/repositories/company-membership.repository';
import { COMPANY_MEMBERSHIP_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: listar los miembros de una empresa.
 *
 * @remarks
 * Cualquier miembro **activo** puede ver la lista (no solo OWNER/MANAGER).
 * Si el solicitante no pertenece a la empresa se responde
 * `COMPANY_NOT_FOUND` para no revelar la existencia del tenant.
 */
export class ListMembersUseCase {
  constructor(
    @Inject(COMPANY_MEMBERSHIP_REPOSITORY)
    private readonly companyMembershipRepository: CompanyMembershipRepository,
  ) {}

  async execute(requesterUserId: string, companyId: string): Promise<CompanyMembership[]> {
    const requesterMembership = await this.companyMembershipRepository.findByCompanyAndUser(
      companyId,
      requesterUserId,
    );

    if (!requesterMembership?.isActive()) {
      throw DomainErrorFactory.companyNotFound();
    }

    return this.companyMembershipRepository.findByCompanyId(companyId);
  }
}
