import { Module } from '@nestjs/common';
import { AuditService } from '@application/audit/audit.service';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';

import { AuditMongoModule } from './mongo/audit-mongo.module';

@Module({
  imports: [AuditMongoModule],
  providers: [
    {
      provide: AUDIT_LOGGER,
      useClass: AuditService,
    },
  ],
  exports: [AUDIT_LOGGER],
})
export class AuditModule {}
