import { Inject } from '@nestjs/common';
import { MembershipStatus } from '@domain/enums/membership-status.enum';
import { type CompanyMembershipRepository } from '@domain/repositories/company-membership.repository';
import { COMPANY_MEMBERSHIP_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: el propio invitado rechaza su invitación a una empresa.
 *
 * @remarks
 * Rechazar borra la membresía (no existe un status `DECLINED`): una
 * invitación rechazada no deja rastro, igual que si nunca se hubiera
 * invitado a esa persona.
 */
export class DeclineInvitationUseCase {
  constructor(
    @Inject(COMPANY_MEMBERSHIP_REPOSITORY)
    private readonly companyMembershipRepository: CompanyMembershipRepository,
  ) {}

  async execute(requesterUserId: string, companyId: string, membershipId: string): Promise<void> {
    const target = await this.companyMembershipRepository.findById(membershipId);

    if (!target || target.companyId !== companyId || target.userId !== requesterUserId) {
      throw DomainErrorFactory.membershipNotFound();
    }

    if (target.status !== MembershipStatus.INVITED) {
      throw DomainErrorFactory.invitationNotPending();
    }

    await this.companyMembershipRepository.delete(membershipId);
  }
}
