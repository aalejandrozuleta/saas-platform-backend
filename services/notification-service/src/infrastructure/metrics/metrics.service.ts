import { Injectable } from '@nestjs/common';
import { BaseMetricsService } from '@saas/shared';
import { Counter } from 'prom-client';

const BUCKETS = [0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1, 1.5, 2, 3];

@Injectable()
export class MetricsService extends BaseMetricsService {
  public readonly notificationsSentCounter: Counter<string>;
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
