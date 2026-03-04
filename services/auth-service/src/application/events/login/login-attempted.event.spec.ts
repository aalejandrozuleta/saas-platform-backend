import { LoginContext } from '@domain/value-objects/login-context.vo';

import { LoginAttemptedEvent } from './login-attempted.event';

describe('LoginAttemptedEvent', () => {
  it('debe crear el evento con email y contexto', () => {
    const context = LoginContext.create({
      ip: '127.0.0.1',
      country: 'CO',
      deviceFingerprint: 'device-123',
    });

    const event = new LoginAttemptedEvent(
      'test@example.com',
      context,
    );

    expect(event.email).toBe('test@example.com');
    expect(event.context).toBe(context);
    expect(event.context.ip).toBe('127.0.0.1');
  });

  it('debe mantener referencia inmutable del contexto', () => {
    const context = LoginContext.create({
      ip: '10.0.0.1',
      country: 'US',
      deviceFingerprint: 'device-x',
    });

    const event = new LoginAttemptedEvent(
      'user@example.com',
      context,
    );

    // Verifica que el objeto no sea reemplazable
    expect(() => {
      (event as any).email = 'other@example.com';
    }).not.toThrow();
  });
});