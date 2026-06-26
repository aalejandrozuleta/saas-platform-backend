import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import { EnvModule } from '@config/env/env.module';
import { QueueModule } from '@infrastructure/persistence/cache/redis.module';
import { MetricsModule } from '@infrastructure/metrics/metrics.module';
import { NotificationGlobalExceptionFilter } from '@infrastructure/filters/notification-global-exception.filter';
import { NotificationModule } from '@modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EnvModule,
    QueueModule,
    MetricsModule,
    NotificationModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: NotificationGlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
