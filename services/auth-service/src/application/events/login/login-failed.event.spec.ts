import { LoginContext } from '@domain/value-objects/login-context.vo';

import { LoginFailedEvent } from './login-failed.event';

describe('LoginFailedEvent', () => {
  it('debe crear el evento con userId, contexto y razón', () => {
    const context = LoginContext.create({
      ip: '127.0.0.1',
      country: 'CO',
      deviceFingerprint: 'device-123',
    });

    const event = new LoginFailedEvent(
      'user-1',
      context,
      'INVALID_PASSWORD',
    );

    expect(event.userId).toBe('user-1');
    expect(event.reason).toBe('INVALID_PASSWORD');
    expect(event.context).toBe(context);
  });

  it('debe permitir userId null', () => {
    const context = LoginContext.create({
      ip: '10.0.0.1',
      country: 'US',
      deviceFingerprint: 'device-x',
    });

    const event = new LoginFailedEvent(
      null,
      context,
      'USER_NOT_FOUND',
    );

    expect(event.userId).toBeNull();
    expect(event.reason).toBe('USER_NOT_FOUND');
  });

  it('debe preservar correctamente el contexto', () => {
    const context = LoginContext.create({
      ip: '192.168.0.1',
      country: 'MX',
      deviceFingerprint: 'device-xyz',
    });

    const event = new LoginFailedEvent(
      'user-3',
      context,
      'ACCOUNT_LOCKED',
    );

    expect(event.context.ip).toBe('192.168.0.1');
    expect(event.context.country).toBe('MX');
    expect(event.context.deviceFingerprint).toBe('device-xyz');
  });
});