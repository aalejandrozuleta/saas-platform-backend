import { MongoAuditLoggerService } from './mongo-audit-logger.service';

function makeModel() {
  return { create: jest.fn().mockResolvedValue({}) } as any;
}

describe('MongoAuditLoggerService', () => {
  it('persists an audit entry', async () => {
    const model = makeModel();
    const svc = new MongoAuditLoggerService(model);
    await svc.log({ action: 'MAINTENANCE_MODE_ENABLED', resource: 'AppConfig' });
    expect(model.create).toHaveBeenCalledWith(expect.objectContaining({
      action: 'MAINTENANCE_MODE_ENABLED',
      resource: 'AppConfig',
      timestamp: expect.any(Date),
    }));
  });

  it('does not throw when MongoDB fails (best-effort auditing)', async () => {
    const model = { create: jest.fn().mockRejectedValue(new Error('DB down')) } as any;
    const svc = new MongoAuditLoggerService(model);
    await expect(svc.log({ action: 'TEST', resource: 'X' })).resolves.toBeUndefined();
  });
});
