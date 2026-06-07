import { GetSystemStatsUseCase } from './get-system-stats.use-case';
import type { StatsPort, SystemStats } from '@application/ports/stats.port';

const mockStats: SystemStats = {
  totalConfigs: 10,
  totalFeatureFlags: 5,
  enabledFeatureFlags: 3,
  totalTenants: 8,
  activeTenants: 7,
  totalIpRules: 4,
  activeMaintenanceWindows: 0,
  totalRateLimits: 6,
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
