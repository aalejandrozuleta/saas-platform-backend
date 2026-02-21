import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { EnvModule } from '@config/env/env.module';
import { MetricsModule } from '@infrastructure/metrics/metrics.module';
import { AuthModule } from '@modules/auth/auth.module';
import { I18nModule } from '@infrastructure/i18n/i18n.module';
import { MongoModule } from '@infrastructure/persistence/mongo/mongo.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GlobalExceptionFilter } from '@saas/shared';
import { APP_FILTER } from '@nestjs/core';

const APP_FILTER_TOKEN = APP_FILTER;
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    EnvModule,
    MongoModule,
    MetricsModule,
    AuthModule,
    I18nModule
  ],
  providers: [
    {
      provide: APP_FILTER_TOKEN,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    
    // consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
