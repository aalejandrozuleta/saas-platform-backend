import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HttpLoggerMiddleware } from './infrastructure/logger/http-logger.middleware';
import { MetricsModule } from '@infrastructure/metrics/metrics.module';

@Module({
  imports: [MetricsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
