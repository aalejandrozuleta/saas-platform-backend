import { Inject, Injectable } from '@nestjs/common';
import { ACTIVITY_REPORTER, ActivityReporter, CreateActivityReport } from '@saas/shared';
import { MetricsService } from '@infrastructure/metrics/metrics.service';
import { AuditLogger } from '@application/ports/audit-logger.port';

/**
 * Implementación de {@link AuditLogger} para auth-service.
 *
 * @remarks
 * Actúa como adaptador entre el puerto `AuditLogger` propio del servicio y el
 * `ActivityReporter` genérico del paquete compartido (que persiste en
 * Mongo). Además de delegar la persistencia, aprovecha cada reporte de
 * actividad para alimentar métricas de negocio ({@link MetricsService}),
 * evitando que los use cases tengan que llamar a dos servicios distintos
 * (auditoría y métricas) cada vez que ocurre un evento de autenticación.
 */
@Injectable()
export class AuthActivityRecorderService implements AuditLogger {
  constructor(
    @Inject(ACTIVITY_REPORTER)
    private readonly reporter: ActivityReporter,
    private readonly metricsService: MetricsService,
  ) {}

  /**
   * Persiste el reporte de actividad y registra la métrica correspondiente.
   *
   * @param report - Reporte de actividad a auditar (login, logout, challenge, error, etc.).
   */
  async log(report: CreateActivityReport): Promise<void> {
    await this.reporter.log(report);
    this.metricsService.recordUserActivity(report);
  }
}
