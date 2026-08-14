import { Module } from '@nestjs/common';
import { EnvModule } from '@config/env/env.module';
import { MetricsModule } from '@infrastructure/metrics/metrics.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { I18nModule } from '@infrastructure/i18n/i18n.module';
import { AuditModule } from '@infrastructure/audit/audit.module';
import { MongoModule } from '@infrastructure/persistence/mongo/mongo.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { MaintenanceModule } from '@infrastructure/maintenance/maintenance.module';
import { RedisModule } from '@infrastructure/persistence/cache/redis.module';
import { AuthGlobalExceptionFilter } from '@infrastructure/filters/auth-global-exception.filter';

const APP_FILTER_TOKEN = APP_FILTER;

/**
 * Módulo raíz de auth-service.
 *
 * @remarks
 * Ensambla la configuración (`EnvModule`, `ConfigModule`), infraestructura
 * transversal (Mongo, Redis, métricas, i18n, tareas programadas, mantenimiento)
 * y el módulo de dominio (`AuthModule`), además de registrar
 * {@link AuthGlobalExceptionFilter} como filtro de excepciones global de toda
 * la aplicación (vía `APP_FILTER`), de modo que ningún endpoint quede sin
 * el manejo uniforme de errores y auditoría.
 */
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MaintenanceModule,
    EnvModule,
    MongoModule,
    MetricsModule,
    AuditModule,
    AuthModule,
    UserModule,
    I18nModule,
    RedisModule,
  ],
  providers: [
    {
      provide: APP_FILTER_TOKEN,
      useClass: AuthGlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
