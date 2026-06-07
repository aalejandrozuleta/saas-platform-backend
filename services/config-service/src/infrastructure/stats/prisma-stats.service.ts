import { Injectable } from '@nestjs/common';
import type { SystemStats } from '@application/ports/stats.port';
import type { StatsPort } from '@application/ports/stats.port';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';

/**
 * Implementación de estadísticas del sistema mediante consultas Prisma.
 *
 * @remarks
 * Lanza 8 conteos en paralelo para minimizar latencia.
 * No cachea los resultados — cada consulta refleja el estado actual.
 */
@Injectable()
export class PrismaStatsService implements StatsPort {
  constructor(private readonly prisma: PrismaService) {}

  async getSystemStats(): Promise<SystemStats> {
    const now = new Date();

    const [
      totalConfigs,
      totalFeatureFlags,
      enabledFeatureFlags,
      totalTenants,
      activeTenants,
      totalIpRules,
      activeMaintenanceWindows,
      totalRateLimits,
    ] = await Promise.all([
      this.prisma.appConfig.count(),
      this.prisma.featureFlag.count(),
      this.prisma.featureFlag.count({ where: { enabled: true } }),
      this.prisma.tenantConfig.count(),
      this.prisma.tenantConfig.count({ where: { isActive: true } }),
      this.prisma.ipRule.count(),
      this.prisma.maintenanceWindow.count({ where: { isActive: true, endAt: { gte: now } } }),
      this.prisma.rateLimitConfig.count({ where: { isActive: true } }),
    ]);

    return {
      totalConfigs,
      totalFeatureFlags,
      enabledFeatureFlags,
      totalTenants,
      activeTenants,
      totalIpRules,
      activeMaintenanceWindows,
      totalRateLimits,
      generatedAt: now,
    };
  }
}
