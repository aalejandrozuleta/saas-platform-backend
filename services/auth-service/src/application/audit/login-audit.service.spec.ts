import { AuditLogger } from '@application/ports/audit-logger.port';
import { LoginContext } from '@domain/value-objects/login-context.vo';
import { LoginChallengeReason } from '@application/security/login-challenge.types';

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
        service: 'auth-service',
        category: 'AUTH',
        action: AuthAuditEvent.LOGIN_ATTEMPT,
        outcome: 'INFO',
        summary: 'Intento de inicio de sesión',
        actor: expect.objectContaining({
          type: 'ANONYMOUS',
          email: 'test@example.com',
        }),
        context: {
          ip: context.ip,
          country: context.country,
          deviceFingerprint: context.deviceFingerprint,
        },
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
        action: AuthAuditEvent.LOGIN_SUCCESS,
        outcome: 'SUCCESS',
        actor: expect.objectContaining({
          id: 'user-1',
          type: 'USER',
        }),
        metadata: { sessionId: 'session-1' },
      }),
    );
  });

  it('debe registrar loginFailed', async () => {
    await service.loginFailed(
      'user-1',
      context,
      'INVALID_PASSWORD',
      'test@example.com',
    );

    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuthAuditEvent.LOGIN_FAILED,
        outcome: 'FAILURE',
        actor: expect.objectContaining({
          id: 'user-1',
          type: 'USER',
          email: 'test@example.com',
        }),
        reason: 'INVALID_PASSWORD',
        summary:
          'Inicio de sesión fallido por contraseña incorrecta',
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
        action: AuthAuditEvent.LOGIN_BLOCKED,
        outcome: 'BLOCKED',
        metadata: { blockedUntil },
      }),
    );
  });

  it('debe registrar deviceNotTrusted', async () => {
    await service.deviceNotTrusted('user-1', context);

    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action:
          AuthAuditEvent.LOGIN_DEVICE_NOT_TRUSTED,
        outcome: 'REJECTED',
        actor: expect.objectContaining({
          id: 'user-1',
        }),
      }),
    );
  });

  it('debe registrar countryNotTrusted', async () => {
    await service.countryNotTrusted('user-1', context);

    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action:
          AuthAuditEvent.LOGIN_COUNTRY_NOT_TRUSTED,
        outcome: 'REJECTED',
        actor: expect.objectContaining({
          id: 'user-1',
        }),
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

  it('debe registrar securityChallengeRequired', async () => {
    await service.securityChallengeRequired({
      userId: 'user-1',
      email: 'test@example.com',
      context: {
        ip: '127.0.0.1',
      },
      reason: LoginChallengeReason.UNTRUSTED_DEVICE,
    });

    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action:
          AuthAuditEvent.LOGIN_SECURITY_CHALLENGE_REQUIRED,
        outcome: 'REJECTED',
        reason: LoginChallengeReason.UNTRUSTED_DEVICE,
      }),
    );
  });

  it('debe registrar internalServerError', async () => {
    await service.internalServerError({
      action: AuthAuditEvent.INTERNAL_ERROR,
      summary: 'Error interno del servidor en auth-service',
      actor: {
        email: 'test@example.com',
      },
    });

    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuthAuditEvent.INTERNAL_ERROR,
        outcome: 'FAILURE',
        reason: 'INTERNAL_ERROR',
      }),
    );
  });
});
