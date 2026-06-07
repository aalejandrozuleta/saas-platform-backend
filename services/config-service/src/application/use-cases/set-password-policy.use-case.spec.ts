import { SetPasswordPolicyUseCase } from './set-password-policy.use-case';
import { PasswordPolicy } from '@domain/entities/password-policy/password-policy.entity';
import type { PasswordPolicyRepository } from '@domain/repositories/password-policy.repository';
import type { AuditLogger } from '@application/ports/audit-logger.port';

function makePolicy(): PasswordPolicy {
  return new PasswordPolicy({
    id: 'pp-1',
    tenantId: null,
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false,
    maxAgeDays: null,
    historyCount: 5,
    maxConcurrentSessions: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeUseCase(existing: PasswordPolicy | null = null) {
  const repo: PasswordPolicyRepository = {
    findByTenantId: jest.fn().mockResolvedValue(existing),
    save: jest.fn().mockImplementation((p: PasswordPolicy) => Promise.resolve(p)),
  };
  const audit: AuditLogger = { log: jest.fn().mockResolvedValue(undefined) };
  return { uc: new SetPasswordPolicyUseCase(repo, audit), repo, audit };
}

describe('SetPasswordPolicyUseCase', () => {
  it('creates global policy with defaults', async () => {
    const { uc, audit } = makeUseCase(null);
    const result = await uc.execute({});
    expect(result.tenantId).toBeNull();
    expect(result.minLength).toBe(8);
    expect(result.requireSymbols).toBe(false);
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'PASSWORD_POLICY_CREATED' }));
  });

  it('updates existing policy when found', async () => {
    const { uc, audit } = makeUseCase(makePolicy());
    const result = await uc.execute({ minLength: 12, requireSymbols: true });
    expect(result.minLength).toBe(12);
    expect(result.requireSymbols).toBe(true);
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'PASSWORD_POLICY_UPDATED' }));
  });

  it('creates tenant-specific policy', async () => {
    const { uc } = makeUseCase(null);
    const result = await uc.execute({ tenantId: 'tenant-1', maxConcurrentSessions: 5 });
    expect(result.tenantId).toBe('tenant-1');
    expect(result.maxConcurrentSessions).toBe(5);
  });

  it('response includes updatedAt as Date', async () => {
    const { uc } = makeUseCase(null);
    const result = await uc.execute({});
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('sets maxAgeDays when provided', async () => {
    const { uc } = makeUseCase(null);
    const result = await uc.execute({ maxAgeDays: 90 });
    expect(result.maxAgeDays).toBe(90);
  });
});
