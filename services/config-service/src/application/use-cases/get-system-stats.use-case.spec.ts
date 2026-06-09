import type { StatsPort, SystemStats } from '@application/ports/stats.port';

import { GetSystemStatsUseCase } from './get-system-stats.use-case';

const mockStats: SystemStats = {
  totalFeatureFlags: 5,
  enabledFeatureFlags: 3,
  disabledFeatureFlags: 2,
  activeMaintenanceWindows: 0,
  upcomingMaintenanceWindows: 1,
  maintenanceEnabled: false,
  readOnlyEnabled: false,
  generatedAt: new Date(),
};

describe('GetSystemStatsUseCase', () => {
  it('delegates to StatsPort and returns the result', async () => {
    const statsPort: StatsPort = {
      getSystemStats: jest.fn().mockResolvedValue(mockStats),
    };
    const uc = new GetSystemStatsUseCase(statsPort);
    const result = await uc.execute();

    expect(result).toEqual(mockStats);
    expect(statsPort.getSystemStats).toHaveBeenCalledTimes(1);
  });

  it('propagates errors from StatsPort', async () => {
    const statsPort: StatsPort = {
      getSystemStats: jest.fn().mockRejectedValue(new Error('DB unavailable')),
    };
    const uc = new GetSystemStatsUseCase(statsPort);
    await expect(uc.execute()).rejects.toThrow('DB unavailable');
  });
});
