import { Injectable } from '@nestjs/common';
import { BaseMetricsService } from '@saas/shared';
import { Counter } from 'prom-client';

const BUCKETS = [0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1, 1.5, 2, 3];

/**
 * Métricas Prometheus específicas de notification-service.
 *
 * @remarks
 * Extiende `BaseMetricsService` (paquete `@saas/shared`), que ya
 * expone las métricas HTTP genéricas (`http_requests_total`,
 * `http_request_duration_seconds`, etc.) y el registry compartido. Acá solo
 * se agregan los contadores propios del dominio de notificaciones:
 * cuántas se enviaron y cuántas fallaron, con labels para poder filtrar
 * por canal (`email`/`ws`) y, en el caso de envíos exitosos, por
 * `template`.
 */
@Injectable()
export class MetricsService extends BaseMetricsService {
  /** Notificaciones enviadas exitosamente, por `channel` y `template`. */
  public readonly notificationsSentCounter: Counter<string>;
  /** Notificaciones fallidas (después de agotar reintentos), por `channel`. */
  public readonly notificationsFailedCounter: Counter<string>;

  constructor() {
    super('notification-service', BUCKETS);

    this.notificationsSentCounter = new Counter({
      name: 'notifications_sent_total',
      help: 'Total notificaciones enviadas exitosamente',
      labelNames: ['channel', 'template'],
      registers: [this.registry],
    });

    this.notificationsFailedCounter = new Counter({
      name: 'notifications_failed_total',
      help: 'Total notificaciones fallidas (después de reintentos)',
      labelNames: ['channel'],
      registers: [this.registry],
    });
  }
}
