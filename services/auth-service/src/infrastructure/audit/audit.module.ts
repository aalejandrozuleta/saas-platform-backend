import { Module } from '@nestjs/common';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';
import { LoginAuditService } from '@application/audit/login-audit.service';
import {
  ActivityReportMongoModule,
} from '@saas/shared';
import { MetricsModule } from '@infrastructure/metrics/metrics.module';

import { AuthActivityRecorderService } from '../../application/audit/auth-activity-recorder.service';

@Module({
  imports: [
    MetricsModule,
    ActivityReportMongoModule.register({
      collection: 'user_activity_reports',
    }),
  ],
  providers: [
    LoginAuditService,
    AuthActivityRecorderService,
    {
      provide: AUDIT_LOGGER,
      useExisting: AuthActivityRecorderService,
    },
  ],
  exports: [AUDIT_LOGGER, LoginAuditService],
})
export class AuditModule {}
