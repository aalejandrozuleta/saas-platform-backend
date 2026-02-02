import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HttpLoggerMiddleware } from './infrastructure/logger/http-logger.middleware';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
