import { collectDefaultMetrics, Registry } from 'prom-client';

import { MetricsService } from './metrics.service';

const mockRegistryInstance = {
  metrics: jest.fn(),
  contentType: 'text/plain; version=0.0.4; charset=utf-8',
};

/**
 * Mock de prom-client
 */
jest.mock('prom-client', () => ({
  Registry: jest.fn(() => mockRegistryInstance),
  collectDefaultMetrics: jest.fn(),
}));

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MetricsService();
  });

  it('debe inicializar el Registry y registrar métricas por defecto', () => {
    expect(Registry).toHaveBeenCalledTimes(1);
    expect(collectDefaultMetrics).toHaveBeenCalledTimes(1);
    expect(collectDefaultMetrics).toHaveBeenCalledWith(
      expect.objectContaining({
        register: mockRegistryInstance,
      }),
    );
  });

  it('debe retornar las métricas desde el registry', async () => {
    // Arrange
    const metricsValue =
      '# HELP process_cpu_user_seconds_total CPU usage';

    mockRegistryInstance.metrics.mockResolvedValue(metricsValue);

    // Act
    const result = await service.getMetrics();

    // Assert
    expect(result).toBe(metricsValue);
    expect(mockRegistryInstance.metrics).toHaveBeenCalledTimes(1);
  });

  it('debe retornar el content-type correcto', () => {
    const contentType = service.getContentType();

    expect(contentType).toBe(
      'text/plain; version=0.0.4; charset=utf-8',
    );
  });
});
