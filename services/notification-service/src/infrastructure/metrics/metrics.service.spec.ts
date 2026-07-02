import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe registrar el nombre del servicio', () => {
    expect(service.getServiceName()).toBe('notification-service');
  });

  it('debe exponer contadores de notificaciones enviadas y fallidas', async () => {
    service.notificationsSentCounter.inc({ channel: 'email', template: 'welcome' });
    service.notificationsFailedCounter.inc({ channel: 'ws' });

    const metrics = await service.getMetrics();

    expect(metrics).toContain('notifications_sent_total');
    expect(metrics).toContain('notifications_failed_total');
  });
});
