import { Global, Module } from '@nestjs/common';

import { EnvService } from './env.service';

/**
 * Módulo global de configuración: expone `EnvService` a todo el servicio
 * sin necesidad de importarlo módulo por módulo (`@Global()`).
 */
@Global()
@Module({
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
