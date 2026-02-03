import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MetricsModule } from '@infrastructure/metrics/metrics.module';
import { MongoModule } from '@infrastructure/persistence/mongo/mongo.module';
import { SqlModule } from '@infrastructure/persistence/sql/sql.module';

import { HttpLoggerMiddleware } from './infrastructure/logger/http-logger.middleware';

@Module({
  imports: [MetricsModule,MongoModule, SqlModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
