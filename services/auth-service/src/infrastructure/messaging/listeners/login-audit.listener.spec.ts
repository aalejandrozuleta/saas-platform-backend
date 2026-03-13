import { type LoginAuditService } from '@application/audit/login-audit.service';
import { LoginSucceededEvent } from '@application/events/login/login-succeeded.event';

import { LoginSucceededAuditListener } from './login-audit.listener';



describe('LoginSucceededAuditListener', () => {
  let listener: LoginSucceededAuditListener;

  let auditService: {
    loginSucceeded: jest.Mock;
  };

  beforeEach(() => {
    auditService = {
      loginSucceeded: jest.fn(),
    };

    listener = new LoginSucceededAuditListener(
      auditService as unknown as LoginAuditService,
    );
  });

  describe('handle', () => {
    it('debería registrar auditoría cuando ocurre un login exitoso', async () => {
      const event = new LoginSucceededEvent(
        'user-1',
        { ip: '127.0.0.1' } as any,
        'session-1',
      );

      await listener.handle(event);

      expect(auditService.loginSucceeded).toHaveBeenCalledTimes(1);
      expect(auditService.loginSucceeded).toHaveBeenCalledWith(
        event.userId,
        event.context,
        event.sessionId,
      );
    });

    it('debería propagar errores del servicio de auditoría', async () => {
      const event = new LoginSucceededEvent(
        'user-1',
        { ip: '127.0.0.1' } as any,
        'session-1',
      );

      auditService.loginSucceeded.mockRejectedValue(
        new Error('Audit failure'),
      );

      await expect(listener.handle(event)).rejects.toThrow(
        'Audit failure',
      );
    });
  });
});