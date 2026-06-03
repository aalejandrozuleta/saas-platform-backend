import {
  collectDefaultMetrics,
  Registry,
  Counter,
  Histogram,
  Gauge,
} from 'prom-client';

import { MetricsService } from './metrics.service';

const mockRegistry = {
  metrics: jest.fn(),
  setDefaultLabels: jest.fn(),
  contentType: 'text/plain; version=0.0.4; charset=utf-8',
};
const mockCounter = { inc: jest.fn() };
const mockHistogram = { startTimer: jest.fn() };
const mockGauge = { inc: jest.fn(), dec: jest.fn() };

jest.mock('prom-client', () => ({
  Registry: jest.fn(() => mockRegistry),
  collectDefaultMetrics: jest.fn(),
  Counter: jest.fn(() => mockCounter),
  Histogram: jest.fn(() => mockHistogram),
  Gauge: jest.fn(() => mockGauge),
}));

describe('MetricsService (api-gateway)', () => {
  let service: MetricsService;

  beforeEach(() => {
    jest.clearAllMocks();
    (Counter as jest.Mock)
      .mockImplementationOnce(() => mockCounter)
      .mockImplementationOnce(() => mockCounter);
    service = new MetricsService();
  });

  it('debe inicializar el Registry y registrar métricas', () => {
    expect(Registry).toHaveBeenCalledTimes(1);
    expect(collectDefaultMetrics).toHaveBeenCalledTimes(1);
    expect(Counter).toHaveBeenCalledTimes(1);
    expect(Histogram).toHaveBeenCalledTimes(1);
    expect(Gauge).toHaveBeenCalledTimes(1);
  });

  it('debe retornar el nombre del servicio', () => {
    expect(service.getServiceName()).toBe('api-gateway');
  });

  it('debe retornar las métricas del registry', async () => {
    mockRegistry.metrics.mockResolvedValue('# HELP ...');
    const result = await service.getMetrics();
    expect(result).toBe('# HELP ...');
  });

  it('debe retornar el content-type del registry', () => {
    expect(service.getContentType()).toBe(
      'text/plain; version=0.0.4; charset=utf-8',
    );
  });
});
