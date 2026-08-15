import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { EnvModule } from '@config/env/env.module';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { MetricsModule } from '@infrastructure/metrics/metrics.module';
import { I18nModule } from '@infrastructure/i18n/i18n.module';
import { CompanyGlobalExceptionFilter } from '@infrastructure/filters/company-global-exception.filter';
import { CompanyModule } from '@modules/company/company.module';

/**
 * Módulo raíz del company-service.
 *
 * @remarks
 * Ensambla infraestructura transversal (env, Postgres vía Prisma, métricas,
 * i18n) y el módulo de dominio `CompanyModule`.
 *
 * Sin Mongo/Redis/S3: este primer corte no tiene audit-log ni caché — es una
 * decisión deliberada para reducir infraestructura, no un olvido. Se
 * agregarán cuando exista una necesidad real.
 */
@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }),
    EnvModule,
    MetricsModule,
    PrismaModule,
    I18nModule,
    CompanyModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: CompanyGlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
