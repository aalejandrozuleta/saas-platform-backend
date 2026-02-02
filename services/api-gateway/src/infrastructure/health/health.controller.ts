import { Controller, Get } from '@nestjs/common';

/**
 * Endpoint de salud del Gateway.
 * Usado por Docker, Kubernetes y CI.
 */
@Controller('health')
export class HealthController {
  @Get()
  health(): { status: string } {
    return { status: 'ok' };
  }
}
