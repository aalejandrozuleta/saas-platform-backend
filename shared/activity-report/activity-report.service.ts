import { Inject, Injectable } from '@nestjs/common';

import {
  ActivityReportRepository,
  ActivityReporter,
  CreateActivityReport,
} from './activity-report.interface';
import { ACTIVITY_REPORT_REPOSITORY } from './activity-report.tokens';

@Injectable()
export class ActivityReportService implements ActivityReporter {
  constructor(
    @Inject(ACTIVITY_REPORT_REPOSITORY)
    private readonly repository: ActivityReportRepository,
  ) {}

  async log(report: CreateActivityReport): Promise<void> {
    await this.repository.save({
      ...report,
      createdAt: new Date(),
    });
  }
}
