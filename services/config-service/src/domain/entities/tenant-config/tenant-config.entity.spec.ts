import { PlanType } from '@domain/enums/plan-type.enum';
import { TenantConfig } from './tenant-config.entity';

function makeTenant(): TenantConfig {
  return new TenantConfig({
    id: 'tc-1',
    tenantId: 'tenant-abc',
    name: 'Acme Corp',
    logoUrl: 'https://acme.com/logo.png',
    language: 'es',
    timezone: 'America/Bogota',
    plan: PlanType.FREE,
    maxUsers: 5,
    maxStorage: 1024,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });
}

describe('TenantConfig', () => {
  it('constructs with all properties', () => {
    const t = makeTenant();
    expect(t.tenantId).toBe('tenant-abc');
    expect(t.name).toBe('Acme Corp');
    expect(t.plan).toBe(PlanType.FREE);
    expect(t.isActive).toBe(true);
  });

  it('upgrade() changes plan and limits', () => {
    const t = makeTenant();
    t.upgrade(PlanType.PRO, 50, 10240);
    expect(t.plan).toBe(PlanType.PRO);
    expect(t.maxUsers).toBe(50);
    expect(t.maxStorage).toBe(10240);
  });

  it('deactivate() sets isActive to false', () => {
    const t = makeTenant();
    t.deactivate();
    expect(t.isActive).toBe(false);
  });

  it('activate() sets isActive to true', () => {
    const t = makeTenant();
    t.deactivate();
    t.activate();
    expect(t.isActive).toBe(true);
  });

  it('update() patches only provided fields', () => {
    const t = makeTenant();
    t.update({ language: 'en' });
    expect(t.language).toBe('en');
    expect(t.name).toBe('Acme Corp');
  });

  it('update() sets nullable fields to null when passed null', () => {
    const t = makeTenant();
    t.update({ logoUrl: null });
    expect(t.logoUrl).toBeNull();
  });

  it('toSnapshot() returns all fields', () => {
    const snap = makeTenant().toSnapshot();
    expect(snap.tenantId).toBe('tenant-abc');
    expect(snap.language).toBe('es');
  });
});
