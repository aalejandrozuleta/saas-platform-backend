import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { EnvModule } from '@config/env/env.module';
import { QueueModule } from '@infrastructure/persistence/cache/redis.module';
import { MetricsModule } from '@infrastructure/metrics/metrics.module';
import { I18nModule } from '@infrastructure/i18n/i18n.module';
import { InternalServiceGuard } from '@infrastructure/security/internal-service.guard';
import { NotificationGlobalExceptionFilter } from '@infrastructure/filters/notification-global-exception.filter';
import { NotificationModule } from '@modules/notification/notification.module';

/**
 * Módulo raíz del microservicio Notification.
 *
 * Cablea la infraestructura transversal (env, colas Redis/BullMQ, métricas,
 * i18n) y el módulo de dominio `NotificationModule`. Registra globalmente:
 * - `NotificationGlobalExceptionFilter`: normaliza las respuestas de error.
 * - `InternalServiceGuard`: exige un secreto compartido en cada request HTTP
 *   entrante, ya que este servicio no valida sesiones de usuario por sí
 *   mismo (ver `InternalServiceGuard` para el detalle de esa decisión).
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EnvModule,
    QueueModule,
    MetricsModule,
    I18nModule,
    NotificationModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: NotificationGlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: InternalServiceGuard,
    },
  ],
})
export class AppModule {}
