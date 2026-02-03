import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HttpLoggerMiddleware } from './infrastructure/logger/http-logger.middleware';
import { HealthController } from './infrastructure/health/health.controller';
import { EnvModule } from './config/env/env.module';
import { AuthModule } from '@modules/auth/auth.module';

/**
 * Módulo raíz del API Gateway.
 * No contiene dominio ni lógica de negocio.
 */
@Module({
  imports: [EnvModule, AuthModule],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
