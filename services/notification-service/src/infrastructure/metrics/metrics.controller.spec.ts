import { Test, type TestingModule } from '@nestjs/testing';

import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  let controller: MetricsController;
  let service: jest.Mocked<MetricsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: { getMetrics: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(MetricsController);
    service = module.get(MetricsService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debe retornar las métricas expuestas por el servicio', async () => {
    service.getMetrics.mockResolvedValue('# HELP notifications_sent_total ...');

    const result = await controller.getMetrics();

    expect(result).toBe('# HELP notifications_sent_total ...');
    expect(service.getMetrics).toHaveBeenCalledTimes(1);
  });
});
