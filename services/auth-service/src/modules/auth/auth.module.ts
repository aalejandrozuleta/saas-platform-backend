import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { AuthController } from '@infrastructure/controllers/auth.controller';
import { PrismaService } from '@infrastructure/persistence/sql/prisma.service';
import { Module } from '@nestjs/common';
import { I18nModule } from '@infrastructure/i18n/i18n.module';

import { authProviders } from './auth.providers';


/**
 * Módulo de Autenticación
 */
@Module({
  imports: [I18nModule],
  controllers: [AuthController],
  providers: [
    PrismaService,
    RegisterUserUseCase,
    ...authProviders,
  ],
})
export class AuthModule {}
