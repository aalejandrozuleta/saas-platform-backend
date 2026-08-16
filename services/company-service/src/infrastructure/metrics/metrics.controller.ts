import { Controller, Get, Header } from '@nestjs/common';
import { PublicRoute } from '@saas/shared';

import { MetricsService } from './metrics.service';

/**
 * Expone las métricas Prometheus del servicio en formato texto plano
 * para que un scraper (Prometheus) las recolija. `@PublicRoute()` la
 * excluye de la autenticación estándar del gateway.
 */
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /** Devuelve el snapshot actual de métricas en formato de exposición de Prometheus. */
  @Get()
  @Header('Content-Type', 'text/plain')
  @PublicRoute()
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
