import { compactResponseMeta, buildResponseMeta } from './response-meta.util';

describe('compactResponseMeta', () => {
  it('debe retornar undefined si meta es undefined', () => {
    expect(compactResponseMeta(undefined)).toBeUndefined();
  });

  it('debe retornar undefined si todas las entradas son undefined', () => {
    // Línea 17: entries.length === 0 → undefined
    expect(compactResponseMeta({ lang: undefined, requestId: undefined })).toBeUndefined();
  });

  it('debe retornar solo las entradas definidas', () => {
    const result = compactResponseMeta({
      statusCode: 200,
      lang: undefined,
      path: '/test',
    });

    expect(result).toEqual({ statusCode: 200, path: '/test' });
    expect(result).not.toHaveProperty('lang');
  });
});

describe('buildResponseMeta', () => {
  const makeReq = (overrides: any = {}) => ({
    originalUrl: '/api/test',
    url: '/api/test',
    path: '/api/test',
    headers: {},
    ...overrides,
  });

  it('debe construir meta con timestamp, path y statusCode', () => {
    const result = buildResponseMeta(makeReq(), 200, 'es');

    expect(result.statusCode).toBe(200);
    expect(result.path).toBe('/api/test');
    expect(result.lang).toBe('es');
    expect(typeof result.timestamp).toBe('string');
  });

  it('debe extraer requestId de x-correlation-id', () => {
    const req = makeReq({ headers: { 'x-correlation-id': 'corr-abc' } });
    const result = buildResponseMeta(req, 200);

    expect(result.requestId).toBe('corr-abc');
  });

  it('debe extraer requestId de x-request-id si no hay x-correlation-id', () => {
    const req = makeReq({ headers: { 'x-request-id': 'req-xyz' } });
    const result = buildResponseMeta(req, 200);

    expect(result.requestId).toBe('req-xyz');
  });

  it('debe omitir requestId si no hay ninguno de los headers', () => {
    const result = buildResponseMeta(makeReq(), 404);

    expect(result.requestId).toBeUndefined();
  });

  it('debe usar url como fallback si originalUrl no existe', () => {
    const req = makeReq({ originalUrl: undefined, url: '/fallback' });
    const result = buildResponseMeta(req, 200);

    expect(result.path).toBe('/fallback');
  });
});

  it('debe usar path como último fallback si originalUrl y url son undefined', () => {
    const req = { originalUrl: undefined, url: undefined, path: '/path-fallback', headers: {} };
    const result = buildResponseMeta(req as any, 200);
    expect(result.path).toBe('/path-fallback');
  });
