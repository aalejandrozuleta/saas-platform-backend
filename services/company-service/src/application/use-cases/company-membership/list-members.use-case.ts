import { Inject } from '@nestjs/common';
import {
  type CompanyMembershipRepository,
  type MembershipListFilters,
  type PagedMemberships,
} from '@domain/repositories/company-membership.repository';
import { COMPANY_MEMBERSHIP_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: listar los miembros de una empresa (paginado, con filtros
 * opcionales por rol/estado).
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

  async execute(
    requesterUserId: string,
    companyId: string,
    pagination: { page: number; limit: number },
    filters?: MembershipListFilters,
  ): Promise<PagedMemberships> {
    const requesterMembership = await this.companyMembershipRepository.findByCompanyAndUser(
      companyId,
      requesterUserId,
    );

    if (!requesterMembership?.isActive()) {
      throw DomainErrorFactory.companyNotFound();
    }

    return this.companyMembershipRepository.findByCompanyIdPaged(
      companyId,
      {
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      },
      filters,
    );
  }
}
