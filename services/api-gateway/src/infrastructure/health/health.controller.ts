import { Controller, Get } from '@nestjs/common';
import { PublicRoute } from '@saas/shared';

/**
 * Endpoint de salud del Gateway.
 * Usado por Docker, Kubernetes y CI.
 */
@Controller('health')
export class HealthController {
  @Get()
  @PublicRoute()
  health(): { status: string } {
    return { status: 'ok' };
  }
}
