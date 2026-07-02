import { Writable } from 'node:stream';

import pino from 'pino';

import { createPinoConfig } from './pino.config';

function buildCapturingLogger() {
  const lines: Record<string, unknown>[] = [];

  const stream = new Writable({
    write(chunk, _enc, callback) {
      lines.push(JSON.parse(chunk.toString()));
      callback();
    },
  });

  const logger = pino(createPinoConfig({ level: 'debug', serviceName: 'test-service' }), stream);

  return { logger, lines };
}

describe('createPinoConfig — redact', () => {
  it('debe redactar campos sensibles en la raíz del objeto', () => {
    const { logger, lines } = buildCapturingLogger();

    logger.info({ password: 'plain-text', email: 'a@b.com' }, 'login attempt');

    expect(lines[0].password).toBeUndefined();
    expect(lines[0].email).toBe('a@b.com');
  });

  it('debe redactar campos sensibles anidados en varios niveles de profundidad', () => {
    const { logger, lines } = buildCapturingLogger();

    logger.info(
      {
        user: { password: 'level-1' },
        request: { body: { token: 'level-2' } },
        context: { user: { credentials: { secret: 'level-3' } } },
      },
      'nested secrets',
    );

    expect((lines[0].user as any).password).toBeUndefined();
    expect((lines[0].request as any).body.token).toBeUndefined();
    expect((lines[0].context as any).user.credentials.secret).toBeUndefined();
  });

  it('debe redactar variantes snake_case ademas de camelCase', () => {
    const { logger, lines } = buildCapturingLogger();

    logger.info(
      {
        access_token: 'snake-1',
        refresh_token: 'snake-2',
        user: { password_hash: 'snake-3' },
      },
      'snake_case secrets',
    );

    expect(lines[0].access_token).toBeUndefined();
    expect(lines[0].refresh_token).toBeUndefined();
    expect((lines[0].user as any).password_hash).toBeUndefined();
  });

  it('debe redactar headers HTTP sensibles', () => {
    const { logger, lines } = buildCapturingLogger();

    logger.info(
      {
        req: {
          headers: {
            authorization: 'Bearer abc',
            cookie: 'accessToken=abc',
            'x-internal-api-key': 'internal-secret',
            'x-correlation-id': 'keep-me',
          },
        },
      },
      'http request',
    );

    const headers = (lines[0].req as any).headers;
    expect(headers.authorization).toBeUndefined();
    expect(headers.cookie).toBeUndefined();
    expect(headers['x-internal-api-key']).toBeUndefined();
    expect(headers['x-correlation-id']).toBe('keep-me');
  });

  it('no debe redactar campos no sensibles', () => {
    const { logger, lines } = buildCapturingLogger();

    logger.info({ userId: 'u-1', action: 'login', country: 'CO' }, 'safe fields');

    expect(lines[0].userId).toBe('u-1');
    expect(lines[0].action).toBe('login');
    expect(lines[0].country).toBe('CO');
  });
});
