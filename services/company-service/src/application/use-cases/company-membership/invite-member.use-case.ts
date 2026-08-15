import { randomUUID } from 'node:crypto';

import { Inject } from '@nestjs/common';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { type MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';
import { type CompanyMembershipRepository } from '@domain/repositories/company-membership.repository';
import { COMPANY_MEMBERSHIP_REPOSITORY } from '@domain/token/repositories.tokens';
import { AUTH_SERVICE_CLIENT } from '@domain/token/services.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

import { type AuthServiceClientPort } from '../../ports/auth-service-client.port';

/**
 * Caso de uso: invitar a un usuario existente como miembro de la empresa.
 *
 * @remarks
 * No hay provisión de cuentas: el invitado ya debe estar registrado en
 * auth-service. Se resuelve su `userId` por email a través del puerto
 * {@link AuthServiceClientPort} y se crea la membresía en `INVITED`.
 */
export class InviteMemberUseCase {
  constructor(
    @Inject(COMPANY_MEMBERSHIP_REPOSITORY)
    private readonly companyMembershipRepository: CompanyMembershipRepository,
    @Inject(AUTH_SERVICE_CLIENT)
    private readonly authServiceClient: AuthServiceClientPort,
  ) {}

  async execute(
    requesterUserId: string,
    companyId: string,
    input: { email: string; role: MembershipRole },
  ): Promise<CompanyMembership> {
    const requesterMembership = await this.companyMembershipRepository.findByCompanyAndUser(
      companyId,
      requesterUserId,
    );

    if (!requesterMembership?.canManageMembers()) {
      throw DomainErrorFactory.notCompanyOwner();
    }

    const user = await this.authServiceClient.lookupUserByEmail(input.email);

    if (!user) {
      throw DomainErrorFactory.userNotFoundForInvite();
    }

    const existing = await this.companyMembershipRepository.findByCompanyAndUser(
      companyId,
      user.userId,
    );

    if (existing) {
      throw DomainErrorFactory.membershipAlreadyExists();
    }

    const membership = CompanyMembership.create({
      id: randomUUID(),
      companyId,
      userId: user.userId,
      role: input.role,
      status: MembershipStatus.INVITED,
    });

    await this.companyMembershipRepository.save(membership);

    return membership;
  }
}
