import { randomUUID } from 'node:crypto';

import { Inject } from '@nestjs/common';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';
import { type CompanyRepository } from '@domain/repositories/company.repository';
import { type CompanyMembershipRepository } from '@domain/repositories/company-membership.repository';
import {
  COMPANY_REPOSITORY,
  COMPANY_MEMBERSHIP_REPOSITORY,
} from '@domain/token/repositories.tokens';
import { AUTH_SERVICE_CLIENT, NOTIFICATION_CLIENT } from '@domain/token/services.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

import { type AuthServiceClientPort } from '../../ports/auth-service-client.port';
import { type NotificationClientPort } from '../../ports/notification-client.port';

/**
 * Caso de uso: invitar a un usuario existente como miembro de la empresa.
 *
 * @remarks
 * No hay provisión de cuentas: el invitado ya debe estar registrado en
 * auth-service. Se resuelve su `userId` por email a través del puerto
 * {@link AuthServiceClientPort} y se crea la membresía en `INVITED`. Al
 * crearla se dispara (fire-and-forget) el email de notificación vía
 * {@link NotificationClientPort} — antes de esto la invitación no generaba
 * ningún aviso al invitado, que solo se enteraba si consultaba
 * `GET /companies` por su cuenta.
 */
export class InviteMemberUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @Inject(COMPANY_MEMBERSHIP_REPOSITORY)
    private readonly companyMembershipRepository: CompanyMembershipRepository,
    @Inject(AUTH_SERVICE_CLIENT)
    private readonly authServiceClient: AuthServiceClientPort,
    @Inject(NOTIFICATION_CLIENT)
    private readonly notificationClient: NotificationClientPort,
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

    if (input.role === MembershipRole.OWNER && !requesterMembership.isOwner()) {
      throw DomainErrorFactory.ownerRoleRequiresOwner();
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

    const company = await this.companyRepository.findById(companyId);

    if (company) {
      this.notificationClient.sendEmail({
        to: user.email,
        subject: `Te invitaron a unirte a ${company.name}`,
        template: 'membership-invited',
        variables: { companyName: company.name, role: membership.role },
      });
    }

    return membership;
  }
}
