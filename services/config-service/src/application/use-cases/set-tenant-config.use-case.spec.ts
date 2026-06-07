import { SetTenantConfigUseCase } from './set-tenant-config.use-case';
import { TenantConfig } from '@domain/entities/tenant-config/tenant-config.entity';
import { PlanType } from '@domain/enums/plan-type.enum';
import type { TenantConfigRepository } from '@domain/repositories/tenant-config.repository';
import type { AuditLogger } from '@application/ports/audit-logger.port';

function makeTenantConfig(): TenantConfig {
  return new TenantConfig({
    id: 'tc-1',
    tenantId: 'tenant-1',
    name: 'Old Name',
    language: 'es',
    timezone: 'UTC',
    plan: PlanType.FREE,
    maxUsers: 5,
    maxStorage: 1024,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeUseCase(existing: TenantConfig | null = null) {
  const repo: TenantConfigRepository = {
    findByTenantId: jest.fn().mockResolvedValue(existing),
    findAll: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockImplementation((c: TenantConfig) => Promise.resolve(c)),
    delete: jest.fn().mockResolvedValue(undefined),
  };
  const audit: AuditLogger = { log: jest.fn().mockResolvedValue(undefined) };
  return { uc: new SetTenantConfigUseCase(repo, audit), repo, audit };
}

describe('SetTenantConfigUseCase', () => {
  it('creates new tenant config with defaults', async () => {
    const { uc, audit } = makeUseCase(null);
    const result = await uc.execute({ tenantId: 'tenant-new' });

    expect(result.tenantId).toBe('tenant-new');
    expect(result.plan).toBe(PlanType.FREE);
    expect(result.maxUsers).toBe(5);
    expect(result.language).toBe('es');
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'TENANT_CONFIG_CREATED' }));
  });

  it('updates existing config name', async () => {
    const { uc, audit } = makeUseCase(makeTenantConfig());
    const result = await uc.execute({ tenantId: 'tenant-1', name: 'New Name' });

    expect(result.name).toBe('New Name');
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'TENANT_CONFIG_UPDATED' }));
  });

  it('upgrades plan when plan is provided on existing config', async () => {
    const { uc } = makeUseCase(makeTenantConfig());
    const result = await uc.execute({ tenantId: 'tenant-1', plan: PlanType.PRO, maxUsers: 100 });

    expect(result.plan).toBe(PlanType.PRO);
    expect(result.maxUsers).toBe(100);
  });

  it('deactivates tenant when isActive=false', async () => {
    const { uc } = makeUseCase(makeTenantConfig());
    const result = await uc.execute({ tenantId: 'tenant-1', isActive: false });
    expect(result.isActive).toBe(false);
  });

  it('activates tenant when isActive=true', async () => {
    const existing = makeTenantConfig();
    existing.deactivate();
    const { uc } = makeUseCase(existing);
    const result = await uc.execute({ tenantId: 'tenant-1', isActive: true });
    expect(result.isActive).toBe(true);
  });

  it('response includes all fields', async () => {
    const { uc } = makeUseCase(null);
    const result = await uc.execute({ tenantId: 'tenant-x' });
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
  });
});
