import type { ActivityReportRepository } from './activity-report.interface';
import { ActivityReportService } from './activity-report.service';

describe('ActivityReportService', () => {
  let service: ActivityReportService;
  let repository: jest.Mocked<ActivityReportRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
    };

    service = new ActivityReportService(repository);
  });

  it('debe persistir el reporte agregando createdAt automáticamente', async () => {
    await service.log({
      service: 'auth-service',
      category: 'AUTH',
      action: 'AUTH.LOGIN_FAILED',
      outcome: 'FAILURE',
      summary: 'Inicio de sesión fallido',
      actor: {
        type: 'USER',
        id: 'user-1',
      },
      context: {
        ip: '127.0.0.1',
      },
      reason: 'INVALID_PASSWORD',
    });

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'auth-service',
        category: 'AUTH',
        action: 'AUTH.LOGIN_FAILED',
        outcome: 'FAILURE',
        summary: 'Inicio de sesión fallido',
        actor: {
          type: 'USER',
          id: 'user-1',
        },
        createdAt: expect.any(Date),
      }),
    );
  });
});
