import { SetFeatureFlagUseCase } from './set-feature-flag.use-case';
import { FeatureFlag } from '@domain/entities/feature-flag/feature-flag.entity';
import type { FeatureFlagRepository } from '@domain/repositories/feature-flag.repository';
import type { ConfigCache } from '@application/ports/config-cache.port';
import type { AuditLogger } from '@application/ports/audit-logger.port';

function makeFlag(enabled: boolean): FeatureFlag {
  return new FeatureFlag({
    id: 'ff-1',
    key: 'new_dashboard',
    enabled,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeUseCase(existing: FeatureFlag | null = null) {
  const repo: FeatureFlagRepository = {
    findByKey: jest.fn().mockResolvedValue(existing),
    findAll: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockImplementation((f: FeatureFlag) => Promise.resolve(f)),
    delete: jest.fn().mockResolvedValue(undefined),
  };
  const cache: ConfigCache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn().mockResolvedValue(undefined),
    flush: jest.fn(),
  };
  const audit: AuditLogger = { log: jest.fn().mockResolvedValue(undefined) };
  return { uc: new SetFeatureFlagUseCase(repo, cache, audit), repo, cache, audit };
}

const dto = {
  key: 'new_dashboard',
  enabled: true,
  tenantId: 'tenant-1',
  role: 'admin',
  environment: 'production',
};

describe('SetFeatureFlagUseCase', () => {
  it('creates a new flag when none exists', async () => {
    const { uc, repo } = makeUseCase(null);
    const result = await uc.execute(dto);
    expect(result.key).toBe('new_dashboard');
    expect(result.enabled).toBe(true);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('updates existing flag when found', async () => {
    const existing = makeFlag(false);
    const { uc, repo } = makeUseCase(existing);
    const result = await uc.execute(dto);
    expect(result.enabled).toBe(true);
    expect(repo.save).toHaveBeenCalledWith(existing);
  });

  it('disables existing flag when enabled=false', async () => {
    const existing = makeFlag(true);
    const { uc } = makeUseCase(existing);
    const result = await uc.execute({ key: 'new_dashboard', enabled: false });
    expect(result.enabled).toBe(false);
  });

  it('invalidates cache after saving', async () => {
    const { uc, cache } = makeUseCase(null);
    await uc.execute(dto);
    expect(cache.del).toHaveBeenCalledTimes(1);
  });

  it('logs audit entry', async () => {
    const { uc, audit } = makeUseCase(null);
    await uc.execute(dto);
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'FEATURE_FLAG_ENABLED' }));
  });

  it('logs FEATURE_FLAG_DISABLED when disabling', async () => {
    const { uc, audit } = makeUseCase(null);
    await uc.execute({ key: 'x', enabled: false });
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'FEATURE_FLAG_DISABLED' }));
  });

  it('response includes all fields', async () => {
    const { uc } = makeUseCase(null);
    const result = await uc.execute(dto);
    expect(result).toMatchObject({
      key: 'new_dashboard',
      enabled: true,
      tenantId: 'tenant-1',
      role: 'admin',
      environment: 'production',
    });
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });
});
