import { Controller, Get, Header } from '@nestjs/common';
import { PublicRoute } from '@saas/shared';

import { MetricsService } from './metrics.service';

/**
 * Expone las métricas Prometheus del servicio en `GET /metrics`.
 *
 * @remarks
 * Ruta pública (`@PublicRoute()`): Prometheus scrapea este endpoint sin
 * autenticación, como es convención en el ecosistema. Devuelve el formato
 * de texto plano de Prometheus (`Content-Type: text/plain`), no JSON.
 */
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /** @returns Todas las métricas registradas, serializadas en formato Prometheus. */
  @Get()
  @Header('Content-Type', 'text/plain')
  @PublicRoute()
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
