import { FeatureFlag } from './feature-flag.entity';

function makeFlag(enabled = false): FeatureFlag {
  return new FeatureFlag({
    id: 'ff-1',
    key: 'new_dashboard',
    enabled,
    tenantId: 'tenant-1',
    role: 'admin',
    environment: 'production',
    description: 'New dashboard UI',
    metadata: { rollout: 50 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });
}

describe('FeatureFlag', () => {
  it('constructs correctly', () => {
    const flag = makeFlag();
    expect(flag.id).toBe('ff-1');
    expect(flag.key).toBe('new_dashboard');
    expect(flag.enabled).toBe(false);
    expect(flag.tenantId).toBe('tenant-1');
  });

  it('sets optional fields to null when omitted', () => {
    const flag = new FeatureFlag({
      id: 'ff-2',
      key: 'x',
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(flag.tenantId).toBeNull();
    expect(flag.role).toBeNull();
    expect(flag.environment).toBeNull();
    expect(flag.description).toBeNull();
    expect(flag.metadata).toBeNull();
  });

  it('enable() activates the flag', () => {
    const flag = makeFlag(false);
    flag.enable();
    expect(flag.enabled).toBe(true);
  });

  it('disable() deactivates the flag', () => {
    const flag = makeFlag(true);
    flag.disable();
    expect(flag.enabled).toBe(false);
  });

  it('toggle() inverts state', () => {
    const flag = makeFlag(false);
    flag.toggle();
    expect(flag.enabled).toBe(true);
    flag.toggle();
    expect(flag.enabled).toBe(false);
  });

  it('toggle() updates updatedAt', () => {
    const flag = makeFlag();
    const before = flag.updatedAt.getTime();
    flag.toggle();
    expect(flag.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('toSnapshot() returns all fields', () => {
    const flag = makeFlag(true);
    const snap = flag.toSnapshot();
    expect(snap.key).toBe('new_dashboard');
    expect(snap.enabled).toBe(true);
    expect(snap.metadata).toEqual({ rollout: 50 });
  });
});
