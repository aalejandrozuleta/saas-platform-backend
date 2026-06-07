import { Inject, Injectable } from '@nestjs/common';
import { APP_CONFIG_REPOSITORY } from '@domain/token/repositories.tokens';
import { MAINTENANCE_WINDOW_REPOSITORY } from '@domain/token/repositories.tokens';
import type { AppConfigRepository } from '@domain/repositories/app-config.repository';
import type { MaintenanceWindowRepository } from '@domain/repositories/maintenance-window.repository';
import type { MaintenanceStatusDto } from '@application/dto/maintenance/maintenance-status.dto';

export const READONLY_KEY = 'readonly.enabled';

/**
 * Obtiene el estado completo de mantenimiento de la plataforma.
 *
 * @remarks
 * Consulta las flags de configuración global y también si hay alguna
 * ventana de mantenimiento en curso en este momento.
 */
@Injectable()
export class GetMaintenanceStatusUseCase {
  constructor(
    @Inject(APP_CONFIG_REPOSITORY)
    private readonly configRepo: AppConfigRepository,
    @Inject(MAINTENANCE_WINDOW_REPOSITORY)
    private readonly windowRepo: MaintenanceWindowRepository,
  ) {}

  async execute(): Promise<MaintenanceStatusDto> {
    const [maintenanceCfg, readOnlyCfg, activeWindows] = await Promise.all([
      this.configRepo.findByKey('maintenance.enabled'),
      this.configRepo.findByKey(READONLY_KEY),
      this.windowRepo.findActive(null),
    ]);

    const messageCfg = maintenanceCfg?.isEnabled()
      ? await this.configRepo.findByKey('maintenance.message')
      : null;

    const ongoingWindow = activeWindows.find((w) => w.isOngoing()) ?? null;

    return {
      maintenanceEnabled: maintenanceCfg?.isEnabled() ?? false,
      readOnlyEnabled: readOnlyCfg?.isEnabled() ?? false,
      maintenanceMessage: messageCfg?.value || null,
      activeWindow: ongoingWindow
        ? {
            id: ongoingWindow.id,
            title: ongoingWindow.title,
            startAt: ongoingWindow.startAt,
            endAt: ongoingWindow.endAt,
          }
        : null,
    };
  }
}
