import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { AuthController } from '@infrastructure/controllers/auth.controller';
import { Module } from '@nestjs/common';
import { I18nModule } from '@infrastructure/i18n/i18n.module';
import { SharedModule } from '@saas/shared';
import { AuditModule } from '@infrastructure/audit/audit.module';
import { AuthActivityListener } from '@infrastructure/messaging/listeners/auth-activity.listener';
import { LoginLoggingListener } from '@infrastructure/messaging/listeners/login-logging.listener';
import { PasswordChangeListener } from '@infrastructure/messaging/listeners/password-change.listener';
import { LogoutListener } from '@infrastructure/messaging/listeners/logout.listener';
import { TwoFactorListener } from '@infrastructure/messaging/listeners/two-factor.listener';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { LoginUserUseCase } from '@application/use-cases/login-user.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from '@application/use-cases/change-password.use-case';
import { LogoutUseCase } from '@application/use-cases/logout.use-case';
import { LogoutAllUseCase } from '@application/use-cases/logout-all.use-case';
import { Enable2faUseCase } from '@application/use-cases/enable-2fa.use-case';
import { Verify2faUseCase } from '@application/use-cases/verify-2fa.use-case';
import { Disable2faUseCase } from '@application/use-cases/disable-2fa.use-case';
import { GetTrustedCountriesUseCase } from '@application/use-cases/get-trusted-countries.use-case';
import { AddTrustedCountryUseCase } from '@application/use-cases/add-trusted-country.use-case';
import { RemoveTrustedCountryUseCase } from '@application/use-cases/remove-trusted-country.use-case';
import { GetSessionsUseCase } from '@application/use-cases/get-sessions.use-case';
import { RevokeSessionUseCase } from '@application/use-cases/revoke-session.use-case';
import { VerifyEmailUseCase } from '@application/use-cases/verify-email.use-case';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { NotificationClient } from '@infrastructure/notifications/notification.client';
import { NotificationListener } from '@infrastructure/messaging/listeners/notification.listener';

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
    Enable2faUseCase,
    Verify2faUseCase,
    Disable2faUseCase,
    GetTrustedCountriesUseCase,
    AddTrustedCountryUseCase,
    RemoveTrustedCountryUseCase,
    GetSessionsUseCase,
    RevokeSessionUseCase,
    VerifyEmailUseCase,
    ...authProviders,
    JwtAuthGuard,
    AuthActivityListener,
    LoginLoggingListener,
    PasswordChangeListener,
    LogoutListener,
    TwoFactorListener,
    NotificationClient,
    NotificationListener,
  ],
})
export class AuthModule {}
