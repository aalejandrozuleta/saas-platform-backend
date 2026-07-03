import { Inject, Injectable } from '@nestjs/common';

import {
  ActivityReportRepository,
  ActivityReporter,
  CreateActivityReport,
} from './activity-report.interface';
import { ACTIVITY_REPORT_REPOSITORY } from './activity-report.tokens';

/**
 * Implementación por defecto de `ActivityReporter`. Es el punto de entrada
 * que usan los servicios consumidores (vía el token `ACTIVITY_REPORTER`)
 * para registrar actividad de auditoría, delegando la persistencia en el
 * `ActivityReportRepository` inyectado.
 */
@Injectable()
export class ActivityReportService implements ActivityReporter {
  constructor(
    @Inject(ACTIVITY_REPORT_REPOSITORY)
    private readonly repository: ActivityReportRepository,
  ) {}

  /**
   * Registra una nueva actividad, asignando la marca de tiempo actual y
   * delegando el guardado al repositorio configurado.
   *
   * @param report - Datos de la actividad a registrar (sin `createdAt`).
   */
  async log(report: CreateActivityReport): Promise<void> {
    await this.repository.save({
      ...report,
      createdAt: new Date(),
    });
  }
}
