import { AddIpRuleUseCase } from './add-ip-rule.use-case';
import { IpRule } from '@domain/entities/ip-rule/ip-rule.entity';
import { IpRuleType } from '@domain/enums/ip-rule-type.enum';
import { ErrorCode } from '@saas/shared';
import type { IpRuleRepository } from '@domain/repositories/ip-rule.repository';
import type { AuditLogger } from '@application/ports/audit-logger.port';

function makeRule(expired = false): IpRule {
  return new IpRule({
    id: 'r-1',
    ip: '1.2.3.4',
    type: IpRuleType.BLACKLIST,
    expiresAt: expired ? new Date(Date.now() - 1000) : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeRepo(existing: IpRule | null = null): IpRuleRepository {
  return {
    findByIpAndTenant: jest.fn().mockResolvedValue(existing),
    findById: jest.fn().mockResolvedValue(null),
    findAll: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockImplementation((r: IpRule) => Promise.resolve(r)),
    delete: jest.fn().mockResolvedValue(undefined),
  };
}

const audit: AuditLogger = { log: jest.fn().mockResolvedValue(undefined) };

const validDto = {
  ip: '1.2.3.4',
  type: IpRuleType.BLACKLIST,
  reason: 'abuse',
};

describe('AddIpRuleUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a new IP rule successfully', async () => {
    const uc = new AddIpRuleUseCase(makeRepo(), audit);
    const result = await uc.execute(validDto);

    expect(result.ip).toBe('1.2.3.4');
    expect(result.type).toBe(IpRuleType.BLACKLIST);
    expect(result.isActive).toBe(true);
    expect(result.id).toBeDefined();
  });

  it('throws VALIDATION_ERROR for invalid IP', async () => {
    const uc = new AddIpRuleUseCase(makeRepo(), audit);
    await expect(uc.execute({ ip: 'not-an-ip', type: IpRuleType.BLACKLIST }))
      .rejects.toMatchObject({ errorCode: ErrorCode.VALIDATION_ERROR });
  });

  it('throws CONFLICT when active rule already exists for same IP', async () => {
    const uc = new AddIpRuleUseCase(makeRepo(makeRule(false)), audit);
    await expect(uc.execute(validDto))
      .rejects.toMatchObject({ errorCode: ErrorCode.CONFLICT });
  });

  it('allows adding a new rule when existing rule is expired', async () => {
    const uc = new AddIpRuleUseCase(makeRepo(makeRule(true)), audit);
    const result = await uc.execute(validDto);
    expect(result.ip).toBe('1.2.3.4');
  });

  it('accepts IPv6 address', async () => {
    const uc = new AddIpRuleUseCase(makeRepo(), audit);
    const result = await uc.execute({ ip: '2001:db8::1', type: IpRuleType.WHITELIST });
    expect(result.ip).toBe('2001:db8::1');
  });

  it('accepts CIDR notation', async () => {
    const uc = new AddIpRuleUseCase(makeRepo(), audit);
    const result = await uc.execute({ ip: '192.168.1.0/24', type: IpRuleType.BLACKLIST });
    expect(result.ip).toBe('192.168.1.0/24');
  });

  it('logs audit with correct action for BLACKLIST', async () => {
    const auditMock: AuditLogger = { log: jest.fn().mockResolvedValue(undefined) };
    const uc = new AddIpRuleUseCase(makeRepo(), auditMock);
    await uc.execute(validDto);
    expect(auditMock.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'IP_RULE_BLACKLIST_ADDED' }));
  });

  it('logs audit with correct action for WHITELIST', async () => {
    const auditMock: AuditLogger = { log: jest.fn().mockResolvedValue(undefined) };
    const uc = new AddIpRuleUseCase(makeRepo(), auditMock);
    await uc.execute({ ip: '10.0.0.1', type: IpRuleType.WHITELIST });
    expect(auditMock.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'IP_RULE_WHITELIST_ADDED' }));
  });

  it('sets expiresAt when provided', async () => {
    const uc = new AddIpRuleUseCase(makeRepo(), audit);
    const result = await uc.execute({ ...validDto, expiresAt: '2099-12-31T23:59:59Z' });
    expect(result.expiresAt).toBeInstanceOf(Date);
  });
});
