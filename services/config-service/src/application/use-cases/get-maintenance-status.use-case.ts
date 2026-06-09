import { Inject, Injectable } from '@nestjs/common';
import { MAINTENANCE_WINDOW_REPOSITORY } from '@domain/token/repositories.tokens';
import type { MaintenanceWindowRepository } from '@domain/repositories/maintenance-window.repository';
import type { MaintenanceStatusDto } from '@application/dto/maintenance/maintenance-status.dto';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { MAINTENANCE_SINGLETON_ID } from './set-maintenance-mode.use-case';

/**
 * Obtiene el estado completo de mantenimiento de la plataforma.
 */
@Injectable()
export class GetMaintenanceStatusUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MAINTENANCE_WINDOW_REPOSITORY)
    private readonly windowRepo: MaintenanceWindowRepository,
  ) {}

  async execute(): Promise<MaintenanceStatusDto> {
    const [config, activeWindows] = await Promise.all([
      this.prisma.maintenanceConfig.findUnique({ where: { id: MAINTENANCE_SINGLETON_ID } }),
      this.windowRepo.findActive(),
    ]);

    const ongoingWindow = activeWindows.find((w) => w.isOngoing()) ?? null;

    return {
      maintenanceEnabled: config?.enabled ?? false,
      readOnlyEnabled: config?.readOnly ?? false,
      maintenanceMessage: config?.message ?? null,
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
