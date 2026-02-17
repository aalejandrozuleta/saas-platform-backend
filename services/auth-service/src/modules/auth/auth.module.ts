import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { AuthController } from '@infrastructure/controllers/auth.controller';
import { Module } from '@nestjs/common';
import { I18nModule } from '@infrastructure/i18n/i18n.module';
import { SharedModule } from '@saas/shared';
import { AuditModule } from '@infrastructure/audit/audit.module';
import { LoginSucceededAuditListener } from '@infrastructure/messaging/listeners/login-audit.listener';
import { LoginLoggingListener } from '@infrastructure/messaging/listeners/login-logging.listener';

import { authProviders } from './auth.providers';
/**
 * Módulo de Autenticación
 */
@Module({
  imports: [
    I18nModule,
    SharedModule,
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    ...authProviders,
    LoginSucceededAuditListener,
    LoginLoggingListener,
  ],
})
export class AuthModule { }
