import { forwardHeaders } from './header-forwarder.util';

describe('forwardHeaders', () => {
  const makeReq = (headers: Record<string, string | string[] | undefined>) => ({ headers }) as any;

  it('debe copiar headers de cadena presentes', () => {
    const req = makeReq({
      'content-type': 'application/json',
      'accept-language': 'es',
      'x-correlation-id': 'uuid-123',
      'x-country': 'CO',
      'x-device-fingerprint': 'fp-abc',
      authorization: 'Bearer token',
      cookie: 'accessToken=abc',
    });

    const result = forwardHeaders(req);

    expect(result['content-type']).toBe('application/json');
    expect(result['accept-language']).toBe('es');
    expect(result['x-correlation-id']).toBe('uuid-123');
    expect(result['x-country']).toBe('CO');
    expect(result['x-device-fingerprint']).toBe('fp-abc');
    expect(result['authorization']).toBe('Bearer token');
    expect(result['cookie']).toBe('accessToken=abc');
    // x-user-id y x-session-id NO se reenvían: la identidad viene del JWT de la cookie
    expect(result['x-user-id']).toBeUndefined();
    expect(result['x-session-id']).toBeUndefined();
  });

  it('debe omitir headers ausentes', () => {
    const req = makeReq({});

    const result = forwardHeaders(req);

    expect(Object.keys(result)).toHaveLength(0);
  });

  it('debe ignorar headers con valor de tipo array (no cadena)', () => {
    const req = makeReq({
      'accept-language': ['es', 'en'], // array → no se copia
      'content-type': 'application/json',
    });

    const result = forwardHeaders(req);

    expect(result['accept-language']).toBeUndefined();
    expect(result['content-type']).toBe('application/json');
  });

  it('debe ignorar headers con valor undefined', () => {
    const req = makeReq({
      'x-country': undefined,
      'content-type': 'text/plain',
    });

    const result = forwardHeaders(req);

    expect(result['x-country']).toBeUndefined();
    expect(result['content-type']).toBe('text/plain');
  });

  it('debe reenviar req.ip como x-forwarded-for en vez del header entrante (evita spoofing)', () => {
    const req = {
      headers: { 'x-forwarded-for': '198.51.100.9' }, // valor que el cliente podría falsificar
      ip: '203.0.113.1', // resuelto por Express vía trust proxy
    } as any;

    const result = forwardHeaders(req);

    expect(result['x-forwarded-for']).toBe('203.0.113.1');
  });

  it('debe omitir x-forwarded-for cuando req.ip no está definido', () => {
    const req = makeReq({});

    const result = forwardHeaders(req);

    expect(result['x-forwarded-for']).toBeUndefined();
  });
});
