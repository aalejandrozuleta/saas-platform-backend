import { AxiosError } from 'axios';

import { ResilientHttpClient } from './resilient-http.client';

describe('ResilientHttpClient', () => {
  const makeClient = (withLogger = false) => {
    const logger = withLogger
      ? { warn: jest.fn(), info: jest.fn(), debug: jest.fn(), error: jest.fn() }
      : undefined;

    const client = new ResilientHttpClient(
      'http://localhost:3001',
      1000,
      1000,
      logger as any,
    ) as any;

    return { client, logger };
  };

  const makeAxiosError = (status: number, method = 'POST') =>
    new AxiosError(
      `Error ${status}`,
      'ERR_BAD_REQUEST',
      { method, headers: {} } as any,
      undefined,
      {
        status,
        statusText: String(status),
        headers: {},
        config: { headers: {} } as any,
        data: { error: 'err' },
      },
    );

  // ──────────────────────────────────────────────────────────────────────────
  // shouldRetry — ramas
  // ──────────────────────────────────────────────────────────────────────────

  it('no debe reintentar requests POST con error 409', async () => {
    const { client } = makeClient();
    const fire = jest.fn().mockRejectedValue(makeAxiosError(409, 'POST'));
    client.breaker = { fire };

    await expect(
      client.request({ method: 'POST', url: '/register' }),
    ).rejects.toBeInstanceOf(AxiosError);

    expect(fire).toHaveBeenCalledTimes(1);
  });

  it('debe reintentar GET cuando el upstream responde 503', async () => {
    const { client } = makeClient();
    const fire = jest
      .fn()
      .mockRejectedValueOnce(makeAxiosError(503, 'GET'))
      .mockResolvedValueOnce({ data: { ok: true } });
    client.breaker = { fire };

    await expect(
      client.request({ method: 'GET', url: '/health' }),
    ).resolves.toEqual({ data: { ok: true } });

    expect(fire).toHaveBeenCalledTimes(2);
  });

  it('no debe reintentar si se supera el número máximo de intentos', async () => {
    const { client } = makeClient();
    const fire = jest.fn().mockRejectedValue(makeAxiosError(503, 'GET'));
    client.breaker = { fire };

    await expect(
      client.request({ method: 'GET', url: '/health' }, 1),
    ).rejects.toBeInstanceOf(AxiosError);

    // retries=1 → intento 0 falla, intento 1 falla → total 2 llamadas
    expect(fire).toHaveBeenCalledTimes(2);
  });

  it('no debe reintentar cuando el circuit breaker está abierto (EOPENBREAKER)', async () => {
    const { client } = makeClient();
    const circuitError = Object.assign(new AxiosError(), {
      code: 'EOPENBREAKER',
    });
    const fire = jest.fn().mockRejectedValue(circuitError);
    client.breaker = { fire };

    await expect(
      client.request({ method: 'GET', url: '/health' }),
    ).rejects.toMatchObject({ code: 'EOPENBREAKER' });

    expect(fire).toHaveBeenCalledTimes(1);
  });

  it('debe reintentar GET con error no-Axios (sin response)', async () => {
    const { client } = makeClient();
    const networkError = new Error('ECONNRESET');
    const fire = jest
      .fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce({ data: { ok: true } });
    client.breaker = { fire };

    const result = await client.request({ method: 'GET', url: '/health' });

    expect(result).toEqual({ data: { ok: true } });
    expect(fire).toHaveBeenCalledTimes(2);
  });

  it('no debe reintentar HEAD con error 4xx', async () => {
    const { client } = makeClient();
    const fire = jest.fn().mockRejectedValue(makeAxiosError(404, 'HEAD'));
    client.breaker = { fire };

    await expect(
      client.request({ method: 'HEAD', url: '/resource' }),
    ).rejects.toBeInstanceOf(AxiosError);

    expect(fire).toHaveBeenCalledTimes(1);
  });

  it('no debe reintentar DELETE (método no idempotente para reintento)', async () => {
    const { client } = makeClient();
    const fire = jest.fn().mockRejectedValue(new Error('fail'));
    client.breaker = { fire };

    await expect(
      client.request({ method: 'DELETE', url: '/resource' }),
    ).rejects.toThrow('fail');

    expect(fire).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Eventos del circuit breaker (con logger)
  // ──────────────────────────────────────────────────────────────────────────

  it('debe loggear warn cuando el circuit breaker se abre', () => {
    const { client, logger } = makeClient(true);

    client.breaker.emit('open');

    expect(logger!.warn).toHaveBeenCalledWith(
      'Circuit breaker opened',
      expect.objectContaining({ event: 'circuit.open' }),
    );
  });

  it('debe loggear info cuando el circuit breaker pasa a half-open', () => {
    const { client, logger } = makeClient(true);

    client.breaker.emit('halfOpen');

    expect(logger!.info).toHaveBeenCalledWith(
      'Circuit breaker half-open',
      expect.objectContaining({ event: 'circuit.half_open' }),
    );
  });

  it('debe loggear info cuando el circuit breaker se cierra', () => {
    const { client, logger } = makeClient(true);

    client.breaker.emit('close');

    expect(logger!.info).toHaveBeenCalledWith(
      'Circuit breaker closed',
      expect.objectContaining({ event: 'circuit.close' }),
    );
  });

  it('no debe lanzar error si no hay logger al emitir eventos', () => {
    const { client } = makeClient(false);

    expect(() => client.breaker.emit('open')).not.toThrow();
    expect(() => client.breaker.emit('halfOpen')).not.toThrow();
    expect(() => client.breaker.emit('close')).not.toThrow();
  });

  it('debe reintentar GET con AxiosError sin response (timeout/red)', async () => {
    const { client } = makeClient();
    // AxiosError sin response → shouldRetry devuelve true (línea 144)
    const networkAxiosError = new AxiosError(
      'Network Error',
      'ECONNRESET',
      { method: 'GET', headers: {} } as any,
      {}, // request object present
      // Sin response object
    );
    const fire = jest
      .fn()
      .mockRejectedValueOnce(networkAxiosError)
      .mockResolvedValueOnce({ data: { ok: true } });
    client.breaker = { fire };

    const result = await client.request({ method: 'GET', url: '/health' });

    expect(result).toEqual({ data: { ok: true } });
    expect(fire).toHaveBeenCalledTimes(2);
  });

  it('debe loggear debug con errorCode/status undefined cuando el error no es AxiosError', async () => {
    const { client, logger } = makeClient(true);
    const plainError = new Error('unknown network issue');
    const fire = jest
      .fn()
      .mockRejectedValueOnce(plainError)
      .mockResolvedValueOnce({ data: {} });
    client.breaker = { fire };

    await client.request({ method: 'GET', url: '/health' });

    expect(logger!.debug).toHaveBeenCalledWith(
      'Upstream request failed',
      expect.objectContaining({ errorCode: undefined, status: undefined }),
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // requestTyped
  // ──────────────────────────────────────────────────────────────────────────

  it('requestTyped debe devolver la respuesta tipada', async () => {
    const { client } = makeClient();
    const fire = jest
      .fn()
      .mockResolvedValue({ data: { token: 'abc' }, headers: {} });
    client.breaker = { fire };

    const result = await client.requestTyped<{ token: string }>(
      { method: 'POST', url: '/login' },
    );

    expect(result.data.token).toBe('abc');
  });
});
