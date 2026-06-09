import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Redis } from 'ioredis';
import { REDIS_CLIENT } from '@saas/shared';
import { ConfigProxy } from '@infrastructure/http/proxies/config.proxy';

const CACHE_KEY = 'gateway:maintenance:status';
const CACHE_TTL_SECONDS = 30;

/**
 * Guard global de mantenimiento.
 *
 * Consulta el estado de mantenimiento del config-service (caché Redis 30s)
 * y rechaza todas las peticiones con 503 cuando `maintenanceEnabled = true`.
 *
 * Rutas siempre permitidas (bypass):
 *  - /health
 *  - /config/maintenance/*  → el super-admin puede desactivar el modo desde aquí
 */
@Injectable()
export class MaintenanceGuard implements CanActivate {
  private readonly logger = new Logger(MaintenanceGuard.name);

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly configProxy: ConfigProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    if (this.isBypassRoute(req)) {
      return true;
    }

    const status = await this.getMaintenanceStatus(req);

    if (status.maintenanceEnabled) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            messageKey: 'common.maintenance_mode',
            message: status.maintenanceMessage ?? 'The platform is under maintenance. Please try again later.',
          },
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return true;
  }

  // ─── Bypass ───────────────────────────────────────────────────────────────────

  private isBypassRoute(req: Request): boolean {
    const path = req.path;
    return (
      path === '/health' ||
      path.startsWith('/config/maintenance')
    );
  }

  // ─── Resolución del estado ────────────────────────────────────────────────────

  private async getMaintenanceStatus(req: Request): Promise<MaintenanceStatus> {
    try {
      const cached = await this.redis.get(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached) as MaintenanceStatus;
      }
    } catch {
      // Redis no disponible — continúa con llamada HTTP
    }

    return this.fetchAndCache(req);
  }

  private async fetchAndCache(req: Request): Promise<MaintenanceStatus> {
    try {
      const { body } = await this.configProxy.forward<{ data: MaintenanceStatus }>(
        req,
        '/maintenance/status',
      );

      const status: MaintenanceStatus = {
        maintenanceEnabled: body?.data?.maintenanceEnabled ?? false,
        maintenanceMessage: body?.data?.maintenanceMessage ?? null,
      };

      await this.redis.set(CACHE_KEY, JSON.stringify(status), 'EX', CACHE_TTL_SECONDS);

      return status;
    } catch (err) {
      // Fail-open: si el config-service no responde, no bloqueamos
      this.logger.warn(
        `Could not fetch maintenance status — failing open: ${err instanceof Error ? err.message : String(err)}`,
      );
      return { maintenanceEnabled: false, maintenanceMessage: null };
    }
  }
}

interface MaintenanceStatus {
  maintenanceEnabled: boolean;
  maintenanceMessage: string | null;
}
