import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import type { SystemStats, StatsPort } from '@application/ports/stats.port';
import { MAINTENANCE_SINGLETON_ID } from '@application/use-cases/set-maintenance-mode.use-case';

/**
 * Implementación de estadísticas del sistema mediante consultas Prisma.
 *
 * Ejecuta todas las consultas en paralelo para minimizar latencia.
 */
@Injectable()
export class PrismaStatsService implements StatsPort {
  constructor(private readonly prisma: PrismaService) {}

  async getSystemStats(): Promise<SystemStats> {
    const now = new Date();

    const [
      totalFeatureFlags,
      enabledFeatureFlags,
      activeMaintenanceWindows,
      upcomingMaintenanceWindows,
      maintenanceConfig,
    ] = await Promise.all([
      this.prisma.featureFlag.count(),
      this.prisma.featureFlag.count({ where: { enabled: true } }),
      this.prisma.maintenanceWindow.count({
        where: { isActive: true, startAt: { lte: now }, endAt: { gte: now } },
      }),
      this.prisma.maintenanceWindow.count({
        where: { isActive: true, startAt: { gt: now } },
      }),
      this.prisma.maintenanceConfig.findUnique({ where: { id: MAINTENANCE_SINGLETON_ID } }),
    ]);

    return {
      totalFeatureFlags,
      enabledFeatureFlags,
      disabledFeatureFlags: totalFeatureFlags - enabledFeatureFlags,
      activeMaintenanceWindows,
      upcomingMaintenanceWindows,
      maintenanceEnabled: maintenanceConfig?.enabled ?? false,
      readOnlyEnabled: maintenanceConfig?.readOnly ?? false,
      generatedAt: now,
    };
  }
}
