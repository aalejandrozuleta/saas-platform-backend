import {
  collectDefaultMetrics,
  Registry,
  Counter,
  Histogram,
  Gauge,
} from 'prom-client';

import { BaseMetricsService } from './base-metrics.service';

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

class TestMetricsService extends BaseMetricsService {
  constructor(buckets?: number[]) {
    super('test-service', buckets);
  }
}

describe('BaseMetricsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inicializa Registry y métricas en el constructor', () => {
    new TestMetricsService();

    expect(Registry).toHaveBeenCalledTimes(1);
    expect(mockRegistryInstance.setDefaultLabels).toHaveBeenCalledWith({ service: 'test-service' });
    expect(collectDefaultMetrics).toHaveBeenCalledTimes(1);
    expect(Counter).toHaveBeenCalledTimes(1);
    expect(Histogram).toHaveBeenCalledTimes(1);
    expect(Gauge).toHaveBeenCalledTimes(1);
  });

  it('usa buckets por defecto cuando no se pasan buckets', () => {
    new TestMetricsService();

    const histogramCall = (Histogram as jest.Mock).mock.calls[0][0];
    expect(histogramCall.buckets).toEqual([0.01, 0.025, 0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1, 2, 3, 5]);
  });

  it('usa buckets personalizados cuando se pasan', () => {
    new TestMetricsService([0.05, 0.5, 1]);

    const histogramCall = (Histogram as jest.Mock).mock.calls[0][0];
    expect(histogramCall.buckets).toEqual([0.05, 0.5, 1]);
  });

  it('getServiceName() devuelve el nombre del servicio', () => {
    const service = new TestMetricsService();
    expect(service.getServiceName()).toBe('test-service');
  });

  it('getMetrics() delega al registry', async () => {
    const expected = '# HELP http_requests_total Total number of HTTP requests';
    mockRegistryInstance.metrics.mockResolvedValue(expected);

    const service = new TestMetricsService();
    const result = await service.getMetrics();

    expect(result).toBe(expected);
    expect(mockRegistryInstance.metrics).toHaveBeenCalledTimes(1);
  });

  it('getContentType() devuelve el content-type del registry', () => {
    const service = new TestMetricsService();
    expect(service.getContentType()).toBe('text/plain; version=0.0.4; charset=utf-8');
  });

  it('expone httpRequestCounter, httpRequestDuration y httpRequestsInFlight', () => {
    const service = new TestMetricsService();

    expect(service.httpRequestCounter).toBe(mockCounter);
    expect(service.httpRequestDuration).toBe(mockHistogram);
    expect(service.httpRequestsInFlight).toBe(mockGauge);
  });
});
