import { Controller, Get, Header } from '@nestjs/common';

import { MetricsService } from './metrics.service';

/**
 * Endpoint para scraping de Prometheus.
 *
 * Recomendado excluir del global prefix si usas versionado.
 */
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}