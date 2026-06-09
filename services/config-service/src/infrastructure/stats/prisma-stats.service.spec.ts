import { MAINTENANCE_SINGLETON_ID } from '@application/use-cases/set-maintenance-mode.use-case';

import { PrismaStatsService } from './prisma-stats.service';

function makePrisma(opts: {
  totalFeatureFlags?: number;
  enabledFeatureFlags?: number;
  activeMaintenanceWindows?: number;
  upcomingMaintenanceWindows?: number;
  maintenanceEnabled?: boolean;
  readOnlyEnabled?: boolean;
} = {}) {
  const {
    totalFeatureFlags = 0,
    enabledFeatureFlags = 0,
    activeMaintenanceWindows = 0,
    upcomingMaintenanceWindows = 0,
    maintenanceEnabled = false,
    readOnlyEnabled = false,
  } = opts;

  return {
    featureFlag: {
      count: jest.fn()
        .mockResolvedValueOnce(totalFeatureFlags)
        .mockResolvedValueOnce(enabledFeatureFlags),
    },
    maintenanceWindow: {
      count: jest.fn()
        .mockResolvedValueOnce(activeMaintenanceWindows)
        .mockResolvedValueOnce(upcomingMaintenanceWindows),
    },
    maintenanceConfig: {
      findUnique: jest.fn().mockResolvedValue(
        maintenanceEnabled || readOnlyEnabled
          ? { id: MAINTENANCE_SINGLETON_ID, enabled: maintenanceEnabled, readOnly: readOnlyEnabled }
          : null,
      ),
    },
  } as any;
}

describe('PrismaStatsService', () => {
  it('returns all-zero stats when DB is empty', async () => {
    const svc = new PrismaStatsService(makePrisma());
    const stats = await svc.getSystemStats();

    expect(stats.totalFeatureFlags).toBe(0);
    expect(stats.enabledFeatureFlags).toBe(0);
    expect(stats.disabledFeatureFlags).toBe(0);
    expect(stats.activeMaintenanceWindows).toBe(0);
    expect(stats.upcomingMaintenanceWindows).toBe(0);
    expect(stats.maintenanceEnabled).toBe(false);
    expect(stats.readOnlyEnabled).toBe(false);
    expect(stats.generatedAt).toBeInstanceOf(Date);
  });

  it('returns correct stats when data exists', async () => {
    const svc = new PrismaStatsService(makePrisma({
      totalFeatureFlags: 5,
      enabledFeatureFlags: 3,
      activeMaintenanceWindows: 1,
      upcomingMaintenanceWindows: 2,
      maintenanceEnabled: true,
    }));
    const stats = await svc.getSystemStats();

    expect(stats.totalFeatureFlags).toBe(5);
    expect(stats.enabledFeatureFlags).toBe(3);
    expect(stats.disabledFeatureFlags).toBe(2);
    expect(stats.activeMaintenanceWindows).toBe(1);
    expect(stats.upcomingMaintenanceWindows).toBe(2);
    expect(stats.maintenanceEnabled).toBe(true);
    expect(stats.readOnlyEnabled).toBe(false);
  });

  it('reflects readOnly from maintenance config', async () => {
    const svc = new PrismaStatsService(makePrisma({ readOnlyEnabled: true }));
    const stats = await svc.getSystemStats();
    expect(stats.readOnlyEnabled).toBe(true);
  });
});
