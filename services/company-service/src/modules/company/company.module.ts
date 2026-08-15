import { Module } from '@nestjs/common';
import { I18nModule } from '@infrastructure/i18n/i18n.module';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { CompanyController } from '@infrastructure/controllers/company.controller';
import { CompanyMembershipController } from '@infrastructure/controllers/company-membership.controller';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { CreateCompanyUseCase } from '@application/use-cases/company/create-company.use-case';
import { GetCompanyUseCase } from '@application/use-cases/company/get-company.use-case';
import { UploadCompanyLogoUseCase } from '@application/use-cases/company/upload-company-logo.use-case';
import { InviteMemberUseCase } from '@application/use-cases/company-membership/invite-member.use-case';
import { ListMembersUseCase } from '@application/use-cases/company-membership/list-members.use-case';
import { UpdateMemberUseCase } from '@application/use-cases/company-membership/update-member.use-case';
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
    UploadCompanyLogoUseCase,
    InviteMemberUseCase,
    ListMembersUseCase,
    UpdateMemberUseCase,
    RegisterWorkerUseCase,
    ...companyProviders,
    JwtAuthGuard,
  ],
})
export class CompanyModule {}
