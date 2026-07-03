import { Global, Module } from '@nestjs/common';

import { EnvService } from './env.service';

/**
 * Módulo global que expone {@link EnvService} (acceso tipado y validado a
 * las variables de entorno) a todo el árbol de dependencias de la
 * aplicación sin necesidad de importarlo explícitamente en cada módulo.
 */
@Global()
@Module({
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
