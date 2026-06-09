import { MaintenanceWindow } from '@domain/entities/maintenance-window/maintenance-window.entity';
import type { MaintenanceWindowRepository } from '@domain/repositories/maintenance-window.repository';

import { GetMaintenanceStatusUseCase } from './get-maintenance-status.use-case';
import { MAINTENANCE_SINGLETON_ID } from './set-maintenance-mode.use-case';

function makeWindow(ongoing: boolean): MaintenanceWindow {
  const start = ongoing ? new Date(Date.now() - 1000) : new Date(Date.now() + 60_000);
  const end = new Date(Date.now() + 3_600_000);
  return new MaintenanceWindow({
    id: 'w-1',
    title: 'Test window',
    startAt: start,
    endAt: end,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makePrisma(row?: Partial<{ enabled: boolean; message: string | null; readOnly: boolean }> | null) {
  return {
    maintenanceConfig: {
      findUnique: jest.fn().mockResolvedValue(
        row !== undefined
          ? row !== null ? { id: MAINTENANCE_SINGLETON_ID, enabled: false, message: null, readOnly: false, ...row } : null
          : null,
      ),
    },
  } as any;
}

function makeWindowRepo(active: MaintenanceWindow[] = []): MaintenanceWindowRepository {
  return {
    findActive: jest.fn().mockResolvedValue(active),
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
    findOverlapping: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
    delete: jest.fn(),
  };
}

describe('GetMaintenanceStatusUseCase', () => {
  it('returns all false when no config row exists', async () => {
    const uc = new GetMaintenanceStatusUseCase(makePrisma(null), makeWindowRepo());
    const result = await uc.execute();
    expect(result.maintenanceEnabled).toBe(false);
    expect(result.readOnlyEnabled).toBe(false);
    expect(result.maintenanceMessage).toBeNull();
    expect(result.activeWindow).toBeNull();
  });

  it('reflects maintenance enabled=true from config row', async () => {
    const uc = new GetMaintenanceStatusUseCase(
      makePrisma({ enabled: true, message: 'Be right back' }),
      makeWindowRepo(),
    );
    const result = await uc.execute();
    expect(result.maintenanceEnabled).toBe(true);
    expect(result.maintenanceMessage).toBe('Be right back');
  });

  it('reflects readOnly=true from config row', async () => {
    const uc = new GetMaintenanceStatusUseCase(
      makePrisma({ readOnly: true }),
      makeWindowRepo(),
    );
    const result = await uc.execute();
    expect(result.readOnlyEnabled).toBe(true);
  });

  it('includes ongoing window in activeWindow', async () => {
    const uc = new GetMaintenanceStatusUseCase(makePrisma(null), makeWindowRepo([makeWindow(true)]));
    const result = await uc.execute();
    expect(result.activeWindow).not.toBeNull();
    expect(result.activeWindow?.title).toBe('Test window');
  });

  it('excludes pending (not yet started) window from activeWindow', async () => {
    const uc = new GetMaintenanceStatusUseCase(makePrisma(null), makeWindowRepo([makeWindow(false)]));
    const result = await uc.execute();
    expect(result.activeWindow).toBeNull();
  });
});
