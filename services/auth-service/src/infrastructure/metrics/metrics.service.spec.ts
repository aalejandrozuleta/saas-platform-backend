import {
  collectDefaultMetrics,
  Registry,
  Counter,
  Histogram,
  Gauge,
} from 'prom-client';

import { MetricsService } from './metrics.service';

const mockRegistryInstance = {
  metrics: jest.fn(),
  setDefaultLabels: jest.fn(),
  contentType: 'text/plain; version=0.0.4; charset=utf-8',
};

const mockHttpCounter = {
  inc: jest.fn(),
};
const mockUserActivityCounter = {
  inc: jest.fn(),
};
const mockHistogram = jest.fn();
const mockGauge = jest.fn();

/**
 * Mock completo de prom-client
 */
jest.mock('prom-client', () => ({
  Registry: jest.fn(() => mockRegistryInstance),
  collectDefaultMetrics: jest.fn(),
  Counter: jest.fn(),
  Histogram: jest.fn(() => mockHistogram),
  Gauge: jest.fn(() => mockGauge),
}));

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    jest.clearAllMocks();
    (Counter as jest.Mock)
      .mockImplementationOnce(() => mockHttpCounter)
      .mockImplementationOnce(() => mockUserActivityCounter);
    service = new MetricsService();
  });

  it('debe inicializar Registry y métricas', () => {
    expect(Registry).toHaveBeenCalledTimes(1);
    expect(collectDefaultMetrics).toHaveBeenCalledTimes(1);

    expect(Counter).toHaveBeenCalledTimes(2);
    expect(Histogram).toHaveBeenCalledTimes(1);
    expect(Gauge).toHaveBeenCalledTimes(1);
  });

  it('debe retornar las métricas desde el registry', async () => {
    const metricsValue =
      '# HELP process_cpu_user_seconds_total CPU usage';

    mockRegistryInstance.metrics.mockResolvedValue(metricsValue);

    const result = await service.getMetrics();

    expect(result).toBe(metricsValue);
    expect(mockRegistryInstance.metrics).toHaveBeenCalledTimes(1);
  });

  it('debe retornar el content-type correcto', () => {
    expect(service.getContentType()).toBe(
      'text/plain; version=0.0.4; charset=utf-8',
    );
  });

  it('debe retornar el nombre del servicio', () => {
    expect(service.getServiceName()).toBe('auth-service');
  });

  it('debe registrar actividad de usuario', () => {
    service.recordUserActivity({
      service: 'auth-service',
      category: 'AUTH',
      action: 'AUTH.LOGIN_FAILED',
      outcome: 'FAILURE',
      reason: 'INVALID_PASSWORD',
    });

    expect(mockUserActivityCounter.inc).toHaveBeenCalledWith({
      service: 'auth-service',
      category: 'AUTH',
      action: 'AUTH.LOGIN_FAILED',
      outcome: 'FAILURE',
      reason: 'INVALID_PASSWORD',
    });
  });
});
