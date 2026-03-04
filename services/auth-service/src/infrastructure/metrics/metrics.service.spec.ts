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
  contentType: 'text/plain; version=0.0.4; charset=utf-8',
};

const mockCounter = jest.fn();
const mockHistogram = jest.fn();
const mockGauge = jest.fn();

/**
 * Mock completo de prom-client
 */
jest.mock('prom-client', () => ({
  Registry: jest.fn(() => mockRegistryInstance),
  collectDefaultMetrics: jest.fn(),
  Counter: jest.fn(() => mockCounter),
  Histogram: jest.fn(() => mockHistogram),
  Gauge: jest.fn(() => mockGauge),
}));

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MetricsService();
  });

  it('debe inicializar Registry y métricas', () => {
    expect(Registry).toHaveBeenCalledTimes(1);
    expect(collectDefaultMetrics).toHaveBeenCalledTimes(1);

    expect(Counter).toHaveBeenCalledTimes(1);
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
});