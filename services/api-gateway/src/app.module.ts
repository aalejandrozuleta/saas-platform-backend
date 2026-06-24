import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { ConfigGatewayModule } from '@modules/config/config.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtSessionGuard } from '@infrastructure/security/guards/jwt-session.guard';
import { MaintenanceGuard } from '@infrastructure/security/guards/maintenance.guard';
import { RolesGuard } from '@infrastructure/security/guards/roles.guard';
import { PermissionGuard } from '@infrastructure/security/guards/permission.guard';
import { GlobalExceptionFilter, RedisModule } from '@saas/shared';
import { EnvService } from '@config/env/env.service';

import { HealthController } from './infrastructure/health/health.controller';
import { EnvModule } from './config/env/env.module';
import { I18nModule } from './infrastructure/i18n/i18n.module';
import { MetricsModule } from './infrastructure/metrics/metrics.module';

/**
 * Módulo raíz del API Gateway.
 * No contiene dominio ni lógica de negocio.
 */
@Module({
  imports: [
    EnvModule,
    I18nModule,
    AuthModule,
    ConfigGatewayModule,
    MetricsModule,

    RedisModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        host: envService.get('REDIS_HOST'),
        port: envService.get('REDIS_PORT'),
        password: envService.get('REDIS_PASSWORD'),
      }),
    }),
  ],

  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // MaintenanceGuard se ejecuta PRIMERO — bloquea antes de validar JWT
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard,
    },
    // JwtSessionGuard se ejecuta SEGUNDO — valida autenticación
    {
      provide: APP_GUARD,
      useClass: JwtSessionGuard,
    },
    // RolesGuard se ejecuta TERCERO — autorización por rol
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // PermissionGuard se ejecuta CUARTO — autorización por permiso fino
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],

  controllers: [HealthController],
})
export class AppModule {}
