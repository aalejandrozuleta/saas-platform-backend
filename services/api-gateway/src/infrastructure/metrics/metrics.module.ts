import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { MetricsController } from './metrics.controller';
import { MetricsInterceptor } from './metrics.interceptor';
import { MetricsService } from './metrics.service';

/**
 * Módulo de métricas del gateway.
 *
 * Registra `MetricsInterceptor` como interceptor global (`APP_INTERCEPTOR`)
 * para instrumentar todas las peticiones, y expone `MetricsController`
 * con el endpoint de scraping de Prometheus.
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
