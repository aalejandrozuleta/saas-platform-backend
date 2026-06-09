import { type Provider } from '@nestjs/common';
import { FEATURE_FLAG_REPOSITORY, MAINTENANCE_WINDOW_REPOSITORY } from '@domain/token/repositories.tokens';
import { CONFIG_CACHE, AUDIT_LOGGER, STATS_SERVICE } from '@domain/token/services.tokens';

import { FeatureFlagPrismaRepository } from '@infrastructure/persistence/prisma/feature-flag-prisma.repository';
import { MaintenanceWindowPrismaRepository } from '@infrastructure/persistence/prisma/maintenance-window-prisma.repository';
import { RedisConfigCacheService } from '@infrastructure/persistence/cache/redis-config-cache.service';
import { PrismaStatsService } from '@infrastructure/stats/prisma-stats.service';
import { MongoAuditLoggerService } from '@infrastructure/messaging/mongo-audit-logger.service';

export const configProviders: Provider[] = [
  { provide: FEATURE_FLAG_REPOSITORY,      useClass: FeatureFlagPrismaRepository },
  { provide: MAINTENANCE_WINDOW_REPOSITORY, useClass: MaintenanceWindowPrismaRepository },
  { provide: CONFIG_CACHE,                 useClass: RedisConfigCacheService },
  { provide: STATS_SERVICE,               useClass: PrismaStatsService },
  { provide: AUDIT_LOGGER,                useExisting: MongoAuditLoggerService },
];
