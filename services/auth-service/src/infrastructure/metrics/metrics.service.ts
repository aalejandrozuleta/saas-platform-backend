import { Injectable } from '@nestjs/common';
import { BaseMetricsService } from '@saas/shared';
import { Counter } from 'prom-client';
import type { CreateActivityReport } from '@saas/shared';

const BUCKETS = [0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1, 1.5, 2, 3];

/**
 * Servicio de métricas Prometheus del auth-service.
 *
 * @remarks
 * Extiende `BaseMetricsService` (buckets de histograma compartidos) y
 * agrega un contador propio de actividad de usuario, usado para medir
 * volumen de intentos de login, 2FA, etc. por categoría/acción/resultado.
 */
@Injectable()
export class MetricsService extends BaseMetricsService {
  public readonly userActivityCounter: Counter<string>;

  constructor() {
    super('auth-service', BUCKETS);

    this.userActivityCounter = new Counter({
      name: 'user_activity_reports_total',
      help: 'Total user activity reports generated',
      labelNames: ['service', 'category', 'action', 'outcome', 'reason'],
      registers: [this.registry],
    });
  }

  /**
   * Incrementa el contador `user_activity_reports_total` con las
   * etiquetas del reporte de actividad.
   *
   * @remarks
   * `reason` se normaliza a `'NONE'` cuando no viene definido, ya que
   * Prometheus requiere un valor de label consistente (no admite
   * `undefined`).
   */
  recordUserActivity(
    report: Pick<CreateActivityReport, 'service' | 'category' | 'action' | 'outcome' | 'reason'>,
  ): void {
    this.userActivityCounter.inc({
      service: report.service,
      category: report.category,
      action: report.action,
      outcome: report.outcome,
      reason: report.reason ?? 'NONE',
    });
  }
}
