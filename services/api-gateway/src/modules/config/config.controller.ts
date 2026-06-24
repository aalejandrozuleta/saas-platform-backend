import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PublicRoute, Roles } from '@saas/shared';
import { ConfigProxy } from '@infrastructure/http/proxies/config.proxy';

/**
 * Controlador proxy de configuración en el API Gateway.
 *
 * @remarks
 * Reenvía todos los métodos HTTP al config-service mediante ConfigProxy.
 * Las rutas de solo-lectura (GET /maintenance/status, GET /feature-flags) son públicas.
 * Las rutas de mutación deben estar protegidas por el JwtSessionGuard global y
 * adicionalmente por un guard de rol de administrador (futuro).
 */
@Controller('config')
export class ConfigController {
  constructor(private readonly proxy: ConfigProxy) {}

  /** Endpoint público para que otros servicios lean el estado de mantenimiento. */
  @All('maintenance/status')
  @PublicRoute()
  async maintenanceStatus(@Req() req: Request, @Res() res: Response) {
    const { body } = await this.proxy.forward(req, '/maintenance/status');
    res.json(body);
  }

  /** Endpoint público para leer feature flags (lectura). */
  @All('feature-flags')
  @PublicRoute()
  async featureFlags(@Req() req: Request, @Res() res: Response) {
    const { body } = await this.proxy.forward(req, '/feature-flags');
    res.json(body);
  }

  /** Rutas de mutación: requieren JWT válido + rol SUPER_ADMIN. */
  @All('*path')
  @Roles('SUPER_ADMIN')
  async forwardAll(@Req() req: Request, @Res() res: Response) {
    const path = '/' + (req.params as Record<string, string>).path;
    const { body } = await this.proxy.forward(req, path);
    res.json(body);
  }
}
