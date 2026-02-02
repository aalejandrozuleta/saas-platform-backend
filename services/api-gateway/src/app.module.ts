import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';

import { AuthController } from './modules/auth/auth.controller';
import { HttpLoggerMiddleware } from './infrastructure/logger/http-logger.middleware';
import { HealthController } from './infrastructure/health/health.controller';

/**
 * Módulo raíz del API Gateway.
 * No contiene dominio ni lógica de negocio.
 */
@Module({
  controllers: [AuthController, HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
