import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { LoggerProvider } from './logger/logger.provider';
import { PLATFORM_LOGGER } from './logger/logger.token';
import { HttpRequestLoggingInterceptor } from './logger/http-request-logging.interceptor';

/**
 * Módulo raíz de `@saas/shared`. Cada microservicio lo importa una vez
 * para obtener el logger de plataforma y el logging automático de
 * requests HTTP:
 *
 * - Provee `PLATFORM_LOGGER` (vía `LoggerProvider`) y lo exporta para que
 *   cualquier otro módulo del servicio pueda inyectarlo.
 * - Registra `HttpRequestLoggingInterceptor` como `APP_INTERCEPTOR` global,
 *   por lo que todas las requests del servicio quedan logueadas sin
 *   configuración adicional.
 */
@Module({
  providers: [
    LoggerProvider,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpRequestLoggingInterceptor,
    },
  ],
  exports: [PLATFORM_LOGGER],
})
export class SharedModule {}
