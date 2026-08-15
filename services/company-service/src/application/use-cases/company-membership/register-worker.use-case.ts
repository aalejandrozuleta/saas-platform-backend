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
import { AUTH_SERVICE_CLIENT } from '@domain/token/services.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

import { type AuthServiceClientPort } from '../../ports/auth-service-client.port';

/**
 * Caso de uso: registrar (provisionar) un trabajador **nuevo** para la
 * empresa.
 *
 * @remarks
 * A diferencia de {@link InviteMemberUseCase} (que invita a un usuario ya
 * registrado en auth-service), aquí la empresa contrata directamente a
 * alguien sin cuenta previa: auth-service crea el usuario y le envía sus
 * credenciales por email. Como el trabajador no debe aceptar ninguna
 * invitación, la membresía nace en `ACTIVE`.
 */
export class RegisterWorkerUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @Inject(COMPANY_MEMBERSHIP_REPOSITORY)
    private readonly companyMembershipRepository: CompanyMembershipRepository,
    @Inject(AUTH_SERVICE_CLIENT)
    private readonly authServiceClient: AuthServiceClientPort,
  ) {}

  async execute(
    requesterUserId: string,
    companyId: string,
    input: { firstName: string; lastName: string; contactEmail: string; role: MembershipRole },
  ): Promise<{ membership: CompanyMembership; loginEmail: string }> {
    const requesterMembership = await this.companyMembershipRepository.findByCompanyAndUser(
      companyId,
      requesterUserId,
    );

    if (!requesterMembership?.canManageMembers()) {
      throw DomainErrorFactory.notCompanyOwner();
    }

    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw DomainErrorFactory.companyNotFound();
    }

    if (input.role === MembershipRole.OWNER) {
      throw DomainErrorFactory.ownerRoleNotAllowed();
    }

    const { userId, loginEmail } = await this.authServiceClient.provisionWorker({
      firstName: input.firstName,
      lastName: input.lastName,
      contactEmail: input.contactEmail,
      companyName: company.name,
    });

    const membership = CompanyMembership.create({
      id: randomUUID(),
      companyId,
      userId,
      role: input.role,
      status: MembershipStatus.ACTIVE,
    });

    await this.companyMembershipRepository.save(membership);

    return { membership, loginEmail };
  }
}
