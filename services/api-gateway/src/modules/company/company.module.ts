import { Module } from '@nestjs/common';
import { EnvModule } from '@config/env/env.module';
import { SharedModule } from '@saas/shared';
import { CompanyProxy } from '@infrastructure/http/proxies/company.proxy';

import { CompanyController } from './company.controller';

/**
 * Módulo de compañías/membresías del gateway.
 * Agrupa `CompanyController` (contrato público `/companies`) y
 * `CompanyProxy` (reenvío hacia company-service).
 */
@Module({
  imports: [EnvModule, SharedModule],
  controllers: [CompanyController],
  providers: [CompanyProxy],
  exports: [CompanyProxy],
})
export class CompanyModule {}
