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
