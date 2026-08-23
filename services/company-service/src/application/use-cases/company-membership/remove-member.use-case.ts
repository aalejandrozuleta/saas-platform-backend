import { Inject } from '@nestjs/common';
import { type CompanyMembershipRepository } from '@domain/repositories/company-membership.repository';
import { COMPANY_MEMBERSHIP_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: eliminar (dar de baja) un miembro de la empresa.
 *
 * @remarks
 * Cubre tres flujos con la misma operación:
 * - Un miembro se retira voluntariamente de la empresa ("leave").
 * - OWNER/MANAGER expulsa a un miembro activo.
 * - OWNER/MANAGER cancela una invitación pendiente (`INVITED`) antes de
 *   que se acepte.
 *
 * Un `MANAGER` no puede expulsar a un `OWNER` (mismo espíritu que
 * `ownerRoleRequiresOwner()` en `UpdateMemberUseCase`/`InviteMemberUseCase`:
 * solo un OWNER puede tocar a otro OWNER). La invariante de "al menos un
 * OWNER activo" se protege igual que en `UpdateMemberUseCase`, con el
 * mismo camino transaccional SERIALIZABLE.
 */
export class RemoveMemberUseCase {
  constructor(
    @Inject(COMPANY_MEMBERSHIP_REPOSITORY)
    private readonly companyMembershipRepository: CompanyMembershipRepository,
  ) {}

  async execute(requesterUserId: string, companyId: string, membershipId: string): Promise<void> {
    const requesterMembership = await this.companyMembershipRepository.findByCompanyAndUser(
      companyId,
      requesterUserId,
    );

    if (!requesterMembership) {
      throw DomainErrorFactory.companyNotFound();
    }

    const target = await this.companyMembershipRepository.findById(membershipId);

    if (!target || target.companyId !== companyId) {
      throw DomainErrorFactory.membershipNotFound();
    }

    const isSelfRemoval = target.userId === requesterUserId;

    if (!isSelfRemoval) {
      if (!requesterMembership.canManageMembers()) {
        throw DomainErrorFactory.notCompanyOwner();
      }

      if (target.isOwner() && !requesterMembership.isOwner()) {
        throw DomainErrorFactory.cannotRemoveOwner();
      }
    }

    const wasActiveOwner = target.isOwner() && target.isActive();

    if (wasActiveOwner) {
      /** Mismo camino transaccional que `UpdateMemberUseCase` para evitar el TOCTOU del último OWNER. */
      await this.companyMembershipRepository.deleteAndCountActiveOwners(companyId, membershipId);

      return;
    }

    await this.companyMembershipRepository.delete(membershipId);
  }
}
