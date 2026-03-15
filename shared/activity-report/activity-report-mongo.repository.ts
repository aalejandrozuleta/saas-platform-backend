import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type {
  ActivityReport,
  ActivityReportRepository,
} from './activity-report.interface';
import { ActivityReportDocument } from './activity-report.schema';

@Injectable()
export class ActivityReportMongoRepository
  implements ActivityReportRepository
{
  constructor(
    @InjectModel(ActivityReportDocument.name)
    private readonly model: Model<ActivityReportDocument>,
  ) {}

  async save(report: ActivityReport): Promise<void> {
    await this.model.create(report);
  }
}
