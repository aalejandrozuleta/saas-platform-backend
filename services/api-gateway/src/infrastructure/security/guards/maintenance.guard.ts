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
 *
 * Política de fallo: fail-open.
 * Si el config-service no está disponible, se permite el tráfico para no
 * bloquear la plataforma por un fallo de la capa de configuración.
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
      // Redis no disponible — continúa con llamada HTTP al config-service
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
      this.logFetchError(err);
      return { maintenanceEnabled: false, maintenanceMessage: null };
    }
  }

  // ─── Diagnóstico de errores ───────────────────────────────────────────────────

  /**
   * Loguea el fallo de manera significativa según el tipo de error.
   *
   * - Circuit-breaker abierto → WARN (el servicio lleva un rato caído)
   * - 5xx del config-service  → WARN (error remoto)
   * - Conexión rechazada      → DEBUG (normal en dev cuando el servicio no arrancó aún)
   * - Otros                   → WARN
   */
  private logFetchError(err: unknown): void {
    // Circuit breaker abierto (código personalizado del ResilientHttpClient)
    if (this.isCircuitOpen(err)) {
      this.logger.warn('Failing open — config-service circuit breaker is open');
      return;
    }

    if (err instanceof HttpException) {
      const status = err.getStatus();
      const response = err.getResponse();
      const detail = typeof response === 'object' && response !== null
        ? JSON.stringify(response)
        : String(response);

      this.logger.warn(
        `Failing open — config-service returned HTTP ${status}: ${detail}`,
      );
      return;
    }

    // ECONNREFUSED / ENOTFOUND / ETIMEDOUT — servicio no iniciado (común en dev)
    if (this.isNetworkError(err)) {
      this.logger.debug(
        `Failing open — config-service unreachable (${this.extractCode(err)})`,
      );
      return;
    }

    this.logger.warn(
      `Failing open — unexpected error fetching maintenance status: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  private isCircuitOpen(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as Record<string, unknown>).code === 'EOPENBREAKER'
    );
  }

  private isNetworkError(err: unknown): boolean {
    if (typeof err !== 'object' || err === null) return false;
    const code = (err as Record<string, unknown>).code;
    return typeof code === 'string' &&
      ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'].includes(code);
  }

  private extractCode(err: unknown): string {
    if (typeof err === 'object' && err !== null && 'code' in err) {
      return String((err as Record<string, unknown>).code);
    }
    return 'UNKNOWN';
  }
}

interface MaintenanceStatus {
  maintenanceEnabled: boolean;
  maintenanceMessage: string | null;
}
