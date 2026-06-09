import { Inject, Injectable } from '@nestjs/common';
import { AUDIT_LOGGER, CONFIG_CACHE } from '@domain/token/services.tokens';
import type { AuditLogger } from '@application/ports/audit-logger.port';
import type { ConfigCache } from '@application/ports/config-cache.port';
import type { SetMaintenanceModeDto, SetMaintenanceModeResponseDto } from '@application/dto/maintenance/set-maintenance-mode.dto';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';

export const MAINTENANCE_SINGLETON_ID = 'singleton';
/** Misma clave que usa el MaintenanceGuard del API Gateway */
const GATEWAY_CACHE_KEY = 'gateway:maintenance:status';

/**
 * Activa o desactiva el modo mantenimiento global de la plataforma.
 *
 * Persiste el estado en `MaintenanceConfig` (fila única / singleton).
 * Todos los microservicios consultan este endpoint para saber
 * si deben rechazar peticiones o entrar en modo lectura.
 */
@Injectable()
export class SetMaintenanceModeUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,
    @Inject(CONFIG_CACHE)
    private readonly cache: ConfigCache,
  ) {}

  async execute(dto: SetMaintenanceModeDto): Promise<SetMaintenanceModeResponseDto> {
    const row = await this.prisma.maintenanceConfig.upsert({
      where: { id: MAINTENANCE_SINGLETON_ID },
      create: {
        id: MAINTENANCE_SINGLETON_ID,
        enabled: dto.enabled,
        message: dto.message ?? null,
        updatedBy: dto.updatedBy ?? null,
      },
      update: {
        enabled: dto.enabled,
        message: dto.message ?? null,
        updatedBy: dto.updatedBy ?? null,
      },
    });

    // Invalida el caché del gateway para efecto inmediato (sin esperar TTL de 30s)
    await this.cache.del(GATEWAY_CACHE_KEY);

    await this.auditLogger.log({
      action: dto.enabled ? 'MAINTENANCE_MODE_ENABLED' : 'MAINTENANCE_MODE_DISABLED',
      resource: 'MaintenanceConfig',
      resourceId: MAINTENANCE_SINGLETON_ID,
      newValue: { enabled: dto.enabled, message: dto.message ?? null },
      performedBy: dto.updatedBy,
    });

    return {
      enabled: row.enabled,
      message: row.message ?? null,
      updatedAt: row.updatedAt,
    };
  }
}
