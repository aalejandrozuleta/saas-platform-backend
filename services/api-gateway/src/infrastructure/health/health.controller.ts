import { Controller, Get } from '@nestjs/common';
import { PublicRoute } from '@saas/shared';

/**
 * Endpoint de salud del Gateway.
 * Usado por Docker, Kubernetes y CI para healthchecks de liveness.
 */
@Controller('health')
export class HealthController {
  /**
   * Responde 200 siempre que el proceso del gateway esté vivo.
   *
   * @remarks
   * No verifica el estado de auth-service ni de config-service: es un
   * healthcheck de liveness del propio proceso, no de sus dependencias.
   * Marcado `@PublicRoute()` y además en el bypass list de
   * `MaintenanceGuard` (ver `maintenance.guard.ts`) para que siga
   * respondiendo incluso durante el modo mantenimiento.
   */
  @Get()
  @PublicRoute()
  health(): { status: string } {
    return { status: 'ok' };
  }
}
