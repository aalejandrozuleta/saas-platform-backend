import { Test } from '@nestjs/testing';
import { MaintenanceController } from './maintenance.controller';
import { SetMaintenanceModeUseCase } from '@application/use-cases/set-maintenance-mode.use-case';
import { GetMaintenanceStatusUseCase } from '@application/use-cases/get-maintenance-status.use-case';
import { ScheduleMaintenanceWindowUseCase } from '@application/use-cases/schedule-maintenance-window.use-case';
import { APP_CONFIG_REPOSITORY, MAINTENANCE_WINDOW_REPOSITORY } from '@domain/token/repositories.tokens';
import { CONFIG_CACHE, AUDIT_LOGGER } from '@domain/token/services.tokens';
import { MaintenanceWindow } from '@domain/entities/maintenance-window/maintenance-window.entity';
import { AppConfig } from '@domain/entities/app-config/app-config.entity';
import { ConfigCategory } from '@domain/enums/config-category.enum';
import { ErrorCode } from '@saas/shared';

const mockStatus = {
  maintenanceEnabled: false,
  readOnlyEnabled: false,
  maintenanceMessage: null,
  activeWindow: null,
};

const mockWindow = new MaintenanceWindow({
  id: 'w-1',
  title: 'DB upgrade',
  startAt: new Date('2099-01-01'),
  endAt: new Date('2099-01-02'),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

function makeController() {
  const setMaintenanceModeUC = { execute: jest.fn().mockResolvedValue({ enabled: true, message: null, updatedAt: new Date() }) };
  const getMaintenanceStatusUC = { execute: jest.fn().mockResolvedValue(mockStatus) };
  const scheduleWindowUC = { execute: jest.fn().mockResolvedValue({ id: 'w-1', title: 'Test', isActive: true, startAt: new Date(), endAt: new Date(), createdAt: new Date(), tenantId: null, description: null }) };
  const configRepo = {
    findByKey: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockImplementation((c: AppConfig) => Promise.resolve(c)),
    findAll: jest.fn(),
    delete: jest.fn(),
  };
  const windowRepo = {
    findById: jest.fn().mockResolvedValue(mockWindow),
    findAll: jest.fn().mockResolvedValue([mockWindow]),
    save: jest.fn().mockImplementation((w: MaintenanceWindow) => Promise.resolve(w)),
    findActive: jest.fn().mockResolvedValue([]),
    findOverlapping: jest.fn().mockResolvedValue([]),
    delete: jest.fn(),
  };
  const cache = { del: jest.fn().mockResolvedValue(undefined), get: jest.fn(), set: jest.fn(), flush: jest.fn() };
  const audit = { log: jest.fn().mockResolvedValue(undefined) };

  const ctrl = new MaintenanceController(
    setMaintenanceModeUC as any,
    getMaintenanceStatusUC as any,
    scheduleWindowUC as any,
    configRepo as any,
    windowRepo as any,
    cache as any,
    audit as any,
  );
  return { ctrl, setMaintenanceModeUC, getMaintenanceStatusUC, scheduleWindowUC, configRepo, windowRepo, cache, audit };
}

describe('MaintenanceController', () => {
  it('status() calls GetMaintenanceStatusUseCase and wraps result', async () => {
    const { ctrl, getMaintenanceStatusUC } = makeController();
    const result = await ctrl.status();
    expect(getMaintenanceStatusUC.execute).toHaveBeenCalled();
    expect(result.data).toEqual(mockStatus);
  });

  it('setMode() calls SetMaintenanceModeUseCase', async () => {
    const { ctrl, setMaintenanceModeUC } = makeController();
    await ctrl.setMode({ enabled: true });
    expect(setMaintenanceModeUC.execute).toHaveBeenCalledWith({ enabled: true });
  });

  it('setReadOnly() creates new config when not existing', async () => {
    const { ctrl, configRepo } = makeController();
    const result = await ctrl.setReadOnly({ enabled: true });
    expect(configRepo.save).toHaveBeenCalled();
    expect(result.data.enabled).toBe(true);
  });

  it('setReadOnly() updates existing config', async () => {
    const existing = new AppConfig({ id: 'x', key: 'readonly.enabled', value: 'false', category: ConfigCategory.MAINTENANCE, createdAt: new Date(), updatedAt: new Date() });
    const { ctrl, configRepo } = makeController();
    configRepo.findByKey.mockResolvedValue(existing);
    const result = await ctrl.setReadOnly({ enabled: true });
    expect(result.data.enabled).toBe(true);
  });

  it('schedule() calls ScheduleMaintenanceWindowUseCase', async () => {
    const { ctrl, scheduleWindowUC } = makeController();
    await ctrl.schedule({ title: 'Test', startAt: '2099-01-01T00:00:00Z', endAt: '2099-01-02T00:00:00Z' });
    expect(scheduleWindowUC.execute).toHaveBeenCalled();
  });

  it('listWindows() returns all windows', async () => {
    const { ctrl } = makeController();
    const result = await ctrl.listWindows();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe('DB upgrade');
  });

  it('cancelWindow() cancels and returns updated window', async () => {
    const { ctrl } = makeController();
    const result = await ctrl.cancelWindow('w-1');
    expect(result.data.isActive).toBe(false);
  });

  it('cancelWindow() throws NOT_FOUND when window missing', async () => {
    const { ctrl, windowRepo } = makeController();
    windowRepo.findById.mockResolvedValue(null);
    await expect(ctrl.cancelWindow('missing')).rejects.toMatchObject({ errorCode: ErrorCode.NOT_FOUND });
  });
});
