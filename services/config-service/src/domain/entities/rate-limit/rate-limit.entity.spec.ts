import { RateLimit } from './rate-limit.entity';

function makeRL(): RateLimit {
  return new RateLimit({
    id: 'rl-1',
    endpoint: '/api/auth/login',
    maxRequests: 10,
    windowSeconds: 60,
    tenantId: 'tenant-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('RateLimit', () => {
  it('constructs correctly', () => {
    const rl = makeRL();
    expect(rl.endpoint).toBe('/api/auth/login');
    expect(rl.maxRequests).toBe(10);
    expect(rl.windowSeconds).toBe(60);
    expect(rl.isActive).toBe(true);
  });

  it('tenantId is null when not provided', () => {
    const rl = new RateLimit({
      id: 'rl-2', endpoint: '/x', maxRequests: 5,
      windowSeconds: 30, isActive: true,
      createdAt: new Date(), updatedAt: new Date(),
    });
    expect(rl.tenantId).toBeNull();
  });

  it('update() changes limits', () => {
    const rl = makeRL();
    rl.update(20, 120);
    expect(rl.maxRequests).toBe(20);
    expect(rl.windowSeconds).toBe(120);
  });

  it('deactivate() sets isActive false', () => {
    const rl = makeRL();
    rl.deactivate();
    expect(rl.isActive).toBe(false);
  });

  it('toSnapshot() returns all fields', () => {
    const snap = makeRL().toSnapshot();
    expect(snap.endpoint).toBe('/api/auth/login');
    expect(snap.isActive).toBe(true);
  });
});
