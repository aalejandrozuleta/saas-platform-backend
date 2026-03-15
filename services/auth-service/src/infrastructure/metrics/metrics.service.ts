import { Injectable } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
  Registry,
} from 'prom-client';
import type { CreateActivityReport } from '@saas/shared';

/**
 * Servicio centralizado de métricas Prometheus.
 *
 * - Expone métricas HTTP
 * - Incluye identificación del microservicio
 * - Registra métricas por servicio (enterprise ready)
 */
@Injectable()
export class MetricsService {
  private readonly registry: Registry;

  /**
   * Nombre del microservicio.
   * En producción podría venir desde ENV.
   */
  private readonly serviceName = 'auth-service';

  public readonly httpRequestCounter: Counter<string>;
  public readonly httpRequestDuration: Histogram<string>;
  public readonly httpRequestsInFlight: Gauge<string>;
  public readonly userActivityCounter: Counter<string>;

  constructor() {
    this.registry = new Registry();

    /**
     * Métricas por defecto de Node.js
     */
    collectDefaultMetrics({ register: this.registry });

    /**
     * Counter total de requests HTTP
     */
    this.httpRequestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status', 'service'],
      registers: [this.registry],
    });

    /**
     * Histogram de duración HTTP
     */
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status', 'service'],
      buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1, 1.5, 2, 3],
      registers: [this.registry],
    });

    /**
     * Requests en curso
     */
    this.httpRequestsInFlight = new Gauge({
      name: 'http_requests_in_flight',
      help: 'Current HTTP requests being processed',
      registers: [this.registry],
    });

    this.userActivityCounter = new Counter({
      name: 'user_activity_reports_total',
      help: 'Total user activity reports generated',
      labelNames: [
        'service',
        'category',
        'action',
        'outcome',
        'reason',
      ],
      registers: [this.registry],
    });
  }

  /**
   * Devuelve el nombre del servicio.
   */
  getServiceName(): string {
    return this.serviceName;
  }

  /**
   * Devuelve métricas en formato Prometheus.
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Devuelve content-type correcto.
   */
  getContentType(): string {
    return this.registry.contentType;
  }

  recordUserActivity(
    report: Pick<
      CreateActivityReport,
      'service' | 'category' | 'action' | 'outcome' | 'reason'
    >,
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
