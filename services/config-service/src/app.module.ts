import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { EnvModule } from '@config/env/env.module';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { MongoModule } from '@infrastructure/persistence/mongo/mongo.module';
import { RedisModule } from '@infrastructure/persistence/cache/redis.module';
import { MetricsModule } from '@infrastructure/metrics/metrics.module';
import { I18nModule } from '@infrastructure/i18n/i18n.module';
import { ConfigModule } from '@modules/config/config.module';
import { ConfigGlobalExceptionFilter } from '@infrastructure/filters/config-global-exception.filter';
import { InternalServiceGuard } from '@infrastructure/security/internal-service.guard';

/**
 * Módulo raíz del config-service.
 */
@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }),
    EnvModule,
    MongoModule,
    RedisModule,
    MetricsModule,
    PrismaModule,
    I18nModule,
    ConfigModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ConfigGlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: InternalServiceGuard,
    },
  ],
})
export class AppModule {}
