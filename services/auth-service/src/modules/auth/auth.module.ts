import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { AuthController } from '@infrastructure/controllers/auth.controller';
import { PrismaService } from '@infrastructure/persistence/sql/prisma.service';
import { Module } from '@nestjs/common';
import { I18nService } from '@saas/shared';
import { authProviders } from './auth.providers';

/**
 * Módulo de Autenticación
 */
@Module({
  controllers: [AuthController],
  providers: [
    PrismaService,
    RegisterUserUseCase,
    I18nService,
    ...authProviders,
  ],
})
export class AuthModule {}
