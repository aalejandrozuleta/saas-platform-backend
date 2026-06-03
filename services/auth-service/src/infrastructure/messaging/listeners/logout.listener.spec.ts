import { type AuditLogger } from '@application/ports/audit-logger.port';
import { LogoutEvent } from '@application/events/logout/logout.event';
import { LogoutAllEvent } from '@application/events/logout/logout-all.event';
import { AuthAuditEvent } from '@application/audit/auth-events.enum';

import { LogoutListener } from './logout.listener';

describe('LogoutListener', () => {
  let listener: LogoutListener;
  let auditLogger: jest.Mocked<AuditLogger>;

  const context = { ip: '127.0.0.1', country: 'CO' };

  beforeEach(() => {
    auditLogger = { log: jest.fn() } as any;
    listener = new LogoutListener(auditLogger);
  });

  describe('handleLogout', () => {
    it('debe registrar en auditoría el cierre de sesión individual', async () => {
      const event = new LogoutEvent('user-1', 'session-1', context);

      await listener.handleLogout(event);

      expect(auditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuthAuditEvent.LOGOUT,
          outcome: 'SUCCESS',
          actor: expect.objectContaining({ id: 'user-1', type: 'USER' }),
          metadata: expect.objectContaining({ sessionId: 'session-1' }),
          context: expect.objectContaining({ ip: '127.0.0.1', country: 'CO' }),
        }),
      );
    });
  });

  describe('handleLogoutAll', () => {
    it('debe registrar en auditoría el cierre de todas las sesiones', async () => {
      const event = new LogoutAllEvent('user-2', 3, context);

      await listener.handleLogoutAll(event);

      expect(auditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuthAuditEvent.LOGOUT_ALL,
          outcome: 'SUCCESS',
          actor: expect.objectContaining({ id: 'user-2', type: 'USER' }),
          metadata: expect.objectContaining({ revokedCount: 3 }),
        }),
      );
    });

    it('debe incluir el número de sesiones en el summary', async () => {
      const event = new LogoutAllEvent('user-3', 5, context);

      await listener.handleLogoutAll(event);

      const report = auditLogger.log.mock.calls[0][0];
      expect(report.summary).toContain('5');
    });
  });
});
