import { LoginContext } from '@domain/value-objects/login-context.vo';

import { LoginSucceededEvent } from './login-succeeded.event';

describe('LoginSucceededEvent', () => {
  it('debe crear el evento con userId, contexto y sessionId', () => {
    const context = LoginContext.create({
      ip: '127.0.0.1',
      country: 'CO',
      deviceFingerprint: 'device-123',
    });

    const event = new LoginSucceededEvent(
      'user-1',
      context,
      'session-1',
    );

    expect(event.userId).toBe('user-1');
    expect(event.sessionId).toBe('session-1');
    expect(event.context).toBe(context);
  });

  it('debe preservar correctamente el contexto', () => {
    const context = LoginContext.create({
      ip: '192.168.0.1',
      country: 'MX',
      deviceFingerprint: 'device-xyz',
    });

    const event = new LoginSucceededEvent(
      'user-2',
      context,
      'session-xyz',
    );

    expect(event.context.ip).toBe('192.168.0.1');
    expect(event.context.country).toBe('MX');
    expect(event.context.deviceFingerprint).toBe('device-xyz');
  });

  it('debe mantener inmutables las propiedades públicas', () => {
    const context = LoginContext.create({
      ip: '10.0.0.1',
    });

    const event = new LoginSucceededEvent(
      'user-3',
      context,
      'session-3',
    );

    expect(event.userId).toBe('user-3');
    expect(event.sessionId).toBe('session-3');
  });
});