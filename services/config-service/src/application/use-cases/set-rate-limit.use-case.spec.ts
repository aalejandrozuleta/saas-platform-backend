import { SetRateLimitUseCase } from './set-rate-limit.use-case';
import { RateLimit } from '@domain/entities/rate-limit/rate-limit.entity';
import type { RateLimitRepository } from '@domain/repositories/rate-limit.repository';
import type { ConfigCache } from '@application/ports/config-cache.port';
import type { AuditLogger } from '@application/ports/audit-logger.port';

function makeRL(): RateLimit {
  return new RateLimit({
    id: 'rl-1',
    endpoint: '/api/auth/login',
    maxRequests: 10,
    windowSeconds: 60,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeUseCase(existing: RateLimit | null = null) {
  const repo: RateLimitRepository = {
    findByEndpointAndTenant: jest.fn().mockResolvedValue(existing),
    findById: jest.fn().mockResolvedValue(null),
    findAll: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockImplementation((r: RateLimit) => Promise.resolve(r)),
    delete: jest.fn().mockResolvedValue(undefined),
  };
  const cache: ConfigCache = {
    get: jest.fn(), set: jest.fn(),
    del: jest.fn().mockResolvedValue(undefined),
    flush: jest.fn(),
  };
  const audit: AuditLogger = { log: jest.fn().mockResolvedValue(undefined) };
  return { uc: new SetRateLimitUseCase(repo, cache, audit), repo, cache, audit };
}

const dto = { endpoint: '/api/auth/login', maxRequests: 10, windowSeconds: 60 };

describe('SetRateLimitUseCase', () => {
  it('creates a new rate limit', async () => {
    const { uc, audit } = makeUseCase(null);
    const result = await uc.execute(dto);
    expect(result.endpoint).toBe('/api/auth/login');
    expect(result.maxRequests).toBe(10);
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'RATE_LIMIT_CREATED' }));
  });

  it('updates existing rate limit', async () => {
    const { uc, audit } = makeUseCase(makeRL());
    const result = await uc.execute({ ...dto, maxRequests: 20 });
    expect(result.maxRequests).toBe(20);
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'RATE_LIMIT_UPDATED' }));
  });

  it('invalidates cache', async () => {
    const { uc, cache } = makeUseCase(null);
    await uc.execute(dto);
    expect(cache.del).toHaveBeenCalledWith(expect.stringContaining('/api/auth/login'));
  });

  it('sets tenantId to null when not provided', async () => {
    const { uc } = makeUseCase(null);
    const result = await uc.execute(dto);
    expect(result.tenantId).toBeNull();
  });

  it('accepts tenantId', async () => {
    const { uc } = makeUseCase(null);
    const result = await uc.execute({ ...dto, tenantId: 'tenant-1' });
    expect(result.tenantId).toBe('tenant-1');
  });
});
