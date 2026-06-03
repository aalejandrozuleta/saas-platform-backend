import { MetricsController } from './metrics.controller';
import { type MetricsService } from './metrics.service';

describe('MetricsController (api-gateway)', () => {
  let controller: MetricsController;
  let metricsService: jest.Mocked<MetricsService>;

  beforeEach(() => {
    metricsService = {
      getMetrics: jest.fn(),
      getContentType: jest.fn(),
      getServiceName: jest.fn(),
    } as any;

    controller = new MetricsController(metricsService);
  });

  it('debe retornar el resultado de metricsService.getMetrics()', async () => {
    const expected = '# HELP http_requests_total Total requests\n';
    metricsService.getMetrics.mockResolvedValue(expected);

    const result = await controller.getMetrics();

    expect(metricsService.getMetrics).toHaveBeenCalledTimes(1);
    expect(result).toBe(expected);
  });
});
