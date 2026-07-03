import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { ActivityReport, ActivityReportRepository } from './activity-report.interface';
import { ActivityReportDocument } from './activity-report.schema';

/**
 * Implementación de `ActivityReportRepository` respaldada por MongoDB
 * (Mongoose). Es la implementación concreta que registra
 * `ActivityReportMongoModule` detrás del token `ACTIVITY_REPORT_REPOSITORY`.
 */
@Injectable()
export class ActivityReportMongoRepository implements ActivityReportRepository {
  constructor(
    @InjectModel(ActivityReportDocument.name)
    private readonly model: Model<ActivityReportDocument>,
  ) {}

  /**
   * Persiste un reporte de actividad como documento nuevo en la colección
   * configurada.
   *
   * @param report - Reporte de actividad completo, incluyendo `createdAt`.
   */
  async save(report: ActivityReport): Promise<void> {
    await this.model.create(report);
  }
}
