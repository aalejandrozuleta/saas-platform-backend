import { AxiosError } from 'axios';

import { ResilientHttpClient } from './resilient-http.client';

describe('ResilientHttpClient', () => {
  it('no debe reintentar requests POST con error 409', async () => {
    const client = new ResilientHttpClient(
      'http://localhost:3001',
      1000,
      1000,
    ) as any;

    const fire = jest
      .fn()
      .mockRejectedValue(
        new AxiosError(
          'Conflict',
          'ERR_BAD_REQUEST',
          { method: 'POST' },
          undefined,
          {
            status: 409,
            statusText: 'Conflict',
            headers: {},
            config: { headers: {} } as any,
            data: { error: 'exists' },
          },
        ),
      );

    client.breaker = { fire };

    await expect(
      client.request({ method: 'POST', url: '/auth/v1/register' }),
    ).rejects.toBeInstanceOf(AxiosError);

    expect(fire).toHaveBeenCalledTimes(1);
  });

  it('debe reintentar GET cuando el upstream responde 503', async () => {
    const client = new ResilientHttpClient(
      'http://localhost:3001',
      1000,
      1000,
    ) as any;

    const error503 = new AxiosError(
      'Service Unavailable',
      'ERR_BAD_RESPONSE',
      { method: 'GET' },
      undefined,
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {},
        config: { headers: {} } as any,
        data: {},
      },
    );

    const fire = jest
      .fn()
      .mockRejectedValueOnce(error503)
      .mockResolvedValueOnce({ data: { ok: true } });

    client.breaker = { fire };

    await expect(
      client.request({ method: 'GET', url: '/health' }),
    ).resolves.toEqual({ data: { ok: true } });

    expect(fire).toHaveBeenCalledTimes(2);
  });
});
