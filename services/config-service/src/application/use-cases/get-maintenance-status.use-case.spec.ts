import { GetMaintenanceStatusUseCase } from './get-maintenance-status.use-case';
import { AppConfig } from '@domain/entities/app-config/app-config.entity';
import { MaintenanceWindow } from '@domain/entities/maintenance-window/maintenance-window.entity';
import { ConfigCategory } from '@domain/enums/config-category.enum';
import type { AppConfigRepository } from '@domain/repositories/app-config.repository';
import type { MaintenanceWindowRepository } from '@domain/repositories/maintenance-window.repository';

function makeCfg(key: string, value: string): AppConfig {
  return new AppConfig({
    id: 'id',
    key,
    value,
    category: ConfigCategory.MAINTENANCE,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

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

function makeUseCase(overrides?: {
  configMap?: Record<string, string | undefined>;
  activeWindows?: MaintenanceWindow[];
}) {
  const configMap = overrides?.configMap ?? {};
  const configRepo: AppConfigRepository = {
    findByKey: jest.fn().mockImplementation((key: string) =>
      Promise.resolve(configMap[key] != null ? makeCfg(key, configMap[key]!) : null),
    ),
    findAll: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
    delete: jest.fn(),
  };
  const windowRepo: MaintenanceWindowRepository = {
    findActive: jest.fn().mockResolvedValue(overrides?.activeWindows ?? []),
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
    findOverlapping: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
    delete: jest.fn(),
  };
  return new GetMaintenanceStatusUseCase(configRepo, windowRepo);
}

describe('GetMaintenanceStatusUseCase', () => {
  it('returns all false when no config exists', async () => {
    const uc = makeUseCase();
    const result = await uc.execute();
    expect(result.maintenanceEnabled).toBe(false);
    expect(result.readOnlyEnabled).toBe(false);
    expect(result.maintenanceMessage).toBeNull();
    expect(result.activeWindow).toBeNull();
  });

  it('reflects maintenance.enabled = "true"', async () => {
    const uc = makeUseCase({ configMap: { 'maintenance.enabled': 'true', 'maintenance.message': 'Be right back' } });
    const result = await uc.execute();
    expect(result.maintenanceEnabled).toBe(true);
    expect(result.maintenanceMessage).toBe('Be right back');
  });

  it('does not fetch message when maintenance is disabled', async () => {
    const uc = makeUseCase({ configMap: { 'maintenance.enabled': 'false' } });
    const result = await uc.execute();
    expect(result.maintenanceMessage).toBeNull();
  });

  it('reflects readonly.enabled = "true"', async () => {
    const uc = makeUseCase({ configMap: { 'readonly.enabled': 'true' } });
    const result = await uc.execute();
    expect(result.readOnlyEnabled).toBe(true);
  });

  it('includes ongoing window in activeWindow', async () => {
    const uc = makeUseCase({ activeWindows: [makeWindow(true)] });
    const result = await uc.execute();
    expect(result.activeWindow).not.toBeNull();
    expect(result.activeWindow?.title).toBe('Test window');
  });

  it('excludes pending (not yet started) window from activeWindow', async () => {
    const uc = makeUseCase({ activeWindows: [makeWindow(false)] });
    const result = await uc.execute();
    expect(result.activeWindow).toBeNull();
  });

  it('returns null message when maintenance.message is empty string', async () => {
    const uc = makeUseCase({ configMap: { 'maintenance.enabled': 'true', 'maintenance.message': '' } });
    const result = await uc.execute();
    expect(result.maintenanceMessage).toBeNull();
  });
});
