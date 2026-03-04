import { LoginContext } from '@domain/value-objects/login-context.vo';

import { LoginBlockedEvent } from './login-blocked.event';

describe('LoginBlockedEvent', () => {
  it('debe crear el evento con userId, contexto y blockedUntil', () => {
    const context = LoginContext.create({
      ip: '127.0.0.1',
      country: 'CO',
      deviceFingerprint: 'device-123',
    });

    const blockedUntil = new Date('2026-01-01');

    const event = new LoginBlockedEvent(
      'user-1',
      context,
      blockedUntil,
    );

    expect(event.userId).toBe('user-1');
    expect(event.context).toBe(context);
    expect(event.blockedUntil).toBe(blockedUntil);
  });

  it('debe permitir blockedUntil undefined', () => {
    const context = LoginContext.create({
      ip: '10.0.0.1',
      country: 'US',
      deviceFingerprint: 'device-x',
    });

    const event = new LoginBlockedEvent(
      'user-2',
      context,
    );

    expect(event.userId).toBe('user-2');
    expect(event.blockedUntil).toBeUndefined();
  });

  it('debe preservar correctamente el contexto', () => {
    const context = LoginContext.create({
      ip: '192.168.0.1',
      country: 'MX',
      deviceFingerprint: 'device-xyz',
    });

    const event = new LoginBlockedEvent(
      'user-3',
      context,
    );

    expect(event.context.ip).toBe('192.168.0.1');
    expect(event.context.country).toBe('MX');
    expect(event.context.deviceFingerprint).toBe('device-xyz');
  });
});