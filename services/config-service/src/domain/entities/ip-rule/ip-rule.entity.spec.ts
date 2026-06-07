import { IpRuleType } from '@domain/enums/ip-rule-type.enum';
import { IpRule } from './ip-rule.entity';

function makeRule(expiresAt: Date | null = null): IpRule {
  return new IpRule({
    id: 'r-1',
    ip: '192.168.1.1',
    type: IpRuleType.BLACKLIST,
    tenantId: 'tenant-1',
    reason: 'abuse',
    expiresAt,
    createdBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('IpRule', () => {
  it('constructs with all properties', () => {
    const r = makeRule();
    expect(r.ip).toBe('192.168.1.1');
    expect(r.type).toBe(IpRuleType.BLACKLIST);
    expect(r.reason).toBe('abuse');
  });

  it('sets optional fields to null when omitted', () => {
    const r = new IpRule({
      id: 'r-2',
      ip: '10.0.0.1',
      type: IpRuleType.WHITELIST,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(r.cidr).toBeNull();
    expect(r.tenantId).toBeNull();
    expect(r.reason).toBeNull();
    expect(r.expiresAt).toBeNull();
    expect(r.createdBy).toBeNull();
  });

  it('isExpired() returns false when no expiresAt', () => {
    expect(makeRule(null).isExpired()).toBe(false);
  });

  it('isExpired() returns true when expiresAt is in the past', () => {
    const past = new Date(Date.now() - 1000);
    expect(makeRule(past).isExpired()).toBe(true);
  });

  it('isExpired() returns false when expiresAt is in the future', () => {
    const future = new Date(Date.now() + 60_000);
    expect(makeRule(future).isExpired()).toBe(false);
  });

  it('isActive() is the inverse of isExpired()', () => {
    const past = new Date(Date.now() - 1000);
    const future = new Date(Date.now() + 60_000);
    expect(makeRule(past).isActive()).toBe(false);
    expect(makeRule(future).isActive()).toBe(true);
    expect(makeRule(null).isActive()).toBe(true);
  });

  it('toSnapshot() returns all fields', () => {
    const snap = makeRule().toSnapshot();
    expect(snap.ip).toBe('192.168.1.1');
    expect(snap.type).toBe(IpRuleType.BLACKLIST);
  });
});
