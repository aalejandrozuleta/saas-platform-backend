import { Module } from '@nestjs/common';
import { EnvModule } from '@config/env/env.module';
import { AuthProxy } from '@infrastructure/http/proxies/auth.proxy';
import { SharedModule } from '@saas/shared';

import { AuthController } from './auth.controller';

/**
 * Módulo de autenticación del gateway.
 * Agrupa `AuthController` (contrato público) y `AuthProxy` (reenvío hacia
 * auth-service). Exporta `AuthProxy` para permitir su reutilización desde
 * otros módulos del gateway si en el futuro necesitan consultar auth-service
 * directamente.
 */
@Module({
  imports: [EnvModule, SharedModule],
  controllers: [AuthController],
  providers: [AuthProxy],
  exports: [AuthProxy],
})
export class AuthModule {}
