import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { AuthController } from '@infrastructure/controllers/auth.controller';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { I18nModule } from '@infrastructure/i18n/i18n.module';
import { AuditMongoModule } from '@infrastructure/audit/mongo/audit-mongo.module';
import { SharedModule } from '@saas/shared';
import { AuditModule } from '@application/audit/audit.module';
import { DOMAIN_EVENT_BUS } from '@domain/token/domain-event.token';
import { LoginSucceededAuditListener } from '@application/listeners/login-audit.listener';
import { LoginLoggingListener } from '@application/listeners/login-logging.listener';

import { authProviders } from './auth.providers';
/**
 * Módulo de Autenticación
 */
@Module({
  imports: [
    I18nModule,
    AuditMongoModule,
    SharedModule,
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    RegisterUserUseCase,
    ...authProviders,
    LoginSucceededAuditListener,
    LoginLoggingListener
  ],
  exports: [DOMAIN_EVENT_BUS]
})
export class AuthModule { }
