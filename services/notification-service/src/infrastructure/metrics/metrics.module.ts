import { Module } from '@nestjs/common';

import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

/**
 * Módulo de métricas: expone `MetricsService` (contadores Prometheus) y el
 * endpoint `GET /metrics` (`MetricsController`) que Prometheus scrapea.
 * Se exporta `MetricsService` para que otros módulos (consumers, channels)
 * puedan incrementar los contadores de envíos/fallos.
 */
@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
