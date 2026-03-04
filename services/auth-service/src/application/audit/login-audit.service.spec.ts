import { AuditLogger } from '@application/ports/audit-logger.port';
import { AuditCategory } from '@domain/audit/audit-category.enum';
import { LoginContext } from '@domain/value-objects/login-context.vo';

import { AuthAuditEvent } from './auth-events.enum';
import { LoginAuditService } from './login-audit.service';

describe('LoginAuditService', () => {
  let service: LoginAuditService;
  let auditLogger: jest.Mocked<AuditLogger>;

  const context = LoginContext.create({
    ip: '127.0.0.1',
    country: 'CO',
    deviceFingerprint: 'device-123',
  });

  beforeEach(() => {
    auditLogger = {
      log: jest.fn(),
    };

    service = new LoginAuditService(auditLogger);
  });

  it('debe registrar loginAttempted', async () => {
    await service.loginAttempted('test@example.com', context);

    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        category: AuditCategory.AUTH,
        event: AuthAuditEvent.LOGIN_ATTEMPT,
        userId: null,
        ip: context.ip,
        country: context.country,
        deviceFingerprint: context.deviceFingerprint,
        metadata: { email: 'test@example.com' },
      }),
    );
  });

  it('debe registrar loginSucceeded', async () => {
    await service.loginSucceeded(
      'user-1',
      context,
      'session-1',
    );

    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        category: AuditCategory.AUTH,
        event: AuthAuditEvent.LOGIN_SUCCESS,
        userId: 'user-1',
        metadata: { sessionId: 'session-1' },
      }),
    );
  });

  it('debe registrar loginFailed', async () => {
    await service.loginFailed(
      'user-1',
      context,
      'INVALID_PASSWORD',
    );

    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        category: AuditCategory.AUTH,
        event: AuthAuditEvent.LOGIN_FAILED,
        userId: 'user-1',
        reason: 'INVALID_PASSWORD',
      }),
    );
  });

  it('debe registrar loginBlocked', async () => {
    const blockedUntil = new Date();

    await service.loginBlocked(
      'user-1',
      context,
      blockedUntil,
    );

    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        event: AuthAuditEvent.LOGIN_BLOCKED,
        metadata: { blockedUntil },
      }),
    );
  });

  it('debe registrar deviceNotTrusted', async () => {
    await service.deviceNotTrusted('user-1', context);

    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        event:
          AuthAuditEvent.LOGIN_DEVICE_NOT_TRUSTED,
        userId: 'user-1',
      }),
    );
  });

  it('debe registrar countryNotTrusted', async () => {
    await service.countryNotTrusted('user-1', context);

    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        event:
          AuthAuditEvent.LOGIN_COUNTRY_NOT_TRUSTED,
        userId: 'user-1',
      }),
    );
  });

  it('debe propagar errores del auditLogger', async () => {
    auditLogger.log.mockRejectedValue(
      new Error('audit failure'),
    );

    await expect(
      service.loginAttempted('x', context),
    ).rejects.toThrow('audit failure');
  });
});