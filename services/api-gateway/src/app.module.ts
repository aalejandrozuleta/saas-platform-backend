import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtSessionGuard } from '@infrastructure/security/guards/jwt-session.guard';
import { RedisModule } from '@saas/shared';
import { EnvService } from '@config/env/env.service';

import { HealthController } from './infrastructure/health/health.controller';
import { EnvModule } from './config/env/env.module';

/**
 * Módulo raíz del API Gateway.
 * No contiene dominio ni lógica de negocio.
 */
@Module({
  imports: [
    EnvModule,
    AuthModule,

    RedisModule.forRootAsync({
      imports: [EnvModule],
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
      provide: APP_GUARD,
      useClass: JwtSessionGuard,
    },
  ],

  controllers: [HealthController],
})
export class AppModule {

}
