import { Inject, Injectable } from '@nestjs/common';
import {
  ACTIVITY_REPORTER,
  ActivityReporter,
  CreateActivityReport,
} from '@saas/shared';
import { MetricsService } from '@infrastructure/metrics/metrics.service';
import { AuditLogger } from '@application/ports/audit-logger.port';

@Injectable()
export class AuthActivityRecorderService implements AuditLogger {
  constructor(
    @Inject(ACTIVITY_REPORTER)
    private readonly reporter: ActivityReporter,
    private readonly metricsService: MetricsService,
  ) {}

  async log(report: CreateActivityReport): Promise<void> {
    await this.reporter.log(report);
    this.metricsService.recordUserActivity(report);
  }
}
