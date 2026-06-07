import { PasswordPolicy } from './password-policy.entity';

function makePolicy(): PasswordPolicy {
  return new PasswordPolicy({
    id: 'pp-1',
    tenantId: null,
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false,
    maxAgeDays: 90,
    historyCount: 5,
    maxConcurrentSessions: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('PasswordPolicy', () => {
  it('constructs with all properties', () => {
    const p = makePolicy();
    expect(p.minLength).toBe(8);
    expect(p.requireUppercase).toBe(true);
    expect(p.requireSymbols).toBe(false);
    expect(p.maxAgeDays).toBe(90);
    expect(p.historyCount).toBe(5);
    expect(p.maxConcurrentSessions).toBe(3);
    expect(p.tenantId).toBeNull();
  });

  it('sets maxAgeDays to null when not provided', () => {
    const p = new PasswordPolicy({
      id: 'pp-2', tenantId: null, minLength: 6,
      requireUppercase: false, requireLowercase: true,
      requireNumbers: false, requireSymbols: false,
      historyCount: 0, maxConcurrentSessions: 1,
      createdAt: new Date(), updatedAt: new Date(),
    });
    expect(p.maxAgeDays).toBeNull();
  });

  it('update() patches only provided fields', () => {
    const p = makePolicy();
    p.update({ minLength: 12, requireSymbols: true });
    expect(p.minLength).toBe(12);
    expect(p.requireSymbols).toBe(true);
    expect(p.requireUppercase).toBe(true);
  });

  it('update() sets maxAgeDays to null when passed null', () => {
    const p = makePolicy();
    p.update({ maxAgeDays: null });
    expect(p.maxAgeDays).toBeNull();
  });

  it('toSnapshot() returns all fields', () => {
    const snap = makePolicy().toSnapshot();
    expect(snap.minLength).toBe(8);
    expect(snap.maxAgeDays).toBe(90);
  });
});
