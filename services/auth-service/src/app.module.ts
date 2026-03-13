import { Module } from '@nestjs/common';
import { EnvModule } from '@config/env/env.module';
import { MetricsModule } from '@infrastructure/metrics/metrics.module';
import { AuthModule } from '@modules/auth/auth.module';
import { I18nModule } from '@infrastructure/i18n/i18n.module';
import { MongoModule } from '@infrastructure/persistence/mongo/mongo.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GlobalExceptionFilter, RedisModule } from '@saas/shared';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { MaintenanceModule } from '@infrastructure/maintenance/maintenance.module';
import { EnvService } from '@config/env/env.service';


const APP_FILTER_TOKEN = APP_FILTER;
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MaintenanceModule,
    EnvModule,
    MongoModule,
    MetricsModule,
    AuthModule,
    I18nModule,


    RedisModule.forRootAsync({
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
      provide: APP_FILTER_TOKEN,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {
}
