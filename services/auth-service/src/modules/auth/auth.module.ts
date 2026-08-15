import { RegisterUserUseCase } from '@application/use-cases/register/register-user.use-case';
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
import { LoginUserUseCase } from '@application/use-cases/login/login-user.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/login/refresh-token.use-case';
import { ChangePasswordUseCase } from '@application/use-cases/password/change-password.use-case';
import { LogoutUseCase } from '@application/use-cases/sessions/logout.use-case';
import { LogoutAllUseCase } from '@application/use-cases/sessions/logout-all.use-case';
import { Enable2faUseCase } from '@application/use-cases/two-factor/enable-2fa.use-case';
import { Verify2faUseCase } from '@application/use-cases/two-factor/verify-2fa.use-case';
import { Disable2faUseCase } from '@application/use-cases/two-factor/disable-2fa.use-case';
import { GetTrustedCountriesUseCase } from '@application/use-cases/trusted-countries/get-trusted-countries.use-case';
import { AddTrustedCountryUseCase } from '@application/use-cases/trusted-countries/add-trusted-country.use-case';
import { RemoveTrustedCountryUseCase } from '@application/use-cases/trusted-countries/remove-trusted-country.use-case';
import { GetSessionsUseCase } from '@application/use-cases/sessions/get-sessions.use-case';
import { RevokeSessionUseCase } from '@application/use-cases/sessions/revoke-session.use-case';
import { VerifyEmailUseCase } from '@application/use-cases/email-verification/verify-email.use-case';
import { ResendVerificationUseCase } from '@application/use-cases/email-verification/resend-verification.use-case';
import { ForgotPasswordUseCase } from '@application/use-cases/password/forgot-password.use-case';
import { ResetPasswordUseCase } from '@application/use-cases/password/reset-password.use-case';
import { VerifyLoginChallengeUseCase } from '@application/use-cases/login/verify-login-challenge.use-case';
import { CompleteFirstLoginUseCase } from '@application/use-cases/login/complete-first-login.use-case';
import { RegenerateRecoveryCodesUseCase } from '@application/use-cases/two-factor/regenerate-recovery-codes.use-case';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { NotificationClient } from '@infrastructure/notifications/notification.client';
import { NotificationListener } from '@infrastructure/messaging/listeners/notification.listener';

import { authProviders } from './auth.providers';
/**
 * Módulo de Autenticación
 */
@Module({
  imports: [I18nModule, SharedModule, AuditModule, PrismaModule],
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
    ResendVerificationUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    VerifyLoginChallengeUseCase,
    CompleteFirstLoginUseCase,
    RegenerateRecoveryCodesUseCase,
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
