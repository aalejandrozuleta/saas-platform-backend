import { ErrorCode } from '@saas/shared';
import { DomainErrorFactory } from './domain-error.factory';

describe('DomainErrorFactory', () => {
  it('configKeyNotFound returns NOT_FOUND with key in message', () => {
    const err = DomainErrorFactory.configKeyNotFound('my.key');
    expect(err.errorCode).toBe(ErrorCode.NOT_FOUND);
    expect(err.message).toContain('my.key');
  });

  it('featureFlagNotFound returns NOT_FOUND', () => {
    const err = DomainErrorFactory.featureFlagNotFound('flag_x');
    expect(err.errorCode).toBe(ErrorCode.NOT_FOUND);
    expect(err.message).toContain('flag_x');
  });

  it('tenantConfigNotFound returns NOT_FOUND', () => {
    const err = DomainErrorFactory.tenantConfigNotFound('tenant-1');
    expect(err.errorCode).toBe(ErrorCode.NOT_FOUND);
    expect(err.message).toContain('tenant-1');
  });

  it('ipRuleAlreadyExists returns CONFLICT', () => {
    const err = DomainErrorFactory.ipRuleAlreadyExists('1.2.3.4');
    expect(err.errorCode).toBe(ErrorCode.CONFLICT);
    expect(err.message).toContain('1.2.3.4');
  });

  it('ipRuleNotFound returns NOT_FOUND', () => {
    const err = DomainErrorFactory.ipRuleNotFound('rule-id');
    expect(err.errorCode).toBe(ErrorCode.NOT_FOUND);
  });

  it('maintenanceWindowNotFound returns NOT_FOUND', () => {
    const err = DomainErrorFactory.maintenanceWindowNotFound('win-id');
    expect(err.errorCode).toBe(ErrorCode.NOT_FOUND);
  });

  it('maintenanceWindowOverlap returns CONFLICT', () => {
    const err = DomainErrorFactory.maintenanceWindowOverlap();
    expect(err.errorCode).toBe(ErrorCode.CONFLICT);
  });

  it('invalidDateRange returns VALIDATION_ERROR', () => {
    const err = DomainErrorFactory.invalidDateRange();
    expect(err.errorCode).toBe(ErrorCode.VALIDATION_ERROR);
  });

  it('rateLimitNotFound returns NOT_FOUND', () => {
    const err = DomainErrorFactory.rateLimitNotFound('rl-id');
    expect(err.errorCode).toBe(ErrorCode.NOT_FOUND);
  });

  it('allowedDomainAlreadyExists returns CONFLICT', () => {
    const err = DomainErrorFactory.allowedDomainAlreadyExists('example.com');
    expect(err.errorCode).toBe(ErrorCode.CONFLICT);
    expect(err.message).toContain('example.com');
  });

  it('allowedDomainNotFound returns NOT_FOUND', () => {
    const err = DomainErrorFactory.allowedDomainNotFound('missing.com');
    expect(err.errorCode).toBe(ErrorCode.NOT_FOUND);
  });

  it('invalidIpAddress returns VALIDATION_ERROR', () => {
    const err = DomainErrorFactory.invalidIpAddress('not-an-ip');
    expect(err.errorCode).toBe(ErrorCode.VALIDATION_ERROR);
    expect(err.message).toContain('not-an-ip');
  });
});
