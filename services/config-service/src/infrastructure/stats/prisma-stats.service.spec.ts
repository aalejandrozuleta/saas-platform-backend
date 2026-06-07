import { PrismaStatsService } from './prisma-stats.service';

function makePrisma(counts: Partial<Record<string, number>> = {}) {
  const defaultCount = 0;
  const mockCount = (val: number) => jest.fn().mockResolvedValue(val);

  return {
    appConfig: { count: mockCount(counts.totalConfigs ?? defaultCount) },
    featureFlag: {
      count: jest.fn()
        .mockResolvedValueOnce(counts.totalFeatureFlags ?? defaultCount)
        .mockResolvedValueOnce(counts.enabledFeatureFlags ?? defaultCount),
    },
    tenantConfig: {
      count: jest.fn()
        .mockResolvedValueOnce(counts.totalTenants ?? defaultCount)
        .mockResolvedValueOnce(counts.activeTenants ?? defaultCount),
    },
    ipRule: { count: mockCount(counts.totalIpRules ?? defaultCount) },
    maintenanceWindow: { count: mockCount(counts.activeMaintenanceWindows ?? defaultCount) },
    rateLimitConfig: { count: mockCount(counts.totalRateLimits ?? defaultCount) },
  } as any;
}

describe('PrismaStatsService', () => {
  it('returns all zero stats when DB is empty', async () => {
    const svc = new PrismaStatsService(makePrisma());
    const stats = await svc.getSystemStats();

    expect(stats.totalConfigs).toBe(0);
    expect(stats.totalFeatureFlags).toBe(0);
    expect(stats.enabledFeatureFlags).toBe(0);
    expect(stats.totalTenants).toBe(0);
    expect(stats.activeTenants).toBe(0);
    expect(stats.totalIpRules).toBe(0);
    expect(stats.activeMaintenanceWindows).toBe(0);
    expect(stats.totalRateLimits).toBe(0);
    expect(stats.generatedAt).toBeInstanceOf(Date);
  });

  it('returns correct stats when data exists', async () => {
    const svc = new PrismaStatsService(makePrisma({
      totalConfigs: 10,
      totalFeatureFlags: 5,
      enabledFeatureFlags: 3,
      totalTenants: 8,
      activeTenants: 7,
      totalIpRules: 4,
      activeMaintenanceWindows: 1,
      totalRateLimits: 6,
    }));
    const stats = await svc.getSystemStats();

    expect(stats.totalConfigs).toBe(10);
    expect(stats.totalFeatureFlags).toBe(5);
    expect(stats.enabledFeatureFlags).toBe(3);
    expect(stats.totalTenants).toBe(8);
    expect(stats.activeTenants).toBe(7);
    expect(stats.activeMaintenanceWindows).toBe(1);
    expect(stats.totalRateLimits).toBe(6);
  });
});
