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

const mockCounter = { inc: jest.fn() };
const mockHistogram = { startTimer: jest.fn() };
const mockGauge = { inc: jest.fn(), dec: jest.fn() };

jest.mock('prom-client', () => ({
  Registry: jest.fn(() => mockRegistryInstance),
  collectDefaultMetrics: jest.fn(),
  Counter: jest.fn(() => mockCounter),
  Histogram: jest.fn(() => mockHistogram),
  Gauge: jest.fn(() => mockGauge),
}));

describe('MetricsService (config-service)', () => {
  let service: MetricsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MetricsService();
  });

  it('inicializa Registry y métricas en el constructor', () => {
    expect(Registry).toHaveBeenCalledTimes(1);
    expect(collectDefaultMetrics).toHaveBeenCalledTimes(1);
    expect(Counter).toHaveBeenCalledTimes(1);
    expect(Histogram).toHaveBeenCalledTimes(1);
    expect(Gauge).toHaveBeenCalledTimes(1);
  });

  it('getServiceName() devuelve "config-service"', () => {
    expect(service.getServiceName()).toBe('config-service');
  });

  it('getMetrics() delega al registry', async () => {
    const expected = '# HELP http_requests_total Total number of HTTP requests';
    mockRegistryInstance.metrics.mockResolvedValue(expected);

    const result = await service.getMetrics();

    expect(result).toBe(expected);
    expect(mockRegistryInstance.metrics).toHaveBeenCalledTimes(1);
  });

  it('getContentType() devuelve el content-type del registry', () => {
    expect(service.getContentType()).toBe('text/plain; version=0.0.4; charset=utf-8');
  });
});
