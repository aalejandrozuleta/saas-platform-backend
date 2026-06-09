import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '@saas/shared';
import { GetMaintenanceStatusUseCase } from '@application/use-cases/get-maintenance-status.use-case';
import { GetSystemStatsUseCase } from '@application/use-cases/get-system-stats.use-case';
import { ScheduleMaintenanceWindowUseCase } from '@application/use-cases/schedule-maintenance-window.use-case';
import { SetFeatureFlagUseCase } from '@application/use-cases/set-feature-flag.use-case';
import { SetMaintenanceModeUseCase } from '@application/use-cases/set-maintenance-mode.use-case';
import { FeatureFlagController } from '@infrastructure/controllers/feature-flag.controller';
import { MaintenanceController } from '@infrastructure/controllers/maintenance.controller';
import { StatsController } from '@infrastructure/controllers/stats.controller';
import { ConfigAuditLog, ConfigAuditLogSchema } from '@infrastructure/messaging/config-audit.schema';
import { MongoAuditLoggerService } from '@infrastructure/messaging/mongo-audit-logger.service';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { PrismaStatsService } from '@infrastructure/stats/prisma-stats.service';

import { configProviders } from './config.providers';

@Module({
  imports: [
    SharedModule,
    PrismaModule,
    MongooseModule.forFeature([
      { name: ConfigAuditLog.name, schema: ConfigAuditLogSchema },
    ]),
  ],
  controllers: [
    MaintenanceController,
    FeatureFlagController,
    StatsController,
  ],
  providers: [
    ...configProviders,
    MongoAuditLoggerService,
    PrismaStatsService,
    SetMaintenanceModeUseCase,
    GetMaintenanceStatusUseCase,
    ScheduleMaintenanceWindowUseCase,
    SetFeatureFlagUseCase,
    GetSystemStatsUseCase,
  ],
})
export class ConfigModule {}
