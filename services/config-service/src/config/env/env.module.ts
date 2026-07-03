import { Global, Module } from '@nestjs/common';

import { EnvService } from './env.service';

/**
 * Módulo global de configuración de entorno.
 *
 * @remarks
 * Marcado como `@Global()` para que `EnvService` esté disponible en
 * cualquier módulo del servicio sin necesidad de reimportarlo.
 */
@Global()
@Module({
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
