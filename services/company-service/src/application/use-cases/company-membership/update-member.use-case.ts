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
 * Solo `OWNER`/`MANAGER` activos pueden hacerlo. Además se protege una
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

    const target = await this.companyMembershipRepository.findById(membershipId);

    if (!target || target.companyId !== companyId) {
      throw DomainErrorFactory.membershipNotFound();
    }

    if (this.wouldRemoveLastOwner(target, input)) {
      await this.assertNotLastOwner(companyId);
    }

    let updated = target;

    if (input.role !== undefined) {
      updated = updated.changeRole(input.role);
    }

    if (input.status !== undefined) {
      updated = updated.changeStatus(input.status);
    }

    await this.companyMembershipRepository.update(updated);

    return updated;
  }

  /**
   * `true` si el cambio solicitado le quitaría la condición de OWNER activo
   * al miembro objetivo (degradación de rol o pérdida del estado ACTIVE).
   */
  private wouldRemoveLastOwner(
    target: CompanyMembership,
    input: { role?: MembershipRole; status?: MembershipStatus },
  ): boolean {
    if (!target.isOwner() || !target.isActive()) {
      return false;
    }

    const losesOwnerRole = input.role !== undefined && input.role !== MembershipRole.OWNER;
    const losesActiveStatus =
      input.status !== undefined && input.status !== MembershipStatus.ACTIVE;

    return losesOwnerRole || losesActiveStatus;
  }

  /** Falla si el miembro objetivo es el único OWNER activo de la empresa. */
  private async assertNotLastOwner(companyId: string): Promise<void> {
    const memberships = await this.companyMembershipRepository.findByCompanyId(companyId);
    const activeOwners = memberships.filter((m) => m.isOwner() && m.isActive());

    if (activeOwners.length <= 1) {
      throw DomainErrorFactory.lastOwnerCannotBeDemoted();
    }
  }
}
