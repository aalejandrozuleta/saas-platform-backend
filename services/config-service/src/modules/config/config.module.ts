import { Module } from '@nestjs/common';
import { SharedModule } from '@saas/shared';

import { configProviders } from './config.providers';

// Use cases
import { SetMaintenanceModeUseCase } from '@application/use-cases/set-maintenance-mode.use-case';
import { GetMaintenanceStatusUseCase } from '@application/use-cases/get-maintenance-status.use-case';
import { ScheduleMaintenanceWindowUseCase } from '@application/use-cases/schedule-maintenance-window.use-case';
import { SetFeatureFlagUseCase } from '@application/use-cases/set-feature-flag.use-case';
import { SetTenantConfigUseCase } from '@application/use-cases/set-tenant-config.use-case';
import { AddIpRuleUseCase } from '@application/use-cases/add-ip-rule.use-case';
import { SetPasswordPolicyUseCase } from '@application/use-cases/set-password-policy.use-case';
import { SetRateLimitUseCase } from '@application/use-cases/set-rate-limit.use-case';
import { GetSystemStatsUseCase } from '@application/use-cases/get-system-stats.use-case';

// Controllers
import { MaintenanceController } from '@infrastructure/controllers/maintenance.controller';
import { FeatureFlagController } from '@infrastructure/controllers/feature-flag.controller';
import { TenantController } from '@infrastructure/controllers/tenant.controller';
import { SecurityController } from '@infrastructure/controllers/security.controller';
import { RateLimitController } from '@infrastructure/controllers/rate-limit.controller';
import { StatsController } from '@infrastructure/controllers/stats.controller';

// Infrastructure
import { PrismaStatsService } from '@infrastructure/stats/prisma-stats.service';

/** Módulo principal del config-service. Agrupa todos los sub-dominios de configuración. */
@Module({
  imports: [SharedModule],
  controllers: [
    MaintenanceController,
    FeatureFlagController,
    TenantController,
    SecurityController,
    RateLimitController,
    StatsController,
  ],
  providers: [
    ...configProviders,
    // Use cases
    SetMaintenanceModeUseCase,
    GetMaintenanceStatusUseCase,
    ScheduleMaintenanceWindowUseCase,
    SetFeatureFlagUseCase,
    SetTenantConfigUseCase,
    AddIpRuleUseCase,
    SetPasswordPolicyUseCase,
    SetRateLimitUseCase,
    GetSystemStatsUseCase,
    PrismaStatsService,
  ],
})
export class ConfigModule {}
