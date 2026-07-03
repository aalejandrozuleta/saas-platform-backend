import { Controller, Get, Header } from '@nestjs/common';

import { MetricsService } from './metrics.service';

/**
 * Expone las métricas del gateway en formato Prometheus (`text/plain`).
 *
 * @remarks
 * Endpoint pensado para ser scrapeado por Prometheus, no para consumo por
 * clientes de la API; no sigue el formato de respuesta estándar (`errorResponse`
 * / envelope JSON) del resto del gateway a propósito.
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
