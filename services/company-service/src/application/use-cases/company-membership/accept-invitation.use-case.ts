import { Inject } from '@nestjs/common';
import { type CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipStatus } from '@domain/enums/membership-status.enum';
import { type CompanyMembershipRepository } from '@domain/repositories/company-membership.repository';
import { COMPANY_MEMBERSHIP_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: el propio invitado acepta su invitación a una empresa.
 *
 * @remarks
 * A diferencia de `UpdateMemberUseCase` (donde OWNER/MANAGER cambian el
 * estado de un tercero), aquí solo el dueño de la membresía puede
 * aceptarla: se responde `MEMBERSHIP_NOT_FOUND` tanto si la membresía no
 * existe como si pertenece a otro usuario, para no revelar quién fue
 * invitado a la empresa.
 */
export class AcceptInvitationUseCase {
  constructor(
    @Inject(COMPANY_MEMBERSHIP_REPOSITORY)
    private readonly companyMembershipRepository: CompanyMembershipRepository,
  ) {}

  async execute(
    requesterUserId: string,
    companyId: string,
    membershipId: string,
  ): Promise<CompanyMembership> {
    const target = await this.companyMembershipRepository.findById(membershipId);

    if (!target || target.companyId !== companyId || target.userId !== requesterUserId) {
      throw DomainErrorFactory.membershipNotFound();
    }

    if (target.status !== MembershipStatus.INVITED) {
      throw DomainErrorFactory.invitationNotPending();
    }

    const updated = target.changeStatus(MembershipStatus.ACTIVE);

    await this.companyMembershipRepository.update(updated);

    return updated;
  }
}
