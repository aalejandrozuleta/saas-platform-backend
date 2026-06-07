import { StatsController } from './stats.controller';
import type { GetSystemStatsUseCase } from '@application/use-cases/get-system-stats.use-case';

const mockStats = {
  totalConfigs: 10, totalFeatureFlags: 5, enabledFeatureFlags: 3,
  totalTenants: 8, activeTenants: 7, totalIpRules: 4,
  activeMaintenanceWindows: 0, totalRateLimits: 6, generatedAt: new Date(),
};

describe('StatsController', () => {
  it('getStats() calls use case and wraps result', async () => {
    const uc = { execute: jest.fn().mockResolvedValue(mockStats) } as unknown as GetSystemStatsUseCase;
    const ctrl = new StatsController(uc);
    const result = await ctrl.getStats();
    expect(result.data).toEqual(mockStats);
    expect(uc.execute).toHaveBeenCalledTimes(1);
  });
});
