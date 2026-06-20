import { Test, type TestingModule } from '@nestjs/testing';

import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController (config-service)', () => {
  let controller: MetricsController;
  let service: MetricsService;

  const metricsServiceMock = {
    getMetrics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: metricsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
    service = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('devuelve las métricas desde el servicio', async () => {
    const metrics = '# HELP http_requests_total Total requests\n# TYPE http_requests_total counter';
    metricsServiceMock.getMetrics.mockResolvedValue(metrics);

    const result = await controller.getMetrics();

    expect(result).toBe(metrics);
    expect(service.getMetrics).toHaveBeenCalledTimes(1);
  });
});
