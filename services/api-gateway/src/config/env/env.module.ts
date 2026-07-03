import { Module } from '@nestjs/common';

import { EnvService } from './env.service';

/**
 * Módulo de configuración de entorno.
 *
 * Expone `EnvService` (variables ya validadas contra `envSchema`) para
 * que el resto de la aplicación acceda a ellas de forma tipada.
 */
@Module({
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
