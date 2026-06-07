import {
  APP_CONFIG_REPOSITORY,
  FEATURE_FLAG_REPOSITORY,
  TENANT_CONFIG_REPOSITORY,
  IP_RULE_REPOSITORY,
  MAINTENANCE_WINDOW_REPOSITORY,
  RATE_LIMIT_REPOSITORY,
  PASSWORD_POLICY_REPOSITORY,
  ALLOWED_DOMAIN_REPOSITORY,
} from '@domain/token/repositories.tokens';
import { CONFIG_CACHE, DOMAIN_EVENT_BUS, AUDIT_LOGGER, STATS_SERVICE } from '@domain/token/services.tokens';

import { AppConfigPrismaRepository } from '@infrastructure/persistence/prisma/app-config-prisma.repository';
import { FeatureFlagPrismaRepository } from '@infrastructure/persistence/prisma/feature-flag-prisma.repository';
import { TenantConfigPrismaRepository } from '@infrastructure/persistence/prisma/tenant-config-prisma.repository';
import { IpRulePrismaRepository } from '@infrastructure/persistence/prisma/ip-rule-prisma.repository';
import { MaintenanceWindowPrismaRepository } from '@infrastructure/persistence/prisma/maintenance-window-prisma.repository';
import { RateLimitPrismaRepository } from '@infrastructure/persistence/prisma/rate-limit-prisma.repository';
import { PasswordPolicyPrismaRepository } from '@infrastructure/persistence/prisma/password-policy-prisma.repository';
import { AllowedDomainPrismaRepository } from '@infrastructure/persistence/prisma/allowed-domain-prisma.repository';
import { RedisConfigCacheService } from '@infrastructure/persistence/cache/redis-config-cache.service';
import { PrismaStatsService } from '@infrastructure/stats/prisma-stats.service';

/** Proveedores de DI para el módulo de configuración. */
export const configProviders = [
  // Repositorios
  { provide: APP_CONFIG_REPOSITORY, useClass: AppConfigPrismaRepository },
  { provide: FEATURE_FLAG_REPOSITORY, useClass: FeatureFlagPrismaRepository },
  { provide: TENANT_CONFIG_REPOSITORY, useClass: TenantConfigPrismaRepository },
  { provide: IP_RULE_REPOSITORY, useClass: IpRulePrismaRepository },
  { provide: MAINTENANCE_WINDOW_REPOSITORY, useClass: MaintenanceWindowPrismaRepository },
  { provide: RATE_LIMIT_REPOSITORY, useClass: RateLimitPrismaRepository },
  { provide: PASSWORD_POLICY_REPOSITORY, useClass: PasswordPolicyPrismaRepository },
  { provide: ALLOWED_DOMAIN_REPOSITORY, useClass: AllowedDomainPrismaRepository },

  // Servicios de infraestructura
  { provide: CONFIG_CACHE, useClass: RedisConfigCacheService },
  { provide: STATS_SERVICE, useClass: PrismaStatsService },
];
