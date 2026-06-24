import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { UserPermissionService } from '@application/services/user-permission.service';
import { AuthController } from '@infrastructure/controllers/auth.controller';
import { Module } from '@nestjs/common';
import { I18nModule } from '@infrastructure/i18n/i18n.module';
import { SharedModule } from '@saas/shared';
import { AuditModule } from '@infrastructure/audit/audit.module';
import { AuthActivityListener } from '@infrastructure/messaging/listeners/auth-activity.listener';
import { LoginLoggingListener } from '@infrastructure/messaging/listeners/login-logging.listener';
import { PasswordChangeListener } from '@infrastructure/messaging/listeners/password-change.listener';
import { LogoutListener } from '@infrastructure/messaging/listeners/logout.listener';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { LoginUserUseCase } from '@application/use-cases/login-user.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from '@application/use-cases/change-password.use-case';
import { LogoutUseCase } from '@application/use-cases/logout.use-case';
import { LogoutAllUseCase } from '@application/use-cases/logout-all.use-case';

import { authProviders } from './auth.providers';

/**
 * Módulo de Autenticación
 */
@Module({
  imports: [
    I18nModule,
    SharedModule,
    AuditModule,
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,
    ChangePasswordUseCase,
    LogoutUseCase,
    LogoutAllUseCase,
    ...authProviders,
    AuthActivityListener,
    LoginLoggingListener,
    PasswordChangeListener,
    LogoutListener,
  ],
})
export class AuthModule {}
