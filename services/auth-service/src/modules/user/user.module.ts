import { Module } from '@nestjs/common';
import { I18nModule } from '@infrastructure/i18n/i18n.module';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { UserProfileController } from '@infrastructure/controllers/user-profile.controller';
import { InternalUserController } from '@infrastructure/controllers/internal-user.controller';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { InternalServiceGuard } from '@infrastructure/security/internal-service.guard';
import { CreateUserProfileUseCase } from '@application/use-cases/user-profile/create-user-profile.use-case';
import { GetUserProfileUseCase } from '@application/use-cases/user-profile/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '@application/use-cases/user-profile/update-user-profile.use-case';
import { UploadProfileImageUseCase } from '@application/use-cases/user-profile/upload-profile-image.use-case';
import { LookupUserByEmailUseCase } from '@application/use-cases/user/lookup-user-by-email.use-case';
import { ProvisionWorkerUseCase } from '@application/use-cases/user/provision-worker.use-case';

import { userProviders } from './user.providers';

/**
 * Módulo de Perfil de Usuario.
 *
 * @remarks
 * Deliberadamente separado de `AuthModule`: agrupa todo lo relacionado a
 * datos de exhibición/contacto (`UserProfile` — nombre, teléfono,
 * documento, avatar), sin tocar credenciales ni sesión. Vive en
 * auth-service porque es información de identidad general, leída con
 * frecuencia por el resto del sistema (ver memoria de proyecto
 * `project_saas_entities`), pero su código queda claramente aislado del
 * de autenticación.
 */
@Module({
  imports: [I18nModule, PrismaModule],
  controllers: [UserProfileController, InternalUserController],
  providers: [
    CreateUserProfileUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    UploadProfileImageUseCase,
    LookupUserByEmailUseCase,
    ProvisionWorkerUseCase,
    ...userProviders,
    JwtAuthGuard,
    InternalServiceGuard,
  ],
})
export class UserModule {}
