import { Module } from '@nestjs/common';
import { I18nModule } from '@infrastructure/i18n/i18n.module';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { CompanyController } from '@infrastructure/controllers/company.controller';
import { CompanyMembershipController } from '@infrastructure/controllers/company-membership.controller';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { CreateCompanyUseCase } from '@application/use-cases/company/create-company.use-case';
import { GetCompanyUseCase } from '@application/use-cases/company/get-company.use-case';
import { UpdateCompanyUseCase } from '@application/use-cases/company/update-company.use-case';
import { DeleteCompanyUseCase } from '@application/use-cases/company/delete-company.use-case';
import { ListMyCompaniesUseCase } from '@application/use-cases/company/list-my-companies.use-case';
import { UploadCompanyLogoUseCase } from '@application/use-cases/company/upload-company-logo.use-case';
import { RemoveCompanyLogoUseCase } from '@application/use-cases/company/remove-company-logo.use-case';
import { InviteMemberUseCase } from '@application/use-cases/company-membership/invite-member.use-case';
import { ListMembersUseCase } from '@application/use-cases/company-membership/list-members.use-case';
import { UpdateMemberUseCase } from '@application/use-cases/company-membership/update-member.use-case';
import { AcceptInvitationUseCase } from '@application/use-cases/company-membership/accept-invitation.use-case';
import { DeclineInvitationUseCase } from '@application/use-cases/company-membership/decline-invitation.use-case';
import { RemoveMemberUseCase } from '@application/use-cases/company-membership/remove-member.use-case';
import { RegisterWorkerUseCase } from '@application/use-cases/company-membership/register-worker.use-case';

import { companyProviders } from './company.providers';

/**
 * Módulo de Empresa (tenant) y sus membresías.
 *
 * @remarks
 * Agrupa el núcleo del servicio: crear empresas y gestionar quién
 * pertenece a ellas. Las entidades operativas del tenant (productos,
 * compras, facturas) crecerán sobre esta misma base.
 */
@Module({
  imports: [I18nModule, PrismaModule],
  controllers: [CompanyController, CompanyMembershipController],
  providers: [
    CreateCompanyUseCase,
    GetCompanyUseCase,
    UpdateCompanyUseCase,
    DeleteCompanyUseCase,
    ListMyCompaniesUseCase,
    UploadCompanyLogoUseCase,
    RemoveCompanyLogoUseCase,
    InviteMemberUseCase,
    ListMembersUseCase,
    UpdateMemberUseCase,
    AcceptInvitationUseCase,
    DeclineInvitationUseCase,
    RemoveMemberUseCase,
    RegisterWorkerUseCase,
    ...companyProviders,
    JwtAuthGuard,
  ],
})
export class CompanyModule {}
