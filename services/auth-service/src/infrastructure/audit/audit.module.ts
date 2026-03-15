import { Module } from '@nestjs/common';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';
import { LoginAuditService } from '@application/audit/login-audit.service';
import {
  ACTIVITY_REPORTER,
  ActivityReportMongoModule,
} from '@saas/shared';

@Module({
  imports: [
    ActivityReportMongoModule.register({
      collection: 'user_activity_reports',
    }),
  ],
  providers: [
    LoginAuditService,
    {
      provide: AUDIT_LOGGER,
      useExisting: ACTIVITY_REPORTER,
    },
  ],
  exports: [AUDIT_LOGGER, LoginAuditService],
})
export class AuditModule {}
