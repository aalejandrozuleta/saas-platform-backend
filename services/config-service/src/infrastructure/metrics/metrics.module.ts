import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { MetricsInterceptor } from './metrics.interceptor';

/**
 * Módulo de observabilidad: expone el endpoint `/metrics` y registra
 * `MetricsInterceptor` como interceptor global (`APP_INTERCEPTOR`) para
 * instrumentar automáticamente todas las requests del servicio.
 */
@Module({
  controllers: [MetricsController],
  providers: [
    MetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
  exports: [MetricsService],
})
export class MetricsModule {}
