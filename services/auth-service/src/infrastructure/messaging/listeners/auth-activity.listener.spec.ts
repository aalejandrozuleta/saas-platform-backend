import type { LoginAuditService } from '@application/audit/login-audit.service';
import { LoginAttemptedEvent } from '@application/events/login/login-attempted.event';
import { LoginBlockedEvent } from '@application/events/login/login-blocked.event';
import { LoginFailedEvent } from '@application/events/login/login-failed.event';
import { LoginSucceededEvent } from '@application/events/login/login-succeeded.event';

import { AuthActivityListener } from './auth-activity.listener';

describe('AuthActivityListener', () => {
  let listener: AuthActivityListener;

  let auditService: {
    loginAttempted: jest.Mock;
    loginSucceeded: jest.Mock;
    loginFailed: jest.Mock;
    loginBlocked: jest.Mock;
  };

  beforeEach(() => {
    auditService = {
      loginAttempted: jest.fn(),
      loginSucceeded: jest.fn(),
      loginFailed: jest.fn(),
      loginBlocked: jest.fn(),
    };

    listener = new AuthActivityListener(
      auditService as unknown as LoginAuditService,
    );
  });

  it('debe registrar login attempted', async () => {
    const event = new LoginAttemptedEvent(
      'test@example.com',
      { ip: '127.0.0.1' } as any,
    );

    await listener.handleAttempted(event);

    expect(auditService.loginAttempted).toHaveBeenCalledWith(
      event.email,
      event.context,
    );
  });

  it('debe registrar login succeeded', async () => {
    const event = new LoginSucceededEvent(
      'user-1',
      { ip: '127.0.0.1' } as any,
      'session-1',
    );

    await listener.handleSucceeded(event);

    expect(auditService.loginSucceeded).toHaveBeenCalledWith(
      event.userId,
      event.context,
      event.sessionId,
    );
  });

  it('debe registrar login failed', async () => {
    const event = new LoginFailedEvent(
      'user-1',
      'test@example.com',
      { ip: '127.0.0.1' } as any,
      'INVALID_PASSWORD',
    );

    await listener.handleFailed(event);

    expect(auditService.loginFailed).toHaveBeenCalledWith(
      event.userId,
      event.context,
      event.reason,
      event.email,
    );
  });

  it('debe registrar login blocked', async () => {
    const blockedUntil = new Date();
    const event = new LoginBlockedEvent(
      'user-1',
      { ip: '127.0.0.1' } as any,
      blockedUntil,
    );

    await listener.handleBlocked(event);

    expect(auditService.loginBlocked).toHaveBeenCalledWith(
      event.userId,
      event.context,
      event.blockedUntil,
    );
  });
});
