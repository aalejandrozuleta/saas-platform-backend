import { type PlatformLogger } from '@saas/shared';
import { LoginSucceededEvent } from '@application/events/login/login-succeeded.event';

import { LoginLoggingListener } from './login-logging.listener';

describe('LoginLoggingListener', () => {
  let listener: LoginLoggingListener;

  let logger: {
    info: jest.Mock;
  };

  beforeEach(() => {
    logger = {
      info: jest.fn(),
    };

    listener = new LoginLoggingListener(
      logger as unknown as PlatformLogger,
    );
  });

  describe('handle', () => {
    it('debería registrar un log cuando el login es exitoso', () => {
      const event = new LoginSucceededEvent(
        'user-123',
        { ip: '192.168.1.1' } as any,
        'session-abc',
      );

      listener.handle(event);

      expect(logger.info).toHaveBeenCalledTimes(1);

      expect(logger.info).toHaveBeenCalledWith(
        'Login succeeded',
        {
          userId: 'user-123',
          ip: '192.168.1.1',
          sessionId: 'session-abc',
        },
      );
    });

    it('debería usar los datos del evento para construir el log', () => {
      const event = new LoginSucceededEvent(
        'user-999',
        { ip: '10.0.0.1' } as any,
        'session-xyz',
      );

      listener.handle(event);

      const call = logger.info.mock.calls[0];

      expect(call[0]).toBe('Login succeeded');
      expect(call[1]).toMatchObject({
        userId: 'user-999',
        ip: '10.0.0.1',
        sessionId: 'session-xyz',
      });
    });
  });
});