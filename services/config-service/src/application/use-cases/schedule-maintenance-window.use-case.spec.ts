import { ScheduleMaintenanceWindowUseCase } from './schedule-maintenance-window.use-case';
import { MaintenanceWindow } from '@domain/entities/maintenance-window/maintenance-window.entity';
import type { MaintenanceWindowRepository } from '@domain/repositories/maintenance-window.repository';
import type { AuditLogger } from '@application/ports/audit-logger.port';
import { ErrorCode } from '@saas/shared';

function makeRepo(overlapping: MaintenanceWindow[] = []): MaintenanceWindowRepository {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findActive: jest.fn().mockResolvedValue([]),
    findAll: jest.fn().mockResolvedValue([]),
    findOverlapping: jest.fn().mockResolvedValue(overlapping),
    save: jest.fn().mockImplementation((w: MaintenanceWindow) => Promise.resolve(w)),
    delete: jest.fn().mockResolvedValue(undefined),
  };
}

function makeAudit(): AuditLogger {
  return { log: jest.fn().mockResolvedValue(undefined) };
}

const validDto = {
  title: 'DB Migration',
  startAt: '2099-01-01T02:00:00Z',
  endAt: '2099-01-01T04:00:00Z',
  createdBy: 'admin',
};

describe('ScheduleMaintenanceWindowUseCase', () => {
  it('creates and returns a maintenance window', async () => {
    const uc = new ScheduleMaintenanceWindowUseCase(makeRepo(), makeAudit());
    const result = await uc.execute(validDto);

    expect(result.id).toBeDefined();
    expect(result.title).toBe('DB Migration');
    expect(result.isActive).toBe(true);
    expect(result.startAt).toBeInstanceOf(Date);
    expect(result.endAt).toBeInstanceOf(Date);
  });

  it('throws VALIDATION_ERROR when endAt <= startAt', async () => {
    const uc = new ScheduleMaintenanceWindowUseCase(makeRepo(), makeAudit());
    await expect(uc.execute({
      title: 'Bad',
      startAt: '2099-01-01T04:00:00Z',
      endAt: '2099-01-01T02:00:00Z',
    })).rejects.toMatchObject({ errorCode: ErrorCode.VALIDATION_ERROR });
  });

  it('throws VALIDATION_ERROR when endAt === startAt', async () => {
    const uc = new ScheduleMaintenanceWindowUseCase(makeRepo(), makeAudit());
    await expect(uc.execute({
      title: 'Bad',
      startAt: '2099-01-01T02:00:00Z',
      endAt: '2099-01-01T02:00:00Z',
    })).rejects.toMatchObject({ errorCode: ErrorCode.VALIDATION_ERROR });
  });

  it('throws CONFLICT when overlapping window exists', async () => {
    const existing = new MaintenanceWindow({
      id: 'w-existing',
      title: 'Existing',
      startAt: new Date('2099-01-01T01:00:00Z'),
      endAt: new Date('2099-01-01T05:00:00Z'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const uc = new ScheduleMaintenanceWindowUseCase(makeRepo([existing]), makeAudit());
    await expect(uc.execute(validDto)).rejects.toMatchObject({ errorCode: ErrorCode.CONFLICT });
  });

  it('calls audit logger with correct action', async () => {
    const audit = makeAudit();
    const uc = new ScheduleMaintenanceWindowUseCase(makeRepo(), audit);
    await uc.execute(validDto);
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'MAINTENANCE_WINDOW_SCHEDULED' }));
  });

  it('accepts tenantId and description', async () => {
    const uc = new ScheduleMaintenanceWindowUseCase(makeRepo(), makeAudit());
    const result = await uc.execute({
      ...validDto,
      description: 'Upgrading DB',
      tenantId: 'tenant-abc',
    });
    expect(result.description).toBe('Upgrading DB');
    expect(result.tenantId).toBe('tenant-abc');
  });
});
