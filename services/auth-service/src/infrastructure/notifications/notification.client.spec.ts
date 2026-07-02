import { type EnvService } from '@config/env/env.service';

import { NotificationClient } from './notification.client';

describe('NotificationClient', () => {
  let client: NotificationClient;
  let env: jest.Mocked<EnvService>;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    env = {
      get: jest.fn((key: string) => {
        if (key === 'NOTIFICATION_SERVICE_URL') return 'http://notification-service:3003';
        if (key === 'INTERNAL_SERVICE_SECRET') return 'shared-secret';
        if (key === 'NOTIFICATION_SERVICE_TIMEOUT') return 5000;
        return undefined;
      }),
    } as any;

    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    client = new NotificationClient(env);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debe hacer POST al notification-service con el header interno y un AbortSignal con timeout', async () => {
    fetchMock.mockResolvedValue({ ok: true });

    client.sendEmail({ to: 'user@example.com', subject: 'Hola', template: 'welcome' });

    // fire-and-forget: espera a que se resuelva la promesa interna
    await Promise.resolve();
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://notification-service:3003/notifications/v1/notifications/email',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-internal-api-key': 'shared-secret',
        }),
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('debe loguear un warning si la respuesta no es ok', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 });
    const warnSpy = jest.spyOn((client as any).logger, 'warn').mockImplementation();

    client.sendEmail({ to: 'user@example.com', subject: 'Hola', template: 'welcome' });
    await Promise.resolve();
    await Promise.resolve();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Notificación email rechazada [503]'),
    );
  });

  it('debe loguear un error y no lanzar si el fetch falla (ej. timeout por AbortSignal)', async () => {
    fetchMock.mockRejectedValue(new Error('The operation was aborted'));
    const errorSpy = jest.spyOn((client as any).logger, 'error').mockImplementation();

    expect(() =>
      client.sendEmail({ to: 'user@example.com', subject: 'Hola', template: 'welcome' }),
    ).not.toThrow();

    await Promise.resolve();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error enviando email [template=welcome]: The operation was aborted'),
    );
  });
});
