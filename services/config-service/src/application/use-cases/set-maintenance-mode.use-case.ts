import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { AppConfig } from '@domain/entities/app-config/app-config.entity';
import { ConfigCategory } from '@domain/enums/config-category.enum';
import { APP_CONFIG_REPOSITORY } from '@domain/token/repositories.tokens';
import { CONFIG_CACHE, AUDIT_LOGGER } from '@domain/token/services.tokens';
import type { AppConfigRepository } from '@domain/repositories/app-config.repository';
import type { ConfigCache } from '@application/ports/config-cache.port';
import type { AuditLogger } from '@application/ports/audit-logger.port';
import type { SetMaintenanceModeDto, SetMaintenanceModeResponseDto } from '@application/dto/maintenance/set-maintenance-mode.dto';

export const MAINTENANCE_KEY = 'maintenance.enabled';
export const MAINTENANCE_MESSAGE_KEY = 'maintenance.message';

/**
 * Activa o desactiva el modo mantenimiento global.
 *
 * @remarks
 * Persiste dos entradas en `AppConfig`:
 * - `maintenance.enabled` → `"true"` / `"false"`
 * - `maintenance.message` → mensaje personalizado o cadena vacía
 *
 * Invalida la caché de Redis tras el cambio para que todos los
 * servicios lean el nuevo estado en la próxima petición.
 */
@Injectable()
export class SetMaintenanceModeUseCase {
  constructor(
    @Inject(APP_CONFIG_REPOSITORY)
    private readonly configRepo: AppConfigRepository,
    @Inject(CONFIG_CACHE)
    private readonly cache: ConfigCache,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(dto: SetMaintenanceModeDto): Promise<SetMaintenanceModeResponseDto> {
    const previous = await this.configRepo.findByKey(MAINTENANCE_KEY);
    const previousValue = previous?.value;

    const enabledConfig = await this.upsertConfig(
      MAINTENANCE_KEY,
      dto.enabled ? 'true' : 'false',
      'Modo mantenimiento global',
      ConfigCategory.MAINTENANCE,
      dto.updatedBy,
    );

    const message = dto.message ?? '';
    await this.upsertConfig(
      MAINTENANCE_MESSAGE_KEY,
      message,
      'Mensaje del modo mantenimiento',
      ConfigCategory.MAINTENANCE,
      dto.updatedBy,
    );

    await this.cache.del(`config:${MAINTENANCE_KEY}`);
    await this.cache.del(`config:${MAINTENANCE_MESSAGE_KEY}`);

    await this.auditLogger.log({
      action: dto.enabled ? 'MAINTENANCE_MODE_ENABLED' : 'MAINTENANCE_MODE_DISABLED',
      resource: 'AppConfig',
      resourceId: MAINTENANCE_KEY,
      previousValue,
      newValue: dto.enabled ? 'true' : 'false',
      performedBy: dto.updatedBy,
    });

    return {
      enabled: enabledConfig.isEnabled(),
      message: message || null,
      updatedAt: enabledConfig.updatedAt,
    };
  }

  private async upsertConfig(
    key: string,
    value: string,
    description: string,
    category: ConfigCategory,
    updatedBy?: string,
  ): Promise<AppConfig> {
    const existing = await this.configRepo.findByKey(key);
    if (existing) {
      existing.setValue(value, updatedBy);
      return this.configRepo.save(existing);
    }

    return this.configRepo.save(
      new AppConfig({
        id: randomUUID(),
        key,
        value,
        description,
        category,
        updatedBy: updatedBy ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
  }
}
