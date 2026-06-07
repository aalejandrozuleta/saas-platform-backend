import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER } from '@nestjs/core';
import { RedisModule } from '@saas/shared';
import { EnvService } from '@config/env/env.service';

import { EnvModule } from '@config/env/env.module';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { MongoModule } from '@infrastructure/persistence/mongo/mongo.module';
import { ConfigModule } from '@modules/config/config.module';
import { ConfigGlobalExceptionFilter } from '@infrastructure/filters/config-global-exception.filter';

/**
 * Módulo raíz del config-service.
 */
@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),

    EnvModule,
    PrismaModule,
    MongoModule,

    RedisModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        host: envService.get('REDIS_HOST'),
        port: envService.get('REDIS_PORT'),
        password: envService.get('REDIS_PASSWORD'),
      }),
    }),

    ConfigModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ConfigGlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
