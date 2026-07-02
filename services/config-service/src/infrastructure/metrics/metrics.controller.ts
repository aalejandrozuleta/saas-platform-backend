import { Controller, Get, Header } from '@nestjs/common';
import { PublicRoute } from '@saas/shared';

import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  @PublicRoute()
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
