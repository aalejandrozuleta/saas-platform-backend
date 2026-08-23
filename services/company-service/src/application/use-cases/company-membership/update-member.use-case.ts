import { Inject } from '@nestjs/common';
import { type CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';
import { type CompanyMembershipRepository } from '@domain/repositories/company-membership.repository';
import { COMPANY_MEMBERSHIP_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: cambiar el rol y/o el estado de un miembro de la empresa.
 *
 * @remarks
 * Solo `OWNER`/`MANAGER` activos pueden hacerlo, y solo un `OWNER` puede
 * otorgar el rol `OWNER` a otro miembro (un `MANAGER` no puede
 * auto-ascenderse ni ascender a un tercero). Además se protege una
 * invariante del tenant: la empresa nunca puede quedarse sin ningún
 * `OWNER` activo (ni degradando su rol ni suspendiéndolo).
 */
export class UpdateMemberUseCase {
  constructor(
    @Inject(COMPANY_MEMBERSHIP_REPOSITORY)
    private readonly companyMembershipRepository: CompanyMembershipRepository,
  ) {}

  async execute(
    requesterUserId: string,
    companyId: string,
    membershipId: string,
    input: { role?: MembershipRole; status?: MembershipStatus },
  ): Promise<CompanyMembership> {
    const requesterMembership = await this.companyMembershipRepository.findByCompanyAndUser(
      companyId,
      requesterUserId,
    );

    if (!requesterMembership?.canManageMembers()) {
      throw DomainErrorFactory.notCompanyOwner();
    }

    if (input.role === MembershipRole.OWNER && !requesterMembership.isOwner()) {
      throw DomainErrorFactory.ownerRoleRequiresOwner();
    }

    const target = await this.companyMembershipRepository.findById(membershipId);

    if (!target || target.companyId !== companyId) {
      throw DomainErrorFactory.membershipNotFound();
    }

    let updated = target;

    if (input.role !== undefined) {
      updated = updated.changeRole(input.role);
    }

    if (input.status !== undefined) {
      updated = updated.changeStatus(input.status);
    }

    if (this.leavesOwnerCondition(target, updated)) {
      /**
       * Camino transaccional: escribe y recuenta los OWNER activos
       * restantes en la misma transacción SERIALIZABLE, para que dos
       * degradaciones concurrentes al último y penúltimo OWNER activo no
       * puedan colarse ambas (ver `updateAndCountActiveOwners`).
       */
      const { updated: persisted } =
        await this.companyMembershipRepository.updateAndCountActiveOwners(companyId, updated);

      return persisted;
    }

    await this.companyMembershipRepository.update(updated);

    return updated;
  }

  /**
   * `true` si el miembro objetivo era OWNER activo antes del cambio y deja
   * de serlo después (degradación de rol o pérdida del estado ACTIVE).
   */
  private leavesOwnerCondition(target: CompanyMembership, updated: CompanyMembership): boolean {
    const wasActiveOwner = target.isOwner() && target.isActive();
    const staysActiveOwner = updated.isOwner() && updated.isActive();

    return wasActiveOwner && !staysActiveOwner;
  }
}
