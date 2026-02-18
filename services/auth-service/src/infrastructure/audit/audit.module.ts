import { Module } from '@nestjs/common';
import { AuditService } from '@application/audit/audit.service';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';
import { LoginAuditService } from '@application/audit/login-audit.service';

import { AuditMongoModule } from './mongo/audit-mongo.module';

@Module({
  imports: [AuditMongoModule],
  providers: [LoginAuditService,
    {
      provide: AUDIT_LOGGER,
      useClass: AuditService,
    },
  ],
  exports: [AUDIT_LOGGER, LoginAuditService],
})
export class AuditModule {}
