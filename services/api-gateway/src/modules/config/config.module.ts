import { Module } from '@nestjs/common';
import { EnvModule } from '@config/env/env.module';
import { SharedModule } from '@saas/shared';
import { ConfigProxy } from '@infrastructure/http/proxies/config.proxy';

import { ConfigController } from './config.controller';

/**
 * Módulo de configuración del gateway.
 * Agrupa `ConfigController` (proxy de rutas hacia config-service) y
 * `ConfigProxy`. Exporta `ConfigProxy` porque `MaintenanceGuard`
 * (`infrastructure/security/guards/maintenance.guard.ts`) lo inyecta
 * directamente para consultar el estado de mantenimiento.
 */
@Module({
  imports: [EnvModule, SharedModule],
  controllers: [ConfigController],
  providers: [ConfigProxy],
  exports: [ConfigProxy],
})
export class ConfigGatewayModule {}
