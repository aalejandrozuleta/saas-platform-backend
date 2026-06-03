import { ActivityReportMongoRepository } from './activity-report-mongo.repository';
import type { ActivityReport } from './activity-report.interface';

describe('ActivityReportMongoRepository', () => {
  let repository: ActivityReportMongoRepository;
  let model: { create: jest.Mock };

  const report: ActivityReport = {
    service: 'auth-service',
    category: 'AUTH',
    action: 'AUTH.LOGIN_SUCCESS',
    outcome: 'SUCCESS',
    summary: 'Login exitoso',
    actor: { type: 'USER', id: 'user-1' },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    model = { create: jest.fn() };
    repository = new ActivityReportMongoRepository(model as any);
  });

  it('debe persistir el reporte llamando a model.create', async () => {
    model.create.mockResolvedValue({});

    await repository.save(report);

    expect(model.create).toHaveBeenCalledWith(report);
    expect(model.create).toHaveBeenCalledTimes(1);
  });
});
