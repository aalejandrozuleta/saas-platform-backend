import { MaintenanceWindow } from '@domain/entities/maintenance-window/maintenance-window.entity';
import { ErrorCode } from '@saas/shared';

import { MaintenanceController } from './maintenance.controller';

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
  const scheduleWindowUC = { execute: jest.fn().mockResolvedValue({ id: 'w-1', title: 'Test', isActive: true, startAt: new Date(), endAt: new Date(), createdAt: new Date(), description: null }) };
  const windowRepo = {
    findById: jest.fn().mockResolvedValue(mockWindow),
    findAll: jest.fn().mockResolvedValue([mockWindow]),
    save: jest.fn().mockImplementation((w: MaintenanceWindow) => Promise.resolve(w)),
    findActive: jest.fn().mockResolvedValue([]),
    findOverlapping: jest.fn().mockResolvedValue([]),
    delete: jest.fn(),
  };

  const ctrl = new MaintenanceController(
    setMaintenanceModeUC as any,
    getMaintenanceStatusUC as any,
    scheduleWindowUC as any,
    windowRepo as any,
  );
  return { ctrl, setMaintenanceModeUC, getMaintenanceStatusUC, scheduleWindowUC, windowRepo };
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
    await expect(ctrl.cancelWindow('missing')).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});
