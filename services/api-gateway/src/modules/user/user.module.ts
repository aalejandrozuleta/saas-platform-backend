import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';

import { UserController } from './user.controller';

/**
 * Módulo de Perfil de Usuario del gateway.
 *
 * @remarks
 * Importa `AuthModule` para reutilizar la instancia ya provista de
 * `AuthProxy` (mismo backend, auth-service, mismo circuit breaker) en vez
 * de declarar una segunda instancia — pero mantiene su propio controller
 * y swagger, separados de `AuthController`.
 */
@Module({
  imports: [AuthModule],
  controllers: [UserController],
})
export class UserModule {}
